import Cartesian3 from '../../../Source/Core/Cartesian3.js';
import PointStyle from '../../Style/PointStyle/PointStyle.js';
import FeatureProvider from './FeatrueProvider.js';

class PointFeature extends FeatureProvider {
    constructor(options) {
        super(options);

        // this._style = new PointStyle();
    }

    // get style() {
    //     return Object.assign({
    //         position: new Cartesian3.fromPosition(this._geometry._position)
    //     }, this._style);
    // }
}

export default PointFeature;
