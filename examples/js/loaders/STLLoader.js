/**
 * @author aleeper / http://adamleeper.com/
 * @author mrdoob / http://mrdoob.com/
 * @author gero3 / https://github.com/gero3
 *
 * Description: A THREE loader for STL ASCII files, as created by Solidworks and other CAD programs.
 *
 * Supports both binary and ASCII encoded files, with automatic detection of type.
 *
 * Limitations: Binary decoding ignores header. There doesn't seem to be much of a use for it.
 *				There is perhaps some question as to how valid it is to always assume little-endian-ness.
 *				ASCII decoding assumes file is UTF-8. Seems to work for the examples...
 *
 * Usage:
 * 	var loader = new THREE.STLLoader();
 * 	loader.addEventListener( 'load', function ( event ) {
 *
 * 		var geometry = event.content;
 * 		scene.add( new THREE.Mesh( geometry ) );
 *
 * 	} );
 * 	loader.load( './models/stl/slotted_disk.stl' );
 */


THREE.STLLoader = function () {};

THREE.STLLoader.prototype = {

	constructor: THREE.STLLoader,

	addEventListener: THREE.EventDispatcher.prototype.addEventListener,
	hasEventListener: THREE.EventDispatcher.prototype.hasEventListener,
	removeEventListener: THREE.EventDispatcher.prototype.removeEventListener,
	dispatchEvent: THREE.EventDispatcher.prototype.dispatchEvent

};

THREE.STLLoader.prototype.load = function (url, callback) {

	var scope = this;

	var xhr = new XMLHttpRequest();

	function onloaded( event ) {

		if ( event.target.status === 200 || event.target.status === 0 ) {

				var geometry = scope.parse( event.target.responseText );

				scope.dispatchEvent( { type: 'load', content: geometry } );

				if ( callback ) callback( geometry );

		} else {

			scope.dispatchEvent( { type: 'error', message: 'Couldn\'t load URL [' + url + ']',
				response: event.target.responseText } );

		}

	}

	xhr.addEventListener( 'load', onloaded, false );

	xhr.addEventListener( 'progress', function ( event ) {

		scope.dispatchEvent( { type: 'progress', loaded: event.loaded, total: event.total } );

	}, false );

	xhr.addEventListener( 'error', function () {

		scope.dispatchEvent( { type: 'error', message: 'Couldn\'t load URL [' + url + ']' } );

	}, false );

	xhr.overrideMimeType('text/plain; charset=x-user-defined');
	xhr.open( 'GET', url, true );
	xhr.send( null );

};

THREE.STLLoader.prototype.parse = function (data) {

	var isBinary = function (data) {

		var expect, face_size, n_faces, reader;
		reader = new THREE.STLLoader.BinaryReader(data);
		reader.seek(80);
		face_size = (32 / 8 * 3) + ((32 / 8 * 3) * 3) + (16 / 8);
		n_faces = reader.readUInt32();
		expect = 80 + (32 / 8) + (n_faces * face_size);
		return expect === reader.getSize();

	};

	if (isBinary(data)) {

		return this.parseBinary(data);

	} else {

		return this.parseASCII(data);

	}
};

THREE.STLLoader.prototype.parseBinary = function (data) {

	var face, geometry, n_faces, reader, length, normal, i;

	reader = new THREE.STLLoader.BinaryReader(data);
	reader.seek(80);
	n_faces = reader.readUInt32();
	geometry = new THREE.Geometry();

	for (face = 0; face < n_faces; face++) {

		normal = new THREE.Vector3(reader.readFloat(),reader.readFloat(),reader.readFloat());

		for (i = 1; i <= 3; i++) {

			geometry.vertices.push(new THREE.Vector3(reader.readFloat(),reader.readFloat(),reader.readFloat()));

		}

		reader.readUInt16(); // attr doesn't get used yet.
		length = geometry.vertices.length;
		geometry.faces.push(new THREE.Face3(length - 3, length - 2, length - 1, normal));

	}

	geometry.computeCentroids();
	geometry.computeBoundingBox();
	geometry.computeBoundingSphere();

	return geometry;

};

