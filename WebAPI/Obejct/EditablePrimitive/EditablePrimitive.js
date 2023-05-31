import defined from '../../../Source/Core/defined.js';
import destroyObject from '../../../Source/Core/destroyObject.js';
import DeveloperError from '../../../Source/Core/DeveloperError.js';

class EditablePrimitive {
    constructor() {
        this.isUpdate = true;
        this.positions = [];
        this.primitive = undefined;
    }

    createPrimitive() {
        DeveloperError.throwInstantiationError();
    }

    getGeometry() {
        DeveloperError.throwInstantiationError();
    }

    update(context, frameState, commandList) {
        if (!this.isUpdate && !defined(this.primitive)) {
            return;
        }
        if (this.isUpdate) {
            this.isUpdate = false;
            this.primitive = this.primitive && this.primitive.destroy();
            this.primitive = this.createPrimitive();
        }
        this.primitive.update(context, frameState, commandList);
    }

    destroy() {
        this.primitive = this.primitive && this.primitive.destroy();
        this.isUpdate = undefined;
        this.positions = undefined;
        return destroyObject(this);
    }
}

export default EditablePrimitive;
