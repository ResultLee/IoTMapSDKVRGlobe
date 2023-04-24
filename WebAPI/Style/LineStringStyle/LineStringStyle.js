import Cartesian3 from '../../../Source/Core/Cartesian3.js';
import Check from '../../../Source/Core/Check.js';
import Color from '../../../Source/Core/Color.js';
import defaultValue from '../../../Source/Core/defaultValue.js';
import DeveloperError from '../../../Source/Core/DeveloperError.js';
import Material from '../../../Source/Scene/Material.js';
import Style from '../../Static/Style.js';

class LineStringStyle {
    constructor(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        this._type = Style.LINESTRINGSTYLE;
        this._width = defaultValue(options.width, 1.0);
        this._loop = defaultValue(options.loop, false);
        this._color = Color.clone(defaultValue(options.color, Color.YELLOW));
        this._outlineWidth = defaultValue(options.outlineWidth, 0.0);
        this._outlineColor = Color.clone(
            defaultValue(options.outlineColor, Color.TRANSPARENT)
        );

        this._update = true;
    }

    /**
     * @param {Boolean} value
     */
    set loop(value) {
        Check.typeOf.bool('loop的类型必须为bool!', value);
        this._loop = value;
        this._update = true;
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
     * @param {Number} value
     */
    set width(value) {
        Check.typeOf.number.greaterThan('点大小不能小于或等于0!', value, 0);
        this._width = value;
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

    _getStyle(positions) {
        const material = Material.fromType('PolylineOutline');

        material.uniforms.color = this._color;
        material.uniforms.outlineColor = this._outlineColor;
        material.uniforms.outlineWidth = this._outlineWidth;

        return {
            loop: this._loop,
            width: this._width,
            material: material,
            positions: Cartesian3.fromPositions(positions)
        };
    }

    clone() {
        return new LineStringStyle({
            loop: this._loop,
            color: this._color,
            width: this._width,
            outlineColor: this._outlineColor,
            outlineWidth: this._outlineWidth
        });
    }
}

export default LineStringStyle;
