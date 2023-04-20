import defaultValue from '../../../Source/Core/defaultValue.js';
import defined from '../../../Source/Core/defined.js';
import DeveloperError from '../../../Source/Core/DeveloperError.js';
import Type from '../../Static/Type.js';
import LineStringFeature from './LineStringFeature.js';
import PointFeature from './PointFeature.js';
import PolygonFeature from './PolygonFeature.js';

class Feature {
    constructor(type, options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        if (!defined(options.type)) {
            throw new DeveloperError('创建Feature的type的值不能为空!');
        }

        options.type = type;

        if (!defined(options.geometry)) {
            throw new DeveloperError('创建Feature的geometry的值不能为空!');
        }

        switch (type) {
            case Type.POINT:
                if (!Type.isPoint(options.geometry.type)) {
                    break;
                }
                return new PointFeature(options);
            case Type.LINESTRING:
            case Type.MULTILINESTRING:
                if (!Type.isLineString(options.geometry.type)) {
                    break;
                }
                return new LineStringFeature(options);
            case Type.POLYGON:
            case Type.MULTIPOLYGON:
                if (!Type.isPolygon(options.geometry.type)) {
                    break;
                }
                return new PolygonFeature(options);
        }
        throw new DeveloperError('创建Feature的geometry的类型与Feature类型不一致!');

    }
}

export default Feature;
