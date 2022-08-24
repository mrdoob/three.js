( function () {

	const _hsl = {};

	class ColorConverter {

		static setHSV( color, h, s, v ) {

			// https://gist.github.com/xpansive/1337890#file-index-js
			h = THREE.MathUtils.euclideanModulo( h, 1 );
			s = THREE.MathUtils.clamp( s, 0, 1 );
			v = THREE.MathUtils.clamp( v, 0, 1 );
			return color.setHSL( h, s * v / ( ( h = ( 2 - s ) * v ) < 1 ? h : 2 - h ), h * 0.5 );

		}

		static getHSV( color, target ) {

			color.getHSL( _hsl ); // based on https://gist.github.com/xpansive/1337890#file-index-js

			_hsl.s *= _hsl.l < 0.5 ? _hsl.l : 1 - _hsl.l;
			target.h = _hsl.h;
			target.s = 2 * _hsl.s / ( _hsl.l + _hsl.s );
			target.v = _hsl.l + _hsl.s;
			return target;

		}

	}

	THREE.ColorConverter = ColorConverter;

} )();
