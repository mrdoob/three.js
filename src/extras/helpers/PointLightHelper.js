/**
 * @author alteredq / http://alteredqualia.com/
 *
 *	- shows point light color, intensity, position and distance
 */

THREE.PointLightHelper = function ( light, sphereSize ) {

	/*
	// light helper

	var distanceGeometry = new THREE.IcosahedronGeometry( 1, 2 );
	var distanceMaterial = new THREE.MeshBasicMaterial( { color: hexColor, fog: false, wireframe: true, opacity: 0.1, transparent: true } );

	this.lightSphere = new THREE.Mesh( bulbGeometry, bulbMaterial );
	this.lightDistance = new THREE.Mesh( distanceGeometry, distanceMaterial );

	var d = light.distance;

	if ( d === 0.0 ) {

		this.lightDistance.visible = false;

	} else {

		this.lightDistance.scale.set( d, d, d );

	}

	this.add( this.lightSphere );
	this.add( this.lightRays );
	this.add( this.lightDistance );
	*/

	var geometry = new THREE.SphereGeometry( sphereSize, 4, 2 );
	var material = new THREE.MeshBasicMaterial( { color: light.color.getHex(), fog: false, wireframe: true } );

	THREE.Mesh.call( this, geometry, material );

	this.light = light;
	this.position = light.position;

}

THREE.PointLightHelper.prototype = Object.create( THREE.Mesh.prototype );

THREE.PointLightHelper.prototype.update = function () {

	this.material.color.copy( this.light.color );
	this.material.color.multiplyScalar( THREE.Math.clamp( this.light.intensity, 0, 1 ) );

	/*
	this.lightDistance.material.color.copy( this.color );

	var d = this.light.distance;

	if ( d === 0.0 ) {

		this.lightDistance.visible = false;

	} else {

		this.lightDistance.visible = true;
		this.lightDistance.scale.set( d, d, d );

	}
	*/

}

