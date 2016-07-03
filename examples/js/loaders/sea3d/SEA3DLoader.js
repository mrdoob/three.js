/**
 * 	SEA3D for Three.JS
 * 	@author Sunag / http://www.sunag.com.br/
 */

'use strict';

//
//	SEA3D
//

THREE.SEA3D = function( config ) {

	this.config = {
		id : "",
		scripts : true,
		runScripts : true,
		autoPlay : false,
		dummys : true,
		multiplier : 1,
		bounding : true,
		audioRolloffFactor : 10,
		lights : true,
		useVertexTexture : true,
		forceStatic : false,
		streaming : true,
		timeLimit : 10,
		stageWidth : window ? window.innerWidth : 1024,
		stageHeight : window ? window.innerHeight : 1024
	};

	if ( config ) this.loadConfig( config );

};

THREE.SEA3D.prototype = {

	constructor: THREE.SEA3D,

	set container ( val ) {

		this.config.container = val;

	},

	get container () {

		return this.config.container;

	}

};

Object.assign( THREE.SEA3D.prototype, THREE.EventDispatcher.prototype );

//
//	Defaults
//

THREE.SEA3D.BACKGROUND_COLOR = 0x333333;
THREE.SEA3D.HELPER_COLOR = 0x9AB9E5;
THREE.SEA3D.RTT_SIZE = 512;

//
//	Domain
//

THREE.SEA3D.Domain = function( id, objects, container ) {

	this.id = id;
	this.objects = objects;
	this.container = container;

	this.scripts = [];
	this.global = {};

	this.scriptTargets = [];

	this.events = new THREE.EventDispatcher();

};

THREE.SEA3D.Domain.prototype = {
	constructor: THREE.SEA3D.Domain,

	add : function( src ) {

		this.scripts.push( src );

	},

	remove : function( src ) {

		this.scripts.splice( this.scripts.indexOf( src ), 1 );

	},

	contains : function( src ) {

		return this.scripts.indexOf( src ) != - 1;

	},

	addEvent : function( type, listener ) {

		this.events.addEventListener( type, listener );

	},

	hasEvent : function( type, listener ) {

		return this.events.hasEventListener( type, listener );

	},

	removeEvent : function( type, listener ) {

		this.events.removeEventListener( type, listener );

	},

	print : function() {

		console.log.apply( console, arguments );

	},

	watch : function() {

		console.log.apply( console, 'watch:', arguments );

	},

	runScripts : function() {

		for ( var i = 0; i < this.scriptTargets.length; i ++ ) {

			this.runJSMList( this.scriptTargets[ i ] );

		}

	},

	runJSMList : function( target ) {

		var scripts = target.scripts;

		for ( var i = 0; i < scripts.length; i ++ ) {

			this.runJSM( target, scripts[ i ] );

		}

		return scripts;

	},

	runJSM : function( target, script ) {

		if ( target.local == undefined ) target.local = {};

		var include = {
			print : this.print,
			watch : this.watch,
			sea3d : this,
			scene : this.container,
			source : new THREE.SEA3D.ScriptDomain( this, target instanceof THREE.SEA3D.Domain )
		};

		Object.freeze( include.source );

		THREE.SEA3D.ScriptHandler.add( include.source );

		try {

			this.methods[ script.method ] (
				include,
				this.getReference,
				this.global,
				target.local,
				target,
				script.params
			);

		}
		catch ( e ) {

			console.error( 'SEA3D JavaScript: Error running method "' + script.method + '".' );
			console.error( e );

		}

	},

	getReference : function( ns ) {

		return eval( ns );

	},

	disposeList : function( list ) {

		if ( ! list || ! list.length ) return;

		list = list.concat();

		var i = list.length;

		while ( i -- ) list[ i ].dispose();

	},

	dispatchEvent : function( event ) {

		event.domain = this;

		var scripts = this.scripts.concat(),
			i = scripts.length;

		while ( i -- ) {

			scripts[ i ].dispatchEvent( event );

		}

		this.events.dispatchEvent( event );

	},

	dispose : function() {

		this.disposeList( this.scripts );

		while ( this.container.children.length ) {

			this.container.remove( this.container.children[ 0 ] );

		}

		var i = THREE.SEA3D.EXTENSIONS_DOMAIN.length;

		while ( i -- ) {

			var domain = THREE.SEA3D.EXTENSIONS_DOMAIN[ i ];

			if ( domain.dispose ) domain.dispose.call( this );

		}

		this.disposeList( this.materials );
		this.disposeList( this.dummys );

		this.dispatchEvent( { type : "dispose" } );

	}
};

//
//	Domain Manager
//

THREE.SEA3D.DomainManager = function( autoDisposeRootDomain ) {

	this.domains = [];
	this.autoDisposeRootDomain = autoDisposeRootDomain == undefined ? true : false;

};

THREE.SEA3D.DomainManager.prototype = {
	constructor: THREE.SEA3D.DomainManager,

	onDisposeDomain : function( e ) {

		this.remove( e.domain );

		if ( this.autoDisposeRootDomain && this.domains.length == 1 ) {

			this.dispose();

		}

	},

	add : function( domain ) {

		this._onDisposeDomain = this._onDisposeDomain || this.onDisposeDomain.bind( this );

		domain.on( "dispose", this._onDisposeDomain );

		this.domains.push( domain );

		this.textures = this.textures || domain.textures;
		this.cubemaps = this.cubemaps || domain.cubemaps;
		this.geometries = this.geometries || domain.geometries;

	},

	remove : function( domain ) {

		domain.removeEvent( "dispose", this._onDisposeDomain );

		this.domains.splice( this.domains.indexOf( domain ), 1 );

	},

	contains : function( domain ) {

		return this.domains.indexOf( domain ) != - 1;

	},

	disposeList : function( list ) {

		if ( ! list || ! list.length ) return;

		list = list.concat();

		var i = list.length;

		while ( i -- ) list[ i ].dispose();

	},

	dispose : function() {

		this.disposeList( this.domains );
		this.disposeList( this.textures );
		this.disposeList( this.cubemaps );
		this.disposeList( this.geometries );

	}
};

//
//	Script
//

THREE.SEA3D.ScriptDomain = function( domain, root ) {

	domain = domain || new THREE.SEA3D.Domain();
	domain.add( this );

	var events = new THREE.EventDispatcher();

	this.getId = function() {

		return domain.id;

	}

	this.isRoot = function() {

		return root;

	}

	this.addEvent = function( type, listener ) {

		events.addEventListener( type, listener );

	}

	this.hasEvent = function( type, listener ) {

		return events.hasEventListener( type, listener );

	}

	this.removeEvent = function( type, listener ) {

		events.removeEventListener( type, listener );

	}

	this.dispatchEvent = function( event ) {

		event.script = this;

		events.dispatchEvent( event );

	}

	this.dispose = function() {

		domain.remove( this );

		if ( root ) domain.dispose();

		this.dispatchEvent( { type : "dispose" } );

	}

};

//
//	Script Manager
//

THREE.SEA3D.ScriptManager = function() {

	this.scripts = [];

	var onDisposeScript = ( function( e ) {

		this.remove( e.script );

	} ).bind( this );

	this.add = function( src ) {

		src.addEvent( "dispose", onDisposeScript );

		this.scripts.push( src );

	}

	this.remove = function( src ) {

		src.removeEvent( "dispose", onDisposeScript );

		this.scripts.splice( this.scripts.indexOf( src ), 1 );

	}

	this.contains = function( src ) {

		return this.scripts.indexOf( src ) > - 1;

	}

	this.dispatchEvent = function( event ) {

		var scripts = this.scripts.concat(),
			i = scripts.length;

		while ( i -- ) {

			scripts[ i ].dispatchEvent( event );

		}

	}

};

//
//	Script Handler
//

THREE.SEA3D.ScriptHandler = new THREE.SEA3D.ScriptManager();

THREE.SEA3D.ScriptHandler.dispatchUpdate = function( delta ) {

	this.dispatchEvent( {
		type : "update",
		delta : delta
	} );

};

//
//	Animator
//

THREE.SEA3D.Animator = function( clips, mixer ) {

	this.clips = clips;

	this.updateAnimations( mixer );

};

THREE.SEA3D.Animator.prototype.update = function( dt ) {

	this.mixer.update( dt || 0 );

	if ( this.currentAnimationAction.paused ) {

		this.pause();

		if ( this.currentAnimationData.onComplete ) this.currentAnimationData.onComplete( this );

	}

	return this;

};

