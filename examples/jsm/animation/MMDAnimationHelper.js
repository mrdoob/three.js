/**
 * @author takahiro / https://github.com/takahirox
 *
 * MMDAnimationHelper handles animation of MMD assets loaded by MMDLoader
 * with MMD special features as IK, Grant, and Physics.
 *
 * Dependencies
 *  - ammo.js https://github.com/kripken/ammo.js
 *  - MMDPhysics
 *  - CCDIKSolver
 *
 * TODO
 *  - more precise grant skinning support.
 */

import {
	AnimationMixer,
	Object3D,
	Quaternion,
	Vector3
} from "../../../build/three.module.js";
import { CCDIKSolver } from "../animation/CCDIKSolver.js";
import { MMDPhysics } from "../animation/MMDPhysics.js";

var MMDAnimationHelper = ( function () {

	/**
	 * @param {Object} params - (optional)
	 * @param {boolean} params.sync - Whether animation durations of added objects are synched. Default is true.
	 * @param {Number} params.afterglow - Default is 0.0.
	 * @param {boolean} params.resetPhysicsOnLoop - Default is true.
	 */
	function MMDAnimationHelper( params ) {

		params = params || {};

		this.meshes = [];

		this.camera = null;
		this.cameraTarget = new Object3D();
		this.cameraTarget.name = 'target';

		this.audio = null;
		this.audioManager = null;

		this.objects = new WeakMap();

		this.configuration = {
			sync: params.sync !== undefined
				? params.sync : true,
			afterglow: params.afterglow !== undefined
				? params.afterglow : 0.0,
			resetPhysicsOnLoop: params.resetPhysicsOnLoop !== undefined
				? params.resetPhysicsOnLoop : true
		};

		this.enabled = {
			animation: true,
			ik: true,
			grant: true,
			physics: true,
			cameraAnimation: true
		};

		this.onBeforePhysics = function ( /* mesh */ ) {};

		// experimental
		this.sharedPhysics = false;
		this.masterPhysics = null;

	}

	MMDAnimationHelper.prototype = {

		constructor: MMDAnimationHelper,

		/**
		 * Adds an Three.js Object to helper and setups animation.
		 * The anmation durations of added objects are synched
		 * if this.configuration.sync is true.
		 *
		 * @param {THREE.SkinnedMesh|THREE.Camera|THREE.Audio} object
		 * @param {Object} params - (optional)
		 * @param {THREE.AnimationClip|Array<THREE.AnimationClip>} params.animation - Only for THREE.SkinnedMesh and THREE.Camera. Default is undefined.
		 * @param {boolean} params.physics - Only for THREE.SkinnedMesh. Default is true.
		 * @param {Integer} params.warmup - Only for THREE.SkinnedMesh and physics is true. Default is 60.
		 * @param {Number} params.unitStep - Only for THREE.SkinnedMesh and physics is true. Default is 1 / 65.
		 * @param {Integer} params.maxStepNum - Only for THREE.SkinnedMesh and physics is true. Default is 3.
		 * @param {Vector3} params.gravity - Only for THREE.SkinnedMesh and physics is true. Default ( 0, - 9.8 * 10, 0 ).
		 * @param {Number} params.delayTime - Only for THREE.Audio. Default is 0.0.
		 * @return {MMDAnimationHelper}
		 */
		add: function ( object, params ) {

			params = params || {};

			if ( object.isSkinnedMesh ) {

				this._addMesh( object, params );

			} else if ( object.isCamera ) {

				this._setupCamera( object, params );

			} else if ( object.type === 'Audio' ) {

				this._setupAudio( object, params );

			} else {

				throw new Error( 'THREE.MMDAnimationHelper.add: '
					+ 'accepts only '
					+ 'THREE.SkinnedMesh or '
					+ 'THREE.Camera or '
					+ 'THREE.Audio instance.' );

			}

			if ( this.configuration.sync ) this._syncDuration();

			return this;

		},

		/**
		 * Removes an Three.js Object from helper.
		 *
		 * @param {THREE.SkinnedMesh|THREE.Camera|THREE.Audio} object
		 * @return {MMDAnimationHelper}
		 */
		remove: function ( object ) {

			if ( object.isSkinnedMesh ) {

				this._removeMesh( object );

			} else if ( object.isCamera ) {

				this._clearCamera( object );

			} else if ( object.type === 'Audio' ) {

				this._clearAudio( object );

			} else {

				throw new Error( 'THREE.MMDAnimationHelper.remove: '
					+ 'accepts only '
					+ 'THREE.SkinnedMesh or '
					+ 'THREE.Camera or '
					+ 'THREE.Audio instance.' );

			}

			if ( this.configuration.sync ) this._syncDuration();

			return this;

		},

		/**
		 * Updates the animation.
		 *
		 * @param {Number} delta
		 * @return {MMDAnimationHelper}
		 */
		update: function ( delta ) {

			if ( this.audioManager !== null ) this.audioManager.control( delta );

			for ( var i = 0; i < this.meshes.length; i ++ ) {

				this._animateMesh( this.meshes[ i ], delta );

			}

			if ( this.sharedPhysics ) this._updateSharedPhysics( delta );

			if ( this.camera !== null ) this._animateCamera( this.camera, delta );

			return this;

		},

		/**
		 * Changes the pose of SkinnedMesh as VPD specifies.
		 *
		 * @param {THREE.SkinnedMesh} mesh
		 * @param {Object} vpd - VPD content parsed MMDParser
		 * @param {Object} params - (optional)
		 * @param {boolean} params.resetPose - Default is true.
		 * @param {boolean} params.ik - Default is true.
		 * @param {boolean} params.grant - Default is true.
		 * @return {MMDAnimationHelper}
		 */
		pose: function ( mesh, vpd, params ) {

			params = params || {};

			if ( params.resetPose !== false ) mesh.pose();

			var bones = mesh.skeleton.bones;
			var boneParams = vpd.bones;

			var boneNameDictionary = {};

			for ( var i = 0, il = bones.length; i < il; i ++ ) {

				boneNameDictionary[ bones[ i ].name ] = i;

			}

			var vector = new Vector3();
			var quaternion = new Quaternion();

			for ( var i = 0, il = boneParams.length; i < il; i ++ ) {

				var boneParam = boneParams[ i ];
				var boneIndex = boneNameDictionary[ boneParam.name ];

				if ( boneIndex === undefined ) continue;

				var bone = bones[ boneIndex ];
				bone.position.add( vector.fromArray( boneParam.translation ) );
				bone.quaternion.multiply( quaternion.fromArray( boneParam.quaternion ) );

			}

			mesh.updateMatrixWorld( true );

			if ( params.ik !== false ) {

				this._createCCDIKSolver( mesh ).update( params.saveOriginalBonesBeforeIK ); // this param is experimental

			}

			if ( params.grant !== false ) {

				this.createGrantSolver( mesh ).update();

			}

			return this;

		},

		/**
		 * Enabes/Disables an animation feature.
		 *
		 * @param {string} key
		 * @param {boolean} enabled
		 * @return {MMDAnimationHelper}
		 */
		enable: function ( key, enabled ) {

			if ( this.enabled[ key ] === undefined ) {

				throw new Error( 'THREE.MMDAnimationHelper.enable: '
					+ 'unknown key ' + key );

			}

			this.enabled[ key ] = enabled;

			if ( key === 'physics' ) {

				for ( var i = 0, il = this.meshes.length; i < il; i ++ ) {

					this._optimizeIK( this.meshes[ i ], enabled );

				}

			}

			return this;

		},

		/**
		 * Creates an GrantSolver instance.
		 *
		 * @param {THREE.SkinnedMesh} mesh
		 * @return {GrantSolver}
		 */
		createGrantSolver: function ( mesh ) {

			return new GrantSolver( mesh, mesh.geometry.userData.MMD.grants );

		},

		// private methods

		_addMesh: function ( mesh, params ) {

			if ( this.meshes.indexOf( mesh ) >= 0 ) {

				throw new Error( 'THREE.MMDAnimationHelper._addMesh: '
					+ 'SkinnedMesh \'' + mesh.name + '\' has already been added.' );

			}

			this.meshes.push( mesh );
			this.objects.set( mesh, { looped: false } );

			this._setupMeshAnimation( mesh, params.animation );

			if ( params.physics !== false ) {

				this._setupMeshPhysics( mesh, params );

			}

			return this;

		},

		_setupCamera: function ( camera, params ) {

			if ( this.camera === camera ) {

				throw new Error( 'THREE.MMDAnimationHelper._setupCamera: '
					+ 'Camera \'' + camera.name + '\' has already been set.' );

			}

			if ( this.camera ) this.clearCamera( this.camera );

			this.camera = camera;

			camera.add( this.cameraTarget );

			this.objects.set( camera, {} );

			if ( params.animation !== undefined ) {

				this._setupCameraAnimation( camera, params.animation );

			}

			return this;

		},

		_setupAudio: function ( audio, params ) {

			if ( this.audio === audio ) {

				throw new Error( 'THREE.MMDAnimationHelper._setupAudio: '
					+ 'Audio \'' + audio.name + '\' has already been set.' );

			}

			if ( this.audio ) this.clearAudio( this.audio );

			this.audio = audio;
			this.audioManager = new AudioManager( audio, params );

			this.objects.set( this.audioManager, {
				duration: this.audioManager.duration
			} );

			return this;

		},

		_removeMesh: function ( mesh ) {

			var found = false;
			var writeIndex = 0;

			for ( var i = 0, il = this.meshes.length; i < il; i ++ ) {

				if ( this.meshes[ i ] === mesh ) {

					this.objects.delete( mesh );
					found = true;

					continue;

				}

				this.meshes[ writeIndex ++ ] = this.meshes[ i ];

			}

			if ( ! found ) {

				throw new Error( 'THREE.MMDAnimationHelper._removeMesh: '
					+ 'SkinnedMesh \'' + mesh.name + '\' has not been added yet.' );

			}

			this.meshes.length = writeIndex;

			return this;

		},

		_clearCamera: function ( camera ) {

			if ( camera !== this.camera ) {

				throw new Error( 'THREE.MMDAnimationHelper._clearCamera: '
					+ 'Camera \'' + camera.name + '\' has not been set yet.' );

			}

			this.camera.remove( this.cameraTarget );

			this.objects.delete( this.camera );
			this.camera = null;

			return this;

		},

		_clearAudio: function ( audio ) {

			if ( audio !== this.audio ) {

				throw new Error( 'THREE.MMDAnimationHelper._clearAudio: '
					+ 'Audio \'' + audio.name + '\' has not been set yet.' );

			}

			this.objects.delete( this.audioManager );

			this.audio = null;
			this.audioManager = null;

			return this;

		},

		_setupMeshAnimation: function ( mesh, animation ) {

			var objects = this.objects.get( mesh );

			if ( animation !== undefined ) {

				var animations = Array.isArray( animation )
					? animation : [ animation ];

				objects.mixer = new AnimationMixer( mesh );

				for ( var i = 0, il = animations.length; i < il; i ++ ) {

					objects.mixer.clipAction( animations[ i ] ).play();

				}

				// TODO: find a workaround not to access ._clip looking like a private property
				objects.mixer.addEventListener( 'loop', function ( event ) {

					var tracks = event.action._clip.tracks;

					if ( tracks.length > 0 &&
					     tracks[ 0 ].name.slice( 0, 6 ) !== '.bones' ) return;

					objects.looped = true;

				} );

			}

			objects.ikSolver = this._createCCDIKSolver( mesh );
			objects.grantSolver = this.createGrantSolver( mesh );

			return this;

		},

		_setupCameraAnimation: function ( camera, animation ) {

			var animations = Array.isArray( animation )
				? animation : [ animation ];

			var objects = this.objects.get( camera );

			objects.mixer = new AnimationMixer( camera );

			for ( var i = 0, il = animations.length; i < il; i ++ ) {

				objects.mixer.clipAction( animations[ i ] ).play();

			}

		},

		_setupMeshPhysics: function ( mesh, params ) {

			var objects = this.objects.get( mesh );

			// shared physics is experimental

			if ( params.world === undefined && this.sharedPhysics ) {

				var masterPhysics = this._getMasterPhysics();

				if ( masterPhysics !== null ) world = masterPhysics.world; // eslint-disable-line no-undef

			}

			objects.physics = this._createMMDPhysics( mesh, params );

			if ( objects.mixer && params.animationWarmup !== false ) {

				this._animateMesh( mesh, 0 );
				objects.physics.reset();

			}

			objects.physics.warmup( params.warmup !== undefined ? params.warmup : 60 );

			this._optimizeIK( mesh, true );

		},

		_animateMesh: function ( mesh, delta ) {

			var objects = this.objects.get( mesh );

			var mixer = objects.mixer;
			var ikSolver = objects.ikSolver;
			var grantSolver = objects.grantSolver;
			var physics = objects.physics;
			var looped = objects.looped;

			// alternate solution to save/restore bones but less performant?
			//mesh.pose();
			//this._updatePropertyMixersBuffer( mesh );

			if ( mixer && this.enabled.animation ) {

				this._restoreBones( mesh );

				mixer.update( delta );

				this._saveBones( mesh );

				if ( ikSolver && this.enabled.ik ) {

					mesh.updateMatrixWorld( true );
					ikSolver.update();

				}

				if ( grantSolver && this.enabled.grant ) {

					grantSolver.update();

				}

			}

			if ( looped === true && this.enabled.physics ) {

				if ( physics && this.configuration.resetPhysicsOnLoop ) physics.reset();

				objects.looped = false;

			}

			if ( physics && this.enabled.physics && ! this.sharedPhysics ) {

				this.onBeforePhysics( mesh );
				physics.update( delta );

			}

		},

		_animateCamera: function ( camera, delta ) {

			var mixer = this.objects.get( camera ).mixer;

			if ( mixer && this.enabled.cameraAnimation ) {

				mixer.update( delta );

				camera.updateProjectionMatrix();

				camera.up.set( 0, 1, 0 );
				camera.up.applyQuaternion( camera.quaternion );
				camera.lookAt( this.cameraTarget.position );

			}

		},

		_optimizeIK: function ( mesh, physicsEnabled ) {

			var iks = mesh.geometry.userData.MMD.iks;
			var bones = mesh.geometry.userData.MMD.bones;

			for ( var i = 0, il = iks.length; i < il; i ++ ) {

				var ik = iks[ i ];
				var links = ik.links;

				for ( var j = 0, jl = links.length; j < jl; j ++ ) {

					var link = links[ j ];

					if ( physicsEnabled === true ) {

						// disable IK of the bone the corresponding rigidBody type of which is 1 or 2
						// because its rotation will be overriden by physics
						link.enabled = bones[ link.index ].rigidBodyType > 0 ? false : true;

					} else {

						link.enabled = true;

					}

				}

			}

		},

		_createCCDIKSolver: function ( mesh ) {

			if ( CCDIKSolver === undefined ) {

				throw new Error( 'THREE.MMDAnimationHelper: Import CCDIKSolver.' );

			}

			return new CCDIKSolver( mesh, mesh.geometry.userData.MMD.iks );

		},

		_createMMDPhysics: function ( mesh, params ) {

			if ( MMDPhysics === undefined ) {

				throw new Error( 'THREE.MMDPhysics: Import MMDPhysics.' );

			}

			return new MMDPhysics(
				mesh,
				mesh.geometry.userData.MMD.rigidBodies,
				mesh.geometry.userData.MMD.constraints,
				params );

		},

		/*
		 * Detects the longest duration and then sets it to them to sync.
		 * TODO: Not to access private properties ( ._actions and ._clip )
		 */
		_syncDuration: function () {

			var max = 0.0;

			var objects = this.objects;
			var meshes = this.meshes;
			var camera = this.camera;
			var audioManager = this.audioManager;

			// get the longest duration

			for ( var i = 0, il = meshes.length; i < il; i ++ ) {

				var mixer = this.objects.get( meshes[ i ] ).mixer;

				if ( mixer === undefined ) continue;

				for ( var j = 0; j < mixer._actions.length; j ++ ) {

					var clip = mixer._actions[ j ]._clip;

					if ( ! objects.has( clip ) ) {

						objects.set( clip, {
							duration: clip.duration
						} );

					}

					max = Math.max( max, objects.get( clip ).duration );

				}

			}

			if ( camera !== null ) {

				var mixer = this.objects.get( camera ).mixer;

				if ( mixer !== undefined ) {

					for ( var i = 0, il = mixer._actions.length; i < il; i ++ ) {

						var clip = mixer._actions[ i ]._clip;

						if ( ! objects.has( clip ) ) {

							objects.set( clip, {
								duration: clip.duration
							} );

						}

						max = Math.max( max, objects.get( clip ).duration );

					}

				}

			}

			if ( audioManager !== null ) {

				max = Math.max( max, objects.get( audioManager ).duration );

			}

			max += this.configuration.afterglow;

			// update the duration

			for ( var i = 0, il = this.meshes.length; i < il; i ++ ) {

				var mixer = this.objects.get( this.meshes[ i ] ).mixer;

				if ( mixer === undefined ) continue;

				for ( var j = 0, jl = mixer._actions.length; j < jl; j ++ ) {

					mixer._actions[ j ]._clip.duration = max;

				}

			}

			if ( camera !== null ) {

				var mixer = this.objects.get( camera ).mixer;

				if ( mixer !== undefined ) {

					for ( var i = 0, il = mixer._actions.length; i < il; i ++ ) {

						mixer._actions[ i ]._clip.duration = max;

					}

				}

			}

			if ( audioManager !== null ) {

				audioManager.duration = max;

			}

		},

		// workaround

		_updatePropertyMixersBuffer: function ( mesh ) {

			var mixer = this.objects.get( mesh ).mixer;

			var propertyMixers = mixer._bindings;
			var accuIndex = mixer._accuIndex;

			for ( var i = 0, il = propertyMixers.length; i < il; i ++ ) {

				var propertyMixer = propertyMixers[ i ];
				var buffer = propertyMixer.buffer;
				var stride = propertyMixer.valueSize;
				var offset = ( accuIndex + 1 ) * stride;

				propertyMixer.binding.getValue( buffer, offset );

			}

		},

		/*
		 * Avoiding these two issues by restore/save bones before/after mixer animation.
		 *
		 * 1. PropertyMixer used by AnimationMixer holds cache value in .buffer.
		 *    Calculating IK, Grant, and Physics after mixer animation can break
		 *    the cache coherency.
		 *
		 * 2. Applying Grant two or more times without reset the posing breaks model.
		 */
		_saveBones: function ( mesh ) {

			var objects = this.objects.get( mesh );

			var bones = mesh.skeleton.bones;

			var backupBones = objects.backupBones;

			if ( backupBones === undefined ) {

				backupBones = new Float32Array( bones.length * 7 );
				objects.backupBones = backupBones;

			}

			for ( var i = 0, il = bones.length; i < il; i ++ ) {

				var bone = bones[ i ];
				bone.position.toArray( backupBones, i * 7 );
				bone.quaternion.toArray( backupBones, i * 7 + 3 );

			}

		},

		_restoreBones: function ( mesh ) {

			var objects = this.objects.get( mesh );

			var backupBones = objects.backupBones;

			if ( backupBones === undefined ) return;

			var bones = mesh.skeleton.bones;

			for ( var i = 0, il = bones.length; i < il; i ++ ) {

				var bone = bones[ i ];
				bone.position.fromArray( backupBones, i * 7 );
				bone.quaternion.fromArray( backupBones, i * 7 + 3 );

			}

		},

		// experimental

		_getMasterPhysics: function () {

			if ( this.masterPhysics !== null ) return this.masterPhysics;

			for ( var i = 0, il = this.meshes.length; i < il; i ++ ) {

				var physics = this.meshes[ i ].physics;

				if ( physics !== undefined && physics !== null ) {

					this.masterPhysics = physics;
					return this.masterPhysics;

				}

			}

			return null;

		},

		_updateSharedPhysics: function ( delta ) {

			if ( this.meshes.length === 0 || ! this.enabled.physics || ! this.sharedPhysics ) return;

			var physics = this._getMasterPhysics();

			if ( physics === null ) return;

			for ( var i = 0, il = this.meshes.length; i < il; i ++ ) {

				var p = this.meshes[ i ].physics;

				if ( p !== null && p !== undefined ) {

					p.updateRigidBodies();

				}

			}

			physics.stepSimulation( delta );

			for ( var i = 0, il = this.meshes.length; i < il; i ++ ) {

				var p = this.meshes[ i ].physics;

				if ( p !== null && p !== undefined ) {

					p.updateBones();

				}

			}

		}

	};

	//

	/**
	 * @param {THREE.Audio} audio
	 * @param {Object} params - (optional)
	 * @param {Nuumber} params.delayTime
	 */
	function AudioManager( audio, params ) {

		params = params || {};

		this.audio = audio;

		this.elapsedTime = 0.0;
		this.currentTime = 0.0;
		this.delayTime = params.delayTime !== undefined
			? params.delayTime : 0.0;

		this.audioDuration = this.audio.buffer.duration;
		this.duration = this.audioDuration + this.delayTime;

	}

	AudioManager.prototype = {

		constructor: AudioManager,

		/**
		 * @param {Number} delta
		 * @return {AudioManager}
		 */
		control: function ( delta ) {

			this.elapsed += delta;
			this.currentTime += delta;

			if ( this._shouldStopAudio() ) this.audio.stop();
			if ( this._shouldStartAudio() ) this.audio.play();

			return this;

		},

		// private methods

		_shouldStartAudio: function () {

			if ( this.audio.isPlaying ) return false;

			while ( this.currentTime >= this.duration ) {

				this.currentTime -= this.duration;

			}

			if ( this.currentTime < this.delayTime ) return false;

			// 'duration' can be bigger than 'audioDuration + delayTime' because of sync configuration
			if ( ( this.currentTime - this.delayTime ) > this.audioDuration ) return false;

			return true;

		},

		_shouldStopAudio: function () {

			return this.audio.isPlaying &&
				this.currentTime >= this.duration;

		}

	};

	/**
	 * @param {THREE.SkinnedMesh} mesh
	 * @param {Array<Object>} grants
	 */
	function GrantSolver( mesh, grants ) {

		this.mesh = mesh;
		this.grants = grants || [];

	}

	GrantSolver.prototype = {

		constructor: GrantSolver,

		/**
		 * @return {GrantSolver}
		 */
		update: function () {

			var quaternion = new Quaternion();

			return function () {

				var bones = this.mesh.skeleton.bones;
				var grants = this.grants;

				for ( var i = 0, il = grants.length; i < il; i ++ ) {

					var grant = grants[ i ];
					var bone = bones[ grant.index ];
					var parentBone = bones[ grant.parentIndex ];

					if ( grant.isLocal ) {

						// TODO: implement
						if ( grant.affectPosition ) {

						}

						// TODO: implement
						if ( grant.affectRotation ) {

						}

					} else {

						// TODO: implement
						if ( grant.affectPosition ) {

						}

						if ( grant.affectRotation ) {

							quaternion.set( 0, 0, 0, 1 );
							quaternion.slerp( parentBone.quaternion, grant.ratio );
							bone.quaternion.multiply( quaternion );

						}

					}

				}

				return this;

			};

		}()

	};

	return MMDAnimationHelper;

} )();

export { MMDAnimationHelper };
