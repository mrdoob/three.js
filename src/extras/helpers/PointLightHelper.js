/**
 * @author alteredq / http://alteredqualia.com/
 *
 *	- shows point light color, intensity, position and distance
 */

THREE.PointLightHelper = function ( light, sphereSize ) {

	THREE.Object3D.call( this );

	this.light = light;

	// position

	this.position = light.position;

	// color

	var intensity = THREE.Math.clamp( light.intensity, 0, 1 );

	this.color = light.color.clone();
	this.color.multiplyScalar( intensity );

	var hexColor = this.color.getHex();

	// light helper

	var bulbGeometry = new THREE.SphereGeometry( sphereSize, 16, 8 );
	var raysGeometry = new THREE.AsteriskGeometry( sphereSize * 1.25, sphereSize * 2.25 );
	var distanceGeometry = new THREE.IcosahedronGeometry( 1, 2 );

	var bulbMaterial = new THREE.MeshBasicMaterial( { color: hexColor, fog: false } );
	var raysMaterial = new THREE.LineBasicMaterial( { color: hexColor, fog: false } );
	var distanceMaterial = new THREE.MeshBasicMaterial( { color: hexColor, fog: false, wireframe: true, opacity: 0.1, transparent: true } );

	this.lightSphere = new THREE.Mesh( bulbGeometry, bulbMaterial );
	this.lightRays = new THREE.Line( raysGeometry, raysMaterial, THREE.LinePieces );
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

	//

	this.lightSphere.properties.isGizmo = true;
	this.lightSphere.properties.gizmoSubject = light;
	this.lightSphere.properties.gizmoRoot = this;

	//

	this.properties.isGizmo = true;

}

THREE.PointLightHelper.prototype = Object.create( THREE.Object3D.prototype );

THREE.PointLightHelper.prototype.update = function () {

	// update sphere and rays colors to light color * light intensity

	var intensity = THREE.Math.clamp( this.light.intensity, 0, 1 );

	this.color.copy( this.light.color );
	this.color.multiplyScalar( intensity );

	this.lightSphere.material.color.copy( this.color );
	this.lightRays.material.color.copy( this.color );
	this.lightDistance.material.color.copy( this.color );

	//

	var d = this.light.distance;

	if ( d === 0.0 ) {

		this.lightDistance.visible = false;

	} else {

		this.lightDistance.visible = true;
		this.lightDistance.scale.set( d, d, d );

	}

}

