import defined from '../../../../Source/Core/defined';
import destroyObject from '../../../../Source/Core/destroyObject';

class EditablePolygon {
    constructor() {
        this.isUpdate = true;
        this.positions = [];
        this.primitive = undefined;
    }

    createPrimitive(){
        
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

export default EditablePolygon;
