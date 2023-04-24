import defined from '../../../../../Source/Core/defined.js';
import DeveloperError from '../../../../../Source/Core/DeveloperError.js';
import PolylineCollection from '../../../../../Source/Scene/PolylineCollection.js';
import Style from '../../../../Static/Style.js';
import Type from '../../../../Static/Type.js';
import GraphicProvider from './GraphicProvider.js';

class LineStringGraphic extends GraphicProvider {
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

            switch (this._style._type) {
                case Style.LINESTRINGSTYLE:
                    this._graphic = new PolylineCollection();
                    this._graphic.add(this._style._getStyle(this._geometry._positions));
                    break;
                default:
                    throw new DeveloperError(`PointGraphic不支持${this._style._type}图层样式!`);
            }

            this._update = false;
        }

        if (defined(this._graphic)) {
            this._graphic.update(frameState);
        }
    }
}

export default LineStringGraphic;
