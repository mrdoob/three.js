/**
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 */

THREE.DirectionalLightHelper = function ( light, sphereSize ) {

	THREE.Object3D.call( this );

	this.light = light;

	//

	var geometry = new THREE.SphereGeometry( sphereSize, 4, 2 );
	var material = new THREE.MeshBasicMaterial( { fog: false, wireframe: true } );
	material.color.copy( light.color ).multiplyScalar( light.intensity );

	this.lightSphere = new THREE.Mesh( geometry, material );
	this.lightSphere.position.copy( this.light.position );
	this.add( this.lightSphere );

	var lineGeometry = new THREE.Geometry();
	lineGeometry.vertices.push( this.light.position );
	lineGeometry.vertices.push( this.light.target.position );
	lineGeometry.computeLineDistances();

	var lineMaterial = new THREE.LineDashedMaterial( { dashSize: 4, gapSize: 4, opacity: 0.75, transparent: true, fog: false } );
	lineMaterial.color.copy( material.color );

	this.targetLine = new THREE.Line( lineGeometry, lineMaterial );
	this.add( this.targetLine );

	/*
	// light target helper

	this.targetSphere = null;

	if ( light.target.userData.targetInverse !== undefined ) {

		this.targetSphere = new THREE.Mesh( geometry, material );
		this.targetSphere.position = light.target.position;

	}
	*/

}

THREE.DirectionalLightHelper.prototype = Object.create( THREE.Object3D.prototype );

THREE.DirectionalLightHelper.prototype.update = function () {

	this.lightSphere.position.copy( this.light.position );
	this.lightSphere.material.color.copy( this.light.color ).multiplyScalar( this.light.intensity );

	this.targetLine.geometry.computeLineDistances();
	this.targetLine.geometry.verticesNeedUpdate = true;
	this.targetLine.material.color.copy( this.lightSphere.material.color );

	/*
	// Only update targetSphere and targetLine if available

	if ( this.targetSphere !== null ) {

		this.targetSphere.material.color.copy( this.color );

	}
	*/

}

