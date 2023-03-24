import defined from '../../../Source/Core/defined.js';
import DeveloperError from '../../../Source/Core/DeveloperError.js';

/**
 * 用于属性表中属性管理的表对象，统一在{@link AttributeTable}对象中创建，不支持单独创建
 * @protected
 */
class Table {
    /**
     * 创建属性表中属性管理的表对象
     * @param {Array<Attribute>} attributes 用于创建表对象的属性集合
     */
    constructor(attributes) {
        if (!defined(attributes)) {
            throw new DeveloperError('用于创建属性表的值不能为空!');
        }

        const items = new Object();
        const fields = new Array();

        this.itemLength = attributes.length;
        for (let i = 0; i < this.itemLength; i++) {
            const json = attributes[i];
            // eslint-disable-next-line guard-for-in
            for (const field in json) {
                if (!defined(field) || !defined(items[field])) {
                    fields.push(field);
                    items[field] = new Array(this.itemLength);
                }
                items[field][i] = json[field];
            }
        }

        this._items = items;
        this._fields = fields;

    }

    /**
     * 添加字段
     * @param {String} fieldName 字段名
     * @returns {Boolean} 创建完成
     */
    addField(fieldName) {
        this._fields.push(fieldName);
        this._items[fieldName] = new Array(this.itemLength);
        return true;
    }

    /**
     * 根据Fid设置对应字段名的字段值
     * @param {String} fieldName 字段名
     * @param {String} value 字段值
     * @param {Number} index 用于关联属性表中的索引值
     * @returns {Boolean} 创建完成
     */
    setVaule(field, value, index) {
        const item = this._items[field];
        if (!defined(item)) {
            throw new DeveloperError('字段名错误,请输入正确的字段名!');
        }
        if (index >= this.itemLength) {
            throw new DeveloperError('字段索引值大于字段数,请输入正确的Fid!');
        }

        item[index] = value;
        return true;
    }

    /**
     * 根据FID和字段名获取对应字段值
     * @param {String} fid 用于关联属性表中的唯一值FID
     * @param {String} fieldName 字段名
     * @returns {String} 与FID和字段名对应的字段值
     */
    getValue(fid, fieldName) {
        const item = this._items[fieldName];
        if (!defined(item)) {
            throw new DeveloperError('字段名错误,请输入正确的字段名!');
        }
        if (fid >= this.itemLength) {
            throw new DeveloperError('字段索引值大于字段数,请输入正确的Fid!');
        }

        return item[fid];
    }

    /**
     * 根据FID以数组的形式返回所有属性字段的值
     * @param {String} fid 用于关联属性表中的唯一值FID
     * @returns {Array<String>} 所有属性字段的值
     */
    getValues(fid) {
        if (fid >= this.itemLength) {
            throw new DeveloperError('字段索引值大于字段数,请输入正确的Fid!');
        }
        const value = {};
        this._fields.forEach(field => {
            value[field] = this._items[field][fid];
        });
        return value;
    }

    /**
     * 向表中添加一条Attribute属性
     * @param {Attribute} attribute 需要添加的属性值
     * @returns {Boolean} 创建完成
     */
    addAttribute(attribute) {
        const fields = attribute.getFields();

        this.itemLength++;
        fields.forEach(fieldName => {
            if (this._fields.indexOf(fieldName) < 0) {
                this.addField(fieldName);
            }
            const value = attribute.getValue(fieldName);
            this.setVaule(fieldName, value, this.itemLength - 1);
        });
        return true;
    }
}

export default Table;
