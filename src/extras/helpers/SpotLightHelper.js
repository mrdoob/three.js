/**
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 * @author WestLangley / http://github.com/WestLangley
*/

THREE.SpotLightHelper = function ( light ) {

	// spotlight helper must be a child of the scene

	this.light = light;

	var geometry = new THREE.CylinderGeometry( 0, 1, 1, 8, 1, true );

	geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, -0.5, 0 ) );

	geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

	var material = new THREE.MeshBasicMaterial( { wireframe: true, opacity: 0.3, transparent: true } );

	THREE.Mesh.call( this, geometry, material );

	this.update();

};

THREE.SpotLightHelper.prototype = Object.create( THREE.Mesh.prototype );

THREE.SpotLightHelper.prototype.update = ( function () {

	var targetPosition = new THREE.Vector3();

	return function() {

		var coneLength = this.light.distance ? this.light.distance : 10000;

		var coneWidth = coneLength * Math.tan( this.light.angle );

		this.scale.set( coneWidth, coneWidth, coneLength );

		this.light.updateMatrixWorld( true );

		this.position.getPositionFromMatrix( this.light.matrixWorld );

		this.light.target.updateMatrixWorld( true );

		targetPosition.getPositionFromMatrix( this.light.target.matrixWorld );

		this.lookAt( targetPosition );

		this.material.color.copy( this.light.color ).multiplyScalar( this.light.intensity );

	}

}());
