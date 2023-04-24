import createGuid from '../../../../../Source/Core/createGuid.js';
import defaultValue from '../../../../../Source/Core/defaultValue.js';
import defined from '../../../../../Source/Core/defined.js';
import DeveloperError from '../../../../../Source/Core/DeveloperError.js';
import GeometryProvider from '../../../Geometry/GeometryProvider.js';

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

        this._id = defaultValue(options.id, createGuid());
        this._show = defaultValue(options.show, true);

    }

    setStyle(style) {
        // PointGraphic
        // setStyle(new VRGlobe.PointStyle({
        //     pixelSize: Math.round(Math.random() * 10),
        //     color: VRGlobe.Color.fromRandom({
        //         alpha: 1.0
        //     })
        // }))

        // LineStringGraphic
        // setStyle(new VRGlobe.LineStringStyle({
        //     color: VRGlobe.Color.fromRandom({
        //         alpha: 1.0
        //     })
        // }))

        // MultiLineStringGraphic
        // setStyle(new VRGlobe.LineStringStyle({
        //     color: VRGlobe.Color.fromRandom({
        //         alpha: 1.0
        //     })
        // }))

        // PolygonGraphic
        // setStyle(new VRGlobe.PolygonStyle({
        //     fillColor: VRGlobe.Color.fromRandom({
        //         alpha: 1.0
        //     })
        // }))

        // MultiPolygonGraphic
        // setStyle(new VRGlobe.PolygonStyle({
        //     fillColor: VRGlobe.Color.fromRandom({
        //         alpha: 1.0
        //     })
        // }))



        this._style = style;
        this._update = true;
    }

    resetStyle() {
        this._style = undefined;
        this._update = true;
    }

    update(frameState) {
        DeveloperError.throwInstantiationError();
    }
}

export default GraphicProvider;
