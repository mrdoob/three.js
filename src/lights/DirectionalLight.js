/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.DirectionalLight = function ( color, intensity ) {

	THREE.Light.call( this, color, intensity );

	this.type = 'DirectionalLight';

	this.position.set( 0, 1, 0 );
	this.updateMatrix();

	this.target = new THREE.Object3D();

	this.shadow = new THREE.LightShadow( new THREE.OrthographicCamera( - 5, 5, 5, - 5, 0.5, 500 ) );

};

THREE.DirectionalLight.prototype = Object.create( THREE.Light.prototype );
THREE.DirectionalLight.prototype.constructor = THREE.DirectionalLight;

THREE.DirectionalLight.prototype.copy = function ( source ) {

	THREE.Light.prototype.copy.call( this, source );

	this.target = source.target.clone();

	this.shadow = source.shadow.clone();

	return this;

};
