/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.AmbientLight = function ( color, intensity ) {

	THREE.Light.call( this, color, intensity );

	this.type = 'AmbientLight';

	this.castShadow = undefined;

};

THREE.AmbientLight.prototype = Object.assign( Object.create( THREE.Light.prototype ), {

	constructor: THREE.AmbientLight

} );
