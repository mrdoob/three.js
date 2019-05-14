/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 */

import { Vector2 } from '../math/Vector2.js';
import { Vector3 } from '../math/Vector3.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Triangle } from '../math/Triangle.js';
import { Object3D } from '../core/Object3D.js';
import { BufferGeometry } from '../core/BufferGeometry.js';
import { InterleavedBuffer } from '../core/InterleavedBuffer.js';
import { InterleavedBufferAttribute } from '../core/InterleavedBufferAttribute.js';
import { SpriteMaterial } from '../materials/SpriteMaterial.js';

var geometry;

function Sprite( material ) {

	Object3D.call( this );

	this.type = 'Sprite';

	if ( geometry === undefined ) {

		geometry = new BufferGeometry();

		var float32Array = new Float32Array( [
			- 0.5, - 0.5, 0, 0, 0,
			0.5, - 0.5, 0, 1, 0,
			0.5, 0.5, 0, 1, 1,
			- 0.5, 0.5, 0, 0, 1
		] );

		var interleavedBuffer = new InterleavedBuffer( float32Array, 5 );

		geometry.setIndex( [ 0, 1, 2,	0, 2, 3 ] );
		geometry.addAttribute( 'position', new InterleavedBufferAttribute( interleavedBuffer, 3, 0, false ) );
		geometry.addAttribute( 'uv', new InterleavedBufferAttribute( interleavedBuffer, 2, 3, false ) );

	}

	this.geometry = geometry;
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

		var uvA = new Vector2();
		var uvB = new Vector2();
		var uvC = new Vector2();

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

			viewWorldMatrix.copy( raycaster._camera.matrixWorld );
			this.modelViewMatrix.multiplyMatrices( raycaster._camera.matrixWorldInverse, this.matrixWorld );

			mvPosition.setFromMatrixPosition( this.modelViewMatrix );

			if ( raycaster._camera.isPerspectiveCamera && this.material.sizeAttenuation === false ) {

				worldScale.multiplyScalar( - mvPosition.z );

			}

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

			uvA.set( 0, 0 );
			uvB.set( 1, 0 );
			uvC.set( 1, 1 );

			// check first triangle
			var intersect = raycaster.ray.intersectTriangle( vA, vB, vC, false, intersectPoint );

			if ( intersect === null ) {

				// check second triangle
				transformVertex( vB.set( - 0.5, 0.5, 0 ), mvPosition, center, worldScale, sin, cos );
				uvB.set( 0, 1 );

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
				uv: Triangle.getUV( intersectPoint, vA, vB, vC, uvA, uvB, uvC, new Vector2() ),
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
