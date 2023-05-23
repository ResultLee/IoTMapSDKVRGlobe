import defaultValue from '../../../../Source/Core/defaultValue.js';
import defined from '../../../../Source/Core/defined.js';
import DeveloperError from '../../../../Source/Core/DeveloperError.js';
import PrimitiveCollection from '../../../../Source/Scene/PrimitiveCollection.js';
import Type from '../../../Static/Type.js';
import FeatureLayer from '../../Layer/FeatureLayer/FeatureLayer.js';
import GraphicsLayer from '../../Layer/GraphicsLayer/GraphicsLayer.js';
import ImageryLayer from '../../Layer/ImageryLayer/ImageryLayer.js';
import ParticleLayer from '../../Layer/ParticleLayer/ParticleLayer.js';
import ModelTilesetLayer from '../../Layer/TilesetLayer/Tileset/ModelTilesetLayer.js';
import TDTilesetLayer from '../../Layer/TilesetLayer/Tileset/TDTilesetLayer.js';

class LayerCollection {
    constructor() {
        this._layers = new PrimitiveCollection();
    }

    async addLayer(options) {
        if (!defined(options)) {
            throw new DeveloperError('创建图层所需参数不能为空!');
        }

        if (!defined(options.type)) {
            return;
        }

        let layer;
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);
        const type = options.type;

        // switch (type) {
        //     case Type.GEOJSONPOINT:
        //     case Type.GEOJSONLINESTRING:
        //     case Type.GEOJSONMULTILINESTRING:
        //     case Type.GEOJSONPOLYGON:
        //     case Type.GEOJSONMULTIPOLYGON:
        //         layer = await GraphicsLayer.fromGeojson(type, options.url, options);
        //         break;
        // }

        switch (Type.getType(type)) {
            case Type.FEATURE:
                layer = new FeatureLayer(options.url, options);
                break;
            // case Type.GRAPHICS:
            //     layer = new GraphicsLayer(options);
            //     break;
            case Type.GEOJSON:
                layer = await GraphicsLayer.fromGeojson(type, options.url, options);
                break;
            case Type.IMAGERY:
                layer = new ImageryLayer(type, options);
                break;
            case Type.PARTICLE:
                layer = new ParticleLayer();
                break;
            case Type.TILESET:
                layer = new TDTilesetLayer(options.url, options);
                break;
            case Type.TILESETMODELBLANK:
                layer = new ModelTilesetLayer(options.url, options);
                break;
            default:
                throw new DeveloperError("不支持得图层类型");
        }

        if (defined(layer)) {
            return this._layers.add(layer);
        }
        return layer;
    }

    update(frameState) {
        this._layers.update(frameState);
    }

    prePassesUpdate(frameState) {
        this._layers.prePassesUpdate(frameState);
    }

    postPassesUpdate(frameState) {
        this._layers.postPassesUpdate(frameState);
    }
}

export default LayerCollection;
