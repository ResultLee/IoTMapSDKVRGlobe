import defined from '../../../Source/Core/defined.js';
import DeveloperError from '../../../Source/Core/DeveloperError.js';

/**
 * 用于属性表中属性管理的属性对象，统一在{@link AttributeTable}对象中创建，不支持单独创建
 * @protected
 */
class Attribute {

    /**
     * 创建属性表中属性管理的属性对象
     * @param {String} fid 用于关联属性表中的唯一值FID
     * @param {Object} datas 以键值对的形式保存属性的JSON对象
     */
    constructor(fid, datas) {
        if (!defined(fid)) {
            throw new DeveloperError('创建属性的FID对象不能为空!');
        }

        if (!defined(datas)) {
            throw new DeveloperError('创建属性的属性值对象不能为空!');
        }

        this.fid = fid;
        Object.assign(this, datas);
    }

    /**
     * 获取属性FID
     * @returns {String} 属性FID
     */
    getFid() {
        return this.fid;
    }

    /**
     * 根据字段名获取字段值
     * @param {String} fieldName 字段名
     * @returns {String} 字段值
     */
    getValue(fieldName) {
        return this[fieldName];
    }

    /**
     * 获取属性的所有字段名
     * @returns {Array<String>} 以数组的形式返回所有属性的字段名
     */
    getFields() {
        return Object.getOwnPropertyNames(this).filter(prop => prop !== 'fid');
    }

    /**
     * 获取属性的所有字段值
     * @returns {Array<String>} 以数组的形式返回所有属性的字段值
     */
    getValues() {
        const values = new Array();
        const fields = this.getFields();
        fields.forEach(field => values.push(this[field]));
        return values;
    }
}

export default Attribute;
