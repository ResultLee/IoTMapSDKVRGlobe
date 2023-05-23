import createGuid from '../../../../Source/Core/createGuid.js';
import defaultValue from '../../../../Source/Core/defaultValue.js';
import Type from '../../../Static/Type.js';

class TreeGroup {
    constructor(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);
        this.type = Type.TREEGROUP;
        this.parentId = options.parentId;
        this.id = defaultValue(options.id, createGuid());
        this.name = defaultValue(options.name, '');
        this.children = defaultValue(options.children, new Array());
    }
}

export default TreeGroup;
