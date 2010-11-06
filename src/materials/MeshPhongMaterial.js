/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.MeshPhongMaterial = function ( ambient, diffuse, specular, shininess, opacity ) {

	this.ambient = new THREE.Color( ( opacity !== undefined ? opacity : 1 ) * 0xff << 24 ^ ambient );
	this.diffuse = new THREE.Color( ( opacity !== undefined ? opacity : 1 ) * 0xff << 24 ^ diffuse );
	this.specular = new THREE.Color( ( opacity !== undefined ? opacity : 1 ) * 0xff << 24 ^ specular );

	this.shininess = shininess;
	this.opacity = opacity;

	this.toString = function () {

		return 'THREE.MeshPhongMaterial ( <br/>ambient: ' + this.ambient 
                + ', <br/>diffuse: ' + this.diffuse 
                + ', <br/>specular: ' + this.specular 
                + ', <br/>shininess: ' + this.shininess 
                + ', <br/>opacity: ' + this.opacity + ')';

	};

};
