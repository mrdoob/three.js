import { Vector3 } from '../math/Vector3';
import { Quaternion } from '../math/Quaternion';
import { Matrix4 } from '../math/Matrix4';
import { Mesh } from '../objects/Mesh';
import { Group } from '../objects/Group';
import { PropertyBinding } from '../animation/PropertyBinding';

/**
 * @author alteredq / http://alteredqualia.com/
 * @author Mugen87 / https://github.com/Mugen87
 */

var SceneUtils = {

	createMultiMaterialObject: function ( geometry, materials ) {

		var group = new Group();

		for ( var i = 0, l = materials.length; i < l; i ++ ) {

			group.add( new Mesh( geometry, materials[ i ] ) );

		}

		return group;

	},

	detach: function ( child, parent, scene ) {

		child.applyMatrix( parent.matrixWorld );
		parent.remove( child );
		scene.add( child );

	},

	attach: function ( child, scene, parent ) {

		child.applyMatrix( new Matrix4().getInverse( parent.matrixWorld ) );

		scene.remove( child );
		parent.add( child );

	},

	convertFromZUp: function ( root, animations ) {

		// see https://gamedev.stackexchange.com/a/7932

		// this matrix will change the coordinate system of an object hierarchy and
		// animations (optional) from right-handed Z-up to right-handed Y-up

		var matrix = new Matrix4().set(
			1,   0,   0,   0,
			0,   0,   1,   0,
			0, - 1,   0,   0,
			0,   0,   0,   1
		);

		var converter = new BasisConverter( matrix );
		converter.convert( root, animations );

	}

};

function BasisConverter( matrix ) {

	// change-of-basis matrix

	this.matrix = matrix;

	// because the change-of-basis matrix is orthonormal, the inverse of
	// this.matrix is its transposition

	this.matrixInverse = this.matrix.clone().transpose();

}

Object.assign( BasisConverter.prototype, {

	convert: function ( root, animations ) {

		var scope = this;

		root.traverse( function( object ) {

			// ensure matrix is up to date

			object.updateMatrix();

			// convert position, quaternion, scale

			scope.convertMatrix4( object.matrix );
			object.matrix.decompose( object.position, object.quaternion, object.scale );

			// geometry

			var geometry = object.geometry;

			if ( geometry !== undefined &&  geometry.isBufferGeometry === true ) {

				var position = geometry.attributes.position;
				var normal = geometry.attributes.normal;

				if ( position !== null ) scope.matrix.applyToBufferAttribute( position );

				// the change-of-basis matrix contains no non-uniform scaling

				if ( normal !== null ) scope.matrix.applyToBufferAttribute( normal );

			}

			// skinned mesh

			if ( object.isSkinnedMesh ) {

				scope.convertMatrix4( object.bindMatrix );
				scope.convertMatrix4( object.bindMatrixInverse );

				var boneInverses = object.skeleton.boneInverses;

				for ( var i = 0, il = boneInverses.length; i < il; i ++ ) {

					scope.convertMatrix4( boneInverses[ i ] );

				}

				// bones are already converted within the scene hierarchy

			}

		} );

		// animations

		if ( animations !== undefined ) {

			for ( var i = 0, il = animations.length; i < il; i ++ ) {

				var clip = animations[ i ];
				var tracks = clip.tracks;

				for ( var j = 0, jl = tracks.length; j < jl; j ++ ) {

					this.convertKeyframeTrack( tracks[ j ] );

				}

			}

		}

	},

	convertMatrix4: function( matrix ) {

		return matrix.premultiply( this.matrix ).multiply( this.matrixInverse );

	},

	convertKeyframeTrack: function() {

		var vector = new Vector3();
		var quaternion = new Quaternion();
		var rotationMatrix = new Matrix4();

		return function convertKeyframeTrack( track ) {

			var result = PropertyBinding.parseTrackName( track.name );
			var propertyName = result.propertyName;

			var values = track.values;
			var times = track.times;
			var stride = values.length / times.length;

			var i, il, j, jl;

			switch ( propertyName ) {

				case 'position':

					for ( i = 0, il = values.length; i < il; i += stride ) {

						vector.fromArray( values, i ).applyMatrix4( this.matrix );

						for ( j = 0, jl = stride; j < jl; j ++ ) {

							values[ i + j ] = vector.getComponent( j );

						}

					}

					break;

				case 'scale':

					for ( i = 0, il = values.length; i < il; i += stride ) {

						vector.fromArray( values, i ).applyMatrix4( this.matrix );

						for ( j = 0, jl = stride; j < jl; j ++ ) {

							values[ i + j ] =  Math.abs( vector.getComponent( j ) );

						}

					}

					break;

				case 'quaternion':

					for ( i = 0, il = values.length; i < il; i += stride ) {

						quaternion.fromArray( values, i );
						rotationMatrix.makeRotationFromQuaternion( quaternion );
						this.convertMatrix4( rotationMatrix );
						quaternion.setFromRotationMatrix( rotationMatrix );

						values[ i + 0 ] = quaternion.x;
						values[ i + 1 ] = quaternion.y;
						values[ i + 2 ] = quaternion.z;
						values[ i + 3 ] = quaternion.w;

					}

					break;

			}

		};

	} (),

} );


export { SceneUtils };
