/*
 * @Author: SnotlingLiu<snotlingliu@gmail.com/>
 * @Date: 2023-03-08 10:27:15
 * @LastEditors: SnotlingLiu<snotlingliu@gmail.com/>
 * @LastEditTime: 2023-03-08 10:28:13
 * @Description:
 */

import Check from '../../Source/Core/Check';
import DeveloperError from '../../Source/Core/DeveloperError';
import Format from '../Static/Format.js';
import Loader from '../Static/Loader.js';

class Project {
    /**
     * 场景工程对象
     * @protected
     */
    constructor() {
        /**
         * 工程名称
         * @name name
         * @type {String}
         */
        this.name = '';
        /**
         * 工程描述信息
         * @name description
         * @type {String}
         */
        this.description = '';
        this.styles = new Array();
        this.treeNodes = new Array();
    }

    /**
     * 打开WKS工程文件
     * @param {String} url WKS工程文件地址
     */
    openProject(url) {
        Check.typeOf.string('WKS工程文件地址', url);
        Loader.loadJson(url, Format.WKS).then(data => {
            this.info = data;
            // TODO: 根据WKS中保存的节点数据依次向场景中添加图层
        });
    }

    // TODO: 添加保存场景信息到工程文件方法
    saveProject() {

    }

    /**
     * 将场景工程信息导出为WKS文件
     */
    exportProject() {
        // TODO: 使用保存的场景信息替换固定的对象
        if (!this.info) {
            throw new DeveloperError('请先添加场景信息!');
        }
        const xml = Loader.parseJsonTo(this.info, Format.WKS);
        this.xml = xml;
        const blob = new Blob([xml], {
            type: 'text/xml;charset=utf-8'
        });
        const objectURL = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = objectURL;
        anchor.download = 'Project.wks';
        anchor.click();
        URL.revokeObjectURL(objectURL);
        console.log(xml);
    }
}

export default Project;
