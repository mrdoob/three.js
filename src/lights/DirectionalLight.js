/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.DirectionalLight = function ( color, intensity, radius ) {

	THREE.Light.call( this, color, intensity );

	this.type = 'DirectionalLight';

	this.position.set( 0, 1, 0 );
	this.updateMatrix();

	this.target = new THREE.Object3D();

	this.radius = ( radius !== undefined ) ? radius : 0.05; // default bulb size is 5cm

	this.shadow = new THREE.LightShadow( new THREE.OrthographicCamera( - 5, 5, 5, - 5, 0.5, 500 ) );

};

THREE.DirectionalLight.prototype = Object.create( THREE.Light.prototype );
THREE.DirectionalLight.prototype.constructor = THREE.DirectionalLight;

THREE.DirectionalLight.prototype.copy = function ( source ) {

	THREE.Light.prototype.copy.call( this, source );

	this.radius = source.radius;

	this.target = source.target.clone();

	this.shadow = source.shadow.clone();

	return this;

};
