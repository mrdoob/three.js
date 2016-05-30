/**
 * @author abelnation / http://github.com/abelnation
 */

THREE.AreaLight = function ( color, intensity, polygon ) {

	THREE.Light.call( this, color, intensity );

	this.type = 'AreaLight';

	this.position.set( 0, 1, 0 );
	this.updateMatrix();

	this.target = new THREE.Object3D();

	this.polygon = ( polygon !== undefined ) ? polygon.clone() : THREE.Polygon.makeSquare();

	// TODO (abelnation): distance/decay

	// TODO (abelnation): shadows
	// this.shadow = new THREE.AreaLightShadow( new THREE.PerspectiveCamera( 90, 1, 0.5, 500 ) );

};

THREE.AreaLight.prototype = Object.create( THREE.Light.prototype );
THREE.AreaLight.prototype.constructor = THREE.AreaLight;

// TODO (abelnation): AreaLight update when light shape is changed

THREE.AreaLight.prototype.copy = function ( source ) {

	THREE.Light.prototype.copy.call( this, source );

	this.polygon = source.polygon.clone();

	// this.shadow = source.shadow.clone();

	return this;

};
