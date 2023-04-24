import defined from '../../../../../Source/Core/defined.js';
import DeveloperError from '../../../../../Source/Core/DeveloperError';
import PrimitiveCollection from '../../../../../Source/Scene/PrimitiveCollection';
import Style from '../../../../Static/Style.js';
import Type from '../../../../Static/Type.js';
import GraphicProvider from './GraphicProvider.js';

class MultiPolygonGraphic extends GraphicProvider {
    constructor(options) {
        super(options);

        this.type = Type.GRAPHICSLINESTRING;

        this._update = true;
    }

    setStyle(style) {
        // setStyle(new VRGlobe.PolygonStyle({
        //     fillColor: VRGlobe.Color.fromRandom({
        //         alpha: 1.0
        //     })
        // }))

        this._style = style;
        this._update = true;
    }

    resetStyle() {
        this._style = undefined;
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

            this._update = false;
        }

        if (defined(this._graphic)) {
            this._graphic.update(frameState);
        }
    }
}

export default MultiPolygonGraphic;
