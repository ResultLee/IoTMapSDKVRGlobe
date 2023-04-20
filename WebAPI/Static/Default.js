import BDMercatorTilingScheme from '../Obejct/Layer/ImageryLayer/TilingScheme/BDMercatorTilingScheme.js';

const imgURL = 'data:image/png;base64,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';

const defaultIMG = document.createElement('img');
defaultIMG.src = imgURL;

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
    // 默认的透明底图
    TRANSPARENTIMAGE: defaultIMG
};

export default Default;
