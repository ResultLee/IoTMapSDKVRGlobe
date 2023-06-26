import createGuid from '../../../../../../Source/Core/createGuid.js';
import defaultValue from '../../../../../../Source/Core/defaultValue.js';
import defined from '../../../../../../Source/Core/defined.js';
import DeveloperError from '../../../../../../Source/Core/DeveloperError.js';
import Annotation from '../../../../Units/Annotation.js';
import Position3D from '../../../../Units/Position3D.js';

class MultiGraphicProvider {
    constructor(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        if (!defined(options.positions) || !(options.positions instanceof Array)) {
            throw new DeveloperError('用于创建MultiGraphic的positions的值不能为空!');
        }

        this._id = defaultValue(options.id, createGuid());
        this._show = defaultValue(options.show, true);

        this._mode = options.mode;
        this._name = options.name;
        this._style = options.style;
        this._geometry = options.geometry;

        this._graphis = new Array();
        this._positions = options.positions.slice();
        this._annotation = defaultValue(options.annotation, new Annotation({
            id: options.id,
            style: options.annotationStyle,
            position: Position3D.ORIGIN
        }));
    }

    get show() {
        return this._show;
    }

    set show(value) {
        this._show = value;
    }

    update(frameState) {
        throw DeveloperError.throwInstantiationError();
    }
}

export default MultiGraphicProvider;

