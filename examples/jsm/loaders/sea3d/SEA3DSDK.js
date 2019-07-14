/**
 * 	SEA3DSDK
 * 	@author Sunag / http://www.sunag.com.br/
 */

'use strict';

var SEA3DSDK = { VERSION: 18110 };

SEA3DSDK.getVersion = function () {

	// Max = 16777215 - VV.S.S.BB  | V = Version | S = Subversion | B = Buildversion
	var v = SEA3DSDK.VERSION.toString(), l = v.length;
	return v.substring( 0, l - 4 ) + "." + v.substring( l - 4, l - 3 ) + "." + v.substring( l - 3, l - 2 ) + "." + parseFloat( v.substring( l - 2, l ) ).toString();

};

console.log( 'SEA3D ' + SEA3DSDK.getVersion() );

//
//	STREAM : STANDARD DATA-IO ( LITTLE-ENDIAN )
//

SEA3DSDK.Stream = function ( buffer ) {

	this.position = 0;
	this.buffer = buffer || new ArrayBuffer();

};

SEA3DSDK.Stream.NONE = 0;

// 1D = 0 at 31
SEA3DSDK.Stream.BOOLEAN = 1;

SEA3DSDK.Stream.BYTE = 2;
SEA3DSDK.Stream.UBYTE = 3;

SEA3DSDK.Stream.SHORT = 4;
SEA3DSDK.Stream.USHORT = 5;

SEA3DSDK.Stream.INT24 = 6;
SEA3DSDK.Stream.UINT24 = 7;

SEA3DSDK.Stream.INT = 8;
SEA3DSDK.Stream.UINT = 9;

SEA3DSDK.Stream.FLOAT = 10;
SEA3DSDK.Stream.DOUBLE = 11;
SEA3DSDK.Stream.DECIMAL = 12;

// 2D = 32 at 63

// 3D = 64 at 95
SEA3DSDK.Stream.VECTOR3D = 74;

// 4D = 96 at 127
SEA3DSDK.Stream.VECTOR4D = 106;

// Undefined Size = 128 at 255
SEA3DSDK.Stream.STRING_TINY = 128;
SEA3DSDK.Stream.STRING_SHORT = 129;
SEA3DSDK.Stream.STRING_LONG = 130;

SEA3DSDK.Stream.ASSET = 200;
SEA3DSDK.Stream.GROUP = 255;

SEA3DSDK.Stream.BLEND_MODE = [
	"normal", "add", "subtract", "multiply", "dividing", "mix", "alpha", "screen", "darken",
	"overlay", "colorburn", "linearburn", "lighten", "colordodge", "lineardodge",
	"softlight", "hardlight", "pinlight", "spotlight", "spotlightblend", "hardmix",
	"average", "difference", "exclusion", "hue", "saturation", "color", "value",
	"linearlight", "grainextract", "reflect", "glow", "darkercolor", "lightercolor", "phoenix", "negation"
];

SEA3DSDK.Stream.INTERPOLATION_TABLE =	[
	"normal", "linear",
	"sine.in", "sine.out", "sine.inout",
	"cubic.in", "cubic.out", "cubic.inout",
	"quint.in", "quint.out", "quint.inout",
	"circ.in", "circ.out", "circ.inout",
	"back.in", "back.out", "back.inout",
	"quad.in", "quad.out", "quad.inout",
	"quart.in", "quart.out", "quart.inout",
	"expo.in", "expo.out", "expo.inout",
	"elastic.in", "elastic.out", "elastic.inout",
	"bounce.in", "bounce.out", "bounce.inout"
];

SEA3DSDK.Stream.sizeOf = function ( kind ) {

	if ( kind === 0 ) return 0;
	else if ( kind >= 1 && kind <= 31 ) return 1;
	else if ( kind >= 32 && kind <= 63 ) return 2;
	else if ( kind >= 64 && kind <= 95 ) return 3;
	else if ( kind >= 96 && kind <= 125 ) return 4;
	return - 1;

};

SEA3DSDK.Stream.prototype = {

	constructor: SEA3DSDK.Stream,

	set buffer( val ) {

		this.buf = val;
		this.data = new DataView( val );

	},

	get buffer() {

		return this.buf;

	},

	get bytesAvailable() {

		return this.length - this.position;

	},

	get length() {

		return this.buf.byteLength;

	}

};

SEA3DSDK.Stream.prototype.getByte = function ( pos ) {

	return this.data.getInt8( pos );

};

SEA3DSDK.Stream.prototype.readBytes = function ( len ) {

	var buf = this.buf.slice( this.position, this.position + len );
	this.position += len;
	return buf;

};

SEA3DSDK.Stream.prototype.readByte = function () {

	return this.data.getInt8( this.position ++ );

};

SEA3DSDK.Stream.prototype.readUByte = function () {

	return this.data.getUint8( this.position ++ );

};

SEA3DSDK.Stream.prototype.readBool = function () {

	return this.data.getInt8( this.position ++ ) != 0;

};

SEA3DSDK.Stream.prototype.readShort = function () {

	var v = this.data.getInt16( this.position, true );
	this.position += 2;
	return v;

};

SEA3DSDK.Stream.prototype.readUShort = function () {

	var v = this.data.getUint16( this.position, true );
	this.position += 2;
	return v;

};

SEA3DSDK.Stream.prototype.readUInt24 = function () {

	var v = this.data.getUint32( this.position, true ) & 0xFFFFFF;
	this.position += 3;
	return v;

};

SEA3DSDK.Stream.prototype.readUInt24F = function () {

	return this.readUShort() | ( this.readUByte() << 16 );

};

SEA3DSDK.Stream.prototype.readInt = function () {

	var v = this.data.getInt32( this.position, true );
	this.position += 4;
	return v;

};

SEA3DSDK.Stream.prototype.readUInt = function () {

	var v = this.data.getUint32( this.position, true );
	this.position += 4;
	return v;

};

SEA3DSDK.Stream.prototype.readFloat = function () {

	var v = this.data.getFloat32( this.position, true );
	this.position += 4;
	return v;

};

SEA3DSDK.Stream.prototype.readUInteger = function () {

	var v = this.readUByte(),
		r = v & 0x7F;

	if ( ( v & 0x80 ) != 0 ) {

		v = this.readUByte();
		r |= ( v & 0x7F ) << 7;

		if ( ( v & 0x80 ) != 0 ) {

			v = this.readUByte();
			r |= ( v & 0x7F ) << 13;

		}

	}

	return r;

};

SEA3DSDK.Stream.prototype.readVector2 = function () {

	return { x: this.readFloat(), y: this.readFloat() };

};

SEA3DSDK.Stream.prototype.readVector3 = function () {

	return { x: this.readFloat(), y: this.readFloat(), z: this.readFloat() };

};

SEA3DSDK.Stream.prototype.readVector4 = function () {

	return { x: this.readFloat(), y: this.readFloat(), z: this.readFloat(), w: this.readFloat() };

};

SEA3DSDK.Stream.prototype.readMatrix = function () {

	var mtx = new Float32Array( 16 );

	mtx[ 0 ] = this.readFloat();
	mtx[ 1 ] = this.readFloat();
	mtx[ 2 ] = this.readFloat();
	mtx[ 3 ] = 0.0;
	mtx[ 4 ] = this.readFloat();
	mtx[ 5 ] = this.readFloat();
	mtx[ 6 ] = this.readFloat();
	mtx[ 7 ] = 0.0;
	mtx[ 8 ] = this.readFloat();
	mtx[ 9 ] = this.readFloat();
	mtx[ 10 ] = this.readFloat();
	mtx[ 11 ] = 0.0;
	mtx[ 12 ] = this.readFloat();
	mtx[ 13 ] = this.readFloat();
	mtx[ 14 ] = this.readFloat();
	mtx[ 15 ] = 1.0;

	return mtx;

};

SEA3DSDK.Stream.prototype.decodeText = function ( array ) {

	if ( typeof TextDecoder !== 'undefined' ) {

		return new TextDecoder().decode( array );

	}

	// Avoid the String.fromCharCode.apply(null, array) shortcut, which
	// throws a "maximum call stack size exceeded" error for large arrays.

	var s = '';

	for ( var i = 0, il = array.length; i < il; i ++ ) {

		// Implicitly assumes little-endian.
		s += String.fromCharCode( array[ i ] );

	}

	// Merges multi-byte utf-8 characters.
	return decodeURIComponent( escape( s ) );

};

SEA3DSDK.Stream.prototype.readUTF8 = function ( len ) {

	var buffer = this.readBytes( len );

	return this.decodeText( new Uint8Array( buffer ) );

};

SEA3DSDK.Stream.prototype.readExt = function () {

	return this.readUTF8( 4 ).replace( /\0/g, "" );

};

SEA3DSDK.Stream.prototype.readUTF8Tiny = function () {

	return this.readUTF8( this.readUByte() );

};

SEA3DSDK.Stream.prototype.readUTF8Short = function () {

	return this.readUTF8( this.readUShort() );

};

SEA3DSDK.Stream.prototype.readUTF8Long = function () {

	return this.readUTF8( this.readUInt() );

};

SEA3DSDK.Stream.prototype.readUByteArray = function ( length ) {

	var v = new Uint8Array( length );

	SEA3DSDK.Stream.memcpy(
		v.buffer,
		0,
		this.buffer,
		this.position,
		length
	);

	this.position += length;

	return v;

};

SEA3DSDK.Stream.prototype.readUShortArray = function ( length ) {

	var v = new Uint16Array( length ),
		len = length * 2;

	SEA3DSDK.Stream.memcpy(
		v.buffer,
		0,
		this.buffer,
		this.position,
		len
	);

	this.position += len;

	return v;

};


