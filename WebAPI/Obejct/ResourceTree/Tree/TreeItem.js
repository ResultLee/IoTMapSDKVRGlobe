import defaultValue from '../../../../Source/Core/defaultValue.js';

class TreeItem {
    constructor(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        this.id = options.id;
        this.name = options.name;
        this.parentId = options.parentId;
        this.layerType = options.layerType;
    }
}

export default TreeItem;
