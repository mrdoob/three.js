/**
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 * @author WestLangley / http://github.com/WestLangley
 */

import { Object3D } from '../core/Object3D.js';
import { LineSegments } from '../objects/LineSegments.js';
import { LineBasicMaterial } from '../materials/LineBasicMaterial.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';
import { BufferGeometry } from '../core/BufferGeometry.js';

function SpotLightHelper( light, color ) {

	Object3D.call( this );

	this.light = light;
	this.light.updateMatrixWorld();

	this.matrixAutoUpdate = false;

	this.color = color;

	var geometry = new BufferGeometry();

	var positions = [
		0, 0, 1, 	0, 0, - 1,
		1, 0, 1, 	1, 0, - 1,
		- 1, 0, 1,	- 1, 0, - 1,
		0, 1, 1, 	0, 1, - 1,
		0, - 1, 1, 	0, - 1, - 1
	];

	for ( var i = 0, j = 1, l = 32; i < l; i ++, j ++ ) {

		var p1 = ( i / l ) * Math.PI * 2;
		var p2 = ( j / l ) * Math.PI * 2;

		positions.push(
			Math.cos( p1 ), Math.sin( p1 ), - 1,
			Math.cos( p2 ), Math.sin( p2 ), - 1,
			Math.cos( p1 ), Math.sin( p1 ), 1,
			Math.cos( p2 ), Math.sin( p2 ), 1
		);

	}

	geometry.addAttribute( 'position', new Float32BufferAttribute( positions, 3 ) );

	var material = new LineBasicMaterial( { fog: false } );

	this.cone = new LineSegments( geometry, material );
	this.add( this.cone );

	this.update();

}

SpotLightHelper.prototype = Object.create( Object3D.prototype );
SpotLightHelper.prototype.constructor = SpotLightHelper;

SpotLightHelper.prototype.dispose = function () {

	this.cone.geometry.dispose();
	this.cone.material.dispose();

};

SpotLightHelper.prototype.update = function () {

	this.matrix.copy( this.light.shadow.camera.matrixWorld );
	this.matrix.multiply( this.light.shadow.camera.projectionMatrixInverse );

	if ( this.color !== undefined ) {

		this.cone.material.color.set( this.color );

	} else {

		this.cone.material.color.copy( this.light.color );

	}

};


export { SpotLightHelper };
