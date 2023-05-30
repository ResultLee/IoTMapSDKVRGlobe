import ScreenSpaceEventHandler from '../../../../Source/Core/ScreenSpaceEventHandler.js';
import ScreenSpaceEventType from '../../../../Source/Core/ScreenSpaceEventType.js';
import Type from '../../../Static/Type.js';

class DrawPointHandler {
    constructor(scene, options) {
        this._activeEvent = options._activeEvent;
        this._anchorEvent = options._anchorEvent;
        this._drewEvent = options._drewEvent;

        this._handler = new ScreenSpaceEventHandler();

        this._init(scene);
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
        this._handler.setInputAction(function (movement) {
            if (!that._activate) {
                return false;
            }

            that._drewEvent.raiseEvent(Type.GRAPHICSPOINT, movement.position);
            that._anchorEvent.raiseEvent(movement.position);
            that._activeEvent.raiseEvent(movement.position);

        }, ScreenSpaceEventType.LEFT_CLICK);
    }
}

export default DrawPointHandler;
