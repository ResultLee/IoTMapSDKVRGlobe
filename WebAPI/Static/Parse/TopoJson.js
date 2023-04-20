/* eslint-disable guard-for-in */
import defaultValue from '../../../Source/Core/defaultValue.js';
import defined from '../../../Source/Core/defined.js';
import DeveloperError from '../../../Source/Core/DeveloperError.js';
import topojson from '../../../Source/ThirdParty/topojson.js';
import Default from '../Default.js';

function drawPolygon(rectangle, coordinate, width, height, ctx, fillColor, strokeColor) {
  const xmin = rectangle.west;
  const ymin = rectangle.south;
  const xmax = rectangle.east;
  const ymax = rectangle.north;

  for (let i = 0; i < coordinate.length; i++) {
    ctx.beginPath();
    const obj = coordinate[i];
    for (let j = 0; j < obj.length; j++) {
      const point = obj[j];

      const x = (point[0] - xmin) / (xmax - xmin) * width;
      const y = (ymax - point[1]) / (ymax - ymin) * height;

      const drawMethod = `${j === 0 ? 'move' : 'line'}To`;
      ctx[drawMethod](x, y);
    }
    ctx.closePath();
    ctx.fillStyle = defaultValue(fillColor, '#FFFF00');
    ctx.strokeStyle = defaultValue(strokeColor, '#FF00FF');
    ctx.stroke();
    ctx.fill();
  }
}

class TopoJSON {

  static toIMG(options) {
    if (!defined(options) && !defined(options.json) || !defined(options.rectangle)) {
      throw new DeveloperError('用于创建图片的参数错误!');
    }

    if (!options.json.count > 0) {
      return Default.TRANSPARENTIMAGE;
    }

    const width = defaultValue(options.width, 256);
    const height = defaultValue(options.height, 256);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');

    for (const property in options.json.objects) {
      const features = topojson.feature(options.json, options.json.objects[property]).features;
      for (let i = 0; i < features.length; i++) {
        const feature = features[i];
        switch (feature.geometry.type) {
          case 'Polygon':
            drawPolygon(options.rectangle, feature.geometry.coordinates, width, height, ctx, options.fillColor, options.strokeColor);
            break;
          case 'MultiPolygon':
            for (const coordinates of feature.geometry.coordinates) {
              drawPolygon(options.rectangle, coordinates, width, height, ctx, options.fillColor, options.strokeColor);
            }
            break;
          default:
            console.error('不支持的数据类型!');
            break;
        }

      }
    }

    return canvas;
  }
}

export default TopoJSON;
