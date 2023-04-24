import Cartesian2 from '../../../Source/Core/Cartesian2.js';
import Cartesian3 from '../../../Source/Core/Cartesian3.js';
import Check from '../../../Source/Core/Check.js';
import ColorGeometryInstanceAttribute from '../../../Source/Core/ColorGeometryInstanceAttribute.js';
import createGuid from '../../../Source/Core/createGuid.js';
import defaultValue from '../../../Source/Core/defaultValue.js';
import defined from '../../../Source/Core/defined.js';
import destroyObject from '../../../Source/Core/destroyObject.js';
import DeveloperError from '../../../Source/Core/DeveloperError.js';
import GeometryInstance from '../../../Source/Core/GeometryInstance.js';
import PolygonGeometry from '../../../Source/Core/PolygonGeometry.js';
import PolygonHierarchy from '../../../Source/Core/PolygonHierarchy.js';
import PolygonOutlineGeometry from '../../../Source/Core/PolygonOutlineGeometry.js';
import VertexFormat from '../../../Source/Core/VertexFormat.js';
import BillboardCollection from '../../../Source/Scene/BillboardCollection.js';
import LabelCollection from '../../../Source/Scene/LabelCollection.js';
import Material from '../../../Source/Scene/Material.js';
import PerInstanceColorAppearance from '../../../Source/Scene/PerInstanceColorAppearance.js';
import PointPrimitiveCollection from '../../../Source/Scene/PointPrimitiveCollection.js';
import PolylineCollection from '../../../Source/Scene/PolylineCollection.js';
import Primitive from '../../../Source/Scene/Primitive.js';
import PrimitiveCollection from '../../../Source/Scene/PrimitiveCollection.js';
import Mode from '../../Static/Mode.js';
import Type from '../../Static/Type.js';
import AnnotationStyle from '../../Style/AnnotationStyle.js';
import LineStringStyle from '../../Style/LineStringStyle/LineStringStyle.js';
import PointStyle from '../../Style/PointStyle/PointStyle.js';
import PolygonStyle from '../../Style/PolygonStyle/PolygonStyle.js';
import AttributeTable from '../AttributeTable/AttributeTable.js';
import MultiLineStringGeometry from '../Geometry/MultiGeometry/MultiLineStringGeometry.js';
import MultiPolygonGeometry from '../Geometry/MultiGeometry/MultiPolygonGeometry.js';
import SingleLineStringGeometry from '../Geometry/SingleGeometry/SingleLineStringGeometry.js';
import { default as PolygonGeometry1 } from '../Geometry/SingleGeometry/PolygonGeometry.js';
import Annotation from '../Units/Annotation.js';
import Feature from './Feature.js';

function addPoints(features, collection, style) {
    features.forEach(feature => {
        collection.add(Object.assign({
            position: new Cartesian3.fromPosition(feature._geometry._position)
        }, style.getStyle()));
    });
    return true;
}

function addPolylines(features, collection, style) {
    style = style.getStyle();
    const material = Material.fromType('PolylineOutline');

    material.uniforms.color = style.color;
    material.uniforms.outlineColor = style.outlineColor;
    material.uniforms.outlineWidth = style.outlineWidth;

    features.forEach(feature => {
        if (feature._geometry instanceof MultiLineStringGeometry) {
            feature._geometry.positions.forEach(position => {
                collection.add({
                    loop: style.loop,
                    width: style.width,
                    material: material,
                    positions: Cartesian3.fromPositions(position)
                });
            });
        } else if (feature._geometry instanceof SingleLineStringGeometry) {
            collection.add(Object.assign({
                loop: style.loop,
                width: style.width,
                material: material,
                positions: Cartesian3.fromPositions(feature._geometry.positions)
            }, style));
        }
    });
    return true;
}