SEA3DSDK.Stream.prototype.readUInt24Array = function ( length ) {

	var v = new Uint32Array( length );

	for ( var i = 0; i < length; i ++ ) {

		v[ i ] = this.readUInt24();

	}

	return v;

};


SEA3DSDK.Stream.prototype.readUIntArray = function ( length ) {

	var v = new Uint32Array( length ),
		len = length * 4;

	SEA3DSDK.Stream.memcpy(
		v.buffer,
		0,
		this.buffer,
		this.position,
		len
	);

	this.position += len;

	return v;

};

SEA3DSDK.Stream.prototype.readFloatArray = function ( length ) {

	var v = new Float32Array( length ),
		len = length * 4;

	SEA3DSDK.Stream.memcpy(
		v.buffer,
		0,
		this.buffer,
		this.position,
		len
	);

	this.position += len;

	return v;

};


SEA3DSDK.Stream.prototype.readBlendMode = function () {

	return SEA3DSDK.Stream.BLEND_MODE[ this.readUByte() ];

};

SEA3DSDK.Stream.prototype.readInterpolation = function () {

	return SEA3DSDK.Stream.INTERPOLATION_TABLE[ this.readUByte() ];

};

SEA3DSDK.Stream.prototype.readTags = function ( callback ) {

	var numTag = this.readUByte();

	for ( var i = 0; i < numTag; ++ i ) {

		var kind = this.readUShort();
		var size = this.readUInt();
		var pos = this.position;

		callback( kind, this, size );

		this.position = pos += size;

	}

};

SEA3DSDK.Stream.prototype.readProperties = function ( sea3d ) {

	var count = this.readUByte(),
		props = {}, types = {};

	props.__type = types;

	for ( var i = 0; i < count; i ++ ) {

		var name = this.readUTF8Tiny(),
			type = this.readUByte();

		types[ name ] = type;
		props[ name ] = type === SEA3DSDK.Stream.GROUP ? this.readProperties( sea3d ) : this.readToken( type, sea3d );

	}

	return props;

};

SEA3DSDK.Stream.prototype.readAnimationList = function ( sea3d ) {

	var list = [],
		count = this.readUByte();

	var i = 0;
	while ( i < count ) {

		var attrib = this.readUByte(),
			anm = {};

		anm.relative = ( attrib & 1 ) != 0;

		if ( attrib & 2 ) anm.timeScale = this.readFloat();

		anm.tag = sea3d.getObject( this.readUInt() );

		list[ i ++ ] = anm;

	}

	return list;

};

SEA3DSDK.Stream.prototype.readScriptList = function ( sea3d ) {

	var list = [],
		count = this.readUByte();

	var i = 0;
	while ( i < count ) {

		var attrib = this.readUByte(),
			script = {};

		script.priority = ( attrib & 1 ) | ( attrib & 2 );

		if ( attrib & 4 ) {

			var numParams = this.readUByte();

			script.params = {};

			for ( var j = 0; j < numParams; j ++ ) {

				var name = this.readUTF8Tiny();

				script.params[ name ] = this.readObject( sea3d );

			}

		}

		if ( attrib & 8 ) {

			script.method = this.readUTF8Tiny();

		}

		script.tag = sea3d.getObject( this.readUInt() );

		list[ i ++ ] = script;

	}

	return list;

};

SEA3DSDK.Stream.prototype.readObject = function ( sea3d ) {

	return this.readToken( this.readUByte(), sea3d );

};

SEA3DSDK.Stream.prototype.readToken = function ( type, sea3d ) {

	switch ( type )	{

		// 1D
		case SEA3DSDK.Stream.BOOLEAN:
			return this.readBool();
			break;

		case SEA3DSDK.Stream.UBYTE:
			return this.readUByte();
			break;

		case SEA3DSDK.Stream.USHORT:
			return this.readUShort();
			break;

		case SEA3DSDK.Stream.UINT24:
			return this.readUInt24();
			break;

		case SEA3DSDK.Stream.INT:
			return this.readInt();
			break;

		case SEA3DSDK.Stream.UINT:
			return this.readUInt();
			break;

		case SEA3DSDK.Stream.FLOAT:
			return this.readFloat();
			break;

		// 3D
		case SEA3DSDK.Stream.VECTOR3D:
			return this.readVector3();
			break;

		// 4D
		case SEA3DSDK.Stream.VECTOR4D:
			return this.readVector4();
			break;

		// Undefined Values
		case SEA3DSDK.Stream.STRING_TINY:
			return this.readUTF8Tiny();
			break;

		case SEA3DSDK.Stream.STRING_SHORT:
			return this.readUTF8Short();
			break;

		case SEA3DSDK.Stream.STRING_LONG:
			return this.readUTF8Long();
			break;

		case SEA3DSDK.Stream.ASSET:
			var asset = this.readUInt();
			return asset > 0 ? sea3d.getObject( asset - 1 ) : null;
			break;

		default:
			console.error( "DataType not found!" );

	}

	return null;

};

SEA3DSDK.Stream.prototype.readVector = function ( type, length, offset ) {

	var size = SEA3DSDK.Stream.sizeOf( type ),
		i = offset * size,
		count = i + ( length * size );

	switch ( type )	{

		// 1D
		case SEA3DSDK.Stream.BOOLEAN:

			return this.readUByteArray( count );


		case SEA3DSDK.Stream.UBYTE:

			return this.readUByteArray( count );


		case SEA3DSDK.Stream.USHORT:

			return this.readUShortArray( count );


		case SEA3DSDK.Stream.UINT24:

			return this.readUInt24Array( count );


		case SEA3DSDK.Stream.UINT:

			return this.readUIntArray( count );


		case SEA3DSDK.Stream.FLOAT:

			return this.readFloatArray( count );


		// 3D
		case SEA3DSDK.Stream.VECTOR3D:

			return this.readFloatArray( count );


		// 4D
		case SEA3DSDK.Stream.VECTOR4D:

			return this.readFloatArray( count );

	}

};

SEA3DSDK.Stream.prototype.append = function ( data ) {

	var buffer = new ArrayBuffer( this.data.byteLength + data.byteLength );

	SEA3DSDK.Stream.memcpy( buffer, 0, this.data.buffer, 0, this.data.byteLength );
	SEA3DSDK.Stream.memcpy( buffer, this.data.byteLength, data, 0, data.byteLength );

	this.buffer = buffer;

};

SEA3DSDK.Stream.prototype.concat = function ( position, length ) {

	return new SEA3DSDK.Stream( this.buffer.slice( position, position + length ) );

};

/**
 * @author DataStream.js
 */

SEA3DSDK.Stream.memcpy = function ( dst, dstOffset, src, srcOffset, byteLength ) {

	var dstU8 = new Uint8Array( dst, dstOffset, byteLength );
	var srcU8 = new Uint8Array( src, srcOffset, byteLength );

	dstU8.set( srcU8 );

};

//
//	UByteArray
//

SEA3DSDK.UByteArray = function () {

	this.ubytes = [];
	this.length = 0;

};

SEA3DSDK.UByteArray.prototype = {

	constructor: SEA3DSDK.UByteArray,

	add: function ( ubytes ) {

		this.ubytes.push( ubytes );
		this.length += ubytes.byteLength;

	},

	toBuffer: function () {

		var memcpy = new Uint8Array( this.length );

		for ( var i = 0, offset = 0; i < this.ubytes.length; i ++ ) {

			memcpy.set( this.ubytes[ i ], offset );
			offset += this.ubytes[ i ].byteLength;

		}

		return memcpy.buffer;

	}
};

//
//	Math
//

SEA3DSDK.Math = {
	RAD_TO_DEG: 180 / Math.PI,
	DEG_TO_RAD: Math.PI / 180
};

SEA3DSDK.Math.angle = function ( val ) {

	var ang = 180,
		inv = val < 0;

	val = ( inv ? - val : val ) % 360;

	if ( val > ang ) {

		val = - ang + ( val - ang );

	}

	return ( inv ? - val : val );

};

SEA3DSDK.Math.angleDiff = function ( a, b ) {

	a *= this.DEG_TO_RAD;
	b *= this.DEG_TO_RAD;

	return Math.atan2( Math.sin( a - b ), Math.cos( a - b ) ) * this.RAD_TO_DEG;

};

SEA3DSDK.Math.angleArea = function ( angle, target, area ) {

	return Math.abs( this.angleDiff( angle, target ) ) <= area;

};

SEA3DSDK.Math.direction = function ( x1, y1, x2, y2 ) {

	return Math.atan2( y2 - y1, x2 - x1 );

};

SEA3DSDK.Math.physicalLerp = function ( val, to, deltaTime, duration ) {

	var t = deltaTime / duration;

	if ( t > 1 ) t = 1;

	return val + ( ( to - val ) * t );

};

SEA3DSDK.Math.physicalAngle = function ( val, to, deltaTime, duration ) {

	if ( Math.abs( val - to ) > 180 ) {

		if ( val > to ) {

			to += 360;

		} else {

			to -= 360;

		}

	}

	var t = deltaTime / duration;

	if ( t > 1 ) t = 1;

	return this.angle( val + ( ( to - val ) * t ) );

};

SEA3DSDK.Math.zero = function ( value, precision ) {

	precision = precision || 1.0E-3;

	var pValue = value < 0 ? - value : value;

	if ( pValue - precision < 0 ) value = 0;

	return value;

};