THREE.SEA3D.Animator.prototype.updateAnimations = function( mixer ) {

	if ( this.playing ) this.stop();

	if ( this.mixer ) THREE.SEA3D.AnimationHandler.removeAnimator( this );

	this.mixer = mixer;

	this.relative = false;
	this.playing = false;

	this.timeScale = 1;

	this.animations = [];
	this.animationsData = {};

	this.clips = this instanceof THREE.SEA3D.Animator ? this.clips : this.geometry.animations;

	for ( var i = 0, clips = this.clips; i < clips.length; i ++ ) {

		var name = clips[ i ].name;

		this.animations[ name ] = this.animations[ i ] = clips[ i ];
		this.animationsData[ name ] = this.animationsData[ i ] = {};

	}

};

THREE.SEA3D.Animator.prototype.getStateByName = function( name ) {

	return this.animations.indexOf( this.animations[ name ] );

};

THREE.SEA3D.Animator.prototype.getStateNameByIndex = function( index ) {

	return this.animations[ index ].name;

};

THREE.SEA3D.Animator.prototype.pause = function() {

	if ( this.playing && this.currentAnimation ) {

		THREE.SEA3D.AnimationHandler.removeAnimator( this );

		this.playing = false;

	}

};

THREE.SEA3D.Animator.prototype.resume = function() {

	if ( ! this.playing && this.currentAnimation ) {

		THREE.SEA3D.AnimationHandler.addAnimator( this );

		this.playing = true;

	}

	return this;

};

THREE.SEA3D.Animator.prototype.setTimeScale = function( val ) {

	this.timeScale = val;

	if ( this.currentAnimationAction ) this.updateTimeScale();

};

THREE.SEA3D.Animator.prototype.getTimeScale = function() {

	return this.timeScale;

};

THREE.SEA3D.Animator.prototype.updateTimeScale = function() {

	this.mixer.timeScale = this.timeScale * ( this.currentAnimation ? this.currentAnimation.timeScale : 1 );

};

THREE.SEA3D.Animator.prototype.play = function( name, crossfade, offset, weight ) {

	var animation = this.animations[ name ];

	if ( animation == this.currentAnimation ) {

		if ( offset !== undefined || ! animation.loop ) this.currentAnimationAction.time = offset !== undefined ? offset : 
			( this.mixer.timeScale >= 0 ? 0 : this.currentAnimation.duration );

		this.currentAnimationAction.setEffectiveWeight( weight !== undefined ? weight : 1 );
		this.currentAnimationAction.paused = false;

		return this.resume();

	} else {

		if ( ! animation ) throw new Error( 'Animation "' + name + '" not found.' );

		this.previousAnimation = this.currentAnimation;
		this.currentAnimation = animation;

		this.previousAnimationAction = this.currentAnimationAction;
		this.currentAnimationAction = this.mixer.clipAction( animation ).setLoop( animation.loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity ).reset();
		this.currentAnimationAction.clampWhenFinished = ! animation.loop;
		this.currentAnimationAction.paused = false;

		this.previousAnimationData = this.currentAnimationData;
		this.currentAnimationData = this.animationsData[ name ];

		this.updateTimeScale();

		if ( offset !== undefined || ! animation.loop ) this.currentAnimationAction.time = offset !== undefined ? offset : 
			( this.mixer.timeScale >= 0 ? 0 : this.currentAnimation.duration );

		this.currentAnimationAction.setEffectiveWeight( weight !== undefined ? weight : 1 );

		this.currentAnimationAction.play();

		if ( ! this.playing ) this.mixer.update( 0 );

		this.playing = true;

		if ( this.previousAnimation ) this.previousAnimationAction.crossFadeTo( this.currentAnimationAction, crossfade || 0, true );

		THREE.SEA3D.AnimationHandler.addAnimator( this );

	}

	return this;

};

THREE.SEA3D.Animator.prototype.stop = function() {

	if ( this.currentAnimation ) {

		this.currentAnimationAction.stop();

		THREE.SEA3D.AnimationHandler.removeAnimator( this );

		this.previousAnimation = this.currentAnimation;
		this.previousAnimationData = this.currentAnimationData;
		this.previousAnimationAction = this.currentAnimationAction;

		delete this.currentAnimationAction;
		delete this.currentAnimationData;
		delete this.currentAnimation;

		this.playing = false;

	}

	return this;

};

THREE.SEA3D.Animator.prototype.setRelative = function( val ) {

	if ( this.relative == val ) return;

	this.stop();

	this.relative = val;

};

THREE.SEA3D.Animator.prototype.getRelative = function() {

	return this.relative;

};

//
//	Object3D Animator
//

THREE.SEA3D.Object3DAnimator = function( clips, object3d ) {

	this.object3d = object3d;

	THREE.SEA3D.Animator.call( this, clips, new THREE.AnimationMixer( object3d ) );

};

THREE.SEA3D.Object3DAnimator.prototype = Object.create( THREE.SEA3D.Animator.prototype );
THREE.SEA3D.Object3DAnimator.prototype.constructor = THREE.SEA3D.Object3DAnimator;

THREE.SEA3D.Object3DAnimator.prototype.stop = function() {

	if ( this.currentAnimation ) {

		var animate = this.object3d.animate;

		if ( animate && this instanceof THREE.SEA3D.Object3DAnimator ) {

			animate.position.set( 0, 0, 0 );
			animate.quaternion.set( 0, 0, 0, 1 );
			animate.scale.set( 1, 1, 1 );

		}

	}

	THREE.SEA3D.Animator.prototype.stop.call( this );

};

THREE.SEA3D.Object3DAnimator.prototype.setRelative = function( val ) {

	THREE.SEA3D.Animator.prototype.setRelative.call( this, val );

	this.object3d.setAnimator( this.relative );

	this.updateAnimations( new THREE.AnimationMixer( this.relative ? this.object3d.animate : this.object3d ) );

};

//
//	Camera Animator
//

THREE.SEA3D.CameraAnimator = function( clips, object3d ) {

	THREE.SEA3D.Object3DAnimator.call( this, clips, object3d );

};

THREE.SEA3D.CameraAnimator.prototype = Object.create( THREE.SEA3D.Object3DAnimator.prototype );
THREE.SEA3D.CameraAnimator.prototype.constructor = THREE.SEA3D.CameraAnimator;

//
//	Sound Animator
//

THREE.SEA3D.SoundAnimator = function( clips, object3d ) {

	THREE.SEA3D.Object3DAnimator.call( this, clips, object3d );

};

THREE.SEA3D.SoundAnimator.prototype = Object.create( THREE.SEA3D.Object3DAnimator.prototype );
THREE.SEA3D.SoundAnimator.prototype.constructor = THREE.SEA3D.SoundAnimator;


//
//	Light Animator
//

THREE.SEA3D.LightAnimator = function( clips, object3d ) {

	THREE.SEA3D.Object3DAnimator.call( this, clips, object3d );

};

THREE.SEA3D.LightAnimator.prototype = Object.create( THREE.SEA3D.Object3DAnimator.prototype );
THREE.SEA3D.LightAnimator.prototype.constructor = THREE.SEA3D.LightAnimator;

//
//	Container
//

THREE.SEA3D.Object3D = function( ) {

	THREE.Object3D.call( this );

};

THREE.SEA3D.Object3D.prototype = Object.create( THREE.Object3D.prototype );
THREE.SEA3D.Object3D.prototype.constructor = THREE.SEA3D.Object3D;

// Relative Animation Extension ( Only used if relative animation is enabled )
// TODO: It can be done with shader

THREE.SEA3D.Object3D.prototype.updateAnimateMatrix = function( force ) {

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

};

THREE.SEA3D.Object3D.prototype.setAnimator = function( val ) {

	if ( this.getAnimator() == val )
		return;

	if ( val ) {

		this.animate = new THREE.Object3D();

		this.updateMatrixWorld = THREE.SEA3D.Object3D.prototype.updateAnimateMatrix;

	} else {

		delete this.animate;

		this.updateMatrixWorld = THREE.Object3D.prototype.updateMatrixWorld;

	}

	this.matrixWorldNeedsUpdate = true;

};

THREE.SEA3D.Object3D.prototype.getAnimator = function() {

	return this.animate != undefined;

};

//
//	Dummy
//

THREE.SEA3D.Dummy = function( width, height, depth ) {

	this.width = width != undefined ? width : 100;
	this.height = height != undefined ? height : 100;
	this.depth = depth != undefined ? depth : 100;

	var geo = new THREE.BoxGeometry( this.width, this.height, this.depth, 1, 1, 1 );

	THREE.Mesh.call( this, geo, THREE.SEA3D.Dummy.MATERIAL );

};

THREE.SEA3D.Dummy.prototype = Object.create( THREE.Mesh.prototype );
THREE.SEA3D.Dummy.prototype.constructor = THREE.SEA3D.Dummy;

Object.assign( THREE.SEA3D.Dummy.prototype, THREE.SEA3D.Object3D.prototype );

THREE.SEA3D.Dummy.MATERIAL = new THREE.MeshBasicMaterial( { wireframe: true, color: THREE.SEA3D.HELPER_COLOR } );

