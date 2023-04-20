import createGuid from '../../../Source/Core/createGuid.js';
import defaultValue from '../../../Source/Core/defaultValue.js';
import destroyObject from '../../../Source/Core/destroyObject.js';
import Graphic from './Graphic.js';

class GraphicsLayer {
    constructor(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        this._id = createGuid();
        this._name = options.name;

        this._graphics = new Array();

        this._show = defaultValue(options.show, true);

        this.ready = true;
    }

    addGraphics(type, options) {
        const graphic = new Graphic(type, options);
        this._graphics.push(graphic);
        return graphic;
    }

    update(frameState) {
        if (!this.ready || !this._show) {
            return;
        }
        this._graphics.forEach(graphic => {
            graphic.update(frameState);
        });
    }

    isDestroyed() {
        return false;
    }

    destroy() {
        destroyObject(this);
    }

}

export default GraphicsLayer;
