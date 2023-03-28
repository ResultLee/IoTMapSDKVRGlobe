import Cartesian2 from '../../../Source/Core/Cartesian2.js';
import Cartesian3 from '../../../Source/Core/Cartesian3.js';
import ColorGeometryInstanceAttribute from '../../../Source/Core/ColorGeometryInstanceAttribute.js';
import defaultValue from '../../../Source/Core/defaultValue.js';
import defined from '../../../Source/Core/defined.js';
import DeveloperError from '../../../Source/Core/DeveloperError.js';
import GeometryInstance from '../../../Source/Core/GeometryInstance.js';
import PolygonGeometry from '../../../Source/Core/PolygonGeometry.js';
import PolygonHierarchy from '../../../Source/Core/PolygonHierarchy.js';
import PolygonOutlineGeometry from '../../../Source/Core/PolygonOutlineGeometry.js';
import VertexFormat from '../../../Source/Core/VertexFormat.js';
import BillboardCollection from '../../../Source/Scene/BillboardCollection.js';
import LabelCollection from '../../../Source/Scene/LabelCollection.js';
import PerInstanceColorAppearance from '../../../Source/Scene/PerInstanceColorAppearance.js';
import Primitive from '../../../Source/Scene/Primitive.js';
import PrimitiveCollection from '../../../Source/Scene/PrimitiveCollection.js';
import Mode from '../../Static/Mode.js';
import Style from '../../Static/Style.js';
import AnnotationStyle from '../../Style/AnnotationStyle.js';
import PolygonStyle from '../../Style/PolygonStyle/PolygonStyle.js';
import { default as PolygonGeometry1 } from '../Geometry/SingleGeometry/PolygonGeometry.js';
import Annotation from '../Units/Annotation.js';
import Position3D from '../Units/Position3D.js';

function getRing(positions) {
    const coordinates = new Array();
    for (let i = 0; i < positions.length; i++) {
        coordinates.push(positions[i].toCoordinates());
    }
    return coordinates;
}

function createPolygonHierarchy(points) {
    const holes = new Array();
    const positions = Cartesian3.fromPositions(points[0]);
    for (let i = 1; i < points.length; i++) {
        holes.push(new PolygonHierarchy(Cartesian3.fromPositions(points[i])));
    }
    return new PolygonHierarchy(positions, holes);
}

function addPolygons(positions, collection, style) {
    style = style.getStyle();
    const fillColor = ColorGeometryInstanceAttribute.fromColor(style.fillColor);
    const outlineColor = ColorGeometryInstanceAttribute.fromColor(style.outlineColor);
    const appearance = new PerInstanceColorAppearance();

    const polygonHierarchy = createPolygonHierarchy(positions);

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

function addAnnotation(annotation, collection, style) {
    const labelCollection = collection.get(0);
    labelCollection.removeAll();

    const billboardCollection = collection.get(1);
    billboardCollection.removeAll();

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

class PolygonGraphic {
    constructor(positions, options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        if (!defined(positions)) {
            throw new DeveloperError('用于创建PolygonGraphic的position值不能为空!');
        }

        const coordinates = new Array();
        for (let i = 0; i < positions.length; i++) {
            coordinates.push(getRing(positions[i]));
        }

        this._style = new PolygonStyle();
        this._geometry = new PolygonGeometry1(coordinates, options);

        this._annotation = new Annotation({
            position: this._geometry.center
        });

        this._annotationStyle = new AnnotationStyle();

        this._collection = new PrimitiveCollection({
            show: defaultValue(options.show, true)
        });

        this._collection.add(new LabelCollection());
        this._collection.add(new BillboardCollection());

        this.ready = true;
        this._update = true;
    }

    get style() {
        return this._style;
    }

    static getRing(positions) {
        const coordinates = new Array();
        for (let i = 0; i < positions.length; i++) {
            coordinates.push(positions[i].toCoordinates());
        }
        return coordinates;
    }

    static getPosition(coordinates) {
        const positions = new Array();
        for (let i = 0; i < coordinates.length; i++) {
            positions.push(Position3D.fromCoordinates(coordinates[i]));
        }
        return positions;
    }

    update(frameState) {
        if (!this.ready) {
            return;
        }

        if (this._update || (this._style && this._style._update)) {
            switch (this._style._type) {
                case Style.POLYGONSTYLE:
                    this._graphic = new PrimitiveCollection();
                    addPolygons(this._geometry.positions, this._graphic, this._style);
                    break;
            }

            this._style._update = false;
        }

        if (this._update || (this._annotationStyle && this._annotationStyle) && this._collection) {
            addAnnotation(this._annotation, this._collection, this._annotationStyle);
        }

        if (defined(this._graphic)) {
            this._graphic.update(frameState);
        }

        if (defined(this._collection)) {
            this._collection.update(frameState);
        }
        this._update = false;
    }

}
export default PolygonGraphic;
