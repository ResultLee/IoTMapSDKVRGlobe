import defaultValue from "../../Source/Core/defaultValue";
import defined from "../../Source/Core/defined";
import DeveloperError from "../../Source/Core/DeveloperError";
import getElement from "../../Source/Widgets/getElement";

/**
 * 用于检测和判断的静态类
 * @alias Check
 */
export default class Check {
    /**
     * 用于判断对象是否为空的静态方法
     * @memberof Check
     * 
     * @param {Object} object 需要被判断的对象
     * @returns {Boolean} 当对象不为空时则返回true，反之则抛出异常.
     * 
     * @example
     * // 1.直接用于非空值判断
     * VRGlobe.Check.defiend(Object);
     * 
     * // 2.在条件语句中用于非空判断
     * if(VRGlobe.Check.defiend(Object)){
     * 
     * }
     */
    static defiend(object) {
        if (!defined(object)) {
            throw new DeveloperError("该对象为空!")
        }
        return true;
    }

    /**
     * 用于判断对象是否存在，若存在则返回原值，否则返回空对象
     * @memberof Check
     * 
     * @param {*} object 用于判断的对象
     * @param {Object} [value] 当对象为空时设置的默认值
     * @returns {Object} 若对象不为空则返回该对象，否则返回空对象
     */
    static defaultValue(object, value) {
        return defaultValue(object, value || defaultValue.EMPTY_OBJECT);
    }

    static getElement(container) {
        return getElement(container);
    }
}