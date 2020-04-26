/**
 * @author WestLangley / http://github.com/WestLangley
 */

import { Line } from '../objects/Line.js';
import { Mesh } from '../objects/Mesh.js';
import { LineBasicMaterial } from '../materials/LineBasicMaterial.js';
import { MeshBasicMaterial } from '../materials/MeshBasicMaterial.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';
import { BufferGeometry } from '../core/BufferGeometry.js';
import { Object3D } from '../core/Object3D.js';
import { FrontSide, BackSide } from '../constants.js';

function PlaneHelper( plane, size, hex ) {

	this.type = 'PlaneHelper';

	this.plane = plane;

	this.size = ( size === undefined ) ? 1 : size;

	var color = ( hex !== undefined ) ? hex : 0xffff00;

	var positions = [ 1, - 1, 1, - 1, 1, 1, - 1, - 1, 1, 1, 1, 1, - 1, 1, 1, - 1, - 1, 1, 1, - 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0 ];

	var geometry = new BufferGeometry();
	geometry.setAttribute( 'position', new Float32BufferAttribute( positions, 3 ) );
	geometry.computeBoundingSphere();

	Line.call( this, geometry, new LineBasicMaterial( { color: color, toneMapped: false } ) );

	//

	var positions2 = [ 1, 1, 1, - 1, 1, 1, - 1, - 1, 1, 1, 1, 1, - 1, - 1, 1, 1, - 1, 1 ];

	var geometry2 = new BufferGeometry();
	geometry2.setAttribute( 'position', new Float32BufferAttribute( positions2, 3 ) );
	geometry2.computeBoundingSphere();

	this.add( new Mesh( geometry2, new MeshBasicMaterial( { color: color, opacity: 0.2, transparent: true, depthWrite: false, toneMapped: false } ) ) );

}

PlaneHelper.prototype = Object.create( Line.prototype );
PlaneHelper.prototype.constructor = PlaneHelper;

PlaneHelper.prototype.updateMatrixWorld = function ( force ) {

	var scale = - this.plane.constant;

	if ( Math.abs( scale ) < 1e-8 ) scale = 1e-8; // sign does not matter

	this.scale.set( 0.5 * this.size, 0.5 * this.size, scale );

	this.children[ 0 ].material.side = ( scale < 0 ) ? BackSide : FrontSide; // renderer flips side when determinant < 0; flipping not wanted here

	this.lookAt( this.plane.normal );

	Object3D.prototype.updateMatrixWorld.call( this, force );

};

export { PlaneHelper };
