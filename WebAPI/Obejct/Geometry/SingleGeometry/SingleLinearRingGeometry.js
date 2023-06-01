import Cartesian3 from '../../../../Source/Core/Cartesian3.js';
import Rectangle from '../../../../Source/Core/Rectangle.js';
import Position3D from '../../Units/Position3D.js';
import SingleGeometry from './SingleGeometry.js';

class SingleLinearRingGeometry extends SingleGeometry {
    constructor(positions, options) {
        super(positions, options);
    }

    get center() {
        const point = Rectangle.center(
            Rectangle.fromCartesianArray(
                Cartesian3.fromPositions(this._positions)
            )
        );
        return Position3D.fromCartographic(point);
    }

    get positions() {
        return this._positions;
    }
}

export default SingleLinearRingGeometry;
