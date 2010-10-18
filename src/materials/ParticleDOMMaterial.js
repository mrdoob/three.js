/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.ParticleDOMMaterial = function ( domElement ) {

	this.domElement = domElement;

	this.toString = function () {

		return 'THREE.ParticleDOMMaterial ( domElement: ' + this.domElement + ' )';

	};

};
