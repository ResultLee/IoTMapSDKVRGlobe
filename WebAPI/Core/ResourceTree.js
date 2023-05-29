import defaultValue from '../../Source/Core/defaultValue.js';
import defined from '../../Source/Core/defined.js';
import destroyObject from '../../Source/Core/destroyObject.js';
import DeveloperError from '../../Source/Core/DeveloperError.js';
import DataManager from '../Obejct/ResourceTree/Data/DataManager.js';
import TreeGroup from '../Obejct/ResourceTree/Tree/TreeGroup.js';
import TreeNode from '../Obejct/ResourceTree/Tree/TreeNode.js';
import TreeTable from '../Obejct/ResourceTree/Tree/TreeTable.js';
import Default from '../Static/Default.js';
import Type from '../Static/Type.js';

function getNodeById(node, id) {
    if (node.type === Type.TREENODE) {
        return;
    }
    if (!defined(id) || node.id === id) {
        return node;
    }

    const children = node.children;
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.id === id) {
            return child;
        }
        if (child.type === Type.TREEGROUP) {
            const node = getNodeById(child, id);
            if (defined(node)) {
                return node;
            }
        }
    }
}

function removeNode(parentNode, id) {
    if (parentNode.type === Type.TREENODE) {
        return;
    }
    if (!defined(id) || parentNode.id === id) {
        return parentNode;
    }

    const children = parentNode.children;
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.id === id) {
            return children.splice(i, 1)[0];
        }
        if (child.type === Type.TREEGROUP) {
            const node = removeNode(child, id);
            if (defined(node)) {
                return node;
            }
        }
    }
}

class ResourceTree {
    constructor() {
        this.root = new TreeGroup({
            name: 'ROOT',
            parentId: -1,
            id: Default.ROOTNODENAME
        });
        this.treeTable = new TreeTable();
        this.dataManager = new DataManager();
    }

    addGroup(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);
        options.parentId = defaultValue(options.parentId, Default.ROOTNODENAME);
        const parentNode = getNodeById(this.root, options.parentId);
        if (!defined(parentNode) || parentNode.type === Type.TREENODE) {
            throw new DeveloperError('父节点不存在或父节点不为group!');
        }

        const node = new TreeGroup(options);
        parentNode.children.push(node);

        const item = new Object();
        item.id = node.id;
        item.name = node.name;
        item.parentId = node.parentId;
        this.treeTable.addItem(item);

        return node;
    }

    addTreeNode(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);
        options.parentId = defaultValue(options.parentId, Default.ROOTNODENAME);
        const parentNode = getNodeById(this.root, options.parentId);
        if (!defined(parentNode) || parentNode.type === Type.TREENODE) {
            throw new DeveloperError('父节点不存在或父节点不为group!');
        }

        const type = options.dataType;

        const node = new TreeNode(options);
        parentNode.children.push(node);

        const item = new Object();
        item.id = node.id;
        item.name = node.name;
        item.layerType = type;
        item.parentId = node.parentId;
        this.treeTable.addItem(item);

        options.id = item.id;
        options.type = type;
        const layer = this.dataManager.addLayer(options);

        return { node, item, layer };
        // return { node, item };
    }

    getTreeNode(id) {
        return getNodeById(this.root, id);
    }

    getLayer(id) {
        return this.dataManager.getLayer(id);
    }

    removeTreeNode(id) {
        const node = removeNode(this.root, id);
        const items = this.treeTable.removeItem(id);
        const layer = this.dataManager.removeLayer(id);
        return { node, items, layer };
    }

    update(frameState) {
        this.dataManager.update(frameState);
    }

    prePassesUpdate(frameState) {
        this.dataManager.prePassesUpdate(frameState);
    }

    postPassesUpdate(frameState) {
        this.dataManager.postPassesUpdate(frameState);
    }

    reset() {
        this.root = new TreeGroup({
            name: 'ROOT',
            parentId: -1,
            id: Default.ROOTNODENAME
        });
        this.treeTable = new TreeTable();
        this.dataManager = new DataManager();
    }

    isDestroyed() {
        return false;
    }

    destroy() {
        destroyObject(this);
    }
}

export default ResourceTree;
