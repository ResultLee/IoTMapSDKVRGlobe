import defined from '../../../../../Source/Core/defined.js';
import PolylineCollection from '../../../../../Source/Scene/PolylineCollection.js';
import Type from '../../../../Static/Type.js';
import GraphicProvider from './GraphicProvider.js';

class MultiLineStringGraphic extends GraphicProvider {
    constructor(options) {
        super(options);

        this.type = Type.GRAPHICSLINESTRING;

        this._update = true;
    }

    update(frameState) {
        if (!this._show || !defined(this._style)) {
            return;
        }

        if (this._update && this._style) {
            if (defined(this._graphic)) {
                this._graphic.removeAll();
            }

            const that = this;
            this._graphic = new PolylineCollection();
            this._geometry._positions.forEach(positions => {
                that._graphic.add(that._style._getStyle(positions));
            });
        }

        if (defined(this._graphic)) {
            this._graphic.update(frameState);
        }
    }
}

export default MultiLineStringGraphic;
