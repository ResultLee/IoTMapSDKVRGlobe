import Color from '../../../../../Source/Core/Color.js';
import defaultValue from '../../../../../Source/Core/defaultValue.js';
import defined from '../../../../../Source/Core/defined.js';
import DeveloperError from '../../../../../Source/Core/DeveloperError.js';
import Cesium3DTileStyle from '../../../../../Source/Scene/Cesium3DTileStyle.js';
import ColorProperty from '../../../Property/ColorProperty.js';
import TilesetProvider from '../TilesetProvider.js';

class ModelTilesetLayer extends TilesetProvider {
    constructor(url, options) {
        super(url, options);

        this._tileset.style = new Cesium3DTileStyle();
        this._colorProperty = new ColorProperty(options);
    }

    get color() {
        return this._colorProperty._color;
    }

    set color(value) {
        if (defined(value) && !(value instanceof Color)) {
            throw new DeveloperError('value值类型错误!');
        }

        this._colorProperty._color = defaultValue(value, Color.WHITE);
        this._colorProperty._update = true;
    }

    get attributeName() {
        return this._colorProperty.attributeName;
    }

    set attributeName(value) {
        this._colorProperty.attributeName = value;
    }

    get colorProperty() {
        return this._colorProperty;
    }

    get colorPropertyType() {
        return this._colorProperty._propertyType;
    }

    set colorPropertyType(value) {
        this._colorProperty._propertyType = value;
    }

    update(frameState) {
        if (!defined(this.ready)) {
            return;
        }

        if (this._colorProperty._update) {
            this._tileset.style.color = {
                conditions: this._colorProperty.evaluate()
            };
            this._tileset.makeStyleDirty();
            this._colorProperty._update = false;
        }

        if (defined(this._tileset)) {
            this._tileset.update(frameState);
        }
    }

    updateStyle() {
        this._colorProperty._update = true;
    }
}

export default ModelTilesetLayer;
