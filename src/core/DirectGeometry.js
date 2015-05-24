/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.DirectGeometry = function () {

	Object.defineProperty( this, 'id', { value: THREE.GeometryIdCount ++ } );

	this.uuid = THREE.Math.generateUUID();

	this.name = '';
	this.type = 'DirectGeometry';

	this.indices = [];
	this.vertices = [];
	this.colors = [];
	this.normals = [];
	this.colors = [];
	this.uvs = [];
	this.uvs2 = [];

	// this.lineDistances = [];

	this.boundingBox = null;
	this.boundingSphere = null;

	// update flags

	this.verticesNeedUpdate = false;
	this.normalsNeedUpdate = false;
	this.colorsNeedUpdate = false;
	this.uvsNeedUpdate = false;

};

THREE.DirectGeometry.prototype = {

	constructor: THREE.DirectGeometry,

	computeBoundingBox: THREE.Geometry.prototype.computeBoundingBox,
	computeBoundingSphere: THREE.Geometry.prototype.computeBoundingSphere,

	computeFaceNormals: function () {

		console.warn( 'THREE.DirectGeometry: computeFaceNormals() is not a method of this type of geometry.' );
		return this;

	},

	computeVertexNormals: function () {

		console.warn( 'THREE.DirectGeometry: computeVertexNormals() is not a method of this type of geometry.' );
		return this;

	},

	fromGeometry: function ( geometry, material ) {

		material = material || { 'vertexColors': THREE.NoColors };

		var vertices = geometry.vertices;
		var faces = geometry.faces;
		var faceVertexUvs = geometry.faceVertexUvs;
		var materialVertexColors = material.vertexColors;

		var hasFaceVertexUv = faceVertexUvs[ 0 ] && faceVertexUvs[ 0 ].length > 0;
		var hasFaceVertexUv2 = faceVertexUvs[ 1 ] && faceVertexUvs[ 1 ].length > 0;

		for ( var i = 0, j = 0; i < faces.length; i ++ ) {

			this.indices.push( new THREE.Index( j ++, j ++, j ++ ) );

			var face = faces[ i ];

			var a = vertices[ face.a ];
			var b = vertices[ face.b ];
			var c = vertices[ face.c ];

			this.vertices.push( a.clone(), b.clone(), c.clone() );

			var vertexNormals = face.vertexNormals;

			if ( vertexNormals.length === 3 ) {

				this.normals.push(
					vertexNormals[ 0 ].clone(),
					vertexNormals[ 1 ].clone(),
					vertexNormals[ 2 ].clone()
				);

			} else {

				var normal = face.normal;

				this.normals.push(
					normal.clone(),
					normal.clone(),
					normal.clone()
				);

			}

			var vertexColors = face.vertexColors;

			if ( materialVertexColors === THREE.VertexColors ) {

				this.colors.push(
					vertexColors[ 0 ].clone(),
					vertexColors[ 1 ].clone(),
					vertexColors[ 2 ].clone()
				);

			} else if ( materialVertexColors === THREE.FaceColors ) {

				var color = face.color;

				this.colors.push(
					color.clone(),
					color.clone(),
					color.clone()
				);

			}

			if ( hasFaceVertexUv === true ) {

				var vertexUvs = faceVertexUvs[ 0 ][ i ];

				if ( vertexUvs !== undefined ) {

					this.uvs.push(
						vertexUvs[ 0 ].clone(),
						vertexUvs[ 1 ].clone(),
						vertexUvs[ 2 ].clone()
					);

				} else {

					console.warn( 'THREE.BufferGeometry.fromGeometry(): Undefined vertexUv', i );

					this.uvs.push(
						new THREE.Vector2(),
						new THREE.Vector2(),
						new THREE.Vector2()
					);

				}

			}

			if ( hasFaceVertexUv2 === true ) {

				var vertexUvs = faceVertexUvs[ 1 ][ i ];

				if ( vertexUvs !== undefined ) {

					this.uvs2.push(
						vertexUvs[ 0 ].clone(),
						vertexUvs[ 1 ].clone(),
						vertexUvs[ 2 ].clone()
					);

				} else {

					console.warn( 'THREE.BufferGeometry.fromGeometry(): Undefined vertexUv2', i );

					this.uvs2.push(
						new THREE.Vector2(),
						new THREE.Vector2(),
						new THREE.Vector2()
					);

				}

			}

		}

		return this;

		/*
		this.vertices = geometry.vertices;
		this.faces = geometry.faces;

		var faces = geometry.faces;
		var faceVertexUvs = geometry.faceVertexUvs[ 0 ];

		for ( var i = 0, il = faces.length; i < il; i ++ ) {

			var face = faces[ i ];
			var indices = [ face.a, face.b, face.c ];

			var vertexNormals = face.vertexNormals;
			var vertexColors = face.vertexColors;
			var vertexUvs = faceVertexUvs[ i ];

			for ( var j = 0, jl = vertexNormals.length; j < jl; j ++ ) {

				this.normals[ indices[ j ] ] = vertexNormals[ j ];

			}

			for ( var j = 0, jl = vertexColors.length; j < jl; j ++ ) {

				this.colors[ indices[ j ] ] = vertexColors[ j ];

			}

			if ( vertexUvs === undefined ) {

				console.warn( 'THREE.DirectGeometry.fromGeometry(): Missing vertexUVs', i );
				vertexUvs = [ new THREE.Vector2(), new THREE.Vector2(), new THREE.Vector2() ];

			}

			for ( var j = 0, jl = vertexUvs.length; j < jl; j ++ ) {

				this.uvs[ indices[ j ] ] = vertexUvs[ j ];

			}

		}

		if ( geometry.morphTargets ) this.morphTargets = geometry.morphTargets.slice( 0 );
		if ( geometry.morphColors ) this.morphColors = geometry.morphColors.slice( 0 );
		if ( geometry.morphNormals ) this.morphNormals = geometry.morphNormals.slice( 0 );

		if ( geometry.skinIndices ) this.skinIndices = geometry.skinIndices.slice( 0 );
		if ( geometry.skinWeights ) this.skinWeights = geometry.skinWeights.slice( 0 );

		return this;
		*/

	},

	dispose: function () {

		this.dispatchEvent( { type: 'dispose' } );

	}

};

THREE.EventDispatcher.prototype.apply( THREE.DirectGeometry.prototype );
