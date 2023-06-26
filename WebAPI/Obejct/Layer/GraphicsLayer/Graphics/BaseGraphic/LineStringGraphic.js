/* eslint-disable no-case-declarations */
import defaultValue from '../../../../../../Source/Core/defaultValue.js';
import defined from '../../../../../../Source/Core/defined.js';
import DeveloperError from '../../../../../../Source/Core/DeveloperError.js';
import PointPrimitiveCollection from '../../../../../../Source/Scene/PointPrimitiveCollection.js';
import PolylineCollection from '../../../../../../Source/Scene/PolylineCollection.js';
import PrimitiveCollection from '../../../../../../Source/Scene/PrimitiveCollection.js';
import Style from '../../../../../Static/Style.js';
import Type from '../../../../../Static/Type.js';
import SingleLineStringGeometry from '../../../../Geometry/SingleGeometry/SingleLineStringGeometry.js';
import GraphicProvider from '../GraphicProvider.js';

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
        let points;
        let options;
        let polylines;
        switch (this._style._type) {
            case Style.LINESTRINGSTYLE:
                this._graphic = new PolylineCollection();
                options = this._style._getStyle(this._geometry._positions);
                options.id = this._id;
                this._graphic.add(options);
                break;
            case Style.MEASUREVERTICALSTYLE:
                this._graphic = new PrimitiveCollection();
                points = this._graphic.add(new PointPrimitiveCollection());
                polylines = this._graphic.add(new PolylineCollection());
                options = this._style._getStyle(this._geometry._positions);
                if (defined(options)) {
                    if (defined(options.points)) {
                        for (let i = 0; i < options.points.length; i++) {
                            points.add(options.points[i]);
                        }
                    }
                    if (defined(options.polylines)) {
                        for (let i = 0; i < options.polylines.length; i++) {
                            polylines.add(options.polylines[i]);
                        }
                    }
                }
                break;
            case Style.MEASUREHORIZONTALSTYLE:
                this._graphic = new PrimitiveCollection();
                points = this._graphic.add(new PointPrimitiveCollection());
                polylines = this._graphic.add(new PolylineCollection());
                options = this._style._getStyle(this._geometry._positions);
                if (defined(options)) {
                    if (defined(options.points)) {
                        for (let i = 0; i < options.points.length; i++) {
                            points.add(options.points[i]);
                        }
                    }
                    if (defined(options.polylines)) {
                        for (let i = 0; i < options.polylines.length; i++) {
                            polylines.add(options.polylines[i]);
                        }
                    }
                }
                break;
            case Style.MEASURESLOPESTYLE:
                this._graphic = new PrimitiveCollection();
                points = this._graphic.add(new PointPrimitiveCollection());
                polylines = this._graphic.add(new PolylineCollection());
                options = this._style._getStyle(this._geometry._positions);
                if (defined(options)) {
                    if (defined(options.points)) {
                        for (let i = 0; i < options.points.length; i++) {
                            points.add(options.points[i]);
                        }
                    }
                    if (defined(options.polylines)) {
                        for (let i = 0; i < options.polylines.length; i++) {
                            polylines.add(options.polylines[i]);
                        }
                    }
                }
                break;
            case Style.MEASUREAREASTYLE:
                this._graphic = new PrimitiveCollection();
                points = this._graphic.add(new PointPrimitiveCollection());
                const polygons = this._graphic.add(new PrimitiveCollection());
                options = this._style._getStyle(this._geometry._positions);
                if (defined(options)) {
                    if (defined(options.points)) {
                        for (let i = 0; i < options.points.length; i++) {
                            points.add(options.points[i]);
                        }
                    }
                    if (defined(options.polygon)) {
                        polygons.add(options.polygon);
                    }
                }
                break;
            default:
                throw new DeveloperError(`LineStringGraphic不支持${this._style._type}图层样式!`);
        }
    }
}

export default LineStringGraphic;
