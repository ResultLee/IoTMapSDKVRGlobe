import defaultValue from '../../Source/Core/defaultValue.js';
import Type from '../Static/Type.js';

/**
 * 影像图层样式
 */
class ImageryStyle {
    /**
     * 影像图层样式
     * @param {Object} options 配置影像图层样式参数，可选
     * @param {Number} [options.hue = 1.0] 影像色相
     * @param {Number} [options.alpha = 1.0] 影像透明度
     * @param {Number} [options.gamma = 1.0] 影像明度和灰度
     * @param {Number} [options.contrast = 1.0] 影像对比度
     * @param {Number} [options.brightness = 1.0] 影像亮度
     * @param {Number} [options.saturation = 1.0] 影像饱和度
     */
    constructor(options) {
        /**
         * 样式类型
         * @type {Type}
         */
        this.type = Type.IMAGERY;
        /**
         * 影像色相
         * @type {Number}
         */
        this.hue = defaultValue(options.hue, 1.0);
        /**
         * 影像透明度
         * @type {Number}
         */
        this.alpha = defaultValue(options.alpha, 1.0);
        /**
         * 影像明度和灰度
         * @type {Number}
         */
        this.gamma = defaultValue(options.gamma, 1.0);
        /**
         * 影像对比度
         * @type {Number}
         */
        this.contrast = defaultValue(options.contrast, 1.0);
        /**
         * 影像亮度
         * @type {Number}
         */
        this.brightness = defaultValue(options.brightness, 1.0);
        /**
         * 影像饱和度
         * @type {Number}
         */
        this.saturation = defaultValue(options.saturation, 1.0);
    }
}

export default ImageryStyle;
