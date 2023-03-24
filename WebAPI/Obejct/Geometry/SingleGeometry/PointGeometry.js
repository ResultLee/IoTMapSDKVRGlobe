import Position3D from '../../Units/Position3D.js';
import SingleGeometry from './SingleGeometry.js';

class PointGeometry extends SingleGeometry {
    constructor(coordinates, options) {
        super(coordinates, options);

        this._position = Position3D.fromCoordinates(coordinates);
    }

    get center(){
        return this._position;
    }

    get position() {
        return this._position;
    }

    clone() {
        return new PointGeometry(this._position.toCoordinates(), {
            show: this._show
        });
    }
}

export default PointGeometry;
