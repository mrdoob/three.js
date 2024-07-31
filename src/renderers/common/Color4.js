import { Color } from '../../math/Color.js';
import { Vector4 } from '../../math/Vector4.js';

class Color4 extends Color {

	constructor( r, g, b, a = 1 ) {

		super( r, g, b );

		this.a = a;

	}

	set( r, g, b, a = 1 ) {

		this.a = a;

		return super.set( r, g, b );

	}

	setFromVector4( v ) {

		this.r = v.x;
		this.g = v.y;
		this.b = v.z;
		this.a = v.w;

		return this;

	}

	toVector4() {

		return new Vector4( this.r, this.g, this.b, this.a );

	}

	applyMatrix4( m ) {

		const r = this.r, g = this.g, b = this.b, a = this.a;
		const e = m.elements;

		this.r = e[ 0 ] * r + e[ 4 ] * g + e[ 8 ] * b + e[ 12 ] * a;
		this.g = e[ 1 ] * r + e[ 5 ] * g + e[ 9 ] * b + e[ 13 ] * a;
		this.b = e[ 2 ] * r + e[ 6 ] * g + e[ 10 ] * b + e[ 14 ] * a;
		this.a = e[ 3 ] * r + e[ 7 ] * g + e[ 11 ] * b + e[ 15 ] * a;

		return this;

	}

	copy( color ) {

		if ( color.a !== undefined ) this.a = color.a;

		return super.copy( color );

	}

	clone() {

		return new this.constructor( this.r, this.g, this.b, this.a );

	}

}

export default Color4;
