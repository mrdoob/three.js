/**
 * @author mr.doob / http://mrdoob.com/
 *
 * params = {
 * 	color: new THREE.Color(),
 * 	line_width: [ 0 - 100 ]
 * }
 */

THREE.LineColorMaterial = function ( params ) {

	this.params = params;

};

THREE.LineColorMaterial.prototype = {

	toString: function () {

		return 'THREE.LineColorMaterial ( params: ' + this.params + ' )';

	}

};
