import defined from '../../../Source/Core/defined.js';
import DeveloperError from '../../../Source/Core/DeveloperError.js';
import Type from '../../Static/Type.js';
import Position3D from '../Units/Position3D.js';
import MultiLineStringGeometry from './MultiGeometry/MultiLineStringGeometry.js';
import MultiPolygonGeometry from './MultiGeometry/MultiPolygonGeometry.js';
import SingleLineStringGeometry from './SingleGeometry/SingleLineStringGeometry.js';
import SinglePointGeometry from './SingleGeometry/SinglePointGeometry.js';
import SinglePolygonGeometry from './SingleGeometry/SinglePolygonGeometry.js';

class Geometry {
    constructor(type, positions, options) {
        if (!defined(positions)) {
            throw new DeveloperError('用于创建Geometry的positions值不能为空!');
        }

        switch (type) {
            case Type.GEOMETRYPOINT:
                return new SinglePointGeometry(positions, options);
            case Type.GEOMETRYLINESTRING:
                return new SingleLineStringGeometry(positions, options);
            case Type.GEOMETRYMULTILINESTRING:
                return new MultiLineStringGeometry(positions, options);
            case Type.GEOMETRYPOLYGON:
                return new SinglePolygonGeometry(positions, options);
            case Type.GEOMETRYMULTIPOLYGON:
                return new MultiPolygonGeometry(positions, options);
        }
    }

    static fromGeoJSON(geojson) {
        if (!defined(geojson)) {
            throw new DeveloperError('创建Graphic的geojson的值不能为空!');
        }

        if (!defined(geojson.geometry)) {
            throw new DeveloperError('创建Graphic的geometry的值不能为空!');
        }

        const geometry = geojson.geometry;

        const type = `GEOJSON${geometry.type.toLocaleUpperCase()}`;

        let positions, geometryType;
        const coordinates = geojson.geometry.coordinates;

        switch (Type[type]) {
            case Type.GEOJSONPOINT:
                geometryType = Type.GEOMETRYPOINT;
                positions = Position3D.fromCoordinates(coordinates);
                break;
            case Type.GEOJSONLINESTRING:
                geometryType = Type.GEOMETRYLINESTRING;
                positions = Position3D.fromCoordinatesArray(coordinates);
                break;
            case Type.GEOJSONMULTILINESTRING:
                positions = new Array();
                geometryType = Type.GEOMETRYMULTILINESTRING;
                for (const coordinate of coordinates) {
                    positions.push(Position3D.fromCoordinatesArray(coordinate));
                }
                break;
            case Type.GEOJSONPOLYGON:
                positions = new Array();
                geometryType = Type.GEOMETRYPOLYGON;
                for (const coordinate of coordinates) {
                    positions.push(Position3D.fromCoordinatesArray(coordinate));
                }
                break;
            case Type.GEOJSONMULTIPOLYGON:
                positions = new Array();
                geometryType = Type.GEOMETRYMULTIPOLYGON;
                for (const coordinate of coordinates) {
                    const linearRings = new Array();
                    for (const linearRing of coordinate) {
                        linearRings.push(Position3D.fromCoordinatesArray(linearRing));
                    }
                    positions.push(linearRings);
                }

        }

        return new Geometry(geometryType, positions, geojson);
    }
}

export default Geometry;
