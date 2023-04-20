import Cartesian2 from '../../../Source/Core/Cartesian2.js';
import Cartesian3 from '../../../Source/Core/Cartesian3.js';
import Color from '../../../Source/Core/Color.js';
import createGuid from '../../../Source/Core/createGuid.js';
import defaultValue from '../../../Source/Core/defaultValue.js';
import defined from '../../../Source/Core/defined.js';
import destroyObject from '../../../Source/Core/destroyObject.js';
import DeveloperError from '../../../Source/Core/DeveloperError.js';
import HeadingPitchRoll from '../../../Source/Core/HeadingPitchRoll.js';
import Matrix4 from '../../../Source/Core/Matrix4.js';
import Transforms from '../../../Source/Core/Transforms.js';
import BoxEmitter from '../../../Source/Scene/BoxEmitter.js';
import CircleEmitter from '../../../Source/Scene/CircleEmitter.js';
import ConeEmitter from '../../../Source/Scene/ConeEmitter.js';
import ParticleBurst from '../../../Source/Scene/ParticleBurst.js';
import ParticleSystem from '../../../Source/Scene/ParticleSystem.js';

const reg = /^_\w*/;
const gravityScratch = new Cartesian3();

const config = {
    name: 'string',
    emissionRate: 'number',
    gravity: 'number',
    bursts: Array,
    loop: 'boolean',
    scale: 'number',
    startScale: 'number',
    endScale: 'number',
    color: Color,
    startColor: Color,
    endColor: Color,
    image: 'string',
    speed: 'number',
    minimumSpeed: 'number',
    maximumSpeed: 'number',
    lifetime: 'number',
    particleLife: 'number',
    minimumParticleLife: 'number',
    maximumParticleLife: 'number',
    mass: 'number',
    minimumMass: 'number',
    maximumMass: 'number',
    particleSize: 'number',
    sizeInMeters: 'boolean',
    imageSize: Cartesian2,
    minimumImageSize: Cartesian2,
    maximumImageSize: Cartesian2,
    emitterRadius: 'number'
};

function createBursts(values) {
    const bursts = new Array();
    values.forEach(value => {
        bursts.push(new ParticleBurst(value));
    });
    return bursts;
}

function createPosition2(value) {
    return new Cartesian2(value, value);
}

function checkValueType(name, value, type) {
    if (typeof value === 'object' && value instanceof type || typeof value === type) {
        return true;
    }

    throw new DeveloperError('用于创建对象' + `${name}` + '的值类型错误!');
}

function modifyModelMatrix(position, direction) {
    position = Cartesian3.fromDegrees(position.longitude, position.latitude, position.altitude);
    const quaternion = Transforms.headingPitchRollQuaternion(position, direction);
    return Matrix4.fromTranslationQuaternionRotationScale(position, quaternion,
        new Cartesian3(1, 1, 1), new Matrix4()
    );
}

class ParticleProvider {
    constructor(position, options) {

        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        if (!defined(position)) {
            throw new DeveloperError('用于创建Particle对象的position参数不能为空');
        }

        const that = this;
        Object.getOwnPropertyNames(options).forEach(name => {
            if (defined(config[name])) {
                checkValueType(name, options[name], config[name]);
                that[`_${name}`] = options[name];
                Object.defineProperty(that, name, {
                    get() {
                        return that[`_${name}`];
                    },
                    set(value) {
                        checkValueType(name, value, config[name]);
                        that[`_${name}`] = value;
                    }
                });
            }
        });

        this._position = position;
        this._id = defaultValue(createGuid(), options.id);
        this._show = defaultValue(options.show, true);

        const direction = defaultValue(options.direction, defaultValue.EMPTY_OBJECT);
        this._direction = new HeadingPitchRoll(
            defaultValue(direction.heading, 0),
            defaultValue(direction.pitch, 0),
            defaultValue(direction.roll, 0)
        );

        this._ready = true;
        this._update = true;
    }

    update(frameState) {
        if (!this._ready || !this._show) {
            return;
        }

        if (this._update) {
            let property = Object.getOwnPropertyNames(this).slice();
            property = property.filter(name => {
                return !reg.test(name.toString());
            });

            let options = new Object();
            property.forEach(name => {
                if (typeof this[name] !== 'object' || this[name] instanceof Color) {
                    options[name] = this[name];
                }
            });

            // const position = this._position;
            // const modelMatrix = Transforms.eastNorthUpToFixedFrame(
            //     Cartesian3.fromDegrees(position.longitude, position.latitude, position.altitude)
            // );

            const modelMatrix = modifyModelMatrix(this._position, this._direction);

            const that = this;
            options = Object.assign({
                modelMatrix: modelMatrix,
                // 火焰
                // emitter: new CircleEmitter(this._emitterRadius),
                // 烟雾
                // emitter: new BoxEmitter(new Cartesian3(this._emitterRadius, this._emitterRadius, this._emitterRadius)),
                // 水花
                // emitter: new ConeEmitter(this._emitterRadius),
                // 水柱
                // emitter: new CircleEmitter(this._emitterRadius),
                emitter: new BoxEmitter(new Cartesian3(this._emitterRadius, this._emitterRadius, this._emitterRadius)),
                bursts: this._bursts && createBursts(this._bursts),
                imageSize: this.particleSize ? createPosition2(this.particleSize) : this.imageSize,
                updateCallback: (p, dt) => {
                    const position = p.position;

                    Cartesian3.normalize(position, gravityScratch);
                    Cartesian3.multiplyByScalar(
                        gravityScratch,
                        that.gravity * dt,
                        gravityScratch
                    );

                    p.velocity = Cartesian3.add(
                        p.velocity,
                        gravityScratch,
                        p.velocity
                    );
                },
                minimumImageSize: this._minimumImageSize || createPosition2(this.particleSize),
                maximumImageSize: this._maximumImageSize || createPosition2(this.particleSize)
            }, options);

            window.options = options;
            this._object = new ParticleSystem(options);

            this._update = false;
        }
        // eslint-disable-next-line no-unused-expressions
        this._object && this._object.update(frameState);
    }

    isDestroyed() {
        return false;
    }

    destroy() {
        destroyObject(this);
    }
}
export default ParticleProvider;
