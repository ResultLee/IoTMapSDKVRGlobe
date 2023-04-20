

import Check from "../../Source/Core/Check.js";
import DeveloperError from "../../Source/Core/DeveloperError.js";
import Resource from "../../Source/Core/Resource.js"
import Format from "./Format.js";

function loadData(url) {
    return Resource
        .fetch({ url })
        .catch(error => {
            throw new DeveloperError(error);
        });
}

function loadJson(url) {
    return Resource
        .fetchJson({ url })
        .catch(error => {
            throw new DeveloperError(error);
        });
}

/**
 * 场景对象加载静态方法
 * @namespace
 */
class Loader {

    /**
     * 数据加载
     * @async
     * @param {String} url 需要加载的数据的url地址
     * @returns {Promise} 请求数据的Promise
     */
    static async loadData(url) {
        Check.typeOf.string('加载数据的URL地址为空!', url);
        return await loadData(url);
    }

    /**
     * 以Json格式加载数据
     * @async
     * @param {String} url 需要加载的数据的url地址
     * @returns {Promise} 请求数据的Promise
     */
    static async loadJson(url) {
        Check.typeOf.string('加载数据的URL地址为空!', url);
        // switch (format) {
        //     case Format.WKS:
        //         return data = this.parseJsonFrom(data, Format.WKS);
        //     case Format.TOPOJSON:
        //         return data = Parse.TopoJson(url);
        // }
        // return JSON.parse(data);
        return await loadJson(url);
    }

    /**
     * 解析Json数据到新格式
     * @async
     * @param {JSON} data 待解析的数据
     * @param {Format} format 解析后的数据格式 
     * @returns {Object} 解析后的数据
     */
    static parseJsonTo(data, format) {
        if (!Format.isSupported(format)) {
            throw new DeveloperError("不支持解析的格式类型!");
        }
        switch (format) {
            case Format.WKS:
                return Format.convertTo(data, Format.JSON, Format.WKS);
        }
    }

    /**
     * 将指定数据解析为Json数据
     * @param {JSON} data 待解析的数据
     * @param {Format} format 指定数据的格式  
     * @returns {JSON} 解析后的数据
     */
    static parseJsonFrom(data, format) {
        if (!Format.isSupported(format)) {
            throw new DeveloperError("不支持解析的格式类型!");
        }
        switch (format) {
            case Format.WKS:
                return Format.convertTo(data, Format.WKS, Format.JSON);
        }
    }

}

export default Loader;
