function DynamicBufferGeometry ( radius ) {

	THREE.BufferGeometry.call( this );

	var tempArrays;

	var beginModification = (function () {
		tempArrays = {};
		for (var i = 0; i < this.attributesKeys.length; i++) {
			var name = this.attributesKeys[i];
			var attribute = this.attributes[name];
			attribute.arrayCopy = Array.prototype.slice.call (attribute.array);

			tempArrays[name] = [];
		}
	}).bind (this);

	var addAttributeData = (function ( name, data ) {
		var attribute = this.attributes[name], index;
		if (attribute.arrayCopy) {
			attribute.arrayCopy.push.apply (attribute.arrayCopy, data);
			index = attribute.arrayCopy.length / attribute.itemSize - 1;
		} else {
			// can't resize typed array, need to create new one
			var i, n, m, array = new attribute.array.constructor (attribute.array.length + data.length);

			n = attribute.array.length;
			for (i = 0; i < n; i++) {
				array[i] = attribute.array[i];
			}

			m = data.length;
			for (i = 0; i < m; i++) {
				array[n + i] = data[i];
			}

			attribute.array = array;
			index = attribute.array.length / m - 1;
		}
		return index;
	}).bind (this);

	var endModification = (function () {
		for (var i = 0; i < this.attributesKeys.length; i++) {
			var name = this.attributesKeys[i];
			var attribute = this.attributes[name];
			attribute.array = new attribute.array.constructor (attribute.arrayCopy);
			delete attribute.arrayCopy;
		}
	}).bind (this);

	radius = radius || 100;

	var diameter = 2 * radius;
	var threshold = 0.001 * radius;

	var cache = {};

	var pos2key = function ( pos ) {
		var ix = (pos[0] | 0) + radius;
		var iy = (pos[1] | 0) + radius;
		var iz = (pos[2] | 0) + radius;
		return diameter * (diameter * ix + iy) + iz;
	};

	var getVertex = function ( geometry, index ) {
		tempArrays = tempArrays || {};
		for (var i = 0; i < geometry.attributesKeys.length; i++) {
			var name = geometry.attributesKeys[i];
			var attribute = geometry.attributes[name];
			var array = attribute.arrayCopy ? attribute.arrayCopy : attribute.array;
			tempArrays[name] = tempArrays[name] || [];
			for (var j = 0; j < attribute.itemSize; j++) {
				tempArrays[name][j] = array[index * attribute.itemSize + j];
			}
		}
		// return same object here all the time to avoid wasting memory
		return tempArrays;
	};

	this.addVertex = function ( data, addToIndex ) {
		var key = pos2key( data.position );
		var bucket = cache[key] || []; cache[key] = bucket;

		var found, name;
		for (var i = 0; i < bucket.length; i++) {
			var index = bucket[i];
			var distance = 0;
			for (name in data) {
				if (name == undefined) {
					console.log(name);
				}
				if (name != 'index') {
					var array = this.attributes[name].arrayCopy ? this.attributes[name].arrayCopy : this.attributes[name].array;
					var size = data[name].length, isize = index * size;
					for (var j = 0; j < size; j++) {
						distance += Math.abs( data[name][j] - array[isize + j] );
					}
				}
			}
			if (distance < threshold) {
				found = index; break;
			}
		}
		if (found != undefined) {
			// this vertex already exists - do nothing

		} else {

			// this is new vertex
			for (name in data) {
				if (name != 'index') {
					found = addAttributeData (name, data[name]);
				}
			}

			// add new index to the bucket
			bucket.push (found);
		}

		if (addToIndex) {
			tempArrays.index[0] = found; addAttributeData ('index', tempArrays.index);
		}
	};

	// before this all could work, cache must be filled
	this.initCache = function () {
		var n = this.attributes.position.array.length / 3;
		for (var i = 0; i < n; i++) {
			this.addVertex (getVertex (this, i));
		}
	}

	// following overrifes prototype.merge (TODO offsets support)
	this.merge = function ( geometry ) {
		beginModification ();

		var i, n;
		if ( geometry.attributes.index ) {
			n = geometry.attributes.index.array.length;
			for (i = 0; i < n; i++) {
				this.addVertex (getVertex (geometry, geometry.attributes.index.array[i]), true);
			}
		} else {
			n = geometry.attributes.position.array.length / 3;
			for (i = 0; i < n; i++) {
				this.addVertex (getVertex (geometry, i), true);
			}
		}

		endModification ();

		this.computeBoundingSphere();

		return this;
	};

	// folloving overrides prototype.fromGeometry
	this.fromGeometry = function ( geometry, settings ) {

		settings = settings || { 'vertexColors': THREE.NoColors };

		var vertices = geometry.vertices;
		var faces = geometry.faces;
		var faceVertexUvs = geometry.faceVertexUvs;
		var vertexColors = settings.vertexColors;
		var hasFaceVertexUv = faceVertexUvs[ 0 ].length > 0;
		var hasFaceVertexNormals = faces[ 0 ].vertexNormals.length == 3;

		this.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array(), 3 ) );

		this.addAttribute( 'normal', new THREE.BufferAttribute( new Float32Array(), 3 ) );

		if ( vertexColors !== THREE.NoColors ) {

			this.addAttribute( 'color', new THREE.BufferAttribute( new Float32Array(), 3 ) );

		}

		if ( hasFaceVertexUv === true ) {

			this.addAttribute( 'uv', new THREE.BufferAttribute( new Float32Array(), 2 ) );

		}

		this.addAttribute( 'index', new THREE.BufferAttribute( new Uint16Array(), 1 ) );

		beginModification ();

		var order = [];

		for ( var i = 0; i < faces.length; i ++ ) {

			var face = faces[ i ];

			order[0] = face.a;
			order[1] = face.b;
			order[2] = face.c;

			for (var j = 0; j < 3; j++) {

				var v = vertices[ order[j] ];
				
				tempArrays.position[0] = v.x;
				tempArrays.position[1] = v.y;
				tempArrays.position[2] = v.z;

				var n;

				if ( hasFaceVertexNormals === true ) {

					n = face.vertexNormals[ j ];

				} else {

					n = face.normal;

				}

				tempArrays.normal[0] = n.x;
				tempArrays.normal[1] = n.y;
				tempArrays.normal[2] = n.z;

				if ( vertexColors !== THREE.NoColors ) {

					var c;

					if ( vertexColors === THREE.FaceColors ) {

						c = face.color;

					} else if ( vertexColors === THREE.VertexColors ) {

						c = face.vertexColors[ j ];

					}

					tempArrays.color[0] = c.r;
					tempArrays.color[1] = c.g;
					tempArrays.color[2] = c.b;
				}

				if ( hasFaceVertexUv === true ) {

					var uv = faceVertexUvs[ 0 ][ i ][ j ];

					tempArrays.uv[0] = uv.x;
					tempArrays.uv[1] = uv.y;

				}

				this.addVertex (tempArrays, true);
			}

		}

		endModification();

		this.computeBoundingSphere();

		return this;
	};
};

DynamicBufferGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
