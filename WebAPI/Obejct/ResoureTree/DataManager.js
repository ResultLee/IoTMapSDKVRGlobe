/*
 * @Author: SnotlingLiu<snotlingliu@gmail.com/>
 * @Date: 2023-03-08 10:48:57
 * @LastEditors: SnotlingLiu<snotlingliu@gmail.com/>
 * @LastEditTime: 2023-03-08 10:56:07
 * @Description:
 */

import ImageryLayerCollection from '../Layer/ImageryLayer/ImageryLayerCollection.js';

/**
 * 资源树数据管理对象
 */
class DataManager {
    /**
     * 资源树数据管理对象
     * @protected
     * @constructor
     */
    constructor() {
        this._imageryLayers = new ImageryLayerCollection();
    }
}

export default DataManager;
