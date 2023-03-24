import combine from '../../../Source/Core/combine.js';
import defaultValue from '../../../Source/Core/defaultValue.js';
import defined from '../../../Source/Core/defined.js';
import CesiumMath from '../../../Source/Core/Math.js';
import Rectangle from '../../../Source/Core/Rectangle.js';
import ImageryProvider from './ImageryProvider.js';

const templateRegex = /{[^}]+}/g;

let degreesScratchComputed = false;
const degreesScratch = new Rectangle();
let projectedScratchComputed = false;
const projectedScratch = new Rectangle();

const tags = {
    x: xTag,
    y: yTag,
    z: zTag,
    s: sTag,
    reverseX: reverseXTag,
    reverseY: reverseYTag,
    reverseZ: reverseZTag,
    westDegrees: westDegreesTag,
    southDegrees: southDegreesTag,
    eastDegrees: eastDegreesTag,
    northDegrees: northDegreesTag,
    westProjected: westProjectedTag,
    southProjected: southProjectedTag,
    eastProjected: eastProjectedTag,
    northProjected: northProjectedTag,
    width: widthTag,
    height: heightTag,
    sx: sxTag,
    sy: syTag,
    by: byTag
};

function padWithZerosIfNecessary(imageryProvider, key, value) {
    if (
        imageryProvider &&
        imageryProvider.urlSchemeZeroPadding &&
        imageryProvider.urlSchemeZeroPadding.hasOwnProperty(key)
    ) {
        const paddingTemplate = imageryProvider.urlSchemeZeroPadding[key];
        if (typeof paddingTemplate === 'string') {
            const paddingTemplateWidth = paddingTemplate.length;
            if (paddingTemplateWidth > 1) {
                value =
                    value.length >= paddingTemplateWidth
                        ? value
                        : new Array(
                            paddingTemplateWidth - value.toString().length + 1
                        ).join('0') + value;
            }
        }
    }
    return value;
}

function xTag(imageryProvider, x, y, level) {
    return padWithZerosIfNecessary(imageryProvider, '{x}', x);
}

function yTag(imageryProvider, x, y, level) {
    return padWithZerosIfNecessary(imageryProvider, '{y}', y);
}

function zTag(imageryProvider, x, y, level) {
    return padWithZerosIfNecessary(imageryProvider, '{z}', level);
}

function sTag(imageryProvider, x, y, level) {
    const index = (x + y + level) % imageryProvider._subdomains.length;
    return imageryProvider._subdomains[index];
}

function reverseXTag(imageryProvider, x, y, level) {
    const reverseX =
        imageryProvider.tilingScheme.getNumberOfXTilesAtLevel(level) - x - 1;
    return padWithZerosIfNecessary(imageryProvider, '{reverseX}', reverseX);
}

function reverseYTag(imageryProvider, x, y, level) {
    const reverseY =
        imageryProvider.tilingScheme.getNumberOfYTilesAtLevel(level) - y - 1;
    return padWithZerosIfNecessary(imageryProvider, '{reverseY}', reverseY);
}

function reverseZTag(imageryProvider, x, y, level) {
    const maximumLevel = imageryProvider.maximumLevel;
    const reverseZ =
        defined(maximumLevel) && level < maximumLevel
            ? maximumLevel - level - 1
            : level;
    return padWithZerosIfNecessary(imageryProvider, '{reverseZ}', reverseZ);
}

function computeDegrees(imageryProvider, x, y, level) {
    if (degreesScratchComputed) {
        return;
    }

    imageryProvider.tilingScheme.tileXYToRectangle(x, y, level, degreesScratch);
    degreesScratch.west = CesiumMath.toDegrees(degreesScratch.west);
    degreesScratch.south = CesiumMath.toDegrees(degreesScratch.south);
    degreesScratch.east = CesiumMath.toDegrees(degreesScratch.east);
    degreesScratch.north = CesiumMath.toDegrees(degreesScratch.north);

    degreesScratchComputed = true;
}

function westDegreesTag(imageryProvider, x, y, level) {
    computeDegrees(imageryProvider, x, y, level);
    return degreesScratch.west;
}

function southDegreesTag(imageryProvider, x, y, level) {
    computeDegrees(imageryProvider, x, y, level);
    return degreesScratch.south;
}

function eastDegreesTag(imageryProvider, x, y, level) {
    computeDegrees(imageryProvider, x, y, level);
    return degreesScratch.east;
}

function northDegreesTag(imageryProvider, x, y, level) {
    computeDegrees(imageryProvider, x, y, level);
    return degreesScratch.north;
}

function computeProjected(imageryProvider, x, y, level) {
    if (projectedScratchComputed) {
        return;
    }

    imageryProvider.tilingScheme.tileXYToNativeRectangle(
        x,
        y,
        level,
        projectedScratch
    );

    projectedScratchComputed = true;
}