THREE.SEA3D.Dummy.prototype.copy = function( source ) {

	THREE.Mesh.prototype.copy.call( this, source );

	this.props = source.props;
	this.scripts = source.scripts;

	if ( this.animator ) this.animator = source.animator.clone( this );

	return this;

};

THREE.SEA3D.Dummy.prototype.dispose = function() {

	this.geometry.dispose();

};

//
//	Mesh
//

THREE.SEA3D.Mesh = function( geometry, material ) {

	THREE.Mesh.call( this, geometry, material );

};

THREE.SEA3D.Mesh.prototype = Object.create( THREE.Mesh.prototype );
THREE.SEA3D.Mesh.prototype.constructor = THREE.SEA3D.Mesh;

Object.assign( THREE.SEA3D.Mesh.prototype, THREE.SEA3D.Object3D.prototype );

THREE.SEA3D.Mesh.prototype.setWeight = function( name, val ) {

	this.morphTargetInfluences[ this.morphTargetDictionary[ name ] ] = val;

};

THREE.SEA3D.Mesh.prototype.getWeight = function( name ) {

	return this.morphTargetInfluences[ this.morphTargetDictionary[ name ] ];

};

THREE.SEA3D.Mesh.prototype.copy = function( source ) {

	THREE.Mesh.prototype.copy.call( this, source );

	this.props = source.props;
	this.scripts = source.scripts;

	if ( this.animator ) this.animator = source.animator.clone( this );

	return this;

};

//
//	Skinning
//

THREE.SEA3D.SkinnedMesh = function( geometry, material, useVertexTexture ) {

	THREE.SkinnedMesh.call( this, geometry, material, useVertexTexture );

	this.updateAnimations( new THREE.AnimationMixer( this ) );

};

THREE.SEA3D.SkinnedMesh.prototype = Object.create( THREE.SkinnedMesh.prototype );
THREE.SEA3D.SkinnedMesh.prototype.constructor = THREE.SEA3D.SkinnedMesh;

Object.assign( THREE.SEA3D.SkinnedMesh.prototype, THREE.SEA3D.Mesh.prototype, THREE.SEA3D.Animator.prototype );

THREE.SEA3D.SkinnedMesh.prototype.boneByName = function( name ) {

	var bones = this.skeleton.bones;

	for ( var i = 0, bl = bones.length; i < bl; i ++ ) {

		if ( name == bones[ i ].name )
			return bones[ i ];

	}

};

THREE.SEA3D.SkinnedMesh.prototype.copy = function( source ) {

	THREE.SkinnedMesh.prototype.copy.call( this, source );

	this.props = source.props;
	this.scripts = source.scripts;

	if ( this.animator ) this.animator = source.animator.clone( this );

	return this;

};

//
//	Vertex Animation
//

THREE.SEA3D.VertexAnimationMesh = function( geometry, material ) {

	THREE.Mesh.call( this, geometry, material );

	this.type = 'MorphAnimMesh';

	this.updateAnimations( new THREE.AnimationMixer( this ) );

};

THREE.SEA3D.VertexAnimationMesh.prototype = Object.create( THREE.Mesh.prototype );
THREE.SEA3D.VertexAnimationMesh.prototype.constructor = THREE.SEA3D.VertexAnimationMesh;

Object.assign( THREE.SEA3D.VertexAnimationMesh.prototype, THREE.SEA3D.Mesh.prototype, THREE.SEA3D.Animator.prototype );

THREE.SEA3D.VertexAnimationMesh.prototype.copy = function( source ) {

	THREE.Mesh.prototype.copy.call( this, source );

	this.props = source.props;
	this.scripts = source.scripts;

	if ( this.animator ) this.animator = source.animator.clone( this );

	return this;

};

//
//	Camera
//

THREE.SEA3D.Camera = function( fov, aspect, near, far ) {

	THREE.PerspectiveCamera.call( this, fov, aspect, near, far );

};

THREE.SEA3D.Camera.prototype = Object.create( THREE.PerspectiveCamera.prototype );
THREE.SEA3D.Camera.prototype.constructor = THREE.SEA3D.Camera;

Object.assign( THREE.SEA3D.Camera.prototype, THREE.SEA3D.Object3D.prototype );

THREE.SEA3D.Camera.prototype.copy = function( source ) {

	THREE.PerspectiveCamera.prototype.copy.call( this, source );

	this.props = source.props;
	this.scripts = source.scripts;

	if ( this.animator ) this.animator = source.animator.clone( this );

	return this;

};

//
//	Orthographic Camera
//

THREE.SEA3D.OrthographicCamera = function( left, right, top, bottom, near, far ) {

	THREE.OrthographicCamera.call( this, left, right, top, bottom, near, far );

};

THREE.SEA3D.OrthographicCamera.prototype = Object.create( THREE.OrthographicCamera.prototype );
THREE.SEA3D.OrthographicCamera.prototype.constructor = THREE.SEA3D.OrthographicCamera;

Object.assign( THREE.SEA3D.OrthographicCamera.prototype, THREE.SEA3D.Object3D.prototype );

THREE.SEA3D.OrthographicCamera.prototype.copy = function( source ) {

	THREE.OrthographicCamera.prototype.copy.call( this, source );

	this.props = source.props;
	this.scripts = source.scripts;

	if ( this.animator ) this.animator = source.animator.clone( this );

	return this;

};

//
//	PointLight
//

THREE.SEA3D.PointLight = function( hex, intensity, distance, decay ) {

	THREE.PointLight.call( this, hex, intensity, distance, decay );

};

THREE.SEA3D.PointLight.prototype = Object.create( THREE.PointLight.prototype );
THREE.SEA3D.PointLight.prototype.constructor = THREE.SEA3D.PointLight;

Object.assign( THREE.SEA3D.PointLight.prototype, THREE.SEA3D.Object3D.prototype );

THREE.SEA3D.PointLight.prototype.copy = function( source ) {

	THREE.PointLight.prototype.copy.call( this, source );

	this.props = source.props;
	this.scripts = source.scripts;

	if ( this.animator ) this.animator = source.animator.clone( this );

	return this;

};

//
//	Animation Handler
//

THREE.SEA3D.AnimationHandler = {

	animators : [],

	update : function( dt ) {

		var i = 0;

		while ( i < this.animators.length ) {

			this.animators[ i ++ ].update( dt );

		}

	},

	addAnimator : function( animator ) {

		var index = this.animators.indexOf( animator );

		if ( index === - 1 ) this.animators.push( animator );

	},

	removeAnimator : function( animator ) {

		var index = this.animators.indexOf( animator );

		if ( index !== - 1 ) this.animators.splice( index, 1 );

	}

};

//
//	Config
//

THREE.SEA3D.MTXBUF = new THREE.Matrix4();
THREE.SEA3D.VECBUF = new THREE.Vector3();
THREE.SEA3D.QUABUF = new THREE.Quaternion();

THREE.SEA3D.prototype.setShadowMap = function( light ) {

	light.shadow.mapSize.width = 2048
	light.shadow.mapSize.height = 1024;

	light.castShadow = true;

	light.shadow.camera.left = - 200; // CHANGED
	light.shadow.camera.right = 200; // CHANGED
	light.shadow.camera.top = 200; // CHANGED
	light.shadow.camera.bottom = - 200; // CHANGED

	light.shadow.camera.near = 1;
	light.shadow.camera.far = 3000;
	light.shadow.camera.fov = 45;

	light.shadow.bias = - 0.001;

};

//
//	Output
//

THREE.SEA3D.Domain.prototype.getMesh = THREE.SEA3D.prototype.getMesh = function( name ) {

	return this.objects[ "m3d/" + name ];

};

THREE.SEA3D.Domain.prototype.getDummy = THREE.SEA3D.prototype.getDummy = function( name ) {

	return this.objects[ "dmy/" + name ];

};

THREE.SEA3D.Domain.prototype.getLine = THREE.SEA3D.prototype.getLine = function( name ) {

	return this.objects[ "line/" + name ];

};

THREE.SEA3D.Domain.prototype.getSound3D = THREE.SEA3D.prototype.getSound3D = function( name ) {

	return this.objects[ "sn3d/" + name ];

};

THREE.SEA3D.Domain.prototype.getMaterial = THREE.SEA3D.prototype.getMaterial = function( name ) {

	return this.objects[ "mat/" + name ];

};

THREE.SEA3D.Domain.prototype.getLight = THREE.SEA3D.prototype.getLight = function( name ) {

	return this.objects[ "lht/" + name ];

};

THREE.SEA3D.Domain.prototype.getGLSL = THREE.SEA3D.prototype.getGLSL = function( name ) {

	return this.objects[ "glsl/" + name ];

};

