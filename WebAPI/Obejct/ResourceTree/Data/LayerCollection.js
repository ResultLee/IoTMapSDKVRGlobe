import defaultValue from '../../../../Source/Core/defaultValue.js';
import Type from '../../../Static/Type.js';
import FeatureLayer from '../../Layer/FeatureLayer/FeatureLayer.js';
import GraphicsLayer from '../../Layer/GraphicsLayer/GraphicsLayer.js';
import ImageryLayer from '../../Layer/ImageryLayer/ImageryLayer.js';
import ParticleLayer from '../../Layer/ParticleLayer/ParticleLayer.js';
import ModelTilesetLayer from '../../Layer/TilesetLayer/Tileset/ModelTilesetLayer.js';
import TDTilesetLayer from '../../Layer/TilesetLayer/Tileset/TDTilesetLayer.js';

class LayerCollection {
    constructor() {
        this._layers = new Array();
    }

    addLayer(type, options) {
        let layer;
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);
        switch (Type.getType(type)) {
            case Type.FEATURE:
                layer = new FeatureLayer(options.url, options);
                break;
            case Type.GRAPHICS:
                layer = new GraphicsLayer(options);
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
        }

        return layer;
    }

    update(frameState) {
        this._layers.update(frameState);
    }
}

export default LayerCollection;
