/**
 * 	SEA3D for Three.JS
 * 	@author Sunag / http://www.sunag.com.br/
 */

import {
	Matrix4,
	Vector3,
	Quaternion,
	EventDispatcher,
	AudioLoader,
	AnimationClip,
	AnimationMixer,
	AudioListener,
	InterpolateLinear,
	VectorKeyframeTrack,
	QuaternionKeyframeTrack,
	LoopRepeat,
	LoopOnce,
	Object3D,
	BoxGeometry,
	Mesh,
	MeshBasicMaterial,
	SkinnedMesh,
	Skeleton,
	Bone,
	PerspectiveCamera,
	OrthographicCamera,
	PointLight,
	PositionalAudio,
	Math,
	BufferGeometry,
	BufferAttribute,
	Float32BufferAttribute,
	LineBasicMaterial,
	Line,
	SpriteMaterial,
	Sprite,
	VertexColors,
	Color,
	NoColors,
	CubeCamera,
	Texture,
	CubeTexture,
	RepeatWrapping,
	ClampToEdgeWrapping,
	CubeReflectionMapping,
	MixOperation,
	CubeRefractionMapping,
	SphericalReflectionMapping,
	RGBFormat,
	FileLoader,
	TextureLoader,
	//PMREMGenerator,
	//HDRCubeTextureLoader,
	UnsignedByteType,
	//PMREMCubeUVPacker,
	CubeTextureLoader,
	NormalBlending,
	MeshPhysicalMaterial,
	MeshStandardMaterial,
	MeshPhongMaterial,
	AdditiveBlending,
	SubtractiveBlending,
	MultiplyBlending,
	CustomBlending,
	OneFactor,
	OneMinusSrcColorFactor,
	AddEquation,
	DoubleSide,
	FrontSide,
	HemisphereLight,
	AmbientLight,
	DirectionalLight
} from "../../../../build/three.module.js";

import { SEA3DSDK } from "./SEA3DSDK.js";

//
//
//	SEA3D
//

function SEA3D( config ) {

	this.config = {
		id: "",
		scripts: true,
		runScripts: true,
		autoPlay: false,
		dummys: true,
		multiplier: 1,
		bounding: true,
		audioRolloffFactor: 10,
		lights: true,
		useEnvironment: true,
		useVertexTexture: true,
		forceStatic: false,
		streaming: true,
		async: true,
		paths: {},
		timeLimit: 10
	};

	if ( config ) this.loadConfig( config );

};

//
//	Config
//

SEA3D.MTXBUF = new Matrix4();
SEA3D.VECBUF = new Vector3();
SEA3D.QUABUF = new Quaternion();

SEA3D.BACKGROUND_COLOR = 0x333333;
SEA3D.HELPER_COLOR = 0x9AB9E5;
SEA3D.RTT_SIZE = 512;

SEA3D.identityMatrixScale = function () {

	var scl = new Vector3();

	return function identityMatrixScale( matrix ) {

		scl.setFromMatrixScale( matrix );

		return matrix.scale( scl.set( 1 / scl.x, 1 / scl.y, 1 / scl.z ) );

	};

}();

SEA3D.prototype = Object.assign( Object.create( EventDispatcher.prototype ), {

	constructor: SEA3D,

	setShadowMap: function ( light ) {

		light.shadow.mapSize.width = 2048;
		light.shadow.mapSize.height = 1024;

		light.castShadow = true;

		light.shadow.camera.left = - 200;
		light.shadow.camera.right = 200;
		light.shadow.camera.top = 200;
		light.shadow.camera.bottom = - 200;

		light.shadow.camera.near = 1;
		light.shadow.camera.far = 3000;
		light.shadow.camera.fov = 45;

		light.shadow.bias = - 0.001;

	}

} );

Object.defineProperties( SEA3D.prototype, {

	container: {

		set: function ( val ) {

			this.config.container = val;

		},

		get: function () {

			return this.config.container;

		}

	},

	elapsedTime: {

		get: function () {

			return this.file.timer.elapsedTime;

		}

	}

} );

//
//	Domain
//

SEA3D.Domain = function ( id, objects, container ) {

	this.id = id;
	this.objects = objects;
	this.container = container;

	this.sources = [];
	this.local = {};

	this.scriptTargets = [];

	this.events = new EventDispatcher();

};

SEA3D.Domain.global = {};

SEA3D.Domain.prototype = Object.assign( Object.create( EventDispatcher.prototype ), {

	constructor: SEA3D.Domain,

	add: function ( src ) {

		this.sources.push( src );

	},

	remove: function ( src ) {

		this.sources.splice( this.sources.indexOf( src ), 1 );

	},

	contains: function ( src ) {

		return this.sources.indexOf( src ) != - 1;

	},

	addEventListener: function ( type, listener ) {

		this.events.addEventListener( type, listener );

	},

	hasEventListener: function ( type, listener ) {

		return this.events.hasEventListener( type, listener );

	},

	removeEventListener: function ( type, listener ) {

		this.events.removeEventListener( type, listener );

	},

	print: function () {

		console.log.apply( console, arguments );

	},

	watch: function () {

		console.log.apply( console, 'watch:', arguments );

	},

	runScripts: function () {

		for ( var i = 0; i < this.scriptTargets.length; i ++ ) {

			this.runJSMList( this.scriptTargets[ i ] );

		}

	},

	runJSMList: function ( target ) {

		var scripts = target.scripts;

		for ( var i = 0; i < scripts.length; i ++ ) {

			this.runJSM( target, scripts[ i ] );

		}

		return scripts;

	},

	runJSM: function ( target, script ) {

		var include = {
			print: this.print,
			watch: this.watch,
			sea3d: this,
			scene: this.container,
			source: new SEA3D.ScriptDomain( this, target instanceof SEA3D.Domain )
		};

		Object.freeze( include.source );

		SEA3D.ScriptHandler.add( include.source );

		try {

			this.methods[ script.method ](
				include,
				this.getReference,
				SEA3D.Domain.global,
				this.local,
				target,
				script.params
			);

		} catch ( e ) {

			console.error( 'SEA3D JavaScript: Error running method "' + script.method + '".' );
			console.error( e );

		}

	},

	getReference: function ( ns ) {

		return eval( ns );

	},

	disposeList: function ( list ) {

		if ( ! list || ! list.length ) return;

		list = list.concat();

		var i = list.length;

		while ( i -- ) {

			list[ i ].dispose();

		}

	},

	dispatchEvent: function ( event ) {

		event.domain = this;

		var sources = this.sources.concat(),
			i = sources.length;

		while ( i -- ) {

			sources[ i ].dispatchEvent( event );

		}

		this.events.dispatchEvent( event );

	},

	dispose: function () {

		this.disposeList( this.sources );

		while ( this.container.children.length ) {

			this.container.remove( this.container.children[ 0 ] );

		}

		var i = SEA3D.EXTENSIONS_DOMAIN.length;

		while ( i -- ) {

			var domain = SEA3D.EXTENSIONS_DOMAIN[ i ];

			if ( domain.dispose ) domain.dispose.call( this );

		}

		this.disposeList( this.materials );
		this.disposeList( this.dummys );

		this.dispatchEvent( { type: "dispose" } );

	}
} );

//
//	Domain Manager
//

SEA3D.DomainManager = function ( autoDisposeRootDomain ) {

	this.domains = [];
	this.autoDisposeRootDomain = autoDisposeRootDomain !== undefined ? autoDisposeRootDomain : true;

};

Object.assign( SEA3D.DomainManager.prototype, {

	onDisposeDomain: function ( e ) {

		this.remove( e.domain );

		if ( this.autoDisposeRootDomain && this.domains.length === 1 ) {

			this.dispose();

		}

	},

	add: function ( domain ) {

		this._onDisposeDomain = this._onDisposeDomain || this.onDisposeDomain.bind( this );

		domain.on( "dispose", this._onDisposeDomain );

		this.domains.push( domain );

		this.textures = this.textures || domain.textures;
		this.cubemaps = this.cubemaps || domain.cubemaps;
		this.geometries = this.geometries || domain.geometries;

	},

	remove: function ( domain ) {

		domain.removeEvent( "dispose", this._onDisposeDomain );

		this.domains.splice( this.domains.indexOf( domain ), 1 );

	},

	contains: function ( domain ) {

		return this.domains.indexOf( domain ) != - 1;

	},

	disposeList: function ( list ) {

		if ( ! list || ! list.length ) return;

		list = list.concat();

		var i = list.length;

		while ( i -- ) {

			list[ i ].dispose();

		}

	},

	dispose: function () {

		this.disposeList( this.domains );
		this.disposeList( this.textures );
		this.disposeList( this.cubemaps );
		this.disposeList( this.geometries );

	}

} );

//
//	Script ( closure for private functions )
//

SEA3D.ScriptDomain = function ( domain, root ) {

	domain = domain || new SEA3D.Domain();
	domain.add( this );

	var events = new EventDispatcher();

	this.getId = function () {

		return domain.id;

	};

	this.isRoot = function () {

		return root;

	};

	this.addEventListener = function ( type, listener ) {

		events.addEventListener( type, listener );

	};

	this.hasEventListener = function ( type, listener ) {

		return events.hasEventListener( type, listener );

	};

	this.removeEventListener = function ( type, listener ) {

		events.removeEventListener( type, listener );

	};

	this.dispatchEvent = function ( event ) {

		event.script = this;

		events.dispatchEvent( event );

	};

	this.dispose = function () {

		domain.remove( this );

		if ( root ) domain.dispose();

		this.dispatchEvent( { type: "dispose" } );

	};

};

//
//	Script Manager ( closure for private functions )
//

SEA3D.ScriptManager = function () {

	this.scripts = [];

	var onDisposeScript = ( function ( e ) {

		this.remove( e.script );

	} ).bind( this );

	this.add = function ( src ) {

		src.addEventListener( "dispose", onDisposeScript );

		this.scripts.push( src );

	};

	this.remove = function ( src ) {

		src.removeEventListener( "dispose", onDisposeScript );

		this.scripts.splice( this.scripts.indexOf( src ), 1 );

	};

	this.contains = function ( src ) {

		return this.scripts.indexOf( src ) > - 1;

	};

	this.dispatchEvent = function ( event ) {

		var scripts = this.scripts.concat(),
			i = scripts.length;

		while ( i -- ) {

			scripts[ i ].dispatchEvent( event );

		}

	};

};

//
//	Script Handler
//

SEA3D.ScriptHandler = new SEA3D.ScriptManager();

SEA3D.ScriptHandler.dispatchUpdate = function ( delta ) {

	this.dispatchEvent( {
		type: "update",
		delta: delta
	} );

};

//
//	Animation Clip
//

SEA3D.AnimationClip = function ( name, duration, tracks, repeat ) {

	AnimationClip.call( this, name, duration, tracks );

	this.repeat = repeat !== undefined ? repeat : true;

};

SEA3D.AnimationClip.fromClip = function ( clip, repeat ) {

	return new SEA3D.AnimationClip( clip.name, clip.duration, clip.tracks, repeat );

};

SEA3D.AnimationClip.prototype = Object.assign( Object.create( AnimationClip.prototype ), {

	constructor: SEA3D.AnimationClip

} );

//
//	Animation
//

SEA3D.Animation = function ( clip, timeScale ) {

	this.clip = clip;
	this.timeScale = timeScale !== undefined ? timeScale : 1;

};