THREE.SEA3D.Domain.prototype.getCamera = THREE.SEA3D.prototype.getCamera = function( name ) {

	return this.objects[ "cam/" + name ];

};

THREE.SEA3D.Domain.prototype.getTexture = THREE.SEA3D.prototype.getTexture = function( name ) {

	return this.objects[ "tex/" + name ];

};

THREE.SEA3D.Domain.prototype.getCubeMap = THREE.SEA3D.prototype.getCubeMap = function( name ) {

	return this.objects[ "cmap/" + name ];

};

THREE.SEA3D.Domain.prototype.getJointObject = THREE.SEA3D.prototype.getJointObject = function( name ) {

	return this.objects[ "jnt/" + name ];

};

THREE.SEA3D.Domain.prototype.getContainer3D = THREE.SEA3D.prototype.getContainer3D = function( name ) {

	return this.objects[ "c3d/" + name ];

};

THREE.SEA3D.Domain.prototype.getSprite = THREE.SEA3D.prototype.getSprite = function( name ) {

	return this.objects[ "m2d/" + name ];

};

THREE.SEA3D.Domain.prototype.getProperties = THREE.SEA3D.prototype.getProperties = function( name ) {

	return this.objects[ "prop/" + name ];

};

//
//	Utils
//

THREE.SEA3D.prototype.isPowerOfTwo = function( num ) {

	return num ? ( ( num & - num ) == num ) : false;

};

THREE.SEA3D.prototype.nearestPowerOfTwo = function( num ) {

	return Math.pow( 2, Math.round( Math.log( num ) / Math.LN2 ) );

};

THREE.SEA3D.prototype.updateTransform = function( obj3d, sea ) {

	var mtx = THREE.SEA3D.MTXBUF, vec = THREE.SEA3D.VECBUF;

	if ( sea.transform ) mtx.elements.set( sea.transform );
	else mtx.makeTranslation( sea.position.x, sea.position.y, sea.position.z );

	// matrix

	obj3d.position.setFromMatrixPosition( mtx );
	obj3d.scale.setFromMatrixScale( mtx );

	// ignore rotation scale

	mtx.scale( vec.set( 1 / obj3d.scale.x, 1 / obj3d.scale.y, 1 / obj3d.scale.z ) );
	obj3d.rotation.setFromRotationMatrix( mtx );

	// optimize if is static

	if ( this.config.forceStatic || sea.isStatic ) {

		obj3d.updateMatrix();
		obj3d.matrixAutoUpdate = false;

	}

};

THREE.SEA3D.prototype.toVector3 = function( data ) {

	return new THREE.Vector3( data.x, data.y, data.z );

};

THREE.SEA3D.prototype.updateScene = function() {

	if ( this.materials != undefined ) {

		for ( var i = 0, l = this.materials.length; i < l; ++ i ) {

			this.materials[ i ].needsUpdate = true;

		}

	}

};

THREE.SEA3D.prototype.addSceneObject = function( sea ) {

	var obj3d = sea.tag;

	obj3d.visible = sea.visible;

	if ( sea.parent ) sea.parent.tag.add( obj3d );
	else if ( this.config.container ) this.config.container.add( obj3d );

	if ( sea.properties ) obj3d.props = sea.properties.tag;

	if ( sea.scripts ) {

		obj3d.scripts = this.getJSMList( obj3d, sea.scripts );

		if ( this.config.runScripts ) this.domain.runJSMList( obj3d );

	}

};

THREE.SEA3D.prototype.createObjectURL = function( raw, mime ) {

	return ( window.URL || window.webkitURL ).createObjectURL( new Blob( [ raw ], { type: mime } ) );

};

THREE.SEA3D.prototype.bufferToTexture = function( raw ) {

	return this.createObjectURL( raw, "image" );

};

THREE.SEA3D.prototype.bufferToSound = function( raw ) {

	return this.createObjectURL( raw, "audio" );

};

THREE.SEA3D.prototype.applyDefaultAnimation = function( sea, animatorClass ) {

	var obj = sea.tag;

	for ( var i = 0, count = sea.animations ? sea.animations.length : 0; i < count; i ++ ) {

		var anm = sea.animations[ i ];

		switch ( anm.tag.type ) {
			case SEA3D.Animation.prototype.type:
				obj.animator = new animatorClass( anm.tag.tag, obj );
				obj.animator.setRelative( anm.relative );

				if ( this.config.autoPlay ) {

					obj.animator.play( 0 );

				}

				return obj.animator;
				break;
		}

	}

};

//
//	Animation
//

THREE.SEA3D.prototype.readAnimation = function( sea ) {

	var clips = [],
		delta = ( 1000 / sea.frameRate ) / 1000;

	for ( var i = 0; i < sea.sequence.length; i ++ ) {

		var seq = sea.sequence[ i ];

		var tracks = [];

		for ( var j = 0; j < sea.dataList.length; j ++ ) {

			var anm = sea.dataList[ j ],
				t, times,
				data = anm.data,
				start = seq.start * anm.blockSize,
				end = start + ( seq.count * anm.blockSize ),
				intrpl = seq.intrpl ? THREE.InterpolateLinear : false,
				name = null;

			switch ( anm.kind ) {
				case SEA3D.Animation.POSITION:
					name = '.position';
					break;

				case SEA3D.Animation.ROTATION:
					name = '.quaternion';
					break;

				case SEA3D.Animation.SCALE:
					name = '.scale';
					break;

				case SEA3D.Animation.COLOR:
					name = '.color';
					break;

				case SEA3D.Animation.MULTIPLIER:
					name = '.intensity';
					break;

				case SEA3D.Animation.FOV:
					name = '.fov';
					break;
			}

			if ( ! name ) continue;

			switch ( anm.type ) {
				case SEA3D.Stream.BYTE:
				case SEA3D.Stream.UBYTE:
				case SEA3D.Stream.INT:
				case SEA3D.Stream.UINT:
				case SEA3D.Stream.FLOAT:
				case SEA3D.Stream.DOUBLE:
				case SEA3D.Stream.DECIMAL:

					var values = data.subarray( start, end );
					var times = new Float32Array( values.length );

					for ( var k = 0, t = 0; k < times.length; k ++ ) {

						times[ k ] = t;
						t += delta;

					}

					tracks.push( new THREE.VectorKeyframeTrack( name, times, values, intrpl ) );

					break;

				case SEA3D.Stream.VECTOR3D:

					var values = data.subarray( start, end );
					var times = new Float32Array( values.length / anm.blockSize );

					for ( var k = 0, t = 0; k < times.length; k ++ ) {

						times[ k ] = t;
						t += delta;

					}

					tracks.push( new THREE.VectorKeyframeTrack( name, times, values, intrpl ) );

					break;

				case SEA3D.Stream.VECTOR4D:

					var values = data.subarray( start, end );
					var times = new Float32Array( values.length / anm.blockSize );

					for ( var k = 0, t = 0; k < times.length; k ++ ) {

						times[ k ] = t;
						t += delta;

					}

					tracks.push( new THREE.QuaternionKeyframeTrack( name, times, values, intrpl ) );

					break;

				case SEA3D.Stream.INT24:
				case SEA3D.Stream.UINT24:

					var values = new Float32Array( ( end - start ) * 3 );
					var times = new Float32Array( values.length / 3 );

					for ( var k = 0, t = 0; k < times.length; k ++ ) {

						values[ ( k * 3 ) ] = ( ( data[ k ] >> 16 ) & 0xFF ) / 255;
						values[ ( k * 3 ) + 1 ] = ( ( data[ k ] >> 8 ) & 0xFF ) / 255;
						values[ ( k * 3 ) + 2 ] = ( data[ k ] & 0xFF ) / 255;
						times[ k ] = t;
						t += delta;

					}

					tracks.push( new THREE.VectorKeyframeTrack( name, times, values, intrpl ) );//ColorKeyframeTrack

					break;
			}

		}

		var clip = new THREE.AnimationClip( seq.name, - 1, tracks );
		clip.loop = seq.repeat;
		clip.timeScale = 1;

		clips.push( clip );

	}

	this.domain.animationClips = this.animationClips = this.animationClips || [];
	this.animationClips.push( this.objects[ sea.name + '.#anm' ] = sea.tag = clips );

};

//
//	Geometry
//

