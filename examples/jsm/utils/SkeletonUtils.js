import {
	AnimationClip,
	AnimationMixer,
	Matrix4,
	Quaternion,
	QuaternionKeyframeTrack,
	SkeletonHelper,
	Vector3,
	VectorKeyframeTrack
} from 'three';

/** @module SkeletonUtils */

function getBoneName( bone, options ) {

	if ( options.getBoneName !== undefined ) {

		return options.getBoneName( bone );

	}

	return options.names[ bone.name ];

}

/**
 * Retargets the skeleton from the given source 3D object to the
 * target 3D object.
 *
 * @param {Object3D} target - The target 3D object.
 * @param {Object3D} source - The source 3D object.
 * @param {module:SkeletonUtils~RetargetOptions} options - The options.
 */
function retarget( target, source, options = {} ) {

	const quat = new Quaternion(),
		scale = new Vector3(),
		relativeMatrix = new Matrix4(),
		globalMatrix = new Matrix4();

	options.preserveBoneMatrix = options.preserveBoneMatrix !== undefined ? options.preserveBoneMatrix : true;
	options.preserveBonePositions = options.preserveBonePositions !== undefined ? options.preserveBonePositions : true;
	options.useTargetMatrix = options.useTargetMatrix !== undefined ? options.useTargetMatrix : false;
	options.hip = options.hip !== undefined ? options.hip : 'hip';
	options.hipInfluence = options.hipInfluence !== undefined ? options.hipInfluence : new Vector3( 1, 1, 1 );
	options.scale = options.scale !== undefined ? options.scale : 1;
	options.names = options.names || {};

	const sourceBones = source.isObject3D ? source.skeleton.bones : getBones( source ),
		bones = target.isObject3D ? target.skeleton.bones : getBones( target );

	let bone, name, boneTo,
		bonesPosition;

	// reset bones

	if ( target.isObject3D ) {

		target.skeleton.pose();

	} else {

		options.useTargetMatrix = true;
		options.preserveBoneMatrix = false;

	}

	if ( options.preserveBonePositions ) {

		bonesPosition = [];

		for ( let i = 0; i < bones.length; i ++ ) {

			bonesPosition.push( bones[ i ].position.clone() );

		}

	}

	if ( options.preserveBoneMatrix ) {

		// reset matrix

		target.updateMatrixWorld();

		target.matrixWorld.identity();

		// reset children matrix

		for ( let i = 0; i < target.children.length; ++ i ) {

			target.children[ i ].updateMatrixWorld( true );

		}

	}

	for ( let i = 0; i < bones.length; ++ i ) {

		bone = bones[ i ];
		name = getBoneName( bone, options );

		boneTo = getBoneByName( name, sourceBones );

		globalMatrix.copy( bone.matrixWorld );

		if ( boneTo ) {

			boneTo.updateMatrixWorld();

			if ( options.useTargetMatrix ) {

				relativeMatrix.copy( boneTo.matrixWorld );

			} else {

				relativeMatrix.copy( target.matrixWorld ).invert();
				relativeMatrix.multiply( boneTo.matrixWorld );

			}

			// ignore scale to extract rotation

			scale.setFromMatrixScale( relativeMatrix );
			relativeMatrix.scale( scale.set( 1 / scale.x, 1 / scale.y, 1 / scale.z ) );

			// apply to global matrix

			globalMatrix.makeRotationFromQuaternion( quat.setFromRotationMatrix( relativeMatrix ) );

			if ( target.isObject3D ) {

				if ( options.localOffsets ) {

					if ( options.localOffsets[ bone.name ] ) {

						globalMatrix.multiply( options.localOffsets[ bone.name ] );

					}

				}

			}

			globalMatrix.copyPosition( relativeMatrix );

		}

		if ( name === options.hip ) {

			globalMatrix.elements[ 12 ] *= options.scale * options.hipInfluence.x;
			globalMatrix.elements[ 13 ] *= options.scale * options.hipInfluence.y;
			globalMatrix.elements[ 14 ] *= options.scale * options.hipInfluence.z;

			if ( options.hipPosition !== undefined ) {

				globalMatrix.elements[ 12 ] += options.hipPosition.x * options.scale;
				globalMatrix.elements[ 13 ] += options.hipPosition.y * options.scale;
				globalMatrix.elements[ 14 ] += options.hipPosition.z * options.scale;

			}

		}

		if ( bone.parent ) {

			bone.matrix.copy( bone.parent.matrixWorld ).invert();
			bone.matrix.multiply( globalMatrix );

		} else {

			bone.matrix.copy( globalMatrix );

		}

		bone.matrix.decompose( bone.position, bone.quaternion, bone.scale );

		bone.updateMatrixWorld();

	}

	if ( options.preserveBonePositions ) {

		for ( let i = 0; i < bones.length; ++ i ) {

			bone = bones[ i ];
			name = getBoneName( bone, options ) || bone.name;

			if ( name !== options.hip ) {

				bone.position.copy( bonesPosition[ i ] );

			}

		}

	}

	if ( options.preserveBoneMatrix ) {

		// restore matrix

		target.updateMatrixWorld( true );

	}

}

