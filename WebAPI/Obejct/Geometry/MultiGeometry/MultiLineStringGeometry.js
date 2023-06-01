import Cartesian3 from '../../../../Source/Core/Cartesian3.js';
import Rectangle from '../../../../Source/Core/Rectangle.js';
import Position3D from '../../Units/Position3D.js';
import SingleLineStringGeometry from '../SingleGeometry/SingleLineStringGeometry.js';
import MultiGeometry from './MultiGeometry.js';

function isMultiLineString(array) {
    let num = 0;
    while (array.length) {
        num++;
        array = array[0];
    }
    return num > 1;
}

class MultiLineStringGeometry extends MultiGeometry {
    constructor(positions, options) {
        super(positions, options);

        this._geometrys = new Array();
        for (const position of this._positions) {
            if (isMultiLineString(position)) {
                this._geometrys.push(new MultiLineStringGeometry(position, options));
            } else {
                this._geometrys.push(new SingleLineStringGeometry(position, options));
            }
        }
    }

    get center() {
        const centers = new Array();
        this._geometrys.forEach(geometry => {
            centers.push(Cartesian3.fromPosition(geometry.center));
        });
        return Position3D.fromCartographic(
            Rectangle.center(Rectangle.fromCartesianArray(centers))
        );
    }

    get positions() {
        return this._positions;
    }
}

export default MultiLineStringGeometry;
