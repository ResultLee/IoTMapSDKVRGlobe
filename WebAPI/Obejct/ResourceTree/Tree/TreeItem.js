import createGuid from '../../../../Source/Core/createGuid.js';
import defaultValue from '../../../../Source/Core/defaultValue.js';

class TreeItem {
    constructor(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        this.id = defaultValue(options.id, createGuid());
        this.dataId = defaultValue(options.dataId, createGuid());
        this.nodeType = defaultValue(options.nodeType, undefined);
        this.parentId = defaultValue(options.parentId, undefined);
        this.children = defaultValue(options.children, new Array());
    }
}

export default TreeItem;
