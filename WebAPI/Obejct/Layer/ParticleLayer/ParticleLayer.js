import createGuid from '../../../../Source/Core/createGuid.js';
import defaultValue from '../../../../Source/Core/defaultValue.js';
import defined from '../../../../Source/Core/defined.js';
import destroyObject from '../../../../Source/Core/destroyObject.js';
import Type from '../../../Static/Type.js';
import FireParticle from './Particle/FireParticle.js';
import SmokeParticle from './Particle/SmokeParticle.js';
import WaterParticle from './Particle/WaterParticle.js';

class ParticleLayer {
    constructor(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        this._particle = new Array();

        this._id = createGuid();
        this._name = options.name;

        this._show = defaultValue(options.show, true);
    }

    addParticle(type, position, options) {
        let particle;
        switch (type) {
            case Type.FIREPARTICLE:
                particle = new FireParticle(position, options);
                break;
            case Type.SMOKEPARTICLE:
                particle = new SmokeParticle(position, options);
                break;
            case Type.WATERPARTICLE:
                particle = new WaterParticle(position, options);
                break;
        }

        if (defined(particle)) {
            this._particle.push(particle);
        }
        return particle;
    }

    removeParticle(particle) {
        for (let i = 0; i < this._particle.length; i++) {
            if (particle.id === this._particle[i].id) {
                this._particle.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    removeAll() {
        this._particle = new Array();
    }

    update(frameState) {
        if (!this._show || !defined(this._particle)) {
            return;
        }

        for (const particle of this._particle) {
            particle.update(frameState);
        }
    }

    isDestroyed() {
        return false;
    }

    destroy() {
        destroyObject(this);
    }
}

export default ParticleLayer;
