import { Sphere } from '../math/Sphere.js';
import { Ray } from '../math/Ray.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Object3D } from '../core/Object3D.js';
import { Vector3 } from '../math/Vector3.js';
import { PointsMaterial } from '../materials/PointsMaterial.js';
import { BufferGeometry } from '../core/BufferGeometry.js';

/**
 * @author alteredq / http://alteredqualia.com/
 */

function Points( geometry, material ) {

	Object3D.call( this );

	this.type = 'Points';

	this.geometry = geometry !== undefined ? geometry : new BufferGeometry();
	this.material = material !== undefined ? material : new PointsMaterial( { color: Math.random() * 0xffffff } );

	this.updateMorphTargets();

}

Points.prototype = Object.assign( Object.create( Object3D.prototype ), {

	constructor: Points,

	isPoints: true,

	raycast: ( function () {

		var inverseMatrix = new Matrix4();
		var ray = new Ray();
		var sphere = new Sphere();

		return function raycast( raycaster, intersects ) {

			var object = this;
			var geometry = this.geometry;
			var matrixWorld = this.matrixWorld;
			var threshold = raycaster.params.Points.threshold;

			// Checking boundingSphere distance to ray

			if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

			sphere.copy( geometry.boundingSphere );
			sphere.applyMatrix4( matrixWorld );
			sphere.radius += threshold;

			if ( raycaster.ray.intersectsSphere( sphere ) === false ) return;

			//

			inverseMatrix.getInverse( matrixWorld );
			ray.copy( raycaster.ray ).applyMatrix4( inverseMatrix );

			var localThreshold = threshold / ( ( this.scale.x + this.scale.y + this.scale.z ) / 3 );
			var localThresholdSq = localThreshold * localThreshold;
			var position = new Vector3();
			var intersectPoint = new Vector3();

			function testPoint( point, index ) {

				var rayPointDistanceSq = ray.distanceSqToPoint( point );

				if ( rayPointDistanceSq < localThresholdSq ) {

					ray.closestPointToPoint( point, intersectPoint );
					intersectPoint.applyMatrix4( matrixWorld );

					var distance = raycaster.ray.origin.distanceTo( intersectPoint );

					if ( distance < raycaster.near || distance > raycaster.far ) return;

					intersects.push( {

						distance: distance,
						distanceToRay: Math.sqrt( rayPointDistanceSq ),
						point: intersectPoint.clone(),
						index: index,
						face: null,
						object: object

					} );

				}

			}

			if ( geometry.isBufferGeometry ) {

				var index = geometry.index;
				var attributes = geometry.attributes;
				var positions = attributes.position.array;

				if ( index !== null ) {

					var indices = index.array;

					for ( var i = 0, il = indices.length; i < il; i ++ ) {

						var a = indices[ i ];

						position.fromArray( positions, a * 3 );

						testPoint( position, a );

					}

				} else {

					for ( var i = 0, l = positions.length / 3; i < l; i ++ ) {

						position.fromArray( positions, i * 3 );

						testPoint( position, i );

					}

				}

			} else {

				var vertices = geometry.vertices;

				for ( var i = 0, l = vertices.length; i < l; i ++ ) {

					testPoint( vertices[ i ], i );

				}

			}

		};

	}() ),

	updateMorphTargets: function () {

		var geometry = this.geometry;
		var m, ml, name;

		var morphAttributes = geometry.morphAttributes;
		var keys = Object.keys( morphAttributes );

		if ( keys.length > 0 ) {

			var morphAttribute = morphAttributes[ keys[ 0 ] ];

			if ( morphAttribute !== undefined ) {

				this.morphTargetInfluences = [];
				this.morphTargetDictionary = {};

				for ( m = 0, ml = morphAttribute.length; m < ml; m ++ ) {

					name = morphAttribute[ m ].name || String( m );

					this.morphTargetInfluences.push( 0 );
					this.morphTargetDictionary[ name ] = m;

				}

			}

		}

	},

	clone: function () {

		return new this.constructor( this.geometry, this.material ).copy( this );

	}

} );

export { Points };
