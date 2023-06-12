import defaultValue from '../../../Source/Core/defaultValue.js';
import defined from '../../../Source/Core/defined.js';
import DeveloperError from '../../../Source/Core/DeveloperError.js';
import Event from '../../../Source/Core/Event.js';
import Mode from '../../Static/Mode.js';
import MeasureHorizontalHandler from './Handler/MeasureHorizontalHandler.js';
import MeasureSlopeHandler from './Handler/MeasureSlopeHandler.js';
import MeasureVerticalHandler from './Handler/MeasureVerticalHandler.js';

class Measure {
    constructor() {
        this._mode = Mode.NONE;
        this._isActivate = false;

        this._anchorEvent = new Event();
        this._movingEvent = new Event();
        this._drewEvent = new Event();

        this._results = new Array();

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

        options._drewEvent = this._drewEvent;
        options._anchorEvent = this._anchorEvent;
        options._movingEvent = this._movingEvent;

        if (defined(this._handler)) {
            this._handler._destroy();
        }

        switch (mode) {
            case Mode.MEASUREVERTICAL:
                this._handler = new MeasureVerticalHandler();
                break;
            case Mode.MEASUREHORIZONTAL:
                this._handler = new MeasureHorizontalHandler();
                break;
            case Mode.MEASURESLOPE:
                this._handler = new MeasureSlopeHandler();
                break;
            default:
                throw new DeveloperError('不支持的绘制类型!');
        }

        this._handler._activate = true;
        this._update = true;
    }

    unActivate() {
        if (defined(this._handler)) {
            this._handler._destroy();
            this._handler = undefined;
        }
    }
}

export default Measure;