/**
 * Retargets the animation clip of the source object to the
 * target 3D object.
 *
 * @param {Object3D} target - The target 3D object.
 * @param {Object3D} source - The source 3D object.
 * @param {AnimationClip} clip - The animation clip.
 * @param {module:SkeletonUtils~RetargetOptions} options - The options.
 * @return {AnimationClip} The retargeted animation clip.
 */
function retargetClip( target, source, clip, options = {} ) {

	options.useFirstFramePosition = options.useFirstFramePosition !== undefined ? options.useFirstFramePosition : false;

	// Calculate the fps from the source clip based on the track with the most frames, unless fps is already provided.
	options.fps = options.fps !== undefined ? options.fps : ( Math.max( ...clip.tracks.map( track => track.times.length ) ) / clip.duration );
	options.names = options.names || [];

	if ( ! source.isObject3D ) {

		source = getHelperFromSkeleton( source );

	}

	const numFrames = Math.round( clip.duration * ( options.fps / 1000 ) * 1000 ),
		delta = clip.duration / ( numFrames - 1 ),
		convertedTracks = [],
		mixer = new AnimationMixer( source ),
		bones = getBones( target.skeleton ),
		boneDatas = [];

	let positionOffset,
		bone, boneTo, boneData,
		name;

	mixer.clipAction( clip ).play();

	// trim

	let start = 0, end = numFrames;

	if ( options.trim !== undefined ) {

		start = Math.round( options.trim[ 0 ] * options.fps );
		end = Math.min( Math.round( options.trim[ 1 ] * options.fps ), numFrames ) - start;

		mixer.update( options.trim[ 0 ] );

	} else {

		mixer.update( 0 );

	}

	source.updateMatrixWorld();

	//

	for ( let frame = 0; frame < end; ++ frame ) {

		const time = frame * delta;

		retarget( target, source, options );

		for ( let j = 0; j < bones.length; ++ j ) {

			bone = bones[ j ];
			name = getBoneName( bone, options ) || bone.name;
			boneTo = getBoneByName( name, source.skeleton );

			if ( boneTo ) {

				boneData = boneDatas[ j ] = boneDatas[ j ] || { bone: bone };

				if ( options.hip === name ) {

					if ( ! boneData.pos ) {

						boneData.pos = {
							times: new Float32Array( end ),
							values: new Float32Array( end * 3 )
						};

					}

					if ( options.useFirstFramePosition ) {

						if ( frame === 0 ) {

							positionOffset = bone.position.clone();

						}

						bone.position.sub( positionOffset );

					}

					boneData.pos.times[ frame ] = time;

					bone.position.toArray( boneData.pos.values, frame * 3 );

				}

				if ( ! boneData.quat ) {

					boneData.quat = {
						times: new Float32Array( end ),
						values: new Float32Array( end * 4 )
					};

				}

				boneData.quat.times[ frame ] = time;

				bone.quaternion.toArray( boneData.quat.values, frame * 4 );

			}

		}

		if ( frame === end - 2 ) {

			// last mixer update before final loop iteration
			// make sure we do not go over or equal to clip duration
			mixer.update( delta - 0.0000001 );

		} else {

			mixer.update( delta );

		}

		source.updateMatrixWorld();

	}

	for ( let i = 0; i < boneDatas.length; ++ i ) {

		boneData = boneDatas[ i ];

		if ( boneData ) {

			if ( boneData.pos ) {

				convertedTracks.push( new VectorKeyframeTrack(
					'.bones[' + boneData.bone.name + '].position',
					boneData.pos.times,
					boneData.pos.values
				) );

			}

			convertedTracks.push( new QuaternionKeyframeTrack(
				'.bones[' + boneData.bone.name + '].quaternion',
				boneData.quat.times,
				boneData.quat.values
			) );

		}

	}

	mixer.uncacheAction( clip );

	return new AnimationClip( clip.name, - 1, convertedTracks );

}

