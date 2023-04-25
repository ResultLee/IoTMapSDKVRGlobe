import Color from '../../../../Source/Core/Color.js';
import defaultValue from '../../../../Source/Core/defaultValue.js';
import defined from '../../../../Source/Core/defined.js';
import GeographicTilingScheme from '../../../../Source/Core/GeographicTilingScheme.js';
import Default from '../../../Static/Default.js';
import TopoJSON from '../../../Static/Parse/TopoJSON.js';
import UrlTileImageryLayer from '../ImageryLayer/UrlTileImageryLayer.js';

const templateRegex = /{[^}]+}/g;
class FeatureLayer extends UrlTileImageryLayer {
    constructor(url, options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);
        options.tilingScheme = defaultValue(
            options.tilingScheme,
            new GeographicTilingScheme({ ellipsoid: options.ellipsoid })
        );
        super(url, options);

        this._attributes = new Object();
        this._maximumLevel = options.maximumLevel;
        this._minimumLevel = defaultValue(options.minimumLevel, 0);

        this.fillColor = defaultValue(options.fillColor, Color.BLUE.withAlpha(0.75));
        this.strokeColor = defaultValue(options.strokeColor, Color.RED.withAlpha(0));

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
                    this._attributes[`${x}_${y}_${level}`] = TopoJSON.toAttributeTable(json);
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
