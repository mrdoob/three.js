/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.HemisphereLight = function ( skyColor, groundColor, intensity ) {

	THREE.Light.call( this, skyColor, intensity );

	this.type = 'HemisphereLight';

	this.castShadow = undefined;

	this.position.set( 0, 1, 0 );
	this.updateMatrix();

	this.groundColor = new THREE.Color( groundColor );

};

THREE.HemisphereLight.prototype = Object.assign( Object.create( THREE.Light.prototype ), {

	constructor: THREE.HemisphereLight,

	copy: function ( source ) {

		THREE.Light.prototype.copy.call( this, source );

		this.groundColor.copy( source.groundColor );

		return this;

	}

} );
