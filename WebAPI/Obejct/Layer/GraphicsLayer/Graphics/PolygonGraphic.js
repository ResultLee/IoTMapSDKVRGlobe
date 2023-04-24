import defined from '../../../../../Source/Core/defined.js';
import DeveloperError from '../../../../../Source/Core/DeveloperError.js';
import PrimitiveCollection from '../../../../../Source/Scene/PrimitiveCollection.js';
import Style from '../../../../Static/Style.js';
import Type from '../../../../Static/Type.js';
import GraphicProvider from './GraphicProvider.js';

class PolygonGraphic extends GraphicProvider {
    constructor(options) {
        super(options);

        this.type = Type.GRAPHICSPOLYGON;

        this._update = true;
    }

    _updateGraphic() {
        let styles;
        switch (this._style._type) {
            case Style.POLYGONSTYLE:
                this._graphic = new PrimitiveCollection();
                styles = this._style._getStyle(this._geometry._positions);
                for (const index in styles) {
                    if (defined(styles[index])) {
                        this._graphic.add(styles[index]);
                    }
                }
                break;
            default:
                throw new DeveloperError(`PolygonGraphic不支持${this._style._type}图层样式!`);
        }
    }

}

export default PolygonGraphic;
