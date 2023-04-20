import defaultValue from '../../../../Source/Core/defaultValue.js';
import DeveloperError from '../../../../Source/Core/DeveloperError.js';
import Type from '../../../Static/Type.js';
import QuantizedTerrainLayer from './QuantizedTerrainLayer.js';
import SeaLevelTerrainLayer from './SeaLevelTerrainLayer.js';

/**
 * 创建指定类型({@link Type})的影像图层对象
 * <ul>
 * <li> QuantizedTerrainLayer是quantizedmesh地形格式图层,quantizedmesh详细信息请访问{@link https://github.com/AnalyticalGraphicsInc/quantized-mesh Quantized Mesh} </li>
 * <li> SeaLevelTerrainLayer是地形高度统一为0的heightmap，heightmap详细信息请访问{@link https://github.com/AnalyticalGraphicsInc/cesium/wiki/heightmap-1.0 Height Map}</li>
 * </ul>
 * @see QuantizedTerrainLayer
 * @see SeaLevelTerrainLayer
 *
 */
class TerrainLayer {
    /**
     * 创建地形图层对象
     * @param {String} type 创建地形图层的URL地址
     * @param {Object} options 创建Quantized地形图层({@link QuantizedTerrainLayer})和海平面地形图层({@link SeaLevelTerrainLayer})，若是海平面图层该参数可选
     * @example
     * 1.创建Quantized地形图层对象
    const layer = new VRGlobe.TerrainLayer(VRGlobe.Type.TERRAINQUANTIZED, {
        url: "https://yoururl"
    });
     * 2.创建基础海平面地形图层对象
    const layer = new VRGlobe.TerrainLayer(VRGlobe.Type.TERRAINSEELEVEL);
     * @returns {QuantizedTerrainLayer | SeaLevelTerrainLayer}
     */
    constructor(type, options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        switch (type) {
            case Type.TERRAINQUANTIZED:
                // let layer = new VRGlobe.TerrainLayer(VRGlobe.Type.TERRAINQUANTIZED, {
                //     url: "https://www.supermapol.com/realspace/services/3D-stk_terrain/rest/realspace/datas/info/data/path"
                // });
                return new QuantizedTerrainLayer(options);
            case Type.TERRAINSEELEVEL:
                return new SeaLevelTerrainLayer(options);
        }

        throw new DeveloperError('不支持的地形图层类型');
    }
}

export default TerrainLayer;
