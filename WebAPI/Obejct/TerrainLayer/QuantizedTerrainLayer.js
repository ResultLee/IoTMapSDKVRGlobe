import AttributeCompression from '../../../Source/Core/AttributeCompression.js';
import BoundingSphere from '../../../Source/Core/BoundingSphere.js';
import Cartesian3 from '../../../Source/Core/Cartesian3.js';
import defaultValue from '../../../Source/Core/defaultValue.js';
import defined from '../../../Source/Core/defined.js';
import DeveloperError from '../../../Source/Core/DeveloperError.js';
import GeographicTilingScheme from '../../../Source/Core/GeographicTilingScheme.js';
import getJsonFromTypedArray from '../../../Source/Core/getJsonFromTypedArray.js';
import HeightmapTerrainData from '../../../Source/Core/HeightmapTerrainData.js';
import IndexDatatype from '../../../Source/Core/IndexDatatype.js';
import OrientedBoundingBox from '../../../Source/Core/OrientedBoundingBox.js';
import QuantizedMeshTerrainData from '../../../Source/Core/QuantizedMeshTerrainData.js';
import RequestType from '../../../Source/Core/RequestType.js';
import Resource from '../../../Source/Core/Resource.js';
import RuntimeError from '../../../Source/Core/RuntimeError.js';
import TileAvailability from '../../../Source/Core/TileAvailability.js';
import TileProviderError from '../../../Source/Core/TileProviderError.js';
import WebMercatorTilingScheme from '../../../Source/Core/WebMercatorTilingScheme.js';
import TerrainProvider from './TerrainProvider.js';

const QuantizedMeshExtensionIds = {
    OCT_VERTEX_NORMALS: 1,
    WATER_MASK: 2,
    METADATA: 4
};

function checkLayer(provider, x, y, level, layer, topLayer) {
    if (!defined(layer.availabilityLevels)) {
        return {
            result: false
        };
    }

    let cacheKey;
    const deleteFromCache = function () {
        delete layer.availabilityPromiseCache[cacheKey];
    };
    const availabilityTilesLoaded = layer.availabilityTilesLoaded;
    const availability = layer.availability;

    let tile = getAvailabilityTile(layer, x, y, level);
    while (defined(tile)) {
        if (
            availability.isTileAvailable(tile.level, tile.x, tile.y) &&
            !availabilityTilesLoaded.isTileAvailable(tile.level, tile.x, tile.y)
        ) {
            let requestPromise;
            if (!topLayer) {
                cacheKey = `${tile.level}-${tile.x}-${tile.y}`;
                requestPromise = layer.availabilityPromiseCache[cacheKey];
                if (!defined(requestPromise)) {
                    const request = new Request({
                        throttle: false,
                        throttleByServer: true,
                        type: RequestType.TERRAIN
                    });
                    requestPromise = requestTileGeometry(
                        provider,
                        tile.x,
                        tile.y,
                        tile.level,
                        layer,
                        request
                    );
                    if (defined(requestPromise)) {
                        layer.availabilityPromiseCache[cacheKey] = requestPromise;
                        requestPromise.then(deleteFromCache);
                    }
                }
            }

            return {
                result: true,
                promise: requestPromise
            };
        }

        tile = getAvailabilityTile(layer, tile.x, tile.y, tile.level);
    }

    return {
        result: false
    };
}

function createHeightmapTerrainData(provider, buffer, level, x, y) {
    const heightBuffer = new Uint16Array(
        buffer,
        0,
        provider._heightmapWidth * provider._heightmapWidth
    );

    return new HeightmapTerrainData({
        buffer: heightBuffer,
        childTileMask: new Uint8Array(buffer, heightBuffer.byteLength, 1)[0],
        waterMask: new Uint8Array(
            buffer,
            heightBuffer.byteLength + 1,
            buffer.byteLength - heightBuffer.byteLength - 1
        ),
        width: provider._heightmapWidth,
        height: provider._heightmapWidth,
        structure: provider._heightmapStructure
    });
}

