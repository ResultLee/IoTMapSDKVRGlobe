import createGuid from '../../../Source/Core/createGuid.js';
import defaultValue from '../../../Source/Core/defaultValue.js';

class GeometryProvider {
    constructor(positions, options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        this.id = createGuid();
        this.name = options.name;
        this._positions = positions;
    }
}

export default GeometryProvider;
