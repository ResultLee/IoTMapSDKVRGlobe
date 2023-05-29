import defaultValue from '../../../../Source/Core/defaultValue.js';
import DeveloperError from '../../../../Source/Core/DeveloperError.js';
import Default from '../../../Static/Default.js';
import Type from '../../../Static/Type.js';
import ESRIImageryLayer from './ESRIImageryLayer.js';
import SingleImageryLayer from './SingleImageryLayer.js';
import AmapMercatorTilingScheme from './TilingScheme/AmapMercatorTilingScheme.js';
import BDMercatorTilingScheme from './TilingScheme/BDMercatorTilingScheme.js';
import UrlTileImageryLayer from './UrlTileImageryLayer.js';
import WMSImageryLayer from './WMSImageryLayer.js';
import WMTSImageryLayer from './WMTSImageryLayer.js';

const subdomains = ['1', '2', '3'];
const subdomains1 = ['01', '02', '03', '04'];

/**
 * 创建指定类型({@link Type})的影像图层对象
 * @see WMSImageryLayer
 * @see WMTSImageryLayer
 * @see ESRIImageryLayer
 * @see SingleImageryLayer
 * @see UrlTileImageryLayer
 */
class ImageryLayer {
    /**
     * 创建影像图层对象
     * @param {String} type 创建影像图层的URL地址
     * @param {Object} [options] 创建基础图层({@link WMSImageryLayer}、{@link WMTSImageryLayer}、{@link ESRIImageryLayer}、{@link SingleImageryLayer}、{@link UrlTileImageryLayer})时需要的参数，若是默认图层该参数可选
     * @example
     * 1. 创建基础影像图层图层对象
    // 创建普通瓦片图层对象({@link UrlTileImageryLayer})
    const layer = new VRGlobe.ImageryLayer(VRGlobe.Type.IMAGERY, {
        url: 'https://yoururl/{z}/{y}/{x}.png'
    });

    // 创建ESRI的MapServer地图服务图层对象({@link ESRIImageryLayer})
    const layer = new VRGlobe.ImageryLayer(VRGlobe.Type.IMAGERYESRI, {
        url: 'https://yoururl/MapServer'
    });

    // 创建OGC的WMTS地图服务图层对象({@link WMTSImageryLayer})
    const layer = new VRGlobe.ImageryLayer(VRGlobe.Type.IMAGERYWMTS, {
        url: 'https://yoururl',
        layer: LayerName,
        style: StyleName,
        format: TileFormat,
        maximumLevel: TileMaximumLevel
        tileMatrixSetID: TileMatrixSetID,
    });

    // 创建OGC的WMS地图服务图层对象({@link WMSImageryLayer})
    const layer = new VRGlobe.ImageryLayer(VRGlobe.Type.IMAGERYWMS, {
        url: 'https://yoururl',
        layers : LayerName,
        parameters : {
            srs: TileCRS,
            styles: TileStyle
            format : TileFormat,
            transparent : isTransparent,
        }
    });

    // 使用单个图片数据创建图层对象({@link SingleImageryLayer})
    const layer = new VRGlobe.ImageryLayer(VRGlobe.Type.IMAGERYSINGLE, {
        url: 'https://yoururl',
    });

    * 2. 创建默认影像图层对象
    // 创建高德矢量注记瓦片地图
    const layer = new VRGlobe.ImageryLayer(VRGlobe.Type.IMAGERYAMAPCVA);

    // 创建高德影像瓦片地图
    const layer = new VRGlobe.ImageryLayer(VRGlobe.Type.IMAGERYAMAPIMG);

    // 高德矢量瓦片地图
    const layer = new VRGlobe.ImageryLayer(VRGlobe.Type.IMAGERYAMAPVEC);

    // 创建坐标系为BD-09坐标系百度标注的地图
    const layer = new VRGlobe.ImageryLayer(VRGlobe.Type.IMAGERYBDCVA);

    // 创建坐标系为BD-09坐标系百度矢量的地图
    const layer = new VRGlobe.ImageryLayer(VRGlobe.Type.IMAGERYBDIMG);

    // 创建坐标系为BD-09坐标系百度影像的地图
    const layer = new VRGlobe.ImageryLayer(VRGlobe.Type.IMAGERYBDVEC);

    // 创建ESRI矢量地图MapServer服务
    const layer = new VRGlobe.ImageryLayer(VRGlobe.Type.IMAGERYESRIIMG);

    // 创建ESRI影像地图MapServer服务
    const layer = new VRGlobe.ImageryLayer(VRGlobe.Type.IMAGERYESRIVEC);

    // 创建腾讯影像瓦片地图
    const layer = new VRGlobe.ImageryLayer(VRGlobe.Type.IMAGERYTENCENTIMG);

    // 创建腾讯矢量瓦片地图
    const layer = new VRGlobe.ImageryLayer(VRGlobe.Type.IMAGERYTENCENTVEC);
     * @returns {WMSImageryLayer | WMTSImageryLayer | ESRIImageryLayer | SingleImageryLayer | UrlTileImageryLayer}
     */
    constructor(type, options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        const url = options.url;

        switch (type) {
            case Type.IMAGERYURL:
                // let layer = new VRGlobe.ImageryLayer(VRGlobe.Type.IMAGERY,{
                //     url: "https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}"
                // });
                return new UrlTileImageryLayer(url, options);
            case Type.IMAGERYTENCENTVEC:
                return new UrlTileImageryLayer(Default.TENCENTVECRUL, Object(options, { subdomains }));
            case Type.IMAGERYTENCENTIMG:
                return new UrlTileImageryLayer(Default.TENCENTIMGRUL, Object(options, { subdomains }));
            case Type.IMAGERYAMAPIMG:
                return new UrlTileImageryLayer(Default.AMAPIMGURL, Object(options, {
                    subdomains: subdomains1,
                    tilingScheme: new AmapMercatorTilingScheme()
                }));
            case Type.IMAGERYAMAPVEC:
                return new UrlTileImageryLayer(Default.AMAPVECURL, Object(options, {
                    subdomains: subdomains1,
                    tilingScheme: new AmapMercatorTilingScheme()
                }));
            case Type.IMAGERYAMAPCVA:
                return new UrlTileImageryLayer(Default.AMAPCVAURL, Object(options, {
                    subdomains: subdomains1,
                    tilingScheme: new AmapMercatorTilingScheme()
                }));
            case Type.IMAGERYBDIMG:
                return new UrlTileImageryLayer(Default.BDIMGURL, Object(options, {
                    subdomains: subdomains,
                    tilingScheme: new BDMercatorTilingScheme()
                }));
            case Type.IMAGERYBDVEC:
                return new UrlTileImageryLayer(Default.BDVECURL, Object(options, {
                    subdomains: subdomains,
                    tilingScheme: new BDMercatorTilingScheme()
                }));
            case Type.IMAGERYBDCVA:
                return new UrlTileImageryLayer(Default.BDCVAURL, Object(options, {
                    subdomains: subdomains,
                    tilingScheme: new BDMercatorTilingScheme()
                }));
            case Type.IMAGERYESRIIMG:
                return new UrlTileImageryLayer(Default.ESRIIMGURL, options);
            case Type.IMAGERYESRIVEC:
                return new UrlTileImageryLayer(Default.ESRIVECURL, options);
            case Type.IMAGERYESRI:
                // let layer = new VRGlobe.ImageryLayer(VRGlobe.Type.IMAGERYESRI,{
                //     url: 'http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer'
                // });
                return new ESRIImageryLayer(url, options);
            case Type.IMAGERYWMTS:
                // let layer = new VRGlobe.ImageryLayer(VRGlobe.Type.IMAGERYWMTS, {
                //     url: 'http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/WMTS/tile/1.0.0/ChinaOnlineStreetPurplishBlue/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png',
                //     layer: 'ChinaOnlineStreetPurplishBlue',
                //     style: 'default',
                //     format: 'image/png',
                //     tileMatrixSetID: 'default028mm',
                //     maximumLevel: 18
                // });
                return new WMTSImageryLayer(url, options);
            case Type.IMAGERYWMS:
                // let layer = new VRGlobe.ImageryLayer(VRGlobe.Type.IMAGERYWMS, {
                //     layers: 'topp:states',
                //     parameters: {
                //         version: "1.3.0",
                //         transparent: true,
                //         format: 'image/png',
                //         srs: 'EPSG:3857',
                //         styles: ''
                //     },
                //     url: 'https://ahocevar.com/geoserver/wms?SERVICE=WMS'
                // });
                return new WMSImageryLayer(url, options);
            case Type.IMAGERYSINGLE:
                // let layer = new VRGlobe.ImageryLayer(VRGlobe.Type.IMAGERYSINGLE,{
                //     url: '../Source/Assets/Images/world.jpg',
                // });
                return new SingleImageryLayer(url, options);
        }
        throw new DeveloperError('不支持的影像图层类型');
    }
}

export default ImageryLayer;
