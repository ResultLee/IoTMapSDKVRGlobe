import defaultValue from '../../../../../Source/Core/defaultValue.js';
import defined from '../../../../../Source/Core/defined.js';
import DeveloperError from '../../../../../Source/Core/DeveloperError.js';
import PrimitiveCollection from '../../../../../Source/Scene/PrimitiveCollection.js';
import Style from '../../../../Static/Style.js';
import Type from '../../../../Static/Type.js';
import SinglePolygonGeometry from '../../../Geometry/SingleGeometry/SinglePolygonGeometry.js';
import GraphicProvider from './GraphicProvider.js';

class PolygonGraphic extends GraphicProvider {
    constructor(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        if (!defined(options.geometry)) {
            options.geometry = new SinglePolygonGeometry(options.positions, options);
        }

        super(options);

        this.type = Type.GRAPHICSPOLYGON;

        this._update = true;
    }

    _setPosition(positions) {
        this._geometry = new SinglePolygonGeometry(positions, this._geometry);
        this._update = true;
    }

    _updateGraphic() {
        let styles;
        switch (this._style._type) {
            case Style.POLYGONSTYLE:
                this._graphic = new PrimitiveCollection();
                styles = this._style._getStyle(this._geometry._positions, this._id);
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
