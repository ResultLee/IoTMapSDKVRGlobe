import DeveloperError from '../../../Source/Core/DeveloperError.js';
import formatXml from '../../ThirdParty/jsonxml/formatXml.js';
import JKL from '../../ThirdParty/jsonxml/jkl.js';
import XML from '../../ThirdParty/jsonxml/xml.js';



function wks2json(data) {
    try {
        const xotree = new XML.ObjTree();
        let json = xotree.parseXML(data);
        const dumper = new JKL.Dumper();
        const jsonText = dumper.dump(json, undefined, [
            { keywordProperty: 'id', name: 'children', isTraverse: true },
            { name: 'VRTreeNodes', isTraverse: false },
            { name: 'VRStyles', isTraverse: false },
            { name: 'tdTilesetClassification', isTraverse: false }
        ]);
        json = JSON.parse(jsonText);
        return json;
    } catch (e) {
        throw new DeveloperError(e);
    }
}

function json2wks(json) {
    try {
        const xotree = new XML.ObjTree();
        //将json字符串转为json对象后转为xml字符串
        const xmlText = xotree.writeXML(json);
        //使用jkl-dumper.js中的formatXml方法将xml字符串格式化
        return formatXml(xmlText);
    } catch (e) {
        throw new DeveloperError(e);
    }
}

class WKS {
    static toJson(wks) {
        return wks2json(wks);
    }

    static fromJson(json) {
        return json2wks(json);
    }
}

export default WKS;
