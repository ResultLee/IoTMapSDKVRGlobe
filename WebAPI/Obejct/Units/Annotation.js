import defaultValue from '../../../Source/Core/defaultValue.js';
import AnnotationStyle from '../../Style/AnnotationStyle.js';

class Annotation {
    constructor(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        this._fid = options.fid;
        this._position = options.position;

        this._show = defaultValue(options.show, true);

        this._style = defaultValue(options.style, new AnnotationStyle());
    }
}

export default Annotation;
