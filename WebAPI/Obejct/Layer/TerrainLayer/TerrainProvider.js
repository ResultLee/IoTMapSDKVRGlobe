import createGuid from '../../../../Source/Core/createGuid.js';
import defaultValue from '../../../../Source/Core/defaultValue.js';
import DeveloperError from '../../../../Source/Core/DeveloperError.js';
import Ellipsoid from '../../../../Source/Core/Ellipsoid.js';
import Event from '../../../../Source/Core/Event.js';
import GeographicTilingScheme from '../../../../Source/Core/GeographicTilingScheme.js';

const heightmapTerrainQuality = 0.25;

/**
 * 地形图层接口,不要直接实例化
 * @abstract
 */
class TerrainProvider {
    /**
     * 地形图层接口
     * @param {Object} options 图层参数
     * @param {Object} [options.ellipsoid = Ellipsoid.WGS84] 椭球体参数，默认为WGS84椭球体
     * @param {Object} [options.tilingScheme = GeographicTilingScheme()] 地形网格参数,默认为3857网格
     */
    constructor(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        const ellipsoid = defaultValue(options.ellipsoid, Ellipsoid.WGS84);
        const tilingScheme = defaultValue(options.tilingScheme,
            new GeographicTilingScheme({ ellipsoid }));

        this._id = defaultValue(options.id, createGuid());
        this._maxGeometricError = this.getMaxGeometricError(ellipsoid, 64,
            tilingScheme.getNumberOfXTilesAtLevel(0));

        this._errorEvent = new Event();
        this._tilingScheme = tilingScheme;
        this._readyPromise = Promise.resolve(true);
    }

    getMaxGeometricError(ellipsoid, tileImageWidth, numberOfTilesAtLevelZero) {
        return (
            (ellipsoid.maximumRadius * 2 * Math.PI * heightmapTerrainQuality) /
            (tileImageWidth * numberOfTilesAtLevelZero)
        );
    }

    getLevelMaximumGeometricError(level) {
        return this._maxGeometricError / (1 << level);
    }

    getTileDataAvailable(x, y, level) {
        DeveloperError.throwInstantiationError();
    }

    loadTileDataAvailability(x, y, level) {
        DeveloperError.throwInstantiationError();
    }

    requestTileGeometry(x, y, level, request) {
        DeveloperError.throwInstantiationError();
    }
}

export default TerrainProvider;
