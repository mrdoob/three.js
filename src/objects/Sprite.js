import { Vector2 } from '../math/Vector2.js';
import { Vector3 } from '../math/Vector3.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Object3D } from '../core/Object3D.js';
import { SpriteMaterial } from '../materials/SpriteMaterial.js';

/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 */

function Sprite( material ) {

	Object3D.call( this );

	this.type = 'Sprite';

	this.material = ( material !== undefined ) ? material : new SpriteMaterial();

	this.center = new Vector2( 0.5, 0.5 );

}

Sprite.prototype = Object.assign( Object.create( Object3D.prototype ), {

	constructor: Sprite,

	isSprite: true,

	raycast: ( function () {

		var intersectPoint = new Vector3();
		var worldPosition = new Vector3();
		var worldScale = new Vector3();

		var alignedPosition = new Vector2();
		var rotatedPosition = new Vector2();
		var matrixWorldInverse = new Matrix4();

		return function raycast( raycaster, intersects ) {

			worldScale.setFromMatrixScale( this.matrixWorld );

			// compute position in camera space
			alignedPosition.set( ( 0.5 - this.center.x ) * worldScale.x, ( 0.5 - this.center.y ) * worldScale.y );

			var rotation = this.material.rotation;
			if ( rotation !== 0 ) {

				var cos = Math.cos( rotation ), sin = Math.sin( rotation );
				rotatedPosition.x = ( cos * alignedPosition.x ) - ( sin * alignedPosition.y );
				rotatedPosition.y = ( sin * alignedPosition.x ) + ( cos * alignedPosition.y );

			} else {

				rotatedPosition.copy( alignedPosition );

			}

			worldPosition.setFromMatrixPosition( this.modelViewMatrix );
			worldPosition.x += rotatedPosition.x;
			worldPosition.y += rotatedPosition.y;

			// transform to world space
			worldPosition.applyMatrix4( matrixWorldInverse.getInverse( this.modelViewMatrix ) ).applyMatrix4( this.matrixWorld );

			raycaster.ray.closestPointToPoint( worldPosition, intersectPoint );

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

	},

	copy: function ( source ) {

		Object3D.prototype.copy.call( this, source );

		if ( source.center !== undefined ) this.center.copy( source.center );

		return this;

	}


} );


export { Sprite };