THREE.STLLoader.prototype.parseASCII = function (data) {

	var geometry, length, normal, patternFace, patternNormal, patternVertex, result, text;
	geometry = new THREE.Geometry();
	patternFace = /facet([\s\S]*?)endfacet/g;

	while (((result = patternFace.exec(data)) != null)) {

		text = result[0];
		patternNormal = /normal[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;

		while (((result = patternNormal.exec(text)) != null)) {

			normal = new THREE.Vector3(parseFloat(result[1]), parseFloat(result[3]), parseFloat(result[5]));

		}

		patternVertex = /vertex[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;

		while (((result = patternVertex.exec(text)) != null)) {

			geometry.vertices.push(new THREE.Vector3(parseFloat(result[1]), parseFloat(result[3]), parseFloat(result[5])));

		}

		length = geometry.vertices.length;
		geometry.faces.push(new THREE.Face3(length - 3, length - 2, length - 1, normal));

	}

	geometry.computeCentroids();
	geometry.computeBoundingBox();
	geometry.computeBoundingSphere();

	return geometry;

};


THREE.STLLoader.BinaryReader = function (data) {

	this._buffer = data;
	this._pos = 0;

};

THREE.STLLoader.BinaryReader.prototype = {

	/* Public */

	readInt8:	function (){ return this._decodeInt(8, true); },
	readUInt8:	function (){ return this._decodeInt(8, false); },
	readInt16:	function (){ return this._decodeInt(16, true); },
	readUInt16:	function (){ return this._decodeInt(16, false); },
	readInt32:	function (){ return this._decodeInt(32, true); },
	readUInt32:	function (){ return this._decodeInt(32, false); },

	readFloat:	function (){ return this._decodeFloat(23, 8); },
	readDouble:	function (){ return this._decodeFloat(52, 11); },

	readChar:	function () { return this.readString(1); },

	readString: function (length) {

		this._checkSize(length * 8);
		var result = this._buffer.substr(this._pos, length);
		this._pos += length;
		return result;

	},

	seek: function (pos) {

		this._pos = pos;
		this._checkSize(0);

	},

	getPosition: function () {

		return this._pos;

	},

	getSize: function () {

		return this._buffer.length;

	},


	/* Private */

	_decodeFloat: function(precisionBits, exponentBits){

		var length = precisionBits + exponentBits + 1;
		var size = length >> 3;

		this._checkSize(length);

		var bias = Math.pow(2, exponentBits - 1) - 1;
		var signal = this._readBits(precisionBits + exponentBits, 1, size);
		var exponent = this._readBits(precisionBits, exponentBits, size);
		var significand = 0;
		var divisor = 2;
	// var curByte = length + (-precisionBits >> 3) - 1;
		var curByte = 0;
		do {
			var byteValue = this._readByte(++curByte, size);
			var startBit = precisionBits % 8 || 8;
			var mask = 1 << startBit;
			while (mask >>= 1) {
				if (byteValue & mask) {
					significand += 1 / divisor;
				}
				divisor *= 2;
			}
		} while (precisionBits -= startBit);

		this._pos += size;

		return exponent == (bias << 1) + 1 ? significand ? NaN : signal ? -Infinity : +Infinity
			: (1 + signal * -2) * (exponent || significand ? !exponent ? Math.pow(2, -bias + 1) * significand
			: Math.pow(2, exponent - bias) * (1 + significand) : 0);

	},

	_decodeInt: function(bits, signed){

		var x = this._readBits(0, bits, bits / 8), max = Math.pow(2, bits);
		var result = signed && x >= max / 2 ? x - max : x;

		this._pos += bits / 8;
		return result;

	},

	//shl fix: Henri Torgemane ~1996 (compressed by Jonas Raoni)
	_shl: function (a, b){

		for (++b; --b; a = ((a %= 0x7fffffff + 1) & 0x40000000) == 0x40000000 ? a * 2 : (a - 0x40000000) * 2 + 0x7fffffff + 1);
		return a;

	},

	_readByte: function (i, size) {

		return this._buffer.charCodeAt(this._pos + size - i - 1) & 0xff;

	},

	_readBits: function (start, length, size) {

		var offsetLeft = (start + length) % 8;
		var offsetRight = start % 8;
		var curByte = size - (start >> 3) - 1;
		var lastByte = size + (-(start + length) >> 3);
		var diff = curByte - lastByte;

		var sum = (this._readByte(curByte, size) >> offsetRight) & ((1 << (diff ? 8 - offsetRight : length)) - 1);

		if (diff && offsetLeft) {

			sum += (this._readByte(lastByte++, size) & ((1 << offsetLeft) - 1)) << (diff-- << 3) - offsetRight;

		}

		while (diff) {

			sum += this._shl(this._readByte(lastByte++, size), (diff-- << 3) - offsetRight);

		}

		return sum;

	},

	_checkSize: function (neededBits) {

		if (!(this._pos + Math.ceil(neededBits / 8) < this._buffer.length)) {

			throw new Error("Index out of bound");

		}

	}

};
