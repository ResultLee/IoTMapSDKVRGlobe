import defined from '../../../Source/Core/defined.js';
import DeveloperError from '../../../Source/Core/DeveloperError.js';
import Type from '../../Static/Type.js';
import MultiLineStringGeometry from './MultiGeometry/MultiLineStringGeometry.js';
import MultiPolygonGeometry from './MultiGeometry/MultiPolygonGeometry.js';
import LineStringGeometry from './SingleGeometry/LineStringGeometry.js';
import PointGeometry from './SingleGeometry/PointGeometry.js';
import PolygonGeometry from './SingleGeometry/PolygonGeometry.js';

class Geometry {
    constructor(geometry, options) {
        if (!defined(geometry)) {
            throw new DeveloperError('用于创建Geometry的值不能为空!');
        }

        switch (Type.getFeatureType(geometry.type)) {
            case Type.POINT:
                return new PointGeometry(geometry.coordinates, options);
            case Type.LINESTRING:
                return new LineStringGeometry(geometry.coordinates, options);
            case Type.MULTILINESTRING:
                return new MultiLineStringGeometry(geometry.coordinates, options);
            case Type.POLYGON:
                return new PolygonGeometry(geometry.coordinates, options);
            case Type.MULTIPOLYGON:
                return new MultiPolygonGeometry(geometry.coordinates, options);
        }
    }
}

export default Geometry;