function createPolygonHierarchy(points) {
    const holes = new Array();
    const positions = Cartesian3.fromPositions(points[0]);
    for (let i = 1; i < points.length; i++) {
        holes.push(new PolygonHierarchy(Cartesian3.fromPositions(points[i])));
    }
    return new PolygonHierarchy(positions, holes);
}

function addPolygons(features, collection, style) {
    style = style.getStyle();
    const fillColor = ColorGeometryInstanceAttribute.fromColor(style.fillColor);
    const outlineColor = ColorGeometryInstanceAttribute.fromColor(style.outlineColor);
    const appearance = new PerInstanceColorAppearance();

    features.forEach(feature => {
        if (feature._geometry instanceof MultiPolygonGeometry) {
            const instances = new Array();
            const outInstances = new Array();

            feature._geometry.positions.forEach(position => {
                const polygonHierarchy = createPolygonHierarchy(position);

                if (style.fill) {
                    instances.push(new GeometryInstance({
                        geometry: PolygonGeometry.createGeometry(new PolygonGeometry({
                            height: style.height,
                            polygonHierarchy: polygonHierarchy,
                            perPositionHeight: style.perPositionHeight,
                            vertexFormat: VertexFormat.POSITION_AND_COLOR
                        })),
                        attributes: {
                            color: fillColor
                        }
                    }));
                }

                if (style.outline) {
                    outInstances.push(new GeometryInstance({
                        geometry: PolygonOutlineGeometry.createGeometry(new PolygonOutlineGeometry({
                            height: style.height,
                            polygonHierarchy: polygonHierarchy,
                            perPositionHeight: style.perPositionHeight,
                            vertexFormat: VertexFormat.POSITION_AND_COLOR
                        })),
                        attributes: {
                            color: outlineColor
                        }
                    }));
                }
            });

            if (style.fill) {
                collection.add(new Primitive({
                    geometryInstances: instances,
                    appearance: appearance
                }));
            }

            if (style.outline) {
                collection.add(new Primitive({
                    geometryInstances: outInstances,
                    appearance: appearance
                }));
            }
        } else if (feature._geometry instanceof PolygonGeometry1) {
            // TODO: 验证加载PolygonGeometry类型的Geojson数据
            const polygonHierarchy = createPolygonHierarchy(feature._geometry.positions);

            if (style.fill) {
                collection.add(new Primitive({
                    geometryInstances: new GeometryInstance({
                        geometry: PolygonGeometry.createGeometry(new PolygonGeometry({
                            height: style.height,
                            polygonHierarchy: polygonHierarchy,
                            perPositionHeight: style.perPositionHeight,
                            vertexFormat: VertexFormat.POSITION_AND_COLOR
                        })),
                        attributes: {
                            color: fillColor
                        }
                    }),
                    appearance: appearance
                }));
            }

            if (style.outline) {
                collection.add(new Primitive({
                    geometryInstances: new GeometryInstance({
                        geometry: PolygonOutlineGeometry.createGeometry(new PolygonOutlineGeometry({
                            height: style.height,
                            polygonHierarchy: polygonHierarchy,
                            perPositionHeight: style.perPositionHeight,
                            vertexFormat: VertexFormat.POSITION_AND_COLOR
                        })),
                        attributes: {
                            color: outlineColor
                        }
                    }),
                    appearance: appearance
                }));
            }
        }
    });

}

function addLabel(annotation, collection, style) {
    const label = Object.assign({
        position: Cartesian3.fromPosition(annotation._position)
    }, style);
    collection.add(label);
}

function addBillboard(annotation, collection, style) {
    const billboard = Object.assign({
        pixelOffset: new Cartesian2(10, 0),
        position: Cartesian3.fromPosition(annotation._position)
    }, style);
    collection.add(billboard);
}