SEA3DSDK.Math.round = function ( value, precision ) {

	precision = Math.pow( 10, precision );

	return Math.round( value * precision ) / precision;

};

SEA3DSDK.Math.lerpAngle = function ( val, tar, t ) {

	if ( Math.abs( val - tar ) > 180 ) {

		if ( val > tar ) {

			tar += 360;

		} else {

			tar -= 360;

		}

	}

	val += ( tar - val ) * t;

	return SEA3DSDK.Math.angle( val );

};

SEA3DSDK.Math.lerpColor = function ( val, tar, t ) {

	var a0 = val >> 24 & 0xff,
		r0 = val >> 16 & 0xff,
		g0 = val >> 8 & 0xff,
		b0 = val & 0xff;

	var a1 = tar >> 24 & 0xff,
		r1 = tar >> 16 & 0xff,
		g1 = tar >> 8 & 0xff,
		b1 = tar & 0xff;

	a0 += ( a1 - a0 ) * t;
	r0 += ( r1 - r0 ) * t;
	g0 += ( g1 - g0 ) * t;
	b0 += ( b1 - b0 ) * t;

	return a0 << 24 | r0 << 16 | g0 << 8 | b0;

};

SEA3DSDK.Math.lerp = function ( val, tar, t ) {

	return val + ( ( tar - val ) * t );

};

//
//	Timer
//

SEA3DSDK.Timer = function () {

	this.time = this.start = Date.now();

};

SEA3DSDK.Timer.prototype = {

	constructor: SEA3DSDK.Timer,

	get now() {

		return Date.now();

	},

	get deltaTime() {

		return Date.now() - this.time;

	},

	get elapsedTime() {

		return Date.now() - this.start;

	},

	update: function () {

		this.time = Date.now();

	}
};

//
//	Object
//

SEA3DSDK.Object = function ( name, data, type, sea3d ) {

	this.name = name;
	this.data = data;
	this.type = type;
	this.sea3d = sea3d;

};

//
//	Geometry Base
//

SEA3DSDK.GeometryBase = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	this.attrib = data.readUShort();

	this.isBig = ( this.attrib & 1 ) != 0;

	// variable uint
	data.readVInt = this.isBig ? data.readUInt : data.readUShort;

	this.numVertex = data.readVInt();

	this.length = this.numVertex * 3;

};

//
//	Geometry
//

SEA3DSDK.Geometry = function ( name, data, sea3d ) {

	SEA3DSDK.GeometryBase.call( this, name, data, sea3d );

	var i, j, len;

	// NORMAL
	if ( this.attrib & 4 ) {

		this.normal = data.readFloatArray( this.length );

	}

	// TANGENT
	if ( this.attrib & 8 ) {

		this.tangent = data.readFloatArray( this.length );

	}

	// UV
	if ( this.attrib & 32 ) {

		var uvCount = data.readUByte();

		if ( uvCount ) {

			this.uv = [];

			len = this.numVertex * 2;

			i = 0;
			while ( i < uvCount ) {

				// UV VERTEX DATA
				this.uv[ i ++ ] = data.readFloatArray( len );

			}

		}

	}

	// JOINT-INDEXES / WEIGHTS
	if ( this.attrib & 64 ) {

		this.jointPerVertex = data.readUByte();

		var jntLen = this.numVertex * this.jointPerVertex;

		this.joint = data.readUShortArray( jntLen );
		this.weight = data.readFloatArray( jntLen );

	}

	// VERTEX_COLOR
	if ( this.attrib & 128 ) {

		var colorAttrib = data.readUByte();

		var colorCount = data.readUByte();

		if ( colorCount ) {

			this.numColor = ( ( ( colorAttrib & 64 ) >> 6 ) | ( ( colorAttrib & 128 ) >> 6 ) ) + 1;

			this.color = [];

			for ( i = 0 & 15; i < colorCount; i ++ ) {

				this.color.push( data.readFloatArray( this.numVertex * this.numColor ) );

			}

		}

	}

	// VERTEX
	this.vertex = data.readFloatArray( this.length );

	// SUB-MESHES
	var count = data.readUByte();

	this.groups = [];

	if ( this.attrib & 1024 ) {

		// INDEXES
		for ( i = 0, len = 0; i < count; i ++ ) {

			j = data.readVInt() * 3;

			this.groups.push( {
				start: len,
				count: j
			} );

			len += j;

		}

		if ( ! ( this.attrib & 2048 ) ) {

			this.indexes = this.isBig ? data.readUIntArray( len ) : data.readUShortArray( len );

		}

	} else {

		// INDEXES
		var stride = this.isBig ? 4 : 2,
			bytearray = new SEA3DSDK.UByteArray();

		for ( i = 0, j = 0; i < count; i ++ ) {

			len = data.readVInt() * 3;

			this.groups.push( {
				start: j,
				count: len
			} );

			j += len;

			bytearray.add( data.readUByteArray( len * stride ) );

		}

		this.indexes = this.isBig ? new Uint32Array( bytearray.toBuffer() ) : new Uint16Array( bytearray.toBuffer() );

	}

};

SEA3DSDK.Geometry.prototype = Object.create( SEA3DSDK.GeometryBase.prototype );
SEA3DSDK.Geometry.prototype.constructor = SEA3DSDK.Geometry;

SEA3DSDK.Geometry.prototype.type = "geo";

//
//	Object3D
//

SEA3DSDK.Object3D = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	this.isStatic = false;
	this.visible = true;

	this.attrib = data.readUShort();

	if ( this.attrib & 1 ) this.parent = sea3d.getObject( data.readUInt() );

	if ( this.attrib & 2 ) this.animations = data.readAnimationList( sea3d );

	if ( this.attrib & 4 ) this.scripts = data.readScriptList( sea3d );

	if ( this.attrib & 16 ) this.attributes = sea3d.getObject( data.readUInt() );

	if ( this.attrib & 32 ) {

		var objectType = data.readUByte();

		this.isStatic = ( objectType & 1 ) !== 0;
		this.visible = ( objectType & 2 ) === 0;

	}

};

SEA3DSDK.Object3D.prototype.readTag = function ( kind, data, size ) {

};

//
//	Entity3D
//

SEA3DSDK.Entity3D = function ( name, data, sea3d ) {

	SEA3DSDK.Object3D.call( this, name, data, sea3d );

	this.castShadows = true;

	if ( this.attrib & 64 ) {

		var lightType = data.readUByte();

		this.castShadows = ( lightType & 1 ) === 0;

	}

};

SEA3DSDK.Entity3D.prototype = Object.create( SEA3DSDK.Object3D.prototype );
SEA3DSDK.Entity3D.prototype.constructor = SEA3DSDK.Entity3D;

//
//	Sound3D
//

SEA3DSDK.Sound3D = function ( name, data, sea3d ) {

	SEA3DSDK.Object3D.call( this, name, data, sea3d );

	this.autoPlay = ( this.attrib & 64 ) != 0;

	if ( this.attrib & 128 ) this.mixer = sea3d.getObject( data.readUInt() );

	this.sound = sea3d.getObject( data.readUInt() );
	this.volume = data.readFloat();

};

SEA3DSDK.Sound3D.prototype = Object.create( SEA3DSDK.Object3D.prototype );
SEA3DSDK.Sound3D.prototype.constructor = SEA3DSDK.Sound3D;

//
//	Sound Point
//

SEA3DSDK.SoundPoint = function ( name, data, sea3d ) {

	SEA3DSDK.Sound3D.call( this, name, data, sea3d );

	this.position = data.readVector3();
	this.distance = data.readFloat();

	data.readTags( this.readTag.bind( this ) );

};

SEA3DSDK.SoundPoint.prototype = Object.create( SEA3DSDK.Sound3D.prototype );
SEA3DSDK.SoundPoint.prototype.constructor = SEA3DSDK.SoundPoint;

SEA3DSDK.SoundPoint.prototype.type = "sp";

//
//	Container3D
//

SEA3DSDK.Container3D = function ( name, data, sea3d ) {

	SEA3DSDK.Object3D.call( this, name, data, sea3d );

	this.transform = data.readMatrix();

	data.readTags( this.readTag.bind( this ) );

};

SEA3DSDK.Container3D.prototype = Object.create( SEA3DSDK.Object3D.prototype );
SEA3DSDK.Container3D.prototype.constructor = SEA3DSDK.Container3D;

SEA3DSDK.Container3D.prototype.type = "c3d";

//
//	Script URL
//

SEA3DSDK.ScriptURL = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	this.url = data.readUTF8( data.length );

};

SEA3DSDK.ScriptURL.prototype.type = "src";

//
//	Texture URL
//

SEA3DSDK.TextureURL = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	this.url = sea3d.config.path + data.readUTF8( data.length );

};

SEA3DSDK.TextureURL.prototype.type = "urlT";

//
//	CubeMap URL
//

SEA3DSDK.CubeMapURL = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	this.faces = [];

	for ( var i = 0; i < 6; i ++ ) {

		this.faces[ i ] = data.readUTF8Tiny();

	}

};

SEA3DSDK.CubeMapURL.prototype.type = "cURL";

//
//	Actions
//

