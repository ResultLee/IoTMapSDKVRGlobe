import defined from '../../../../../../../Source/Core/defined.js';
import Mode from '../../../../../../Static/Mode.js';
import MeasureVerticalStyle from '../../../../../../Style/MeasureStyle/MeasureVerticalStyle.js';
import MultiGraphicProvider from '../MultiGraphicProvider.js';

class MeasureVerticalGraphic extends MultiGraphicProvider {
    constructor(options) {
        super(options);

        this._style = new MeasureVerticalStyle();
    }

    _setPosition(positions) {
        this.positions = positions;
        this._update = true;
    }

    update(frameState) {
        if (
            !this._show || this._positions ||
            !defined(this._mode) || !defined(this._graphis)
        ) {
            return;
        }
        if (this._update) {
            this._graphis = new Array();
            switch (this._mode) {
                case Mode.MEASUREVERTICAL:
                    this._style = 1;
                    break;
                case Mode.MEASUREHORIZONTAL:
                    this._style = 2;
                    break;
                case Mode.MEASURESLOPE:
                    this._style = 3;
                    break;
                case Mode.MEASUREAREA:
                    this._style = 4;
                    break;
            }
        }

        for (let i = 0; i < this._graphis.length; i++) {
            this._graphis.update(frameState);
        }
    }
}

export default MeasureVerticalGraphic;
