/**
 * @author mr.doob / http://mrdoob.com/
 *
 * params = {
 * 	diffuse_color: new THREE.Color(),
 * 	line_width: Number
 * }
 */

THREE.LineBasicMaterial = function ( params ) {

	this.params = params;

};

THREE.LineBasicMaterial.prototype = {

	toString: function () {

		return 'THREE.LineBasicMaterial ( params: ' + this.params + ' )';

	}

};
