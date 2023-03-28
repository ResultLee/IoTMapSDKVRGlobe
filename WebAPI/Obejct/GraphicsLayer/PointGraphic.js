import Cartesian3 from '../../../Source/Core/Cartesian3.js';
import defaultValue from '../../../Source/Core/defaultValue.js';
import PointPrimitiveCollection from '../../../Source/Scene/PointPrimitiveCollection.js';
import Style from '../../Static/Style.js';
import PointStyle from '../../Style/PointStyle/PointStyle.js';
import PointGeometry from '../Geometry/SingleGeometry/PointGeometry.js';
import GraphicProvider from './GraphicProvider.js';

function addPoints(position, collection, style) {
    collection.add(Object.assign({
        position: new Cartesian3.fromPosition(position)
    }, style.getStyle()));
    return true;
}

class PointGraphic extends GraphicProvider {
    constructor(position, options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        const geometry = new PointGeometry(position.toCoordinates(), options);
        super(geometry, options);

        this._style = new PointStyle();

        this.ready = true;
        this._update = true;
    }

    _updateGraphic() {
        switch (this._style._type) {
            case Style.POINTSTYLE:
                this._graphic = new PointPrimitiveCollection();
                addPoints(this._geometry._position, this._graphic, this._style);
                break;
        }
    }
}

export default PointGraphic;
