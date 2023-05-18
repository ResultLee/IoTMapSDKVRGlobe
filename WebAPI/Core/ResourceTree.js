import defined from '../../Source/Core/defined.js';
import DeveloperError from '../../Source/Core/DeveloperError.js';
import DataManager from '../Obejct/ResourceTree/Data/DataManager.js';
import TreeNode from '../Obejct/ResourceTree/Tree/TreeNode.js';
import TreeTable from '../Obejct/ResourceTree/Tree/TreeTable.js';
import Type from '../Static/Type.js';


function getNodeById(nodes, id) {
    if (nodes.Type === Type.TREENODE) {
        return;
    }

    const children = nodes.children;
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.Type === Type.TREEGROUP) {
            const node = getNodeById(child);
            if (defined(node)) {
                return node;
            }
        }
        if (child.id === id) {
            return child;
        }
    }
}

function getParentNode(node, id) {
    if (!defined(id)) {
        return node;
    }


}

class ResourceTree {
    constructor() {
        this.root = new TreeNode();
        this.treeTable = new TreeTable();
        this.dataManager = new DataManager();
    }

    // addGroup(options) {
    //     this.treeTable.addItem(options);
    // }

    // addGraphic(type, options) {
    //     this.treeTable.addItem(options);
    // }

    // addLayer(type, options) {
    //     // this.dataManager.addLayer(type, options);
    //     this.treeTable.addItem(options);
    // }

    addGroup(options) {
        const parentNode = getParentNode(this.root, options.parentId);
        if (parentNode.type === Type.TREENODE || !defined(parentNode)) {
            throw new DeveloperError('父节点不存在或父节点不为group!');
        }
        // this.treeTable.addItem(options);
        parentNode.children.push(new TreeNode(options));
    }

    addTreeNode(options) {

    }

    update(frameState) {
        this.dataManager.update(frameState);
    }
}

export default ResourceTree;
