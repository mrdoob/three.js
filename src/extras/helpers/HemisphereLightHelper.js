/**
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 */

THREE.HemisphereLightHelper = function ( light, sphereSize, arrowLength, domeSize ) {

	THREE.Object3D.call( this );

	this.light = light;

	var geometry = new THREE.SphereGeometry( sphereSize, 4, 2 );
	geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

	for ( var i = 0, il = 8; i < il; i ++ ) {

		geometry.faces[ i ].materialIndex = i < 4 ? 0 : 1;

	}

	var materialSky = new THREE.MeshBasicMaterial( { fog: false, wireframe: true } );
	materialSky.color.copy( light.color ).multiplyScalar( light.intensity );

	var materialGround = new THREE.MeshBasicMaterial( { fog: false, wireframe: true } );
	materialGround.color.copy( light.groundColor ).multiplyScalar( light.intensity );

	this.lightSphere = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( [ materialSky, materialGround ] ) );
	this.lightSphere.position = light.position;
	this.lightSphere.lookAt( new THREE.Vector3() );
	this.add( this.lightSphere );

};

THREE.HemisphereLightHelper.prototype = Object.create( THREE.Object3D.prototype );

THREE.HemisphereLightHelper.prototype.update = function () {

	this.lightSphere.lookAt( new THREE.Vector3() );

	this.lightSphere.material.materials[ 0 ].color.copy( this.light.color ).multiplyScalar( this.light.intensity );
	this.lightSphere.material.materials[ 1 ].color.copy( this.light.groundColor ).multiplyScalar( this.light.intensity );

};

