import Cartesian3 from '../../../../Source/Core/Cartesian3.js';
import Rectangle from '../../../../Source/Core/Rectangle.js';
import Position3D from '../../Units/Position3D.js';
import SinglePolygonGeometry from '../SingleGeometry/SinglePolygonGeometry.js';
import MultiGeometry from './MultiGeometry.js';

class MultiPolygonGeometry extends MultiGeometry {
    constructor(positions, options) {
        super(positions, options);

        this._geometrys = new Array();

        for (const position of positions) {
            // TODO: 不支持MultiPolygonGeometry中嵌套MultiPolygonGeometry的数据
            this._geometrys.push(new SinglePolygonGeometry(position, options));
        }
    }

    get center() {
        const centers = new Array();
        this._geometrys.forEach(geometry => {
            centers.push(geometry.center);
        });

        const point = Rectangle.center(
            Rectangle.fromCartesianArray(Cartesian3.fromPositions(centers))
        );
        return Position3D.fromCartographic(point);
    }

    get positions() {
        return this._positions;
    }
}

export default MultiPolygonGeometry;
