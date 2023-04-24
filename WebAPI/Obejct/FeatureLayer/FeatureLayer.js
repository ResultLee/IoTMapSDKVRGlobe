import defaultValue from '../../../Source/Core/defaultValue';
import defined from '../../../Source/Core/defined';
import GeographicTilingScheme from '../../../Source/Core/GeographicTilingScheme';
import Default from '../../Static/Default';
import TopoJSON from '../../Static/Parse/TopoJSON';
import UrlTileImageryLayer from '../Layer/ImageryLayer/UrlTileImageryLayer';


const templateRegex = /{[^}]+}/g;

 class FeatureLayer extends UrlTileImageryLayer {
    constructor(url, options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);
        options.tilingScheme = defaultValue(
            options.tilingScheme,
            new GeographicTilingScheme({ ellipsoid: options.ellipsoid })
        );
        super(url, options);

        this._maximumLevel = options.maximumLevel;
        this._minimumLevel = defaultValue(options.minimumLevel, 0);

        this.fillColor = defaultValue(options.fillColor, 'rgba(3, 104, 255, 1)');
        this.strokeColor = defaultValue(options.strokeColor, 'rgba(3, 104, 255, 0)');

        this.ready = true;

    }

    requestImage(x, y, level, request) {
        const that = this;
        request.throttle = false;
        request.throttleByServer = false;
        if (!this.ready || level >= this._maximumLevel || level < this._minimumLevel) {
            return new Promise(function (resolve) {
                resolve(Default.TRANSPARENTIMAGE);
            });
        }

        return new Promise(resolve => {
            try {
                const resource = that._resource;
                const url = resource.getUrlComponent(true);
                const allTags = that._allTags;
                const templateValues = {};

                const match = url.match(templateRegex);
                if (defined(match)) {
                    match.forEach(function (tag) {
                        const key = tag.substring(1, tag.length - 1);
                        if (defined(allTags[key])) {
                            templateValues[key] = allTags[key](that, x, y, level);
                        }
                    });
                }

                const promise = resource.getDerivedResource({
                    request: request,
                    templateValues: templateValues
                }).fetchJson();

                if (!defined(promise) || (defined(promise) && !defined(promise.then))) {
                    console.log(promise);
                    resolve(Default.TRANSPARENTIMAGE);
                }

                promise.then(json => {
                    resolve(TopoJSON.toIMG({
                        json: json,
                        width: that._tileWidth,
                        height: that._tileHeight,
                        fillColor: that.fillColor,
                        strokeColor: that.strokeColor,
                        rectangle: that._tilingScheme.tileXYToNativeRectangle(x, y, level)
                    }));
                });
            } catch (error) {
                // 抛出异常
                resolve(Default.TRANSPARENTIMAGE);
            }
        });
    }
}

export default FeatureLayer;
