import Cartesian3 from '../../../../Source/Core/Cartesian3.js';
import Cartographic from '../../../../Source/Core/Cartographic.js';
import createGuid from '../../../../Source/Core/createGuid.js';
import defaultValue from '../../../../Source/Core/defaultValue.js';
import defined from '../../../../Source/Core/defined.js';
import destroyObject from '../../../../Source/Core/destroyObject.js';
import DeveloperError from '../../../../Source/Core/DeveloperError.js';
import CesiumMath from '../../../../Source/Core/Math.js';
import Matrix3 from '../../../../Source/Core/Matrix3.js';
import Matrix4 from '../../../../Source/Core/Matrix4.js';
import Transforms from '../../../../Source/Core/Transforms.js';
import Cesium3DTileset from '../../../../Source/Scene/Cesium3DTileset.js';
import Position3D from '../../Units/Position3D.js';

function getPositionByMatrix(matrix4) {
    const cartographic = Cartographic.fromCartesian(
        new Cartesian3(matrix4[12], matrix4[13], matrix4[14])
    );

    if (defined(cartographic)) {
        return new Position3D(
            CesiumMath.toDegrees(cartographic.longitude),
            CesiumMath.toDegrees(cartographic.latitude),
            cartographic.height
        );
    }

    return undefined;
}

function setMatrixByPosition(position, provider) {
    const mx = Matrix3.fromRotationX(CesiumMath.toRadians(provider._rotateX));
    const my = Matrix3.fromRotationY(CesiumMath.toRadians(provider._rotateY));
    const mz = Matrix3.fromRotationZ(CesiumMath.toRadians(provider._rotateZ));
    const rotationX = Matrix4.fromRotationTranslation(mx);
    const rotationY = Matrix4.fromRotationTranslation(my);
    const rotationZ = Matrix4.fromRotationTranslation(mz);

    //平移
    const cartesian3 = Cartesian3.fromPosition(position);
    const m = Transforms.eastNorthUpToFixedFrame(cartesian3);

    //缩放
    const scale = Matrix4.fromUniformScale(provider._scale);
    Matrix4.multiply(m, scale, m);

    //旋转、平移矩阵相乘
    Matrix4.multiply(m, rotationX, m);
    Matrix4.multiply(m, rotationY, m);
    Matrix4.multiply(m, rotationZ, m);

    provider._tileset.root.transform = m;

    const cartographic = Cartographic.fromCartesian(cartesian3);
    return new Position3D(
        CesiumMath.toDegrees(cartographic.longitude),
        CesiumMath.toDegrees(cartographic.latitude),
        cartographic.height
    );
}

class TilesetProvider {
    constructor(url, options) {
        if (!defined(url)) {
            throw new DeveloperError('用于创建TilesetLayer的url值不能为空!');
        }
        options = defaultValue(options, new Object());

        options.url = url;
        options.show = defaultValue(options.show, true);
        options.preferLeaves = defaultValue(options.preferLeaves, false);
        options.skipLevelOfDetail = defaultValue(options.skipLevelOfDetail, true);
        options.maximumMemoryUsage = defaultValue(options.maximumMemoryUsage, 512);
        options.maximumScreenSpaceError = defaultValue(options.maximumScreenSpaceError, 16);

        this._tileset = new Cesium3DTileset(options);

        this.name = options.name;
        this._id = defaultValue(options.id, createGuid());

        this._rotateX = 0;
        this._rotateY = 0;
        this._rotateZ = 0;
        this._scale = 1.0;

        const that = this;
        this._tileset.readyPromise.then(tileset => {
            that._position = getPositionByMatrix(tileset.root.transform);
        });
    }

    get show() {
        return this._tileset.show;
    }

    set show(value) {
        this._tileset.show = value;
    }

    get preferLeaves() {
        return this._tileset.preferLeaves;
    }

    set preferLeaves(value) {
        this._tileset.preferLeaves = value;
    }

    get skipLevelOfDetail() {
        return this._tileset.skipLevelOfDetail;
    }