SEA3D.Animation.COMPLETE = "animationComplete";

SEA3D.Animation.prototype = Object.assign( Object.create( EventDispatcher.prototype ), {

	constructor: SEA3D.Animation,

	onComplete: function ( scope ) {

		this.dispatchEvent( { type: SEA3D.Animation.COMPLETE, target: this } );


	}

} );

Object.defineProperties( SEA3D.Animation.prototype, {

	name: {

		get: function () {

			return this.clip.name;

		}

	},

	repeat: {

		get: function () {

			return this.clip.repeat;

		}

	},

	duration: {

		get: function () {

			return this.clip.duration;

		}

	},

	mixer: {

		set: function ( val ) {

			if ( this.mx ) {

				this.mx.uncacheClip( this.clip );
				delete this.mx;

			}

			if ( val ) {

				this.mx = val;
				this.mx.clipAction( this.clip );

			}

		},

		get: function () {

			return this.mx;

		}

	}

} );

//
//	Animator
//

SEA3D.Animator = function ( clips, mixer ) {

	this.updateAnimations( clips, mixer );

	this.clone = function ( scope ) {

		return new this.constructor( this.clips, new AnimationMixer( scope ) ).copyFrom( this );

	}.bind( this );

};

Object.assign( SEA3D.Animator.prototype, {

	update: function ( dt ) {

		this.mixer.update( dt || 0 );

		if ( this.currentAnimationAction && this.currentAnimationAction.paused ) {

			this.pause();

			if ( this.currentAnimation ) {

				this.currentAnimation.onComplete( this );

			}

		}

		return this;

	},

	updateAnimations: function ( clips, mixer ) {

		if ( this.playing ) this.stop();

		if ( this.mixer ) SEA3D.AnimationHandler.remove( this );

		this.mixer = mixer;

		this.relative = false;
		this.playing = false;
		this.paused = false;

		this.timeScale = 1;

		this.animations = [];
		this.animation = {};

		this.clips = [];

		if ( clips ) {

			for ( var i = 0; i < clips.length; i ++ ) {

				this.addAnimation( clips[ i ] );

			}

		}

		return this;

	},

	addAnimation: function ( animation ) {

		if ( animation instanceof AnimationClip ) {

			this.clips.push( animation );

			animation = new SEA3D.Animation( animation );

		}

		this.animations.push( animation );
		this.animation[ animation.name ] = animation;

		animation.mixer = this.mixer;

		return animation;

	},

	removeAnimation: function ( animation ) {

		if ( animation instanceof AnimationClip ) {

			animation = this.getAnimationByClip( animation );

		}

		this.clips.splice( this.clips.indexOf( animation.clip ), 1 );

		delete this.animation[ animation.name ];
		this.animations.splice( this.animations.indexOf( animation ), 1 );

		animation.mixer = null;

		return animation;

	},

	getAnimationByClip: function ( clip ) {

		for ( var i = 0; i < this.animations.length; i ++ ) {

			if ( this.animations[ i ].clip === clip ) return clip;

		}

	},

	getAnimationByName: function ( name ) {

		return typeof name === "number" ? this.animations[ name ] : this.animation[ name ];

	},

	setAnimationWeight: function ( name, val ) {

		this.mixer.clipAction( this.getAnimationByName( name ).clip ).setEffectiveWeight( val );

	},

	getAnimationWeight: function ( name ) {

		return this.mixer.clipAction( this.getAnimationByName( name ).clip ).getEffectiveWeight();

	},

	pause: function () {

		if ( this.playing && this.currentAnimation ) {

			SEA3D.AnimationHandler.remove( this );

			this.playing = false;

		}

		return this;

	},

	resume: function () {

		if ( ! this.playing && this.currentAnimation ) {

			SEA3D.AnimationHandler.add( this );

			this.playing = true;

		}

		return this;

	},

	setTimeScale: function ( val ) {

		this.timeScale = val;

		if ( this.currentAnimationAction ) this.updateTimeScale();

		return this;

	},

	getTimeScale: function () {

		return this.timeScale;

	},

	updateTimeScale: function () {

		this.currentAnimationAction.setEffectiveTimeScale( this.timeScale * ( this.currentAnimation ? this.currentAnimation.timeScale : 1 ) );

		return this;

	},

	play: function ( name, crossfade, offset, weight ) {

		var animation = this.getAnimationByName( name );

		if ( ! animation ) throw new Error( 'Animation "' + name + '" not found.' );

		if ( animation === this.currentAnimation ) {

			if ( offset !== undefined || ! animation.repeat ) this.currentAnimationAction.time = offset !== undefined ? offset :
				( this.currentAnimationAction.timeScale >= 0 ? 0 : this.currentAnimation.duration );

			this.currentAnimationAction.setEffectiveWeight( weight !== undefined ? weight : 1 );
			this.currentAnimationAction.paused = false;

			return this.resume();

		} else {

			this.previousAnimation = this.currentAnimation;
			this.currentAnimation = animation;

			this.previousAnimationAction = this.currentAnimationAction;
			this.currentAnimationAction = this.mixer.clipAction( animation.clip ).setLoop( animation.repeat ? LoopRepeat : LoopOnce, Infinity ).reset();
			this.currentAnimationAction.clampWhenFinished = ! animation.repeat;
			this.currentAnimationAction.paused = false;

			this.updateTimeScale();

			if ( offset !== undefined || ! animation.repeat ) this.currentAnimationAction.time = offset !== undefined ? offset :
				( this.currentAnimationAction.timeScale >= 0 ? 0 : this.currentAnimation.duration );

			this.currentAnimationAction.setEffectiveWeight( weight !== undefined ? weight : 1 );

			this.currentAnimationAction.play();

			if ( ! this.playing ) this.mixer.update( 0 );

			this.playing = true;

			if ( this.previousAnimation ) this.previousAnimationAction.crossFadeTo( this.currentAnimationAction, crossfade || 0, false );

			SEA3D.AnimationHandler.add( this );

		}

		return this;

	},

	stop: function () {

		if ( this.playing ) SEA3D.AnimationHandler.remove( this );

		if ( this.currentAnimation ) {

			this.currentAnimationAction.stop();

			this.previousAnimation = this.currentAnimation;
			this.previousAnimationAction = this.currentAnimationAction;

			delete this.currentAnimationAction;
			delete this.currentAnimation;

			this.playing = false;

		}

		return this;

	},

	playw: function ( name, weight ) {

		if ( ! this.playing && ! this.paused ) SEA3D.AnimationHandler.add( this );

		var animation = this.getAnimationByName( name );

		this.playing = true;

		var clip = this.mixer.clipAction( animation.clip );
		clip.setLoop( animation.repeat ? LoopRepeat : LoopOnce, Infinity ).reset();
		clip.clampWhenFinished = ! animation.repeat;
		clip.paused = false;

		clip.setEffectiveWeight( weight ).play();

		return clip;

	},

	crossFade: function ( fromAnimName, toAnimName, duration, wrap ) {

		this.mixer.stopAllAction();

		var fromAction = this.playw( fromAnimName, 1 );
		var toAction = this.playw( toAnimName, 1 );

		fromAction.crossFadeTo( toAction, duration, wrap !== undefined ? wrap : false );

		return this;

	},

	stopAll: function () {

		this.stop().mixer.stopAllAction();

		this.playing = false;

		return this;

	},

	unPauseAll: function () {

		this.mixer.timeScale = 1;

		this.playing = true;
		this.paused = false;

		return this;

	},

	pauseAll: function () {

		this.mixer.timeScale = 0;

		this.playing = false;
		this.paused = true;

		return this;

	},

	setRelative: function ( val ) {

		if ( this.relative === val ) return;

		this.stop();

		this.relative = val;

		return this;

	},

	getRelative: function () {

		return this.relative;

	},

	copyFrom: function ( scope ) {

		for ( var i = 0; i < this.animations.length; i ++ ) {

			this.animations[ i ].timeScale = scope.animations[ i ].timeScale;

		}

		return this;

	}

} );

//
//	Object3D Animator
//

SEA3D.Object3DAnimator = function ( clips, object3d ) {

	this.object3d = object3d;

	SEA3D.Animator.call( this, clips, new AnimationMixer( object3d ) );

	this.clone = function ( scope ) {

		return new this.constructor( this.clips, scope ).copyFrom( this );

	}.bind( this );

};

SEA3D.Object3DAnimator.prototype = Object.assign( Object.create( SEA3D.Animator.prototype ), {

	constructor: SEA3D.Object3DAnimator,

	stop: function () {

		if ( this.currentAnimation ) {

			var animate = this.object3d.animate;

			if ( animate && this instanceof SEA3D.Object3DAnimator ) {

				animate.position.set( 0, 0, 0 );
				animate.quaternion.set( 0, 0, 0, 1 );
				animate.scale.set( 1, 1, 1 );

			}

		}

		SEA3D.Animator.prototype.stop.call( this );

	},

	setRelative: function ( val ) {

		SEA3D.Animator.prototype.setRelative.call( this, val );

		this.object3d.setAnimator( this.relative );

		this.updateAnimations( this.clips, new AnimationMixer( this.relative ? this.object3d.animate : this.object3d ) );

	}

} );

//
//	Camera Animator
//

SEA3D.CameraAnimator = function ( clips, object3d ) {

	SEA3D.Object3DAnimator.call( this, clips, object3d );

};

SEA3D.CameraAnimator.prototype = Object.assign( Object.create( SEA3D.Object3DAnimator.prototype ), {

	constructor: SEA3D.CameraAnimator

} );

//
//	Sound Animator
//

SEA3D.SoundAnimator = function ( clips, object3d ) {

	SEA3D.Object3DAnimator.call( this, clips, object3d );

};

SEA3D.SoundAnimator.prototype = Object.assign( Object.create( SEA3D.Object3DAnimator.prototype ), {

	constructor: SEA3D.SoundAnimator

} );

//
//	Light Animator
//

SEA3D.LightAnimator = function ( clips, object3d ) {

	SEA3D.Object3DAnimator.call( this, clips, object3d );

};

SEA3D.LightAnimator.prototype = Object.assign( Object.create( SEA3D.Object3DAnimator.prototype ), {

	constructor: SEA3D.LightAnimator

} );

//
//	Container
//

SEA3D.Object3D = function ( ) {

	Object3D.call( this );

};

SEA3D.Object3D.prototype = Object.assign( Object.create( Object3D.prototype ), {

	constructor: SEA3D.Object3D,

	// Relative Animation Extension ( Only used if relative animation is enabled )
	// TODO: It can be done with shader

	updateAnimateMatrix: function ( force ) {

		if ( this.matrixAutoUpdate === true ) this.updateMatrix();

		if ( this.matrixWorldNeedsUpdate === true || force === true ) {

			if ( this.parent === null ) {

				this.matrixWorld.copy( this.matrix );

			} else {

				this.matrixWorld.multiplyMatrices( this.parent.matrixWorld, this.matrix );

			}

			this.animate.updateMatrix();

			this.matrixWorld.multiplyMatrices( this.matrixWorld, this.animate.matrix );

			this.matrixWorldNeedsUpdate = false;

			force = true;

		}

		// update children

		for ( var i = 0, l = this.children.length; i < l; i ++ ) {

			this.children[ i ].updateMatrixWorld( force );

		}

	},

	setAnimator: function ( val ) {

		if ( this.getAnimator() == val )
			return;

		if ( val ) {

			this.animate = new Object3D();

			this.updateMatrixWorld = SEA3D.Object3D.prototype.updateAnimateMatrix;

		} else {

			delete this.animate;

			this.updateMatrixWorld = Object3D.prototype.updateMatrixWorld;

		}

		this.matrixWorldNeedsUpdate = true;

	},

	getAnimator: function () {

		return this.animate != undefined;

	},

	copy: function ( source ) {

		Object3D.prototype.copy.call( this, source );

		this.attribs = source.attribs;
		this.scripts = source.scripts;

		if ( source.animator ) this.animator = source.animator.clone( this );

		return this;

	}

} );

