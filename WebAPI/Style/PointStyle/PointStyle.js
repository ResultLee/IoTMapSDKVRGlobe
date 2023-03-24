import Check from '../../../Source/Core/Check.js';
import Color from '../../../Source/Core/Color.js';
import defaultValue from '../../../Source/Core/defaultValue.js';
import DeveloperError from '../../../Source/Core/DeveloperError.js';
import Style from '../../Static/Style.js';

class PointStyle {
    constructor(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        this._type = Style.POINTSTYLE;
        this._color = Color.clone(defaultValue(options.color, Color.YELLOW));
        this._pixelSize = defaultValue(options.pixelSize, 10.0);
        this._outlineWidth = defaultValue(options.outlineWidth, 0.0);
        this._outlineColor = Color.clone(
            defaultValue(options.outlineColor, Color.TRANSPARENT)
        );

        this._update = false;
    }

    /**
     * @param {Color} value
     */
    set color(value) {
        if (!(value instanceof Color)) {
            throw new DeveloperError('请输入正确的颜色对象!');
        }
        this._color = value;
        this._update = true;
    }

    /**
     * @param {Color} value
     */
    set outlineColor(value) {
        if (!(value instanceof Color)) {
            throw new DeveloperError('请输入正确的颜色对象!');
        }
        this._outlineColor = value;
        this._update = true;
    }

    /**
     *
     * @param {Number} value
     */
    set outlineWidth(value) {
        Check.typeOf.number.greaterThanOrEquals('点大小不能小于0!', value, 0);
        this._outlineWidth = value;
        this._update = true;
    }

    /**
     *
     * @param {Number} value
     */
    set pixelSize(value) {
        Check.typeOf.number.greaterThan('点大小不能小于或等于0!', value, 0);
        this._pixelSize = value;
        this._update = true;
    }

    getStyle() {
        return {
            type: this._type,
            color: this._color,
            pixelSize: this._pixelSize,
            outlineWidth: this._outlineWidth,
            outlineColor: this._outlineColor
        };
    }
}

export default PointStyle;
