import defaultValue from '../../../Source/Core/defaultValue.js';
import DeveloperError from '../../../Source/Core/DeveloperError.js';
import Default from '../../Static/Default.js';
import Style from '../../Static/Style.js';

function getStyleByPosition(position) {
    return Default.MEASUREANCHORSTYLE._getStyle(position);
}

function getStyleByPositions(startPoint, endPoint) {
    return Default.MEASUREPOLYLINESTYLE._getStyle([startPoint, endPoint]);
}

class MeasureSlopeStyle {
    constructor(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        this._type = Style.MEASURESLOPESTYLE;

        this._update = true;
    }

    _getStyle(positions) {
        if (positions.length < 2) {
            throw new DeveloperError('用于创建样式的数据异常!');
        }
        const points = new Array();
        const polylines = new Array();

        let startPoint = positions[0];
        const endPoint = positions[1];

        const height = Math.max(startPoint.altitude, endPoint.altitude);
        const midPoint = startPoint.altitude > endPoint.altitude ?
            endPoint._cloneWithAltitude(height) : startPoint._cloneWithAltitude(height);

        positions = [startPoint, midPoint, endPoint, startPoint];
        for (let i = 1; i < positions.length; i++) {
            const point = positions[i];
            points.push(getStyleByPosition(point));
            polylines.push(getStyleByPositions(startPoint, point));
            startPoint = point.clone();
        }
        return { points, polylines };
    }

    clone() {
        return new MeasureSlopeStyle();
    }
}

export default MeasureSlopeStyle;