function addAnnotation(annotations, collection, style) {
    const labelCollection = collection.get(1);
    labelCollection.removeAll();

    const billboardCollection = collection.get(2);
    billboardCollection.removeAll();

    for (let i = 0; i < annotations.length; i++) {
        const annotation = annotations[i];
        switch (style.mode) {
            case Mode.LABEL:
                addLabel(annotation, labelCollection, style.getLabelStyle());
                break;
            case Mode.BILLBOARD:
                addBillboard(annotation, billboardCollection, style.getBillboardStyle());
                break;
            case Mode.BOTH:
                addLabel(annotation, labelCollection, style.getLabelStyle());
                addBillboard(annotation, billboardCollection, style.getBillboardStyle());
                break;
        }
    }
}

class FeatureLayer {
    // var featureLayer = new VRGlobe.FeatureLayer(VRGlobe.Type.POINT, pointGeojson);
    // var featureLayer = new VRGlobe.FeatureLayer(VRGlobe.Type.MULTILINESTRING, lineStringGeojson);
    // var featureLayer = new VRGlobe.FeatureLayer(VRGlobe.Type.MULTIPOLYGON, polygonGeojson);

    // featureLayer._annotationStyle.mode = VRGlobe.Mode.BOTH;
    // featureLayer._annotationStyle.mode = VRGlobe.Mode.NONE;
    // featureLayer._annotationStyle.mode = VRGlobe.Mode.LABEL;
    // featureLayer._annotationStyle.mode = VRGlobe.Mode.BILLBOARD;

    constructor(type, options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        if (!defined(type)) {
            throw new DeveloperError('创建FeatureLayer的type的值不能为空!');
        }

        this._id = createGuid();
        this._type = type;
        this._name = options.name;
        // TODO: 对Style的类型做判断
        this._style = options.style;
        this._features = new Array();
        this._attributeTable = new AttributeTable();

        this._annotations = new Array();
        this._annotationStyle = new AnnotationStyle();

        for (let i = 0; i < options.features.length; i++) {
            const feature = new Feature(type, options.features[i]);
            this._features.push(feature);
            this._attributeTable.addAttribute(feature._attribute);
            this._annotations.push(new Annotation({
                fid: feature._id,
                position: feature._geometry.center
            }));
        }

        this._collection = new PrimitiveCollection({
            show: defaultValue(options.show, true)
        });

        this._update = true;
        this.ready = true;
    }

    get show() {
        return this._collection.show;
    }

    get style() {
        return this._style;
    }

    /**
     * @param {Boolean} value
     */
    set show(value) {
        Check.typeOf.bool('show的类型必须为bool!', value);
        this._collection.show = value;
    }

    update(frameState) {
        if (!this.ready) {
            return;
        }

        if (this._update || (this._style && this._style._update)) {
            this._collection.removeAll();

            let featureCollection;
            switch (this._type) {
                case Type.POINT:
                    featureCollection = new PointPrimitiveCollection();
                    this._style = defaultValue(this._style, new PointStyle());
                    addPoints(this._features, featureCollection, this._style);
                    break;
                case Type.LINESTRING:
                case Type.MULTILINESTRING:
                    featureCollection = new PolylineCollection();
                    this._style = defaultValue(this._style, new LineStringStyle());
                    addPolylines(this._features, featureCollection, this._style);
                    break;
                case Type.POLYGON:
                case Type.MULTIPOLYGON:
                    featureCollection = new PrimitiveCollection();
                    this._style = defaultValue(this._style, new PolygonStyle());
                    addPolygons(this._features, featureCollection, this._style);
                    break;
            }
            this._collection.add(featureCollection);
            this._collection.add(new LabelCollection());
            this._collection.add(new BillboardCollection());

            this._style._update = false;
        }

        // TODO: 新增对标注样式的动态调整
        if (this._update || (this._annotationStyle && this._annotationStyle._update)) {
            addAnnotation(this._annotations, this._collection, this._annotationStyle);
        }

        this._update = false;
        this._collection.update(frameState);
    }

    isDestroyed() {
        return false;
    }

    destroy() {
        destroyObject(this);
    }
}

export default FeatureLayer;
