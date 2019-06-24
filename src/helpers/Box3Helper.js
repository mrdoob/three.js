/**
 * @author WestLangley / http://github.com/WestLangley
 */

import { LineSegments } from '../objects/LineSegments.js';
import { LineBasicMaterial } from '../materials/LineBasicMaterial.js';
import { BufferAttribute } from '../core/BufferAttribute.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';
import { BufferGeometry } from '../core/BufferGeometry.js';
import { Object3D } from '../core/Object3D.js';

function Box3Helper( box, color ) {

	this.type = 'Box3Helper';

	this.box = box;

	color = color || 0xffff00;

	var indices = new Uint16Array( [ 0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7 ] );

	var positions = [ 1, 1, 1, - 1, 1, 1, - 1, - 1, 1, 1, - 1, 1, 1, 1, - 1, - 1, 1, - 1, - 1, - 1, - 1, 1, - 1, - 1 ];

	var geometry = new BufferGeometry();

	geometry.setIndex( new BufferAttribute( indices, 1 ) );

	geometry.addAttribute( 'position', new Float32BufferAttribute( positions, 3 ) );

	LineSegments.call( this, geometry, new LineBasicMaterial( { color: color } ) );

	this.geometry.computeBoundingSphere();

}

Box3Helper.prototype = Object.create( LineSegments.prototype );
Box3Helper.prototype.constructor = Box3Helper;

Box3Helper.prototype.updateMatrixWorld = function ( force ) {

	var box = this.box;

	if ( box.isEmpty() ) return;

	box.getCenter( this.position );

	box.getSize( this.scale );

	this.scale.multiplyScalar( 0.5 );

	Object3D.prototype.updateMatrixWorld.call( this, force );

};

export { Box3Helper };