SEA3DSDK.Actions = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	this.count = data.readUInt();
	this.actions = [];

	for ( var i = 0; i < this.count; i ++ ) {

		var flag = data.readUByte();
		var kind = data.readUShort();

		var size = data.readUShort();

		var position = data.position;
		var act = this.actions[ i ] = { kind: kind };

		// range of animation
		if ( flag & 1 ) {

			// start and count in frames
			act.range = [ data.readUInt(), data.readUInt() ];

		}

		// time
		if ( flag & 2 ) {

			act.time = data.readUInt();

		}

		// easing
		if ( flag & 4 ) {

			act.intrpl = data.readInterpolation();

			if ( act.intrpl.indexOf( 'back.' ) === 0 ) {

				act.intrplParam0 = data.readFloat();

			} else if ( act.intrpl.indexOf( 'elastic.' ) === 0 ) {

				act.intrplParam0 = data.readFloat();
				act.intrplParam1 = data.readFloat();

			}

		}

		switch ( kind ) {

			case SEA3DSDK.Actions.RTT_TARGET:
				act.source = sea3d.getObject( data.readUInt() );
				act.target = sea3d.getObject( data.readUInt() );
				break;

			case SEA3DSDK.Actions.LOOK_AT:
				act.source = sea3d.getObject( data.readUInt() );
				act.target = sea3d.getObject( data.readUInt() );
				break;

			case SEA3DSDK.Actions.PLAY_SOUND:
				act.sound = sea3d.getObject( data.readUInt() );
				act.offset = data.readUInt();
				break;

			case SEA3DSDK.Actions.PLAY_ANIMATION:
				act.object = sea3d.getObject( data.readUInt() );
				act.name = data.readUTF8Tiny();
				break;

			case SEA3DSDK.Actions.FOG:
				act.color = data.readUInt24();
				act.min = data.readFloat();
				act.max = data.readFloat();
				break;

			case SEA3DSDK.Actions.ENVIRONMENT:
				act.texture = sea3d.getObject( data.readUInt() );
				break;

			case SEA3DSDK.Actions.ENVIRONMENT_COLOR:
				act.color = data.readUInt24F();
				break;

			case SEA3DSDK.Actions.CAMERA:
				act.camera = sea3d.getObject( data.readUInt() );
				break;

			case SEA3DSDK.Actions.SCRIPTS:
				act.scripts = data.readScriptList( sea3d );
				break;

			case SEA3DSDK.Actions.CLASS_OF:
				act.classof = sea3d.getObject( data.readUInt() );
				break;

			case SEA3DSDK.Actions.ATTRIBUTES:
				act.attributes = sea3d.getObject( data.readUInt() );
				break;

			default:
				console.log( "Action \"" + kind + "\" not found." );
				break;

		}

		data.position = position + size;

	}

};

SEA3DSDK.Actions.SCENE = 0;
SEA3DSDK.Actions.ENVIRONMENT_COLOR = 1;
SEA3DSDK.Actions.ENVIRONMENT = 2;
SEA3DSDK.Actions.FOG = 3;
SEA3DSDK.Actions.PLAY_ANIMATION = 4;
SEA3DSDK.Actions.PLAY_SOUND = 5;
SEA3DSDK.Actions.ANIMATION_AUDIO_SYNC = 6;
SEA3DSDK.Actions.LOOK_AT = 7;
SEA3DSDK.Actions.RTT_TARGET = 8;
SEA3DSDK.Actions.CAMERA = 9;
SEA3DSDK.Actions.SCRIPTS = 10;
SEA3DSDK.Actions.CLASS_OF = 11;
SEA3DSDK.Actions.ATTRIBUTES = 12;

SEA3DSDK.Actions.prototype.type = "act";

//
//	Properties
//

SEA3DSDK.Properties = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	this.props = data.readProperties( sea3d );
	this.props.__name = name;

};

SEA3DSDK.Properties.prototype.type = "prop";

//
//	File Info
//

SEA3DSDK.FileInfo = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	this.info = data.readProperties( sea3d );
	this.info.__name = name;

	sea3d.info = this.info;

};

SEA3DSDK.FileInfo.prototype.type = "info";

//
//	Java Script
//

SEA3DSDK.JavaScript = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	this.src = data.readUTF8( data.length );

};

SEA3DSDK.JavaScript.prototype.type = "js";

//
//	Java Script Method
//

SEA3DSDK.JavaScriptMethod = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	var count = data.readUShort();

	this.methods = {};

	for ( var i = 0; i < count; i ++ ) {

		var flag = data.readUByte();
		var method = data.readUTF8Tiny();

		this.methods[ method ] = {
			src: data.readUTF8Long()
		};

	}

};

SEA3DSDK.JavaScriptMethod.prototype.type = "jsm";

//
//	GLSL
//

SEA3DSDK.GLSL = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	this.src = data.readUTF8( data.length );

};

SEA3DSDK.GLSL.prototype.type = "glsl";

//
//	Dummy
//

SEA3DSDK.Dummy = function ( name, data, sea3d ) {

	SEA3DSDK.Object3D.call( this, name, data, sea3d );

	this.transform = data.readMatrix();

	this.width = data.readFloat();
	this.height = data.readFloat();
	this.depth = data.readFloat();

	data.readTags( this.readTag.bind( this ) );

};

SEA3DSDK.Dummy.prototype = Object.create( SEA3DSDK.Object3D.prototype );
SEA3DSDK.Dummy.prototype.constructor = SEA3DSDK.Dummy;

SEA3DSDK.Dummy.prototype.type = "dmy";

//
//	Line
//

SEA3DSDK.Line = function ( name, data, sea3d ) {

	SEA3DSDK.Object3D.call( this, name, data, sea3d );

	this.count = ( this.attrib & 64 ? data.readUInt() : data.readUShort() ) * 3;
	this.closed = ( this.attrib & 128 ) != 0;
	this.transform = data.readMatrix();

	this.vertex = [];

	var i = 0;
	while ( i < this.count ) {

		this.vertex[ i ++ ] = data.readFloat();

	}

	data.readTags( this.readTag.bind( this ) );

};

SEA3DSDK.Line.prototype = Object.create( SEA3DSDK.Object3D.prototype );
SEA3DSDK.Line.prototype.constructor = SEA3DSDK.Line;

SEA3DSDK.Line.prototype.type = "line";

//
//	Sprite
//

SEA3DSDK.Sprite = function ( name, data, sea3d ) {

	SEA3DSDK.Object3D.call( this, name, data, sea3d );

	if ( this.attrib & 256 ) {

		this.material = sea3d.getObject( data.readUInt() );

	}

	this.position = data.readVector3();

	this.width = data.readFloat();
	this.height = data.readFloat();

	data.readTags( this.readTag.bind( this ) );

};

SEA3DSDK.Sprite.prototype = Object.create( SEA3DSDK.Object3D.prototype );
SEA3DSDK.Sprite.prototype.constructor = SEA3DSDK.Sprite;

SEA3DSDK.Sprite.prototype.type = "m2d";

//
//	Mesh
//

SEA3DSDK.Mesh = function ( name, data, sea3d ) {

	SEA3DSDK.Entity3D.call( this, name, data, sea3d );

	// MATERIAL
	if ( this.attrib & 256 ) {

		this.material = [];

		var len = data.readUByte();

		if ( len === 1 ) this.material[ 0 ] = sea3d.getObject( data.readUInt() );
		else {

			var i = 0;
			while ( i < len ) {

				var matIndex = data.readUInt();

				if ( matIndex > 0 ) this.material[ i ++ ] = sea3d.getObject( matIndex - 1 );
				else this.material[ i ++ ] = undefined;

			}

		}

	}

	if ( this.attrib & 512 ) {

		this.modifiers = [];

		var len = data.readUByte();

		for ( var i = 0; i < len; i ++ ) {

			this.modifiers[ i ] = sea3d.getObject( data.readUInt() );

		}

	}

	if ( this.attrib & 1024 ) {

		this.reference = {
			type: data.readUByte(),
			ref: sea3d.getObject( data.readUInt() )
		};

	}

	this.transform = data.readMatrix();

	this.geometry = sea3d.getObject( data.readUInt() );

	data.readTags( this.readTag.bind( this ) );

};

SEA3DSDK.Mesh.prototype = Object.create( SEA3DSDK.Entity3D.prototype );
SEA3DSDK.Mesh.prototype.constructor = SEA3DSDK.Mesh;

SEA3DSDK.Mesh.prototype.type = "m3d";

//
//	Skeleton
//

SEA3DSDK.Skeleton = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	var length = data.readUShort();

	this.joint = [];

	for ( var i = 0; i < length; i ++ ) {

		this.joint[ i ] = {
			name: data.readUTF8Tiny(),
			parentIndex: data.readUShort() - 1,
			inverseBindMatrix: data.readMatrix()
		};

	}

};

SEA3DSDK.Skeleton.prototype.type = "skl";

//
//	Skeleton Local
//

SEA3DSDK.SkeletonLocal = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	var length = data.readUShort();

	this.joint = [];

	for ( var i = 0; i < length; i ++ ) {

		this.joint[ i ] = {
			name: data.readUTF8Tiny(),
			parentIndex: data.readUShort() - 1,
			// POSITION XYZ
			x: data.readFloat(),
			y: data.readFloat(),
			z: data.readFloat(),
			// QUATERNION XYZW
			qx: data.readFloat(),
			qy: data.readFloat(),
			qz: data.readFloat(),
			qw: data.readFloat()
		};

	}

};

SEA3DSDK.SkeletonLocal.prototype.type = "sklq";

//
//	Animation Base
//

