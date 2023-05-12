import Color from '../../../Source/Core/Color.js';
import createGuid from '../../../Source/Core/createGuid.js';
import defaultValue from '../../../Source/Core/defaultValue.js';
import defined from '../../../Source/Core/defined.js';
import DeveloperError from '../../../Source/Core/DeveloperError.js';
import Type from '../../Static/Type.js';
import Condition from './Condition/Condition.js';

function resolveAttributeRange(attributeRange) {
    const ranges = [];
    ranges[0] = attributeRange.substr(0, 1);
    ranges[3] = attributeRange.substr(-1, 1);
    const attributeRanges = attributeRange.replace(ranges[0], '').replace(ranges[3], '').split(',');
    ranges[1] = attributeRanges[0] === '-' ? undefined : Number(attributeRanges[0]);
    ranges[2] = attributeRanges[1] === '+' ? undefined : Number(attributeRanges[1]);
    return ranges;
}

function removeConditionById(id, conditions) {
    const condition = conditions.keyById[id];
    if (condition) {
        delete conditions.keyById[id];
        delete conditions.keyByClassName[condition.className];
    }
}

class ColorProperty {
    constructor(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        this.attributeName = options.attributeName;

        // TODO: 完善初始化时颜色状态
        this._color = defaultValue(options.color, Color.WHITE);
        this._propertyType = defaultValue(options.type, Type.PROPERTYSPACIAL);

        this._conditionsCollection = {
            uniqueConditions: new Condition(),
            graduatedConditions: new Condition()
        };

        this._update = false;
    }

    get conditions() {
        let conditions;
        switch (this._propertyType) {
            case Type.PROPERTYUNIQUE:
                conditions = this._conditionsCollection.uniqueConditions;
                break;
            case Type.PROPERTYGRADUATED:
                conditions = this._conditionsCollection.graduatedConditions;
                break;
            default:
                return conditions;
        }

        const ids = Object.keys(conditions.keyById);
        const conditionsArray = [];
        for (const id of ids) {
            const condition = conditions.keyById[id];
            conditionsArray.push({ className: condition.className, value: condition.value });
        }
        return conditionsArray;
    }

    addCondition(className, value) {
        if (!defined(value) || !(value instanceof Color)) {
            throw new DeveloperError('value不能为空,且必须值必须为Color类型!');
        }
        let conditions;
        switch (this._propertyType) {
            case Type.PROPERTYUNIQUE:
                conditions = this._conditionsCollection.uniqueConditions;
                break;
            case Type.PROPERTYGRADUATED:
                conditions = this._conditionsCollection.graduatedConditions;
                break;
            default:
                this._color = value;
                return;
        }

        let id = conditions.keyByClassName[className];
        if (defined(id)) {
            conditions.keyById[id].value = value;
        } else {
            id = createGuid();
            conditions.keyByClassName[className] = id;
            conditions.keyById[id] = {
                className,
                value
            };
        }

        return id;
    }

    removeConditionById(id) {
        removeConditionById(id, this._conditionsCollection.uniqueConditions);
        removeConditionById(id, this._conditionsCollection.graduatedConditions);
    }

    removeConditionByClassName(className) {
        let conditions;
        if (this.propertyType === Type.PROPERTYUNIQUE) {
            conditions = this._conditionsCollection.uniqueConditions;
        } else if (this.propertyType === Type.PROPERTYGRADUATED) {
            conditions = this._conditionsCollection.graduatedConditions;
        }
        if (conditions) {
            const id = conditions.keyByClassName[className];
            if (id) {
                delete conditions.keyByClassName[className];
                delete conditions.keyById[id];
            }
        }
    }

    removeAllCondition() {
        this._conditionsCollection = {
            uniqueConditions: new Condition(),
            graduatedConditions: new Condition()
        };
    }

    evaluate() {
        const styleConditions = [];
        const attributeName = `\${${this.attributeName}}`;
        switch (this._propertyType) {
            case Type.PROPERTYSPACIAL:
                styleConditions.push(['true', this._color.toCssColorString()]);
                break;
            case Type.PROPERTYUNIQUE:
                if (!defined(this.attributeName)) {
                    throw new DeveloperError('attributeName是必需的!');
                }
                for (const condition of this.conditions) {
                    const classNameExp =
                        typeof condition.className === 'string' ?
                            `'${condition.className}'` : condition.className;
                    const boolExpress = `${attributeName} === ${classNameExp}`;
                    styleConditions.push([boolExpress, condition.value.toCssColorString()]);
                }
                styleConditions.push(['true', this._color.toCssColorString()]);
                break;
            case Type.PROPERTYGRADUATED:
                if (!defined(this.attributeName)) {
                    throw new DeveloperError('attributeName是必需的!');
                }
                for (const condition of this.conditions) {
                    const ranges = resolveAttributeRange(condition.className);
                    const leftBool = ranges[0] === '(' ? '<' : '<=';
                    const rightBool = ranges[3] === ')' ? '<' : '<=';

                    let leftBoolExpress, rightBoolExpress;
                    if (defined(ranges[1])) {
                        leftBoolExpress = `${ranges[1]} ${leftBool} ${attributeName}`;
                    }

                    if (defined(ranges[2])) {
                        rightBoolExpress = `${attributeName} ${rightBool} ${ranges[2]}`;
                    }

                    let boolExpress;
                    if (leftBoolExpress && rightBoolExpress) {
                        boolExpress = `${leftBoolExpress} && ${rightBoolExpress}`;
                    }
                    else if (leftBoolExpress) {
                        boolExpress = leftBoolExpress;
                    }
                    else if (rightBoolExpress) {
                        boolExpress = rightBoolExpress;
                    }

                    styleConditions.push([boolExpress, condition.value.toCssColorString()]);
                }
                styleConditions.push(['true', this._color.toCssColorString()]);
                break;
        }
        return styleConditions;
    }
}

export default ColorProperty;
