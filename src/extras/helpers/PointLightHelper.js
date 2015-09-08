/**
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 */

module.exports = PointLightHelper;

var SphereGeometry = require( "../geometries/SphereGeometry" ),
	/*IcosahedronGeometry = require( "../geometries/IcosahedronGeometry" ),*/
	MeshBasicMaterial = require( "../../materials/MeshBasicMaterial" ),
	Mesh = require( "../../objects/Mesh" );

function PointLightHelper( light, sphereSize ) {

	this.light = light;
	this.light.updateMatrixWorld();

	var geometry = new SphereGeometry( sphereSize, 4, 2 );
	var material = new MeshBasicMaterial( { wireframe: true, fog: false } );
	material.color.copy( this.light.color ).multiplyScalar( this.light.intensity );

	Mesh.call( this, geometry, material );

	this.matrix = this.light.matrixWorld;
	this.matrixAutoUpdate = false;

	/*
	var distanceGeometry = new IcosahedronGeometry( 1, 2 );
	var distanceMaterial = new MeshBasicMaterial( { color: hexColor, fog: false, wireframe: true, opacity: 0.1, transparent: true } );

	this.lightSphere = new Mesh( bulbGeometry, bulbMaterial );
	this.lightDistance = new Mesh( distanceGeometry, distanceMaterial );

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

	this.material.color.copy( this.light.color ).multiplyScalar( this.light.intensity );

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
