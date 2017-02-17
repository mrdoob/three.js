import { Vector3 } from '../math/Vector3';
import { Object3D } from '../core/Object3D';
import { SpriteMaterial } from '../materials/SpriteMaterial';

/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 */

function Sprite( material ) {

	Object3D.call( this );

	this.type = 'Sprite';

	this.material = ( material !== undefined ) ? material : new SpriteMaterial();

}

Sprite.prototype = Object.assign( Object.create( Object3D.prototype ), {

	constructor: Sprite,

	isSprite: true,

	raycast: ( function () {

		var intersectPoint = new Vector3();
		var worldPosition = new Vector3();
		var worldScale = new Vector3();

		return function raycast( raycaster, intersects ) {

			worldPosition.setFromMatrixPosition( this.matrixWorld );
			raycaster.ray.closestPointToPoint( worldPosition, intersectPoint );

			worldScale.setFromMatrixScale( this.matrixWorld );
			var guessSizeSq = worldScale.x * worldScale.y / 4;

			if ( worldPosition.distanceToSquared( intersectPoint ) > guessSizeSq ) return;

			var distance = raycaster.ray.origin.distanceTo( intersectPoint );

			if ( distance < raycaster.near || distance > raycaster.far ) return;

			intersects.push( {

				distance: distance,
				point: intersectPoint.clone(),
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
