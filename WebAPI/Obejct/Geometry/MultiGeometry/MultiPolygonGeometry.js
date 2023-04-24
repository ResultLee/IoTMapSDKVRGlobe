import Cartesian3 from '../../../../Source/Core/Cartesian3.js';
import Cartographic from '../../../../Source/Core/Cartographic.js';
import Rectangle from '../../../../Source/Core/Rectangle.js';
import SinglePolygonGeometry from '../SingleGeometry/SinglePolygonGeometry.js';
import MultiGeometry from './MultiGeometry.js';

function isMultiPolygon(array) {
    let num = 0;
    while (array.length) {
        num++;
        array = array[0];
    }
    return num > 1;
}

class MultiPolygonGeometry extends MultiGeometry {
    constructor(positions, options) {
        super(positions, options);

        this._geometrys = new Array();

        for (const position of this._positions) {
            if (isMultiPolygon(position)) {
                this._geometrys.push(new MultiPolygonGeometry(position, options));
            } else {
                this._geometrys.push(new SinglePolygonGeometry(position, options));
            }
        }
    }

    get center() {
        const centers = new Array();
        this._geometrys.forEach(geometry => {
            centers.push(Cartesian3.fromPosition(geometry.center));
        });

        const point = Rectangle.center(
            Rectangle.fromCartesianArray(Cartesian3.fromPositions(this.center))
        );
        return Cartographic.toPosition(point);
    }

    get positions() {
        return this._positions;
    }
}

export default MultiPolygonGeometry;
