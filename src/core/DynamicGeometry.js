/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.DynamicGeometry = function () {

	Object.defineProperty( this, 'id', { value: THREE.GeometryIdCount ++ } );

	this.uuid = THREE.Math.generateUUID();

	this.name = '';
	this.type = 'DynamicGeometry';

	this.vertices = [];
	this.colors = [];
	this.normals = [];
	this.colors = [];
	this.uvs = [];
	this.faces = [];

	/*

	this.morphTargets = [];
	this.morphColors = [];
	this.morphNormals = [];

	this.skinWeights = [];
	this.skinIndices = [];

	this.lineDistances = [];

	*/

	this.boundingBox = null;
	this.boundingSphere = null;

	// update flags

	this.verticesNeedUpdate = false;
	this.normalsNeedUpdate = false;
	this.colorsNeedUpdate = false;
	this.uvsNeedUpdate = false;

};

THREE.DynamicGeometry.prototype = {

	constructor: THREE.Geometry,

	fromGeometry: function ( geometry ) {

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

			for ( var j = 0, jl = vertexUvs.length; j < jl; j ++ ) {

				this.uvs[ indices[ j ] ] = vertexUvs[ j ];

			}

		}

	},

	dispose: function () {

		this.dispatchEvent( { type: 'dispose' } );

	}

};

THREE.EventDispatcher.prototype.apply( THREE.DynamicGeometry.prototype );
