import createGuid from '../../../../Source/Core/createGuid.js';
import PointGeometry from '../SingleGeometry/PointGeometry.js';
import MultiGeometry from './MultiGeometry.js';

class MultiPointGeometry extends MultiGeometry {
    constructor(coordinates, options) {
        super(coordinates, options);

        coordinates.forEach(coordinate => {
            this._geometrys.push(new PointGeometry(coordinate, options));
        });

        this.id = createGuid();
        this.name = options.name;
    }

    get positions() {
        const positions = new Array();
        this._geometrys.forEach(geometry => {
            positions.push(geometry.position);
        });
        return positions;
    }
}

export default MultiPointGeometry;
