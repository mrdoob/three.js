/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.BufferGeometry = function () {

	this.id = THREE.GeometryCount ++;

	// GL buffers

	this.vertexIndexBuffer = null;
	this.vertexPositionBuffer = null;
	this.vertexNormalBuffer = null;
	this.vertexUvBuffer = null;
	this.vertexColorBuffer = null;

	// typed arrays (kept only if dynamic flag is set)

	this.vertexIndexArray = null;
	this.vertexPositionArray = null;
	this.vertexNormalArray = null;
	this.vertexUvArray = null;
	this.vertexColorArray = null;

	this.dynamic = false;

	// boundings

	this.boundingBox = null;
	this.boundingSphere = null;

	// for compatibility

	this.morphTargets = [];

};

THREE.BufferGeometry.prototype = {

	constructor : THREE.BufferGeometry,

	applyMatrix: function ( matrix ) {

		if ( this.vertexPositionArray !== undefined ) {

			matrix.multiplyVector3Array( this.vertexPositionArray );
			this.verticesNeedUpdate = true;

		}

		if ( this.vertexNormalArray !== undefined ) {

			var matrixRotation = new THREE.Matrix4();
			matrixRotation.extractRotation( matrix );

			matrixRotation.multiplyVector3Array( this.vertexNormalArray );
			this.normalsNeedUpdate = true;

		}

	},

	// for compatibility

	computeBoundingBox: function () {

	},

	// for compatibility

	computeBoundingSphere: function () {

	}


};

