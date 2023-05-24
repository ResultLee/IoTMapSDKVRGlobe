import Type from '../../../../Static/Type.js';
import ParticleProvider from './ParticleProvider.js';

class FireParticle extends ParticleProvider {
    constructor(position, options) {
        super(position, options);
        this.type = Type.FIREPARTICLE;
    }
}

export default FireParticle;
