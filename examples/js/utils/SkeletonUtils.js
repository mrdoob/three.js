/**
 * @author sunag / http://www.sunag.com.br
 */

'use strict';

THREE.SkeletonUtils = {

	retarget: function () {

		var quat = new THREE.Quaternion(),
			scale = new THREE.Vector3(),
			bindBoneMatrix = new THREE.Matrix4(),
			relativeMatrix = new THREE.Matrix4(),
			globalMatrix = new THREE.Matrix4();

		return function ( target, source, options ) {

			options = options || {};
			options.preserveMatrix = options.preserveMatrix !== undefined ? options.preserveMatrix : true;
			options.preservePosition = options.preservePosition !== undefined ? options.preservePosition : true;
			options.useTargetMatrix = options.useTargetMatrix !== undefined ? options.useTargetMatrix : false;
			options.hip = options.hip !== undefined ? options.hip : "hip";
			options.names = options.names || {};

			var sourceBones = source.isObject3D ? source.skeleton.bones : this.getBones( source ),
				bones = target.isObject3D ? target.skeleton.bones : this.getBones( target ),
				bindBones,
				bone, name, boneTo,
				bonesPosition, i;

			// reset bones

			if ( target.isObject3D ) {

				target.skeleton.pose();

			} else {

				options.useTargetMatrix = true;
				options.preserveMatrix = false;

			}

			if ( options.preservePosition ) {

				bonesPosition = [];

				for ( i = 0; i < bones.length; i ++ ) {

					bonesPosition.push( bones[ i ].position.clone() );

				}

			}

			if ( options.preserveMatrix ) {

				// reset matrix

				target.updateMatrixWorld();

				target.matrixWorld.identity();

				// reset children matrix

				for ( i = 0; i < target.children.length; ++ i ) {

					target.children[ i ].updateMatrixWorld( true );

				}

			}

			if ( options.offset ) {

				bindBones = [];

				for ( i = 0; i < bones.length; ++ i ) {

					bone = bones[ i ];
					name = options.names[ bone.name ] || bone.name;

					if ( options.offset[ name ] ) {

						bone.matrix.multiply( options.offset[ name ] );

						bone.matrix.decompose( bone.position, bone.quaternion, bone.scale );

						bone.updateMatrixWorld();

					}

					bindBones.push( bone.matrixWorld.clone() );

				}

			}

			for ( i = 0; i < bones.length; ++ i ) {

				bone = bones[ i ];
				name = options.names[ bone.name ] || bone.name;

				boneTo = this.getBoneByName( sourceBones, name );

				globalMatrix.copy( bone.matrixWorld );

				if ( boneTo ) {

					boneTo.updateMatrixWorld();

					if ( options.useTargetMatrix ) {

						relativeMatrix.copy( boneTo.matrixWorld );

					} else {

						relativeMatrix.getInverse( target.matrixWorld );
						relativeMatrix.multiply( boneTo.matrixWorld );

					}

					// ignore scale to extract rotation

					scale.setFromMatrixScale( relativeMatrix );
					relativeMatrix.scale( scale.set( 1 / scale.x, 1 / scale.y, 1 / scale.z ) );

					// apply to global matrix

					globalMatrix.makeRotationFromQuaternion( quat.setFromRotationMatrix( relativeMatrix ) );

					if ( target.isObject3D ) {

						var boneIndex = bones.indexOf( bone ),
							wBindMatrix = bindBones ? bindBones[ boneIndex ] : bindBoneMatrix.getInverse( target.skeleton.boneInverses[ boneIndex ] );

						globalMatrix.multiply( wBindMatrix );

					}

					globalMatrix.copyPosition( relativeMatrix );

				}

				if ( bone.parent && bone.parent.isBone ) {

					bone.matrix.getInverse( bone.parent.matrixWorld );
					bone.matrix.multiply( globalMatrix );

				} else {

					bone.matrix.copy( globalMatrix );

				}

				bone.matrix.decompose( bone.position, bone.quaternion, bone.scale );

				bone.updateMatrixWorld();

			}

			if ( options.preservePosition ) {

				for ( i = 0; i < bones.length; ++ i ) {

					bone = bones[ i ];
					name = options.names[ bone.name ] || bone.name;

					if ( name !== options.hip ) {

						bone.position.copy( bonesPosition[ i ] );

					}

				}

			}

			if ( options.preserveMatrix ) {

				// restore matrix

				target.updateMatrixWorld( true );

			}

		};

	}(),

	retargetClip: function ( target, source, clip, options ) {

		options = options || {};
		options.fps = options.fps !== undefined ? options.fps : 30;
		options.names = options.names || [];

		if ( ! source.isObject3D ) {

			var skeleton = source;

			source = new THREE.SkeletonHelper( skeleton.bones[ 0 ] );
			source.skeleton = skeleton;

		}

		var numFrames = Math.round( clip.duration * ( options.fps / 1000 ) * 1000 ),
			delta = 1 / options.fps,
			convertedTracks = [],
			mixer = new THREE.AnimationMixer( source ),
			bones = this.getBones( target.skeleton ),
			boneDatas = [],
			bone, boneTo, boneData, i, j;

		mixer.clipAction( clip ).play();
		mixer.update( 0 );

		//source.updateMatrixWorld();

		for ( i = 0; i < numFrames; ++ i ) {

			var time = i * delta;

			this.retarget( target, source, options );

			for ( j = 0; j < bones.length; ++ j ) {

				boneTo = this.getBoneByName( source.skeleton, options.names[ bones[ j ].name ] || bones[ j ].name );

				if ( boneTo ) {

					bone = bones[ j ];
					boneData = boneDatas[ j ] = boneDatas[ j ] || { bone: bone };

					if ( options.hip === boneData.bone.name ) {

						if ( ! boneData.pos ) {

							boneData.pos = {
								times: new Float32Array( numFrames ),
								values: new Float32Array( numFrames * 3 )
							};

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

			mixer.update( delta );

			//source.updateMatrixWorld();

		}

		for ( i = 0; i < boneDatas.length; ++ i ) {

			boneData = boneDatas[ i ];

			if ( boneData ) {

				if ( boneData.pos ) {

					convertedTracks.push( new THREE.VectorKeyframeTrack(
						".bones[" + boneData.bone.name + "].position",
						boneData.pos.times,
						boneData.pos.values
					) );

				}

				convertedTracks.push( new THREE.QuaternionKeyframeTrack(
					".bones[" + boneData.bone.name + "].quaternion",
					boneData.quat.times,
					boneData.quat.values
				) );

			}

		}

		mixer.uncacheAction( clip );

		return new THREE.AnimationClip( clip.name, - 1, convertedTracks );

	},

	rename: function ( skeleton, names ) {

		var bones = this.getBones( skeleton );

		for ( var i = 0; i < bones.length; ++ i ) {

			var bone = bones[ i ];

			if ( names[ bone.name ] ) {

				bone.name = names[ bone.name ];

			}

		}

		return this;

	},

	getBones: function ( skeleton ) {

		return Array.isArray( skeleton ) ? skeleton : skeleton.bones;

	},

	getBoneByName: function ( skeleton, name ) {

		for ( var i = 0, bones = this.getBones( skeleton ); i < bones.length; i ++ ) {

			if ( name === bones[ i ].name )
				return bones[ i ];

		}

	},

	findBoneTrackData: function ( name, tracks ) {

		var regexp = /\[(.*)\]\.(.*)/,
			result = { name: name };

		for ( var i = 0; i < tracks.length; ++ i ) {

			// 1 is track name
			// 2 is track type
			var trackData = regexp.exec( tracks[ i ].name );

			if ( trackData && name === trackData[ 1 ] ) {

				result[ trackData[ 2 ] ] = i;

			}

		}

		return result;

	},

	getEqualsBonesNames: function ( skeleton, targetSkeleton ) {

		var sourceBones = this.getBones( skeleton ),
			targetBones = this.getBones( targetSkeleton ),
			bones = [];

		search : for ( var i = 0; i < sourceBones.length; i ++ ) {

			var boneName = sourceBones[ i ].name;

			for ( var j = 0; j < targetBones.length; j ++ ) {

				if ( boneName === targetBones[ j ].name ) {

					bones.push( boneName );

					continue search;

				}

			}

		}

		return bones;

	}

};