function createQuantizedMeshTerrainData(provider, buffer, level, x, y, layer) {
    const littleEndianExtensionSize = layer.littleEndianExtensionSize;
    let pos = 0;
    const cartesian3Elements = 3;
    const boundingSphereElements = cartesian3Elements + 1;
    const cartesian3Length = Float64Array.BYTES_PER_ELEMENT * cartesian3Elements;
    const boundingSphereLength =
        Float64Array.BYTES_PER_ELEMENT * boundingSphereElements;
    const encodedVertexElements = 3;
    const encodedVertexLength =
        Uint16Array.BYTES_PER_ELEMENT * encodedVertexElements;
    const triangleElements = 3;
    let bytesPerIndex = Uint16Array.BYTES_PER_ELEMENT;
    let triangleLength = bytesPerIndex * triangleElements;

    const view = new DataView(buffer);
    const center = new Cartesian3(
        view.getFloat64(pos, true),
        view.getFloat64(pos + 8, true),
        view.getFloat64(pos + 16, true)
    );
    pos += cartesian3Length;

    const minimumHeight = view.getFloat32(pos, true);
    pos += Float32Array.BYTES_PER_ELEMENT;
    const maximumHeight = view.getFloat32(pos, true);
    pos += Float32Array.BYTES_PER_ELEMENT;

    const boundingSphere = new BoundingSphere(
        new Cartesian3(
            view.getFloat64(pos, true),
            view.getFloat64(pos + 8, true),
            view.getFloat64(pos + 16, true)
        ),
        view.getFloat64(pos + cartesian3Length, true)
    );
    pos += boundingSphereLength;

    const horizonOcclusionPoint = new Cartesian3(
        view.getFloat64(pos, true),
        view.getFloat64(pos + 8, true),
        view.getFloat64(pos + 16, true)
    );
    pos += cartesian3Length;

    const vertexCount = view.getUint32(pos, true);
    pos += Uint32Array.BYTES_PER_ELEMENT;
    const encodedVertexBuffer = new Uint16Array(buffer, pos, vertexCount * 3);
    pos += vertexCount * encodedVertexLength;

    if (vertexCount > 64 * 1024) {
        // More than 64k vertices, so indices are 32-bit.
        bytesPerIndex = Uint32Array.BYTES_PER_ELEMENT;
        triangleLength = bytesPerIndex * triangleElements;
    }

    // Decode the vertex buffer.
    const uBuffer = encodedVertexBuffer.subarray(0, vertexCount);
    const vBuffer = encodedVertexBuffer.subarray(vertexCount, 2 * vertexCount);
    const heightBuffer = encodedVertexBuffer.subarray(
        vertexCount * 2,
        3 * vertexCount
    );

    AttributeCompression.zigZagDeltaDecode(uBuffer, vBuffer, heightBuffer);

    // skip over any additional padding that was added for 2/4 byte alignment
    if (pos % bytesPerIndex !== 0) {
        pos += bytesPerIndex - (pos % bytesPerIndex);
    }

    const triangleCount = view.getUint32(pos, true);
    pos += Uint32Array.BYTES_PER_ELEMENT;
    const indices = IndexDatatype.createTypedArrayFromArrayBuffer(
        vertexCount,
        buffer,
        pos,
        triangleCount * triangleElements
    );
    pos += triangleCount * triangleLength;

    // High water mark decoding based on decompressIndices_ in webgl-loader's loader.js.
    // https://code.google.com/p/webgl-loader/source/browse/trunk/samples/loader.js?r=99#55
    // Copyright 2012 Google Inc., Apache 2.0 license.
    let highest = 0;
    const length = indices.length;
    for (let i = 0; i < length; ++i) {
        const code = indices[i];
        indices[i] = highest - code;
        if (code === 0) {
            ++highest;
        }
    }

    const westVertexCount = view.getUint32(pos, true);
    pos += Uint32Array.BYTES_PER_ELEMENT;
    const westIndices = IndexDatatype.createTypedArrayFromArrayBuffer(
        vertexCount,
        buffer,
        pos,
        westVertexCount
    );
    pos += westVertexCount * bytesPerIndex;

    const southVertexCount = view.getUint32(pos, true);
    pos += Uint32Array.BYTES_PER_ELEMENT;
    const southIndices = IndexDatatype.createTypedArrayFromArrayBuffer(
        vertexCount,
        buffer,
        pos,
        southVertexCount
    );
    pos += southVertexCount * bytesPerIndex;

    const eastVertexCount = view.getUint32(pos, true);
    pos += Uint32Array.BYTES_PER_ELEMENT;
    const eastIndices = IndexDatatype.createTypedArrayFromArrayBuffer(
        vertexCount,
        buffer,
        pos,
        eastVertexCount
    );
    pos += eastVertexCount * bytesPerIndex;

    const northVertexCount = view.getUint32(pos, true);
    pos += Uint32Array.BYTES_PER_ELEMENT;
    const northIndices = IndexDatatype.createTypedArrayFromArrayBuffer(
        vertexCount,
        buffer,
        pos,
        northVertexCount
    );
    pos += northVertexCount * bytesPerIndex;

    let encodedNormalBuffer;
    let waterMaskBuffer;
    while (pos < view.byteLength) {
        const extensionId = view.getUint8(pos, true);
        pos += Uint8Array.BYTES_PER_ELEMENT;
        const extensionLength = view.getUint32(pos, littleEndianExtensionSize);
        pos += Uint32Array.BYTES_PER_ELEMENT;

        if (
            extensionId === QuantizedMeshExtensionIds.OCT_VERTEX_NORMALS &&
            provider._requestVertexNormals
        ) {
            encodedNormalBuffer = new Uint8Array(buffer, pos, vertexCount * 2);
        } else if (
            extensionId === QuantizedMeshExtensionIds.WATER_MASK &&
            provider._requestWaterMask
        ) {
            waterMaskBuffer = new Uint8Array(buffer, pos, extensionLength);
        } else if (
            extensionId === QuantizedMeshExtensionIds.METADATA &&
            provider._requestMetadata
        ) {
            const stringLength = view.getUint32(pos, true);
            if (stringLength > 0) {
                const metadata = getJsonFromTypedArray(
                    new Uint8Array(buffer),
                    pos + Uint32Array.BYTES_PER_ELEMENT,
                    stringLength
                );
                const availableTiles = metadata.available;
                if (defined(availableTiles)) {
                    for (let offset = 0; offset < availableTiles.length; ++offset) {
                        const availableLevel = level + offset + 1;
                        const rangesAtLevel = availableTiles[offset];
                        const yTiles = provider._tilingScheme.getNumberOfYTilesAtLevel(
                            availableLevel
                        );

                        for (
                            let rangeIndex = 0;
                            rangeIndex < rangesAtLevel.length;
                            ++rangeIndex
                        ) {
                            const range = rangesAtLevel[rangeIndex];
                            const yStart = yTiles - range.endY - 1;
                            const yEnd = yTiles - range.startY - 1;
                            provider.availability.addAvailableTileRange(
                                availableLevel,
                                range.startX,
                                yStart,
                                range.endX,
                                yEnd
                            );
                            layer.availability.addAvailableTileRange(
                                availableLevel,
                                range.startX,
                                yStart,
                                range.endX,
                                yEnd
                            );
                        }
                    }
                }
            }
            layer.availabilityTilesLoaded.addAvailableTileRange(level, x, y, x, y);
        }
        pos += extensionLength;
    }

    const skirtHeight = provider.getLevelMaximumGeometricError(level) * 5.0;

    // The skirt is not included in the OBB computation. If this ever
    // causes any rendering artifacts (cracks), they are expected to be
    // minor and in the corners of the screen. It's possible that this
    // might need to be changed - just change to `minimumHeight - skirtHeight`
    // A similar change might also be needed in `upsampleQuantizedTerrainMesh.js`.
    const rectangle = provider._tilingScheme.tileXYToRectangle(x, y, level);
    const orientedBoundingBox = OrientedBoundingBox.fromRectangle(
        rectangle,
        minimumHeight,
        maximumHeight,
        provider._tilingScheme.ellipsoid
    );

    return new QuantizedMeshTerrainData({
        center: center,
        minimumHeight: minimumHeight,
        maximumHeight: maximumHeight,
        boundingSphere: boundingSphere,
        orientedBoundingBox: orientedBoundingBox,
        horizonOcclusionPoint: horizonOcclusionPoint,
        quantizedVertices: encodedVertexBuffer,
        encodedNormals: encodedNormalBuffer,
        indices: indices,
        westIndices: westIndices,
        southIndices: southIndices,
        eastIndices: eastIndices,
        northIndices: northIndices,
        westSkirtHeight: skirtHeight,
        southSkirtHeight: skirtHeight,
        eastSkirtHeight: skirtHeight,
        northSkirtHeight: skirtHeight,
        childTileMask: provider.availability.computeChildMaskForTile(level, x, y),
        waterMask: waterMaskBuffer
    });
}

