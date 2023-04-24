import Cartesian2 from '../../../Source/Core/Cartesian2';
import Cartesian3 from '../../../Source/Core/Cartesian3';
import defaultValue from '../../../Source/Core/defaultValue';
import defined from '../../../Source/Core/defined.js';
import DeveloperError from '../../../Source/Core/DeveloperError.js';
import BillboardCollection from '../../../Source/Scene/BillboardCollection.js';
import LabelCollection from '../../../Source/Scene/LabelCollection.js';
import PrimitiveCollection from '../../../Source/Scene/PrimitiveCollection.js';
import Mode from '../../Static/Mode.js';
import AnnotationStyle from '../../Style/AnnotationStyle.js';
import Annotation from '../Units/Annotation.js';

function addLabel(annotation, collection, style) {
    const label = Object.assign({
        position: Cartesian3.fromPosition(annotation._position)
    }, style);
    collection.add(label);
}

function addBillboard(annotation, collection, style) {
    const billboard = Object.assign({
        pixelOffset: new Cartesian2(10, 0),
        position: Cartesian3.fromPosition(annotation._position)
    }, style);
    collection.add(billboard);
}

function updateAnnotation(annotation, collection, style) {
    const labelCollection = collection.get(0);
    labelCollection.removeAll();

    const billboardCollection = collection.get(1);
    billboardCollection.removeAll();

    switch (style.mode) {
        case Mode.LABEL:
            addLabel(annotation, labelCollection, style.getLabelStyle());
            break;
        case Mode.BILLBOARD:
            addBillboard(annotation, billboardCollection, style.getBillboardStyle());
            break;
        case Mode.BOTH:
            addLabel(annotation, labelCollection, style.getLabelStyle());
            addBillboard(annotation, billboardCollection, style.getBillboardStyle());
            break;
    }
}

class GraphicProvider {
    constructor(geometry, options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        if (!defined(geometry)) {
            throw new DeveloperError('用于创建Graphic的geometry值不能为空!');
        }

        this._geometry = geometry;

        this._annotation = new Annotation({
            position: this._geometry.center
        });

        this._annotationStyle = new AnnotationStyle();

        this._collection = new PrimitiveCollection({
            show: defaultValue(options.show, true)
        });

        this._collection.add(new LabelCollection());
        this._collection.add(new BillboardCollection());
    }

    get show() {
        return this._show;
    }

    set show(value) {
        this._show = value;
    }

    get style() {
        return this._style;
    }

    _updateGraphic(frameState, graphic) {
        throw DeveloperError.throwInstantiationError();
    }

    update(frameState) {
        if (!this.ready) {
            return;
        }

        if (this._update || (this._style && this._style._update)) {
            this._updateGraphic(frameState, this);
            this._style._update = false;
        }

        if (this._update || (this._annotationStyle && this._annotationStyle) && this._collection) {
            updateAnnotation(this._annotation, this._collection, this._annotationStyle);
        }

        if (defined(this._graphic)) {
            this._graphic.update(frameState);
        }

        if (defined(this._collection)) {
            this._collection.update(frameState);
        }

        this._update = false;
    }
}
export default GraphicProvider;
