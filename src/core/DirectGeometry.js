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

		var faces = geometry.faces;
		var vertices = geometry.vertices;
		var faceVertexUvs = geometry.faceVertexUvs;
		var materialVertexColors = material.vertexColors;

		var hasFaceVertexUv = faceVertexUvs[ 0 ] && faceVertexUvs[ 0 ].length > 0;
		var hasFaceVertexUv2 = faceVertexUvs[ 1 ] && faceVertexUvs[ 1 ].length > 0;

		for ( var i = 0, i3 = 0; i < faces.length; i ++, i3 += 3 ) {

			this.indices.push( new THREE.Index( i3, i3 + 1, i3 + 2 ) );

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
		if ( geometry.morphTargets ) this.morphTargets = geometry.morphTargets.slice( 0 );
		if ( geometry.morphColors ) this.morphColors = geometry.morphColors.slice( 0 );
		if ( geometry.morphNormals ) this.morphNormals = geometry.morphNormals.slice( 0 );

		if ( geometry.skinIndices ) this.skinIndices = geometry.skinIndices.slice( 0 );
		if ( geometry.skinWeights ) this.skinWeights = geometry.skinWeights.slice( 0 );

		return this;
		*/

	},

	updateFromGeometry: function ( geometry, material ) {

		var faces = geometry.faces;
		var vertices = geometry.vertices;

		for ( var i = 0, i3 = 0; i < faces.length; i ++, i3 += 3 ) {

			var face = faces[ i ];

			var a = vertices[ face.a ];
			var b = vertices[ face.b ];
			var c = vertices[ face.c ];

			if ( geometry.verticesNeedUpdate ) {

				this.vertices[ i3     ].copy( a );
				this.vertices[ i3 + 1 ].copy( b );
				this.vertices[ i3 + 2 ].copy( c );

			}

			if ( geometry.normalsNeedUpdate ) {

				var vertexNormals = face.vertexNormals;

				if ( vertexNormals.length === 3 ) {

					this.normals[ i3     ].copy( vertexNormals[ 0 ] );
					this.normals[ i3 + 1 ].copy( vertexNormals[ 1 ] );
					this.normals[ i3 + 2 ].copy( vertexNormals[ 2 ] );

				} else {

					var normal = face.normal;

					this.normals[ i3     ].copy( normal );
					this.normals[ i3 + 1 ].copy( normal );
					this.normals[ i3 + 2 ].copy( normal );

				}

			}

		}

		// TODO: normals, colors, uvs

		this.verticesNeedUpdate = geometry.verticesNeedUpdate;
		this.normalsNeedUpdate = geometry.normalsNeedUpdate;
		this.colorsNeedUpdate = geometry.colorsNeedUpdate;
		this.uvsNeedUpdate = geometry.uvsNeedUpdate;

		geometry.verticesNeedUpdate = false;
		geometry.normalsNeedUpdate = false;
		geometry.colorsNeedUpdate = false;
		geometry.uvsNeedUpdate = false;

		return this;

	},

	dispose: function () {

		this.dispatchEvent( { type: 'dispose' } );

	}

};

THREE.EventDispatcher.prototype.apply( THREE.DirectGeometry.prototype );