SEA3DSDK.AnimationBase = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	var flag = data.readUByte();

	this.sequence = [];

	if ( flag & 1 ) {

		var count = data.readUShort();

		for ( var i = 0; i < count; i ++ ) {

			var seqFlag = data.readUByte();

			this.sequence[ i ] = {
				name: data.readUTF8Tiny(),
				start: data.readUInt(),
				count: data.readUInt(),
				repeat: ( seqFlag & 1 ) !== 0,
				intrpl: ( seqFlag & 2 ) === 0
			};

		}

	}

	this.frameRate = data.readUByte();
	this.numFrames = data.readUInt();

	// no contains sequence
	if ( this.sequence.length === 0 ) {

		this.sequence[ 0 ] = { name: "root", start: 0, count: this.numFrames, repeat: true, intrpl: true };

	}

};

//
//	Animation
//

SEA3DSDK.Animation = function ( name, data, sea3d ) {

	SEA3DSDK.AnimationBase.call( this, name, data, sea3d );

	this.dataList = [];

	for ( var i = 0, l = data.readUByte(); i < l; i ++ ) {

		var kind = data.readUShort(),
			type = data.readUByte();

		var anmRaw = data.readVector( type, this.numFrames, 0 );

		this.dataList.push( {
			kind: kind,
			type: type,
			blockSize: SEA3DSDK.Stream.sizeOf( type ),
			data: anmRaw
		} );

	}

};

SEA3DSDK.Animation.POSITION = 0;
SEA3DSDK.Animation.ROTATION = 1;
SEA3DSDK.Animation.SCALE = 2;
SEA3DSDK.Animation.COLOR = 3;
SEA3DSDK.Animation.MULTIPLIER = 4;
SEA3DSDK.Animation.ATTENUATION_START = 5;
SEA3DSDK.Animation.ATTENUATION_END = 6;
SEA3DSDK.Animation.FOV = 7;
SEA3DSDK.Animation.OFFSET_U = 8;
SEA3DSDK.Animation.OFFSET_V = 9;
SEA3DSDK.Animation.SCALE_U = 10;
SEA3DSDK.Animation.SCALE_V = 11;
SEA3DSDK.Animation.DEGREE = 12;
SEA3DSDK.Animation.ALPHA = 13;
SEA3DSDK.Animation.VOLUME = 14;
SEA3DSDK.Animation.RADIAN = 15;

SEA3DSDK.Animation.MORPH = 250;

SEA3DSDK.Animation.prototype = Object.create( SEA3DSDK.AnimationBase.prototype );
SEA3DSDK.Animation.prototype.constructor = SEA3DSDK.Animation;

SEA3DSDK.Animation.prototype.type = "anm";

//
//	Skeleton Animation
//

SEA3DSDK.SkeletonAnimation = function ( name, data, sea3d ) {

	SEA3DSDK.AnimationBase.call( this, name, data, sea3d );

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	this.numJoints = data.readUShort();

	this.raw = data.readFloatArray( this.numFrames * this.numJoints * 7 );

};

SEA3DSDK.SkeletonAnimation.prototype.type = "skla";

//
//	UVW Animation
//

SEA3DSDK.UVWAnimation = function ( name, data, sea3d ) {

	SEA3DSDK.Animation.call( this, name, data, sea3d );

};

SEA3DSDK.UVWAnimation.prototype.type = "auvw";

//
//	Morph
//

SEA3DSDK.Morph = function ( name, data, sea3d ) {

	SEA3DSDK.GeometryBase.call( this, name, data, sea3d );

	var useVertex = ( this.attrib & 2 ) != 0;
	var useNormal = ( this.attrib & 4 ) != 0;

	var nodeCount = data.readUShort();

	this.node = [];

	for ( var i = 0; i < nodeCount; i ++ ) {

		var nodeName = data.readUTF8Tiny(),
			verts, norms;

		if ( useVertex ) verts = data.readFloatArray( this.length );
		if ( useNormal ) norms = data.readFloatArray( this.length );

		this.node[ i ] = { vertex: verts, normal: norms, name: nodeName };

	}

};

SEA3DSDK.Morph.prototype = Object.create( SEA3DSDK.GeometryBase.prototype );
SEA3DSDK.Morph.prototype.constructor = SEA3DSDK.Morph;

SEA3DSDK.Morph.prototype.type = "mph";

//
//	Morph Animation
//

SEA3DSDK.MorphAnimation = function ( name, data, sea3d ) {

	SEA3DSDK.AnimationBase.call( this, name, data, sea3d );

	this.dataList = [];

	for ( var i = 0, l = data.readUByte(); i < l; i ++ ) {

		this.dataList.push( {
			kind: SEA3DSDK.Animation.MORPH,
			type: SEA3DSDK.Stream.FLOAT,
			name: data.readUTF8Tiny(),
			blockSize: 1,
			data: data.readVector( SEA3DSDK.Stream.FLOAT, this.numFrames, 0 )
		} );

	}

};

SEA3DSDK.MorphAnimation.prototype.type = "mpha";

//
//	Vertex Animation
//

SEA3DSDK.VertexAnimation = function ( name, data, sea3d ) {

	SEA3DSDK.AnimationBase.call( this, name, data, sea3d );

	var flags = data.readUByte();

	this.isBig = ( flags & 1 ) != 0;

	data.readVInt = this.isBig ? data.readUInt : data.readUShort;

	this.numVertex = data.readVInt();

	this.length = this.numVertex * 3;

	var useVertex = ( flags & 2 ) != 0;
	var useNormal = ( flags & 4 ) != 0;

	this.frame = [];

	var i, verts, norms;

	for ( i = 0; i < this.numFrames; i ++ ) {

		if ( useVertex ) verts = data.readFloatArray( this.length );
		if ( useNormal ) norms = data.readFloatArray( this.length );

		this.frame[ i ] = { vertex: verts, normal: norms };

	}

};

SEA3DSDK.VertexAnimation.prototype = Object.create( SEA3DSDK.AnimationBase.prototype );
SEA3DSDK.VertexAnimation.prototype.constructor = SEA3DSDK.VertexAnimation;

SEA3DSDK.VertexAnimation.prototype.type = "vtxa";

//
//	Camera
//

SEA3DSDK.Camera = function ( name, data, sea3d ) {

	SEA3DSDK.Object3D.call( this, name, data, sea3d );

	if ( this.attrib & 64 ) {

		this.dof = {
			distance: data.readFloat(),
			range: data.readFloat()
		};

	}

	this.transform = data.readMatrix();

	this.fov = data.readFloat();

	data.readTags( this.readTag.bind( this ) );

};

SEA3DSDK.Camera.prototype = Object.create( SEA3DSDK.Object3D.prototype );
SEA3DSDK.Camera.prototype.constructor = SEA3DSDK.Camera;

SEA3DSDK.Camera.prototype.type = "cam";

//
//	Orthographic Camera
//

SEA3DSDK.OrthographicCamera = function ( name, data, sea3d ) {

	SEA3DSDK.Object3D.call( this, name, data, sea3d );

	this.transform = data.readMatrix();

	this.height = data.readFloat();

	data.readTags( this.readTag.bind( this ) );

};

SEA3DSDK.OrthographicCamera.prototype = Object.create( SEA3DSDK.Object3D.prototype );
SEA3DSDK.OrthographicCamera.prototype.constructor = SEA3DSDK.OrthographicCamera;

SEA3DSDK.OrthographicCamera.prototype.type = "camo";

//
//	Joint Object
//

SEA3DSDK.JointObject = function ( name, data, sea3d ) {

	SEA3DSDK.Object3D.call( this, name, data, sea3d );

	this.target = sea3d.getObject( data.readUInt() );
	this.joint = data.readUShort();

	data.readTags( this.readTag.bind( this ) );

};

SEA3DSDK.JointObject.prototype = Object.create( SEA3DSDK.Object3D.prototype );
SEA3DSDK.JointObject.prototype.constructor = SEA3DSDK.JointObject;

SEA3DSDK.JointObject.prototype.type = "jnt";

//
//	Light
//

SEA3DSDK.Light = function ( name, data, sea3d ) {

	SEA3DSDK.Object3D.call( this, name, data, sea3d );

	this.attenStart = Number.MAX_VALUE;
	this.attenEnd = Number.MAX_VALUE;

	if ( this.attrib & 64 ) {

		var shadowHeader = data.readUByte();

		this.shadow = {};

		this.shadow.opacity = shadowHeader & 1 ? data.readFloat() : 1;
		this.shadow.color = shadowHeader & 2 ? data.readUInt24() : 0x000000;

	}

	if ( this.attrib & 512 ) {

		this.attenStart = data.readFloat();
		this.attenEnd = data.readFloat();

	}

	this.color = data.readUInt24();
	this.multiplier = data.readFloat();

};

SEA3DSDK.Light.prototype = Object.create( SEA3DSDK.Object3D.prototype );
SEA3DSDK.Light.prototype.constructor = SEA3DSDK.Light;

//
//	Point Light
//

SEA3DSDK.PointLight = function ( name, data, sea3d ) {

	SEA3DSDK.Light.call( this, name, data, sea3d );

	if ( this.attrib & 128 ) {

		this.attenuation = {
			start: data.readFloat(),
			end: data.readFloat()
		};

	}

	this.position = data.readVector3();

	data.readTags( this.readTag.bind( this ) );

};

SEA3DSDK.PointLight.prototype = Object.create( SEA3DSDK.Light.prototype );
SEA3DSDK.PointLight.prototype.constructor = SEA3DSDK.PointLight;

SEA3DSDK.PointLight.prototype.type = "plht";

//
//	Hemisphere Light
//

SEA3DSDK.HemisphereLight = function ( name, data, sea3d ) {

	SEA3DSDK.Light.call( this, name, data, sea3d );

	if ( this.attrib & 128 ) {

		this.attenuation = {
			start: data.readFloat(),
			end: data.readFloat()
		};

	}

	this.secondColor = data.readUInt24();

	data.readTags( this.readTag.bind( this ) );

};

