/**
 * @author raub / https://github.com/raub
 */

/**
 * Element size is one of:
 * gl.FLOAT: 4
 * gl.UNSIGNED_SHORT: 2
 * gl.SHORT: 2
 * gl.UNSIGNED_INT: 4
 * gl.INT: 4
 * gl.BYTE: 1
 * gl.UNSIGNED_BYTE: 1
 */
function GLBufferAttribute( buffer, type, itemSize, elementSize, count ) {

	this.buffer = buffer;
	this.type = type;
	this.itemSize = itemSize;
	this.elementSize = elementSize;
	this.count = count;

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

	setType: function ( type, elementSize ) {

		this.type = type;
		this.elementSize = elementSize;

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
