import ImageryLayer from './ImageryLayer.js';

class ImageryCollection {
    constructor() {
        this._layers = new Array();
        this._addLayers = new Array();
        this._removeLayers = new Array();

        this._update = true;
    }

    add(layer) {
        this._addLayers.push(layer);
        this._update = true;
        return true;
    }

    get(id) {
        let layer;
        for (let i = 0; i < this._layers.length; i++) {
            layer = this._layers[i];
            if (layer._id === id) {
                break;
            }
        }
        return layer;
    }
}

export default ImageryCollection;
