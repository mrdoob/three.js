/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.Light = function ( color ) {

	THREE.Object3D.call( this );

	this.color = new THREE.Color( color );

};

THREE.Light.prototype = Object.create( THREE.Object3D.prototype );

THREE.Light.prototype.clone = function ( light ) {

	if ( light === undefined ) light = new THREE.Light();

	THREE.Object3D.prototype.clone.call( this, light );

	light.color.copy( this.color );

	return light;

};


THREE.Light._getWorldDirectionClosure = function() {

	var targetPosition = new THREE.Vector3();

	return function ( optionalTarget ) {

		var direction = optionalTarget || new THREE.Vector3();

		direction.setFromMatrixPosition( this.matrixWorld );
		targetPosition.setFromMatrixPosition( this.target.matrixWorld );
		direction.sub( targetPosition );
		direction.normalize();

		return direction;

	};

};
