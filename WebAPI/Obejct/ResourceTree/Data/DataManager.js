import defaultValue from '../../../../Source/Core/defaultValue.js';
import defined from '../../../../Source/Core/defined.js';
import PrimitiveCollection from '../../../../Source/Scene/PrimitiveCollection.js';
import Type from '../../../Static/Type.js';
import FeatureLayer from '../../Layer/FeatureLayer/FeatureLayer.js';
import GraphicsLayer from '../../Layer/GraphicsLayer/GraphicsLayer.js';
import ImageryCollection from '../../Layer/ImageryLayer/ImageryCollection.js';
import ImageryLayer from '../../Layer/ImageryLayer/ImageryLayer.js';
import ParticleLayer from '../../Layer/ParticleLayer/ParticleLayer.js';
import TerrainCollection from '../../Layer/TerrainLayer/TerrainCollection.js';
import TerrainLayer from '../../Layer/TerrainLayer/TerrainLayer.js';
import ModelTilesetLayer from '../../Layer/TilesetLayer/Tileset/ModelTilesetLayer.js';
import TDTilesetLayer from '../../Layer/TilesetLayer/Tileset/TDTilesetLayer.js';

class DataManager {
    constructor() {
        this.imageryLayers = new ImageryCollection();
        this.terrainLayers = new TerrainCollection();

        this.layers = new PrimitiveCollection();
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
            case Type.TERRAIN:
                layer = this.terrainLayers.add(new TerrainLayer(type, options));
                break;
        }
        return layer;
    }

    getLayer(id) {
        let layer = this.imageryLayers.get(id);
        if (!defined(layer)) {
            layer = this.terrainLayers.get(id);
        }
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
        let layer = this.getLayer(id);
        if (!defined(layer)) {
            return false;
        }

        switch (Type.getType(layer.type)) {
            case Type.IMAGERY:
            case Type.FEATURE:
                return this.imageryLayers.remove(id);
            case Type.PARTICLE:
                return this.particleLayers.removeById(id);
            case Type.GEOJSON:
                return this.graphicsLayers.removeById(id);
            case Type.TILESET:
            case Type.TILESETMODELBLANK:
                return this.tilesetLayers.removeById(id);
            case Type.GRAPHICS:
                return this.graphicLayer.removeById(id);
            case Type.TERRAIN:
                return this.terrainLayers.remove(id);
        }
        return layer;
    }

    update(frameState) {
        this.layers.update(frameState);
    }

    prePassesUpdate(frameState) {
        this.layers.prePassesUpdate(frameState);
    }

    postPassesUpdate(frameState) {
        this.layers.postPassesUpdate(frameState);
    }
}

export default DataManager;

