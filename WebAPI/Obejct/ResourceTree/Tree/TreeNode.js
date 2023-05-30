/*
 * @Author: SnotlingLiu<snotlingliu@gmail.com/>
 * @Date: 2023-03-08 10:48:57
 * @LastEditors: SnotlingLiu<snotlingliu@gmail.com/>
 * @LastEditTime: 2023-03-08 10:56:07
 * @Description:
 */
import createGuid from '../../../../Source/Core/createGuid.js';
import defaultValue from '../../../../Source/Core/defaultValue.js';
import Default from '../../../Static/Default.js';
import Type from '../../../Static/Type.js';

class TreeNode {
    /**
     * 树节点模型
     * @protected
     * @param {*} options
     */
    constructor(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);
        this.type = Type.TREENODE;
        this.id = defaultValue(options.id, createGuid());
        this.name = defaultValue(options.name, '');
        this.parentId = defaultValue(options.parentId, Default.ROOTNODEID);
    }
}

export default TreeNode;