    set skipLevelOfDetail(value) {
        this._tileset.skipLevelOfDetail = value;
    }

    get maximumMemoryUsage() {
        return this._tileset.maximumMemoryUsage;
    }

    set maximumMemoryUsage(value) {
        this._tileset.maximumMemoryUsage = value;
    }

    get maximumScreenSpaceError() {
        return this._tileset.maximumScreenSpaceError;
    }

    set maximumScreenSpaceError(value) {
        this._tileset.maximumScreenSpaceError = value;
    }

    get ready() {
        return this._tileset.ready;
    }

    get readyPromise() {
        const that = this;
        return new Promise((resolve) => {
            that._tileset.readyPromise.then(data => {
                resolve(that);
            });
        });
    }

    get url() {
        return this._tileset._url;
    }

    get position() {
        return this._position;
    }

    set position(value) {
        if (!this.ready) {
            return;
        }

        if (!(value instanceof Position3D)) {
            throw new DeveloperError('设置的Position的值类型必须为Position3D!');
        }

        this._position = setMatrixByPosition(value, this);
    }

    get height() {
        return this._position.altitude;
    }

    set height(value) {
        this.position = new Position3D(
            this._position.longitude,
            this._position.latitude,
            value
        );
    }

    get scale() {
        return this._scale;
    }

    set scale(value) {
        this._scale = value;
        this.position = this.position.clone();
    }

    get rotationX() {
        return this._rotateX;
    }

    set rotationX(value) {
        let sita = value - this._rotateX;
        sita = sita > 360.0 ? sita %= 360.0 : sita;

        if (sita !== 0 && this.ready) {
            const mx = Matrix3.fromRotationX(CesiumMath.toRadians(sita));
            const rotationX = Matrix4.fromRotationTranslation(mx);
            Matrix4.multiply(this._tileset.root.transform, rotationX, this._tileset.root.transform);

            this._rotateX += sita;
            this._rotateX = this._rotateX > 360.0 ? (this._rotateX %= 360.0) : this._rotateX;
        }
    }

    get rotationY() {
        return this._rotateY;
    }

    set rotationY(value) {
        let sita = value - this._rotateY;
        sita = sita > 360.0 ? sita %= 360.0 : sita;
        if (sita !== 0 && this.ready) {
            const my = Matrix3.fromRotationY(CesiumMath.toRadians(sita));
            const rotationY = Matrix4.fromRotationTranslation(my);
            Matrix4.multiply(this._tileset.root.transform, rotationY, this._tileset.root.transform);

            this._rotateY += sita;
            this._rotateY = this._rotateY > 360.0 ? (this._rotateY %= 360.0) : this._rotateY;
        }
    }

    get rotationZ() {
        return this._rotateZ;
    }

    set rotationZ(value) {
        let sita = value - this._rotateZ;
        sita = sita > 360.0 ? sita %= 360.0 : sita;
        if (sita !== 0 && this.ready) {
            const mz = Matrix3.fromRotationZ(CesiumMath.toRadians(sita));
            const rotationZ = Matrix4.fromRotationTranslation(mz);
            Matrix4.multiply(this._tileset.root.transform, rotationZ, this._tileset.root.transform);

            this._rotateZ += sita;
            this._rotateZ = this._rotateZ > 360.0 ? (this._rotateZ %= 360.0) : this._rotateZ;
        }
    }

    update(frameState) {
        if (defined(this._tileset) && this.ready) {
            this._tileset.update(frameState);
        }
    }

    prePassesUpdate(frameState) {
        if (defined(this._tileset) && this.ready) {
            this._tileset.prePassesUpdate(frameState);
        }
    }

    postPassesUpdate(frameState) {
        if (defined(this._tileset) && this.ready) {
            this._tileset.postPassesUpdate(frameState);
        }
    }

    isDestroyed() {
        return false;
    }

    destroy() {
        destroyObject(this);
    }
}

export default TilesetProvider;
