import DeveloperError from '../../../../../Source/Core/DeveloperError.js';
import PolylineCollection from '../../../../../Source/Scene/PolylineCollection.js';
import Style from '../../../../Static/Style.js';
import Type from '../../../../Static/Type.js';
import GraphicProvider from './GraphicProvider.js';

class MultiLineStringGraphic extends GraphicProvider {
    constructor(options) {
        super(options);

        this.type = Type.GRAPHICSLINESTRING;

        this._update = true;
    }

    _updateGraphic() {
        const that = this;
        switch (this._style._type) {
            case Style.LINESTRINGSTYLE:
                this._graphic = new PolylineCollection();
                this._geometry._positions.forEach(positions => {
                    that._graphic.add(that._style._getStyle(positions));
                });
                break;
            default:
                throw new DeveloperError(`MultiLineStringGraphic不支持${this._style._type}图层样式!`);
        }
    }
}

export default MultiLineStringGraphic;
