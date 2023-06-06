/* eslint-disable no-case-declarations */
import defined from '../../../Source/Core/defined.js';
import DeveloperError from '../../../Source/Core/DeveloperError.js';
import Event from '../../../Source/Core/Event.js';
import ScreenSpaceEventHandler from '../../../Source/Core/ScreenSpaceEventHandler.js';
import ScreenSpaceEventType from '../../../Source/Core/ScreenSpaceEventType.js';
import Default from '../../Static/Default.js';
import Type from '../../Static/Type.js';
import LineStringStyle from '../../Style/LineStringStyle/LineStringStyle.js';
import PointStyle from '../../Style/PointStyle/PointStyle.js';
import PolygonStyle from '../../Style/PolygonStyle/PolygonStyle.js';
import GraphicsLayer from '../Layer/GraphicsLayer/GraphicsLayer.js';

class Editor {
    constructor() {
        this._state = 0;
        this._activate = false;

        this._graphic = undefined;
        this._anchorGraphic = undefined;
        this._editorGraphic = undefined;

        this._anchorIndex = -1;

        this._leftUpEvent = new Event();
        this._leftDownEvent = new Event();
        this._mouseMoveEvent = new Event();

        this._layer = new GraphicsLayer();
        this._handler = new ScreenSpaceEventHandler();

        this._update = true;
    }

    activate(graphic) {
        if (!defined(graphic)) {
            throw new DeveloperError('用于编辑的graphic对象不能为空!');
        }

        let positions;
        this.unActivate();
        this._style = graphic._style.clone();
        switch (graphic.type) {
            case Type.GRAPHICSPOINT:
                positions = graphic._geometry.position;
                this._editorGraphic = this._layer.add(Type.GRAPHICSPOINT, {
                    position: positions.clone(),
                    name: Default.EDITORPOINTINDEX + 0,
                    style: new PointStyle({
                        color: Default.EDITORANCHORPOINT,
                        pixelSize: Default.EDITORANCHORSIZE
                    })
                });
                break;
            case Type.GRAPHICSLINESTRING:
                positions = graphic._geometry.positions;
                for (let i = 0; i < positions.length; i++) {
                    this._layer.add(Type.GRAPHICSPOINT, {
                        position: positions[i].clone(),
                        name: Default.EDITORPOINTINDEX + i,
                        style: new PointStyle({
                            color: Default.EDITORANCHORPOINT,
                            pixelSize: Default.EDITORANCHORSIZE
                        })
                    });
                }
                this._editorGraphic = this._layer.add(Type.GRAPHICSLINESTRING, {
                    positions: positions.slice(),
                    style: new LineStringStyle({
                        width: Default.EDITORPOLYLINEWIDTH,
                        color: Default.EDITORPOLYLINCOLOR
                    })
                });
                break;
            case Type.GRAPHICSPOLYGON:
                positions = graphic._geometry.positions[0];
                for (let i = 0; i < positions.length; i++) {
                    this._layer.add(Type.GRAPHICSPOINT, {
                        position: positions[i].clone(),
                        name: Default.EDITORPOINTINDEX + i,
                        style: new PointStyle({
                            color: Default.EDITORANCHORPOINT,
                            pixelSize: Default.EDITORANCHORSIZE
                        })
                    });
                }

                this._editorGraphic = this._layer.add(Type.GRAPHICSPOLYGON, {
                    positions: [positions.slice()],
                    style: new PolygonStyle({
                        fill: true,
                        outline: true,
                        fillColor: Default.EDITORFILLCOLOR,
                        outlineColor: Default.EDITOROUTCOLOR
                    })
                });
                break;
            default:
                throw new DeveloperError('不支持的数据类型!');
        }
        graphic.show = false;
        this._graphic = graphic;

        const that = this;
        this._activate = true;
        this._handler.setInputAction((movement) => {
            if (!that._activate || that._state > 0) {
                return;
            }
            that._leftDownEvent.raiseEvent(movement.position);
        }, ScreenSpaceEventType.LEFT_DOWN);

        this._handler.setInputAction((movement) => {
            if (!that._activate) {
                return;
            }
            that._leftUpEvent.raiseEvent(movement.position, that._graphic);
        }, ScreenSpaceEventType.LEFT_UP);

        this._handler.setInputAction(function (event) {
            if (!that._activate || that._state !== 1) {
                return;
            }
            that._mouseMoveEvent.raiseEvent(event.endPosition);
        }, ScreenSpaceEventType.MOUSE_MOVE);
    }

    unActivate() {
        this._state = 0;
        this._layer.removeAll();
        this._activate = false;

        this._handler.removeInputAction(ScreenSpaceEventType.LEFT_UP);
        this._handler.removeInputAction(ScreenSpaceEventType.LEFT_DOWN);

        if (defined(this._graphic)) {
            this._graphic.show = true;
        }
        this._style = undefined;

        this._graphic = undefined;
        this._anchorGraphic = undefined;
        this._editorGraphic = undefined;

        this._anchorIndex = -1;
    }

    save() {
        if (!defined(this._graphic) || !defined(this._editorGraphic)) {
            return;
        }

        let positions;
        switch (this._graphic.type) {
            case Type.GRAPHICSPOINT:
                positions = this._editorGraphic._geometry.position;
                this._graphic._setPosition(positions.clone());
                break;
            case Type.GRAPHICSLINESTRING:
                positions = this._editorGraphic._geometry.positions;
                this._graphic._setPosition(positions.slice());
                break;
            case Type.GRAPHICSPOLYGON:
                positions = this._editorGraphic._geometry.positions[0];
                this._graphic._setPosition([positions.slice()]);
                break;
        }

    }

    reset() {
        const graphic = this._graphic;
        this.activate(graphic);
    }

    update(frameState) {
        if (this._activate) {
            this._layer.update(frameState);
        }
    }
}

export default Editor;
