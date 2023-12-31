import defaultValue from '../../../../../Source/Core/defaultValue.js';
import defined from '../../../../../Source/Core/defined.js';
import DeveloperError from '../../../../../Source/Core/DeveloperError.js';
import Type from '../../../../Static/Type.js';
import Geometry from '../../../Geometry/Geometry.js';
import PointGraphic from './BaseGraphic/PointGraphic.js';
import LineStringGraphic from './BaseGraphic/LineStringGraphic.js';
import MultiLineStringGraphic from './BaseGraphic/MultiLineStringGraphic.js';
import PolygonGraphic from './BaseGraphic/PolygonGraphic.js';
import MultiPolygonGraphic from './BaseGraphic/MultiPolygonGraphic.js';
import Attribute from '../../../AttributeTable/Attribute.js';
import MeasureGraphic from './MultiGraphic/MeasureGraphic/MeasureGraphic.js';
import MeasureVerticalGraphic from './MultiGraphic/MeasureGraphic/MeasureVerticalGraphic.js';

class Graphic {
    constructor(type, options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        switch (type) {
            case Type.GRAPHICSPOINT:
                return new PointGraphic(options);
            case Type.GRAPHICSLINESTRING:
                return new LineStringGraphic(options);
            case Type.GRAPHICSMULTILINESTRING:
                return new MultiLineStringGraphic(options);
            case Type.GRAPHICSPOLYGON:
                return new PolygonGraphic(options);
            case Type.GRAPHICSMULTIPOLYGON:
                return new MultiPolygonGraphic(options);
            // case Type.GRAPHICMEASUREVERTICAL:
            //     return new MeasureVerticalGraphic(options);
            // case Type.GRAPHICMEASUREHORIZONTAL:
            //     return new MeasureGraphic(options);
            // case Type.GRAPHICMEASURESLOPE:
            //     return new MeasureGraphic(options);
            case Type.GRAPHICMEASUREVERTICAL:
                return new MeasureGraphic(options);

        }
    }

    static fromGeoJSON(type, geojson) {
        if (!defined(type)) {
            throw new DeveloperError('创建Graphic的type的值不能为空!');
        }

        if (!defined(geojson.geometry)) {
            throw new DeveloperError('创建Graphic的geometry的值不能为空!');
        }

        const options = new Object();
        options.id = geojson.id;
        options.geometry = Geometry.fromGeoJSON(geojson);
        options.attribute = Attribute.fromGeoJSON(geojson);

        return new Graphic(type, options);
    }
}

export default Graphic;
