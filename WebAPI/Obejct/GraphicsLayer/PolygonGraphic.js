import Cartesian3 from '../../../Source/Core/Cartesian3.js';
import ColorGeometryInstanceAttribute from '../../../Source/Core/ColorGeometryInstanceAttribute.js';
import defaultValue from '../../../Source/Core/defaultValue.js';
import GeometryInstance from '../../../Source/Core/GeometryInstance.js';
import PolygonGeometry from '../../../Source/Core/PolygonGeometry.js';
import PolygonHierarchy from '../../../Source/Core/PolygonHierarchy.js';
import PolygonOutlineGeometry from '../../../Source/Core/PolygonOutlineGeometry.js';
import VertexFormat from '../../../Source/Core/VertexFormat.js';
import PerInstanceColorAppearance from '../../../Source/Scene/PerInstanceColorAppearance.js';
import Primitive from '../../../Source/Scene/Primitive.js';
import PrimitiveCollection from '../../../Source/Scene/PrimitiveCollection.js';
import Style from '../../Static/Style.js';
import PolygonStyle from '../../Style/PolygonStyle/PolygonStyle.js';
import { default as PolygonGeometry1 } from '../Geometry/SingleGeometry/PolygonGeometry.js';
import Position3D from '../Units/Position3D.js';
import GraphicProvider from './GraphicProvider.js';

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

class PolygonGraphic extends GraphicProvider {
    constructor(positions, options) {

        options = defaultValue(options, defaultValue.EMPTY_OBJECT);
        const coordinates = new Array();
        for (let i = 0; i < positions.length; i++) {
            coordinates.push(getRing(positions[i]));
        }

        const geometry = new PolygonGeometry1(coordinates, options);
        super(geometry, options);

        this._style = new PolygonStyle();

        this.ready = true;
        this._update = true;
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

    _updateGraphic() {
        switch (this._style._type) {
            case Style.POLYGONSTYLE:
                this._graphic = new PrimitiveCollection();
                addPolygons(this._geometry.positions, this._graphic, this._style);
                break;
        }
    }
}
export default PolygonGraphic;
