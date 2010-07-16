/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.MeshColorStrokeMaterial = function ( hex, opacity, lineWidth ) {

	this.lineWidth = lineWidth || 1;

	this.color = new THREE.Color( ( opacity >= 0 ? ( opacity * 0xff ) << 24 : 0xff000000 ) | hex );

	this.toString = function () {

		return 'THREE.MeshColorStrokeMaterial ( lineWidth: ' + this.lineWidth + ', color: ' + this.color + ' )';

	};

};
