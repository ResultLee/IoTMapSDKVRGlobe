import Cartesian3 from '../../../Source/Core/Cartesian3.js';
import Color from '../../../Source/Core/Color.js';
import ColorGeometryInstanceAttribute from '../../../Source/Core/ColorGeometryInstanceAttribute.js';
import defaultValue from '../../../Source/Core/defaultValue.js';
import DeveloperError from '../../../Source/Core/DeveloperError.js';
import GeometryInstance from '../../../Source/Core/GeometryInstance.js';
import PolygonGeometry from '../../../Source/Core/PolygonGeometry.js';
import PolygonHierarchy from '../../../Source/Core/PolygonHierarchy.js';
import GroundPrimitive from '../../../Source/Scene/GroundPrimitive.js';
import PerInstanceColorAppearance from '../../../Source/Scene/PerInstanceColorAppearance.js';
import Default from '../../Static/Default.js';
import Style from '../../Static/Style.js';

function getStyleByPosition(position) {
    return Default.MEASUREANCHORSTYLE._getStyle(position);
}

class MeasureAreaStyle {
    constructor(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        this._type = Style.MEASUREAREASTYLE;

        this._update = true;
    }

    _getStyle(positions) {
        if (positions.length < 3) {
            throw new DeveloperError('用于创建样式的数据异常!');
        }

        const points = new Array();
        for (let i = 0; i < positions.length; i++) {
            points.push(getStyleByPosition(positions[i].clone()));
        }

        const polygon = new GroundPrimitive({
            appearance: new PerInstanceColorAppearance({
                flat: true,
                faceForward: false
            }),
            geometryInstances: new GeometryInstance({
                geometry: new PolygonGeometry({
                    height: 1000,
                    polygonHierarchy: new PolygonHierarchy(Cartesian3.fromPositions(positions))
                }),
                attributes: {
                    color: ColorGeometryInstanceAttribute.fromColor(Color.RED.withAlpha(0.6))
                }
            })
        });

        return { points, polygon };
    }

    clone() {
        return new MeasureAreaStyle();
    }
}

export default MeasureAreaStyle;
