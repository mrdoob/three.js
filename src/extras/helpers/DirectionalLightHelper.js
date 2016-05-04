/**
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 * @author WestLangley / http://github.com/WestLangley
 */

THREE.DirectionalLightHelper = function ( light, size ) {

	THREE.Object3D.call( this );

	this.light = light;
	this.light.updateMatrixWorld();

	this.matrix = light.matrixWorld;
	this.matrixAutoUpdate = false;

	if ( size === undefined ) size = 1;

	var geometry = new THREE.BufferGeometry();
	geometry.addAttribute( 'position', new THREE.Float32Attribute( [
		- size,   size, 0,
		  size,   size, 0,
		  size, - size, 0,
		- size, - size, 0,
		- size,   size, 0
	], 3 ) );

	var material = new THREE.LineBasicMaterial( { fog: false } );

	this.add( new THREE.Line( geometry, material ) );

	geometry = new THREE.BufferGeometry();
	geometry.addAttribute( 'position', new THREE.Float32Attribute( [ 0, 0, 0, 0, 0, 1 ], 3 ) );

	this.add( new THREE.Line( geometry, material ));

	this.update();

};

THREE.DirectionalLightHelper.prototype = Object.create( THREE.Object3D.prototype );
THREE.DirectionalLightHelper.prototype.constructor = THREE.DirectionalLightHelper;

THREE.DirectionalLightHelper.prototype.dispose = function () {

	var lightPlane = this.children[ 0 ];
	var targetLine = this.children[ 1 ];

	lightPlane.geometry.dispose();
	lightPlane.material.dispose();
	targetLine.geometry.dispose();
	targetLine.material.dispose();

};

THREE.DirectionalLightHelper.prototype.update = function () {

	var v1 = new THREE.Vector3();
	var v2 = new THREE.Vector3();
	var v3 = new THREE.Vector3();

	return function () {

		v1.setFromMatrixPosition( this.light.matrixWorld );
		v2.setFromMatrixPosition( this.light.target.matrixWorld );
		v3.subVectors( v2, v1 );

		var lightPlane = this.children[ 0 ];
		var targetLine = this.children[ 1 ];

		lightPlane.lookAt( v3 );
		lightPlane.material.color.copy( this.light.color ).multiplyScalar( this.light.intensity );

		targetLine.lookAt( v3 );
		targetLine.scale.z = v3.length();

	};

}();