//
//	Dummy
//

SEA3D.Dummy = function ( width, height, depth ) {

	this.width = width != undefined ? width : 100;
	this.height = height != undefined ? height : 100;
	this.depth = depth != undefined ? depth : 100;

	var geo = new BoxGeometry( this.width, this.height, this.depth, 1, 1, 1 );

	geo.computeBoundingBox();
	geo.computeBoundingSphere();

	Mesh.call( this, geo, SEA3D.Dummy.MATERIAL );

};

SEA3D.Dummy.MATERIAL = new MeshBasicMaterial( { wireframe: true, color: SEA3D.HELPER_COLOR } );

SEA3D.Dummy.prototype = Object.assign( Object.create( Mesh.prototype ), SEA3D.Object3D.prototype, {

	constructor: SEA3D.Dummy,

	copy: function ( source ) {

		Mesh.prototype.copy.call( this, source );

		this.attribs = source.attribs;
		this.scripts = source.scripts;

		if ( source.animator ) this.animator = source.animator.clone( this );

		return this;

	},

	dispose: function () {

		this.geometry.dispose();

	}

} );

//
//	Mesh
//

SEA3D.Mesh = function ( geometry, material ) {

	Mesh.call( this, geometry, material );

};

SEA3D.Mesh.prototype = Object.assign( Object.create( Mesh.prototype ), SEA3D.Object3D.prototype, {

	constructor: SEA3D.Mesh,

	setWeight: function ( name, val ) {

		var index = typeof name === "number" ? name : this.morphTargetDictionary[ name ];

		this.morphTargetInfluences[ index ] = val;

	},

	getWeight: function ( name ) {

		var index = typeof name === "number" ? name : this.morphTargetDictionary[ name ];

		return this.morphTargetInfluences[ index ];

	},

	copy: function ( source ) {

		Mesh.prototype.copy.call( this, source );

		this.attribs = source.attribs;
		this.scripts = source.scripts;

		if ( source.animator ) this.animator = source.animator.clone( this );

		return this;

	}

} );

//
//	Skinning
//

SEA3D.SkinnedMesh = function ( geometry, material ) {

	SkinnedMesh.call( this, geometry, material );

	this.bind( new Skeleton( this.initBones() ), this.matrixWorld );

	this.updateAnimations( geometry.animations, new AnimationMixer( this ) );

};

SEA3D.SkinnedMesh.prototype = Object.assign( Object.create( SkinnedMesh.prototype ), SEA3D.Mesh.prototype, SEA3D.Animator.prototype, {

	constructor: SEA3D.SkinnedMesh,

	initBones: function () {

		var bones = [], bone, gbone;
		var i, il;

		if ( this.geometry && this.geometry.bones !== undefined ) {

			// first, create array of 'Bone' objects from geometry data

			for ( i = 0, il = this.geometry.bones.length; i < il; i ++ ) {

				gbone = this.geometry.bones[ i ];

				// create new 'Bone' object

				bone = new Bone();
				bones.push( bone );

				// apply values

				bone.name = gbone.name;
				bone.position.fromArray( gbone.pos );
				bone.quaternion.fromArray( gbone.rotq );
				if ( gbone.scl !== undefined ) bone.scale.fromArray( gbone.scl );

			}

			// second, create bone hierarchy

			for ( i = 0, il = this.geometry.bones.length; i < il; i ++ ) {

				gbone = this.geometry.bones[ i ];

				if ( ( gbone.parent !== - 1 ) && ( gbone.parent !== null ) && ( bones[ gbone.parent ] !== undefined ) ) {

					// subsequent bones in the hierarchy

					bones[ gbone.parent ].add( bones[ i ] );

				} else {

					// topmost bone, immediate child of the skinned mesh

					this.add( bones[ i ] );

				}

			}

		}

		// now the bones are part of the scene graph and children of the skinned mesh.
		// let's update the corresponding matrices

		this.updateMatrixWorld( true );

		return bones;

	},

	boneByName: function ( name ) {

		var bones = this.skeleton.bones;

		for ( var i = 0, bl = bones.length; i < bl; i ++ ) {

			if ( name === bones[ i ].name )
				return bones[ i ];

		}

	},

	copy: function ( source ) {

		SkinnedMesh.prototype.copy.call( this, source );

		this.attribs = source.attribs;
		this.scripts = source.scripts;

		if ( source.animator ) this.animator = source.animator.clone( this );

		return this;

	}

} );

//
//	Vertex Animation
//

SEA3D.VertexAnimationMesh = function ( geometry, material ) {

	Mesh.call( this, geometry, material );

	this.type = 'MorphAnimMesh';

	this.updateAnimations( geometry.animations, new AnimationMixer( this ) );

};

SEA3D.VertexAnimationMesh.prototype = Object.assign( Object.create( Mesh.prototype ), SEA3D.Mesh.prototype, SEA3D.Animator.prototype, {

	constructor: SEA3D.VertexAnimationMesh,

	copy: function ( source ) {

		Mesh.prototype.copy.call( this, source );

		this.attribs = source.attribs;
		this.scripts = source.scripts;

		if ( source.animator ) this.animator = source.animator.clone( this );

		return this;

	}

} );

//
//	Camera
//

SEA3D.Camera = function ( fov, aspect, near, far ) {

	PerspectiveCamera.call( this, fov, aspect, near, far );

};

SEA3D.Camera.prototype = Object.assign( Object.create( PerspectiveCamera.prototype ), SEA3D.Object3D.prototype, {

	constructor: SEA3D.Camera,

	copy: function ( source ) {

		PerspectiveCamera.prototype.copy.call( this, source );

		this.attribs = source.attribs;
		this.scripts = source.scripts;

		if ( source.animator ) this.animator = source.animator.clone( this );

		return this;

	}

} );

//
//	Orthographic Camera
//

SEA3D.OrthographicCamera = function ( left, right, top, bottom, near, far ) {

	OrthographicCamera.call( this, left, right, top, bottom, near, far );

};

SEA3D.OrthographicCamera.prototype = Object.assign( Object.create( OrthographicCamera.prototype ), SEA3D.Object3D.prototype, {

	constructor: SEA3D.OrthographicCamera,

	copy: function ( source ) {

		OrthographicCamera.prototype.copy.call( this, source );

		this.attribs = source.attribs;
		this.scripts = source.scripts;

		if ( source.animator ) this.animator = source.animator.clone( this );

		return this;

	}

} );

//
//	PointLight
//

SEA3D.PointLight = function ( hex, intensity, distance, decay ) {

	PointLight.call( this, hex, intensity, distance, decay );

};

SEA3D.PointLight.prototype = Object.assign( Object.create( PointLight.prototype ), SEA3D.Object3D.prototype, {

	constructor: SEA3D.PointLight,

	copy: function ( source ) {

		PointLight.prototype.copy.call( this, source );

		this.attribs = source.attribs;
		this.scripts = source.scripts;

		if ( source.animator ) this.animator = source.animator.clone( this );

		return this;

	}

} );

//
//	Point Sound
//

SEA3D.PointSound = function ( listener, sound ) {

	PositionalAudio.call( this, listener );

	this.setSound( sound );

};

SEA3D.PointSound.prototype = Object.assign( Object.create( PositionalAudio.prototype ), SEA3D.Object3D.prototype, {

	constructor: SEA3D.PointSound,

	setSound: function ( sound ) {

		this.sound = sound;

		if ( sound ) {

			if ( sound.buffer ) {

				this.setBuffer( sound.buffer );

			} else {

				sound.addEventListener( "complete", function ( e ) {

					this.setBuffer( sound.buffer );

				}.bind( this ) );

			}

		}

		return this;

	},

	copy: function ( source ) {

		PositionalAudio.prototype.copy.call( this, source );

		this.attribs = source.attribs;
		this.scripts = source.scripts;

		if ( source.animator ) this.animator = source.animator.clone( this );

		return this;

	}

} );

//
//	Animation Handler
//

SEA3D.AnimationHandler = {

	animators: [],

	update: function ( dt ) {

		var i = 0;

		while ( i < this.animators.length ) {

			this.animators[ i ++ ].update( dt );

		}

	},

	add: function ( animator ) {

		var index = this.animators.indexOf( animator );

		if ( index === - 1 ) this.animators.push( animator );

	},

	remove: function ( animator ) {

		var index = this.animators.indexOf( animator );

		if ( index !== - 1 ) this.animators.splice( index, 1 );

	}

};

//
//	Sound
//

SEA3D.Sound = function ( src ) {

	this.uuid = Math.generateUUID();

	this.src = src;

	new AudioLoader().load( src, function ( buffer ) {

		this.buffer = buffer;

		this.dispatchEvent( { type: "complete" } );

	}.bind( this ) );

};

SEA3D.Sound.prototype = Object.assign( Object.create( EventDispatcher.prototype ), {

	constructor: SEA3D.Sound

} );

//
//	Output
//

SEA3D.Domain.prototype.getMesh = SEA3D.prototype.getMesh = function ( name ) {

	return this.objects[ "m3d/" + name ];

};

SEA3D.Domain.prototype.getDummy = SEA3D.prototype.getDummy = function ( name ) {

	return this.objects[ "dmy/" + name ];

};

SEA3D.Domain.prototype.getLine = SEA3D.prototype.getLine = function ( name ) {

	return this.objects[ "line/" + name ];

};

SEA3D.Domain.prototype.getSound3D = SEA3D.prototype.getSound3D = function ( name ) {

	return this.objects[ "sn3d/" + name ];

};

SEA3D.Domain.prototype.getMaterial = SEA3D.prototype.getMaterial = function ( name ) {

	return this.objects[ "mat/" + name ];

};

SEA3D.Domain.prototype.getLight = SEA3D.prototype.getLight = function ( name ) {

	return this.objects[ "lht/" + name ];

};

SEA3D.Domain.prototype.getGLSL = SEA3D.prototype.getGLSL = function ( name ) {

	return this.objects[ "glsl/" + name ];

};

SEA3D.Domain.prototype.getCamera = SEA3D.prototype.getCamera = function ( name ) {

	return this.objects[ "cam/" + name ];

};

SEA3D.Domain.prototype.getTexture = SEA3D.prototype.getTexture = function ( name ) {

	return this.objects[ "tex/" + name ];

};

SEA3D.Domain.prototype.getCubeMap = SEA3D.prototype.getCubeMap = function ( name ) {

	return this.objects[ "cmap/" + name ];

};

SEA3D.Domain.prototype.getJointObject = SEA3D.prototype.getJointObject = function ( name ) {

	return this.objects[ "jnt/" + name ];

};

