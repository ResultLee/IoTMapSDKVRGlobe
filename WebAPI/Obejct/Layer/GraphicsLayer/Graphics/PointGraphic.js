import defined from '../../../../../Source/Core/defined.js';
import DeveloperError from '../../../../../Source/Core/DeveloperError.js';
import PointPrimitiveCollection from '../../../../../Source/Scene/PointPrimitiveCollection.js';
import Style from '../../../../Static/Style.js';
import Type from '../../../../Static/Type.js';
import GraphicProvider from './GraphicProvider.js';

class PointGraphic extends GraphicProvider {
    constructor(options) {
        super(options);

        this.type = Type.GRAPHICSPOINT;

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
                case Style.POINTSTYLE:
                    this._graphic = new PointPrimitiveCollection();
                    this._graphic.add(this._style._getStyle(this._geometry.position));
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

export default PointGraphic;
