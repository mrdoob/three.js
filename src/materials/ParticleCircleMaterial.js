/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.ParticleCircleMaterial = function ( hex, opacity ) {

	this.color = new THREE.Color( ( opacity >= 0 ? ( opacity * 0xff ) << 24 : 0xff000000 ) | hex );

	this.toString = function () {

		return 'THREE.ParticleCircleMaterial ( color: ' + this.color + ' )';

	};

};
