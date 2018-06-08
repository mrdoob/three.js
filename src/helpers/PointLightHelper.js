/**
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 */

import { Mesh } from '../objects/Mesh.js';
import { MeshBasicMaterial } from '../materials/MeshBasicMaterial.js';
import { SphereBufferGeometry } from '../geometries/SphereGeometry.js';

function PointLightHelper( light, sphereSize, color ) {

	this.light = light;
	this.light.updateMatrixWorld();

	this.color = color;

	var geometry = new SphereBufferGeometry( sphereSize, 4, 2 );
	var material = new MeshBasicMaterial( { wireframe: true, fog: false } );

	Mesh.call( this, geometry, material );

	this.matrix = this.light.matrixWorld;
	this.matrixAutoUpdate = false;

	this.update();


	/*
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

	this.add( this.lightDistance );
	*/

}

PointLightHelper.prototype = Object.create( Mesh.prototype );
PointLightHelper.prototype.constructor = PointLightHelper;

PointLightHelper.prototype.dispose = function () {

	this.geometry.dispose();
	this.material.dispose();

};

PointLightHelper.prototype.update = function () {

	if ( this.color !== undefined ) {

		this.material.color.set( this.color );

	} else {

		this.material.color.copy( this.light.color );

	}

	/*
	var d = this.light.distance;

	if ( d === 0.0 ) {

		this.lightDistance.visible = false;

	} else {

		this.lightDistance.visible = true;
		this.lightDistance.scale.set( d, d, d );

	}
	*/

};


export { PointLightHelper };
