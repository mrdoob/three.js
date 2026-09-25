import { Module } from './Module.js';
import { CurveEditor } from '../CurveEditor.js';
import { evaluateSpline } from '../LUTMath.js';

const _tempRgb = [ 0, 0, 0 ];

export class CurvesModule extends Module {

	constructor( params = {}, onChange = null, onRemove = null, id = 'curves' ) {

		const defaultCurves = {
			rgb: [ { x: 0, y: 0 }, { x: 1, y: 1 } ],
			red: [ { x: 0, y: 0 }, { x: 1, y: 1 } ],
			green: [ { x: 0, y: 0 }, { x: 1, y: 1 } ],
			blue: [ { x: 0, y: 0 }, { x: 1, y: 1 } ]
		};

		const initialCurves = params.curves ? params.curves : ( params.rgb ? params : defaultCurves );

		super( id, 'Curves', { curves: JSON.parse( JSON.stringify( initialCurves ) ) } );

		this.onChange = onChange;

		const card = document.createElement( 'div' );
		card.className = 'lut-card curves-card';

		card.appendChild( this.createCardHeader( this.name, () => this.reset(), onRemove ) );

		this.curveEditor = new CurveEditor( {
			curves: this.params.curves,
			onChange: ( updatedCurves ) => {

				this.params.curves = updatedCurves;
				this.onParamChange();

			}
		} );

		card.appendChild( this.curveEditor.domElement );
		this.domElement = card;

	}

	applyPixel( r, g, b, target = _tempRgb ) {

		let cr = Math.max( 0, Math.min( 1, r ) );
		let cg = Math.max( 0, Math.min( 1, g ) );
		let cb = Math.max( 0, Math.min( 1, b ) );

		const { rgb, red, green, blue } = this.params.curves;

		if ( rgb && rgb.length > 0 ) {

			cr = evaluateSpline( cr, rgb );
			cg = evaluateSpline( cg, rgb );
			cb = evaluateSpline( cb, rgb );

		}

		if ( red && red.length > 0 ) {

			cr = evaluateSpline( cr, red );

		}

		if ( green && green.length > 0 ) {

			cg = evaluateSpline( cg, green );

		}

		if ( blue && blue.length > 0 ) {

			cb = evaluateSpline( cb, blue );

		}

		target[ 0 ] = Math.max( 0, Math.min( 1, cr ) );
		target[ 1 ] = Math.max( 0, Math.min( 1, cg ) );
		target[ 2 ] = Math.max( 0, Math.min( 1, cb ) );
		return target;

	}

	reset() {

		const defaultCurves = {
			rgb: [ { x: 0, y: 0 }, { x: 1, y: 1 } ],
			red: [ { x: 0, y: 0 }, { x: 1, y: 1 } ],
			green: [ { x: 0, y: 0 }, { x: 1, y: 1 } ],
			blue: [ { x: 0, y: 0 }, { x: 1, y: 1 } ]
		};

		this.params.curves = JSON.parse( JSON.stringify( defaultCurves ) );

		this.curveEditor.curves = this.params.curves;
		this.curveEditor.render();

		this.onParamChange();

	}

	updateUI() {

		this.curveEditor.setCurves( this.params.curves );

	}

}
