import defaultValue from '../../../Source/Core/defaultValue.js';
import defined from '../../../Source/Core/defined';
import DeveloperError from '../../../Source/Core/DeveloperError.js';

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
}

export default Position3D;
