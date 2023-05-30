import ScreenSpaceEventHandler from '../../../../Source/Core/ScreenSpaceEventHandler.js';
import ScreenSpaceEventType from '../../../../Source/Core/ScreenSpaceEventType.js';
import Type from '../../../Static/Type.js';

class DrawPolylineHandler {
    constructor(options) {
        this._anchorEvent = options._anchorEvent;
        this._movingEvent = options._movingEvent;
        this._drewEvent = options._drewEvent;

        this._state = 0;
        this._positions = new Array();
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
        this._handler.setInputAction(function (event) {
            that._anchorEvent.raiseEvent(Type.GRAPHICSLINESTRING, event.position);
        }, ScreenSpaceEventType.LEFT_CLICK);

        this._handler.setInputAction(function (event) {
            if (that._state !== 1) {
                return;
            }
            that._movingEvent.raiseEvent(Type.GRAPHICSLINESTRING, event.endPosition);
        }, ScreenSpaceEventType.MOUSE_MOVE);

        this._handler.setInputAction(function (event) {
            that._drewEvent.raiseEvent(Type.GRAPHICSLINESTRING, event.position);
        }, ScreenSpaceEventType.RIGHT_CLICK);
    }
}

export default DrawPolylineHandler;