function westProjectedTag(imageryProvider, x, y, level) {
    computeProjected(imageryProvider, x, y, level);
    return projectedScratch.west;
}

function southProjectedTag(imageryProvider, x, y, level) {
    computeProjected(imageryProvider, x, y, level);
    return projectedScratch.south;
}

function eastProjectedTag(imageryProvider, x, y, level) {
    computeProjected(imageryProvider, x, y, level);
    return projectedScratch.east;
}

function northProjectedTag(imageryProvider, x, y, level) {
    computeProjected(imageryProvider, x, y, level);
    return projectedScratch.north;
}

function widthTag(imageryProvider, x, y, level) {
    return imageryProvider.tileWidth;
}

function heightTag(imageryProvider, x, y, level) {
    return imageryProvider.tileHeight;
}

function sxTag(imageryProvider, x, y, level) {
    return x >> 4;
}

function syTag(imageryProvider, x, y, level) {
    return ((1 << level) - y) >> 4;
}

function byTag(imageryProvider, x, y, level) {
    return -y;
}

/**
 * 用于场景加载URL瓦片的图层对象，统一在{@link ImageryLayer}对象中创建，不支持单独创建
 * @protected
 * @extends ImageryProvider
 */
class UrlTileImageryLayer extends ImageryProvider {
    /**
     * 创建URL瓦片影像图层
     * @param {String} url 用于请求影像瓦片图层URL地址,它具有以下关键字用于占位:
     * <ul>
     *  <li> <code>{z}</code>: 瓦片网格中的级别，零级是四叉树金字塔的最低级别。</li>
     *  <li> <code>{x}</code>: 瓦片网格中的X坐标，其中0是最西边的瓦片.</li>
     *  <li> <code>{y}</code>: 瓦片网格中的X坐标，其中0是最北边的瓦片.</li>
     *  <li> <code>{s}</code>: 可用子域之一，用于解决浏览器对每个主机同时请求数的限制.</li>
     *  <li> <code>{reverseX}</code>: 瓦片网格中的X坐标，其中0是最东边的瓦片.</li>
     *  <li> <code>{reverseY}</code>: 瓦片网格中的Y坐标，其中0是最南边的瓦片.</li>
     *  <li> <code>{reverseZ}</code>: 瓦片网格中的级别，零级是四叉树金字塔的最大级别，使用此方式必须定义瓦片最大级别.</li>
     *  <li> <code>{westDegrees}</code>: 用经纬度表示的瓦片最西边.</li>
     *  <li> <code>{southDegrees}</code>: 用经纬度表示的瓦片最南边.</li>
     *  <li> <code>{eastDegrees}</code>: 用经纬度表示的瓦片最东边.</li>
     *  <li> <code>{northDegrees}</code>: 用经纬度表示的瓦片最东边.</li>
     *  <li> <code>{westProjected}</code>: 瓦片网格中的瓦片最西边缘.</li>
     *  <li> <code>{southProjected}</code>: 瓦片网格中的瓦片最南边缘.</li>
     *  <li> <code>{eastProjected}</code>: 瓦片网格中的瓦片最东边缘.</li>
     *  <li> <code>{northProjected}</code>: 瓦片网格中的瓦片最北边缘.</li>
     *  <li> <code>{width}</code>: 每个瓦片的宽度.</li>
     *  <li> <code>{height}</code>: 每个瓦片的高度.</li>
     * </ul>
     * @param {Object} options 图层参数
     * @example
     * // 创建URL瓦片影像图层
     * const layer = new UrlTileImageryLayer('http://yoururl/{x}/{y}/{z}');
     */
    constructor(url, options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        super(url, options);

        this._subdomains = defaultValue(undefined, options.subdomains);

        const customTags = options.customTags;
        const allTags = combine(tags, customTags);

        this._subdomains = options.subdomains;
        if (Array.isArray(this._subdomains)) {
            this._subdomains = this._subdomains.slice();
        } else if (defined(this._subdomains) && this._subdomains.length > 0) {
            this._subdomains = this._subdomains.split('');
        } else {
            this._subdomains = ['a', 'b', 'c'];
        }

        this._allTags = allTags;
    }

    requestImage(x, y, level, request) {
        const resource = this._resource;
        const url = resource.getUrlComponent(true);
        const allTags = this._allTags;
        const templateValues = {};

        const that = this;
        const match = url.match(templateRegex);
        if (defined(match)) {
            match.forEach(function (tag) {
                const key = tag.substring(1, tag.length - 1);
                if (defined(allTags[key])) {
                    templateValues[key] = allTags[key](that, x, y, level);
                }
            });
        }

        return resource.getDerivedResource({
            request: request,
            templateValues: templateValues
        }).fetchImage({
            preferImageBitmap: true,
            flipY: true
        });
    }
}

export default UrlTileImageryLayer;
