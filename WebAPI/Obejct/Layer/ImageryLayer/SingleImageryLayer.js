import Check from '../../../../Source/Core/Check.js';
import defaultValue from '../../../../Source/Core/defaultValue.js';
import defined from '../../../../Source/Core/defined.js';
import DeveloperError from '../../../../Source/Core/DeveloperError.js';
import GeographicTilingScheme from '../../../../Source/Core/GeographicTilingScheme.js';
import loadKTX2 from '../../../../Source/Core/loadKTX2.js';
import Rectangle from '../../../../Source/Core/Rectangle.js';
import RuntimeError from '../../../../Source/Core/RuntimeError.js';
import TileProviderError from '../../../../Source/Core/TileProviderError.js';
import ImageryProvider from './ImageryProvider.js';

function loadImage(resource) {
    const url = resource.url;
    Check.defined('url', url);

    const ktx2Regex = /\.ktx2$/i;

    if (ktx2Regex.test(url)) {
        return loadKTX2(resource);
    }

    return resource.fetchImage({
        preferImageBitmap: true,
        flipY: true
    });
}

/**
 * 用于场景加载单张图片的图层对象，统一在{@link ImageryLayer}对象中创建，不支持单独创建
 * @protected
 * @extends ImageryProvider
 */
class SingleImageryLayer extends ImageryProvider {
    /**
     * 创建单张图片影像图层
     * @param {String} url 影像图层URL地址
     * @param {Object} [options] 图层参数
     * @param {Ellipsoid} [options.ellipsoid = Ellipsoid.WGS84] 椭球体参数，默认为WGS84椭球体。
     * @param {Rectangle} [options.rectangle = Rectangle.MAX_VALUE] 图片在地图上覆盖的以弧度表示的矩形范围，默认为全球范围
     */
    constructor(url, options) {
        options = defaultValue(options, {});

        options.tilingScheme = new GeographicTilingScheme({
            numberOfLevelZeroTilesX: 1,
            numberOfLevelZeroTilesY: 1,
            ellipsoid: options.ellipsoid,
            rectangle: defaultValue(options.rectangle, Rectangle.MAX_VALUE)
        });

        super(url, options);

        let error;
        const that = this;
        const resource = this._resource;

        function success(image) {
            that._image = image;
            that._tileWidth = image.width;
            that._tileHeight = image.height;
            that.ready = true;
            TileProviderError.reportSuccess(that._errorEvent);
            return Promise.resolve(true);
        }

        function failure(e) {
            const message = `Failed to load image ${resource.url}.`;
            error = TileProviderError.reportError(
                error,
                that,
                that._errorEvent,
                message,
                0,
                0,
                0
            );
            if (error.retry) {
                return doRequest();
            }
            return Promise.reject(new RuntimeError(message));
        }

        function doRequest() {
            return loadImage(resource)
                .then(success)
                .catch(failure);
        }

        this._readyPromise = doRequest();
    }

    get tileWidth() {
        if (!this.ready) {
            throw new DeveloperError('在图像提供程序准备就绪之前,不得调用tileWidth!');
        }
        return this._tileWidth;
    }

    get tileHeight() {
        if (!this.ready) {
            throw new DeveloperError('在图像提供程序准备就绪之前,不得调用tileHeight');
        }
        return this._tileHeight;
    }

    get minimumLevel() {
        if (!this.ready) {
            throw new DeveloperError('在图像提供商准备就绪之前,不得调用minimumLevel');
        }
        return 0;
    }

    get maximumLevel() {
        if (!this.ready) {
            throw new DeveloperError('在图像提供商准备就绪之前,不得调用maximumLevel');
        }
        return 0;
    }

    get rectangle() {
        return this._tilingScheme.rectangle;
    }

    get tilingScheme() {
        if (!this.ready) {
            throw new DeveloperError('在图像提供商准备就绪之前，不得调用tilingScheme.');
        }
        return this._tilingScheme;
    }

    requestImage(x, y, level, request) {
        if (!defined(this._image)) {
            return;
        }

        return Promise.resolve(this._image);
    }

    getProjectInfo() {
        const info = new Object();
        if (defined(this._id)) {
            info.id = this._id;
        }
        if (defined(this._name)) {
            info.name = this._name;
        }
        if (defined(this._url)) {
            info.url = this._url;
        }
        if (defined(this._type)) {
            info.type = this._type;
        }
        if (defined(this._show)) {
            info.show = this._show;
        }
        if (defined(this._style)) {
            info.style = this._style;
        }
        if (defined(this._rectangle)) {
            info.rectangle = this._rectangle;
        }
        return info;
    }
}

export default SingleImageryLayer;
