import defaultValue from '../../../../../Source/Core/defaultValue.js';
import DeveloperError from '../../../../../Source/Core/DeveloperError.js';
import PointPrimitiveCollection from '../../../../../Source/Scene/PointPrimitiveCollection.js';
import Style from '../../../../Static/Style.js';
import Type from '../../../../Static/Type.js';
// import PointStyle from '../../../../Style/PointStyle/PointStyle.js';
import SinglePointGeometry from '../../../Geometry/SingleGeometry/SinglePointGeometry.js';
import GraphicProvider from './GraphicProvider.js';

class PointGraphic extends GraphicProvider {
    constructor(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        options.geometry = defaultValue(
            options.geometry, new SinglePointGeometry(options.position, options)
        );

        // options.style = defaultValue(options.style, new PointStyle());

        super(options);

        this.type = Type.GRAPHICSPOINT;
        this._update = true;
    }

    _setPosition(position) {
        this._geometry = new SinglePointGeometry(position, this._geometry);
        this._update = true;
    }

    _updateGraphic() {
        switch (this._style._type) {
            case Style.POINTSTYLE:
                this._graphic = new PointPrimitiveCollection();
                // eslint-disable-next-line no-case-declarations
                const options = this._style._getStyle(this._geometry.position);
                options.id = this._id;
                this._graphic.add(options);
                break;
            default:
                throw new DeveloperError(`PointGraphic不支持${this._style._type}图层样式!`);
        }
    }
}

export default PointGraphic;
