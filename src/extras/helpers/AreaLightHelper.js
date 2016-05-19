/**
 * @author abelnation / http://github.com/abelnation
*/

THREE.AreaLightHelper = function ( light ) {

	THREE.Object3D.call( this );

	this.light = light;
	this.light.updateMatrixWorld();

	this.matrix = light.matrixWorld;
	this.matrixAutoUpdate = false;

	var geometry = new THREE.BufferGeometry();

	var positions = [
		// TODO: decide geometry of area light helper
	];

	// NOTES:
	// Geometry should be:
	// 1. flat polygon in the shape of the light, colored w/ the light color

	geometry.addAttribute( 'position', new THREE.Float32Attribute( positions, 3 ) );

	var material = new THREE.LineBasicMaterial( { fog: false } );

	// this.cone = new THREE.LineSegments( geometry, material );
	// TODO: create light shape object
	this.lightShape = undefined
	this.add( this.lightShape );

	this.update();

};

THREE.AreaLightHelper.prototype = Object.create( THREE.Object3D.prototype );
THREE.AreaLightHelper.prototype.constructor = THREE.AreaLightHelper;

THREE.AreaLightHelper.prototype.dispose = function () {

	this.lightShape.geometry.dispose();
	this.lightShape.material.dispose();

};

THREE.AreaLightHelper.prototype.update = function () {

	var vector = new THREE.Vector3();
	var vector2 = new THREE.Vector3();

	return function () {

		// TODO: update light shape geometry

		// var coneLength = this.light.distance ? this.light.distance : 1000;
		// var coneWidth = coneLength * Math.tan( this.light.angle );

		// this.lightShape.scale.set( coneWidth, coneWidth, coneLength );

		// vector.setFromMatrixPosition( this.light.matrixWorld );
		// vector2.setFromMatrixPosition( this.light.target.matrixWorld );

		// this.lightShape.lookAt( vector2.sub( vector ) );

		// this.lightShape.material.color.copy( this.light.color ).multiplyScalar( this.light.intensity );

	};

}();
