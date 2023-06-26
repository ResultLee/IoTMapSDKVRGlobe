import defaultValue from '../../../Source/Core/defaultValue.js';
import DeveloperError from '../../../Source/Core/DeveloperError.js';
import Default from '../../Static/Default.js';
import Style from '../../Static/Style.js';

class MeasureVerticalStyle {
    constructor(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        this._type = Style.MEASUREVERTICALSTYLE;

        this._update = true;
    }

    _getStyle(positions) {
        if (positions.length < 2) {
            throw new DeveloperError('用于创建样式的数据异常!');
        }
        const points = new Array();
        const polylines = new Array();
        const startPoint = positions[0];
        points.push(Default.MEASUREANCHORSTYLE._getStyle(startPoint));
        const endPoint = startPoint.clone();
        endPoint.altitude = positions[positions.length - 1].altitude;
        points.push(Default.MEASUREANCHORSTYLE._getStyle(endPoint));

        polylines.push(Default.MEASUREPOLYLINESTYLE._getStyle([startPoint, endPoint]));

        return { points, polylines };
    }

    clone() {
        return new MeasureVerticalStyle();
    }
}

export default MeasureVerticalStyle;

