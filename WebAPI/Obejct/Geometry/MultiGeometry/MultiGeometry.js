// import createGuid from "../../Core/createGuid.js";
// import defaultValue from "../../Core/defaultValue.js";

import createGuid from '../../../../Source/Core/createGuid.js';
import defaultValue from '../../../../Source/Core/defaultValue.js';

class MultiGeometry {
    constructor(coordinates, options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        this.id = createGuid();
        this.name = options.name;

        this._geometrys = [];
        this._coordinates = coordinates;

        this._show = defaultValue(options.show, true);
    }
}

export default MultiGeometry;