/**
 * Clones the given 3D object and its descendants, ensuring that any `SkinnedMesh` instances are
 * correctly associated with their bones. Bones are also cloned, and must be descendants of the
 * object passed to this method. Other data, like geometries and materials, are reused by reference.
 *
 * @param {Object3D} source - The 3D object to clone.
 * @return {Object3D} The cloned 3D object.
 */
function clone( source ) {

	const sourceLookup = new Map();
	const cloneLookup = new Map();

	const clone = source.clone();

	parallelTraverse( source, clone, function ( sourceNode, clonedNode ) {

		sourceLookup.set( clonedNode, sourceNode );
		cloneLookup.set( sourceNode, clonedNode );

	} );

	clone.traverse( function ( node ) {

		if ( ! node.isSkinnedMesh ) return;

		const clonedMesh = node;
		const sourceMesh = sourceLookup.get( node );
		const sourceBones = sourceMesh.skeleton.bones;

		clonedMesh.skeleton = sourceMesh.skeleton.clone();
		clonedMesh.bindMatrix.copy( sourceMesh.bindMatrix );

		clonedMesh.skeleton.bones = sourceBones.map( function ( bone ) {

			return cloneLookup.get( bone );

		} );

		clonedMesh.bind( clonedMesh.skeleton, clonedMesh.bindMatrix );

	} );

	return clone;

}

// internal helper

function getBoneByName( name, skeleton ) {

	for ( let i = 0, bones = getBones( skeleton ); i < bones.length; i ++ ) {

		if ( name === bones[ i ].name )

			return bones[ i ];

	}

}

function getBones( skeleton ) {

	return Array.isArray( skeleton ) ? skeleton : skeleton.bones;

}


function getHelperFromSkeleton( skeleton ) {

	const source = new SkeletonHelper( skeleton.bones[ 0 ] );
	source.skeleton = skeleton;

	return source;

}

function parallelTraverse( a, b, callback ) {

	callback( a, b );

	for ( let i = 0; i < a.children.length; i ++ ) {

		parallelTraverse( a.children[ i ], b.children[ i ], callback );

	}

}

/**
 * Retarget options of `SkeletonUtils`.
 *
 * @typedef {Object} module:SkeletonUtils~RetargetOptions
 * @property {boolean} [useFirstFramePosition=false] - Whether to use the position of the first frame or not.
 * @property {number} [fps] - The FPS of the clip.
 * @property {Object<string,string>} [names] - A dictionary for mapping target to source bone names.
 * @property {function(string):string} [getBoneName] - A function for mapping bone names. Alternative to `names`.
 * @property {Array<number>} [trim] - Whether to trim the clip or not. If set the array should hold two values for the start and end.
 * @property {boolean} [preserveBoneMatrix=true] - Whether to preserve bone matrices or not.
 * @property {boolean} [preserveBonePositions=true] - Whether to preserve bone positions or not.
 * @property {boolean} [useTargetMatrix=false] - Whether to use the target matrix or not.
 * @property {string} [hip='hip'] - The name of the source's hip bone.
 * @property {Vector3} [hipInfluence=(1,1,1)] - The hip influence.
 * @property {number} [scale=1] - The scale.
 **/

export {
	retarget,
	retargetClip,
	clone,
};
