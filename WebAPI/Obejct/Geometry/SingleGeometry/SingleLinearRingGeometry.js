import Position3D from '../../Units/Position3D.js';
import SingleGeometry from './SingleGeometry.js';

class SingleLinearRingGeometry extends SingleGeometry {
    constructor(positions, options) {
        super(positions, options);
    }

    get center() {
        return Position3D.center(this._positions);
    }

    get positions() {
        return this._positions;
    }
}

export default SingleLinearRingGeometry;
