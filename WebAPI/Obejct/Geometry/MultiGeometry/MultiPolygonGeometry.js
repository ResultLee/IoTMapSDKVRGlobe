import Cartesian3 from '../../../../Source/Core/Cartesian3.js';
import CesiumMath from '../../../../Source/Core/Math.js';
import Rectangle from '../../../../Source/Core/Rectangle.js';
import Position3D from '../../Units/Position3D.js';
import PolygonGeometry from '../SingleGeometry/PolygonGeometry.js';
import MultiGeometry from './MultiGeometry.js';

function isMultiPolygon(array) {
    let num = 0;
    while (array.length) {
        num++;
        array = array[0];
    }
    return num > 3;
}

class MultiPolygonGeometry extends MultiGeometry {
    constructor(coordinates, options) {
        super(coordinates, options);

        for (let i = 0; i < coordinates.length; i++) {
            const coordinate = coordinates[i];
            if (isMultiPolygon(coordinate)) {
                this.addGeometry(new MultiPolygonGeometry(coordinate, options));
            } else {
                this.addGeometry(new PolygonGeometry(coordinate, options));
            }
        }
    }

    get center() {
        const centers = new Array();
        this._geometrys.forEach(geometry => {
            centers.push(Cartesian3.fromPosition(geometry.center));
        });
        const point = Rectangle.center(Rectangle.fromCartesianArray(centers));
        return new Position3D(CesiumMath.toDegrees(point.longitude), CesiumMath.toDegrees(point.latitude), CesiumMath.toDegrees(point.height));
    }

    get positions() {
        const positions = new Array();
        this._geometrys.forEach(geometry => {
            positions.push(geometry.positions);
        });
        return positions;
    }

    addGeometry(geometry) {
        this._geometrys.push(geometry);
    }
}

export default MultiPolygonGeometry;
