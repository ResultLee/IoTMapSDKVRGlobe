import defaultValue from '../../../Source/Core/defaultValue.js';
import DeveloperError from '../../../Source/Core/DeveloperError';
import Attribute from './Attribute.js';
import Table from './Table.js';

class AttributeTable {
    constructor(jsonData) {
        // const features = geojson.features;
        // attributes = new Cesium.AttributeTable();
        // features.forEach(feature => {
        //   const property = feature.properties;
        //   attributes.addAttribute(property);
        // });

        jsonData = defaultValue(jsonData, []);

        if (!(jsonData instanceof Array)) {
            throw new DeveloperError('创建属性表的原始数据必须为数组对象!');
        }

        this.attributes = new Array();

        for (let i = 0; i < jsonData.length; i++) {
            this.attributes.push(new Attribute(i, jsonData[i]));
        }

        this._table = new Table(this.attributes);
    }

    addAttribute(data, fid) {
        fid = defaultValue(fid, this.attributes.length);
        if (!(data instanceof Attribute)) {
            data = new Attribute(fid, data);
        }
        this.attributes.push(data);
        this._table.addAttribute(data);
        return data;
    }

    getAttribute(fid) {
        return this.attributes.filter(attribute => attribute.fid === fid)[0];
    }
}

export default AttributeTable;
