import { Module } from './Module.js';
import { ColorWheel } from '../ColorWheel.js';

const _tempRgb = [ 0, 0, 0 ];

export class ColorWheelModule extends Module {

	constructor( mode, title, initialParams = {}, onChange = null, onRemove = null, id = null ) {

		const defaultWheelParams = { r: 0, g: 0, b: 0, y: 0 };
		const mergedParams = Object.assign( {}, defaultWheelParams, initialParams );

		super( id || mode, title, mergedParams );

		this.mode = mode; // 'lift', 'gammaBal', 'gain', 'offset'
		this.onChange = onChange;
		this.onRemove = onRemove;

		this.wheel = new ColorWheel( this.name, this.params, ( updatedVal ) => {

			Object.assign( this.params, updatedVal );
			this.onParamChange();

		}, onRemove );

		this.domElement = this.wheel.domElement;

	}

	applyPixel( r, g, b, target = _tempRgb ) {

		const { r: pr, g: pg, b: pb, y: py } = this.params;

		switch ( this.mode ) {

			case 'lift': {

				const lr = pr + py;
				const lg = pg + py;
				const lb = pb + py;

				target[ 0 ] = r + lr * ( 1 - Math.max( 0, Math.min( 1, r ) ) );
				target[ 1 ] = g + lg * ( 1 - Math.max( 0, Math.min( 1, g ) ) );
				target[ 2 ] = b + lb * ( 1 - Math.max( 0, Math.min( 1, b ) ) );
				return target;

			}

			case 'gammaBal': {

				const gr = Math.pow( 2.0, - ( pr + py ) );
				const gg = Math.pow( 2.0, - ( pg + py ) );
				const gb = Math.pow( 2.0, - ( pb + py ) );

				target[ 0 ] = r > 0 ? Math.pow( r, gr ) : r;
				target[ 1 ] = g > 0 ? Math.pow( g, gg ) : g;
				target[ 2 ] = b > 0 ? Math.pow( b, gb ) : b;
				return target;

			}

			case 'gain': {

				const sr = Math.max( 0, 1.0 + pr + py );
				const sg = Math.max( 0, 1.0 + pg + py );
				const sb = Math.max( 0, 1.0 + pb + py );

				target[ 0 ] = r * sr;
				target[ 1 ] = g * sg;
				target[ 2 ] = b * sb;
				return target;

			}

			case 'offset': {

				target[ 0 ] = r + pr + py;
				target[ 1 ] = g + pg + py;
				target[ 2 ] = b + pb + py;
				return target;

			}

			default:
				target[ 0 ] = r;
				target[ 1 ] = g;
				target[ 2 ] = b;
				return target;

		}

	}

	reset() {

		this.params.r = 0;
		this.params.g = 0;
		this.params.b = 0;
		this.params.y = 0;

		this.wheel.setValues( 0, 0, 0, 0 );
		this.onParamChange();

	}

	updateUI() {

		this.wheel.setValues( this.params.r, this.params.g, this.params.b, this.params.y );

	}

}
