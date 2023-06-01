import Color from '../../Source/Core/Color.js';
import BDMercatorTilingScheme from '../Obejct/Layer/ImageryLayer/TilingScheme/BDMercatorTilingScheme.js';
import LineStringStyle from '../Style/LineStringStyle/LineStringStyle.js';
import PointStyle from '../Style/PointStyle/PointStyle.js';
import PolygonStyle from '../Style/PolygonStyle/PolygonStyle.js';

const imgURL = 'data:image/png;base64,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';

const defaultIMG = document.createElement('img');
defaultIMG.src = imgURL;

const icoURL = 'data:image/png;base64,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';
const defaultICO = document.createElement('img');
defaultICO.src = icoURL;

const Default = {
    BD09Mercator: new BDMercatorTilingScheme(),
    // 腾讯矢量影像地图地址
    TENCENTVECRUL: 'https://rt{s}.map.gtimg.com/tile?z={z}&x={x}&y={reverseY}&scene=0&version=347',
    // 腾讯影像地图地址
    TENCENTIMGRUL: 'https://p{s}.map.gtimg.com/sateTiles/{z}/{sx}/{sy}/{x}_{reverseY}.jpg?version=400',
    // 高德影像地图地址
    AMAPIMGURL: 'https://webst{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
    // 高德矢量地图地址
    AMAPVECURL: 'https://webrd{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
    // 高德矢量标注地图地址
    AMAPCVAURL: 'https://webst{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
    // 百度影像(BD-09)地图地址
    BDIMGURL: 'http://shangetu{s}.map.bdimg.com/it/u=x={x};y={by};z={z};v=009;type=sate&fm=46',
    // 百度矢量(BD-09)地图地址
    BDVECURL: 'http://online{s}.map.bdimg.com/onlinelabel/?qt=tile&x={x}&y={by}&z={z}&styles=pl&scaler=1&p=1',
    // 百度注记(BD-09)地图地址
    BDCVAURL: 'http://online{s}.map.bdimg.com/tile/?qt=tile&x={x}&y={by}&z={z}&styles=sl&v=020',
    // ESRI影像地图MapServer服务
    ESRIIMGURL: 'https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    // ESRI矢量地图MapServer服务
    ESRIVECURL: 'https://server.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    // 默认Billboard的img
    BILLBOARDIMG: defaultICO,
    // 默认的透明底图
    TRANSPARENTIMAGE: defaultIMG,
    ROOTNODEID: 10001,
    // 资源树根节点名称
    ROOTNODENAME: 'ROOT',
    TEMPORARYNODEID: 100012,
    // 资源树根节点名称
    TEMPORARYNODENAME: 'TEMPORARY',
    DRAWPOINTSTYLE: new PointStyle({
        color: Color.CYAN
    }),
    DRAWPOLYLINESTYLE: new LineStringStyle({
        width: 5,
        color: Color.CYAN
    }),
    DRAWPOLYGONSTYLE: new PolygonStyle({
        fillColor: Color.CYAN
    })

};

export default Default;
