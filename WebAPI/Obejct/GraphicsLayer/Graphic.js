import defined from '../../../Source/Core/defined.js';
import DeveloperError from '../../../Source/Core/DeveloperError.js';

class Graphic {
    constructor(type, options) {
        if (!defined(type)) {
            throw new DeveloperError('创建FeatureLayer的type的值不能为空!');
        }
    }
}
export default Graphic;
