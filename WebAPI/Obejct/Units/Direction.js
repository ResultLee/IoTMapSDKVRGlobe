import CesiumMath from '../../../Source/Core/Math.js';

class Direction {
    constructor(heading, pitch, roll) {
        this.heading = heading;
        this.pitch = pitch;
        this.roll = roll;
    }

    static ZERO = Object.freeze(new Direction(0.0, 0.0, 0.0));

    toRadians() {
        return new Direction(
            CesiumMath.toRadians(this.heading),
            CesiumMath.toRadians(this.pitch),
            CesiumMath.toRadians(this.roll)
        );
    }
}

export default Direction;
