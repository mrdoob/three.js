/**
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 */

THREE.SpotLightHelper = function ( light, sphereSize ) {

	THREE.Object3D.call( this );

	this.light = light;

	var geometry = new THREE.SphereGeometry( sphereSize, 4, 2 );
	var material = new THREE.MeshBasicMaterial( { fog: false, wireframe: true } );
	material.color.copy( this.light.color ).multiplyScalar( this.light.intensity );

	this.lightSphere = new THREE.Mesh( geometry, material );
	this.lightSphere.position = this.light.position;
	this.add( this.lightSphere );

	geometry = new THREE.CylinderGeometry( 0.0001, 1, 1, 8, 1, true );
	geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ).translate( new THREE.Vector3( 0, -0.5, 0 ) ) );

	material = new THREE.MeshBasicMaterial( { fog: false, wireframe: true, opacity: 0.3, transparent: true } );
	material.color.copy( this.light.color ).multiplyScalar( this.light.intensity );

	this.lightCone = new THREE.Mesh( geometry, material );
	this.lightCone.position = this.light.position;

	var coneLength = light.distance ? light.distance : 10000;
	var coneWidth = coneLength * Math.tan( light.angle * 0.5 ) * 2;

	this.lightCone.scale.set( coneWidth, coneWidth, coneLength );
	this.lightCone.lookAt( this.light.target.position );

	this.add( this.lightCone );

};

THREE.SpotLightHelper.prototype = Object.create( THREE.Object3D.prototype );

THREE.SpotLightHelper.prototype.update = function () {

	var coneLength = this.light.distance ? this.light.distance : 10000;
	var coneWidth = coneLength * Math.tan( this.light.angle * 0.5 ) * 2;

	this.lightCone.scale.set( coneWidth, coneWidth, coneLength );
	this.lightCone.lookAt( this.light.target.position );

	this.lightSphere.material.color.copy( this.light.color ).multiplyScalar( this.light.intensity );
	this.lightCone.material.color.copy( this.light.color ).multiplyScalar( this.light.intensity );

};
