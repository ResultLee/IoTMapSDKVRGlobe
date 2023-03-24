import Cartesian3 from '../../../../Source/Core/Cartesian3.js';
import CesiumMath from '../../../../Source/Core/Math.js';
import Rectangle from '../../../../Source/Core/Rectangle.js';
import Position3D from '../../Units/Position3D.js';
import LinearRingGeometry from './LinearRingGeometry.js';
import SingleGeometry from './SingleGeometry.js';

class PolygonGeometry extends SingleGeometry {
    constructor(coordinates, options) {
        super(coordinates, options);

        const geometry = new Array();
        for (let i = 0; i < coordinates.length; i++) {
            geometry.push(new LinearRingGeometry(coordinates[i], options));
        }

        this._rings = geometry;

    }

    get center() {
        const centers = new Array();
        this._rings.forEach(ring => {
            centers.push(Cartesian3.fromPosition(ring.center));
        });
        const point = Rectangle.center(Rectangle.fromCartesianArray(centers));
        return new Position3D(CesiumMath.toDegrees(point.longitude), CesiumMath.toDegrees(point.latitude), CesiumMath.toDegrees(point.height));
    }

    get positions() {
        const positions = new Array();
        this._rings.forEach(ring => {
            positions.push(ring.positions);
        });
        return positions;
    }
}

export default PolygonGeometry;
