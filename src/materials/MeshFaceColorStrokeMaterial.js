/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.MeshFaceColorStrokeMaterial = function ( lineWidth ) {

	this.lineWidth = lineWidth || 1;

	this.toString = function () {

		return 'THREE.MeshFaceColorStrokeMaterial ( lineWidth: ' + this.lineWidth + ' )';

	};

};
