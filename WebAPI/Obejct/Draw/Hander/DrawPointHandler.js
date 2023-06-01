import destroyObject from '../../../../Source/Core/destroyObject.js';
import Event from '../../../../Source/Core/Event.js';
import ScreenSpaceEventHandler from '../../../../Source/Core/ScreenSpaceEventHandler.js';
import ScreenSpaceEventType from '../../../../Source/Core/ScreenSpaceEventType.js';
import Type from '../../../Static/Type.js';

class DrawPointHandler {
    constructor() {
        this._drewEvent = new Event();
        this._anchorEvent = new Event();

        this._handler = new ScreenSpaceEventHandler();

        this._init();
        this._activate = false;
    }

    get activate() {
        return this._activate;
    }

    set activate(value) {
        this._activate = value;
    }

    _init() {
        const that = this;
        this._handler.setInputAction((movement) => {
            if (!that._activate) {
                return;
            }
            that._activate = false;
            that._drewEvent.raiseEvent(Type.GRAPHICSPOINT, movement.position);
            that._anchorEvent.raiseEvent(Type.GRAPHICSPOINT, movement.position);
        }, ScreenSpaceEventType.LEFT_CLICK);
    }

    _destory() {
        this._activate = false;
        this._handler.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
        destroyObject(this);
    }
}

export default DrawPointHandler;
