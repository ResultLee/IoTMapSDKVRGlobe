/*
 * @Author: SnotlingLiu<snotlingliu@gmail.com/>
 * @Date: 2023-03-08 10:48:57
 * @LastEditors: SnotlingLiu<snotlingliu@gmail.com/>
 * @LastEditTime: 2023-03-08 10:56:07
 * @Description:
 */
import createGuid from '../../../Source/Core/createGuid.js';
import defaultValue from '../../../Source/Core/defaultValue.js';
import Type from '../../Static/Type.js';

class TreeNode {
    /**
     * 树节点模型
     * @protected
     * @param {*} options
     */
    constructor(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);
        this.id = defaultValue(options.id, createGuid());
        this.type = Type.TREENODE;
        this.name = defaultValue(options.name, '');
        this.parentId = defaultValue(options.parentId, undefined);
        this.children = defaultValue(options.children, new Array());
        this.visibility = defaultValue(options.visibility, true);
    }
}

export default TreeNode;
