/**
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 */

module.exports = HemisphereLightHelper;

var SphereGeometry = require( "../geometries/SphereGeometry" ),
	Constants = require( "../../Constants" ),
	Object3D = require( "../../core/Object3D" ),
	MeshBasicMaterial = require( "../../materials/MeshBasicMaterial" ),
	Color = require( "../../math/Color" ),
	Vector3 = require( "../../math/Vector3" ),
	Mesh = require( "../../objects/Mesh" );

function HemisphereLightHelper( light, sphereSize ) {

	Object3D.call( this );

	this.light = light;
	this.light.updateMatrixWorld();

	this.matrix = light.matrixWorld;
	this.matrixAutoUpdate = false;

	this.colors = [ new Color(), new Color() ];

	var geometry = new SphereGeometry( sphereSize, 4, 2 );
	geometry.rotateX( - Math.PI / 2 );

	for ( var i = 0, il = 8; i < il; i ++ ) {

		geometry.faces[ i ].color = this.colors[ i < 4 ? 0 : 1 ];

	}

	var material = new MeshBasicMaterial( { vertexColors: Constants.FaceColors, wireframe: true } );

	this.lightSphere = new Mesh( geometry, material );
	this.add( this.lightSphere );

	this.update();

}

HemisphereLightHelper.prototype = Object.create( Object3D.prototype );
HemisphereLightHelper.prototype.constructor = HemisphereLightHelper;

HemisphereLightHelper.prototype.dispose = function () {

	this.lightSphere.geometry.dispose();
	this.lightSphere.material.dispose();

};

HemisphereLightHelper.prototype.update = ( function () {

	var vector;

	return function () {

		if ( vector === undefined ) { vector = new Vector3(); }

		this.colors[ 0 ].copy( this.light.color ).multiplyScalar( this.light.intensity );
		this.colors[ 1 ].copy( this.light.groundColor ).multiplyScalar( this.light.intensity );

		this.lightSphere.lookAt( vector.setFromMatrixPosition( this.light.matrixWorld ).negate() );
		this.lightSphere.geometry.colorsNeedUpdate = true;

	};

}() );
