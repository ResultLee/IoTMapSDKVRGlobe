import defaultValue from '../../../../Source/Core/defaultValue.js';
import HeightmapTerrainData from '../../../../Source/Core/HeightmapTerrainData';
import TerrainProvider from './TerrainProvider.js';

/**
 * <ul>
 * <li> 用于场景加载地形高度统一为0的heightmap格式的地形瓦片图层对象，统一在{@link TerrainLayer}对象中创建，不支持单独创建 </li>
 * <li> SeaLevelTerrainLayer的地形高度统一为0，即海平面高度</li>
 * <li> SeaLevel地形格式图层瓦片数据结构主要是heightmap </li>
 * <li> heightmap详细信息请访问{@link https://github.com/AnalyticalGraphicsInc/cesium/wiki/heightmap-1.0 Height Map} </li>
 * </ul>
 * @protected
 * @extends TerrainProvider
 */
class SeaLevelTerrainLayer extends TerrainProvider {
    constructor(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        super(options);

        this.ready = true;
    }

    get errorEvent() {
        return this._errorEvent;
    }

    get tilingScheme() {
        return this._tilingScheme;
    }

    getTileDataAvailable(x, y, level, request) {
        return undefined;
    }

    requestTileGeometry(x, y, level, request) {
        const width = 16;
        const height = 16;

        return Promise.resolve(
            new HeightmapTerrainData({
                buffer: new Uint8Array(width * height),
                width: width,
                height: height
            })
        );
    }

    loadTileDataAvailability(x, y, level, request) {
        return undefined;
    }
}

export default SeaLevelTerrainLayer;
