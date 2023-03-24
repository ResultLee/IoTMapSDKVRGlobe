import Check from '../../../Source/Core/Check.js';
import Color from '../../../Source/Core/Color.js';
import defaultValue from '../../../Source/Core/defaultValue.js';
import DeveloperError from '../../../Source/Core/DeveloperError.js';
import Style from '../../Static/Style.js';

class PolygonStyle {
    constructor(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        this._type = Style.POLYGONSTYLE;
        this._fill = defaultValue(options.fill, true);
        this._height = defaultValue(options.height, 1000);
        this._outline = defaultValue(options.outline, true);
        this._perPositionHeight = defaultValue(options.perPositionHeight, false);
        this._fillColor = Color.clone(defaultValue(options.fillColor, Color.YELLOW));
        this._outlineColor = Color.clone(
            defaultValue(options.outlineColor, Color.RED)
        );

        this._update = false;
    }

    /**
     * @param {Boolean} value
     */
    set fill(value) {
        Check.typeOf.bool('fill的类型必须为bool!', value);
        this._fill = value;
        this._update = true;
    }

    /**
     * @param {Number} value
     */
    set height(value) {
        Check.typeOf.number('height的类型必须为Number!', value);
        this._height = value;
        this._update = true;
    }

    /**
     * @param {Boolean} value
     */
    set outline(value) {
        Check.typeOf.bool('outline的类型必须为bool!', value);
        this._outline = value;
        this._update = true;
    }

    /**
     * @param {Color} value
     */
    set fillColor(value) {
        if (!(value instanceof Color)) {
            throw new DeveloperError('请输入正确的颜色对象!');
        }
        this._fillColor = value;
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
     * @param {Boolean} value
     */
    set perPositionHeight(value) {
        Check.typeOf.bool('perPositionHeight的类型必须为bool!', value);
        this._perPositionHeight = value;
        this._update = true;
    }

    getStyle() {
        return {
            type: this._type,
            fill: this._fill,
            height: this._height,
            outline: this._outline,
            fillColor: this._fillColor,
            outlineColor: this._outlineColor,
            perPositionHeight: this._perPositionHeight
        };
    }
}

export default PolygonStyle;
