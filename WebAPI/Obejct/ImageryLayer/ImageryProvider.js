import createGuid from '../../../Source/Core/createGuid.js';
import defaultValue from '../../../Source/Core/defaultValue.js';
import defer from '../../../Source/Core/defer.js';
import defined from '../../../Source/Core/defined.js';
import DeveloperError from '../../../Source/Core/DeveloperError.js';
import Event from '../../../Source/Core/Event.js';
import Resource from '../../../Source/Core/Resource.js';
import WebMercatorTilingScheme from '../../../Source/Core/WebMercatorTilingScheme.js';
import ImageryStyle from '../../Style/ImageryStyle.js';

/**
 * 影像图层接口,不要直接实例化
 * @abstract
 */
class ImageryProvider {
    /**
     * 影像图层接口
     * @param {String} url 影像图层URL地址
     * @param {Object} options 图层参数
     * @param {Number} [options.tileWidth] WMTS服务的单个瓦片宽度值
     * @param {Number} [options.tileHeight] WMTS服务的单个瓦片高度值
     * @param {Number} [options.minimumLevel] WMTS服务的0级瓦片对应瓦片网格的级别
     * @param {Number} [options.maximumLevel] WMTS服务的最大级别的瓦片对应的瓦片网格的级别
     * @param {Array<String>} [options.dimensions] 一个在WMTS服务中用{s}标识的URL维度值
    * @param {String} [options.parameters.transparent = true] WMS图层是否支持透明图层
     */
    constructor(url, options) {
        if (!defined(url)) {
            throw new DeveloperError('传入图层的URL地址不能为空!');
        }

        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        this._id = createGuid();
        this._url = url;
        this._type = options.type;
        this._name = options.name;
        this._show = defaultValue(options.show, true);
        this._style = new ImageryStyle(options);

        this._tileWidth = defaultValue(options.tileWidth, 256);
        this._tileHeight = defaultValue(options.tileHeight, 256);
        this._tilingScheme = defaultValue(options.tilingScheme, new WebMercatorTilingScheme());
        this._rectangle = this._tilingScheme.rectangle;

        this._resource = Resource.createIfNeeded(url);

        this.errorEvent = new Event();
        this.hasAlphaChannel = true;
        this.ready = true;
        this._readyPromise = defer();
    }

    /**
     * 图层ID
     * @type {String}
     */
    get id() {
        return this._id;
    }

    /**
     * 图层URL
     * @type {String}
     */
    get url() {
        return this._url;
    }

    /**
     * 图层类型
     * @type {Type}
     */
    get type() {
        return this._type;
    }

    /**
     * 图层名称
     * @type {String}
     */
    get name() {
        return this._name;
    }

    /**
     * 图层显隐开关
     * @type {Boolean}
     */
    get show() {
        return this._show;
    }

    /**
     * 图层显示样式
     * @type {ImageryStyle}
     */
    get style() {
        return this._style;
    }

    /**
     * 图层瓦片宽度
     * @type {Number}
     */
    get tileWidth() {
        return this._tileWidth;
    }

    /**
     * 图层瓦片高度
     * @type {Number}
     */
    get tileHeight() {
        return this._tileHeight;
    }

    /**
     * 图层瓦片范围
     * @type {Rectangle}
     */
    get rectangle() {
        return this._rectangle;
    }

    /**
     * 图层瓦片网格
     * @type {TilingScheme}
     */
    get tilingScheme() {
        return this._tilingScheme;
    }

    requestImage(x, y, level, request) {
        throw DeveloperError.throwInstantiationError();
    }
}

export default ImageryProvider;
