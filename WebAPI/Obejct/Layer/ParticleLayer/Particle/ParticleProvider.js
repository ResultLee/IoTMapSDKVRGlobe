import Cartesian2 from '../../../../../Source/Core/Cartesian2.js';
import Cartesian3 from '../../../../../Source/Core/Cartesian3.js';
import Color from '../../../../../Source/Core/Color.js';
import createGuid from '../../../../../Source/Core/createGuid.js';
import defaultValue from '../../../../../Source/Core/defaultValue.js';
import defined from '../../../../../Source/Core/defined.js';
import destroyObject from '../../../../../Source/Core/destroyObject.js';
import DeveloperError from '../../../../../Source/Core/DeveloperError.js';
import Transforms from '../../../../../Source/Core/Transforms.js';
import BoxEmitter from '../../../../../Source/Scene/BoxEmitter.js';
import CircleEmitter from '../../../../../Source/Scene/CircleEmitter.js';
import ConeEmitter from '../../../../../Source/Scene/ConeEmitter.js';
import ParticleBurst from '../../../../../Source/Scene/ParticleBurst.js';
import ParticleSystem from '../../../../../Source/Scene/ParticleSystem.js';
import Type from '../../../../Static/Type.js';
import Direction from '../../../Units/Direction.js';

class ParticleProvider {
    constructor(position, options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        if (!defined(position)) {
            throw new DeveloperError('用于创建Particle对象的position参数不能为空!');
        }

        if (!defined(options.image)) {
            throw new DeveloperError('用于创建Particle对象的image参数不能为空!');
        }

        if (!defined(options.emitterType) && !defined(options.emitterRadius)) {
            throw new DeveloperError('用于创建Particle对象的emitter参数不能为空!');
        }

        this.id = defaultValue(createGuid(), options.id);
        this._show = defaultValue(options.show, true);

        this.image = options.image;
        this.position = position;
        this.emitterType = options.emitterType;

        this.loop = defaultValue(options.loop, true);
        this.color = defaultValue(options.color, Color.WHITE);
        this.direction = defaultValue(options.direction, Direction.ZERO);
        this.emissionRate = defaultValue(options.emissionRate, 5);
        this.emitterRadius = defaultValue(options.emitterRadius, 1);
        this.gravity = defaultValue(options.gravity, 1);
        this.lifetime = defaultValue(options.lifetime, Number.MAX_VALUE);
        this.mass = defaultValue(options.mass, 1);
        this.imageSize = defaultValue(options.imageSize, 1);
        this.particleLife = defaultValue(options.particleLife, 5);
        this.scale = defaultValue(options.scale, 1);
        this.speed = defaultValue(options.speed, 1);

        this.direction = defaultValue(options.direction, Direction.ZERO);

        if (options.bursts) {
            this.bursts = options.bursts;
        }

        this._ready = true;
        this._update = true;
    }

    update(frameState) {
        if (!this._ready || !this._show) {
            return;
        }

        if (this._update) {
            const options = new Object();

            options.loop = this.loop;
            options.show = this._show;
            options.image = this.image;
            options.bursts = this.bursts;
            options.gravity = this.gravity;
            options.lifetime = this.lifetime;
            options.emissionRate = this.emissionRate;

            if (typeof this.scale === 'number') {
                options.scale = this.scale;
            } else if (this.scale instanceof Array) {
                options.startScale = this.scale[0];
                options.endScale = this.scale[1];
            }

            if (this.color instanceof Color) {
                options.color = this.color;
            } else if (this.color instanceof Array) {
                options.startColor = this.color[0];
                options.endColor = this.color[1];
            }

            if (typeof this.imageSize === 'number') {
                options.imageSize = new Cartesian2(this.imageSize, this.imageSize);
            } else if (this.imageSize instanceof Array) {
                options.minimumImageSize = new Cartesian2(this.imageSize[0], this.imageSize[0]);
                options.maximumImageSize = new Cartesian2(this.imageSize[1], this.imageSize[1]);
            }

            if (typeof this.speed === 'number') {
                options.speed = this.speed;
            } else if (this.speed instanceof Array) {
                options.minimumSpeed = this.speed[0];
                options.maximumSpeed = this.speed[1];
            }

            if (typeof this.particleLife === 'number') {
                options.particleLife = this.particleLife;
            } else if (this.particleLife instanceof Array) {
                options.minimumParticleLife = this.particleLife[0];
                options.maximumParticleLife = this.particleLife[1];
            }

            if (typeof this.mass === 'number') {
                options.mass = this.mass;
            } else if (this.mass instanceof Array) {
                options.minimumMass = this.mass[0];
                options.maximumMass = this.mass[1];
            }

            if (defined(this.bursts) && this.bursts instanceof Array) {
                const bursts = [];
                for (const burst of this.bursts) {
                    bursts.push(new ParticleBurst(burst));
                }
                options.bursts = bursts;
            }

            switch (this.emitterType) {
                case Type.CIRCLEEMITTER:
                    options.emitter = new CircleEmitter(this.emitterRadius);
                    break;
                case Type.BOXEMITTER:
                    options.emitter = new BoxEmitter(new Cartesian3(
                        this.emitterRadius,
                        this.emitterRadius,
                        this.emitterRadius
                    ));
                    break;
                case Type.CONEEMITTER:
                    options.emitter = new ConeEmitter(this.emitterAngle);
                    break;
            }

            options.modelMatrix = Transforms.headingPitchRollToFixedFrame(
                Cartesian3.fromPosition(this.position),
                this.direction.toRadians()
            );

            options.updateCallback = (p, dt) => {
                const gravityScratch = new Cartesian3();
                const position = p.position;

                Cartesian3.normalize(position, gravityScratch);
                Cartesian3.multiplyByScalar(
                    gravityScratch,
                    p.gravity * dt,
                    gravityScratch
                );

                p.velocity = Cartesian3.add(
                    p.velocity,
                    gravityScratch,
                    p.velocity
                );
            };

            this._particle = new ParticleSystem(options);
            this._update = false;
        }

        if (defined(this._particle)) {
            this._particle.update(frameState);
        }
    }

    isDestroyed() {
        return false;
    }

    destroy() {
        destroyObject(this);
    }
}

export default ParticleProvider;
