import LayerCollection from './LayerCollection.js';

class DataManager {
    constructor() {
        this.layers = new LayerCollection();
    }

    addLayer(type, options) {
        this.layers.addLayer(type, options);
    }

    update(frameState) {
        this.layers.update(frameState);
    }
}

export default DataManager;

