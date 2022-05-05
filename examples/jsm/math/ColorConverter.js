import {
	MathUtils
} from 'three';

const _hsl = {};

class ColorConverter {

	static setHSV( color, h, s, v ) {

		// https://gist.github.com/xpansive/1337890#file-index-js

		h = MathUtils.euclideanModulo( h, 1 );
		s = MathUtils.clamp( s, 0, 1 );
		v = MathUtils.clamp( v, 0, 1 );

		return color.setHSL( h, ( s * v ) / ( ( h = ( 2 - s ) * v ) < 1 ? h : ( 2 - h ) ), h * 0.5 );

	}

	static getHSV( color, target ) {

		if ( target === undefined ) {

			console.warn( 'THREE.ColorConverter: .getHSV() target is now required' );
			target = { h: 0, s: 0, l: 0 };

		}

		color.getHSL( _hsl );

		// based on https://gist.github.com/xpansive/1337890#file-index-js
		_hsl.s *= ( _hsl.l < 0.5 ) ? _hsl.l : ( 1 - _hsl.l );

		target.h = _hsl.h;
		target.s = 2 * _hsl.s / ( _hsl.l + _hsl.s );
		target.v = _hsl.l + _hsl.s;

		return target;

	}

	// where c, m, y, k is between 0 and 1

	static setCMYK( color, c, m, y, k ) {

		const r = ( 1 - c ) * ( 1 - k );
		const g = ( 1 - m ) * ( 1 - k );
		const b = ( 1 - y ) * ( 1 - k );

		return color.setRGB( r, g, b );

	}

	static getCMYK( color, target ) {

		if ( target === undefined ) {

			console.warn( 'THREE.ColorConverter: .getCMYK() target is now required' );
			target = { c: 0, m: 0, y: 0, k: 0 };

		}

		const r = color.r;
		const g = color.g;
		const b = color.b;

		const k = 1 - Math.max( r, g, b );
		const c = ( 1 - r - k ) / ( 1 - k );
		const m = ( 1 - g - k ) / ( 1 - k );
		const y = ( 1 - b - k ) / ( 1 - k );

		target.c = c;
		target.m = m;
		target.y = y;
		target.k = k;

		return target;

	}

}

export { ColorConverter };
