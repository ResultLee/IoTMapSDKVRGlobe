/*
 * @Author: SnotlingLiu<snotlingliu@gmail.com/>
 * @Date: 2023-03-08 10:00:09
 * @LastEditors: SnotlingLiu<snotlingliu@gmail.com/>
 * @LastEditTime: 2023-03-08 18:15:48
 * @Description:
 */

import defaultValue from '../../Source/Core/defaultValue.js';
import CesiumWidget from '../../Source/Widgets/CesiumWidget/CesiumWidget.js';
import Project from './Project.js';
import ResourceTree from './ResourceTree.js';

/**
 * VRGlobeSDK三维场景主入口
 */
class Space {
    /**
     * 创建VRGlobeSDK三维场景对象
     * @param {String} container 承载地图的div控件的id
     * @param {Object} [options] 配置地图初始化参数
     */
    constructor(container, options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);
        this.__v = new CesiumWidget(container, options);
        /**
         * 场景工程对象
         * @type {Project}
         */
        this.project = new Project();
        /**
         * 场景资源树对象
         * @type {ResourceTree}
         */
        this.resourceTree = new ResourceTree();
    }

    /**
     * 打开指定URL的工程文件
     * @param {String} url 工程文件的url地址
     */
    openProject(url) {
        this.project.openProject(url);
    }
}

export default Space;