function getAvailabilityTile(layer, x, y, level) {
    if (level === 0) {
        return;
    }

    const availabilityLevels = layer.availabilityLevels;
    const parentLevel =
        level % availabilityLevels === 0
            ? level - availabilityLevels
            : ((level / availabilityLevels) | 0) * availabilityLevels;
    const divisor = 1 << (level - parentLevel);
    const parentX = (x / divisor) | 0;
    const parentY = (y / divisor) | 0;

    return {
        level: parentLevel,
        x: parentX,
        y: parentY
    };
}

function getRequestHeader(extensionsList) {
    if (!defined(extensionsList) || extensionsList.length === 0) {
        return {
            Accept:
                'application/vnd.quantized-mesh,application/octet-stream;q=0.9,*/*;q=0.01'
        };
    }
    const extensions = extensionsList.join('-');
    return {
        Accept: `application/vnd.quantized-mesh;extensions=${extensions},application/octet-stream;q=0.9,*/*;q=0.01`
    };
}

function requestTileGeometry(provider, x, y, level, layerToUse, request) {
    if (!defined(layerToUse)) {
        return Promise.reject(new RuntimeError('地形瓦片不存在!'));
    }

    const urlTemplates = layerToUse.tileUrlTemplates;
    if (urlTemplates.length === 0) {
        return undefined;
    }

    let terrainY;
    if (!provider._scheme || provider._scheme === 'tms') {
        const yTiles = provider._tilingScheme.getNumberOfYTilesAtLevel(level);
        terrainY = yTiles - y - 1;
    } else {
        terrainY = y;
    }

    const extensionList = [];
    if (provider._requestVertexNormals && layerToUse.hasVertexNormals) {
        extensionList.push(
            layerToUse.littleEndianExtensionSize
                ? 'octvertexnormals'
                : 'vertexnormals'
        );
    }
    if (provider._requestWaterMask && layerToUse.hasWaterMask) {
        extensionList.push('watermask');
    }
    if (provider._requestMetadata && layerToUse.hasMetadata) {
        extensionList.push('metadata');
    }

    let headers;
    let query;
    const url = urlTemplates[(x + terrainY + level) % urlTemplates.length];

    const resource = layerToUse.resource;
    if (
        defined(resource._ionEndpoint) &&
        !defined(resource._ionEndpoint.externalType)
    ) {
        if (extensionList.length !== 0) {
            query = { extensions: extensionList.join('-') };
        }
        headers = getRequestHeader(undefined);
    } else {
        headers = getRequestHeader(extensionList);
    }

    const promise = resource
        .getDerivedResource({
            url: url,
            templateValues: {
                version: layerToUse.version,
                z: level,
                x: x,
                y: terrainY
            },
            queryParameters: query,
            headers: headers,
            request: request
        })
        .fetchArrayBuffer();

    if (!defined(promise)) {
        return undefined;
    }

    return promise.then(function (buffer) {
        if (defined(provider._heightmapStructure)) {
            return createHeightmapTerrainData(provider, buffer, level, x, y);
        }
        return createQuantizedMeshTerrainData(
            provider,
            buffer,
            level,
            x,
            y,
            layerToUse
        );
    });
}

