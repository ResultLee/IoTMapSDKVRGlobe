/*
 * @Author: SnotlingLiu<snotlingliu@gmail.com/>
 * @Date: 2023-03-08 10:46:16
 * @LastEditors: SnotlingLiu<snotlingliu@gmail.com/>
 * @LastEditTime: 2023-03-09 09:34:12
 * @Description: 
 */

import DataManager from '../Obejct/ResoureTree/DataManager.js';
import TreeNode from '../Obejct/ResoureTree/TreeNode.js';
import TreeTable from '../Obejct/ResoureTree/TreeTable.js';

/**
 * 资源树接口
 */
class ResourceTree {
    /**
     * 资源树
     * @protected
     */
    constructor() {
        /**
         * 资源树根节点对象
         * @type {TreeNode}
         * @member
         */
        this.root = new TreeNode();
        /**
         * 资源树映射表对象
         * @type {TreeTable}
         * @member
         */
        this.table = new TreeTable();
        /**
         * 资源树数据管理对象
         * @type {DataManager}
         * @member
         */
        this.dataManager = new DataManager();
    }
}

export default ResourceTree;
