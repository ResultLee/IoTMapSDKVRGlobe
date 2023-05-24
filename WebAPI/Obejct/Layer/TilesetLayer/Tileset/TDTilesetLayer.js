import defaultValue from '../../../../../Source/Core/defaultValue.js';
import Type from '../../../../Static/Type.js';
import TilesetProvider from '../TilesetProvider.js';

class TDTilesetLayer extends TilesetProvider {
    constructor(url, options) {
        super(url, options);
        this.type = defaultValue(options.type, Type.TILESETMODEL);
    }
}

export default TDTilesetLayer;

