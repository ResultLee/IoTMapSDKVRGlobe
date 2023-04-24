import createGuid from '../../../../Source/Core/createGuid.js';
import defaultValue from '../../../../Source/Core/defaultValue.js';
import defined from '../../../../Source/Core/defined.js';
import destroyObject from '../../../../Source/Core/destroyObject.js';
import DeveloperError from '../../../../Source/Core/DeveloperError.js';
import Resource from '../../../../Source/Core/Resource.js';
import Format from '../../../Static/Format.js';
import Type from '../../../Static/Type.js';
import GeoJSON from '../../../Static/Parse/GeoJSON.js';
import AnnotationStyle from '../../../Style/AnnotationStyle.js';
import LineStringStyle from '../../../Style/LineStringStyle/LineStringStyle.js';
import PointStyle from '../../../Style/PointStyle/PointStyle.js';
import AttributeTable from '../../AttributeTable/AttributeTable.js';
import Annotation from '../../Units/Annotation.js';
import GraphicProvider from './Graphics/GraphicProvider.js';
import PolygonStyle from '../../../Style/PolygonStyle/PolygonStyle.js';

class GraphicsLayer {
    constructor(options) {
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

        this._id = createGuid();
        this._name = options.name;
        this._style = options.style;

        this._show = defaultValue(options.show, true);

        // this._attributeTable = new AttributeTable();
        // this._annotations = new Array();



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

            }

            return new GraphicsLayer(Object.assign({
                type: type,
                style: style,
                graphics: graphics,
                format: Format.GEOJSON,
            }, options));
        } catch (error) {
            throw new DeveloperError(error);
        }
    }


    update(frameState) {
        if (!this._show || !defined(this._graphics)) {
            return;
        }

        for (const graphic of this._graphics) {
            let isUseLayerStyle;
            // Graphic渲染前手动设置Layer样式进行渲染
            if (!defined(graphic._style)) {
                isUseLayerStyle = true;
                graphic._style = this._style.clone();
                if (this._style._update) {
                    graphic._update = this._style._update;
                }
            }
            graphic.update(frameState);
            // Graphic渲染后手动还原Graphic样式
            if (isUseLayerStyle) {
                graphic._style = undefined;
            }
        }

        this._style._update = false;
    }

    isDestroyed() {
        return false;
    }

    destroy() {
        destroyObject(this);
    }
}

export default GraphicsLayer;
