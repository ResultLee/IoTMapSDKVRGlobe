import Cartesian3 from '../../Source/Core/Cartesian3.js';
import Check from '../../Source/Core/Check.js';
import Color from '../../Source/Core/Color.js';
import createGuid from '../../Source/Core/createGuid.js';
import defaultValue from '../../Source/Core/defaultValue.js';
import DeveloperError from '../../Source/Core/DeveloperError.js';
import HorizontalOrigin from '../../Source/Scene/HorizontalOrigin.js';
import VerticalOrigin from '../../Source/Scene/VerticalOrigin.js';
import Mode from '../Static/Mode.js';

class AnnotationStyle {
    constructor(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        // TODO: 完善标注样式
        this._mode = defaultValue(options.mode, Mode.NONE);
        // TODO: 增加按照Feature属性字段赋值功能
        this._text = defaultValue(options.text, '北斗空间!');
        this._image = options.image;
        this._imageScale = defaultValue(options.imageScale, 1);
        this._labelScale = defaultValue(options.labelScale, 0.5);
        this._labelColor = defaultValue(options.labelColor, Color.RED);
        this._showBackground = defaultValue(options.showBackground, true);
        this._backgroundColor = defaultValue(options.backgroundColor, Color.WHITE);

        this._fid = createGuid();
        this._update = defaultValue(options.update, true);
    }

    /**
     * @param {String} value
     */
    set text(value) {
        this._text = value;
        this._update = true;
    }

    /**
     * @param {String} value
     */
    set image(value) {
        this._image = value;
        this._update = true;
    }

    /**
     * @param {Number} value
     */
    set imageScale(value) {
        Check.typeOf.number.greaterThan('点大小不能小于或等于0!', value, 0);
        this._outlineWidth = value;
        this._update = true;
    }

    /**
     * @param {Number} value
     */
    set labelScale(value) {
        Check.typeOf.number.greaterThan('点大小不能小于或等于0!', value, 0);
        this._labelScale = value;
        this._update = true;
    }

    /**
     * @param {Color} value
     */
    set labelColor(value) {
        if (!(value instanceof Color)) {
            throw new DeveloperError('请输入正确的颜色对象!');
        }
        this._labelColor = value;
        this._update = true;
    }

    /**
     * @param {Number} value
     */
    set showBackground(value) {
        Check.typeOf.bool('showBackground的类型必须为bool!', value);
        this._showBackground = value;
        this._update = true;
    }

    /**
     * @param {Color} value
     */
    set backgroundColor(value) {
        if (!(value instanceof Color)) {
            throw new DeveloperError('请输入正确的颜色对象!');
        }
        this._backgroundColor = value;
        this._update = true;
    }

    set mode(value) {
        // TODO: 添加类型判断
        this._mode = value;
        this._update = true;
    }

    get mode() {
        return this._mode;
    }

    _getLabelStyle(position) {
        return {
            mode: this._mode,
            text: this._text,
            scale: this._labelScale,
            fillColor: this._labelColor,
            showBackground: this._showBackground,
            backgroundColor: this._backgroundColor,
            position: Cartesian3.fromPosition(position)
        };
    }

    _getBillboardStyle(position) {
        return {
            mode: this._mode,
            image: 'http://localhost:5500/favicon.ico',
            scale: this._imageScale,
            verticalOrigin: VerticalOrigin.BOTTOM,
            horizontalOrigin: HorizontalOrigin.LEFT,
            position: Cartesian3.fromPosition(position)
        };
    }

    clone() {
        return new AnnotationStyle({
            mode: this._mode,
            text: this._text,
            image: this._image,
            update: this._update,
            imageScale: this._imageScale,
            labelScale: this._labelScale,
            labelColor: this._labelColor,
            showBackground: this._showBackground,
            backgroundColor: this._backgroundColor

        });
    }
}

export default AnnotationStyle;
