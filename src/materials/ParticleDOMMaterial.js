/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.ParticleDOMMaterial = function ( domElement ) {

	this.id = THREE.MaterialCounter.value ++;
	
	this.domElement = domElement;

};


THREE.ParticleDOMMaterial.prototype = {

	toString: function () {

		return 'THREE.ParticleDOMMaterial ( domElement: ' + this.domElement + ' )';

	}

};