SEA3D.Domain.prototype.getContainer3D = SEA3D.prototype.getContainer3D = function ( name ) {

	return this.objects[ "c3d/" + name ];

};

SEA3D.Domain.prototype.getSprite = SEA3D.prototype.getSprite = function ( name ) {

	return this.objects[ "m2d/" + name ];

};

SEA3D.Domain.prototype.getProperties = SEA3D.prototype.getProperties = function ( name ) {

	return this.objects[ "prop/" + name ];

};

//
//	Utils
//

SEA3D.prototype.isPowerOfTwo = function ( num ) {

	return num ? ( ( num & - num ) === num ) : false;

};

SEA3D.prototype.nearestPowerOfTwo = function ( num ) {

	return Math.pow( 2, Math.round( Math.log( num ) / Math.LN2 ) );

};

SEA3D.prototype.updateTransform = function ( obj3d, sea ) {

	var mtx = SEA3D.MTXBUF, vec = SEA3D.VECBUF;

	if ( sea.transform ) mtx.fromArray( sea.transform );
	else mtx.makeTranslation( sea.position.x, sea.position.y, sea.position.z );

	// matrix

	obj3d.position.setFromMatrixPosition( mtx );
	obj3d.scale.setFromMatrixScale( mtx );

	// ignore rotation scale

	obj3d.quaternion.setFromRotationMatrix( SEA3D.identityMatrixScale( mtx ) );

	// optimize if is static

	if ( this.config.forceStatic || sea.isStatic ) {

		obj3d.updateMatrix();
		obj3d.matrixAutoUpdate = false;

	}

};

SEA3D.prototype.toVector3 = function ( data ) {

	return new Vector3( data.x, data.y, data.z );

};

SEA3D.prototype.toFaces = function ( faces ) {

	// xyz(- / +) to xyz(+ / -) sequence
	var f = [];

	f[ 0 ] = faces[ 1 ];
	f[ 1 ] = faces[ 0 ];
	f[ 2 ] = faces[ 3 ];
	f[ 3 ] = faces[ 2 ];
	f[ 4 ] = faces[ 5 ];
	f[ 5 ] = faces[ 4 ];

	return f;

};

SEA3D.prototype.updateScene = function () {

	if ( this.materials != undefined ) {

		for ( var i = 0, l = this.materials.length; i < l; ++ i ) {

			this.materials[ i ].needsUpdate = true;

		}

	}

};

SEA3D.prototype.addSceneObject = function ( sea, obj3d ) {

	obj3d = obj3d || sea.tag;

	obj3d.visible = sea.visible;

	if ( sea.parent ) sea.parent.tag.add( obj3d );
	else if ( this.config.container ) this.config.container.add( obj3d );

	if ( sea.attributes ) obj3d.attribs = sea.attributes.tag;

	if ( sea.scripts ) {

		obj3d.scripts = this.getJSMList( obj3d, sea.scripts );

		if ( this.config.scripts && this.config.runScripts ) this.domain.runJSMList( obj3d );

	}

};

SEA3D.prototype.createObjectURL = function ( raw, mime ) {

	return ( window.URL || window.webkitURL ).createObjectURL( new Blob( [ raw ], { type: mime } ) );

};

SEA3D.prototype.parsePath = function ( url ) {

	var paths = this.config.paths;

	for ( var name in paths ) {

		url = url.replace( new RegExp( "%" + name + "%", "g" ), paths[ name ] );

	}

	return url;

};

SEA3D.prototype.addDefaultAnimation = function ( sea, animatorClass ) {

	var scope = sea.tag;

	for ( var i = 0, count = sea.animations ? sea.animations.length : 0; i < count; i ++ ) {

		var anm = sea.animations[ i ];

		switch ( anm.tag.type ) {

			case SEA3DSDK.Animation.prototype.type:

				var animation = anm.tag.tag || this.getModifier( {
					sea: anm.tag,
					scope: scope,
					relative: anm.relative
				} );

				scope.animator = new animatorClass( animation, scope );
				scope.animator.setRelative( anm.relative );

				if ( this.config.autoPlay ) {

					scope.animator.play( 0 );

				}

				return scope.animator;

				break;

		}

	}

};

//
//	Geometry
//

SEA3D.prototype.readGeometryBuffer = function ( sea ) {

	var geo = sea.tag || new BufferGeometry();

	for ( var i = 0; i < sea.groups.length; i ++ ) {

		var g = sea.groups[ i ];

		geo.addGroup( g.start, g.count, i );

	}

	// not indexes? use polygon soup
	if ( sea.indexes ) geo.setIndex( new BufferAttribute( sea.indexes, 1 ) );

	geo.addAttribute( 'position', new BufferAttribute( sea.vertex, 3 ) );

	if ( sea.uv ) {

		geo.addAttribute( 'uv', new BufferAttribute( sea.uv[ 0 ], 2 ) );
		if ( sea.uv.length > 1 ) geo.addAttribute( 'uv2', new BufferAttribute( sea.uv[ 1 ], 2 ) );

	}

	if ( sea.normal ) geo.addAttribute( 'normal', new BufferAttribute( sea.normal, 3 ) );
	else geo.computeVertexNormals();

	if ( sea.tangent4 ) geo.addAttribute( 'tangent', new BufferAttribute( sea.tangent4, 4 ) );

	if ( sea.color ) geo.addAttribute( 'color', new BufferAttribute( sea.color[ 0 ], sea.numColor ) );

	if ( sea.joint ) {

		geo.addAttribute( 'skinIndex', new Float32BufferAttribute( sea.joint, sea.jointPerVertex ) );
		geo.addAttribute( 'skinWeight', new Float32BufferAttribute( sea.weight, sea.jointPerVertex ) );

	}

	if ( this.config.bounding ) {

		geo.computeBoundingBox();
		geo.computeBoundingSphere();

	}

	geo.name = sea.name;

	this.domain.geometries = this.geometries = this.geometries || [];
	this.geometries.push( this.objects[ "geo/" + sea.name ] = sea.tag = geo );

};

//
//	Dummy
//

SEA3D.prototype.readDummy = function ( sea ) {

	var dummy = new SEA3D.Dummy( sea.width, sea.height, sea.depth );
	dummy.name = sea.name;

	this.domain.dummys = this.dummys = this.dummys || [];
	this.dummys.push( this.objects[ "dmy/" + sea.name ] = sea.tag = dummy );

	this.addSceneObject( sea );
	this.updateTransform( dummy, sea );

	this.addDefaultAnimation( sea, SEA3D.Object3DAnimator );

};

//
//	Line
//

SEA3D.prototype.readLine = function ( sea ) {

	var	geo = new BufferGeometry();

	if ( sea.closed )
		sea.vertex.push( sea.vertex[ 0 ], sea.vertex[ 1 ], sea.vertex[ 2 ] );

	geo.addAttribute( 'position', new Float32BufferAttribute( sea.vertex, 3 ) );

	var line = new Line( geo, new LineBasicMaterial( { color: SEA3D.HELPER_COLOR, linewidth: 3 } ) );
	line.name = sea.name;

	this.lines = this.lines || [];
	this.lines.push( this.objects[ "line/" + sea.name ] = sea.tag = line );

	this.addSceneObject( sea );
	this.updateTransform( line, sea );

	this.addDefaultAnimation( sea, SEA3D.Object3DAnimator );

};

//
//	Container3D
//

SEA3D.prototype.readContainer3D = function ( sea ) {

	var container = new SEA3D.Object3D();

	this.domain.containers = this.containers = this.containers || [];
	this.containers.push( this.objects[ "c3d/" + sea.name ] = sea.tag = container );

	this.addSceneObject( sea );
	this.updateTransform( container, sea );

	this.addDefaultAnimation( sea, SEA3D.Object3DAnimator );

};

//
//	Sprite
//

SEA3D.prototype.readSprite = function ( sea ) {

	var mat;

	if ( sea.material ) {

		if ( ! sea.material.tag.sprite ) {

			mat = sea.material.tag.sprite = new SpriteMaterial();

			this.setBlending( mat, sea.blendMode );

			var map = sea.material.tag.map;

			if ( map ) {

				map.flipY = true;
				mat.map = map;

			}

			mat.color.set( sea.material.tag.color );
			mat.opacity = sea.material.tag.opacity;
			mat.fog = sea.material.receiveFog;

		} else {

			mat = sea.material.tag.sprite;

		}

	}

	var sprite = new Sprite( mat );
	sprite.name = sea.name;

	this.domain.sprites = this.sprites = this.sprites || [];
	this.sprites.push( this.objects[ "m2d/" + sea.name ] = sea.tag = sprite );

	this.addSceneObject( sea );
	this.updateTransform( sprite, sea );

	sprite.scale.set( sea.width, sea.height, 1 );

};

//
//	Mesh
//

SEA3D.prototype.readMesh = function ( sea ) {

	var i, count, geo = sea.geometry.tag, mesh, mat, skeleton, morpher, skeletonAnimation, vertexAnimation, uvwAnimationClips, morphAnimation;

	for ( i = 0, count = sea.modifiers ? sea.modifiers.length : 0; i < count; i ++ ) {

		var mod = sea.modifiers[ i ];

		switch ( mod.type ) {

			case SEA3DSDK.Skeleton.prototype.type:
			case SEA3DSDK.SkeletonLocal.prototype.type:

				skeleton = mod;

				geo.bones = skeleton.tag;

				break;

			case SEA3DSDK.Morph.prototype.type:

				morpher = mod.tag || this.getModifier( {
					sea: mod,
					geometry: sea.geometry
				} );

				geo.morphAttributes = morpher.attribs;
				geo.morphTargets = morpher.targets;

				break;

		}

	}

	for ( i = 0, count = sea.animations ? sea.animations.length : 0; i < count; i ++ ) {

		var anm = sea.animations[ i ],
			anmTag = anm.tag;

		switch ( anmTag.type ) {

			case SEA3DSDK.SkeletonAnimation.prototype.type:

				skeletonAnimation = anmTag;

				geo.animations = skeletonAnimation.tag || this.getModifier( {
					sea: skeletonAnimation,
					skeleton: skeleton,
					relative: true
				} );

				break;

			case SEA3DSDK.VertexAnimation.prototype.type:

				vertexAnimation = anmTag;

				geo.morphAttributes = vertexAnimation.tag.attribs;
				geo.morphTargets = vertexAnimation.tag.targets;
				geo.animations = vertexAnimation.tag.animations;

				break;

			case SEA3DSDK.UVWAnimation.prototype.type:

				uvwAnimationClips = anmTag.tag || this.getModifier( {
					sea: anmTag
				} );

				break;

			case SEA3DSDK.MorphAnimation.prototype.type:

				morphAnimation = anmTag.tag || this.getModifier( {
					sea: anmTag
				} );

				break;

		}

	}

	var uMorph = morpher != undefined || vertexAnimation != undefined,
		uMorphNormal =
					( morpher && morpher.attribs.normal != undefined ) ||
					( vertexAnimation && vertexAnimation.tag.attribs.normal != undefined );

	if ( sea.material ) {

		if ( sea.material.length > 1 ) {

			mat = [];

			for ( i = 0; i < sea.material.length; i ++ ) {

				mat[ i ] = sea.material[ i ].tag;

				mat[ i ].skinning = skeleton != undefined;
				mat[ i ].morphTargets = uMorph;
				mat[ i ].morphNormals = uMorphNormal;
				mat[ i ].vertexColors = sea.geometry.color ? VertexColors : NoColors;

			}

		} else {

			mat = sea.material[ 0 ].tag;

			mat.skinning = skeleton != undefined;
			mat.morphTargets = uMorph;
			mat.morphNormals = uMorphNormal;
			mat.vertexColors = sea.geometry.color ? VertexColors : NoColors;

		}

	}

	if ( skeleton ) {

		mesh = new SEA3D.SkinnedMesh( geo, mat, this.config.useVertexTexture );

		if ( this.config.autoPlay && skeletonAnimation ) {

			mesh.play( 0 );

		}

	} else if ( vertexAnimation ) {

		mesh = new SEA3D.VertexAnimationMesh( geo, mat );

		if ( this.config.autoPlay ) {

			mesh.play( 0 );

		}

	} else {

		mesh = new SEA3D.Mesh( geo, mat );

	}

	if ( uvwAnimationClips ) {

		mesh.uvwAnimator = new SEA3D.Animator( uvwAnimationClips, new AnimationMixer( mat.map ) );

		if ( this.config.autoPlay ) {

			mesh.uvwAnimator.play( 0 );

		}

	}

	if ( morphAnimation ) {

		mesh.morphAnimator = new SEA3D.Animator( morphAnimation, new AnimationMixer( mesh ) );

		if ( this.config.autoPlay ) {

			mesh.morphAnimator.play( 0 );

		}

	}

	mesh.name = sea.name;

	mesh.castShadow = sea.castShadows;
	mesh.receiveShadow = sea.material ? sea.material[ 0 ].receiveShadows : true;

	this.domain.meshes = this.meshes = this.meshes || [];
	this.meshes.push( this.objects[ "m3d/" + sea.name ] = sea.tag = mesh );

	this.addSceneObject( sea );
	this.updateTransform( mesh, sea );

	this.addDefaultAnimation( sea, SEA3D.Object3DAnimator );

};

