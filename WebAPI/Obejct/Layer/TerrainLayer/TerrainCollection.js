
class TerrainCollection {
    constructor() {
        this._layers = new Array();
        this._addLayers = new Array();
        this._removeLayers = new Array();

        this._update = false;
    }

    add(layer) {
        this._addLayers.push(layer);
        this._update = true;
        return true;
    }

    get(id) {
        for (let i = 0; i < this._layers.length; i++) {
            const layer = this._layers[i];
            if (layer._id === id) {
                return layer;
            }
        }
        return undefined;
    }

    remove(id) {
        for (let i = 0; i < this._layers.length; i++) {
            const layer = this._layers[i];
            if (layer._id === id) {
                this._layers.splice(i, 1);
                this._removeLayers.push(layer);
                this._update = true;
                return layer;
            }
        }
        return false;
    }
}

export default TerrainCollection;
