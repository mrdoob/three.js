/**
 * @author alteredq / http://alteredqualia.com/
 *
 *	- shows hemisphere light intensity, sky and ground colors and directions
 */

THREE.HemisphereLightHelper = function ( light, sphereSize, arrowLength, domeSize ) {

	THREE.Object3D.call( this );

	this.light = light;

	// position

	this.position = light.position;

	//

	var intensity = THREE.Math.clamp( light.intensity, 0, 1 );

	// sky color

	this.color = light.color.clone();
	this.color.multiplyScalar( intensity );

	var hexColor = this.color.getHex();

	// ground color

	this.groundColor = light.groundColor.clone();
	this.groundColor.multiplyScalar( intensity );

	var hexColorGround = this.groundColor.getHex();

	// double colored light bulb

	var bulbGeometry = new THREE.SphereGeometry( sphereSize, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5 );
	var bulbGroundGeometry = new THREE.SphereGeometry( sphereSize, 16, 8, 0, Math.PI * 2, Math.PI * 0.5, Math.PI );

	var bulbSkyMaterial = new THREE.MeshBasicMaterial( { color: hexColor, fog: false } );
	var bulbGroundMaterial = new THREE.MeshBasicMaterial( { color: hexColorGround, fog: false } );

	for ( var i = 0, il = bulbGeometry.faces.length; i < il; i ++ ) {

		bulbGeometry.faces[ i ].materialIndex = 0;

	}

	for ( var i = 0, il = bulbGroundGeometry.faces.length; i < il; i ++ ) {

		bulbGroundGeometry.faces[ i ].materialIndex = 1;

	}

	THREE.GeometryUtils.merge( bulbGeometry, bulbGroundGeometry );

	this.lightSphere = new THREE.Mesh( bulbGeometry, new THREE.MeshFaceMaterial( [ bulbSkyMaterial, bulbGroundMaterial ] ) );

	// arrows for sky and ground light directions

	this.lightArrow = new THREE.ArrowHelper( new THREE.Vector3( 0, 1, 0 ), new THREE.Vector3( 0, ( sphereSize + arrowLength ) * 1.1, 0 ), arrowLength, hexColor );
	this.lightArrow.rotation.x = Math.PI;

	this.lightArrowGround = new THREE.ArrowHelper( new THREE.Vector3( 0, 1, 0 ), new THREE.Vector3( 0, ( sphereSize + arrowLength ) * -1.1, 0 ), arrowLength, hexColorGround );

	var joint = new THREE.Object3D();
	joint.rotation.x = -Math.PI * 0.5;

	joint.add( this.lightSphere );
	joint.add( this.lightArrow );
	joint.add( this.lightArrowGround );

	this.add( joint );

	//

	this.lightSphere.properties.isGizmo = true;
	this.lightSphere.properties.gizmoSubject = light;
	this.lightSphere.properties.gizmoRoot = this;

	//

	this.properties.isGizmo = true;

	//

	this.target = new THREE.Vector3();
	this.lookAt( this.target );

}

THREE.HemisphereLightHelper.prototype = Object.create( THREE.Object3D.prototype );

THREE.HemisphereLightHelper.prototype.update = function () {

	// update sphere sky and ground colors to light color * light intensity

	var intensity = THREE.Math.clamp( this.light.intensity, 0, 1 );

	this.color.copy( this.light.color );
	this.color.multiplyScalar( intensity );

	this.groundColor.copy( this.light.groundColor );
	this.groundColor.multiplyScalar( intensity );

	this.lightSphere.material.materials[ 0 ].color.copy( this.color );
	this.lightSphere.material.materials[ 1 ].color.copy( this.groundColor );

	this.lightArrow.setColor( this.color.getHex() );
	this.lightArrowGround.setColor( this.groundColor.getHex() );

	this.lookAt( this.target );

}

