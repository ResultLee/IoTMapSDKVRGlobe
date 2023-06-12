import destroyObject from '../../../../Source/Core/destroyObject.js';
import Event from '../../../../Source/Core/Event.js';
import ScreenSpaceEventHandler from '../../../../Source/Core/ScreenSpaceEventHandler.js';
import ScreenSpaceEventType from '../../../../Source/Core/ScreenSpaceEventType.js';
import Type from '../../../Static/Type.js';

class MeasureSlopeHandler {
    constructor() {
        this._drewEvent = new Event();
        this._anchorEvent = new Event();
        this._movingEvent = new Event();

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
            if (!that._activate) {
                return;
            }
            if (that._state === 0) {
                that._anchorEvent.raiseEvent(Type.GRAPHICSLINESTRING, event.position);
                that._state = 1;
            } else if (that._state) {
                that._state = 0;
                that._drewEvent.raiseEvent(Type.GRAPHICSLINESTRING, event.position, that._positions);
                that._positions = new Array();
                that._polyline = undefined;
            }

        }, ScreenSpaceEventType.LEFT_CLICK);

        this._handler.setInputAction(function (event) {
            if (!that._activate || that._state !== 1) {
                return;
            }
            that._movingEvent.raiseEvent(Type.GRAPHICSLINESTRING, event.endPosition);
        }, ScreenSpaceEventType.MOUSE_MOVE);
    }

    _destroy() {
        this._state = 0;
        this._activate = false;
        this._polyline = undefined;
        this._positions = new Array();
        this._handler.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
        this._handler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
        destroyObject(this);
    }
}

export default MeasureSlopeHandler;
