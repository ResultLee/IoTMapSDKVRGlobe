import Cartesian3 from '../../../../Source/Core/Cartesian3.js';
import Cartographic from '../../../../Source/Core/Cartographic.js';
import Rectangle from '../../../../Source/Core/Rectangle.js';
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

        const point = Rectangle.center(
            Rectangle.fromCartesianArray(Cartesian3.fromPositions(center))
        );

        return Cartographic.toPosition(point);
    }

    get positions() {
        return this._positions;
    }

}

export default SinglePolygonGeometry;
