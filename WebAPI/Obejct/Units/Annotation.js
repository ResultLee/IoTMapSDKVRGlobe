import defaultValue from '../../../Source/Core/defaultValue.js';
import defined from '../../../Source/Core/defined.js';
import DeveloperError from '../../../Source/Core/DeveloperError.js';
import AnnotationStyle from '../../Style/AnnotationStyle.js';

class Annotation {
    constructor(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        if(!defined(options.position)){
            throw new DeveloperError('创建标注对象的position的参数不能为空!');
        }

        this._fid = options.fid;
        this._position = options.position;

        this._show = defaultValue(options.show, true);

        this._style = defaultValue(options.style, new AnnotationStyle());
    }

    
}

export default Annotation;
