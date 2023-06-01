import Event from '../../../../Source/Core/Event.js';
import ScreenSpaceEventHandler from '../../../../Source/Core/ScreenSpaceEventHandler.js';
import ScreenSpaceEventType from '../../../../Source/Core/ScreenSpaceEventType.js';
import Type from '../../../Static/Type.js';

class DrawPolygonHandler {
    constructor() {
        this._anchorEvent = new Event();
        this._movingEvent = new Event();
        this._drewEvent = new Event();

        this._handler = new ScreenSpaceEventHandler();
        // this._polygon
        // this._polyline

        this._state = 0;
        this._positions = new Array();

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

    _update(frameState) {
        this._graphics.update(frameState);
    }
}

export default DrawPolygonHandler;
