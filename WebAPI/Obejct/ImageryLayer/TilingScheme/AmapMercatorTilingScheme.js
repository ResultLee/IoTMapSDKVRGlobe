import Cartesian2 from '../../../../Source/Core/Cartesian2';
import Cartographic from '../../../../Source/Core/Cartographic.js';
import CesiumMath from '../../../../Source/Core/Math.js';
import WebMercatorProjection from '../../../../Source/Core/WebMercatorProjection.js';
import WebMercatorTilingScheme from '../../../../Source/Core/WebMercatorTilingScheme.js';
import CoordTransform from './CoordTransform.js';

/**
 * 高德地图网格
 * @private
 */
class AmapMercatorTilingScheme extends WebMercatorTilingScheme {
    constructor(options) {
        super(options);

        const projection = new WebMercatorProjection();

        this._projection.project = function (cartographic, result) {
            result = CoordTransform.WGS84ToGCJ02(
                CesiumMath.toDegrees(cartographic.longitude),
                CesiumMath.toDegrees(cartographic.latitude)
            );

            result = projection.project(
                new Cartographic(
                    CesiumMath.toRadians(result[0]),
                    CesiumMath.toRadians(result[1])
                )
            );
            return new Cartesian2(result.x, result.y);
        };

        this._projection.unproject = function (cartesian, result) {
            const cartographic = projection.unproject(cartesian);
            result = CoordTransform.GCJ02ToWGS84(
                CesiumMath.toDegrees(cartographic.longitude),
                CesiumMath.toDegrees(cartographic.latitude)
            );
            return new Cartographic(
                CesiumMath.toRadians(result[0]),
                CesiumMath.toRadians(result[1])
            );
        };
    }
}

export default AmapMercatorTilingScheme;
