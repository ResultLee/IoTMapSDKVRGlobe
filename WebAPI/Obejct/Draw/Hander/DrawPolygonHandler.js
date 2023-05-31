import ScreenSpaceEventHandler from '../../../../Source/Core/ScreenSpaceEventHandler.js';
import ScreenSpaceEventType from '../../../../Source/Core/ScreenSpaceEventType.js';
import Type from '../../../Static/Type.js';

class DrawPolylineHandler {
    constructor(options) {
        this._anchorEvent = options._anchorEvent;
        this._movingEvent = options._movingEvent;
        this._drewEvent = options._drewEvent;

        this._handler = new ScreenSpaceEventHandler();

        this._init();
        this._activate = false;
    }

    _init() {
        const that = this;

        this._handler.setInputAction((movement) => {
            that._anchorEvent.raiseEvent(Type.GRAPHICSPOLYGON, movement.position);
        }, ScreenSpaceEventType.LEFT_CLICK);

        this._handler.setInputAction((movement) => {
            that._movingEvent.raiseEvent(Type.GRAPHICSPOLYGON, movement.position);
        }, ScreenSpaceEventType.MOUSE_MOVE);

        this._handler.setInputAction((movement) => {
            that._drewEvent.raiseEvent(Type.GRAPHICSPOLYGON, movement.position);
        }, ScreenSpaceEventType.MOUSE_MOVE);
    }

    _update(frameState) {
        this._graphics.update(frameState);
    }
}

export default DrawPolylineHandler;
