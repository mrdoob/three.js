import { Vector3 } from '../math/Vector3';
import { Object3D } from '../core/Object3D';
import { SpriteMaterial } from '../materials/SpriteMaterial';

/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 */

function Sprite ( material ) {
	this.isSprite = true;

	Object3D.call( this );

	this.type = 'Sprite';

	this.material = ( material !== undefined ) ? material : new SpriteMaterial();

};

Sprite.prototype = Object.assign( Object.create( Object3D.prototype ), {

	constructor: Sprite,

	raycast: ( function () {

		var matrixPosition = new Vector3();

		return function raycast( raycaster, intersects ) {

			matrixPosition.setFromMatrixPosition( this.matrixWorld );

			var distanceSq = raycaster.ray.distanceSqToPoint( matrixPosition );
			var guessSizeSq = this.scale.x * this.scale.y / 4;

			if ( distanceSq > guessSizeSq ) {

				return;

			}

			intersects.push( {

				distance: Math.sqrt( distanceSq ),
				point: this.position,
				face: null,
				object: this

			} );

		};

	}() ),

	clone: function () {

		return new this.constructor( this.material ).copy( this );

	}

} );


export { Sprite };