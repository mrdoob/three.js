/**
 * @author alteredq / http://alteredqualia.com/
 *
 *	- shows directional light color, intensity, position, orientation and target
 */

THREE.DirectionalLightHelper = function ( light, sphereSize ) {

	THREE.Object3D.call( this );

	this.light = light;

	// position

	this.position = light.position;

	// direction

	this.direction = new THREE.Vector3();
	this.direction.subVectors( light.target.position, light.position );

	// color

	var intensity = THREE.Math.clamp( light.intensity, 0, 1 );

	this.color = light.color.clone();
	this.color.multiplyScalar( intensity );

	var hexColor = this.color.getHex();

	// light helper

	var bulbGeometry = new THREE.SphereGeometry( sphereSize, 16, 8 );
	var bulbMaterial = new THREE.MeshBasicMaterial( { color: hexColor, fog: false } );

	this.lightSphere = new THREE.Mesh( bulbGeometry, bulbMaterial );

	this.add( this.lightSphere );

	this.lightSphere.userData.isGizmo = true;
	this.lightSphere.userData.gizmoSubject = light;
	this.lightSphere.userData.gizmoRoot = this;

	// light target helper

	this.targetSphere = null;

	if ( light.target.userData.targetInverse !== undefined ) {

		var targetGeo = new THREE.SphereGeometry( sphereSize, 8, 4 );
		var targetMaterial = new THREE.MeshBasicMaterial( { color: hexColor, wireframe: true, fog: false } );

		this.targetSphere = new THREE.Mesh( targetGeo, targetMaterial );
		this.targetSphere.position = light.target.position;

		this.targetSphere.userData.isGizmo = true;
		this.targetSphere.userData.gizmoSubject = light.target;
		this.targetSphere.userData.gizmoRoot = this.targetSphere;

		var lineMaterial = new THREE.LineDashedMaterial( { color: hexColor, dashSize: 4, gapSize: 4, opacity: 0.75, transparent: true, fog: false } );
		var lineGeometry = new THREE.Geometry();
		lineGeometry.vertices.push( this.position.clone() );
		lineGeometry.vertices.push( this.targetSphere.position.clone() );
		lineGeometry.computeLineDistances();

		this.targetLine = new THREE.Line( lineGeometry, lineMaterial );
		this.targetLine.userData.isGizmo = true;

	}

	//

	this.userData.isGizmo = true;

}

THREE.DirectionalLightHelper.prototype = Object.create( THREE.Object3D.prototype );

THREE.DirectionalLightHelper.prototype.update = function () {

	// update arrow orientation
	// pointing from light to target

	this.direction.subVectors( this.light.target.position, this.light.position );

	// update arrow, spheres and line colors to light color * light intensity

	var intensity = THREE.Math.clamp( this.light.intensity, 0, 1 );

	this.color.copy( this.light.color );
	this.color.multiplyScalar( intensity );

	this.lightSphere.material.color.copy( this.color );

	// Only update targetSphere and targetLine if available
	if ( this.targetSphere !== null ) {

		this.targetSphere.material.color.copy( this.color );
		this.targetLine.material.color.copy( this.color );

		// update target line vertices

		this.targetLine.geometry.vertices[ 0 ].copy( this.light.position );
		this.targetLine.geometry.vertices[ 1 ].copy( this.light.target.position );

		this.targetLine.geometry.computeLineDistances();
		this.targetLine.geometry.verticesNeedUpdate = true;

	}

}

