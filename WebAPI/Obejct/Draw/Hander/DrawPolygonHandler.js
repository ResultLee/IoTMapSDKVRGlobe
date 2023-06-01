import destroyObject from '../../../../Source/Core/destroyObject.js';
import Event from '../../../../Source/Core/Event.js';
import ScreenSpaceEventHandler from '../../../../Source/Core/ScreenSpaceEventHandler.js';
import ScreenSpaceEventType from '../../../../Source/Core/ScreenSpaceEventType.js';
import Type from '../../../Static/Type.js';

class DrawPolygonHandler {
    constructor() {
        this._anchorEvent = new Event();
        this._movingEvent = new Event();
        this._drewEvent = new Event();

        this._state = 0;
        this._positions = new Array();
        this._handler = new ScreenSpaceEventHandler();

        this._init();
        this._activate = false;
    }

    _init() {
        const that = this;
        this._handler.setInputAction((movement) => {
            if (!that._activate) {
                return;
            }
            if (that._state < 3) {
                that._state++;
            }
            that._anchorEvent.raiseEvent(Type.GRAPHICSPOLYGON, movement.position);
        }, ScreenSpaceEventType.LEFT_CLICK);

        this._handler.setInputAction((movement) => {
            if (!that._activate) {
                return;
            }
            if (that._state === 1) {
                that._movingEvent.raiseEvent(Type.GRAPHICSLINESTRING, movement.endPosition);
            }
            else if (that._state > 1) {
                that._movingEvent.raiseEvent(Type.GRAPHICSPOLYGON, movement.endPosition);
            }
        }, ScreenSpaceEventType.MOUSE_MOVE);

        this._handler.setInputAction((movement) => {
            if (!that._activate) {
                return;
            }
            that._drewEvent.raiseEvent(Type.GRAPHICSPOLYGON, movement.position, that._positions);
            that._state = 0;
            that._positions = new Array();
            that._polygon = undefined;
            that._polyline = undefined;
        }, ScreenSpaceEventType.RIGHT_CLICK);
    }

    _destroy() {
        this._state = 0;
        this._activate = false;
        this._polygon = undefined;
        this._polyline = undefined;
        this._positions = new Array();
        this._handler.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
        this._handler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
        this._handler.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
        destroyObject(this);
    }
}

export default DrawPolygonHandler;
