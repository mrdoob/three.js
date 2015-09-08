/**
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 * @author WestLangley / http://github.com/WestLangley
 */

module.exports = DirectionalLightHelper;

var Geometry = require( "../../core/Geometry" ),
	Object3D = require( "../../core/Object3D" ),
	LineBasicMaterial = require( "../../materials/LineBasicMaterial" ),
	Vector3 = require( "../../math/Vector3" ),
	Line = require( "../../objects/Line" );

function DirectionalLightHelper( light, size ) {

	Object3D.call( this );

	this.light = light;
	this.light.updateMatrixWorld();

	this.matrix = light.matrixWorld;
	this.matrixAutoUpdate = false;

	size = size || 1;

	var geometry = new Geometry();
	geometry.vertices.push(
		new Vector3( - size,   size, 0 ),
		new Vector3(   size,   size, 0 ),
		new Vector3(   size, - size, 0 ),
		new Vector3( - size, - size, 0 ),
		new Vector3( - size,   size, 0 )
	);

	var material = new LineBasicMaterial( { fog: false } );
	material.color.copy( this.light.color ).multiplyScalar( this.light.intensity );

	this.lightPlane = new Line( geometry, material );
	this.add( this.lightPlane );

	geometry = new Geometry();
	geometry.vertices.push(
		new Vector3(),
		new Vector3()
	);

	material = new LineBasicMaterial( { fog: false } );
	material.color.copy( this.light.color ).multiplyScalar( this.light.intensity );

	this.targetLine = new Line( geometry, material );
	this.add( this.targetLine );

	this.update();

}

DirectionalLightHelper.prototype = Object.create( Object3D.prototype );
DirectionalLightHelper.prototype.constructor = DirectionalLightHelper;

DirectionalLightHelper.prototype.dispose = function () {

	this.lightPlane.geometry.dispose();
	this.lightPlane.material.dispose();
	this.targetLine.geometry.dispose();
	this.targetLine.material.dispose();

};

DirectionalLightHelper.prototype.update = ( function () {

	var v1, v2, v3;

	return function () {

		if ( v1 === undefined ) { v1 = new Vector3(); }
		if ( v2 === undefined ) { v2 = new Vector3(); }
		if ( v3 === undefined ) { v3 = new Vector3(); }

		v1.setFromMatrixPosition( this.light.matrixWorld );
		v2.setFromMatrixPosition( this.light.target.matrixWorld );
		v3.subVectors( v2, v1 );

		this.lightPlane.lookAt( v3 );
		this.lightPlane.material.color.copy( this.light.color ).multiplyScalar( this.light.intensity );

		this.targetLine.geometry.vertices[ 1 ].copy( v3 );
		this.targetLine.geometry.verticesNeedUpdate = true;
		this.targetLine.material.color.copy( this.lightPlane.material.color );

	};

}() );
