import defaultValue from '../../../../../Source/Core/defaultValue.js';
import DeveloperError from '../../../../../Source/Core/DeveloperError.js';
import PolylineCollection from '../../../../../Source/Scene/PolylineCollection.js';
import Style from '../../../../Static/Style.js';
import Type from '../../../../Static/Type.js';
import SingleLineStringGeometry from '../../../Geometry/SingleGeometry/SingleLineStringGeometry.js';
import GraphicProvider from './GraphicProvider.js';

class LineStringGraphic extends GraphicProvider {
    constructor(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        options.geometry = defaultValue(
            options.geometry,
            new SingleLineStringGeometry(options.positions, options)
        );
        super(options);

        this.type = Type.GRAPHICSLINESTRING;

        this._update = true;
    }

    _setPosition(positions) {
        this._geometry = new SingleLineStringGeometry(positions, this._geometry);
        this._update = true;
    }

    _updateGraphic() {
        switch (this._style._type) {
            case Style.LINESTRINGSTYLE:
                this._graphic = new PolylineCollection();
                this._graphic.add(this._style._getStyle(this._geometry._positions));
                break;
            default:
                throw new DeveloperError(`LineStringGraphic不支持${this._style._type}图层样式!`);
        }
    }
}

export default LineStringGraphic;
