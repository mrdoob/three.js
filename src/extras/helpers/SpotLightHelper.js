/**
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 * @author WestLangley / http://github.com/WestLangley
*/

THREE.SpotLightHelper = function ( light ) {

	THREE.Object3D.call( this );

	this.light = light;
	this.light.updateMatrixWorld();

	this.matrixWorld = light.matrixWorld;
	this.matrixAutoUpdate = false;

	var geometry = new THREE.CylinderGeometry( 0, 1, 1, 8, 1, true );

	geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, - 0.5, 0 ) );
	geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

	var material = new THREE.MeshBasicMaterial( { wireframe: true, fog: false } );
	
	this.cone = new THREE.Mesh( geometry, material );
	this.add( this.cone );

	this.update();

};

THREE.SpotLightHelper.prototype = Object.create( THREE.Object3D.prototype );

THREE.SpotLightHelper.prototype.dispose = function () {
	this.cone.geometry.dispose();
	this.cone.material.dispose();
};

THREE.SpotLightHelper.prototype.update = function () {

	var vector = new THREE.Vector3();
	var vector2 = new THREE.Vector3();

	return function () {

		var coneLength = this.light.distance ? this.light.distance : 10000;
		var coneWidth = coneLength * Math.tan( this.light.angle );

		this.cone.scale.set( coneWidth, coneWidth, coneLength );

		vector.setFromMatrixPosition( this.light.matrixWorld );
		vector2.setFromMatrixPosition( this.light.target.matrixWorld );

		this.cone.lookAt( vector2.sub( vector ) );

		this.cone.material.color.copy( this.light.color ).multiplyScalar( this.light.intensity );

	};

}();