THREE.SEA3D.prototype.readGeometryBuffer = function( sea ) {

	var	geo = new THREE.BufferGeometry();

	for ( var i = 0; i < sea.groups.length; i ++ ) {

		var g = sea.groups[ i ];

		geo.addGroup( g.start, g.count, i );

	}

	geo.setIndex( new THREE.BufferAttribute( sea.indexes, 1 ) );
	geo.addAttribute( 'position', new THREE.BufferAttribute( sea.vertex, 3 ) );

	if ( sea.uv ) {

		geo.addAttribute( 'uv', new THREE.BufferAttribute( sea.uv[ 0 ], 2 ) );
		if ( sea.uv.length > 1 ) geo.addAttribute( 'uv2', new THREE.BufferAttribute( sea.uv[ 1 ], 2 ) );

	}

	if ( sea.normal ) geo.addAttribute( 'normal', new THREE.BufferAttribute( sea.normal, 3 ) );
	else geo.computeVertexNormals();

	if ( sea.tangent4 ) geo.addAttribute( 'tangent', new THREE.BufferAttribute( sea.tangent4, 4 ) );

	if ( sea.color ) geo.addAttribute( 'color', new THREE.BufferAttribute( sea.color[ 0 ], sea.numColor ) );

	if ( sea.joint ) {

		geo.addAttribute( 'skinIndex', new THREE.Float32Attribute( sea.joint, sea.jointPerVertex ) );
		geo.addAttribute( 'skinWeight', new THREE.Float32Attribute( sea.weight, sea.jointPerVertex ) );

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

THREE.SEA3D.prototype.readDummy = function( sea ) {

	var dummy = new THREE.SEA3D.Dummy( sea.width, sea.height, sea.depth );
	dummy.name = sea.name;

	this.domain.dummys = this.dummys = this.dummys || [];
	this.dummys.push( this.objects[ "dmy/" + sea.name ] = sea.tag = dummy );

	this.addSceneObject( sea );
	this.updateTransform( dummy, sea );

	this.applyDefaultAnimation( sea, THREE.SEA3D.Object3DAnimator );

};

//
//	Line
//

THREE.SEA3D.prototype.readLine = function( sea ) {

	var	geo = new THREE.BufferGeometry();

	if ( sea.closed )
		sea.vertex.push( sea.vertex[ 0 ], sea.vertex[ 1 ], sea.vertex[ 2 ] );

	geo.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( sea.vertex ), 3 ) );

	var line = new THREE.Line( geo, new THREE.LineBasicMaterial( { color: THREE.SEA3D.HELPER_COLOR, linewidth: 3 } ) );
	line.name = sea.name;

	this.lines = this.lines || [];
	this.lines.push( this.objects[ "line/" + sea.name ] = sea.tag = line );

	this.addSceneObject( sea );
	this.updateTransform( line, sea );

	this.applyDefaultAnimation( sea, THREE.SEA3D.Object3DAnimator );

};

//
//	Container3D
//

THREE.SEA3D.prototype.readContainer3D = function( sea ) {

	var container = new THREE.SEA3D.Object3D();

	this.domain.containers = this.containers = this.containers || [];
	this.containers.push( this.objects[ "c3d/" + sea.name ] = sea.tag = container );

	this.addSceneObject( sea );
	this.updateTransform( container, sea );

	this.applyDefaultAnimation( sea, THREE.SEA3D.Object3DAnimator );

};

//
//	Sprite
//

