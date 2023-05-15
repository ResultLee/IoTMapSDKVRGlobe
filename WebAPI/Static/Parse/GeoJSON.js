import createGuid from '../../../Source/Core/createGuid.js';
import defined from '../../../Source/Core/defined.js';
import DeveloperError from '../../../Source/Core/DeveloperError.js';
import RuntimeError from '../../../Source/Core/RuntimeError.js';
import Graphic from '../../Obejct/Layer/GraphicsLayer/Graphics/Graphic.js';
import Type from '../Type.js';

function parseFeaturesToGraphics(type, features) {
    const graphics = new Array();
    for (let i = 0; i < features.length; i++) {
        const feature = features[i];
        if (feature.type !== 'Feature') {
            throw new RuntimeError(`跳过错误数据${feature}`);
        }
        if (type !== Type[`Graphics${feature.geometry.type}`.toLocaleUpperCase()]) {
            continue;
        }
        feature.id = createGuid();
        graphics.push(Graphic.fromGeoJSON(type, feature));
    }
    return graphics;
}

function getGraphics(type, geojson) {
    if (!defined(geojson)) {
        throw new DeveloperError('Geojson的值不能为空!');
    }

    if (!defined(geojson.type)) {
        throw new DeveloperError('Geojson数据的type值不能为空!');
    }

    if (!defined(geojson.features)) {
        throw new DeveloperError('Geojson数据的features值不能为空!');
    }

    return parseFeaturesToGraphics(type, geojson.features);
}

class GeoJSON {
    static getPointGraphics(geojson) {
        return getGraphics(Type.GRAPHICSPOINT, geojson);

    }

    static getLineStringGraphics(geojson) {
        return getGraphics(Type.GRAPHICSLINESTRING, geojson);
    }

    static getMultiLineStringGraphics(geojson) {
        return getGraphics(Type.GRAPHICSMULTILINESTRING, geojson);
    }

    static getPolygonGraphics(geojson) {
        return getGraphics(Type.GRAPHICSPOLYGON, geojson);
    }

    static getMultiPolygonGraphics(geojson) {
        return getGraphics(Type.GRAPHICSMULTIPOLYGON, geojson);
    }
}

export default GeoJSON;
