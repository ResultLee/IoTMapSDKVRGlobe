import Cartesian3 from '../../../../Source/Core/Cartesian3.js';
import defaultValue from '../../../../Source/Core/defaultValue.js';
import CesiumMath from '../../../../Source/Core/Math.js';
import Rectangle from '../../../../Source/Core/Rectangle.js';
import Position3D from '../../Units/Position3D.js';
import LineStringGeometry from '../SingleGeometry/LineStringGeometry.js';
import MultiGeometry from './MultiGeometry.js';

function isMultiLineString(array) {
    let num = 0;
    while (array.length) {
        num++;
        array = array[0];
    }
    return num > 2;
}

class MultiLineStringGeometry extends MultiGeometry {
    constructor(coordinates, options) {
        coordinates = defaultValue(coordinates, new Array());
        super(coordinates, options);

        for (let i = 0; i < coordinates.length; i++) {
            const coordinate = coordinates[i];
            if (isMultiLineString(coordinate)) {
                this.addGeometry(new MultiLineStringGeometry(coordinate, options));
            } else {
                this.addGeometry(new LineStringGeometry(coordinate, options));
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

export default MultiLineStringGeometry;
