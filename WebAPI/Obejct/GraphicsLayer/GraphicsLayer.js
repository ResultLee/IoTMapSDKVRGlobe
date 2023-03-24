import createGuid from '../../../Source/Core/createGuid.js';
import defaultValue from '../../../Source/Core/defaultValue.js';
import defined from '../../../Source/Core/defined.js';
import DeveloperError from '../../../Source/Core/DeveloperError.js';
import PrimitiveCollection from '../../../Source/Scene/PrimitiveCollection.js';
import AnnotationStyle from '../../Style/AnnotationStyle.js';
import AttributeTable from '../AttributeTable/AttributeTable.js';
import Graphic from './Graphic.js';

class GraphicsLayer {
    constructor(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        this._id = createGuid();
        this._name = options.name;

        this._collection = new PrimitiveCollection({
            show: defaultValue(options.show, true)
        });

        this._graphics = new Array();
        this._annotations = new Array();
        this._attributeTable = new AttributeTable();
        this._annotationStyle = new AnnotationStyle();

        this.ready = true;
    }

    addGraphics(type, options) {
        const graphic = new Graphic(type, options);
        this._graphic.push(graphic);
        return graphic;
    }

    
}

export default GraphicsLayer;
