import createGuid from '../../../../../Source/Core/createGuid.js';
import defaultValue from '../../../../../Source/Core/defaultValue.js';
import defined from '../../../../../Source/Core/defined.js';
import DeveloperError from '../../../../../Source/Core/DeveloperError.js';
import GeometryProvider from '../../../Geometry/GeometryProvider.js';
import Annotation from '../../../Units/Annotation.js';

class GraphicProvider {
    constructor(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        if (!defined(options.geometry)) {
            throw new DeveloperError('用于创建Graphic的geometry的值不能为空!');
        }

        if (
            defined(options.geometry) && !(options.geometry instanceof GeometryProvider)
        ) {
            throw new DeveloperError('用于创建Graphic的geometry的值类型错误!');
        }

        this._name = options.name;
        this._style = options.style;
        this._geometry = options.geometry;
        this._attribute = options.attribute;

        this._id = defaultValue(options.id, createGuid());
        this._show = defaultValue(options.show, true);
        this._annotation = defaultValue(options.annotation, new Annotation({
            id: options.id,
            style: options.annotationStyle,
            position: this._geometry.center
        }));

    }

    get show() {
        return this._show;
    }

    set show(value) {
        this._show = value;
    }

    get annotationStyle() {
        return this._annotation._style;
    }

    setStyle(style) {
        // PointGraphic
        // graphic.setStyle(new VRGlobe.PointStyle({
        //     pixelSize: Math.round(Math.random() * 10),
        //     color: VRGlobe.Color.fromRandom({
        //         alpha: 1.0
        //     })
        // }))

        // LineStringGraphic
        // graphic.setStyle(new VRGlobe.LineStringStyle({
        //     color: VRGlobe.Color.fromRandom({
        //         alpha: 1.0
        //     })
        // }))

        // MultiLineStringGraphic
        // graphic.setStyle(new VRGlobe.LineStringStyle({
        //     color: VRGlobe.Color.fromRandom({
        //         alpha: 1.0
        //     })
        // }))

        // PolygonGraphic
        // graphic.setStyle(new VRGlobe.PolygonStyle({
        //     fillColor: VRGlobe.Color.fromRandom({
        //         alpha: 1.0
        //     })
        // }))

        // MultiPolygonGraphic
        // graphic.setStyle(new VRGlobe.PolygonStyle({
        //     fillColor: VRGlobe.Color.fromRandom({
        //         alpha: 1.0
        //     })
        // }))
        this._style = style;
        this._update = true;
    }

    resetStyle() {
        // graphic.resetStyle();
        this._style = undefined;
        this._update = true;
    }

    setAnnotationStyle(annotationStyle) {
        // graphic.setAnnotationStyle(new VRGlobe.AnnotationStyle({
        //     mode: VRGlobe.Mode.LABEL
        // }));
        this._annotation._style = annotationStyle;
        this._annotation._style._update = true;
    }

    resetAnnotationStyle() {
        // graphic.resetAnnotationStyle
        this._annotation._style = undefined;
        this._annotation._style._update = true;
    }

    _updateAnnotation() {
        throw DeveloperError.throwInstantiationError();
    }

    _updateGraphic() {
        throw DeveloperError.throwInstantiationError();
    }

    update(frameState) {
        if (!this._show || !defined(this._style)) {
            return;
        }

        if (this._update && this._style) {
            this._updateGraphic();
            this._update = false;
        }

        if (defined(this._graphic)) {
            this._graphic.update(frameState);
        }

        if (defined(this._annotation)) {
            this._annotation.update(frameState);
        }
    }
}

export default GraphicProvider;
