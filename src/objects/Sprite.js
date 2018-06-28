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
		var worldScale = new Vector3();
		var mvPosition = new Vector3();

		var alignedPosition = new Vector2();
		var rotatedPosition = new Vector2();
		var viewWorldMatrix = new Matrix4();

		var vA = new Vector3();
		var vB = new Vector3();
		var vC = new Vector3();

		function transformVertex( vertexPosition, mvPosition, center, scale, sin, cos ) {

			// compute position in camera space
			alignedPosition.subVectors( vertexPosition, center ).addScalar( 0.5 ).multiply( scale );

			// to check if rotation is not zero
			if ( sin !== undefined ) {

				rotatedPosition.x = ( cos * alignedPosition.x ) - ( sin * alignedPosition.y );
				rotatedPosition.y = ( sin * alignedPosition.x ) + ( cos * alignedPosition.y );

			} else {

				rotatedPosition.copy( alignedPosition );

			}


			vertexPosition.copy( mvPosition );
			vertexPosition.x += rotatedPosition.x;
			vertexPosition.y += rotatedPosition.y;

			// transform to world space
			vertexPosition.applyMatrix4( viewWorldMatrix );

		}

		return function raycast( raycaster, intersects ) {

			worldScale.setFromMatrixScale( this.matrixWorld );
			viewWorldMatrix.getInverse( this.modelViewMatrix ).premultiply( this.matrixWorld );
			mvPosition.setFromMatrixPosition( this.modelViewMatrix );

			var rotation = this.material.rotation;
			var sin, cos;
			if ( rotation !== 0 ) {

				cos = Math.cos( rotation );
				sin = Math.sin( rotation );

			}

			var center = this.center;

			transformVertex( vA.set( - 0.5, - 0.5, 0 ), mvPosition, center, worldScale, sin, cos );
			transformVertex( vB.set( 0.5, - 0.5, 0 ), mvPosition, center, worldScale, sin, cos );
			transformVertex( vC.set( 0.5, 0.5, 0 ), mvPosition, center, worldScale, sin, cos );

			// check first triangle
			var intersect = raycaster.ray.intersectTriangle( vA, vB, vC, false, intersectPoint );

			if ( intersect === null ) {

				// check second triangle
				transformVertex( vB.set( - 0.5, 0.5, 0 ), mvPosition, center, worldScale, sin, cos );
				intersect = raycaster.ray.intersectTriangle( vA, vC, vB, false, intersectPoint );
				if ( intersect === null ) {

					return;

				}

			}

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