//
//	Sound Point
//

SEA3D.prototype.readSoundPoint = function ( sea ) {

	if ( ! this.audioListener ) {

		 this.audioListener = new AudioListener();

		 if ( this.config.container ) {

			this.config.container.add( this.audioListener );

		}

	}

	var sound3d = new SEA3D.PointSound( this.audioListener );
	sound3d.autoplay = sea.autoPlay;
	sound3d.setLoop( sea.autoPlay );
	sound3d.setVolume( sea.volume );
	sound3d.setRefDistance( sea.distance );
	sound3d.setRolloffFactor( this.config.audioRolloffFactor );
	sound3d.setSound( sea.sound.tag );

	sound3d.name = sea.name;

	this.domain.sounds3d = this.sounds3d = this.sounds3d || [];
	this.sounds3d.push( this.objects[ "sn3d/" + sea.name ] = sea.tag = sound3d );

	this.addSceneObject( sea );
	this.updateTransform( sound3d, sea );

	this.addDefaultAnimation( sea, SEA3D.SoundAnimator );

};

//
//	Cube Render
//

SEA3D.prototype.readCubeRender = function ( sea ) {

	var cube = new CubeCamera( 0.1, 5000, SEA3D.RTT_SIZE );
	cube.renderTarget.cubeCamera = cube;

	sea.tag = cube.renderTarget;

	this.domain.cubeRenderers = this.cubeRenderers = this.cubeRenderers || [];
	this.cubeRenderers.push( this.objects[ "rttc/" + sea.name ] = cube );

	this.addSceneObject( sea, cube );
	this.updateTransform( cube, sea );

};

//
//	Texture (WDP, JPEG, PNG and GIF)
//

SEA3D.prototype.readTexture = function ( sea ) {

	var image = new Image(),
		texture = new Texture();

	texture.name = sea.name;
	texture.wrapS = texture.wrapT = RepeatWrapping;
	texture.flipY = false;
	texture.image = image;

	if ( this.config.anisotropy !== undefined ) texture.anisotropy = this.config.anisotropy;

	image.onload = function () {

		texture.needsUpdate = true;

	};

	image.src = this.createObjectURL( sea.data.buffer, "image/" + sea.type );

	this.domain.textures = this.textures = this.textures || [];
	this.textures.push( this.objects[ "tex/" + sea.name ] = sea.tag = texture );

};

//
//	Cube Map
//

SEA3D.prototype.readCubeMap = function ( sea ) {

	var faces = this.toFaces( sea.faces ), texture = new CubeTexture( [] );

	var loaded = 0;

	texture.name = sea.name;
	texture.flipY = false;
	texture.format = RGBFormat;

	var onLoaded = function () {

		if ( ++ loaded === 6 ) {

			texture.needsUpdate = true;

			if ( ! this.config.async ) this.file.resume = true;

		}

	}.bind( this );

	for ( var i = 0; i < faces.length; ++ i ) {

		var cubeImage = new Image();
		cubeImage.onload = onLoaded;
		cubeImage.src = this.createObjectURL( faces[ i ].buffer, "image/" + sea.extension );

		texture.images[ i ] = cubeImage;

	}

	if ( ! this.config.async ) this.file.resume = false;

	this.domain.cubemaps = this.cubemaps = this.cubemaps || [];
	this.cubemaps.push( this.objects[ "cmap/" + sea.name ] = sea.tag = texture );

};

//
//	Updaters
//

SEA3D.prototype.readGeometryUpdate = function ( geometry, bytes, sea ) {

	var Class = sea.sea3d.typeClass[ sea.type ],
		seaUpdate = new Class( "", bytes, sea.sea3d );

	seaUpdate.tag = geometry;

	this.readGeometryBuffer( seaUpdate );

};

SEA3D.prototype.readTextureUpdate = function ( texture, bytes, type ) {

	var image = new Image();

	image.onload = function () {

		texture.image = image;
		texture.needsUpdate = true;

	};

	image.src = this.createObjectURL( bytes.buffer, "image/" + type );

};

SEA3D.prototype.readAssetUpdate = function ( sea ) {

	var obj = this.file.objects[ sea.index ],
		bytes = sea.bytes,
		tag = obj.tag;

	if (!tag) return;
	
	if ( tag.isBufferGeometry ) {

		this.readGeometryUpdate( tag, bytes, obj );

	} else if ( tag.isTexture ) {

		this.readTextureUpdate( tag, bytes, obj.type );

	}

};

//
//	Sound (MP3, OGG)
//

SEA3D.prototype.readSound = function ( sea ) {

	var sound = new SEA3D.Sound( this.createObjectURL( sea.data.buffer, "audio/" + sea.type ) );
	sound.name = sea.name;

	this.domain.sounds = this.sounds = this.sounds || [];
	this.sounds.push( this.objects[ "snd/" + sea.name ] = sea.tag = sound );

};

//
//	Script URL
//

SEA3D.prototype.readScriptURL = function ( sea ) {

	this.file.resume = false;

	var loader = new FileLoader();

	loader.setResponseType( "text" ).load( sea.url, function ( src ) {

		this.file.resume = true;

		this.domain.scripts = this.scripts = this.scripts || [];
		this.scripts.push( this.objects[ "src/" + sea.name ] = sea.tag = src );

	}.bind( this ) );

};

//
//	Texture URL
//

SEA3D.prototype.readTextureURL = function ( sea ) {

	var texture = new TextureLoader().load( this.parsePath( sea.url ) );

	texture.name = sea.name;
	texture.wrapS = texture.wrapT = RepeatWrapping;
	texture.flipY = false;

	if ( this.config.anisotropy !== undefined ) texture.anisotropy = this.config.anisotropy;

	this.domain.textures = this.textures = this.textures || [];
	this.textures.push( this.objects[ "tex/" + sea.name ] = sea.tag = texture );

};

//
//	CubeMap URL
//

SEA3D.prototype.readCubeMapURL = function ( sea ) {

	var faces = this.toFaces( sea.faces );

	for ( var i = 0; i < faces.length; i ++ ) {

		faces[ i ] = this.parsePath( faces[ i ] );

	}

	var texture, format = faces[ 0 ].substr( - 3 );

	if ( format === "hdr" ) {

		var usePMREM = PMREMGenerator != null;

		this.file.resume = ! usePMREM;

		texture = new HDRCubeTextureLoader().load( UnsignedByteType, faces, function ( texture ) {

			if ( usePMREM ) {

				var pmremGenerator = new PMREMGenerator( texture );
				pmremGenerator.update( this.config.renderer );

				var pmremCubeUVPacker = new PMREMCubeUVPacker( pmremGenerator.cubeLods );
				pmremCubeUVPacker.update( this.config.renderer );

				texture.dispose();

				this.objects[ "cmap/" + sea.name ] = sea.tag = pmremCubeUVPacker.CubeUVRenderTarget.texture;

				this.file.resume = true;

			}

		}.bind( this ) );

	} else {

		texture = new CubeTextureLoader().load( faces );

	}

	texture.name = sea.name;
	texture.wrapS = texture.wrapT = RepeatWrapping;
	texture.flipY = false;

	if ( this.config.anisotropy !== undefined ) texture.anisotropy = this.config.anisotropy;

	this.domain.cubemaps = this.cubemaps = this.cubemaps || [];
	this.cubemaps.push( this.objects[ "cmap/" + sea.name ] = sea.tag = texture );

};

//
//	Runtime
//

SEA3D.prototype.getJSMList = function ( target, scripts ) {

	var scriptTarget = [];

	for ( var i = 0; i < scripts.length; i ++ ) {

		var script = scripts[ i ];

		if ( script.tag.type === SEA3DSDK.JavaScriptMethod.prototype.type ) {

			scriptTarget.push( script );

		}

	}

	this.domain.scriptTargets = this.scriptTargets = this.scriptTargets || [];
	this.scriptTargets.push( target );

	return scriptTarget;

};

SEA3D.prototype.readJavaScriptMethod = function ( sea ) {

	try {

		var src =
			'(function() {\n' +
			'var $METHOD = {}\n';

		var declare =
			'function($INC, $REF, global, local, self, $PARAM) {\n' +
			'var watch = $INC["watch"],\n' +
			'scene = $INC["scene"],\n' +
			'sea3d = $INC["sea3d"],\n' +
			'print = $INC["print"];\n';

		declare +=
			'var $SRC = $INC["source"],\n' +
			'addEventListener = $SRC.addEventListener.bind( $SRC ),\n' +
			'hasEventListener = $SRC.hasEventListener.bind( $SRC ),\n' +
			'removeEventListener = $SRC.removeEventListener.bind( $SRC ),\n' +
			'dispatchEvent = $SRC.dispatchEvent.bind( $SRC ),\n' +
			'dispose = $SRC.dispose.bind( $SRC );\n';

		for ( var name in sea.methods ) {

			src += '$METHOD["' + name + '"] = ' + declare + sea.methods[ name ].src + '}\n';

		}

		src += 'return $METHOD; })';

		this.domain.methods = eval( src )();

	} catch ( e ) {

		console.error( 'SEA3D JavaScriptMethod: Error running "' + sea.name + '".' );
		console.error( e );

	}

};

//
//	GLSL
//

SEA3D.prototype.readGLSL = function ( sea ) {

	this.domain.glsl = this.glsl = this.glsl || [];
	this.glsl.push( this.objects[ "glsl/" + sea.name ] = sea.tag = sea.src );

};

