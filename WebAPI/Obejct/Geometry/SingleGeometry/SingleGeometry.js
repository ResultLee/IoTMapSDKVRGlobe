import createGuid from '../../../../Source/Core/createGuid.js';
import defaultValue from '../../../../Source/Core/defaultValue.js';

class SingleGeometry {
    constructor(coordinates, options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        this.id = createGuid();
        this.name = options.name;

        this._show = defaultValue(options.show, true);
    }
}

export default SingleGeometry;
