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

	this.morphTargets = [];
	this.morphColors = [];
	this.morphNormals = [];

	this.skinWeights = [];
	this.skinIndices = [];

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

	fromGeometry: function ( geometry ) {

		var faces = geometry.faces;
		var vertices = geometry.vertices;
		var faceVertexUvs = geometry.faceVertexUvs;

		var hasFaceVertexUv = faceVertexUvs[ 0 ] && faceVertexUvs[ 0 ].length > 0;
		var hasFaceVertexUv2 = faceVertexUvs[ 1 ] && faceVertexUvs[ 1 ].length > 0;

		// morphs

		var morphTargets = geometry.morphTargets;
		var morphTargetsLength = morphTargets.length;

		for ( var i = 0; i < morphTargetsLength; i ++ ) {

			this.morphTargets[ i ] = [];

		}

		var morphNormals = geometry.morphNormals;
		var morphNormalsLength = morphNormals.length;

		for ( var i = 0; i < morphNormalsLength; i ++ ) {

			this.morphNormals[ i ] = [];

		}

		var morphColors = geometry.morphColors;
		var morphColorsLength = morphColors.length;

		for ( var i = 0; i < morphColorsLength; i ++ ) {

			this.morphColors[ i ] = [];

		}

		// skins

		var skinIndices = geometry.skinIndices;
		var skinWeights = geometry.skinWeights;

		var hasSkinIndices = skinIndices.length === vertices.length;
		var hasSkinWeights = skinWeights.length === vertices.length;

		//

		for ( var i = 0; i < faces.length; i ++ ) {

			var face = faces[ i ];

			this.vertices.push( vertices[ face.a ], vertices[ face.b ], vertices[ face.c ] );

			var vertexNormals = face.vertexNormals;

			if ( vertexNormals.length === 3 ) {

				this.normals.push( vertexNormals[ 0 ], vertexNormals[ 1 ], vertexNormals[ 2 ] );

			} else {

				var normal = face.normal;

				this.normals.push( normal, normal, normal );

			}

			var vertexColors = face.vertexColors;

			if ( vertexColors.length === 3 ) {

				this.colors.push( vertexColors[ 0 ], vertexColors[ 1 ], vertexColors[ 2 ] );

			} else {

				var color = face.color;

				this.colors.push( color, color, color );

			}

			if ( hasFaceVertexUv === true ) {

				var vertexUvs = faceVertexUvs[ 0 ][ i ];

				if ( vertexUvs !== undefined ) {

					this.uvs.push( vertexUvs[ 0 ], vertexUvs[ 1 ], vertexUvs[ 2 ] );

				} else {

					console.warn( 'THREE.BufferGeometry.fromGeometry(): Undefined vertexUv', i );

					this.uvs.push( new THREE.Vector2(), new THREE.Vector2(), new THREE.Vector2() );

				}

			}

			if ( hasFaceVertexUv2 === true ) {

				var vertexUvs = faceVertexUvs[ 1 ][ i ];

				if ( vertexUvs !== undefined ) {

					this.uvs2.push( vertexUvs[ 0 ], vertexUvs[ 1 ], vertexUvs[ 2 ] );

				} else {

					console.warn( 'THREE.BufferGeometry.fromGeometry(): Undefined vertexUv2', i );

					this.uvs2.push( new THREE.Vector2(), new THREE.Vector2(), new THREE.Vector2() );

				}

			}

			// morphs

			for ( var j = 0; j < morphTargetsLength; j ++ ) {

				var morphTarget = morphTargets[ j ].vertices;

				this.morphTargets[ j ].push( morphTarget[ face.a ], morphTarget[ face.b ], morphTarget[ face.c ] );

			}
			/*
			for ( var j = 0; j < morphNormalsLength; j ++ ) {

				var morphNormal = morphNormals[ j ].vertexNormals[ i ];

				this.morphNormals[ j ].push( morphNormal.a, morphNormal.b, morphNormal.c );

			}

			for ( var j = 0; j < morphColorsLength; j ++ ) {

				var morphColor = morphColors[ j ].colors;

				this.morphColors[ j ].push( morphColor[ face.a ], morphColor[ face.b ], morphColor[ face.c ] );

			}
			*/

			// skins

			if ( hasSkinIndices ) {

				this.skinIndices.push( skinIndices[ face.a ], skinIndices[ face.b ], skinIndices[ face.c ] );

			}

			if ( hasSkinWeights ) {

				this.skinWeights.push( skinWeights[ face.a ], skinWeights[ face.b ], skinWeights[ face.c ] );

			}

		}

		this.verticesNeedUpdate = geometry.verticesNeedUpdate;
		this.normalsNeedUpdate = geometry.normalsNeedUpdate;
		this.colorsNeedUpdate = geometry.colorsNeedUpdate;
		this.uvsNeedUpdate = geometry.uvsNeedUpdate;

		return this;

	},

	dispose: function () {

		this.dispatchEvent( { type: 'dispose' } );

	}

};

THREE.EventDispatcher.prototype.apply( THREE.DirectGeometry.prototype );
