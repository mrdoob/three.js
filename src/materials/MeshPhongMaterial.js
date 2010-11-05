/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.MeshPhongMaterial = function ( ambient, diffuse, specular, shininess, opacity ) {

	this.ambient = new THREE.Color( ( opacity >= 0 ? ( opacity * 0xff ) << 24 : 0xff000000 ) | ambient );
	this.diffuse = new THREE.Color( ( opacity >= 0 ? ( opacity * 0xff ) << 24 : 0xff000000 ) | diffuse );
	this.specular = new THREE.Color( ( opacity >= 0 ? ( opacity * 0xff ) << 24 : 0xff000000 ) | specular );
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
