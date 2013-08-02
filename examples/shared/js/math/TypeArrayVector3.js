THREE.TypeArrayVector3 = function ( x, y, z ) {

	this.elements = new Float64Array( 3 );
	this.set( x, y, z );

};


THREE.TypeArrayVector3.prototype = {

	constructor: THREE.TypeArrayVector3,

	get x() {

		return this.elements[ 0 ];

	},

	set x( value ) {

		this.elements[ 0 ] = value;

	},

	get y() {

		return this.elements[ 1 ];

	},

	set y( value ) {

		this.elements[ 1 ] = value;

	},

	get z() {

		return this.elements[ 2 ];

	},

	set z( value ) {

		this.elements[ 2 ] = value;

	},

	set: function ( x, y, z ) {

		var elements = this.elements;

		elements[ 0 ] = x;
		elements[ 1 ] = y;
		elements[ 2 ] = z;

		return this;

	},

	copy: function ( v ) {

		var elements = this.elements;
		var velements = v.elements;

		elements[ 0 ] = velements[ 0 ];
		elements[ 1 ] = velements[ 1 ];
		elements[ 2 ] = velements[ 2 ];

		return this;

	},

	add: function ( v ) {

		var elements = this.elements;
		var velements = v.elements;

		elements[ 0 ] += velements[ 0 ];
		elements[ 1 ] += velements[ 1 ];
		elements[ 2 ] += velements[ 2 ];

		return this;

	},

	addVectors: function ( a, b ) {

		var elements = this.elements;
		var aelements = a.elements;
		var belements = b.elements;

		elements[ 0 ] = aelements[ 0 ] + belements[ 0 ];
		elements[ 1 ] = aelements[ 1 ] + belements[ 1 ];
		elements[ 2 ] = aelements[ 2 ] + belements[ 2 ];

		return this;

	},

	sub: function ( v, w ) {

		var elements = this.elements;
		var velements = v.elements;

		elements[ 0 ] -= velements[ 0 ];
		elements[ 1 ] -= velements[ 1 ];
		elements[ 2 ] -= velements[ 2 ];

		return this;

	},

	subVectors: function ( a, b ) {

		var elements = this.elements;
		var aelements = a.elements;
		var belements = b.elements;

		elements[ 0 ] = aelements[ 0 ] - belements[ 0 ];
		elements[ 1 ] = aelements[ 1 ] - belements[ 1 ];
		elements[ 2 ] = aelements[ 2 ] - belements[ 2 ];

		return this;

	}

}
