import createGuid from '../../../Source/Core/createGuid.js';
import defaultValue from '../../../Source/Core/defaultValue.js';
import defined from '../../../Source/Core/defined.js';
import DeveloperError from '../../../Source/Core/DeveloperError.js';
import BillboardCollection from '../../../Source/Scene/BillboardCollection.js';
import LabelCollection from '../../../Source/Scene/LabelCollection.js';
import PrimitiveCollection from '../../../Source/Scene/PrimitiveCollection.js';
import Mode from '../../Static/Mode.js';

class Annotation {
    constructor(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        if (!defined(options.position)) {
            throw new DeveloperError('创建标注对象的position的参数不能为空!');
        }

        this._id = defaultValue(options.id, createGuid());

        this._style = options.style;
        this._position = options.position;
        this._annotation = new PrimitiveCollection();

        this._show = defaultValue(options.show, true);
        this._update = true;
    }

    setStyle(annotationStyle) {
        this._style = annotationStyle;
        this._update = true;
    }

    resetStyle() {
        this._style = undefined;
        this._update = true;
    }

    update(frameState) {
        if (!this._show || !defined(this._annotation)) {
            return;
        }

        if (this._style && this._style._update || this._update) {
            this._annotation.removeAll();

            const labelCollection = this._annotation.add(new LabelCollection());
            const billboardCollection = this._annotation.add(new BillboardCollection());

            switch (this._style.mode) {
                case Mode.LABEL:
                    labelCollection.add(this._style._getLabelStyle(this._position));
                    break;
                case Mode.BILLBOARD:
                    billboardCollection.add(this._style._getBillboardStyle(this._position));
                    break;
                case Mode.BOTH:
                case Mode.ALL:
                    labelCollection.add(this._style._getLabelStyle(this._position));
                    billboardCollection.add(this._style._getBillboardStyle(this._position));
                    break;
            }

            this._update = false;
            this._style._update = false;
        }

        this._annotation.update(frameState);
    }

}

export default Annotation;
