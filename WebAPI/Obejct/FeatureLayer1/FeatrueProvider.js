import createGuid from '../../../Source/Core/createGuid.js';
import defaultValue from '../../../Source/Core/defaultValue.js';
import defined from '../../../Source/Core/defined.js';
import DeveloperError from '../../../Source/Core/DeveloperError.js';
import Attribute from '../AttributeTable/Attribute.js';
import Geometry from '../Geometry/Geometry.js';

class FeatureProvider {
    constructor(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        if (!defined(options.type)) {
            throw new DeveloperError('用于创建Feature的type的值不能为空!');
        }
        if (!defined(options.geometry)) {
            throw new DeveloperError('用于创建Feature的geometry的值不能为空!');
        }

        this._name = options.name;
        this._type = options.type;
        this._id = defaultValue(options.id, createGuid());
        this._geometry = new Geometry(options.geometry, options);
        this._attribute = new Attribute(this._id, options.attribute || options.properties);
    }
}

export default FeatureProvider;
