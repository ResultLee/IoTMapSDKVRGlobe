import Cartesian3 from '../../../../Source/Core/Cartesian3.js';
import Cartographic from '../../../../Source/Core/Cartographic.js';
import Rectangle from '../../../../Source/Core/Rectangle.js';
import SingleGeometry from './SingleGeometry.js';

class SingleLineStringGeometry extends SingleGeometry {
    constructor(positions, options) {
        super(positions, options);
    }

    get center() {
        return Cartographic.toPosition(
            Rectangle.center(
                Rectangle.fromCartesianArray(
                    Cartesian3.fromPositions(this._positions)
                )
            )
        );
    }

    get positions() {
        return this._positions;
    }
}

export default SingleLineStringGeometry;
