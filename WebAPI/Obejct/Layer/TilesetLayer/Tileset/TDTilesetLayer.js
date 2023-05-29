import defaultValue from '../../../../../Source/Core/defaultValue.js';
import defined from '../../../../../Source/Core/defined.js';
import Type from '../../../../Static/Type.js';
import TilesetProvider from '../TilesetProvider.js';

class TDTilesetLayer extends TilesetProvider {
    constructor(url, options) {
        super(url, options);
        this.type = defaultValue(options.type, Type.TILESETMODEL);
    }

    getProjectInfo() {
        const info = new Object();
        if (defined(this._id)) {
            info.id = this._id;
        }
        if (defined(this._name)) {
            info.name = this.name;
        }
        if (defined(this._scale)) {
            info.scale = this._scale;
        }
        if (defined(this._show)) {
            info.show = this._show;
        }
        if (defined(this.color)) {
            info.color = this.color;
        }
        if (defined(this.height)) {
            info.height = this.height;
        }
        if (defined(this._position)) {
            info.position = this.position;
        }
        if (defined(this._rotateX)) {
            info.rotateX = this._rotateX;
        }
        if (defined(this._rotateY)) {
            info.rotateY = this._rotateY;
        }
        if (defined(this._rotateZ)) {
            info.rotateZ = this._rotateZ;
        }
        if (defined(this.attributeName)) {
            info.attributeName = this.attributeName;
        }
        if (defined(this.skipLevelOfDetail)) {
            info.skipLevelOfDetail = this.skipLevelOfDetail;
        }
        if (defined(this.maximumMemoryUsage)) {
            info.maximumMemoryUsage = this.maximumMemoryUsage;
        }
        if (defined(this.maximumScreenSpaceError)) {
            info.maximumScreenSpaceError = this.maximumScreenSpaceError;
        }
        return info;
    }
}

export default TDTilesetLayer;

