/*
 * @Author: SnotlingLiu<snotlingliu@gmail.com/>
 * @Date: 2023-03-08 10:48:57
 * @LastEditors: SnotlingLiu<snotlingliu@gmail.com/>
 * @LastEditTime: 2023-03-08 10:56:07
 * @Description:
 */

import TreeItem from './TreeItem.js';

/**
 * 资源树映射表对象
 */
class TreeTable {
    /**
     * 资源树映射表对象
     * @protected
     * @constructor
     */
    constructor() {
        /**
         * 映射表数据
         * @member
         */
        this.list = new Array();
    }

    addItem(options) {
        const item = new TreeItem(options);
        this.list.push(item);
        return this.addItem;
    }
}

export default TreeTable;
