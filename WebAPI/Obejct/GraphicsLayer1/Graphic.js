import defined from '../../../Source/Core/defined.js';
import DeveloperError from '../../../Source/Core/DeveloperError.js';
import Type from '../../Static/Type.js';
import LineStringGraphic from './LineStringGraphic.js';
import PointGraphic from './PointGraphic.js';
import PolygonGraphic from './PolygonGraphic.js';

class Graphic {
    constructor(type, options) {
        if (!defined(type)) {
            throw new DeveloperError('创建Graphic的type的值不能为空!');
        }

        switch (type) {
            case Type.POINT:
                return new PointGraphic(options.positions, options);
            case Type.LINESTRING:
                return new LineStringGraphic(options.positions, options);
            case Type.POLYGON:
                return new PolygonGraphic(options.positions, options);
        }
    }
}
export default Graphic;
