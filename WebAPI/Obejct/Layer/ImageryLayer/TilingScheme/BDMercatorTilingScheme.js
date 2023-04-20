import Cartesian2 from '../../../../../Source/Core/Cartesian2.js';
import Cartographic from '../../../../../Source/Core/Cartographic.js';
import defaultValue from '../../../../../Source/Core/defaultValue.js';
import defined from '../../../../../Source/Core/defined.js';
import CesiumMath from '../../../../../Source/Core/Math.js';
import Rectangle from '../../../../../Source/Core/Rectangle.js';
import WebMercatorTilingScheme from '../../../../../Source/Core/WebMercatorTilingScheme.js';
import CoordTransform from './CoordTransform.js';
import BDMercatorProjection from './Projection/BDMercatorProjection.js';

/**
 * 百度地图网格
 * @private
 */
class BDMercatorTilingScheme extends WebMercatorTilingScheme {
    constructor(options) {
        options = defaultValue(options, {});

        // WGS-84坐标系网格
        // options.rectangleNortheastInMeters = new Cartesian2(-33554054, -33746824);
        // options.rectangleSouthwestInMeters = new Cartesian2(33554054, 33746824);
        // 对应URL的处理方式
        /** bx: function (imageryProvider, x, y, level) {
            const xTiles = imageryProvider._tilingScheme.getNumberOfXTilesAtLevel(level);
            return x - xTiles / 2;
        },
        by: function (imageryProvider, x, y, level) {
            const yTiles = imageryProvider._tilingScheme.getNumberOfYTilesAtLevel(level);
            return yTiles / 2 - y - 1;
        } */

        // BD-09坐标系网格
        options.rectangleNortheastInMeters = defaultValue(options.rectangleNortheastInMeters, new Cartesian2(20037726.37, 12474104.17));
        options.rectangleSouthwestInMeters = defaultValue(options.rectangleSouthwestInMeters, new Cartesian2(-20037726.37, -12474104.17));

        super(options);
        const projection = new BDMercatorProjection();

        this._projection.project = function (cartographic, result) {
            result = result || {};

            result = CoordTransform.WGS84ToGCJ02(
                CesiumMath.toDegrees(cartographic.longitude),
                CesiumMath.toDegrees(cartographic.latitude)
            );

            result = CoordTransform.GCJ02ToBD09(result[0], result[1]);

            result[0] = Math.min(result[0], 180);
            result[0] = Math.max(result[0], -180);
            result[1] = Math.min(result[1], 74.000022);
            result[1] = Math.max(result[1], -71.988531);

            result = projection.lngLatToPoint({
                lng: result[0],
                lat: result[1]
            });

            return new Cartesian2(result.x, result.y);
        };

        this._projection.unproject = function (cartesian, result) {
            result = result || {};

            result = projection.mercatorToLngLat({
                lng: cartesian.x,
                lat: cartesian.y
            });

            result = CoordTransform.BD09ToGCJ02(result.lng, result.lat);
            result = CoordTransform.GCJ02ToWGS84(result[0], result[1]);

            return new Cartographic(
                CesiumMath.toRadians(result[0]),
                CesiumMath.toRadians(result[1])
            );
        };

        const resolutions = [];
        for (let i = 0; i < 19; i++) {
            resolutions[i] = 256 * Math.pow(2, 18 - i);
        }
        this.resolutions = defaultValue(options.resolutions, resolutions);
    }

    /**
     * 根据瓦片行列号返回该瓦片的矩形范围
     * @param {Number} x 瓦片行号
     * @param {Number} y 瓦片列号
     * @param {Number} level 瓦片所在层级
     * @param {Rectangle} [result] 返回的矩形范围
     * @returns {Rectangle} 返回的矩形范围
     */
    tileXYToNativeRectangle(x, y, level, result) {
        const tileWidth = this.resolutions[level];
        const west = x * tileWidth;
        const east = (x + 1) * tileWidth;
        const north = ((y = -y) + 1) * tileWidth;
        const south = y * tileWidth;

        if (!defined(result)) {
            return new Rectangle(west, south, east, north);
        }

        result.west = west;
        result.south = south;
        result.east = east;
        result.north = north;
        return result;
    }

    /**
     * 根据坐标点位置返回指定层级行列号
     * @param {Cartographic} position 坐标点位置
     * @param {Number} level 指定层级
     * @param {Cartesian2} result 返回的包含行列号的对象
     * @returns {Cartesian2} 返回的包含行列号的对象
     */
    positionToTileXY(position, level, result) {
        const rectangle = this._rectangle;
        if (!Rectangle.contains(rectangle, position)) {
            return undefined;
        }
        const projection = this._projection;
        const webMercatorPosition = projection.project(position);
        if (!defined(webMercatorPosition)) {
            return undefined;
        }
        const tileWidth = this.resolutions[level];
        const xTileCoordinate = Math.floor(webMercatorPosition.x / tileWidth);
        const yTileCoordinate = -Math.floor(webMercatorPosition.y / tileWidth);
        if (!defined(result)) {
            return new Cartesian2(xTileCoordinate, yTileCoordinate);
        }
        result.x = xTileCoordinate;
        result.y = yTileCoordinate;
        return result;
    }
}

export default BDMercatorTilingScheme;
