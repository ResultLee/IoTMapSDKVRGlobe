import Cartographic from '../../../Source/Core/Cartographic.js';
import defaultValue from '../../../Source/Core/defaultValue.js';
import defined from '../../../Source/Core/defined.js';
import DeveloperError from '../../../Source/Core/DeveloperError.js';
import CesiumMath from '../../../Source/Core/Math.js';

class Position3D {
    constructor(longitude, latitude, altitude) {
        if (!defined(longitude)) {
            throw new DeveloperError('用于创建Position3D的Lon值不能为空!');
        }

        if (!defined(latitude)) {
            throw new DeveloperError('用于创建Position3D的lat值不能为空!');
        }
        this.longitude = longitude;
        this.latitude = latitude;
        this.altitude = defaultValue(altitude, 0);
    }

    clone() {
        return new Position3D(this.longitude, this.latitude, this.altitude);
    }

    toCoordinates() {
        return [this.longitude, this.latitude, this.altitude];
    }

    static fromCoordinates(coordinates) {
        return new Position3D(coordinates[0], coordinates[1], coordinates[2]);
    }

    static fromCoordinatesArray(coordinates) {
        const positions = new Array();
        for (const coordinate of coordinates) {
            positions.push(Position3D.fromCoordinates(coordinate));
        }
        return positions;
    }

    static fromCartesian3(cartesian3) {
        const cartographic = Cartographic.fromCartesian(cartesian3);
        return new Position3D(
            CesiumMath.toDegrees(cartographic.longitude),
            CesiumMath.toDegrees(cartographic.latitude),
            cartographic.height
        );
    }

    static fromCartographic(cartographic) {
        return new Position3D(
            CesiumMath.toDegrees(cartographic.longitude),
            CesiumMath.toDegrees(cartographic.latitude),
            cartographic.height
        );
    }
}

export default Position3D;
