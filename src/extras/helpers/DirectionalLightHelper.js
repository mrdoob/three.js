/**
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 */

THREE.DirectionalLightHelper = function ( light, sphereSize ) {

	THREE.Object3D.call( this );

	this.matrixAutoUpdate = false;

	this.light = light;

	var geometry = new THREE.SphereGeometry( sphereSize, 4, 2 );
	var material = new THREE.MeshBasicMaterial( { fog: false, wireframe: true } );
	material.color.copy( this.light.color ).multiplyScalar( this.light.intensity );

	this.lightSphere = new THREE.Mesh( geometry, material );
	this.lightSphere.matrixWorld = this.light.matrixWorld;
	this.lightSphere.matrixAutoUpdate = false;
	this.add( this.lightSphere );

	/*
	this.targetSphere = new THREE.Mesh( geometry, material );
	this.targetSphere.position = this.light.target.position;
	this.add( this.targetSphere );
	*/

	geometry = new THREE.Geometry();
	geometry.vertices.push( this.light.position );
	geometry.vertices.push( this.light.target.position );
	geometry.computeLineDistances();

	material = new THREE.LineDashedMaterial( { dashSize: 4, gapSize: 4, opacity: 0.75, transparent: true, fog: false } );
	material.color.copy( this.light.color ).multiplyScalar( this.light.intensity );

	this.targetLine = new THREE.Line( geometry, material );
	this.add( this.targetLine );

}

THREE.DirectionalLightHelper.prototype = Object.create( THREE.Object3D.prototype );

THREE.DirectionalLightHelper.prototype.update = function () {

	this.lightSphere.material.color.copy( this.light.color ).multiplyScalar( this.light.intensity );

	this.targetLine.geometry.computeLineDistances();
	this.targetLine.geometry.verticesNeedUpdate = true;
	this.targetLine.material.color.copy( this.light.color ).multiplyScalar( this.light.intensity );

};

