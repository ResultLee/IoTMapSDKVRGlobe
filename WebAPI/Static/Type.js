/*
 * @Author: SnotlingLiu<snotlingliu@gmail.com/>
 * @Date: 2023-03-08 10:52:45
 * @LastEditors: SnotlingLiu<snotlingliu@gmail.com/>
 * @LastEditTime: 2023-03-09 11:47:08
 * @Description:
 */

function isType(type, value) {
    return 0 <= value - type && value - type < 100;
}

/**
 * VRGlobeSDK数据类型枚举
 * @namespace
 */
class Type {
    // /**
    //  * 树节点
    //  * @type {Number}
    //  * @constant
    //  */
    // static TREENODE = 1000001;

    static POINT = 1000001;
    static POLYLINE = 1000002;
    static POLYGON = 1000003;



    /**
     * 影像服务地图
     * @type {Number}
     * @constant
     */
    static IMAGERY = 1000100;
    /**
     * 腾讯矢量瓦片地图
     * @type {Number}
     * @constant
     */
    static IMAGERYTENCENTVEC = 1000101;
    /**
     * 腾讯影像瓦片地图
     * @type {Number}
     * @constant
     */
    static IMAGERYTENCENTIMG = 1000102;
    /**
     * 高德影像瓦片地图
     * @type {Number}
     * @constant
     */
    static IMAGERYAMAPIMG = 1000103;
    /**
     * 高德矢量瓦片地图
     * @type {Number}
     * @constant
     */
    static IMAGERYAMAPVEC = 1000104;
    /**
     * 高德矢量注记瓦片地图
     * @type {Number}
     * @constant
     */
    static IMAGERYAMAPCVA = 1000105;
    /**
     * 百度影像瓦片地图
     * @type {Number}
     * @constant
     * @description 该地图使用的坐标系为BD-09坐标系
     */
    static IMAGERYBDIMG = 1000106;
    /**
     * 百度影像瓦片地图
     * @type {Number}
     * @constant
     * @description 该地图使用的坐标系为BD-09坐标系
     */
    static IMAGERYBDVEC = 1000107;
    /**
     * 百度注记瓦片地图
     * @type {Number}
     * @constant
     * @description 该地图使用的坐标系为BD-09坐标系
     */
    static IMAGERYBDCVA = 1000108;
    /**
     * ESRI矢量地图MapServer服务
     * @type {Number}
     * @constant
     */
    static IMAGERYESRIIMG = 1000109;
    /**
     * ESRI影像地图MapServer服务
     * @type {Number}
     * @constant
     */
    static IMAGERYESRIVEC = 1000110;
    /**
     * ESRIMapServer地图服务
     * @type {Number}
     * @constant
     */
    static IMAGERYESRI = 1000111;
    /**
     * WMTS地图服务
     * @type {Number}
     * @constant
     */
    static IMAGERYWMTS = 1000112;
    /**
     * WMS地图服务
     * @type {Number}
     * @constant
     */
    static IMAGERYWMS = 1000113;
    /**
     * 单张影像
     * @type {Number}
     * @constant
     */
    static IMAGERYSINGLE = 1000114;

    /**
     * 地形服务图层
     * @type {Number}
     * @constant
     */
    static TERRAIN = 1000200;

    /**
     * 基础海平面地形
     * @type {Number}
     * @constant
     */
    static TERRAINSEELEVEL = 1000201;

    /**
     * QuantizedMesh类型地形
     * @type {Number}
     * @constant
     */
    static TERRAINQUANTIZED = 1000202;

    static GRAPHICS = 1000300;
    static GRAPHICSPOINT = 1000301;
    static GRAPHICSLINESTRING = 1000302;
    static GRAPHICSMULTILINESTRING = 1000303;
    static GRAPHICSPOLYGON = 1000304;
    static GRAPHICSMULTIPOLYGON = 1000305;


    static GEOJSON = 1000400;
    static GEOJSONPOINT = 1000401;
    static GEOJSONPOLYGON = 1000402;
    static GEOJSONLINESTRING = 1000403;
    static GEOJSONMULTIPOLYGON = 1000404;
    static GEOJSONMULTILINESTRING = 1000405;

    static GEOMETRY = 1000500;
    static GEOMETRYPOINT = 1000501;
    static GEOMETRYLINESTRING = 1000502;
    static GEOMETRYMULTILINESTRING = 1000503;
    static GEOMETRYPOLYGON = 1000504;
    static GEOMETRYMULTIPOLYGON = 1000505;

    static PARTICLE = 1000600;
    static FIREPARTICLE = 1000601;
    static SMOKEPARTICLE = 1000602;
    static WATERPARTICLE = 1000603;
    static BURSTPARTICLE = 1000604;

    static EMITTER = 1000700;
    static BOXEMITTER = 1000701;
    static CONEEMITTER = 1000702;
    static CIRCLEEMITTER = 1000703;

    /**
     * 属性类型
     * @type {Number}
     * @constant
     */
    static PROPERTY = 1000800;
    /**
     * 无类型
     * @type {Number}
     * @constant
     */
    static PROPERTYNONE = 1000801;
    /**
     * 特定值类型
     * @type {Number}
     * @constant
     */
    static PROPERTYSPACIAL = 1000802;
    /**
     * 属性字段唯一值类型
     * @type {Number}
     * @constant
     */
    static PROPERTYUNIQUE = 1000803;
    /**
     * 属性字段分级类型
     * @type {Number}
     * @constant
     */
    static PROPERTYGRADUATED = 1000804;




    /**
     * 判断对象类型是否为影像图层类型
     * @param {Type} type 要判断对象的类型
     * @returns {Boolean} 若是影像图层则为true，反之则为false
     */
    static isImagerLayer(value) {
        return isType(this.IMAGERY, value);
    }

    /**
     * 判断对象类型是否为地形图层类型
     * @param {Type} type 要判断对象的类型
     * @returns {Boolean} 若是地形图层则为true，反之则为false
     */
    static isTerrrainLayer(value) {
        return isType(this.TERRAIN, value);
    }

    static isGeoJSON(value) {
        return isType(this.GEOJSON, value);
    }
}

export default Type;