SEA3DSDK.HemisphereLight.prototype = Object.create( SEA3DSDK.Light.prototype );
SEA3DSDK.HemisphereLight.prototype.constructor = SEA3DSDK.HemisphereLight;

SEA3DSDK.HemisphereLight.prototype.type = "hlht";

//
//	Ambient Light
//

SEA3DSDK.AmbientLight = function ( name, data, sea3d ) {

	SEA3DSDK.Light.call( this, name, data, sea3d );

	data.readTags( this.readTag.bind( this ) );

};

SEA3DSDK.AmbientLight.prototype = Object.create( SEA3DSDK.Light.prototype );
SEA3DSDK.AmbientLight.prototype.constructor = SEA3DSDK.AmbientLight;

SEA3DSDK.AmbientLight.prototype.type = "alht";

//
//	Directional Light
//

SEA3DSDK.DirectionalLight = function ( name, data, sea3d ) {

	SEA3DSDK.Light.call( this, name, data, sea3d );

	this.transform = data.readMatrix();

	data.readTags( this.readTag.bind( this ) );

};

SEA3DSDK.DirectionalLight.prototype = Object.create( SEA3DSDK.Light.prototype );
SEA3DSDK.DirectionalLight.prototype.constructor = SEA3DSDK.DirectionalLight;

SEA3DSDK.DirectionalLight.prototype.type = "dlht";

//
//	Material
//

SEA3DSDK.Material = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	this.technique = [];
	this.tecniquesDict = {};

	this.attrib = data.readUShort();

	this.alpha = 1;
	this.blendMode = "normal";

	this.doubleSided = ( this.attrib & 1 ) != 0;

	this.receiveLights = ( this.attrib & 2 ) === 0;
	this.receiveShadows = ( this.attrib & 4 ) === 0;
	this.receiveFog = ( this.attrib & 8 ) === 0;

	this.repeat = ( this.attrib & 16 ) === 0;

	if ( this.attrib & 32 )
		this.alpha = data.readFloat();

	if ( this.attrib & 64 )
		this.blendMode = data.readBlendMode();

	if ( this.attrib & 128 )
		this.animations = data.readAnimationList( sea3d );

	this.depthWrite = ( this.attrib & 256 ) === 0;
	this.depthTest = ( this.attrib & 512 ) === 0;

	this.premultipliedAlpha = ( this.attrib & 1024 ) != 0;

	var count = data.readUByte();

	for ( var i = 0; i < count; ++ i ) {

		var kind = data.readUShort();
		var size = data.readUShort();
		var pos = data.position;
		var tech, methodAttrib;

		switch ( kind ) {

			case SEA3DSDK.Material.PHONG:
			
				tech = {
					ambientColor: data.readUInt24(),
					diffuseColor: data.readUInt24(),
					specularColor: data.readUInt24(),

					specular: data.readFloat(),
					gloss: data.readFloat()
				};
				
				break;

			case SEA3DSDK.Material.PHYSICAL:
			
				tech = {
					color: data.readUInt24(),
					roughness: data.readFloat(),
					metalness: data.readFloat()
				};
				
				break;

			case SEA3DSDK.Material.ANISOTROPIC:
				break;

			case SEA3DSDK.Material.COMPOSITE_TEXTURE:
			
				tech = {
					composite: sea3d.getObject( data.readUInt() )
				};
				
				break;

			case SEA3DSDK.Material.DIFFUSE_MAP:
			case SEA3DSDK.Material.SPECULAR_MAP:
			case SEA3DSDK.Material.NORMAL_MAP:
			case SEA3DSDK.Material.AMBIENT_MAP:
			case SEA3DSDK.Material.ALPHA_MAP:
			case SEA3DSDK.Material.EMISSIVE_MAP:
			case SEA3DSDK.Material.ROUGHNESS_MAP:
			case SEA3DSDK.Material.METALNESS_MAP:
			
				tech = {
					texture: sea3d.getObject( data.readUInt() )
				};
				
				break;

			case SEA3DSDK.Material.REFLECTION:
			case SEA3DSDK.Material.FRESNEL_REFLECTION:
			
				tech = {
					texture: sea3d.getObject( data.readUInt() ),
					alpha: data.readFloat()
				};

				if ( kind === SEA3DSDK.Material.FRESNEL_REFLECTION ) {

					tech.power = data.readFloat();
					tech.normal = data.readFloat();

				}
				
				break;

			case SEA3DSDK.Material.REFRACTION:
			
				tech = {
					texture: sea3d.getObject( data.readUInt() ),
					alpha: data.readFloat(),
					ior: data.readFloat()
				};
				
				break;

			case SEA3DSDK.Material.RIM:
			
				tech = {
					color: data.readUInt24(),
					strength: data.readFloat(),
					power: data.readFloat(),
					blendMode: data.readBlendMode()
				};
				
				break;

			case SEA3DSDK.Material.LIGHT_MAP:
			
				tech = {
					texture: sea3d.getObject( data.readUInt() ),
					channel: data.readUByte(),
					blendMode: data.readBlendMode()
				};
				
				break;

			case SEA3DSDK.Material.DETAIL_MAP:
			
				tech = {
					texture: sea3d.getObject( data.readUInt() ),
					scale: data.readFloat(),
					blendMode: data.readBlendMode()
				};
				
				break;

			case SEA3DSDK.Material.CEL:
			
				tech = {
					color: data.readUInt24(),
					levels: data.readUByte(),
					size: data.readFloat(),
					specularCutOff: data.readFloat(),
					smoothness: data.readFloat()
				};
				
				break;

			case SEA3DSDK.Material.TRANSLUCENT:
			
				tech = {
					translucency: data.readFloat(),
					scattering: data.readFloat()
				};
				
				break;

			case SEA3DSDK.Material.BLEND_NORMAL_MAP:
			
				methodAttrib = data.readUByte();

				tech = {
					texture: sea3d.getObject( data.readUInt() ),
					secondaryTexture: sea3d.getObject( data.readUInt() )
				};

				if ( methodAttrib & 1 ) {

					tech.offsetX0 = data.readFloat();
					tech.offsetY0 = data.readFloat();

					tech.offsetX1 = data.readFloat();
					tech.offsetY1 = data.readFloat();

				} else {

					tech.offsetX0 = tech.offsetY0 =
					tech.offsetX1 = tech.offsetY1 = 0;

				}

				tech.animate = methodAttrib & 2;
				
				break;

			case SEA3DSDK.Material.MIRROR_REFLECTION:
			
				tech = {
					texture: sea3d.getObject( data.readUInt() ),
					alpha: data.readFloat()
				};
				break;

			case SEA3DSDK.Material.EMISSIVE:
			
				tech = {
					color: data.readUInt24F()
				};
				
				break;

			case SEA3DSDK.Material.VERTEX_COLOR:
			
				tech = {
					blendMode: data.readBlendMode()
				};
				
				break;

			case SEA3DSDK.Material.WRAP_LIGHTING:
			
				tech = {
					color: data.readUInt24(),
					strength: data.readFloat()
				};
				
				break;

			case SEA3DSDK.Material.COLOR_REPLACE:
			
				methodAttrib = data.readUByte();

				tech = {
					red: data.readUInt24(),
					green: data.readUInt24(),
					blue: data.readUInt24F()
				};

				if ( methodAttrib & 1 ) tech.mask = sea3d.getObject( data.readUInt() );

				if ( methodAttrib & 2 ) tech.alpha = data.readFloat();

				break;

			case SEA3DSDK.Material.REFLECTION_SPHERICAL:
			
				tech = {
					texture: sea3d.getObject( data.readUInt() ),
					alpha: data.readFloat()
				};
				
				break;

			case SEA3DSDK.Material.REFLECTIVITY:
			
				methodAttrib = data.readUByte();

				tech = {
					strength: data.readFloat()
				};

				if ( methodAttrib & 1 ) tech.mask = sea3d.getObject( data.readUInt() );

				break;

			case SEA3DSDK.Material.CLEAR_COAT:
			
				tech = {
					strength: data.readFloat(),
					roughness: data.readFloat()
				};
				
				break;

			case SEA3DSDK.Material.FLACCIDITY:
			
				methodAttrib = data.readUByte();

				tech = {
					target: sea3d.getObject( data.readUInt() ),
					scale: data.readFloat(),
					spring: data.readFloat(),
					damping: data.readFloat()
				};

				if ( methodAttrib & 1 ) tech.mask = sea3d.getObject( data.readUInt() );

				break;
				
			default:
			
				console.warn( "SEA3D: MaterialTechnique not found:", kind.toString( 16 ) );

				data.position = pos += size;
				
				continue;

		}

		tech.kind = kind;

		this.technique.push( tech );
		this.tecniquesDict[ kind ] = tech;

		data.position = pos += size;

	}

};

