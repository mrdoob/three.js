/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.ColorStrokeMaterial = function ( lineWidth, hex, opacity ) {

	this.lineWidth = lineWidth || 1;

	this.color = new THREE.Color( ( opacity >= 0 ? ( opacity * 0xff ) << 24 : 0xff000000 ) | hex );

	this.toString = function () {

		return 'THREE.ColorStrokeMaterial ( lineWidth: ' + this.lineWidth + ', color: ' + this.color + ' )';

	};

};
