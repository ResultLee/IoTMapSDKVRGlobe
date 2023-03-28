import Cartesian2 from '../../../Source/Core/Cartesian2.js';
import Cartesian3 from '../../../Source/Core/Cartesian3.js';
import defaultValue from '../../../Source/Core/defaultValue.js';
import defined from '../../../Source/Core/defined.js';
import DeveloperError from '../../../Source/Core/DeveloperError.js';
import BillboardCollection from '../../../Source/Scene/BillboardCollection.js';
import LabelCollection from '../../../Source/Scene/LabelCollection.js';
import Material from '../../../Source/Scene/Material.js';
import PolylineCollection from '../../../Source/Scene/PolylineCollection.js';
import PrimitiveCollection from '../../../Source/Scene/PrimitiveCollection.js';
import Mode from '../../Static/Mode.js';
import Style from '../../Static/Style.js';
import AnnotationStyle from '../../Style/AnnotationStyle.js';
import LineStringStyle from '../../Style/LineStringStyle/LineStringStyle.js';
import LineStringGeometry from '../Geometry/SingleGeometry/LineStringGeometry.js';
import Annotation from '../Units/Annotation.js';

function addPolylines(positions, collection, style) {
    style = style.getStyle();
    const material = Material.fromType('PolylineOutline');

    material.uniforms.color = style.color;
    material.uniforms.outlineColor = style.outlineColor;
    material.uniforms.outlineWidth = style.outlineWidth;

    collection.add(Object.assign({
        loop: style.loop,
        width: style.width,
        material: material,
        positions: Cartesian3.fromPositions(positions)
    }, style));
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

class LineStringGraphic {
    constructor(positions, options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        if (!defined(positions)) {
            throw new DeveloperError('用于创建LineStringGraphic的position值不能为空!');
        }

        const coordinates = new Array();
        for (let i = 0; i < positions.length; i++) {
            coordinates.push(positions[i].toCoordinates());
        }

        this._style = new LineStringStyle();
        this._geometry = new LineStringGeometry(coordinates, options);

        this._annotation = new Annotation({
            position: this._geometry.center
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

    update(frameState) {
        if (!this.ready) {
            return;
        }

        if (this._update || (this._style && this._style._update)) {
            switch (this._style._type) {
                case Style.LINESTRINGSTYLE:
                    this._graphic = new PolylineCollection();
                    addPolylines(this._geometry._positions, this._graphic, this._style);
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
export default LineStringGraphic;
