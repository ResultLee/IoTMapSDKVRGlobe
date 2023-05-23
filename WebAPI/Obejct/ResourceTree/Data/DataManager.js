import defaultValue from '../../../../Source/Core/defaultValue.js';
import defined from '../../../../Source/Core/defined.js';
import DeveloperError from '../../../../Source/Core/DeveloperError.js';
import PrimitiveCollection from '../../../../Source/Scene/PrimitiveCollection.js';
import Type from '../../../Static/Type.js';
import FeatureLayer from '../../Layer/FeatureLayer/FeatureLayer.js';
import GraphicsLayer from '../../Layer/GraphicsLayer/GraphicsLayer.js';
import ImageryCollection from '../../Layer/ImageryLayer/ImageryCollection.js';
import ImageryLayer from '../../Layer/ImageryLayer/ImageryLayer.js';
import ParticleLayer from '../../Layer/ParticleLayer/ParticleLayer.js';
import ModelTilesetLayer from '../../Layer/TilesetLayer/Tileset/ModelTilesetLayer.js';
import TDTilesetLayer from '../../Layer/TilesetLayer/Tileset/TDTilesetLayer.js';
// import LayerCollection from './LayerCollection.js';

class DataManager {
    constructor() {
        this.layers = new PrimitiveCollection();
        this.imageryLayers = new ImageryCollection();
        this.graphicLayer = this.layers.add(new GraphicsLayer());
        this.graphicsLayers = this.layers.add(new PrimitiveCollection());
        this.particleLayers = this.layers.add(new ParticleLayer());
        this.tilesetLayers = this.layers.add(new PrimitiveCollection());
    }

    async addLayer(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        let layer;
        const type = options.type;
        switch (Type.getType(type)) {
            case Type.PARTICLE:
                layer = this.particleLayers.addParticle(type, options);
                break;
            case Type.GEOJSON:
                layer = this.graphicsLayers.add(await GraphicsLayer.fromGeojson(type, options.url, options));
                break;
            case Type.TILESET:
                layer = this.tilesetLayers.add(new TDTilesetLayer(options.url, options));
                break;
            case Type.TILESETMODELBLANK:
                layer = this.tilesetLayers.add(new ModelTilesetLayer(options.url, options));
                break;
            case Type.IMAGERY:
                layer = this.imageryLayers.add(new ImageryLayer(type, options));
                break;
            case Type.GRAPHICS:
                layer = this.graphicLayer.add(type, options);
                break;
            case Type.FEATURE:
                layer = this.imageryLayers.add(new FeatureLayer(options.url, options));
                break;
        }
        return layer;
    }

    getLayer(id) {
        let layer = this.imageryLayers.get(id);
        if (!defined(layer)) {
            layer = this.graphicLayer.getById(id);
        }
        if (!defined(layer)) {
            layer = this.graphicsLayers.getById(id);
        }
        if (!defined(layer)) {
            layer = this.particleLayers.get(id);
        }
        if (!defined(layer)) {
            layer = this.tilesetLayers.getById(id);
        }
        return layer;
    }

    removeLayer(id) {
        // let layer;  
    }

    update(frameState) {
        // console.log("update");
        this.layers.update(frameState);
    }

    prePassesUpdate(frameState) {
        // console.log("prePassesUpdate");
        this.layers.prePassesUpdate(frameState);
    }

    postPassesUpdate(frameState) {
        // console.log("postPassesUpdate");
        this.layers.postPassesUpdate(frameState);
    }
}

export default DataManager;