THREE.SEA3D.prototype.readSprite = function( sea ) {

	var mat;

	if ( sea.material ) {

		if ( ! sea.material.tag.sprite ) {

			mat = sea.material.tag.sprite = new THREE.SpriteMaterial();

			this.setBlending( mat, sea.blendMode );

			mat.map = sea.material.tag.map;
			mat.map.flipY = true;

			mat.color.set( sea.material.tag.color );
			mat.opacity = sea.material.tag.opacity;
			mat.blending = sea.material.tag.blending;
			mat.fog = sea.material.receiveFog;

		}
		else mat = sea.material.tag.sprite;

	}

	var sprite = new THREE.Sprite( mat );
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

THREE.SEA3D.prototype.readMesh = function( sea ) {

	var i, count, geo = sea.geometry.tag,
		mesh, mat, skeleton, skeletonAnimation, vertexAnimation, morpher;

	for ( i = 0, count = sea.modifiers ? sea.modifiers.length : 0; i < count; i ++ ) {

		var mod = sea.modifiers[ i ];

		switch ( mod.type ) {
			case SEA3D.Skeleton.prototype.type:
			case SEA3D.SkeletonLocal.prototype.type:
				skeleton = mod;

				geo.bones = skeleton.tag;
				break;

			case SEA3D.Morph.prototype.type:
				morpher = mod;

				geo.morphAttributes = morpher.tag.attribs;
				geo.morphTargets = morpher.tag.targets;
				break;
		}

	}

	for ( i = 0, count = sea.animations ? sea.animations.length : 0; i < count; i ++ ) {

		var anm = sea.animations[ i ];

		switch ( anm.tag.type ) {
			case SEA3D.SkeletonAnimation.prototype.type:
				skeletonAnimation = anm.tag;

				geo.animations = this.getSkeletonAnimation( skeletonAnimation, skeleton );
				break;

			case SEA3D.VertexAnimation.prototype.type:
				vertexAnimation = anm.tag;

				geo.morphAttributes = vertexAnimation.tag.attribs;
				geo.morphTargets = vertexAnimation.tag.targets;
				geo.animations = vertexAnimation.tag.animations;
				break;
		}

	}

	var uMorph = morpher != undefined || vertexAnimation != undefined,
		uMorphNormal =
					( morpher && morpher.tag.attribs.normal != undefined ) ||
					( vertexAnimation && vertexAnimation.tag.attribs.normal != undefined );

	if ( sea.material ) {

		if ( sea.material.length > 1 ) {

			var mats = [];

			for ( i = 0; i < sea.material.length; i ++ ) {

				mats[ i ] = sea.material[ i ].tag;

				mats[ i ].skinning = skeleton != undefined;
				mats[ i ].morphTargets = uMorph;
				mats[ i ].morphNormals = uMorphNormal;
				mats[ i ].vertexColors = sea.geometry.color ? THREE.VertexColors : THREE.NoColors;

			}

			mat = new THREE.MultiMaterial( mats );

		} else {

			mat = sea.material[ 0 ].tag;

			mat.skinning = skeleton != undefined;
			mat.morphTargets = uMorph;
			mat.morphNormals = uMorphNormal;
			mat.vertexColors = sea.geometry.color ? THREE.VertexColors : THREE.NoColors;

		}

	}

	if ( skeleton ) {

		mesh = new THREE.SEA3D.SkinnedMesh( geo, mat, this.config.useVertexTexture );

		if ( this.config.autoPlay && skeletonAnimation ) {

			mesh.play( 0 );

		}

	} else if ( vertexAnimation ) {

		mesh = new THREE.SEA3D.VertexAnimationMesh( geo, mat, vertexAnimation.frameRate );

		if ( this.config.autoPlay ) {

			mesh.play( 0 );

		}

	} else {

		mesh = new THREE.SEA3D.Mesh( geo, mat );

	}

	mesh.name = sea.name;

	mesh.castShadow = sea.castShadows;
	mesh.receiveShadow = sea.material ? sea.material[ 0 ].receiveShadows : true;

	this.domain.meshes = this.meshes = this.meshes || [];
	this.meshes.push( this.objects[ "m3d/" + sea.name ] = sea.tag = mesh );

	this.addSceneObject( sea );
	this.updateTransform( mesh, sea );

	this.applyDefaultAnimation( sea, THREE.SEA3D.Object3DAnimator );

};

//
//	Sound Point
//

THREE.SEA3D.prototype.readSoundPoint = function( sea ) {

	if ( ! this.audioListener ) {

		 this.audioListener = new THREE.AudioListener();

		 if ( this.config.container ) {

			this.config.container.add( this.audioListener );

		}

	}

	var sound3d = new THREE.SEA3D.PointSound( this.audioListener );

	new THREE.AudioLoader().load( sea.sound.tag, function( buffer ) {

		sound3d.setBuffer( buffer );

	} );

	sound3d.autoplay = sea.autoPlay;
	sound3d.setLoop( sea.autoPlay );
	sound3d.setVolume( sea.volume );
	sound3d.setRefDistance( sea.distance );
	sound3d.setRolloffFactor( this.config.audioRolloffFactor );

	sound3d.name = sea.name;

	this.domain.sounds3d = this.sounds3d = this.sounds3d || [];
	this.sounds3d.push( this.objects[ "sn3d/" + sea.name ] = sea.tag = sound3d );

	this.addSceneObject( sea );
	this.updateTransform( sound3d, sea );

	this.applyDefaultAnimation( sea, THREE.SEA3D.SoundAnimator );

};

//
//	Cube Render
//

THREE.SEA3D.prototype.readCubeRender = function( sea ) {

	var cube = new THREE.CubeCamera( 0.1, 5000, THREE.SEA3D.RTT_SIZE );
	cube.renderTarget.cubeCamera = cube;

	this.domain.cubeRenderers = this.cubeRenderers = this.cubeRenderers || [];
	this.cubeRenderers.push( this.objects[ "rttc/" + sea.name ] = sea.tag = cube.renderTarget );

	this.addSceneObject( sea );
	this.updateTransform( cube, sea );

	this.applyDefaultAnimation( sea, THREE.SEA3D.Object3DAnimator );

};

//
//	Images (WDP, JPEG, PNG and GIF)
//

THREE.SEA3D.prototype.readImage = function( sea ) {

	var image = new Image(), texture = new THREE.Texture();

	texture.name = sea.name;
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	texture.flipY = false;
	texture.image = image;

	image.onload = function() {

		texture.needsUpdate = true;

	};
	image.src = this.bufferToTexture( sea.data.buffer );

	this.domain.textures = this.textures = this.textures || [];
	this.textures.push( this.objects[ "tex/" + sea.name ] = sea.tag = texture );

};

//
//	Cube Map
//

THREE.SEA3D.prototype.readCubeMap = function( sea ) {

	var images = [],
		texture = new THREE.CubeTexture();

	// xyz(- / +) to xyz(+ / -) sequence
	var faces = [];

	faces[ 0 ] = sea.faces[ 1 ];
	faces[ 1 ] = sea.faces[ 0 ];
	faces[ 2 ] = sea.faces[ 3 ];
	faces[ 3 ] = sea.faces[ 2 ];
	faces[ 4 ] = sea.faces[ 5 ];
	faces[ 5 ] = sea.faces[ 4 ];

	images.loadedCount = 0;

	texture.name = sea.name;
	texture.image = images;
	texture.flipY = false;

	for ( var i = 0, il = faces.length; i < il; ++ i ) {

		var cubeImage = new Image();

		images[ i ] = cubeImage;

		cubeImage.onload = function() {

			if ( ++ images.loadedCount == 6 ) {

				texture.needsUpdate = true;

			}

		}

		cubeImage.src = this.bufferToTexture( faces[ i ].buffer );

	}

	this.domain.cubemaps = this.cubemaps = this.cubemaps || [];
	this.cubemaps.push( this.objects[ "cmap/" + sea.name ] = sea.tag = texture );

};

//
//	Sound (MP3, OGG)
//

THREE.SEA3D.prototype.readSound = function( sea ) {

	var sound = this.bufferToSound( sea.data.buffer );

	this.domain.sounds = this.sounds = this.sounds || [];
	this.sounds.push( this.objects[ "snd/" + sea.name ] = sea.tag = sound );

};

//
//	Texture URL
//

THREE.SEA3D.prototype.readTextureURL = function( sea ) {

	var texture = new THREE.TextureLoader().load( sea.url );

	texture.name = sea.name;
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	texture.flipY = false;

	this.domain.textures = this.textures = this.textures || [];
	this.textures.push( this.objects[ "tex/" + sea.name ] = sea.tag = texture );

};

//
//	Runtime
//

THREE.SEA3D.prototype.getJSMList = function( target, scripts ) {

	var scriptTarget = [];

	for ( var i = 0; i < scripts.length; i ++ ) {

		var script = scripts[ i ];

		if ( script.tag.type == SEA3D.JavaScriptMethod.prototype.type ) {

			scriptTarget.push( script );

		}

	}

	this.domain.scriptTargets = this.scriptTargets = this.scriptTargets || [];
	this.scriptTargets.push( target );

	return scriptTarget;

};

THREE.SEA3D.prototype.readJavaScriptMethod = function( sea ) {

	try {

		var src =
			'(function() {\n' +
			'var $METHOD = {}\n';

		var declare =
			'function($INC, $REF, global, local, $his, $PARAM) {\n' +
			'var watch = $INC["watch"],\n' +
			'scene = $INC["scene"],\n' +
			'sea3d = $INC["sea3d"],\n' +
			'print = $INC["print"];\n';

		declare +=
			'var $SRC = $INC["source"],\n' +
			'addEvent = $SRC.addEvent.bind( $SRC ),\n' +
			'hasEvent = $SRC.hasEvent.bind( $SRC ),\n' +
			'dispatchEvent = $SRC.dispatchEvent.bind( $SRC ),\n' +
			'removeEvent = $SRC.removeEvent.bind( $SRC ),\n' +
			'dispose = $SRC.dispose.bind( $SRC );\n'

		for ( var name in sea.methods ) {

			src += '$METHOD["' + name + '"] = ' + declare + sea.methods[ name ].src + '}\n';

		}

		src += 'return $METHOD; })'

		this.domain.methods = eval( src )();

	}
	catch ( e ) {

		console.error( 'SEA3D JavaScriptMethod: Error running "' + sea.name + '".' );
		console.error( e );

	}

};

//
//	GLSL
//

THREE.SEA3D.prototype.readGLSL = function( sea ) {

	this.domain.glsl = this.glsl = this.glsl || [];
	this.glsl.push( this.objects[ "glsl/" + sea.name ] = sea.tag = sea.src );

};

//
//	Material
//

THREE.SEA3D.prototype.materialTechnique =
( function() {

	var techniques = {}

	// FINAL
	techniques.onComplete = function( mat, sea ) {

		if ( sea.alpha < 1 || mat.blending > THREE.NormalBlending ) {

			mat.opacity = sea.alpha;
			mat.transparent = true;

		}

	};

	// PHYSICAL
	techniques[ SEA3D.Material.PHYSICAL ] =
	function( mat, tech ) {

		mat.color.setHex( tech.color );
		mat.roughness = tech.roughness;
		mat.metalness = tech.metalness;

	};

	// PHONG
	techniques[ SEA3D.Material.PHONG ] =
	function( mat, tech ) {

		mat.color.setHex( tech.diffuseColor );
		mat.specular.setHex( tech.specularColor ).multiplyScalar( tech.specular );
		mat.shininess = tech.gloss;

	};

	// DIFFUSE_MAP
	techniques[ SEA3D.Material.DIFFUSE_MAP ] =
	function( mat, tech, sea ) {

		mat.map = tech.texture.tag;
		mat.color.setHex( 0xFFFFFF );

		if ( tech.texture.transparent ) {

			mat.transparent = true;
			mat.alphaTest = sea.alphaThreshold;

		}

	};

	// ROUGHNESS_MAP
	techniques[ SEA3D.Material.ROUGHNESS_MAP ] =
	function( mat, tech ) {

		mat.roughnessMap = tech.texture.tag;

	};

	// METALNESS_MAP
	techniques[ SEA3D.Material.METALNESS_MAP ] =
	function( mat, tech ) {

		mat.metalnessMap = tech.texture.tag;

	};

	// SPECULAR_MAP
	techniques[ SEA3D.Material.SPECULAR_MAP ] =
	function( mat, tech ) {

		if ( mat.specular ) {

			mat.specularMap = tech.texture.tag;
			mat.specular.setHex( 0xFFFFFF );

		}

	};

	// NORMAL_MAP
	techniques[ SEA3D.Material.NORMAL_MAP ] =
	function( mat, tech ) {

		mat.normalMap = tech.texture.tag;

	};

	// REFLECTION
	techniques[ SEA3D.Material.REFLECTION ] =
	techniques[ SEA3D.Material.FRESNEL_REFLECTION ] =
	function( mat, tech ) {

		mat.envMap = tech.texture.tag;
		mat.envMap.mapping = THREE.CubeReflectionMapping;
		mat.combine = THREE.MixOperation;

		mat.reflectivity = tech.alpha;

	};

	// REFLECTION_SPHERICAL
	techniques[ SEA3D.Material.REFLECTION_SPHERICAL ] =
	function( mat, tech ) {

		mat.envMap = tech.texture.tag;
		mat.envMap.mapping = THREE.SphericalReflectionMapping;
		mat.combine = THREE.MixOperation;

		mat.reflectivity = tech.alpha;

	};

	// REFRACTION
	techniques[ SEA3D.Material.REFRACTION_MAP ] =
	function( mat, tech ) {

		mat.envMap = tech.texture.tag;
		mat.envMap.mapping = THREE.CubeRefractionMapping();

		mat.refractionRatio = tech.ior;
		mat.reflectivity = tech.alpha;

	};

	// LIGHT_MAP
	techniques[ SEA3D.Material.LIGHT_MAP ] =
	function( mat, tech ) {

		if ( tech.blendMode == "multiply" ) mat.aoMap = tech.texture.tag;
		else mat.lightMap = tech.texture.tag;

	};

	return techniques;

} )();

THREE.SEA3D.prototype.createMaterial = function( sea ) {

	return sea.physical ? new THREE.MeshStandardMaterial() : new THREE.MeshPhongMaterial();

};

THREE.SEA3D.prototype.setBlending = function( mat, blendMode ) {

	if ( blendMode == "normal" ) return;

	switch ( blendMode ) {

		case "add":
			mat.blending = THREE.AdditiveBlending;
			break;

		case "subtract":
			mat.blending = THREE.SubtractiveBlending;
			break;

		case "multiply":
			mat.blending = THREE.MultiplyBlending;
			break;

		case "screen":
			mat.blending = THREE.CustomBlending;
			mat.blendSrc = THREE.OneFactor;
			mat.blendDst = THREE.OneMinusSrcColorFactor;
			mat.blendEquation = THREE.AddEquation;
			break;

	}

};

THREE.SEA3D.prototype.readMaterial = function( sea ) {

	var mat = this.createMaterial( sea );
	mat.name = sea.name;

	mat.side = sea.bothSides ? THREE.DoubleSide : THREE.FrontSide;
	mat.shading = sea.smooth ? THREE.SmoothShading : THREE.FlatShading;

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

THREE.SEA3D.prototype.readPointLight = function( sea ) {

	var light = new THREE.SEA3D.PointLight( sea.color, sea.multiplier * this.config.multiplier );
	light.name = sea.name;

	if ( sea.attenuation ) {

		light.distance = sea.attenuation.end;

	}

	if ( sea.shadow ) this.setShadowMap( light );

	this.domain.lights = this.lights = this.lights || [];
	this.lights.push( this.objects[ "lht/" + sea.name ] = sea.tag = light );

	this.addSceneObject( sea );

	this.updateTransform( light, sea );

	this.applyDefaultAnimation( sea, THREE.SEA3D.LightAnimator );

	this.updateScene();

};

//
//	Hemisphere Light
//

THREE.SEA3D.prototype.readHemisphereLight = function( sea ) {

	var light = new THREE.HemisphereLight( sea.color, sea.secondColor, sea.multiplier * this.config.multiplier );
	light.name = sea.name;

	this.domain.lights = this.lights = this.lights || [];
	this.lights.push( this.objects[ "lht/" + sea.name ] = sea.tag = light );

	this.addSceneObject( sea );

	this.applyDefaultAnimation( sea, THREE.SEA3D.LightAnimator );

	this.updateScene();

};

//
//	Ambient Light
//

THREE.SEA3D.prototype.readAmbientLight = function( sea ) {

	var light = new THREE.AmbientLight( sea.color, sea.multiplier * this.config.multiplier );
	light.name = sea.name;

	this.domain.lights = this.lights = this.lights || [];
	this.lights.push( this.objects[ "lht/" + sea.name ] = sea.tag = light );

	this.addSceneObject( sea );

	this.applyDefaultAnimation( sea, THREE.SEA3D.LightAnimator );

	this.updateScene();

};

//
//	Directional Light
//

THREE.SEA3D.prototype.readDirectionalLight = function( sea ) {

	var light = new THREE.DirectionalLight( sea.color, sea.multiplier * this.config.multiplier );
	light.name = sea.name;

	if ( sea.shadow ) {

		this.setShadowMap( light );

	}

	this.domain.lights = this.lights = this.lights || [];
	this.lights.push( this.objects[ "lht/" + sea.name ] = sea.tag = light );

	this.addSceneObject( sea );

	this.updateTransform( light, sea );

	this.applyDefaultAnimation( sea, THREE.SEA3D.LightAnimator );

	this.updateScene();

};

//
//	Point Sound
//

THREE.SEA3D.PointSound = function( listener ) {

	THREE.PositionalAudio.call( this, listener );

};

THREE.SEA3D.PointSound.prototype = Object.create( THREE.PositionalAudio.prototype );
THREE.SEA3D.PointSound.prototype.constructor = THREE.SEA3D.PointSound;

Object.assign( THREE.SEA3D.PointSound.prototype, THREE.SEA3D.Object3D.prototype );

THREE.SEA3D.PointSound.prototype.copy = function( source ) {

	THREE.PositionalAudio.prototype.copy.call( this, source );

	this.props = source.props;
	this.scripts = source.scripts;

	if ( this.animator ) this.animator = source.animator.clone( this );

	return this;

};

//
//	Camera
//

THREE.SEA3D.prototype.readCamera = function( sea ) {

	var camera = new THREE.SEA3D.Camera( sea.fov );
	camera.name = sea.name;

	this.domain.cameras = this.cameras = this.cameras || [];
	this.cameras.push( this.objects[ "cam/" + sea.name ] = sea.tag = camera );

	this.addSceneObject( sea );
	this.updateTransform( camera, sea );

	this.applyDefaultAnimation( sea, THREE.SEA3D.CameraAnimator );

};

//
//	Orthographic Camera
//

THREE.SEA3D.prototype.readOrthographicCamera = function( sea ) {

	var aspect, width, height;

	if ( this.config.stageWidth > this.config.stageHeight ) {

		aspect = this.config.stageWidth / this.config.stageHeight;

		width = sea.height * aspect;
		height = sea.height;

	} else {

		aspect = this.config.stageHeight / this.config.stageWidth;

		width = sea.height;
		height = sea.height * aspect;

	}

	var camera = new THREE.SEA3D.OrthographicCamera( - width, width, height, - height );
	camera.name = sea.name;

	this.domain.cameras = this.cameras = this.cameras || [];
	this.cameras.push( this.objects[ "cam/" + sea.name ] = sea.tag = camera );

	this.addSceneObject( sea );
	this.updateTransform( camera, sea );

	this.applyDefaultAnimation( sea, THREE.SEA3D.CameraAnimator );

};

//
//	Skeleton
//

THREE.SEA3D.prototype.readSkeletonLocal = function( sea ) {

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

	sea.tag = bones;

};

//
//	Joint Object
//

THREE.SEA3D.prototype.readJointObject = function( sea ) {

	var mesh = sea.target.tag,
		bone = mesh.skeleton.bones[ sea.joint ];

	this.domain.joints = this.joints = this.joints || [];
	this.joints.push( this.objects[ "jnt/" + sea.name ] = sea.tag = bone );

};

//
//	Morpher
//

THREE.SEA3D.prototype.readMorpher = function( sea ) {

	var attribs = {
			position : []
		},
		targets = [];

	for ( var i = 0; i < sea.node.length; i ++ ) {

		var node = sea.node[ i ];

		attribs.position[ i ] = new THREE.Float32Attribute( new Float32Array( node.vertex ), 3 );

		if ( node.normal ) {

			attribs.normal = attribs.normal || [];
			attribs.normal[ i ] = new THREE.Float32Attribute( new Float32Array( node.normal ), 3 );

		}

		targets[ i ] = { name: node.name };

	}

	sea.tag = {
		attribs : attribs,
		targets : targets
	};

};

//
//	Skeleton Animation
//

THREE.SEA3D.prototype.getSkeletonAnimation = function( sea, skl ) {

	if ( sea.tag ) return sea.tag;

	var animations = [],
		delta = ( 1000 / sea.frameRate ) / 1000;

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

		var anm = THREE.AnimationClip.parseAnimation( animation, skl.tag );
		anm.loop = seq.repeat;
		anm.timeScale = 1;

		animations.push( anm );

	}

	return sea.tag = animations;

};

//
//	Vertex Animation
//

THREE.SEA3D.prototype.readVertexAnimation = function( sea ) {

	var attribs = {
			position : []
		},
		targets = [],
		animations = [],
		i, j, l;

	for ( i = 0, l = sea.frame.length; i < l; i ++ ) {

		var frame = sea.frame[ i ];

		attribs.position[ i ] = new THREE.Float32Attribute( new Float32Array( frame.vertex ), 3 );

		if ( frame.normal ) {

			attribs.normal = attribs.normal || [];
			attribs.normal[ i ] = new THREE.Float32Attribute( new Float32Array( frame.normal ), 3 );

		}

		targets[ i ] = { name: i };

	}

	for ( i = 0; i < sea.sequence.length; i ++ ) {

		var seq = sea.sequence[ i ];
		var seqTargets = [];

		for ( j = 0; j < seq.count; j ++ ) {

			seqTargets[ j ] = targets[ seq.start + j ];

		}

		var anm = THREE.AnimationClip.CreateFromMorphTargetSequence( seq.name, seqTargets, sea.frameRate );
		anm.loop = seq.repeat;
		anm.timeScale = 1;

		animations.push( anm );

	}

	sea.tag = {
		attribs : attribs,
		targets : targets,
		animations : animations
	};

};

//
//	Actions
//

THREE.SEA3D.prototype.readActions = function( sea ) {

	for ( var i = 0; i < sea.actions.length; i ++ ) {

		var act = sea.actions[ i ];

		switch ( act.kind ) {

			case SEA3D.Actions.SCRIPTS:

				this.domain.scripts = this.getJSMList( this.domain, act.scripts );

				if ( this.config.runScripts ) this.domain.runJSMList( obj3d );

				break;

		}

	}

};

//
//	Events
//

THREE.SEA3D.Event = {
	LOAD_PROGRESS: "sea3d_progress",
	DOWNLOAD_PROGRESS: "sea3d_download",
	COMPLETE: "sea3d_complete",
	OBJECT_COMPLETE: "sea3d_object",
	PARSE_PROGRESS: "parse_progress",
	PARSE_COMPLETE: "parse_complete",
	ERROR: "sea3d_error"
};

THREE.SEA3D.prototype.onProgress = undefined;

THREE.SEA3D.prototype.onComplete = function( args ) {

	args.file = this.scope; args.type = THREE.SEA3D.Event.COMPLETE;
	args.file.dispatchEvent( args );

};

THREE.SEA3D.prototype.onLoadProgress = function( args ) {

	args.file = this.scope; args.type = THREE.SEA3D.Event.LOAD_PROGRESS;
	args.file.dispatchEvent( args );
	if ( args.file.onProgress ) args.file.onProgress( args );

};

THREE.SEA3D.prototype.onDownloadProgress = function( args ) {

	args.file = this.scope; args.type = THREE.SEA3D.Event.DOWNLOAD_PROGRESS;
	args.file.dispatchEvent( args );
	if ( args.file.onProgress ) args.file.onProgress( args );

};

THREE.SEA3D.prototype.onCompleteObject = function( args ) {

	args.file = this.scope; args.type = THREE.SEA3D.Event.OBJECT_COMPLETE;
	args.file.dispatchEvent( args );

};

THREE.SEA3D.prototype.onParseProgress = function( args ) {

	args.file = this.scope; args.type = THREE.SEA3D.Event.PARSE_PROGRESS;
	args.file.dispatchEvent( args );

};

THREE.SEA3D.prototype.onParseComplete = function( args ) {

	args.file = this.scope; args.type = THREE.SEA3D.Event.PARSE_COMPLETE;
	args.file.dispatchEvent( args );

};

THREE.SEA3D.prototype.onError = function( args ) {

	args.file = this.scope; args.type = THREE.SEA3D.Event.ERROR;
	args.file.dispatchEvent( args );

};

//
//	Loader
//

THREE.SEA3D.prototype.createDomain = function() {

	return this.domain = new THREE.SEA3D.Domain(
		this.config.id,
		this.objects = {},
		this.config.container
	);

};

THREE.SEA3D.prototype.clone = function( config, onParseComplete, onParseProgress ) {

	if ( ! this.file.isDone() ) throw new Error( "Previous parse is not completed." );

	this.config.container = config && config.container !== undefined ? config.container : new THREE.Object3D();

	if ( config ) this.loadConfig( config );

	var timeLimit = this.config.timeLimit;

	this.config.timeLimit = config && config.timeLimit !== undefined ? config.timeLimit : Infinity;

	this.parse( onParseComplete, onParseProgress );

	this.config.timeLimit = timeLimit;

	return this.domain;

};

THREE.SEA3D.prototype.loadConfig = function( config ) {

	for ( var name in config ) {

		this.config[ name ] = config[ name ];

	}

};

THREE.SEA3D.prototype.parse = function( onParseComplete, onParseProgress ) {

	delete this.cameras;
	delete this.containers;
	delete this.lights;
	delete this.joints;
	delete this.meshes;
	delete this.materials;
	delete this.animationSets;
	delete this.sprites;
	delete this.sounds3d;
	delete this.cubeRenderers;
	delete this.sounds;
	delete this.glsl;
	delete this.dummy;

	delete this.domain;

	this.createDomain();

	this.setTypeRead();

	this.file.onParseComplete = ( function( e ) {

		if ( this.config.manager ) this.config.manager.add( this.domain );

		( onParseComplete || this.onParseComplete ).call( this.file, e );

	} ).bind( this );

	this.file.onParseProgress = onParseProgress || this.onParseProgress;

	// EXTENSIONS

	var i = THREE.SEA3D.EXTENSIONS_LOADER.length;

	while ( i -- ) {

		var loader = THREE.SEA3D.EXTENSIONS_LOADER[ i ];

		if ( loader.parse ) loader.parse.call( this );

	}

	this.file.parse();

	return this.domain;

};

THREE.SEA3D.prototype.load = function( url ) {

	this.loadBytes();

	this.file.load( url );

};

THREE.SEA3D.prototype.onHead = function( args ) {

	if ( args.sign != 'TJS' ) {

		throw new Error( "Sign '" + args.sign + "' not supported! Use SEA3D Studio to publish or SEA3DLegacy.js" );

	}

};

THREE.SEA3D.EXTENSIONS_LOADER = [];
THREE.SEA3D.EXTENSIONS_DOMAIN = [];

THREE.SEA3D.prototype.setTypeRead = function() {

	this.file.typeRead = {};

	this.file.typeRead[ SEA3D.Geometry.prototype.type ] =
	this.file.typeRead[ SEA3D.GeometryDelta.prototype.type ] = this.readGeometryBuffer;
	this.file.typeRead[ SEA3D.Mesh.prototype.type ] = this.readMesh;
	this.file.typeRead[ SEA3D.Sprite.prototype.type ] = this.readSprite;
	this.file.typeRead[ SEA3D.Container3D.prototype.type ] = this.readContainer3D;
	this.file.typeRead[ SEA3D.Line.prototype.type ] = this.readLine;
	this.file.typeRead[ SEA3D.Material.prototype.type ] = this.readMaterial;
	this.file.typeRead[ SEA3D.Camera.prototype.type ] = this.readCamera;
	this.file.typeRead[ SEA3D.OrthographicCamera.prototype.type ] = this.readOrthographicCamera;
	this.file.typeRead[ SEA3D.SkeletonLocal.prototype.type ] = this.readSkeletonLocal;
	this.file.typeRead[ SEA3D.JointObject.prototype.type ] = this.readJointObject;
	this.file.typeRead[ SEA3D.CubeMap.prototype.type ] = this.readCubeMap;
	this.file.typeRead[ SEA3D.CubeRender.prototype.type ] = this.readCubeRender;
	this.file.typeRead[ SEA3D.Animation.prototype.type ] = this.readAnimation;
	this.file.typeRead[ SEA3D.SoundPoint.prototype.type ] = this.readSoundPoint;
	this.file.typeRead[ SEA3D.TextureURL.prototype.type ] = this.readTextureURL;
	this.file.typeRead[ SEA3D.Morph.prototype.type ] = this.readMorpher;
	this.file.typeRead[ SEA3D.VertexAnimation.prototype.type ] = this.readVertexAnimation;
	this.file.typeRead[ SEA3D.Actions.prototype.type ] = this.readActions;

	if ( this.config.dummys ) {

		this.file.typeRead[ SEA3D.Dummy.prototype.type ] = this.readDummy;

	}

	if ( this.config.scripts ) {

		this.file.typeRead[ SEA3D.JavaScriptMethod.prototype.type ] = this.readJavaScriptMethod;

	}

	if ( this.config.lights ) {

		this.file.typeRead[ SEA3D.PointLight.prototype.type ] = this.readPointLight;
		this.file.typeRead[ SEA3D.DirectionalLight.prototype.type ] = this.readDirectionalLight;
		this.file.typeRead[ SEA3D.HemisphereLight.prototype.type ] = this.readHemisphereLight;
		this.file.typeRead[ SEA3D.AmbientLight.prototype.type ] = this.readAmbientLight;

	}

	// UNIVERSAL

	this.file.typeRead[ SEA3D.JPEG.prototype.type ] =
	this.file.typeRead[ SEA3D.JPEG_XR.prototype.type ] =
	this.file.typeRead[ SEA3D.PNG.prototype.type ] =
	this.file.typeRead[ SEA3D.GIF.prototype.type ] = this.readImage;
	this.file.typeRead[ SEA3D.MP3.prototype.type ] = this.readSound;
	this.file.typeRead[ SEA3D.GLSL.prototype.type ] = this.readGLSL;

	// EXTENSIONS

	var i = THREE.SEA3D.EXTENSIONS_LOADER.length;

	while ( i -- ) {

		var loader = THREE.SEA3D.EXTENSIONS_LOADER[ i ];

		if ( loader.setTypeRead ) loader.setTypeRead.call( this );

	}

};

THREE.SEA3D.prototype.loadBytes = function( data ) {

	this.file = new SEA3D.File();
	this.file.scope = this;
	this.file.config = this.config;
	this.file.onProgress = this.onLoadProgress;
	this.file.onCompleteObject = this.onCompleteObject;
	this.file.onDownloadProgress = this.onDownloadProgress;
	this.file.onParseProgress = this.onParseProgress;
	this.file.onParseComplete = this.onParseComplete;
	this.file.onError = this.onError;
	this.file.onHead = this.onHead;

	this.file.onComplete = ( function( e ) {

		if ( this.config.manager ) this.config.manager.add( this.domain );

		this.onComplete.call( this.file, e );

	} ).bind( this );

	// SEA3D

	this.createDomain();

	this.setTypeRead();

	this.file.read( data );

};
