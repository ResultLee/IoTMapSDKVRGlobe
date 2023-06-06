import Cartesian3 from '../../../Source/Core/Cartesian3.js';
import Check from '../../../Source/Core/Check.js';
import Color from '../../../Source/Core/Color.js';
import ColorGeometryInstanceAttribute from '../../../Source/Core/ColorGeometryInstanceAttribute.js';
import defaultValue from '../../../Source/Core/defaultValue.js';
import DeveloperError from '../../../Source/Core/DeveloperError.js';
import GeometryInstance from '../../../Source/Core/GeometryInstance.js';
import PolygonGeometry from '../../../Source/Core/PolygonGeometry.js';
import PolygonHierarchy from '../../../Source/Core/PolygonHierarchy.js';
import PolygonOutlineGeometry from '../../../Source/Core/PolygonOutlineGeometry.js';
import PerInstanceColorAppearance from '../../../Source/Scene/PerInstanceColorAppearance.js';
import Primitive from '../../../Source/Scene/Primitive.js';
import Style from '../../Static/Style.js';

function createPolygonHierarchy(positions) {
    const holes = new Array();
    const linearRing = Cartesian3.fromPositions(positions[0]);
    for (let i = 1; i < positions.length; i++) {
        holes.push(new PolygonHierarchy(Cartesian3.fromPositions(positions[i])));
    }
    return new PolygonHierarchy(linearRing, holes);
}

class PolygonStyle {
    constructor(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        this._type = Style.POLYGONSTYLE;
        this._fill = defaultValue(options.fill, true);
        this._outline = defaultValue(options.outline, false);
        this._perPositionHeight = defaultValue(options.perPositionHeight, false);
        this._fillColor = Color.clone(defaultValue(options.fillColor, Color.YELLOW));
        this._outlineColor = Color.clone(
            defaultValue(options.outlineColor, Color.RED)
        );
        if (!this._perPositionHeight) {
            this._height = defaultValue(options.height, 100);
        }
        this._update = true;
    }

    /**
     * @param {Boolean} value
     */
    set fill(value) {
        Check.typeOf.bool('fill的类型必须为bool!', value);
        this._fill = value;
        this._update = true;
    }

    /**
     * @param {Number} value
     */
    set height(value) {
        Check.typeOf.number('height的类型必须为Number!', value);
        this._height = value;
        this._update = true;
    }

    /**
     * @param {Boolean} value
     */
    set outline(value) {
        Check.typeOf.bool('outline的类型必须为bool!', value);
        this._outline = value;
        this._update = true;
    }

    /**
     * @param {Color} value
     */
    set fillColor(value) {
        if (!(value instanceof Color)) {
            throw new DeveloperError('请输入正确的颜色对象!');
        }
        this._fillColor = value;
        this._update = true;
    }

    /**
     * @param {Color} value
     */
    set outlineColor(value) {
        if (!(value instanceof Color)) {
            throw new DeveloperError('请输入正确的颜色对象!');
        }
        this._outlineColor = value;
        this._update = true;
    }

    /**
     * @param {Boolean} value
     */
    set perPositionHeight(value) {
        Check.typeOf.bool('perPositionHeight的类型必须为bool!', value);
        this._perPositionHeight = value;
        this._update = true;
    }

    _getStyle(positions, id) {
        const that = this;
        const appearance = new PerInstanceColorAppearance({
            flat: true,
            faceForward: false
        });
        const polygonHierarchy = createPolygonHierarchy(positions);
        const fillStyle = this._fill ? new Primitive({
            id: id,
            asynchronous: false,
            appearance: appearance,
            geometryInstances: new GeometryInstance({
                geometry: new PolygonGeometry({
                    height: that._height,
                    polygonHierarchy: polygonHierarchy,
                    perPositionHeight: that._perPositionHeight
                }),
                attributes: {
                    color: ColorGeometryInstanceAttribute.fromColor(that._fillColor)
                }
            })
        }) : undefined;

        const outlineStyle = this._outline ? new Primitive({
            id: id,
            asynchronous: false,
            appearance: appearance,
            geometryInstances: new GeometryInstance({
                geometry: new PolygonOutlineGeometry({
                    height: that._height,
                    polygonHierarchy: polygonHierarchy,
                    perPositionHeight: that._perPositionHeight
                }),
                attributes: {
                    color: ColorGeometryInstanceAttribute.fromColor(that._outlineColor)
                }
            })
        }) : undefined;

        return { fillStyle, outlineStyle };
    }

    clone() {
        return new PolygonStyle({
            fill: this._fill,
            height: this._height,
            outline: this._outline,
            fillColor: this._fillColor,
            outlineColor: this._outlineColor,
            perPositionHeight: this._perPositionHeight
        });
    }
}

export default PolygonStyle;
