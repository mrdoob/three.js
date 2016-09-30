import { Mesh } from '../../objects/Mesh';
import { MeshBasicMaterial } from '../../materials/MeshBasicMaterial';
import { BoxGeometry } from '../../geometries/BoxGeometry';
import { Box3 } from '../../math/Box3';

/**
 * @author WestLangley / http://github.com/WestLangley
 */

// a helper to show the world-axis-aligned bounding box for an object

function BoundingBoxHelper( object, hex ) {

	var color = ( hex !== undefined ) ? hex : 0x888888;

	this.object = object;

	this.box = new Box3();

	Mesh.call( this, new BoxGeometry( 1, 1, 1 ), new MeshBasicMaterial( { color: color, wireframe: true } ) );

}

BoundingBoxHelper.prototype = Object.create( Mesh.prototype );
BoundingBoxHelper.prototype.constructor = BoundingBoxHelper;

BoundingBoxHelper.prototype.update = function () {

	this.box.setFromObject( this.object );

	this.box.getSize( this.scale );

	this.box.getCenter( this.position );

};


export { BoundingBoxHelper };
