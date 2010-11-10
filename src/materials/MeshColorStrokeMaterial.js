/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.MeshColorStrokeMaterial = function ( hex, opacity, lineWidth ) {

	this.lineWidth = lineWidth || 1;

	this.color = new THREE.Color( ( opacity !== undefined ? opacity : 1 ) * 0xff << 24 ^ hex );

	this.toString = function () {

		return 'THREE.MeshColorStrokeMaterial ( lineWidth: ' + this.lineWidth + ', color: ' + this.color + ' )';

	};

};