class LayerInformation {
    constructor(layer) {
        this.resource = layer.resource;
        this.version = layer.version;
        this.isHeightmap = layer.isHeightmap;
        this.tileUrlTemplates = layer.tileUrlTemplates;
        this.availability = layer.availability;
        this.hasVertexNormals = layer.hasVertexNormals;
        this.hasWaterMask = layer.hasWaterMask;
        this.hasMetadata = layer.hasMetadata;
        this.availabilityLevels = layer.availabilityLevels;
        this.availabilityTilesLoaded = layer.availabilityTilesLoaded;
        this.littleEndianExtensionSize = layer.littleEndianExtensionSize;
        this.availabilityPromiseCache = {};
    }
}

/**
 * <ul>
 * <li> 用于场景加载quantizedmesh格式的地形瓦片图层对象，统一在{@link TerrainLayer}对象中创建，不支持单独创建 </li>
 * <li> quantized地形格式图层瓦片数据结构主要是quantizedmesh </li>
 * <li> quantizedmesh详细信息请访问{@link https://github.com/AnalyticalGraphicsInc/quantized-mesh Quantized Mesh} </li>
 * </ul>
 * @protected
 * @extends TerrainProvider
*/
class QuantizedTerrainLayer extends TerrainProvider {
    /**
     * 创建quantizedmesh地形瓦片图层
     * @param {Object} options 图层参数
     * @param {String} options.url quantizedmesh地形瓦片的URL地址
     */
    constructor(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        super(options);

        this._heightmapWidth = 65;
        this._hasWaterMask = false;
        this._availability = undefined;
        this._hasVertexNormals = false;
        this._heightmapStructure = undefined;
        this._requestMetadata = defaultValue(options.requestMetadata, true);
        this._requestWaterMask = defaultValue(options.requestWaterMask, false);
        this._requestVertexNormals = defaultValue(options.requestVertexNormals, false);

        const that = this;
        let lastResource;
        let layerJsonResource;
        let metadataError;

        const layers = (this._layers = []);
        const overallAvailability = [];
        let overallMaxZoom = 0;
        this._readyPromise = Promise.resolve(options.url).then(function (url) {
            const resource = Resource.createIfNeeded(url);
            resource.appendForwardSlash();
            lastResource = resource;
            layerJsonResource = lastResource.getDerivedResource({
                url: 'layer.json'
            });

            return requestLayerJson();
        });

        function parseMetadataSuccess(data) {
            let message;

            if (!data.format) {
                message = '地形瓦片描述文件中未指定地形瓦片格式!';
                metadataError = TileProviderError.reportError(
                    metadataError,
                    that,
                    that._errorEvent,
                    message
                );
                if (metadataError.retry) {
                    return requestLayerJson();
                }
                return Promise.reject(new RuntimeError(message));
            }

            if (!data.tiles || data.tiles.length === 0) {
                message = '地形瓦片描述文件中未指定地形瓦片URL模板!';
                metadataError = TileProviderError.reportError(
                    metadataError,
                    that,
                    that._errorEvent,
                    message
                );
                if (metadataError.retry) {
                    return requestLayerJson();
                }
                return Promise.reject(new RuntimeError(message));
            }

            let hasVertexNormals = false;
            let hasWaterMask = false;
            let hasMetadata = false;
            let littleEndianExtensionSize = true;
            let isHeightmap = false;
            if (data.format === 'heightmap-1.0') {
                isHeightmap = true;
                if (!defined(that._heightmapStructure)) {
                    that._heightmapStructure = {
                        heightScale: 1.0 / 5.0,
                        heightOffset: -1000.0,
                        elementsPerHeight: 1,
                        stride: 1,
                        elementMultiplier: 256.0,
                        isBigEndian: false,
                        lowestEncodedHeight: 0,
                        highestEncodedHeight: 256 * 256 - 1
                    };
                }
                hasWaterMask = true;
                that._requestWaterMask = true;
            } else if (data.format.indexOf('quantized-mesh-1.') !== 0) {
                message = `不支持的地形瓦片数据格式"${data.format}"!`;
                metadataError = TileProviderError.reportError(
                    metadataError,
                    that,
                    that._errorEvent,
                    message
                );
                if (metadataError.retry) {
                    return requestLayerJson();
                }
                return Promise.reject(new RuntimeError(message));
            }

            const tileUrlTemplates = data.tiles;

            const maxZoom = data.maxzoom;
            overallMaxZoom = Math.max(overallMaxZoom, maxZoom);

            if (!data.projection || data.projection === 'EPSG:4326') {
                that._tilingScheme = new GeographicTilingScheme({
                    numberOfLevelZeroTilesX: 2,
                    numberOfLevelZeroTilesY: 1
                });
            } else if (data.projection === 'EPSG:3857') {
                that._tilingScheme = new WebMercatorTilingScheme({
                    numberOfLevelZeroTilesX: 1,
                    numberOfLevelZeroTilesY: 1
                });
            } else {
                message = `不支持的地形瓦片数据坐标系"${data.projection}"!`;
                metadataError = TileProviderError.reportError(
                    metadataError,
                    that,
                    that._errorEvent,
                    message
                );
                if (metadataError.retry) {
                    return requestLayerJson();
                }
                return Promise.reject(new RuntimeError(message));
            }

            that._levelZeroMaximumGeometricError = that.getMaxGeometricError(
                that._tilingScheme.ellipsoid,
                that._heightmapWidth,
                that._tilingScheme.getNumberOfXTilesAtLevel(0)
            );
            if (!data.scheme || data.scheme === 'tms' || data.scheme === 'slippyMap') {
                that._scheme = data.scheme;
            } else {
                message = `不支持的地形瓦片数据切片网格"${data.scheme}"!`;
                metadataError = TileProviderError.reportError(
                    metadataError,
                    that,
                    that._errorEvent,
                    message
                );
                if (metadataError.retry) {
                    return requestLayerJson();
                }
                return Promise.reject(new RuntimeError(message));
            }

            let availabilityTilesLoaded;

            if (
                defined(data.extensions) &&
                data.extensions.indexOf('octvertexnormals') !== -1
            ) {
                hasVertexNormals = true;
            } else if (
                defined(data.extensions) &&
                data.extensions.indexOf('vertexnormals') !== -1
            ) {
                hasVertexNormals = true;
                littleEndianExtensionSize = false;
            }
            if (
                defined(data.extensions) &&
                data.extensions.indexOf('watermask') !== -1
            ) {
                hasWaterMask = true;
            }
            if (
                defined(data.extensions) &&
                data.extensions.indexOf('metadata') !== -1
            ) {
                hasMetadata = true;
            }

            const availabilityLevels = data.metadataAvailability;
            const availableTiles = data.available;
            let availability;
            if (defined(availableTiles) && !defined(availabilityLevels)) {
                availability = new TileAvailability(
                    that._tilingScheme,
                    availableTiles.length
                );
                for (let level = 0; level < availableTiles.length; ++level) {
                    const rangesAtLevel = availableTiles[level];
                    const yTiles = that._tilingScheme.getNumberOfYTilesAtLevel(level);
                    if (!defined(overallAvailability[level])) {
                        overallAvailability[level] = [];
                    }

                    for (
                        let rangeIndex = 0;
                        rangeIndex < rangesAtLevel.length;
                        ++rangeIndex
                    ) {
                        const range = rangesAtLevel[rangeIndex];
                        const yStart = yTiles - range.endY - 1;
                        const yEnd = yTiles - range.startY - 1;
                        overallAvailability[level].push([
                            range.startX,
                            yStart,
                            range.endX,
                            yEnd
                        ]);
                        availability.addAvailableTileRange(
                            level,
                            range.startX,
                            yStart,
                            range.endX,
                            yEnd
                        );
                    }
                }
            } else if (defined(availabilityLevels)) {
                availabilityTilesLoaded = new TileAvailability(
                    that._tilingScheme,
                    maxZoom
                );
                availability = new TileAvailability(that._tilingScheme, maxZoom);
                overallAvailability[0] = [[0, 0, 1, 0]];
                availability.addAvailableTileRange(0, 0, 0, 1, 0);
            }

            that._hasWaterMask = that._hasWaterMask || hasWaterMask;
            that._hasVertexNormals = that._hasVertexNormals || hasVertexNormals;
            that._hasMetadata = that._hasMetadata || hasMetadata;

            layers.push(
                new LayerInformation({
                    resource: lastResource,
                    version: data.version,
                    isHeightmap: isHeightmap,
                    tileUrlTemplates: tileUrlTemplates,
                    availability: availability,
                    hasVertexNormals: hasVertexNormals,
                    hasWaterMask: hasWaterMask,
                    hasMetadata: hasMetadata,
                    availabilityLevels: availabilityLevels,
                    availabilityTilesLoaded: availabilityTilesLoaded,
                    littleEndianExtensionSize: littleEndianExtensionSize
                })
            );

            const parentUrl = data.parentUrl;
            if (defined(parentUrl)) {
                if (!defined(availability)) {
                    console.log(
                        '地形瓦片描述文件如果没有指定可用的地形瓦片层级则不能指定瓦片的parentUrl!'
                    );
                    return Promise.resolve(true);
                }
                lastResource = lastResource.getDerivedResource({
                    url: parentUrl
                });
                lastResource.appendForwardSlash();
                layerJsonResource = lastResource.getDerivedResource({
                    url: 'layer.json'
                });
                const parentMetadata = layerJsonResource.fetchJson();
                return Promise.resolve(parentMetadata)
                    .then(parseMetadataSuccess)
                    .catch(parseMetadataFailure);
            }

            return Promise.resolve(true);
        }

        function parseMetadataFailure(data) {
            const message = `URL地址${layerJsonResource.url}访问时出错!`;
            metadataError = TileProviderError.reportError(
                metadataError,
                that,
                that._errorEvent,
                message
            );
            if (metadataError.retry) {
                return requestLayerJson();
            }
            return Promise.reject(new RuntimeError(message));
        }

        function metadataSuccess(data) {
            return parseMetadataSuccess(data).then(function () {
                if (defined(metadataError)) {
                    return;
                }

                const length = overallAvailability.length;
                if (length > 0) {
                    const availability = (that._availability = new TileAvailability(
                        that._tilingScheme,
                        overallMaxZoom
                    ));
                    for (let level = 0; level < length; ++level) {
                        const levelRanges = overallAvailability[level];
                        for (let i = 0; i < levelRanges.length; ++i) {
                            const range = levelRanges[i];
                            availability.addAvailableTileRange(
                                level,
                                range[0],
                                range[1],
                                range[2],
                                range[3]
                            );
                        }
                    }
                }

                that._ready = true;
                return Promise.resolve(true);
            });
        }

        function metadataFailure(data) {
            if (defined(data) && data.statusCode === 404) {
                return metadataSuccess({
                    tilejson: '2.1.0',
                    format: 'heightmap-1.0',
                    version: '1.0.0',
                    scheme: 'tms',
                    tiles: ['{z}/{x}/{y}.terrain?v={version}']
                });
            }
            return parseMetadataFailure(data);
        }

        function requestLayerJson() {
            return Promise.resolve(layerJsonResource.fetchJson())
                .then(metadataSuccess)
                .catch(metadataFailure);
        }
    }

