import { _Math } from '../math/Math.js';

/**
 * @author raub / https://github.com/raub
 */


function GLBufferAttribute( gl, buffer, type, itemSize, count, normalized ) {

	this.sizes = [
		[ gl.FLOAT, 4 ],
		[ gl.UNSIGNED_SHORT, 2 ],
		[ gl.SHORT, 2 ],
		[ gl.UNSIGNED_INT, 4 ],
		[ gl.INT, 4 ],
		[ gl.BYTE, 1 ],
		[ gl.UNSIGNED_BYTE, 1 ],
	].reduce( function ( accum, current ) {

		accum[ current[ 0 ] ] = current[ 1 ];
		return accum;

	}, {} );

	if ( ! this.sizes[ type ] ) {

		throw new TypeError( 'THREE.GLBufferAttribute: unsupported GL data type.' );

	}

	this.uuid = _Math.generateUUID();

	this.buffer = buffer;
	this.type = type;
	this.itemSize = itemSize;
	this.elementSize = this.sizes[ type ];
	this.count = count;
	this.normalized = normalized === true;

	this.version = 0;

}

Object.defineProperty( GLBufferAttribute.prototype, 'needsUpdate', {

	set: function ( value ) {

		if ( value === true ) this.version ++;

	}

} );

Object.assign( GLBufferAttribute.prototype, {

	isGLBufferAttribute: true,

	setBuffer: function ( buffer ) {

		this.buffer = buffer;

		return this;

	},

	setType: function ( type ) {

		if ( ! this.sizes[ type ] ) {

			throw new TypeError( 'THREE.GLBufferAttribute: unsupported GL data type.' );

		}

		this.type = type;
		this.elementSize = this.sizes[ type ];

		return this;

	},

	setItemSize: function ( itemSize ) {

		this.itemSize = itemSize;

		return this;

	},

	setCount: function ( count ) {

		this.count = count;

		return this;

	},

} );


export { GLBufferAttribute };
