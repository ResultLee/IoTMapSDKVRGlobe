import Cartesian3 from '../../../Source/Core/Cartesian3.js';
import defaultValue from '../../../Source/Core/defaultValue.js';
import Material from '../../../Source/Scene/Material.js';
import PolylineCollection from '../../../Source/Scene/PolylineCollection.js';
import Style from '../../Static/Style.js';
import LineStringStyle from '../../Style/LineStringStyle/LineStringStyle.js';
import LineStringGeometry from '../Geometry/SingleGeometry/LineStringGeometry.js';
import GraphicProvider from './GraphicProvider.js';

function addPolylines(positions, collection, style) {
    style = style.getStyle();
    const material = Material.fromType('PolylineOutline');

    material.uniforms.color = style.color;
    material.uniforms.outlineColor = style.outlineColor;
    material.uniforms.outlineWidth = style.outlineWidth;

    collection.add(Object.assign({
        loop: style.loop,
        width: style.width,
        material: material,
        positions: Cartesian3.fromPositions(positions)
    }, style));
    return true;
}

class LineStringGraphic extends GraphicProvider {
    constructor(positions, options) {

        options = defaultValue(options, defaultValue.EMPTY_OBJECT);
        const coordinates = new Array();
        for (let i = 0; i < positions.length; i++) {
            coordinates.push(positions[i].toCoordinates());
        }

        const geometry = new LineStringGeometry(coordinates, options);
        super(geometry, options);

        this._style = new LineStringStyle();

        this.ready = true;
        this._update = true;
    }

    _updateGraphic() {
        switch (this._style._type) {
            case Style.LINESTRINGSTYLE:
                this._graphic = new PolylineCollection();
                addPolylines(this._geometry._positions, this._graphic, this._style);
                break;
        }
    }
}
export default LineStringGraphic;
