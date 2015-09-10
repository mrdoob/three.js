/**
 * @author mrdoob / http://mrdoob.com/
 */

module.exports = DirectGeometry;

var EventDispatcher = require( "./EventDispatcher" ),
	Geometry = require( "./Geometry" ),
	_Math = require( "../math/Math" ),
	Vector2 = require( "../math/Vector2" );

function DirectGeometry() {

	Object.defineProperty( this, "id", { value: Geometry.IdCount ++ } );

	this.uuid = _Math.generateUUID();

	this.name = "";
	this.type = "DirectGeometry";

	this.indices = [];
	this.vertices = [];
	this.normals = [];
	this.colors = [];
	this.uvs = [];
	this.uvs2 = [];

	this.groups = [];

	this.morphTargets = {};

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
	this.groupsNeedUpdate = false;


}

DirectGeometry.prototype = {

	constructor: DirectGeometry,

	computeBoundingBox: Geometry.prototype.computeBoundingBox,
	computeBoundingSphere: Geometry.prototype.computeBoundingSphere,

	computeFaceNormals: function () {

		console.warn( "DirectGeometry: computeFaceNormals() is not a method of this type of geometry." );

	},

	computeVertexNormals: function () {

		console.warn( "DirectGeometry: computeVertexNormals() is not a method of this type of geometry." );

	},

	computeGroups: function ( geometry ) {

		var group;
		var groups = [];
		var materialIndex;

		var i, faces = geometry.faces, face;

		for ( i = 0; i < faces.length; i ++ ) {

			face = faces[ i ];

			// materials

			if ( face.materialIndex !== materialIndex ) {

				materialIndex = face.materialIndex;

				if ( group !== undefined ) {

					group.count = ( i * 3 ) - group.start;
					groups.push( group );

				}

				group = {
					start: i * 3,
					materialIndex: materialIndex
				};

			}

		}

		if ( group !== undefined ) {

			group.count = ( i * 3 ) - group.start;
			groups.push( group );

		}

		this.groups = groups;

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

		var i,
			morphTargetsPosition,
			morphNormals,
			morphNormalsLength,
			morphTargetsNormal;

		if ( morphTargetsLength > 0 ) {

			morphTargetsPosition = [];

			for ( i = 0; i < morphTargetsLength; i ++ ) {

				morphTargetsPosition[ i ] = [];

			}

			this.morphTargets.position = morphTargetsPosition;

		}

		morphNormals = geometry.morphNormals;
		morphNormalsLength = morphNormals.length;

		if ( morphNormalsLength > 0 ) {

			morphTargetsNormal = [];

			for ( i = 0; i < morphNormalsLength; i ++ ) {

				morphTargetsNormal[ i ] = [];

			}

			this.morphTargets.normal = morphTargetsNormal;

		}

		// skins

		var skinIndices = geometry.skinIndices;
		var skinWeights = geometry.skinWeights;

		var hasSkinIndices = skinIndices.length === vertices.length;
		var hasSkinWeights = skinWeights.length === vertices.length;

		//

		var face, vertexNormals, normal,
			vertexColors, color, vertexUvs;

		for ( i = 0; i < faces.length; i ++ ) {

			face = faces[ i ];

			this.vertices.push( vertices[ face.a ], vertices[ face.b ], vertices[ face.c ] );

			vertexNormals = face.vertexNormals;

			if ( vertexNormals.length === 3 ) {

				this.normals.push( vertexNormals[ 0 ], vertexNormals[ 1 ], vertexNormals[ 2 ] );

			} else {

				normal = face.normal;

				this.normals.push( normal, normal, normal );

			}

			vertexColors = face.vertexColors;

			if ( vertexColors.length === 3 ) {

				this.colors.push( vertexColors[ 0 ], vertexColors[ 1 ], vertexColors[ 2 ] );

			} else {

				color = face.color;

				this.colors.push( color, color, color );

			}

			if ( hasFaceVertexUv === true ) {

				vertexUvs = faceVertexUvs[ 0 ][ i ];

				if ( vertexUvs !== undefined ) {

					this.uvs.push( vertexUvs[ 0 ], vertexUvs[ 1 ], vertexUvs[ 2 ] );

				} else {

					console.warn( "DirectGeometry.fromGeometry(): Undefined vertexUv ", i );

					this.uvs.push( new Vector2(), new Vector2(), new Vector2() );

				}

			}

			if ( hasFaceVertexUv2 === true ) {

				vertexUvs = faceVertexUvs[ 1 ][ i ];

				if ( vertexUvs !== undefined ) {

					this.uvs2.push( vertexUvs[ 0 ], vertexUvs[ 1 ], vertexUvs[ 2 ] );

				} else {

					console.warn( "DirectGeometry.fromGeometry(): Undefined vertexUv2 ", i );

					this.uvs2.push( new Vector2(), new Vector2(), new Vector2() );

				}

			}

			// morphs

			var j, morphTarget, morphNormal;

			for ( j = 0; j < morphTargetsLength; j ++ ) {

				morphTarget = morphTargets[ j ].vertices;

				morphTargetsPosition[ j ].push( morphTarget[ face.a ], morphTarget[ face.b ], morphTarget[ face.c ] );

			}

			for ( j = 0; j < morphNormalsLength; j ++ ) {

				morphNormal = morphNormals[ j ].vertexNormals[ i ];

				morphTargetsNormal[ j ].push( morphNormal.a, morphNormal.b, morphNormal.c );

			}

			// skins

			if ( hasSkinIndices ) {

				this.skinIndices.push( skinIndices[ face.a ], skinIndices[ face.b ], skinIndices[ face.c ] );

			}

			if ( hasSkinWeights ) {

				this.skinWeights.push( skinWeights[ face.a ], skinWeights[ face.b ], skinWeights[ face.c ] );

			}

		}

		this.computeGroups( geometry );

		this.verticesNeedUpdate = geometry.verticesNeedUpdate;
		this.normalsNeedUpdate = geometry.normalsNeedUpdate;
		this.colorsNeedUpdate = geometry.colorsNeedUpdate;
		this.uvsNeedUpdate = geometry.uvsNeedUpdate;
		this.groupsNeedUpdate = geometry.groupsNeedUpdate;

		return this;

	},

	dispose: function () {

		this.dispatchEvent( { type: "dispose" } );

	}

};

EventDispatcher.prototype.apply( DirectGeometry.prototype );
