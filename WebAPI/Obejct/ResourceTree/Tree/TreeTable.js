/*
 * @Author: SnotlingLiu<snotlingliu@gmail.com/>
 * @Date: 2023-03-08 10:48:57
 * @LastEditors: SnotlingLiu<snotlingliu@gmail.com/>
 * @LastEditTime: 2023-03-08 10:56:07
 * @Description:
 */

import TreeItem from './TreeItem.js';

let removeItems = new Array();

function removeItemById(list, id) {
    for (let i = 0; i < list.length; i++) {
        const item = list[i];
        if (id === item.id) {
            const ritem = list.splice(i, 1)[0];
            removeItems.push(ritem);
            removeItemByParentId(list, id);
            break;
        }
    }
}

function removeItemByParentId(list, id) {
    for (let i = 0; i < list.length;) {
        const item = list[i];
        if (id === item.parentId) {
            const ritem = list.splice(i, 1)[0];
            removeItems.push(ritem);
            removeItemByParentId(list, ritem.id);
        } else {
            i++;
        }
    }
}

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

    getItem(id) {
        for (let i = 0; i < this.list.length; i++) {
            const item = this.list[i];
            if (id === item.id) {
                return item;
            }
        }
    }

    removeItem(id) {
        removeItems = new Array();
        removeItemById(this.list, id);
        return removeItems;
    }

}

export default TreeTable;
