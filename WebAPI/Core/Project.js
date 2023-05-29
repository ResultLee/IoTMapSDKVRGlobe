import Check from '../../Source/Core/Check.js';
import Resource from '../../Source/Core/Resource.js';
import WKS from '../Static/Parse/WKS.js';

class Project {
    constructor() {
        this.description = '';
        this._update = false;
    }

    openProject(url) {
        return new Promise((resolve, reject) => {
            Check.typeOf.string('WKS工程文件地址', url);
            Resource.fetch({ url })
                .then(xml => {
                    const json = WKS.toJson(xml);
                    this.style = json.VRGlobe.VRStyles;
                    this.terrain = json.VRGlobe.VRTerrain;
                    this.baseLayer = json.VRGlobe.VRBaseLayer;
                    this.treeNodes = json.VRGlobe.VRTreeNodes;
                    this.description = json.VRGlobe.VRDescription;
                    this._update = true;
                    resolve(this);
                }).catch(error => reject(error));
        });
    }
}
export default Project;
