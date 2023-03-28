import Cartesian2 from '../../../Source/Core/Cartesian2.js';
import Cartesian3 from '../../../Source/Core/Cartesian3.js';
import defaultValue from '../../../Source/Core/defaultValue.js';
import defined from '../../../Source/Core/defined.js';
import DeveloperError from '../../../Source/Core/DeveloperError.js';
import BillboardCollection from '../../../Source/Scene/BillboardCollection.js';
import LabelCollection from '../../../Source/Scene/LabelCollection.js';
import PointPrimitiveCollection from '../../../Source/Scene/PointPrimitiveCollection.js';
import PrimitiveCollection from '../../../Source/Scene/PrimitiveCollection.js';
import Mode from '../../Static/Mode.js';
import Style from '../../Static/Style.js';
import AnnotationStyle from '../../Style/AnnotationStyle.js';
import PointStyle from '../../Style/PointStyle/PointStyle.js';
import PointGeometry from '../Geometry/SingleGeometry/PointGeometry.js';
import Annotation from '../Units/Annotation.js';

function addPoints(position, collection, style) {
    collection.add(Object.assign({
        position: new Cartesian3.fromPosition(position)
    }, style.getStyle()));
    return true;
}

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

function addAnnotation(annotation, collection, style) {
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

class PointGraphic {
    constructor(position, options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        if (!defined(position)) {
            throw new DeveloperError('用于创建PointGraphic的position值不能为空!');
        }

        this._style = new PointStyle();
        this._geometry = new PointGeometry(position.toCoordinates(), options);

        this._annotation = new Annotation({
            position: this._geometry._position
        });

        this._annotationStyle = new AnnotationStyle();

        this._collection = new PrimitiveCollection({
            show: defaultValue(options.show, true)
        });

        this._collection.add(new LabelCollection());
        this._collection.add(new BillboardCollection());

        this.ready = true;
        this._update = true;
    }

    get style() {
        return this._style;
    }

    update(frameState) {
        if (!this.ready) {
            return;
        }

        if (this._update || (this._style && this._style._update)) {
            switch (this._style._type) {
                case Style.POINTSTYLE:
                    this._graphic = new PointPrimitiveCollection();
                    addPoints(this._geometry._position, this._graphic, this._style);
                    break;
            }

            this._style._update = false;
        }

        if (this._update || (this._annotationStyle && this._annotationStyle) && this._collection) {
            addAnnotation(this._annotation, this._collection, this._annotationStyle);
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

export default PointGraphic;
