/*
 * @Author: SnotlingLiu<snotlingliu@gmail.com/>
 * @Date: 2023-03-08 10:48:57
 * @LastEditors: SnotlingLiu<snotlingliu@gmail.com/>
 * @LastEditTime: 2023-03-08 10:56:07
 * @Description: 
 */

import defined from '../../Source/Core/defined.js'
import DeveloperError from '../../Source/Core/DeveloperError.js';
import formatXml from '../ThirdParty/jsonxml/formatXml.js';
import JKL from '../ThirdParty/jsonxml/jkl.js';
import XML from '../ThirdParty/jsonxml/xml.js';
import TopoJSON from './Parse/TopoJSON.js';


function wks2json(data) {
    try {
        let xotree = new XML.ObjTree();
        let json = xotree.parseXML(data);
        let dumper = new JKL.Dumper();
        let jsonText = dumper.dump(json, undefined, [
            { keywordProperty: "id", name: "children", isTraverse: true },
            { name: "VRTreeNodes", isTraverse: false },
            { name: "VRStyles", isTraverse: false },
            { name: "tdTilesetClassification", isTraverse: false },
        ]);
        json = JSON.parse(jsonText);
        return json;
    } catch (e) {
        throw new DeveloperError(e);
    }
}

function json2wks(json) {
    try {
        let xotree = new XML.ObjTree();
        //将json字符串转为json对象后转为xml字符串
        let xmlText = xotree.writeXML(json);
        //使用jkl-dumper.js中的formatXml方法将xml字符串格式化
        return formatXml(xmlText);
    } catch (e) {
        throw new DeveloperError(e);
    }
}

// function topojson2img(data, options) {
//     try {
//         return TopoJSON.toIMG()
//     } catch (e) {
//         throw new DeveloperError(e);
//     }
// }

/**
 * 三维场景中支持的格式
 * @namespace
 */
class Format {
    /**
     * JSON格式
     * @type {Number}
     * @constant
     */
    static JSON = 1000;
    /**
     * VRGlobeSDK中工程缓存WKS格式
     * @type {Number}
     * @constant
     */
    static WKS = 1010;

    static TOPOJSON = 1001;

    static IMG = 2001;

    /**
     * 判断三维场景是否支持该格式的数据
     * @param {Format} format 用于判断数据格式的对象
     * @returns {Boolean} 支持为true;反之为false
     */
    static isSupported(format) {
        if (!format) {
            throw new DeveloperError("传入的用于判断数据格式的对象不能为空");
        }
        return defined(
            Object.getOwnPropertyNames(this).find(prop => {
                return this[prop] === format
            })
        );
    }

    /**
     * 把数据从一种格式转化到另一种数据格式
     * @param {Object} data 需要转换格式的数据
     * @param {Format} fromFormat 转换前的格式
     * @param {Format} toFormat 转换后的格式
     * @returns {Object} 转换后的数据
     */
    static convertTo(data, fromFormat, toFormat) {
        switch (fromFormat) {
            case Format.WKS:
                switch (toFormat) {
                    case Format.JSON:
                        return wks2json(data);
                }
                break;
            case Format.JSON:
                switch (toFormat) {
                    case Format.WKS:
                        return json2wks(data);
                }
                break;
            // case Format.TOPOJSON:
            //     switch (toFormat) {
            //         case Format.IMG:
            //             return topojson2img(data);
            //     }
        }
        throw new DeveloperError("不支持转换的格式类型!");
    }
}

export default Format;
