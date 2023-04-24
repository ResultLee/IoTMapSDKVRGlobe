import Type from '../../../Static/Type.js';
import SingleGeometry from './SingleGeometry.js';

class SinglePointGeometry extends SingleGeometry {
    constructor(position, options) {
        super([position], options);

        this.type = Type.GEOMETRYPOINT;
    }

    get center() {
        return this.position;
    }

    get position() {
        return this._positions[0];
    }
}

export default SinglePointGeometry;
