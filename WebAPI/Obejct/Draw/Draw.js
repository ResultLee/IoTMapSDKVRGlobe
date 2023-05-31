import defaultValue from '../../../Source/Core/defaultValue.js';
import defined from '../../../Source/Core/defined.js';
import DeveloperError from '../../../Source/Core/DeveloperError.js';
import Event from '../../../Source/Core/Event.js';
import Mode from '../../Static/Mode.js';
import DrawPointHandler from './Hander/DrawPointHandler.js';
import DrawPolylineHandler from './Hander/DrawPolylineHandler.js';

class Draw {
    constructor() {
        this._mode = Mode.NONE;
        this._isActivate = false;

        // this._hander.setInputAction(function (movement) {
        //     console.log(movement.position);
        // }, ScreenSpaceEventType.LEFT_CLICK);

        // this._drewEvent.addEventListener((type, data) => {
        //     console.log(type, data);
        // });

        this._anchorEvent = new Event();
        this._movingEvent = new Event();
        this._drewEvent = new Event();

        this._results = new Array();
        this._addResults = new Array();

        this._ready = false;
        this._update = false;
    }

    get enable() {
        return this._handler && this._handler._activate;
    }

    set enable(value) {
        if (defined(this._handler)) {
            this._handler._activate = value;
        }
    }

    get mode() {
        return this._mode;
    }

    set mode(value) {
        this._mode = value;
    }

    activate(mode, options) {
        options = defaultValue(options, new Object);

        options._anchorEvent = this._anchorEvent;
        options._movingEvent = this._movingEvent;
        options._drewEvent = this._drewEvent;

        switch (mode) {
            case Mode.DRAWPOINT:
                this._handler = new DrawPointHandler(options);
                break;
            case Mode.DRAWPOLYLINE:
                this._handler = new DrawPolylineHandler(options);
                break;
            default:
                throw new DeveloperError('不支持的绘制类型!');
        }

        this._handler._activate = true;
        this._update = true;
    }
}

export default Draw;