//
//	Material
//

SEA3D.prototype.materialTechnique =
( function () {

	var techniques = {};

	// FINAL
	techniques.onComplete = function ( mat, sea ) {

		if ( sea.alpha < 1 || mat.blending > NormalBlending ) {

			mat.opacity = sea.alpha;
			mat.transparent = true;

		}

	};

	// PHYSICAL
	techniques[ SEA3DSDK.Material.PHYSICAL ] =
	function ( mat, tech ) {

		mat.color.setHex( tech.color );
		mat.roughness = tech.roughness;
		mat.metalness = tech.metalness;

	};

	// REFLECTIVITY
	techniques[ SEA3DSDK.Material.REFLECTIVITY ] =
	function ( mat, tech ) {

		mat.reflectivity = tech.strength;

	};

	// CLEAR_COAT
	techniques[ SEA3DSDK.Material.CLEAR_COAT ] =
	function ( mat, tech ) {

		mat.clearCoat = tech.strength;
		mat.clearCoatRoughness = tech.roughness;

	};

	// PHONG
	techniques[ SEA3DSDK.Material.PHONG ] =
	function ( mat, tech ) {

		mat.color.setHex( tech.diffuseColor );
		mat.specular.setHex( tech.specularColor ).multiplyScalar( tech.specular );
		mat.shininess = tech.gloss;

	};

	// DIFFUSE_MAP
	techniques[ SEA3DSDK.Material.DIFFUSE_MAP ] =
	function ( mat, tech, sea ) {

		mat.map = tech.texture.tag;
		mat.color.setHex( 0xFFFFFF );

		mat.map.wrapS = mat.map.wrapT = sea.repeat ? RepeatWrapping : ClampToEdgeWrapping;

		if ( tech.texture.transparent ) {

			mat.transparent = true;

		}

	};

	// ROUGHNESS_MAP
	techniques[ SEA3DSDK.Material.ROUGHNESS_MAP ] =
	function ( mat, tech ) {

		mat.roughnessMap = tech.texture.tag;

	};

	// METALNESS_MAP
	techniques[ SEA3DSDK.Material.METALNESS_MAP ] =
	function ( mat, tech ) {

		mat.metalnessMap = tech.texture.tag;

	};

	// SPECULAR_MAP
	techniques[ SEA3DSDK.Material.SPECULAR_MAP ] =
	function ( mat, tech ) {

		if ( mat.specular ) {

			mat.specularMap = tech.texture.tag;
			mat.specular.setHex( 0xFFFFFF );

		}

	};

	// NORMAL_MAP
	techniques[ SEA3DSDK.Material.NORMAL_MAP ] =
	function ( mat, tech ) {

		mat.normalMap = tech.texture.tag;

	};

	// REFLECTION
	techniques[ SEA3DSDK.Material.REFLECTION ] =
	techniques[ SEA3DSDK.Material.FRESNEL_REFLECTION ] =
	function ( mat, tech ) {

		mat.envMap = tech.texture.tag;
		mat.envMap.mapping = CubeReflectionMapping;
		mat.combine = MixOperation;

		mat.reflectivity = tech.alpha;

	};

	// REFLECTION_SPHERICAL
	techniques[ SEA3DSDK.Material.REFLECTION_SPHERICAL ] =
	function ( mat, tech ) {

		mat.envMap = tech.texture.tag;
		mat.envMap.mapping = SphericalReflectionMapping;
		mat.combine = MixOperation;

		mat.reflectivity = tech.alpha;

	};

	// REFRACTION
	techniques[ SEA3DSDK.Material.REFRACTION_MAP ] =
	function ( mat, tech ) {

		mat.envMap = tech.texture.tag;
		mat.envMap.mapping = CubeRefractionMapping;

		mat.refractionRatio = tech.ior;
		mat.reflectivity = tech.alpha;

	};

	// LIGHT_MAP
	techniques[ SEA3DSDK.Material.LIGHT_MAP ] =
	function ( mat, tech ) {

		if ( tech.blendMode === "multiply" ) mat.aoMap = tech.texture.tag;
		else mat.lightMap = tech.texture.tag;

	};

	// EMISSIVE
	techniques[ SEA3DSDK.Material.EMISSIVE ] =
	function ( mat, tech ) {

		mat.emissive.setHex( tech.color );

	};

	// EMISSIVE_MAP
	techniques[ SEA3DSDK.Material.EMISSIVE_MAP ] =
	function ( mat, tech ) {

		mat.emissiveMap = tech.texture.tag;

	};

	// ALPHA_MAP
	techniques[ SEA3DSDK.Material.ALPHA_MAP ] =
	function ( mat, tech, sea ) {

		mat.alphaMap = tech.texture.tag;
		mat.transparent = true;

		mat.alphaMap.wrapS = mat.alphaMap.wrapT = sea.repeat ? RepeatWrapping : ClampToEdgeWrapping;

	};

	return techniques;

} )();

SEA3D.prototype.createMaterial = function ( sea ) {

	if ( sea.tecniquesDict[ SEA3DSDK.Material.REFLECTIVITY ] || sea.tecniquesDict[ SEA3DSDK.Material.CLEAR_COAT ] ) {

		return new MeshPhysicalMaterial();

	} else if ( sea.tecniquesDict[ SEA3DSDK.Material.PHYSICAL ] ) {

		return new MeshStandardMaterial();

	}

	return new MeshPhongMaterial();

};

SEA3D.prototype.setBlending = function ( mat, blendMode ) {

	if ( blendMode === "normal" ) return;

	switch ( blendMode ) {

		case "add":

			mat.blending = AdditiveBlending;

			break;

		case "subtract":

			mat.blending = SubtractiveBlending;

			break;

		case "multiply":

			mat.blending = MultiplyBlending;

			break;

		case "screen":

			mat.blending = CustomBlending;
			mat.blendSrc = OneFactor;
			mat.blendDst = OneMinusSrcColorFactor;
			mat.blendEquation = AddEquation;

			break;

	}

	mat.transparent = true;

};

SEA3D.prototype.readMaterial = function ( sea ) {

	var mat = this.createMaterial( sea );
	mat.name = sea.name;

	mat.lights = sea.receiveLights;
	mat.fog = sea.receiveFog;

	mat.depthWrite = sea.depthWrite;
	mat.depthTest = sea.depthTest;

	mat.premultipliedAlpha = sea.premultipliedAlpha;

	mat.side = sea.doubleSided ? DoubleSide : FrontSide;

	this.setBlending( mat, sea.blendMode );

	for ( var i = 0; i < sea.technique.length; i ++ ) {

		var tech = sea.technique[ i ];

		if ( this.materialTechnique[ tech.kind ] ) {

			this.materialTechnique[ tech.kind ].call( this, mat, tech, sea );

		}

	}

	if ( this.materialTechnique.onComplete ) {

		this.materialTechnique.onComplete.call( this, mat, sea );

	}

	this.domain.materials = this.materials = this.materials || [];
	this.materials.push( this.objects[ "mat/" + sea.name ] = sea.tag = mat );

};

//
//	Point Light
//

SEA3D.prototype.readPointLight = function ( sea ) {

	var light = new SEA3D.PointLight( sea.color, sea.multiplier * this.config.multiplier );
	light.name = sea.name;

	if ( sea.attenuation ) {

		light.distance = sea.attenuation.end;

	}

	if ( sea.shadow ) this.setShadowMap( light );

	this.domain.lights = this.lights = this.lights || [];
	this.lights.push( this.objects[ "lht/" + sea.name ] = sea.tag = light );

	this.addSceneObject( sea );

	this.updateTransform( light, sea );

	this.addDefaultAnimation( sea, SEA3D.LightAnimator );

	this.updateScene();

};

//
//	Hemisphere Light
//

SEA3D.prototype.readHemisphereLight = function ( sea ) {

	var light = new HemisphereLight( sea.color, sea.secondColor, sea.multiplier * this.config.multiplier );
	light.position.set( 0, 500, 0 );
	light.name = sea.name;

	this.domain.lights = this.lights = this.lights || [];
	this.lights.push( this.objects[ "lht/" + sea.name ] = sea.tag = light );

	this.addSceneObject( sea );

	this.addDefaultAnimation( sea, SEA3D.LightAnimator );

	this.updateScene();

};

//
//	Ambient Light
//

SEA3D.prototype.readAmbientLight = function ( sea ) {

	var light = new AmbientLight( sea.color, sea.multiplier * this.config.multiplier );
	light.name = sea.name;

	this.domain.lights = this.lights = this.lights || [];
	this.lights.push( this.objects[ "lht/" + sea.name ] = sea.tag = light );

	this.addSceneObject( sea );

	this.addDefaultAnimation( sea, SEA3D.LightAnimator );

	this.updateScene();

};

//
//	Directional Light
//

SEA3D.prototype.readDirectionalLight = function ( sea ) {

	var light = new DirectionalLight( sea.color, sea.multiplier * this.config.multiplier );
	light.name = sea.name;

	if ( sea.shadow ) {

		this.setShadowMap( light );

	}

	this.domain.lights = this.lights = this.lights || [];
	this.lights.push( this.objects[ "lht/" + sea.name ] = sea.tag = light );

	this.addSceneObject( sea );

	this.updateTransform( light, sea );

	this.addDefaultAnimation( sea, SEA3D.LightAnimator );

	this.updateScene();

};

//
//	Camera
//

SEA3D.prototype.readCamera = function ( sea ) {

	var camera = new SEA3D.Camera( sea.fov );
	camera.name = sea.name;

	this.domain.cameras = this.cameras = this.cameras || [];
	this.cameras.push( this.objects[ "cam/" + sea.name ] = sea.tag = camera );

	this.addSceneObject( sea );
	this.updateTransform( camera, sea );

	this.addDefaultAnimation( sea, SEA3D.CameraAnimator );

};

//
//	Orthographic Camera
//

SEA3D.prototype.readOrthographicCamera = function ( sea ) {

	var aspect, width, height;

	var stageWidth = this.config.stageWidth !== undefined ? this.config.stageWidth : ( window ? window.innerWidth : 1024 );
	var stageHeight = this.config.stageHeight !== undefined ? this.config.stageHeight : ( window ? window.innerHeight : 1024 );

	if ( stageWidth > stageHeight ) {

		aspect = stageWidth / stageHeight;

		width = sea.height * aspect;
		height = sea.height;

	} else {

		aspect = stageHeight / stageWidth;

		width = sea.height;
		height = sea.height * aspect;

	}

	var camera = new SEA3D.OrthographicCamera( - width, width, height, - height );
	camera.name = sea.name;

	this.domain.cameras = this.cameras = this.cameras || [];
	this.cameras.push( this.objects[ "cam/" + sea.name ] = sea.tag = camera );

	this.addSceneObject( sea );
	this.updateTransform( camera, sea );

	this.addDefaultAnimation( sea, SEA3D.CameraAnimator );

};

//
//	Skeleton
//

