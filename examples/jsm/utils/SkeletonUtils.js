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


function retarget( target, source, options = {} ) {

	const quat = new Quaternion(),
		scale = new Vector3(),
		relativeMatrix = new Matrix4(),
		globalMatrix = new Matrix4();

	options.preserveBoneMatrix = options.preserveBoneMatrix !== undefined ? options.preserveBoneMatrix : true;
	options.preserveBonePositions = options.preserveBonePositions !== undefined ? options.preserveBonePositions : true;
	options.preserveHipPosition = options.preserveHipPosition !== undefined ? options.preserveHipPosition : false;
	options.useTargetMatrix = options.useTargetMatrix !== undefined ? options.useTargetMatrix : false;
	options.hip = options.hip !== undefined ? options.hip : 'hip';
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
		name = options.names[ bone.name ];

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

			globalMatrix.elements[ 12 ] *= options.scale;
			globalMatrix.elements[ 13 ] *= options.scale;
			globalMatrix.elements[ 14 ] *= options.scale;

			if ( options.preserveHipPosition ) {

				globalMatrix.elements[ 12 ] = globalMatrix.elements[ 14 ] = 0;

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
			name = options.names[ bone.name ] || bone.name;

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
	mixer.update( 0 );

	source.updateMatrixWorld();

	for ( let i = 0; i < numFrames; ++ i ) {

		const time = i * delta;

		retarget( target, source, options );

		for ( let j = 0; j < bones.length; ++ j ) {

			name = options.names[ bones[ j ].name ] || bones[ j ].name;

			boneTo = getBoneByName( name, source.skeleton );

			if ( boneTo ) {

				bone = bones[ j ];
				boneData = boneDatas[ j ] = boneDatas[ j ] || { bone: bone };

				if ( options.hip === name ) {

					if ( ! boneData.pos ) {

						boneData.pos = {
							times: new Float32Array( numFrames ),
							values: new Float32Array( numFrames * 3 )
						};

					}

					if ( options.useFirstFramePosition ) {

						if ( i === 0 ) {

							positionOffset = bone.position.clone();

						}

						bone.position.sub( positionOffset );

					}

					boneData.pos.times[ i ] = time;

					bone.position.toArray( boneData.pos.values, i * 3 );

				}

				if ( ! boneData.quat ) {

					boneData.quat = {
						times: new Float32Array( numFrames ),
						values: new Float32Array( numFrames * 4 )
					};

				}

				boneData.quat.times[ i ] = time;

				bone.quaternion.toArray( boneData.quat.values, i * 4 );

			}

		}

		if ( i === numFrames - 2 ) {

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

export {
	retarget,
	retargetClip,
	clone,
};
