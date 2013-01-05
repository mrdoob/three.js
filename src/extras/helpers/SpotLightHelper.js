/**
 * @author alteredq / http://alteredqualia.com/
 *
 *	- shows spot light color, intensity, position, orientation, light cone and target
 */

THREE.SpotLightHelper = function ( light, sphereSize ) {

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
	var raysGeometry = new THREE.AsteriskGeometry( sphereSize * 1.25, sphereSize * 2.25 );
	var coneGeometry = new THREE.CylinderGeometry( 0.0001, 1, 1, 8, 1, true );

	var coneMatrix = new THREE.Matrix4();
	coneMatrix.rotateX( -Math.PI/2 );
	coneMatrix.translate( new THREE.Vector3( 0, -0.5, 0 ) );
	coneGeometry.applyMatrix( coneMatrix );

	var bulbMaterial = new THREE.MeshBasicMaterial( { color: hexColor, fog: false } );
	var raysMaterial = new THREE.LineBasicMaterial( { color: hexColor, fog: false } );
	var coneMaterial = new THREE.MeshBasicMaterial( { color: hexColor, fog: false, wireframe: true, opacity: 0.3, transparent: true } );

	this.lightSphere = new THREE.Mesh( bulbGeometry, bulbMaterial );
	this.lightCone = new THREE.Mesh( coneGeometry, coneMaterial );

	var coneLength = light.distance ? light.distance : 10000;
	var coneWidth = coneLength * Math.tan( light.angle * 0.5 ) * 2;
	this.lightCone.scale.set( coneWidth, coneWidth, coneLength );

	this.lightRays = new THREE.Line( raysGeometry, raysMaterial, THREE.LinePieces );

	this.gyroscope = new THREE.Gyroscope();

	this.gyroscope.add( this.lightSphere );
	this.gyroscope.add( this.lightRays );

	this.add( this.gyroscope );
	this.add( this.lightCone );

	this.lookAt( light.target.position );

	this.lightSphere.properties.isGizmo = true;
	this.lightSphere.properties.gizmoSubject = light;
	this.lightSphere.properties.gizmoRoot = this;

	// light target helper

	this.targetSphere = null;

	if ( light.target.properties.targetInverse !== undefined ) {

		var targetGeo = new THREE.SphereGeometry( sphereSize, 8, 4 );
		var targetMaterial = new THREE.MeshBasicMaterial( { color: hexColor, wireframe: true, fog: false } );

		this.targetSphere = new THREE.Mesh( targetGeo, targetMaterial );
		this.targetSphere.position = light.target.position;

		this.targetSphere.properties.isGizmo = true;
		this.targetSphere.properties.gizmoSubject = light.target;
		this.targetSphere.properties.gizmoRoot = this.targetSphere;

		var lineMaterial = new THREE.LineDashedMaterial( { color: hexColor, dashSize: 4, gapSize: 4, opacity: 0.75, transparent: true, fog: false } );
		var lineGeometry = new THREE.Geometry();
		lineGeometry.vertices.push( this.position.clone() );
		lineGeometry.vertices.push( this.targetSphere.position.clone() );
		lineGeometry.computeLineDistances();

		this.targetLine = new THREE.Line( lineGeometry, lineMaterial );
		this.targetLine.properties.isGizmo = true;

	}

	//

	this.properties.isGizmo = true;

}

THREE.SpotLightHelper.prototype = Object.create( THREE.Object3D.prototype );

THREE.SpotLightHelper.prototype.update = function () {

	// update arrow orientation
	// pointing from light to target

	this.direction.subVectors( this.light.target.position, this.light.position );

	// update light cone orientation and size

	this.lookAt( this.light.target.position );

	var coneLength = this.light.distance ? this.light.distance : 10000;
	var coneWidth = coneLength * Math.tan( this.light.angle * 0.5 ) * 2;
	this.lightCone.scale.set( coneWidth, coneWidth, coneLength );

	// update arrow, spheres, rays and line colors to light color * light intensity

	var intensity = THREE.Math.clamp( this.light.intensity, 0, 1 );

	this.color.copy( this.light.color );
	this.color.multiplyScalar( intensity );

	this.lightSphere.material.color.copy( this.color );
	this.lightRays.material.color.copy( this.color );
	this.lightCone.material.color.copy( this.color );

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

};
