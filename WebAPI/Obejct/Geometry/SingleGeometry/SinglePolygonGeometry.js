import Position3D from '../../Units/Position3D.js';
import SingleGeometry from './SingleGeometry.js';
import SingleLinearRingGeometry from './SingleLinearRingGeometry.js';

class SinglePolygonGeometry extends SingleGeometry {
    constructor(positions, options) {

        super(positions, options);

        const geometry = new Array();
        for (let i = 0; i < positions.length; i++) {
            geometry.push(new SingleLinearRingGeometry(positions[i]));
        }
        this._linearRings = geometry;
    }

    get center() {
        const center = new Array();
        this._linearRings.forEach(linearRing => {
            center.push(linearRing.center);
        });

        return Position3D.center(center);
    }

    get positions() {
        return this._positions;
    }

}

export default SinglePolygonGeometry;