SEA3DSDK.Material.PHONG = 0;
SEA3DSDK.Material.COMPOSITE_TEXTURE = 1;
SEA3DSDK.Material.DIFFUSE_MAP = 2;
SEA3DSDK.Material.SPECULAR_MAP = 3;
SEA3DSDK.Material.REFLECTION = 4;
SEA3DSDK.Material.REFRACTION = 5;
SEA3DSDK.Material.NORMAL_MAP = 6;
SEA3DSDK.Material.FRESNEL_REFLECTION = 7;
SEA3DSDK.Material.RIM = 8;
SEA3DSDK.Material.LIGHT_MAP = 9;
SEA3DSDK.Material.DETAIL_MAP = 10;
SEA3DSDK.Material.CEL = 11;
SEA3DSDK.Material.TRANSLUCENT = 12;
SEA3DSDK.Material.BLEND_NORMAL_MAP = 13;
SEA3DSDK.Material.MIRROR_REFLECTION = 14;
SEA3DSDK.Material.AMBIENT_MAP = 15;
SEA3DSDK.Material.ALPHA_MAP = 16;
SEA3DSDK.Material.EMISSIVE_MAP = 17;
SEA3DSDK.Material.VERTEX_COLOR = 18;
SEA3DSDK.Material.WRAP_LIGHTING = 19;
SEA3DSDK.Material.COLOR_REPLACE = 20;
SEA3DSDK.Material.REFLECTION_SPHERICAL = 21;
SEA3DSDK.Material.ANISOTROPIC = 22;
SEA3DSDK.Material.EMISSIVE = 23;
SEA3DSDK.Material.PHYSICAL = 24;
SEA3DSDK.Material.ROUGHNESS_MAP = 25;
SEA3DSDK.Material.METALNESS_MAP = 26;
SEA3DSDK.Material.REFLECTIVITY = 27;
SEA3DSDK.Material.CLEAR_COAT = 28;
SEA3DSDK.Material.FLACCIDITY = 29;

SEA3DSDK.Material.prototype.type = "mat";

//
//	Composite
//

SEA3DSDK.Composite = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	var layerCount = data.readUByte();

	this.layer = [];

	for ( var i = 0; i < layerCount; i ++ ) {

		this.layer[ i ] = new SEA3DSDK.Composite.prototype.Layer( data, sea3d );

	}

};

SEA3DSDK.Composite.prototype.getLayerByName = function ( name ) {

	for ( var i = 0; i < this.layer.length; i ++ ) {

		if ( this.layer[ i ].name === name ) {

			return this.layer[ i ];

		}

	}

};

SEA3DSDK.Composite.prototype.Layer = function ( data, sea3d ) {

	var attrib = data.readUShort();

	if ( attrib & 1 ) this.texture = new SEA3DSDK.Composite.LayerBitmap( data, sea3d );
	else this.color = data.readUInt24();

	if ( attrib & 2 ) {

		this.mask = new SEA3DSDK.Composite.LayerBitmap( data, sea3d );

	}

	if ( attrib & 4 ) {

		this.name = data.readUTF8Tiny();

	}

	this.blendMode = attrib & 8 ? data.readBlendMode() : "normal";

	this.opacity = attrib & 16 ? data.readFloat() : 1;

};

SEA3DSDK.Composite.LayerBitmap = function ( data, sea3d ) {

	this.map = sea3d.getObject( data.readUInt() );

	var attrib = data.readUShort();

	this.channel = attrib & 1 ? data.readUByte() : 0;
	this.repeat = attrib & 2 === 0;
	this.offsetU = attrib & 4 ? data.readFloat() : 0;
	this.offsetV = attrib & 8 ? data.readFloat() : 0;
	this.scaleU = attrib & 16 ? data.readFloat() : 1;
	this.scaleV = attrib & 32 ? data.readFloat() : 1;
	this.rotation = attrib & 64 ? data.readFloat() : 0;

	if ( attrib & 128 ) this.animation = data.readAnimationList( sea3d );

};

SEA3DSDK.Composite.prototype.type = "ctex";

//
//	Planar Render
//

SEA3DSDK.PlanarRender = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	this.attrib = data.readUByte();

	this.quality = ( this.attrib & 1 ) | ( this.attrib & 2 );
	this.transform = data.readMatrix();

};

SEA3DSDK.PlanarRender.prototype.type = "rttp";

//
//	Cube Render
//

SEA3DSDK.CubeRender = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	this.attrib = data.readUByte();

	this.quality = ( this.attrib & 1 ) | ( this.attrib & 2 );
	this.position = data.readVector3();

};

SEA3DSDK.CubeRender.prototype.type = "rttc";

//
//	Cube Maps
//

SEA3DSDK.CubeMap = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	this.transparent = false;

	this.extension = data.readExt();

	this.faces = [];

	for ( var i = 0; i < 6; i ++ ) {

		var size = data.readUInt();

		this.faces[ i ] = data.concat( data.position, size );

		data.position += size;

	}

};

SEA3DSDK.CubeMap.prototype.type = "cmap";

//
//	JPEG
//

SEA3DSDK.JPEG = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	this.transparent = false;

};

SEA3DSDK.JPEG.prototype.type = "jpg";

//
//	JPEG_XR
//

SEA3DSDK.JPEG_XR = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	this.transparent = true;

};

SEA3DSDK.JPEG_XR.prototype.type = "wdp";

//
//	PNG
//

SEA3DSDK.PNG = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	this.transparent = data.getByte( 25 ) === 0x06;

};

SEA3DSDK.PNG.prototype.type = "png";

//
//	GIF
//

SEA3DSDK.GIF = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	this.transparent = data.getByte( 11 ) > 0;

};

SEA3DSDK.GIF.prototype.type = "gif";

//
//	OGG
//

SEA3DSDK.OGG = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

};

SEA3DSDK.OGG.prototype.type = "ogg";

//
//	MP3
//

SEA3DSDK.MP3 = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

};

SEA3DSDK.MP3.prototype.type = "mp3";

//
//	Asset Update
//

SEA3DSDK.AssetUpdate = function ( name, data, sea3d ) {

	this.name = name;
	this.data = data;
	this.sea3d = sea3d;

	this.index = data.readUInt();
	this.bytes = data.concat( data.position, data.length - data.position );

};

SEA3DSDK.AssetUpdate.prototype.type = "upDt";

//
//	FILE FORMAT
//

SEA3DSDK.File = function ( config ) {

	this.config = {
		streaming: true,
		timeLimit: 60,
		progressive: false
	};

	if ( config ) {

		if ( config.streaming !== undefined ) this.config.streaming = config.streaming;
		if ( config.timeLimit !== undefined ) this.config.timeLimit = config.timeLimit;
		if ( config.progressive !== undefined ) this.config.progressive = config.progressive;
		if ( config.path !== undefined ) this.config.path = config.path;

	}

	this.version = SEA3DSDK.VERSION;
	this.objects = [];
	this.typeClass = {};
	this.typeRead = {};
	this.typeUnique = {};
	this.position =
	this.dataPosition = 0;
	this.scope = this;

	// SEA3D
	this.addClass( SEA3DSDK.FileInfo, true );
	this.addClass( SEA3DSDK.Geometry, true );
	this.addClass( SEA3DSDK.Mesh );
	this.addClass( SEA3DSDK.Sprite );
	this.addClass( SEA3DSDK.Material );
	this.addClass( SEA3DSDK.Composite );
	this.addClass( SEA3DSDK.PointLight );
	this.addClass( SEA3DSDK.DirectionalLight );
	this.addClass( SEA3DSDK.HemisphereLight );
	this.addClass( SEA3DSDK.AmbientLight );
	this.addClass( SEA3DSDK.Animation, true );
	this.addClass( SEA3DSDK.Skeleton, true );
	this.addClass( SEA3DSDK.SkeletonLocal, true );
	this.addClass( SEA3DSDK.SkeletonAnimation, true );
	this.addClass( SEA3DSDK.UVWAnimation, true );
	this.addClass( SEA3DSDK.JointObject );
	this.addClass( SEA3DSDK.Camera );
	this.addClass( SEA3DSDK.OrthographicCamera );
	this.addClass( SEA3DSDK.Morph, true );
	this.addClass( SEA3DSDK.MorphAnimation, true );
	this.addClass( SEA3DSDK.VertexAnimation, true );
	this.addClass( SEA3DSDK.CubeMap, true );
	this.addClass( SEA3DSDK.Dummy );
	this.addClass( SEA3DSDK.Line );
	this.addClass( SEA3DSDK.SoundPoint );
	this.addClass( SEA3DSDK.PlanarRender );
	this.addClass( SEA3DSDK.CubeRender );
	this.addClass( SEA3DSDK.Actions );
	this.addClass( SEA3DSDK.Container3D );
	this.addClass( SEA3DSDK.Properties );

	// URL BASED
	this.addClass( SEA3DSDK.ScriptURL, true );
	this.addClass( SEA3DSDK.TextureURL, true );
	this.addClass( SEA3DSDK.CubeMapURL, true );

	// UNIVERSAL
	this.addClass( SEA3DSDK.JPEG, true );
	this.addClass( SEA3DSDK.JPEG_XR, true );
	this.addClass( SEA3DSDK.PNG, true );
	this.addClass( SEA3DSDK.GIF, true );
	this.addClass( SEA3DSDK.OGG, true );
	this.addClass( SEA3DSDK.MP3, true );
	this.addClass( SEA3DSDK.JavaScript, true );
	this.addClass( SEA3DSDK.JavaScriptMethod, true );
	this.addClass( SEA3DSDK.GLSL, true );

	// UPDATER
	this.addClass( SEA3DSDK.AssetUpdate, true );

	// EXTENSION
	var i = SEA3DSDK.File.Extensions.length;

	while ( i -- ) {

		SEA3DSDK.File.Extensions[ i ].call( this );

	}

};

SEA3DSDK.File.Extensions = [];
SEA3DSDK.File.CompressionLibs = {};
SEA3DSDK.File.DecompressionMethod = {};

SEA3DSDK.File.setExtension = function ( callback ) {

	SEA3DSDK.File.Extensions.push( callback );

};

