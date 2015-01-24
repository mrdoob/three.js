/**
 * @author benaadams / https://twitter.com/ben_a_adams
 */

THREE.DynamicBufferAttribute = function ( array, itemSize ) {

	THREE.BufferAttribute.call( this, array, itemSize );

	this.updateRange = { offset: 0, count: -1 };

};

THREE.DynamicBufferAttribute.prototype = {

	constructor: THREE.DynamicBufferAttribute,

	get length() {

		return this.array.length;

	},

	copyAt: function ( index1, attribute, index2 ) {

		index1 *= this.itemSize;
		index2 *= attribute.itemSize;

		for ( var i = 0, l = this.itemSize; i < l; i++ ) {

			this.array[index1 + i] = attribute.array[index2 + i];

		}

		this.markForUpdate( index1, this.itemSize );

	},

	set: function ( value, offset ) {

		if ( offset === undefined ) offset = 0;

		this.array.set( value, offset );

		this.markForUpdate( offset, value.length );

		return this;

	},

	setX: function ( index, x ) {

		index *= this.itemSize;

		this.array[index] = x;

		this.markForUpdate( index, 1 );

		return this;

	},

	setY: function ( index, y ) {

		index = index * this.itemSize + 1;

		this.array[index * this.itemSize + 1] = y;

		this.markForUpdate( index, 1 );

		return this;

	},

	setZ: function ( index, z ) {

		index = index * this.itemSize + 2;

		this.array[index * this.itemSize + 2] = z;

		this.markForUpdate( index, 1 );

		return this;

	},

	setXY: function ( index, x, y ) {

		index *= this.itemSize;

		this.array[index] = x;
		this.array[index + 1] = y;

		this.markForUpdate( index, 2 );

		return this;

	},

	setXYZ: function ( index, x, y, z ) {

		index *= this.itemSize;

		this.array[index] = x;
		this.array[index + 1] = y;
		this.array[index + 2] = z;

		this.markForUpdate( index, 3 );

		return this;

	},

	setXYZW: function ( index, x, y, z, w ) {

		index *= this.itemSize;

		this.array[index] = x;
		this.array[index + 1] = y;
		this.array[index + 2] = z;
		this.array[index + 3] = w;

		this.markForUpdate( index, 4 );

		return this;

	},

	markForUpdate: function ( offset, count ) {

		if ( this.updateRange.count <= 0 ) {

			this.updateRange.offset = offset;
			this.updateRange.count = count;

		} else {

			var end0 = offset + count;
			var end1 = this.updateRange.offset + this.updateRange.count;

			this.updateRange.offset = ( offset <= this.updateRange.offset ) ? offset : this.updateRange.offset;
			this.updateRange.count = ( ( end0 >= end1 ) ? end0 : end1 ) - this.updateRange.offset;

		}

		return this;

	},

	clone: function () {

		return new THREE.DynamicBufferAttribute( new this.array.constructor( this.array ), this.itemSize );

	}

};
