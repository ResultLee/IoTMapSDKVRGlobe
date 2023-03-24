import Cartesian3 from '../../../../Source/Core/Cartesian3.js';
import defined from '../../../../Source/Core/defined.js';
import DeveloperError from '../../../../Source/Core/DeveloperError.js';
import CesiumMath from '../../../../Source/Core/Math.js';
import Rectangle from '../../../../Source/Core/Rectangle.js';

import Position3D from '../../Units/Position3D.js';
import SingleGeometry from './SingleGeometry.js';

class LineStringGeometry extends SingleGeometry {
    constructor(coordinates, options) {
        super(coordinates, options);
        const positions = new Array();

        for (let i = 0; i < coordinates.length; i++) {
            const coordinate = coordinates[i];
            positions.push(Position3D.fromCoordinates(coordinate));
        }

        this._positions = positions;
    }

    get center() {
        const point = Rectangle.center(Rectangle.fromCartesianArray(Cartesian3.fromPositions(this._positions)));
        return new Position3D(CesiumMath.toDegrees(point.longitude), CesiumMath.toDegrees(point.latitude), CesiumMath.toDegrees(point.height));
    }

    get positions() {
        return this._positions;
    }

    static fromGeoJson(geojson, options) {
        if (!defined) {
            throw new DeveloperError('传入的Geojson的值不能为空!');
        }
    }
}

export default LineStringGeometry;
