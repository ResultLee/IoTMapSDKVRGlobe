import defined from '../../../../../../Source/Core/defined.js';
import DeveloperError from '../../../../../../Source/Core/DeveloperError.js';
import PrimitiveCollection from '../../../../../../Source/Scene/PrimitiveCollection.js';
import Style from '../../../../../Static/Style.js';
import Type from '../../../../../Static/Type.js';
import GraphicProvider from '../GraphicProvider.js';

class MultiPolygonGraphic extends GraphicProvider {
    constructor(options) {
        super(options);

        this.type = Type.GRAPHICSLINESTRING;

        this._update = true;
    }

    _updateGraphic() {
        let styles;
        switch (this._style._type) {
            case Style.POLYGONSTYLE:
                this._graphic = new PrimitiveCollection();
                for (const position of this._geometry._positions) {
                    styles = this._style._getStyle(position);
                    for (const index in styles) {
                        if (defined(styles[index])) {
                            this._graphic.add(styles[index]);
                        }
                    }
                }
                break;
            default:
                throw new DeveloperError(`MultiPolygonGraphic不支持${this._style._type}图层样式!`);
        }

    }
}

export default MultiPolygonGraphic;
