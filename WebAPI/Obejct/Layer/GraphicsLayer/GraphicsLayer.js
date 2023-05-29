import createGuid from '../../../../Source/Core/createGuid.js';
import defaultValue from '../../../../Source/Core/defaultValue.js';
import defined from '../../../../Source/Core/defined.js';
import destroyObject from '../../../../Source/Core/destroyObject.js';
import DeveloperError from '../../../../Source/Core/DeveloperError.js';
import Resource from '../../../../Source/Core/Resource.js';
import Type from '../../../Static/Type.js';
import GeoJSON from '../../../Static/Parse/GeoJSON.js';
import LineStringStyle from '../../../Style/LineStringStyle/LineStringStyle.js';
import PointStyle from '../../../Style/PointStyle/PointStyle.js';
import GraphicProvider from './Graphics/GraphicProvider.js';
import PolygonStyle from '../../../Style/PolygonStyle/PolygonStyle.js';
import AnnotationStyle from '../../../Style/AnnotationStyle.js';
import AttributeTable from '../../AttributeTable/AttributeTable.js';
import Graphic from './Graphics/Graphic.js';

/**
 * 矢量图层接口,不要直接实例化
 * @abstract
 */
class GraphicsLayer {
    constructor(options) {
        // layer.annotationStyle.mode = VRGlobe.Mode.LABEL;

        // layer.get(0).setAnnotationStyle(new VRGlobe.AnnotationStyle({
        //     mode: VRGlobe.Mode.LABEL
        // }));
        // layer.get(0).annotationStyle.mode = VRGlobe.Mode.LABEL
        // layer.get(0).resetAnnotationStyle();

        options = defaultValue(options, defaultValue.EMPTY_OBJECT);
        this._graphics = new Array();
        if (defined(options.graphics)) {
            for (let i = 0; i < options.graphics.length; i++) {
                const graphic = options.graphics[i];
                if (graphic instanceof GraphicProvider) {
                    this._graphics.push(graphic);
                }
            }
        }

        this._id = defaultValue(options.id, createGuid());
        this._name = options.name;
        this._style = options.style;

        this._show = defaultValue(options.show, true);
        this._attributeTable = defaultValue(options.attributeTable, new AttributeTable());
        this._annotationStyle = defaultValue(options.annotationStyle, new AnnotationStyle());

        this.type = defaultValue(options.type, Type.GRAPHICS);
    }

    get show() {
        return this._show;
    }

    set show(value) {
        this._show = value;
    }

    /**
     * 获取矢量图层的整体标注样式
     */
    get annotationStyle() {
        return this._annotationStyle;
    }

    add(type, options) {
        this._graphics.push(new Graphic(type, options));
    }

    /**
     * 从Geojson数据中读取指定类型的数据用于创建矢量图层
     * @param {Type} type 从Geojson中筛选出的对象类型标识,目前共支持三类：
     * <br> Type.GEOJSONPOINT
     * <br> Type.GEOJSONLINESTRING（Type.GEOJSONMULTILINESTRING）
     * <br> Type.GEOJSONPOLYGON（Type.GEOJSONMULTIPOLYGON）
     * @param {*} url 
     * @param {*} options 
     */
    static async fromGeojson(type, url, options) {
        if (!Type.isGeoJSON(type)) {
            throw new DeveloperError("用于标识解析Geojson对象的值错误!");
        }
        try {
            options = defaultValue(options, defaultValue.EMPTY_OBJECT);
            const geojson = await Resource.fetchJson(url);

            let graphics, style;
            switch (type) {
                case Type.GEOJSONPOINT:
                    style = new PointStyle();
                    graphics = GeoJSON.getPointGraphics(geojson);
                    break;
                case Type.GEOJSONLINESTRING:
                    style = new LineStringStyle();
                    graphics = GeoJSON.getLineStringGraphics(geojson);
                    break;
                case Type.GEOJSONMULTILINESTRING:
                    style = new LineStringStyle();
                    graphics = GeoJSON.getMultiLineStringGraphics(geojson);
                    break;
                case Type.GEOJSONPOLYGON:
                    style = new PolygonStyle();
                    graphics = GeoJSON.getPolygonGraphics(geojson);
                    break;
                case Type.GEOJSONMULTIPOLYGON:
                    style = new PolygonStyle();
                    graphics = GeoJSON.getMultiPolygonGraphics(geojson);
                    break;
            }

            const attributeTable = new AttributeTable();
            for (let i = 0; i < graphics.length; i++) {
                attributeTable.addAttribute(graphics[i]._attribute);
            }

            return new GraphicsLayer(Object.assign({
                type: type,
                style: style,
                graphics: graphics,
                attributeTable: attributeTable,
            }, options));
        } catch (error) {
            throw new DeveloperError(error);
        }
    }

    get(index) {
        return this._graphics[index];
    }

    getById(id) {
        for (let i = 0; i < this._graphics.length; i++) {
            const layer = this._graphics[i];
            if (layer._id === id) {
                return layer;
            }
        }
        return undefined;
    }

    removeById(id) {
        for (let i = 0; i < this._graphics.length; i++) {
            const layer = this._graphics[i];
            if (layer._id === id) {
                this._graphics.splice(i, 1);
                return layer;
            }
        }
    }

    update(frameState) {
        if (!this._show || !defined(this._graphics)) {
            return;
        }

        for (const graphic of this._graphics) {
            let isUseLayerStyle;
            let isUseLayerAnnotationStyle;
            // Graphic渲染前手动设置Layer样式进行渲染
            if (!defined(graphic._style)) {
                isUseLayerStyle = true;
                graphic._style = this._style.clone();
                if (this._style._update) {
                    graphic._update = this._style._update;
                }
            }
            if (!defined(graphic._annotation._style)) {
                isUseLayerAnnotationStyle = true;
                graphic._annotation._style = this._annotationStyle.clone();
            }
            graphic.update(frameState);
            // Graphic渲染后手动还原Graphic样式
            if (isUseLayerStyle) {
                graphic._style = undefined;
            }
            if (isUseLayerAnnotationStyle) {
                graphic._annotation._style = undefined;
            }
        }

        if (defined(this._style) && defined(this._style._update)) {
            this._style._update = false;
        }
        this._annotationStyle._update = false;
    }

    getProjectInfo() {
        const info = new Object();
        if (defined(this._id)) {
            info.id = this._id;
        }
        if (defined(this.type)) {
            info.type = this.type;
        }
        if (defined(this._show)) {
            info.show = this._show;
        }
        if (defined(this._style)) {
            info.style = this._style;
        }
        if (defined(this._attributeTable)) {
            info.attributeTable = this._attributeTable;
        }
        if (defined(this._annotationStyle)) {
            info.annotationStyle = this._annotationStyle;
        }
        if (defined(this._graphics)) {
            info.graphics = this._graphics;
        }
        return info;
    }

    isDestroyed() {
        return false;
    }

    destroy() {
        destroyObject(this);
    }
}

export default GraphicsLayer;