SEA3D.prototype.getSkeletonFromBones = function ( bonesData ) {

	var bones = [], bone, gbone;
	var i, il;

	for ( i = 0, il = bonesData.length; i < il; i ++ ) {

		gbone = bonesData[ i ];

		bone = new Bone();
		bones.push( bone );

		bone.name = gbone.name;
		bone.position.fromArray( gbone.pos );
		bone.quaternion.fromArray( gbone.rotq );

		if ( gbone.scl !== undefined ) bone.scale.fromArray( gbone.scl );

	}

	for ( i = 0, il = bonesData.length; i < il; i ++ ) {

		gbone = bonesData[ i ];

		if ( ( gbone.parent !== - 1 ) && ( gbone.parent !== null ) && ( bones[ gbone.parent ] !== undefined ) ) {

			bones[ gbone.parent ].add( bones[ i ] );

		}

	}

	return new Skeleton( bones );

};

SEA3D.prototype.readSkeletonLocal = function ( sea ) {

	var bones = [];

	for ( var i = 0; i < sea.joint.length; i ++ ) {

		var bone = sea.joint[ i ];

		bones[ i ] = {
			name: bone.name,
			pos: [ bone.x, bone.y, bone.z ],
			rotq: [ bone.qx, bone.qy, bone.qz, bone.qw ],
			parent: bone.parentIndex
		};

	}

	this.domain.bones = this.bones = this.bones || [];
	this.bones.push( this.objects[ sea.name + '.sklq' ] = sea.tag = bones );

};

//
//	Joint Object
//

SEA3D.prototype.readJointObject = function ( sea ) {

	var mesh = sea.target.tag,
		bone = mesh.skeleton.bones[ sea.joint ];

	this.domain.joints = this.joints = this.joints || [];
	this.joints.push( this.objects[ "jnt/" + sea.name ] = sea.tag = bone );

};

//
//	Morph
//

SEA3D.prototype.readMorph = function ( sea ) {

	var attribs = { position: [] }, targets = [];

	for ( var i = 0; i < sea.node.length; i ++ ) {

		var node = sea.node[ i ];

		attribs.position[ i ] = new Float32BufferAttribute( node.vertex, 3 );
		attribs.position[ i ].name = node.name;

		if ( node.normal ) {

			attribs.normal = attribs.normal || [];
			attribs.normal[ i ] = new Float32BufferAttribute( node.normal, 3 );

		}

		targets[ i ] = { name: node.name };

	}

	sea.tag = {
		attribs: attribs,
		targets: targets
	};

};

//
//	Animation
//

SEA3D.prototype.readAnimation = function ( sea ) {

	var animations = [], delta = ( 1000 / sea.frameRate ) / 1000;

	for ( var i = 0; i < sea.sequence.length; i ++ ) {

		var seq = sea.sequence[ i ];

		var tracks = [];

		for ( var j = 0; j < sea.dataList.length; j ++ ) {

			var anm = sea.dataList[ j ],
				t, k, times, values,
				data = anm.data,
				start = seq.start * anm.blockSize,
				end = start + ( seq.count * anm.blockSize ),
				intrpl = seq.intrpl ? InterpolateLinear : false,
				name = null;

			switch ( anm.kind ) {

				case SEA3DSDK.Animation.POSITION:

					name = '.position';

					break;

				case SEA3DSDK.Animation.ROTATION:

					name = '.quaternion';

					break;

				case SEA3DSDK.Animation.SCALE:

					name = '.scale';

					break;

				case SEA3DSDK.Animation.COLOR:

					name = '.color';

					break;

				case SEA3DSDK.Animation.MULTIPLIER:

					name = '.intensity';

					break;

				case SEA3DSDK.Animation.FOV:

					name = '.fov';

					break;

				case SEA3DSDK.Animation.OFFSET_U:

					name = '.offset[x]';

					break;

				case SEA3DSDK.Animation.OFFSET_V:

					name = '.offset[y]';

					break;

				case SEA3DSDK.Animation.SCALE_U:

					name = '.repeat[x]';

					break;

				case SEA3DSDK.Animation.SCALE_V:

					name = '.repeat[y]';

					break;

				case SEA3DSDK.Animation.RADIAN:

					name = '.rotation';

					break;

				case SEA3DSDK.Animation.MORPH:

					name = '.morphTargetInfluences[' + anm.name + ']';

					break;

			}

			if ( ! name ) continue;

			switch ( anm.type ) {

				case SEA3DSDK.Stream.BYTE:
				case SEA3DSDK.Stream.UBYTE:
				case SEA3DSDK.Stream.INT:
				case SEA3DSDK.Stream.UINT:
				case SEA3DSDK.Stream.FLOAT:
				case SEA3DSDK.Stream.DOUBLE:
				case SEA3DSDK.Stream.DECIMAL:

					values = data.subarray( start, end );
					times = new Float32Array( values.length );
					t = 0;

					for ( k = 0; k < times.length; k ++ ) {

						times[ k ] = t;
						t += delta;

					}

					tracks.push( new NumberKeyframeTrack( name, times, values, intrpl ) );

					break;

				case SEA3DSDK.Stream.VECTOR3D:

					values = data.subarray( start, end );
					times = new Float32Array( values.length / anm.blockSize );
					t = 0;

					for ( k = 0; k < times.length; k ++ ) {

						times[ k ] = t;
						t += delta;

					}

					tracks.push( new VectorKeyframeTrack( name, times, values, intrpl ) );

					break;

				case SEA3DSDK.Stream.VECTOR4D:

					values = data.subarray( start, end );
					times = new Float32Array( values.length / anm.blockSize );
					t = 0;

					for ( k = 0; k < times.length; k ++ ) {

						times[ k ] = t;
						t += delta;

					}

					tracks.push( new QuaternionKeyframeTrack( name, times, values, intrpl ) );

					break;

				case SEA3DSDK.Stream.INT24:
				case SEA3DSDK.Stream.UINT24:

					values = new Float32Array( ( end - start ) * 3 );
					times = new Float32Array( values.length / 3 );
					t = 0;

					for ( k = 0; k < times.length; k ++ ) {

						values[ ( k * 3 ) ] = ( ( data[ k ] >> 16 ) & 0xFF ) / 255;
						values[ ( k * 3 ) + 1 ] = ( ( data[ k ] >> 8 ) & 0xFF ) / 255;
						values[ ( k * 3 ) + 2 ] = ( data[ k ] & 0xFF ) / 255;
						times[ k ] = t;
						t += delta;

					}

					tracks.push( new VectorKeyframeTrack( name, times, values, intrpl ) );//ColorKeyframeTrack

					break;

			}

		}

		animations.push( new SEA3D.AnimationClip( seq.name, - 1, tracks, seq.repeat ) );

	}

	this.domain.clips = this.clips = this.clips || [];
	this.clips.push( this.objects[ sea.name + '.anm' ] = sea.tag = animations );

};

//
//	Skeleton Animation
//

SEA3D.prototype.readSkeletonAnimation = function ( sea, skl ) {

	skl = ! skl && sea.metadata && sea.metadata.skeleton ? sea.metadata.skeleton : skl;

	if ( ! skl || sea.tag ) return sea.tag;

	var animations = [], delta = ( 1000 / sea.frameRate ) / 1000;

	for ( var i = 0; i < sea.sequence.length; i ++ ) {

		var seq = sea.sequence[ i ];

		var start = seq.start;
		var end = start + seq.count;

		var animation = {
			name: seq.name,
			fps: sea.frameRate,
			length: delta * seq.count,
			hierarchy: []
		};

		var numJoints = sea.numJoints,
			raw = sea.raw;

		for ( var j = 0; j < numJoints; j ++ ) {

			var bone = skl.joint[ j ],
				node = { parent: bone.parentIndex, keys: [] },
				keys = node.keys,
				time = 0;

			for ( var frame = start; frame < end; frame ++ ) {

				var idx = ( frame * numJoints * 7 ) + ( j * 7 );

				keys.push( {
					time: time,
					pos: [ raw[ idx ], raw[ idx + 1 ], raw[ idx + 2 ] ],
					rot: [ raw[ idx + 3 ], raw[ idx + 4 ], raw[ idx + 5 ], raw[ idx + 6 ] ],
					scl: [ 1, 1, 1 ]
				} );

				time += delta;

			}

			animation.hierarchy[ j ] = node;

		}

		animations.push( SEA3D.AnimationClip.fromClip( AnimationClip.parseAnimation( animation, skl.tag ), seq.repeat ) );

	}

	this.domain.clips = this.clips = this.clips || [];
	this.clips.push( this.objects[ sea.name + '.skla' ] = sea.tag = animations );

};

//
//	Vertex Animation
//

SEA3D.prototype.readVertexAnimation = function ( sea ) {

	var attribs = { position: [] }, targets = [], animations = [], i, j, l;

	for ( i = 0, l = sea.frame.length; i < l; i ++ ) {

		var frame = sea.frame[ i ];

		attribs.position[ i ] = new Float32BufferAttribute( frame.vertex, 3 );

		if ( frame.normal ) {

			attribs.normal = attribs.normal || [];
			attribs.normal[ i ] = new Float32BufferAttribute( frame.normal, 3 );

		}

		targets[ i ] = { name: i };

	}

	for ( i = 0; i < sea.sequence.length; i ++ ) {

		var seq = sea.sequence[ i ];
		var seqTargets = [];

		for ( j = 0; j < seq.count; j ++ ) {

			seqTargets[ j ] = targets[ seq.start + j ];

		}

		animations.push( SEA3D.AnimationClip.fromClip( AnimationClip.CreateFromMorphTargetSequence( seq.name, seqTargets, sea.frameRate, !seq.repeat ), seq.repeat ) );

	}

	sea.tag = {
		attribs: attribs,
		targets: targets,
		animations: animations
	};

	this.domain.clips = this.clips = this.clips || [];
	this.clips.push( this.objects[ sea.name + '.vtxa' ] = sea.tag );

};

//
//	Selector
//

SEA3D.prototype.getModifier = function ( req ) {

	var sea = req.sea;

	switch ( sea.type ) {

		case SEA3DSDK.SkeletonAnimation.prototype.type:

			this.readSkeletonAnimation( sea, req.skeleton );

			break;

		case SEA3DSDK.Animation.prototype.type:
		case SEA3DSDK.MorphAnimation.prototype.type:
		case SEA3DSDK.UVWAnimation.prototype.type:

			this.readAnimation( sea );

			break;

		case SEA3DSDK.Morph.prototype.type:

			this.readMorph( sea, req.geometry );

			break;

	}

	return sea.tag;

};

//
//	Actions
//

SEA3D.prototype.applyEnvironment = function ( envMap ) {

	for ( var j = 0, l = this.materials.length; j < l; ++ j ) {

		var mat = this.materials[ j ];

		if ( mat instanceof MeshStandardMaterial ) {

			if ( mat.envMap ) continue;

			mat.envMap = envMap;
			mat.envMap.mapping = CubeReflectionMapping;

			mat.needsUpdate = true;

		}

	}

};

SEA3D.prototype.readActions = function ( sea ) {

	for ( var i = 0; i < sea.actions.length; i ++ ) {

		var act = sea.actions[ i ];

		switch ( act.kind ) {

			case SEA3DSDK.Actions.ATTRIBUTES:

				this.attribs = this.domain.attribs = act.attributes.tag;

				break;

			case SEA3DSDK.Actions.SCRIPTS:

				this.domain.scripts = this.getJSMList( this.domain, act.scripts );

				if ( this.config.scripts && this.config.runScripts ) this.domain.runJSMList( this.domain );

				break;

			case SEA3DSDK.Actions.CAMERA:

				this.domain.camera = this.camera = act.camera.tag;

				break;

			case SEA3DSDK.Actions.ENVIRONMENT_COLOR:

				this.domain.background = this.background = this.background || {};

				this.background.color = new Color( act.color );

				break;

			case SEA3DSDK.Actions.ENVIRONMENT:

				this.domain.background = this.background = this.background || {};

				this.background.texture = act.texture.tag;

				if ( this.config.useEnvironment && this.materials != undefined ) {

					this.applyEnvironment( act.texture.tag );

				}

				break;

		}

	}

};

