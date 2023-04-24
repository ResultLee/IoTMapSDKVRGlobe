import Cartesian3 from '../../../../Source/Core/Cartesian3.js';
import Cartographic from '../../../../Source/Core/Cartographic.js';
import Rectangle from '../../../../Source/Core/Rectangle.js';
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

        return Cartographic.toPosition(point);
    }

    get positions() {
        return this._positions;
    }
}

export default SingleLinearRingGeometry;