SEA3DSDK.File.setDecompressionEngine = function ( id, name, method ) {

	SEA3DSDK.File.CompressionLibs[ id ] = name;
	SEA3DSDK.File.DecompressionMethod[ id ] = method;

};

SEA3DSDK.File.prototype.addClass = function ( clazz, unique ) {

	this.typeClass[ clazz.prototype.type ] = clazz;
	this.typeUnique[ clazz.prototype.type ] = unique === true;

};

SEA3DSDK.File.prototype.readHead = function () {

	if ( this.stream.bytesAvailable < 16 )
		return false;

	if ( this.stream.readUTF8( 3 ) != "SEA" )
		throw new Error( "Invalid SEA3D format." );

	this.sign = this.stream.readUTF8( 3 );

	this.version = this.stream.readUInt24();

	if ( this.stream.readUByte() != 0 ) {

		throw new Error( "Protection algorithm not compatible." );

	}

	this.compressionID = this.stream.readUByte();

	this.compressionAlgorithm = SEA3DSDK.File.CompressionLibs[ this.compressionID ];
	this.decompressionMethod = SEA3DSDK.File.DecompressionMethod[ this.compressionID ];

	if ( this.compressionID > 0 && ! this.decompressionMethod ) {

		throw new Error( "Compression algorithm not compatible." );

	}

	this.length = this.stream.readUInt();

	this.dataPosition = this.stream.position;

	this.objects.length = 0;

	this.state = this.readBody;

	if ( this.onHead ) {

		this.onHead( {
			file: this,
			sign: this.sign
		} );

	}

	return true;

};

SEA3DSDK.File.prototype.getObject = function ( index ) {

	return this.objects[ index ];

};

SEA3DSDK.File.prototype.getObjectIndex = function ( name ) {

	return this.objects[ name ].index;

};

SEA3DSDK.File.prototype.getObjectByName = function ( name ) {

	return this.getObject( this.getObjectIndex( name ) );

};

SEA3DSDK.File.prototype.readSEAObject = function () {

	if ( this.stream.bytesAvailable < 4 )
		return null;

	var size = this.stream.readUInt(),
		position = this.stream.position;

	if ( this.stream.bytesAvailable < size )
		return null;

	var flag = this.stream.readUByte(),
		type = this.stream.readExt(),
		meta = null;

	var name = flag & 1 ? this.stream.readUTF8Tiny() : "",
		compressed = ( flag & 2 ) != 0,
		streaming = ( flag & 4 ) != 0;

	if ( flag & 8 ) {

		var metalen = this.stream.readUShort();
		var metabytes = this.stream.concat( this.stream.position, metalen );

		this.stream.position += metalen;

		if ( compressed && this.decompressionMethod ) {

			metabytes.buffer = this.decompressionMethod( metabytes.buffer );

		}

		meta = metabytes.readProperties( this );

	}

	size -= this.stream.position - position;
	position = this.stream.position;

	var data = this.stream.concat( position, size ),
		obj;

	if ( this.typeClass[ type ] ) {

		if ( compressed && this.decompressionMethod ) {

			data.buffer = this.decompressionMethod( data.buffer );

		}

		obj = new this.typeClass[ type ]( name, data, this );

		if ( ( this.config.streaming && streaming || this.config.forceStreaming ) && this.typeRead[ type ] ) {

			this.typeRead[ type ].call( this.scope, obj );

		}

	} else {

		obj = new SEA3DSDK.Object( name, data, type, this );

		console.warn( "SEA3D: Unknown format \"" + type + "\" of file \"" + name + "\". Add a module referring for this format." );

	}

	obj.index = this.objects.length;
	obj.streaming = streaming;
	obj.metadata = meta;

	this.objects.push( this.objects[ obj.name + "." + obj.type ] = obj );

	this.dataPosition = position + size;

	++ this.position;

	return obj;

};

SEA3DSDK.File.prototype.isDone = function () {

	return this.position === this.length;

};

SEA3DSDK.File.prototype.readBody = function () {

	this.timer.update();

	if ( ! this.resume ) return false;

	while ( this.position < this.length ) {

		if ( this.timer.deltaTime < this.config.timeLimit ) {

			this.stream.position = this.dataPosition;

			var sea = this.readSEAObject();

			if ( sea ) this.dispatchCompleteObject( sea );
			else return false;

		} else return false;

	}

	this.state = this.readComplete;

	return true;

};

SEA3DSDK.File.prototype.initParse = function () {

	this.timer = new SEA3DSDK.Timer();
	this.position = 0;
	this.resume = true;

};

SEA3DSDK.File.prototype.parse = function () {

	this.initParse();

	if ( isFinite( this.config.timeLimit ) ) requestAnimationFrame( this.parseObject.bind( this ) );
	else this.parseObject();

};

SEA3DSDK.File.prototype.parseObject = function () {

	this.timer.update();

	while ( this.position < this.length && this.timer.deltaTime < this.config.timeLimit ) {

		var obj = this.objects[ this.position ++ ],
			type = obj.type;

		if ( ! this.typeUnique[ type ] ) delete obj.tag;

		if ( ( obj.streaming || this.config.forceStreaming ) && this.typeRead[ type ] ) {

			if ( obj.tag === undefined ) {

				this.typeRead[ type ].call( this.scope, obj );

			}

		}

	}

	if ( this.position === this.length ) {

		var elapsedTime = this.timer.elapsedTime;
		var message = elapsedTime + "ms, " + this.objects.length + " objects";

		if ( this.onParseComplete ) {

			this.onParseComplete( {
				file: this,
				timeTotal: elapsedTime,
				message: message
			} );

		} else console.log( "SEA3D Parse Complete:", message );

	} else {

		if ( this.onParseProgress ) {

			this.onParseProgress( {
				file: this,
				loaded: this.position,
				total: this.length
			} );

		}

		setTimeout( this.parseObject.bind( this ), 10 );

	}

};

SEA3DSDK.File.prototype.readComplete = function () {

	this.stream.position = this.dataPosition;

	if ( this.stream.readUInt24F() != 0x5EA3D1 )
		console.warn( "SEA3D file is corrupted." );

	delete this.state;

	return false;

};

SEA3DSDK.File.prototype.readState = function () {

	while ( this.state() ) continue;

	if ( this.state ) {

		requestAnimationFrame( this.readState.bind( this ) );

		this.dispatchProgress();

	} else {

		this.dispatchComplete();

	}

};

SEA3DSDK.File.prototype.append = function( buffer ) {

	if (this.state) {

		this.stream.append( buffer );

	} else {

		this.read( buffer );

	}

};

SEA3DSDK.File.prototype.read = function ( buffer ) {

	if ( ! buffer ) throw new Error( "No data found." );

	this.initParse();

	this.stream = new SEA3DSDK.Stream( buffer );
	this.state = this.readHead;

	this.readState();

};

SEA3DSDK.File.prototype.dispatchCompleteObject = function ( obj ) {

	if ( ! this.onCompleteObject ) return;

	this.onCompleteObject( {
		file: this,
		object: obj
	} );

};

SEA3DSDK.File.prototype.dispatchProgress = function () {

	if ( ! this.onProgress ) return;

	this.onProgress( {
		file: this,
		loaded: this.position,
		total: this.length
	} );

};

SEA3DSDK.File.prototype.dispatchDownloadProgress = function ( position, length ) {

	if ( ! this.onDownloadProgress ) return;

	this.onDownloadProgress( {
		file: this,
		loaded: position,
		total: length
	} );

};

SEA3DSDK.File.prototype.dispatchComplete = function () {

	var elapsedTime = this.timer.elapsedTime;
	var message = elapsedTime + "ms, " + this.objects.length + " objects";

	if ( this.onComplete ) this.onComplete( {
		file: this,
		timeTotal: elapsedTime,
		message: message
	} );
	else console.log( "SEA3D:", message );

};

SEA3DSDK.File.prototype.dispatchError = function ( id, message ) {

	if ( this.onError ) this.onError( { file: this, id: id, message: message } );
	else console.error( "SEA3D: #" + id, message );

};

SEA3DSDK.File.prototype.extractUrlBase = function ( url ) {

	var parts = url.split( '/' );

	if ( parts.length === 1 ) return './';

	parts.pop();

	return parts.join( '/' ) + '/';

};

SEA3DSDK.File.prototype.load = function ( url ) {

	var self = this,
		xhr = new XMLHttpRequest();

	xhr.open( "GET", url, true );

	if (!this.config.path) {

		this.config.path = this.extractUrlBase( url );

	}

	if ( self.config.progressive ) {

		var position = 0;

		xhr.overrideMimeType( 'text/plain; charset=x-user-defined' );

	} else {

		xhr.responseType = 'arraybuffer';

	}

	xhr.onprogress = function ( e ) {

		if ( self.config.progressive ) {

			var binStr = xhr.responseText.substring( position ),
				bytes = new Uint8Array( binStr.length );

			for ( var i = 0; i < binStr.length; i ++ ) {

				bytes[ i ] = binStr.charCodeAt( i ) & 0xFF;

			}

			position += binStr.length;

			self.append( bytes.buffer );

		}

		self.dispatchDownloadProgress( e.loaded, e.total );

	};

	if ( ! self.config.progressive ) {

		xhr.onreadystatechange = function () {

			if ( xhr.readyState === 4 ) {

				if ( xhr.status === 200 || xhr.status === 0 ) {

					self.read( this.response );

				} else {

					this.dispatchError( 1001, "Couldn't load [" + url + "] [" + xhr.status + "]" );

				}

			}

		};

	}

	xhr.send();

};

export { SEA3DSDK };