//
//	Properties
//

SEA3D.prototype.updatePropertiesAssets = function ( sea, props ) {

	for ( var name in props ) {

		switch ( props.__type[ name ] ) {

			case SEA3DSDK.Stream.ASSET:

				if ( ! props.__asset ) props.__asset = {};
				if ( ! props.__asset[ name ] ) props.__asset[ name ] = props[ name ];

				props[ name ] = props.__asset[ name ].tag;

				break;

			case SEA3DSDK.Stream.GROUP:

				props[ name ] = this.updatePropertiesAssets( sea, props[ name ] );

				break;

		}

	}

	return props;

};

SEA3D.prototype.readProperties = function ( sea ) {

	var props = this.updatePropertiesAssets( sea, sea.props );

	this.domain.properties = this.properties = this.properties || [];
	this.properties.push( this.objects[ "prop/" + sea.name ] = sea.tag = props );

};

SEA3D.prototype.readFileInfo = function ( sea ) {

	this.domain.info = this.updatePropertiesAssets( sea, sea.info );

};

//
//	Events
//

SEA3D.Event = {
	PROGRESS: "sea3d_progress",
	LOAD_PROGRESS: "sea3d_load",
	DOWNLOAD_PROGRESS: "sea3d_download",
	COMPLETE: "sea3d_complete",
	OBJECT_COMPLETE: "sea3d_object",
	PARSE_PROGRESS: "parse_progress",
	PARSE_COMPLETE: "parse_complete",
	ERROR: "sea3d_error"
};

SEA3D.prototype.onProgress = function ( e ) {

	e.status = e.type;
	e.progress = e.loaded / e.total;
	e.type = SEA3D.Event.PROGRESS;

	this.dispatchEvent( e );

};

SEA3D.prototype.onLoadProgress = function ( e ) {

	e.type = SEA3D.Event.LOAD_PROGRESS;
	this.dispatchEvent( e );

	this.onProgress( e );

};

SEA3D.prototype.onDownloadProgress = function ( e ) {

	e.type = SEA3D.Event.DOWNLOAD_PROGRESS;
	this.dispatchEvent( e );

	this.onProgress( e );

};

SEA3D.prototype.onComplete = function ( e ) {

	e.type = SEA3D.Event.COMPLETE;
	this.dispatchEvent( e );

};

SEA3D.prototype.onCompleteObject = function ( e ) {

	e.type = SEA3D.Event.OBJECT_COMPLETE;
	this.dispatchEvent( e );

};

SEA3D.prototype.onParseProgress = function ( e ) {

	e.type = SEA3D.Event.PARSE_PROGRESS;
	this.dispatchEvent( e );

};

SEA3D.prototype.onParseComplete = function ( e ) {

	e.type = SEA3D.Event.PARSE_COMPLETE;
	this.dispatchEvent( e );

};

SEA3D.prototype.onError = function ( e ) {

	e.type = SEA3D.Event.ERROR;
	this.dispatchEvent( e );

};

//
//	Loader
//

SEA3D.prototype.createDomain = function () {

	return this.domain = new SEA3D.Domain(
		this.config.id,
		this.objects = {},
		this.config.container
	);

};

SEA3D.prototype.clone = function ( config, onParseComplete, onParseProgress ) {

	if ( ! this.file.isDone() ) throw new Error( "Previous parse is not completed." );

	this.config.container = config && config.container !== undefined ? config.container : new Object3D();

	if ( config ) this.loadConfig( config );

	var timeLimit = this.config.timeLimit;

	this.config.timeLimit = config && config.timeLimit !== undefined ? config.timeLimit : Infinity;

	this.parse( onParseComplete, onParseProgress );

	this.config.timeLimit = timeLimit;

	return this.domain;

};

SEA3D.prototype.loadConfig = function ( config ) {

	for ( var name in config ) {

		this.config[ name ] = config[ name ];

	}

};

SEA3D.prototype.parse = function ( onParseComplete, onParseProgress ) {

	delete this.cameras;
	delete this.containers;
	delete this.lights;
	delete this.joints;
	delete this.meshes;
	delete this.materials;
	delete this.sprites;
	delete this.sounds3d;
	delete this.cubeRenderers;
	delete this.sounds;
	delete this.glsl;
	delete this.dummy;
	delete this.camera;
	delete this.background;
	delete this.properties;
	delete this.scriptTargets;

	delete this.domain;

	this.createDomain();

	this.setTypeRead();

	this.file.onParseComplete = ( function ( e ) {

		if ( this.config.manager ) this.config.manager.add( this.domain );

		( onParseComplete || this.onParseComplete ).call( this, e );

	} ).bind( this );

	this.file.onParseProgress = onParseProgress || this.onParseProgress;

	// EXTENSIONS

	var i = SEA3D.EXTENSIONS_LOADER.length;

	while ( i -- ) {

		var loader = SEA3D.EXTENSIONS_LOADER[ i ];

		if ( loader.parse ) loader.parse.call( this );

	}

	this.file.parse();

	return this.domain;

};

SEA3D.prototype.onHead = function ( args ) {

	if ( args.sign != 'TJS' ) {

		throw new Error( "Sign '" + args.sign + "' not supported! Use SEA3D Studio to publish or SEA3DLegacy.js" );

	}

};

SEA3D.EXTENSIONS_LOADER = [];
SEA3D.EXTENSIONS_DOMAIN = [];

SEA3D.prototype.setTypeRead = function () {

	this.file.typeRead = {};

	this.file.typeRead[ SEA3DSDK.Geometry.prototype.type ] = this.readGeometryBuffer;
	this.file.typeRead[ SEA3DSDK.Mesh.prototype.type ] = this.readMesh;
	this.file.typeRead[ SEA3DSDK.Sprite.prototype.type ] = this.readSprite;
	this.file.typeRead[ SEA3DSDK.Container3D.prototype.type ] = this.readContainer3D;
	this.file.typeRead[ SEA3DSDK.Line.prototype.type ] = this.readLine;
	this.file.typeRead[ SEA3DSDK.Material.prototype.type ] = this.readMaterial;
	this.file.typeRead[ SEA3DSDK.Camera.prototype.type ] = this.readCamera;
	this.file.typeRead[ SEA3DSDK.OrthographicCamera.prototype.type ] = this.readOrthographicCamera;
	this.file.typeRead[ SEA3DSDK.SkeletonLocal.prototype.type ] = this.readSkeletonLocal;
	this.file.typeRead[ SEA3DSDK.SkeletonAnimation.prototype.type ] = this.readSkeletonAnimation;
	this.file.typeRead[ SEA3DSDK.JointObject.prototype.type ] = this.readJointObject;
	this.file.typeRead[ SEA3DSDK.CubeMap.prototype.type ] = this.readCubeMap;
	this.file.typeRead[ SEA3DSDK.CubeRender.prototype.type ] = this.readCubeRender;
	this.file.typeRead[ SEA3DSDK.Animation.prototype.type ] =
	this.file.typeRead[ SEA3DSDK.MorphAnimation.prototype.type ] =
	this.file.typeRead[ SEA3DSDK.UVWAnimation.prototype.type ] = this.readAnimation;
	this.file.typeRead[ SEA3DSDK.SoundPoint.prototype.type ] = this.readSoundPoint;
	this.file.typeRead[ SEA3DSDK.TextureURL.prototype.type ] = this.readTextureURL;
	this.file.typeRead[ SEA3DSDK.CubeMapURL.prototype.type ] = this.readCubeMapURL;
	this.file.typeRead[ SEA3DSDK.AssetUpdate.prototype.type ] = this.readAssetUpdate;
	this.file.typeRead[ SEA3DSDK.Morph.prototype.type ] = this.readMorph;
	this.file.typeRead[ SEA3DSDK.VertexAnimation.prototype.type ] = this.readVertexAnimation;
	this.file.typeRead[ SEA3DSDK.Actions.prototype.type ] = this.readActions;
	this.file.typeRead[ SEA3DSDK.FileInfo.prototype.type ] = this.readFileInfo;
	this.file.typeRead[ SEA3DSDK.Properties.prototype.type ] = this.readProperties;

	if ( this.config.dummys ) {

		this.file.typeRead[ SEA3DSDK.Dummy.prototype.type ] = this.readDummy;

	}

	if ( this.config.scripts ) {

		this.file.typeRead[ SEA3DSDK.ScriptURL.prototype.type ] = this.readScriptURL;
		this.file.typeRead[ SEA3DSDK.JavaScriptMethod.prototype.type ] = this.readJavaScriptMethod;

	}

	if ( this.config.lights ) {

		this.file.typeRead[ SEA3DSDK.PointLight.prototype.type ] = this.readPointLight;
		this.file.typeRead[ SEA3DSDK.DirectionalLight.prototype.type ] = this.readDirectionalLight;
		this.file.typeRead[ SEA3DSDK.HemisphereLight.prototype.type ] = this.readHemisphereLight;
		this.file.typeRead[ SEA3DSDK.AmbientLight.prototype.type ] = this.readAmbientLight;

	}

	// UNIVERSAL

	this.file.typeRead[ SEA3DSDK.JPEG.prototype.type ] =
	this.file.typeRead[ SEA3DSDK.JPEG_XR.prototype.type ] =
	this.file.typeRead[ SEA3DSDK.PNG.prototype.type ] =
	this.file.typeRead[ SEA3DSDK.GIF.prototype.type ] = this.readTexture;
	this.file.typeRead[ SEA3DSDK.MP3.prototype.type ] = this.readSound;
	this.file.typeRead[ SEA3DSDK.GLSL.prototype.type ] = this.readGLSL;

	// EXTENSIONS

	var i = SEA3D.EXTENSIONS_LOADER.length;

	while ( i -- ) {

		var loader = SEA3D.EXTENSIONS_LOADER[ i ];

		if ( loader.setTypeRead ) loader.setTypeRead.call( this );

	}

};

SEA3D.prototype.load = function ( data ) {

	this.file = new SEA3DSDK.File();
	this.file.scope = this;
	this.file.config = this.config;
	this.file.onProgress = this.onLoadProgress.bind( this );
	this.file.onCompleteObject = this.onCompleteObject.bind( this );
	this.file.onDownloadProgress = this.onDownloadProgress.bind( this );
	this.file.onParseProgress = this.onParseProgress.bind( this );
	this.file.onParseComplete = this.onParseComplete.bind( this );
	this.file.onError = this.onError.bind( this );
	this.file.onHead = this.onHead.bind( this );

	this.file.onComplete = ( function ( e ) {

		if ( this.config.manager ) this.config.manager.add( this.domain );

		this.onComplete.call( this, e );

	} ).bind( this );

	// SEA3D

	this.createDomain();

	this.setTypeRead();

	if ( data === undefined ) return;

	if ( typeof data === "string" ) this.file.load( data );
	else this.file.read( data );

};

export { SEA3D };
