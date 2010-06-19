/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.FaceColorStrokeMaterial = function ( lineWidth ) {

	this.lineWidth = lineWidth || 1;

	this.toString = function () {

		return 'THREE.FaceColorStrokeMaterial ( lineWidth: ' + this.lineWidth + ' )';

	};

};