    get errorEvent() {
        return this._errorEvent;
    }

    get ready() {
        return this._ready;
    }

    get tilingScheme() {
        return this._tilingScheme;
    }

    get availability() {
        return this._availability;
    }

    requestTileGeometry(x, y, level, request) {
        if (!this._ready) {
            throw new DeveloperError(
                '在地形瓦片图层准备就绪之前,不能直接调用!'
            );
        }

        const layers = this._layers;
        let layerToUse;
        const layerCount = layers.length;

        if (layerCount === 1) {
            layerToUse = layers[0];
        } else {
            for (let i = 0; i < layerCount; ++i) {
                const layer = layers[i];
                if (
                    !defined(layer.availability) ||
                    layer.availability.isTileAvailable(level, x, y)
                ) {
                    layerToUse = layer;
                    break;
                }
            }
        }

        return requestTileGeometry(this, x, y, level, layerToUse, request);
    }

    getTileDataAvailable(x, y, level) {
        if (!defined(this._availability)) {
            return undefined;
        }
        if (level > this._availability._maximumLevel) {
            return false;
        }

        if (this._availability.isTileAvailable(level, x, y)) {
            return true;
        }
        if (!this._hasMetadata) {
            return false;
        }

        const layers = this._layers;
        const count = layers.length;
        for (let i = 0; i < count; ++i) {
            const layerResult = checkLayer(this, x, y, level, layers[i], i === 0);
            if (layerResult.result) {
                return undefined;
            }
        }

        return false;
    }

    loadTileDataAvailability(x, y, level) {
        if (
            !defined(this._availability) ||
            level > this._availability._maximumLevel ||
            this._availability.isTileAvailable(level, x, y) ||
            !this._hasMetadata
        ) {
            return undefined;
        }

        const layers = this._layers;
        const count = layers.length;
        for (let i = 0; i < count; ++i) {
            const layerResult = checkLayer(this, x, y, level, layers[i], i === 0);
            if (defined(layerResult.promise)) {
                return layerResult.promise;
            }
        }
    }

}

export default QuantizedTerrainLayer;
