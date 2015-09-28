/**
 * 	SEA3D for Three.JS
 * 	@author Sunag / http://www.sunag.com.br/
 */

'use strict';

//
//	SEA3D
//

THREE.SEA3D = function( config ) {

	this.config = config || {};

	if ( this.config.script == undefined ) this.config.script = true;
	if ( this.config.autoPlay == undefined ) this.config.autoPlay = false;
	if ( this.config.multiplier == undefined ) this.config.multiplier = 1;
	if ( this.config.bounding == undefined ) this.config.bounding = true;
	if ( this.config.standardMaterial == undefined ) this.config.standardMaterial = true;
	if ( this.config.audioRolloffFactor == undefined ) this.config.audioRolloffFactor = 10;
	if ( this.config.timeLimit == undefined ) this.config.timeLimit = 10;
	if ( this.config.streaming == undefined ) this.config.streaming = true;
	if ( this.config.lights == undefined ) this.config.lights = true;

};

THREE.SEA3D.prototype = {
	constructor: THREE.SEA3D,

	addEventListener: THREE.EventDispatcher.prototype.addEventListener,
	hasEventListener: THREE.EventDispatcher.prototype.hasEventListener,
	removeEventListener: THREE.EventDispatcher.prototype.removeEventListener,
	dispatchEvent: THREE.EventDispatcher.prototype.dispatchEvent,

	set container ( val ) {

		this.config.container = val;

	},

	get container () {

		return this.config.container;

	}
};

//
//	Defaults
//

THREE.SEA3D.BACKGROUND_COLOR = 0x333333;
THREE.SEA3D.HELPER_COLOR = 0x9AB9E5;
THREE.SEA3D.RTT_SIZE = 512;

//
//	Shader
//

THREE.SEA3D.ShaderLib = {};

THREE.SEA3D.ShaderLib.replaceCode = function( src, target, replace ) {

	for ( var i = 0; i < target.length; i ++ ) {

		var tar = target[ i ],
			rep = replace[ i ],
			index = src.indexOf( tar );

		if ( index > - 1 ) {

			src = src.substring( 0, index ) + rep + src.substring( index + tar.length );

		}

	}

	return src;

};

// TODO: Emissive to Ambient Color Extension

THREE.SEA3D.ShaderLib.fragStdMtl = THREE.SEA3D.ShaderLib.replaceCode( THREE.ShaderLib.phong.fragmentShader, [
	//	Target
	'outgoingLight += diffuseColor.rgb * ( totalDiffuseLight + totalAmbientLight ) * specular + totalSpecularLight + totalEmissiveLight;', // METAL
	'outgoingLight += diffuseColor.rgb * ( totalDiffuseLight + totalAmbientLight ) + totalSpecularLight + totalEmissiveLight;'
], [
	//	Replace To
	'outgoingLight += diffuseColor.rgb * ( totalDiffuseLight + totalAmbientLight + totalEmissiveLight ) * specular + totalSpecularLight;', // METAL
	'outgoingLight += diffuseColor.rgb * ( totalDiffuseLight + totalAmbientLight + totalEmissiveLight ) + totalSpecularLight;'
] );

//
//	Standard Material
//

THREE.SEA3D.StandardMaterial = function () {

	THREE.MeshPhongMaterial.call( this );

};

THREE.SEA3D.StandardMaterial.prototype = Object.create( THREE.MeshPhongMaterial.prototype );
THREE.SEA3D.StandardMaterial.prototype.constructor = THREE.SEA3D.StandardMaterial;

THREE.SEA3D.StandardMaterial.prototype.copy = function ( source ) {

	THREE.MeshPhongMaterial.prototype.copy.call( this, source );

	return this;

};

THREE.SEA3D.StandardMaterial.prototype.clone = function() {

	return new THREE.SEA3D.StandardMaterial().copy( this );

};

THREE.SEA3D.StandardMaterial.prototype.__defineSetter__( "__webglShader", function( val ) {

	val.fragmentShader = THREE.SEA3D.ShaderLib.fragStdMtl;
	this.__webglShader__ = val;

} )

THREE.SEA3D.StandardMaterial.prototype.__defineGetter__( "__webglShader", function() {

	return this.__webglShader__;

} )

//
//	Container
//

THREE.SEA3D.Object3D = function ( ) {

	THREE.Object3D.call( this );

};

THREE.SEA3D.Object3D.prototype = Object.create( THREE.Object3D.prototype );
THREE.SEA3D.Object3D.prototype.constructor = THREE.SEA3D.Object3D;

// Relative Animation Extension
// TODO: It can be done with shader

THREE.SEA3D.Object3D.prototype.updateAnimateMatrix = function( force ) {

	if ( this.matrixAutoUpdate === true ) this.updateMatrix();

	if ( this.matrixWorldNeedsUpdate === true || force === true ) {

		if ( this.parent === null ) {

			this.matrixWorld.copy( this.matrix );

		} else {

			this.matrixWorld.multiplyMatrices( this.parent.matrixWorld, this.matrix );

		}

		this.animateMatrix.compose( this.animatePosition, this.animateQuaternion, this.animateScale );

		this.matrixWorld.multiplyMatrices( this.matrixWorld, this.animateMatrix );

		this.matrixWorldNeedsUpdate = false;

		force = true;

	}

	// update children

	for ( var i = 0, l = this.children.length; i < l; i ++ ) {

		this.children[ i ].updateMatrixWorld( force );

	}

};

THREE.SEA3D.Object3D.prototype.setAnimateMatrix = function( val ) {

	if ( this.getAnimateMatrix() == val )
		return;

	if ( val ) {

		this.animateMatrix = new THREE.Matrix4();

		this.animatePosition = new THREE.Vector3();
		this.animateQuaternion = new THREE.Quaternion();
		this.animateScale = new THREE.Vector3( 1, 1, 1 );

		this.updateMatrixWorld = THREE.SEA3D.Object3D.prototype.updateAnimateMatrix;

	} else {

		delete this.animateMatrix;

		delete this.animatePosition;
		delete this.animateQuaternion;
		delete this.animateScale;

		this.updateMatrixWorld = THREE.Object3D.prototype.updateMatrixWorld;

	}

	this.matrixWorldNeedsUpdate = true;

};

THREE.SEA3D.Object3D.prototype.getAnimateMatrix = function() {

	return this.animateMatrix != undefined;

};

//
//	Dummy
//

THREE.SEA3D.Dummy = function ( width, height, depth ) {

	this.width = width != undefined ? width : 100;
	this.height = height != undefined ? height : 100;
	this.depth = depth != undefined ? depth : 100;

	var geo = new THREE.BoxGeometry( this.width, this.height, this.depth, 1, 1, 1 );

	THREE.Mesh.call( this, geo, THREE.SEA3D.Dummy.MATERIAL );

};

THREE.SEA3D.Dummy.prototype = Object.create( THREE.Mesh.prototype );
THREE.SEA3D.Dummy.prototype.constructor = THREE.Dummy;

THREE.SEA3D.Dummy.prototype.setAnimateMatrix = THREE.SEA3D.Object3D.prototype.setAnimateMatrix;
THREE.SEA3D.Dummy.prototype.getAnimateMatrix = THREE.SEA3D.Object3D.prototype.getAnimateMatrix;

THREE.SEA3D.Dummy.MATERIAL = new THREE.MeshBasicMaterial( { wireframe: true, color: THREE.SEA3D.HELPER_COLOR } );

THREE.SEA3D.Dummy.prototype.clone = function ( object ) {

	return new THREE.SEA3D.Dummy( this.width, this.height, this.depth ).copy( this );

};

THREE.SEA3D.Dummy.prototype.dispose = function () {

	this.geometry.dispose();

};

//
//	Mesh
//

THREE.SEA3D.Mesh = function ( geometry, material ) {

	THREE.Mesh.call( this, geometry, material );

};

THREE.SEA3D.Mesh.prototype = Object.create( THREE.Mesh.prototype );
THREE.SEA3D.Mesh.prototype.constructor = THREE.Mesh;

THREE.SEA3D.Mesh.prototype.setAnimateMatrix = THREE.SEA3D.Object3D.prototype.setAnimateMatrix;
THREE.SEA3D.Mesh.prototype.getAnimateMatrix = THREE.SEA3D.Object3D.prototype.getAnimateMatrix;

THREE.SEA3D.Mesh.prototype.setWeight = function( name, val ) {

	this.morphTargetInfluences[ this.morphTargetDictionary[ name ] ] = val;

};

THREE.SEA3D.Mesh.prototype.getWeight = function( name ) {

	return this.morphTargetInfluences[ this.morphTargetDictionary[ name ] ];

};

THREE.SEA3D.Mesh.prototype.copy = function ( source ) {

	THREE.Mesh.prototype.copy.call( this, source );

	if ( this.animation )
		this.animation = source.animation.clone( this );

	return this;

};

THREE.SEA3D.Mesh.prototype.clone = function ( object ) {

	return new THREE.SEA3D.Mesh( this.geometry, this.material ).copy( this );

};

//
//	Skinning
//

THREE.SEA3D.SkinnedMesh = function ( geometry, material, useVertexTexture ) {

	THREE.SkinnedMesh.call( this, geometry, material, useVertexTexture );

};

THREE.SEA3D.SkinnedMesh.prototype = Object.create( THREE.SkinnedMesh.prototype );
THREE.SEA3D.SkinnedMesh.prototype.constructor = THREE.SEA3D.SkinnedMesh;

THREE.SEA3D.SkinnedMesh.prototype.setAnimateMatrix = THREE.SEA3D.Object3D.prototype.setAnimateMatrix;
THREE.SEA3D.SkinnedMesh.prototype.getAnimateMatrix = THREE.SEA3D.Object3D.prototype.getAnimateMatrix;

THREE.SEA3D.SkinnedMesh.prototype.setWeight = THREE.SEA3D.Mesh.prototype.setWeight;
THREE.SEA3D.SkinnedMesh.prototype.getWeight = THREE.SEA3D.Mesh.prototype.getWeight;

THREE.SEA3D.SkinnedMesh.prototype.isPlaying = false;

THREE.SEA3D.SkinnedMesh.prototype.stop = function() {

	if ( this.currentAnimation ) {

		this.currentAnimation.stop();

		delete this.currentAnimation;

		this.isPlaying = false;

	}

};

THREE.SEA3D.SkinnedMesh.prototype.pause = function() {

	if ( this.isPlaying ) {

		this.currentAnimation.pause();
		this.isPlaying = false;

	}

};

THREE.SEA3D.SkinnedMesh.prototype.resume = function() {

	if ( ! this.isPlaying && this.currentAnimation ) {

		this.currentAnimation.pause();
		this.isPlaying = true;

	}

};

THREE.SEA3D.SkinnedMesh.prototype.play = function( name, crossfade, offset ) {

	this.previousAnimation = this.currentAnimation;
	this.currentAnimation = this.animations[ name ];

	if ( ! this.currentAnimation )
		throw new Error( 'Animation "' + name + '" not found.' );

	if ( this.previousAnimation && this.previousAnimation !== this.currentAnimation && crossfade > 0 ) {

		this.previousAnimation.play( this.previousAnimation.currentTime, this.previousAnimation.weight );
		this.currentAnimation.play( offset !== undefined ? offset : this.currentAnimation.currentTime, this.currentAnimation.weight );

		THREE.SEA3D.AnimationHandler.addCrossfade( this, crossfade );

	} else {

		this.currentAnimation.play( offset !== undefined ? offset : this.currentAnimation.currentTime, 1 );

	}

	this.isPlaying = true;

};

THREE.SEA3D.SkinnedMesh.prototype.setAnimations = function( animations ) {

	this.animations = [];
	this.weightSchedule = [];
	this.warpSchedule = [];

	var nsIndex = animations[ 0 ].name.indexOf( "/" ) + 1;
	this.animationNamespace = animations[ 0 ].name.substring( 0, nsIndex );

	for ( var i = 0; i < animations.length; i ++ ) {

		var ns = animations[ i ].name;
		var name = ns.substring( nsIndex );

		this.animations[ i ] = new THREE.SEA3D.Animation( this, animations[ i ] );
		this.animations[ i ].loop = animations[ i ].repeat;
		this.animations[ i ].name = name;

		this.animations[ name ] = this.animations[ i ];

	}

};

THREE.SEA3D.SkinnedMesh.prototype.boneByName = function( name ) {

	var bones = this.skeleton.bones;

	for ( var i = 0, bl = bones.length; i < bl; i ++ ) {

		if ( name == bones[ i ].name )
			return bones[ i ];

	}

};

THREE.SEA3D.SkinnedMesh.prototype.copy = function ( source ) {

	THREE.SkinnedMesh.prototype.copy.call( this, source );

	if ( this.animation )
		this.animation = source.animation.clone( this );

	this.animations = [];

	if ( source.geometry.animations ) {

		var refAnimations = source.geometry.animations;
		var nsIndex = refAnimations[ 0 ].name.indexOf( "/" ) + 1;

		for ( var i = 0; i < refAnimations.length; i ++ ) {

			var name = refAnimations[ i ].name.substring( nsIndex );
			var data = refAnimations[ i ];

			data.initialized = false;

			this.animations[ i ] = new THREE.SEA3D.Animation( this, data );
			this.animations[ i ].loop = refAnimations[ i ].repeat;
			this.animations[ i ].name = name;

		}

	}

	return this;

};

THREE.SEA3D.SkinnedMesh.prototype.clone = function ( object ) {

	return new THREE.SEA3D.SkinnedMesh( this.geometry, this.material, this.useVertexTexture ).copy( this );

};

//
//	Vertex Animation
//

THREE.SEA3D.VertexAnimationMesh = function ( geometry, material, fps ) {

	THREE.MorphAnimMesh.call( this, geometry, material );

	this.fps = fps !== undefined ? fps : 30;
	this.animations = geometry.animations;

	this.isPlaying = false;

	this.totalTime = 0;

	this.playingCallback = this.updateAnimation.bind( this );

};

THREE.SEA3D.VertexAnimationMesh.prototype = Object.create( THREE.MorphAnimMesh.prototype );
THREE.SEA3D.VertexAnimationMesh.prototype.constructor = THREE.SEA3D.VertexAnimationMesh;

THREE.SEA3D.VertexAnimationMesh.prototype.setAnimateMatrix = THREE.SEA3D.Object3D.prototype.setAnimateMatrix;
THREE.SEA3D.VertexAnimationMesh.prototype.getAnimateMatrix = THREE.SEA3D.Object3D.prototype.getAnimateMatrix;

THREE.SEA3D.VertexAnimationMesh.prototype.play = function( name, offset ) {

	var animation = this.animations[ name ];

	this.setFrameRange( animation.start ? animation.start : 1, animation.end - 1 );

	this.duration = ( animation.end - animation.start ) / this.fps;
	this.time = offset !== undefined ? offset : this.time;

	this.resume();

};

THREE.SEA3D.VertexAnimationMesh.prototype.pause = function() {

	if ( this.isPlaying ) {

		this.isPlaying = false;

		THREE.SEA3D.AnimationHandler.removeUpdate( this.playingCallback );

	}

};

THREE.SEA3D.VertexAnimationMesh.prototype.resume = function() {

	if ( ! this.isPlaying ) {

		this.isPlaying = true;

		THREE.SEA3D.AnimationHandler.addUpdate( this.playingCallback );

	}

};

THREE.SEA3D.VertexAnimationMesh.prototype.stop = function() {

	this.pause();

	this.time = 0;

};

THREE.SEA3D.VertexAnimationMesh.prototype.clone = function ( object ) {

	return new THREE.SEA3D.VertexAnimationMesh( this.geometry, this.material, this.fps ).copy( this );

};

//
//	Camera
//

THREE.SEA3D.Camera = function ( fov, aspect, near, far ) {

	THREE.PerspectiveCamera.call( this, fov, aspect, near, far );

};

THREE.SEA3D.Camera.prototype = Object.create( THREE.PerspectiveCamera.prototype );
THREE.SEA3D.Camera.prototype.constructor = THREE.SEA3D.Camera;

THREE.SEA3D.Camera.prototype.setAnimateMatrix = THREE.SEA3D.Object3D.prototype.setAnimateMatrix;
THREE.SEA3D.Camera.prototype.getAnimateMatrix = THREE.SEA3D.Object3D.prototype.getAnimateMatrix;

THREE.SEA3D.Camera.prototype.copy = function ( source ) {

	THREE.PerspectiveCamera.prototype.copy.call( this, source );

	return this;

};

//
//	Animation Update
//

THREE.SEA3D.AnimationHandler = {

	crossfade : [],
	updates : [],

	update : function( dt ) {

		var i, cf = THREE.SEA3D.AnimationHandler.crossfade, ups = THREE.SEA3D.AnimationHandler.updates;

		// crossfade
		i = 0;
		while ( i < cf.length ) {

			var mesh = cf[ i ];

			mesh.currentAnimation.weight += dt / mesh.crossfade;

			if ( mesh.currentAnimation.weight > 1 ) {

				mesh.previousAnimation.weight = 0;
				mesh.currentAnimation.weight = 1;

				if ( mesh.onCrossfadeComplete ) mesh.onCrossfadeComplete( mesh );

				cf.splice( i, 1 );

				delete mesh.crossfade;

			}
			else ++ i;

			mesh.previousAnimation.weight = 1 - mesh.currentAnimation.weight;

		}

		// updates
		i = 0;
		while ( i < ups.length ) {

			ups[ i ++ ]( dt );

		}

		SEA3D.AnimationHandler.update( dt );

	},

	addCrossfade : function( mesh, crossfade ) {

		if ( mesh.crossfade !== undefined ) {

			THREE.SEA3D.AnimationHandler.crossfade.splice( THREE.SEA3D.AnimationHandler.crossfade.indexOf( mesh ), 1 );

		}

		mesh.crossfade = crossfade;

		THREE.SEA3D.AnimationHandler.crossfade.push( mesh );

	},

	addUpdate : function( func ) {

		THREE.SEA3D.AnimationHandler.updates.push( func );

	},

	removeUpdate : function( func ) {

		var index = THREE.SEA3D.AnimationHandler.updates.indexOf( func );

		if ( index !== - 1 ) {

			THREE.SEA3D.AnimationHandler.crossfade.splice( THREE.SEA3D.AnimationHandler.updates.indexOf( func ), 1 );

		}

	}

};

//
//	Animation Event
//

THREE.SEA3D.Animation = function ( root, data ) {

	THREE.Animation.call( this, root, data );

};

THREE.SEA3D.Animation.prototype = Object.create( THREE.Animation.prototype );
THREE.SEA3D.Animation.prototype.constructor = THREE.SEA3D.Animation;

THREE.SEA3D.Animation.prototype.stop = function() {

	if ( this.onComplete ) this.onComplete( this );

	THREE.Animation.prototype.stop.call( this );

};

THREE.SEA3D.Animation.prototype.reset = function() {

	if ( this.onReset ) this.onReset( this );

	THREE.Animation.prototype.reset.call( this );

};

//
//	Config
//

THREE.SEA3D.MTXBUF = new THREE.Matrix4();
THREE.SEA3D.VECBUF = new THREE.Vector3();

THREE.SEA3D.prototype.setShadowMap = function( light, opacity ) {

	light.shadowMapWidth =
	light.shadowMapHeight = 2048;

	light.castShadow = true;
	light.shadowDarkness = opacity !== undefined ? opacity : 1;

};

//
//	Output
//

THREE.SEA3D.prototype.getMesh = function( name ) {

	return this.objects[ "m3d/" + name ];

};

THREE.SEA3D.prototype.getDummy = function( name ) {

	return this.objects[ "dmy/" + name ];

};

THREE.SEA3D.prototype.getLine = function( name ) {

	return this.objects[ "line/" + name ];

};

THREE.SEA3D.prototype.getSound3D = function( name ) {

	return this.objects[ "sn3d/" + name ];

};

THREE.SEA3D.prototype.getMaterial = function( name ) {

	return this.objects[ "mat/" + name ];

};

THREE.SEA3D.prototype.getLight = function( name ) {

	return this.objects[ "lht/" + name ];

};

THREE.SEA3D.prototype.getGLSL = function( name ) {

	return this.objects[ "glsl/" + name ];

};

THREE.SEA3D.prototype.getCamera = function( name ) {

	return this.objects[ "cam/" + name ];

};

THREE.SEA3D.prototype.getTexture = function( name ) {

	return this.objects[ "tex/" + name ];

};

THREE.SEA3D.prototype.getCubeMap = function( name ) {

	return this.objects[ "cmap/" + name ];

};

THREE.SEA3D.prototype.getJointObject = function( name ) {

	return this.objects[ "jnt/" + name ];

};

THREE.SEA3D.prototype.getContainer3D = function( name ) {

	return this.objects[ "c3d/" + name ];

};

THREE.SEA3D.prototype.getSprite = function( name ) {

	return this.objects[ "m2d/" + name ];

};

THREE.SEA3D.prototype.getProperty = function( name ) {

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

	if ( sea.isStatic ) {

		obj3d.updateMatrixWorld();
		obj3d.matrixAutoUpdate = false;

	}

};

THREE.SEA3D.prototype.toVector3 = function( data ) {

	return new THREE.Vector3( data.x, data.y, data.z );

};

THREE.SEA3D.prototype.scaleColor = function( color, scale ) {

	var r = ( color >> 16 ) * scale;
	var g = ( color >> 8 & 0xFF ) * scale;
	var b = ( color & 0xFF ) * scale;

	return ( r << 16 | g << 8 | b );

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

	obj3d.userData = sea.properties;

	if ( this.config.script && sea.scripts ) {

		this.runJSMList( obj3d, sea.scripts );

	}

	if ( sea.parent )
		sea.parent.tag.add( obj3d );
	else if ( this.config.container )
		this.config.container.add( obj3d );

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
				obj.animation = new animatorClass( obj, anm.tag.tag );
				obj.animation.setRelative( anm.relative );

				if ( this.config.autoPlay ) {

					obj.animation.play( obj.animation.getStateNameByIndex( 0 ) );

				}

				return obj.animation;
				break;
		}

	}

};

//
//	Animation
//

THREE.SEA3D.prototype.readAnimation = function( sea ) {

	var anmSet = new SEA3D.AnimationSet();

	for ( var i = 0; i < sea.sequence.length; i ++ ) {

		var seq = sea.sequence[ i ],
			node = new SEA3D.AnimationNode( seq.name, sea.frameRate, seq.count, seq.repeat, seq.intrpl );

		for ( var j = 0; j < sea.dataList.length; j ++ ) {

			var anmData = sea.dataList[ j ];

			node.addData( new SEA3D.AnimationData( anmData.kind, anmData.type, anmData.data, seq.start * anmData.blockSize ) );

		}

		anmSet.addAnimation( node );

	}

	this.domain.animationSets = this.animationSets = this.animationSets || [];
	this.animationSets.push( this.objects[ sea.name + '.#anm' ] = sea.tag = anmSet );

};

//
//	Object3D Animator
//

THREE.SEA3D.Object3DAnimator = function( object3d, animationSet ) {

	SEA3D.AnimationHandler.call( this, animationSet );

	this.object3d = object3d;

};

THREE.SEA3D.Object3DAnimator.prototype = Object.create( SEA3D.AnimationHandler.prototype );
THREE.SEA3D.Object3DAnimator.prototype.constructor = THREE.SEA3D.Object3DAnimator;

THREE.SEA3D.Object3DAnimator.prototype.stop = function() {

	if ( this.relative ) {

		this.object3d.animatePosition = new THREE.Vector3();
		this.object3d.animateQuaternion = new THREE.Quaternion();
		this.object3d.animateScale = new THREE.Vector3( 1, 1, 1 );

	}

	SEA3D.AnimationHandler.prototype.stop.call( this );

};

THREE.SEA3D.Object3DAnimator.prototype.setRelative = function( val ) {

	this.object3d.setAnimateMatrix( this.relative = val );

};

THREE.SEA3D.Object3DAnimator.prototype.updateAnimationFrame = function( frame, kind ) {

	if ( this.relative ) {

		switch ( kind ) {
			case SEA3D.Animation.POSITION:
				var v = frame.toVector();

				this.object3d.animatePosition.set( v.x, v.y, v.z );
				break;

			case SEA3D.Animation.ROTATION:
				var v = frame.toVector();

				this.object3d.animateQuaternion.set( v.x, v.y, v.z, v.w );
				break;

			case SEA3D.Animation.SCALE:
				var v = frame.toVector();

				this.object3d.animateScale.set( v.x, v.y, v.z );
				break;
		}

		this.object3d.matrixWorldNeedsUpdate = true;

	} else {

		switch ( kind ) {
			case SEA3D.Animation.POSITION:
				var v = frame.toVector();

				this.object3d.position.set( v.x, v.y, v.z );
				break;

			case SEA3D.Animation.ROTATION:
				var v = frame.toVector();

				this.object3d.quaternion.set( v.x, v.y, v.z, v.w );
				break;

			case SEA3D.Animation.SCALE:
				var v = frame.toVector();

				this.object3d.scale.set( v.x, v.y, v.z );
				break;
		}

	}

};

//
//	Camera Animator
//

THREE.SEA3D.CameraAnimator = function( object3d, animationSet ) {

	THREE.SEA3D.Object3DAnimator.call( this, object3d, animationSet );

};

THREE.SEA3D.CameraAnimator.prototype = Object.create( THREE.SEA3D.Object3DAnimator.prototype );
THREE.SEA3D.CameraAnimator.prototype.constructor = THREE.SEA3D.Object3DAnimator;

THREE.SEA3D.CameraAnimator.prototype.updateAnimationFrame = function( frame, kind ) {

	switch ( kind ) {
		case SEA3D.Animation.FOV:
			this.object3d.fov = frame.getX();
			break;

		default:
			THREE.SEA3D.Object3DAnimator.prototype.updateAnimationFrame.call( this, frame, kind );
			break;
	}

};

//
//	Light Animator
//

THREE.SEA3D.LightAnimator = function( object3d, animationSet ) {

	THREE.SEA3D.Object3DAnimator.call( this, object3d, animationSet );

};

THREE.SEA3D.LightAnimator.prototype = Object.create( THREE.SEA3D.Object3DAnimator.prototype );
THREE.SEA3D.LightAnimator.prototype.constructor = THREE.SEA3D.Object3DAnimator;

THREE.SEA3D.LightAnimator.prototype.updateAnimationFrame = function( frame, kind ) {

	switch ( kind ) {
		case SEA3D.Animation.COLOR:
			this.object3d.color.setHex( frame.getX() );
			break;

		case SEA3D.Animation.MULTIPLIER:
			this.object3d.intensity = frame.getX();
			break;

		default:
			THREE.SEA3D.Object3DAnimator.prototype.updateAnimationFrame.call( this, frame, kind );
			break;
	}

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

		geo.addAttribute( 'skinIndex', new THREE.Float32Attribute( sea.joint, 4 ) );
		geo.addAttribute( 'skinWeight', new THREE.Float32Attribute( sea.weight, 4 ) );

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
//	Mesh2D | Sprite
//

THREE.SEA3D.prototype.readMesh2D = function( sea ) {

	var material;

	if ( sea.material ) {

		if ( ! sea.material.tag.sprite ) {

			material = sea.material.tag.sprite = new THREE.SpriteMaterial();

			material.map = sea.material.tag.map;
			material.map.flipY = true;

			material.color = sea.material.tag.emissive;
			material.opacity = sea.material.tag.opacity;
			material.blending = sea.material.tag.blending;

		}
		else material = sea.material.tag.sprite;

	}

	var sprite = new THREE.Sprite( material );
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

		mesh = new THREE.SEA3D.SkinnedMesh( geo, mat, false );

		if ( skeletonAnimation ) {

			mesh.setAnimations( geo.animations );

			if ( this.config.autoPlay ) {

				mesh.play( mesh.animations[ 0 ].name );

			}

		}

	} else if ( vertexAnimation ) {

		mesh = new THREE.SEA3D.VertexAnimationMesh( geo, mat, vertexAnimation.frameRate );

		if ( this.config.autoPlay ) {

			mesh.play( mesh.animations[ 0 ].name );

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

	var sound3d = new THREE.Audio( this.audioListener );

	sound3d.load( sea.sound.tag );
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

	this.applyDefaultAnimation( sea, THREE.SEA3D.Object3DAnimator );

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

	var image = new Image(), texture = new THREE.Texture(), scope = this;

	texture.name = sea.name;
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	texture.flipY = false;

	image.onload = function () {

		if ( ! scope.isPowerOfTwo( image.width ) ||
			! scope.isPowerOfTwo( image.height ) ) {

			var width = scope.nearestPowerOfTwo( image.width ),
				height = scope.nearestPowerOfTwo( image.height );

			var canvas = document.createElement( "canvas" );

			canvas.width = width;
			canvas.height = height;

			var ctx = canvas.getContext( "2d" );

			ctx.drawImage( image, 0, 0, width, height );

			image = canvas;

		}

		texture.image = image;
		texture.needsUpdate = true;

	}

	image.src = this.bufferToTexture( sea.data.buffer );

	this.domain.textures = this.textures = this.textures || [];
	this.textures.push( this.objects[ "tex/" + sea.name ] = sea.tag = texture );

};

//
//	Cube Map
//

THREE.SEA3D.prototype.readCubeMap = function( sea ) {

	var images = [],
		texture = new THREE.Texture();

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

		cubeImage.onload = function () {

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

	var texture = THREE.ImageUtils.loadTexture( sea.url );

	texture.name = sea.name;
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	texture.flipY = false;

	this.domain.textures = this.textures = this.textures || [];
	this.textures.push( this.objects[ "tex/" + sea.name ] = sea.tag = texture );

};

//
//	Java Script
//

THREE.SEA3D.SCRIPT = new SEA3D.ScriptManager();

THREE.SEA3D.Domain = function( id, objects, container, extensions ) {

	SEA3D.Domain.call( this, id );

	this.objects = objects;
	this.container = container;
	this.extensions = extensions || [];

};

THREE.SEA3D.Domain.prototype = Object.create( SEA3D.Domain.prototype );
THREE.SEA3D.Domain.prototype.constructor = THREE.SEA3D.Domain;

THREE.SEA3D.Domain.prototype.disposeExtensions = function() {

	extensions = extensions.concat();

	var i = list.length;

	while ( i -- ) list[ i ].dispose();

};

THREE.SEA3D.Domain.prototype.disposeList = function( list ) {

	if ( ! list || ! list.length ) return;

	list = list.concat();

	var i = list.length;
	while ( i -- ) list[ i ].dispose();

};

THREE.SEA3D.Domain.prototype.dispose = function() {

	SEA3D.Domain.prototype.dispose.call( this );

	while ( this.container.children.length ) {

		this.container.remove( this.container.children[ 0 ] );

	}

	var i = this.extensions.length;
	while ( i -- ) this.extensions[ i ].dispose.call( this );

	this.disposeList( this.materials );
	this.disposeList( this.dummys );

};

SEA3D.Domain.prototype.getMesh = THREE.SEA3D.prototype.getMesh;
SEA3D.Domain.prototype.getDummy = THREE.SEA3D.prototype.getDummy;
SEA3D.Domain.prototype.getLine = THREE.SEA3D.prototype.getLine;
SEA3D.Domain.prototype.getSound3D = THREE.SEA3D.prototype.getSound3D;
SEA3D.Domain.prototype.getMaterial = THREE.SEA3D.prototype.getMaterial;
SEA3D.Domain.prototype.getLight = THREE.SEA3D.prototype.getLight;
SEA3D.Domain.prototype.getGLSL = THREE.SEA3D.prototype.getGLSL;
SEA3D.Domain.prototype.getCamera = THREE.SEA3D.prototype.getCamera;
SEA3D.Domain.prototype.getTexture = THREE.SEA3D.prototype.getTexture;
SEA3D.Domain.prototype.getCubeMap = THREE.SEA3D.prototype.getCubeMap;
SEA3D.Domain.prototype.getJointObject = THREE.SEA3D.prototype.getJointObject;
SEA3D.Domain.prototype.getContainer3D = THREE.SEA3D.prototype.getContainer3D;
SEA3D.Domain.prototype.getSprite = THREE.SEA3D.prototype.getSprite;
SEA3D.Domain.prototype.getProperty = THREE.SEA3D.prototype.getProperty;

THREE.SEA3D.DomainManager = function( autoDisposeRootDomain ) {

	SEA3D.DomainManager.call( this, autoDisposeRootDomain );

};

THREE.SEA3D.DomainManager.prototype = Object.create( SEA3D.DomainManager.prototype );
THREE.SEA3D.DomainManager.prototype.constructor = THREE.SEA3D.DomainManager;

THREE.SEA3D.DomainManager.prototype.add = function( domain ) {

	SEA3D.DomainManager.prototype.add.call( this, domain );

	this.textures = this.textures || domain.textures;
	this.cubemaps = this.cubemaps || domain.cubemaps;
	this.geometries = this.geometries || domain.geometries;

};

THREE.SEA3D.DomainManager.prototype.disposeList = THREE.SEA3D.Domain.prototype.disposeList;

THREE.SEA3D.DomainManager.prototype.dispose = function() {

	SEA3D.DomainManager.prototype.dispose.call( this );

	this.disposeList( this.textures );
	this.disposeList( this.cubemaps );
	this.disposeList( this.geometries );

};

//
//	Runtime
//

THREE.SEA3D.prototype.runJSMList = function( target, scripts, root ) {

	for ( var i = 0; i < scripts.length; i ++ ) {

		var script = scripts[ i ];

		if ( script.tag.type == SEA3D.JavaScriptMethod.prototype.type ) {

			this.runJSM( target, script, root );

		}

	}

};

THREE.SEA3D.prototype.runJSM = function( target, script, root ) {

	if ( target.local == undefined ) target.local = {};

	var include = {
		print : this.domain.print,
		watch : this.domain.watch,
		sea3d : this.domain,
		scene : this.config.container,
		source : new SEA3D.Script( this.domain, root == true )
	};

	Object.freeze( include.source );

	THREE.SEA3D.SCRIPT.add( include.source );

	try {

		this.script[ script.method ] (
			include,
			this.domain.getReference,
			this.domain.global,
			target.local,
			target,
			script.params
		);

	}
	catch ( e ) {

		console.error( 'SEA3D JavaScript: Error running method "' + script.method + '".' );
		console.error( e );

	}

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

		this.script = eval( src )();

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

THREE.SEA3D.prototype.blendMode = {
	normal: THREE.NormalBlending,
	add: THREE.AdditiveBlending,
	subtract: THREE.SubtractiveBlending,
	multiply: THREE.MultiplyBlending,
	screen: THREE.AdditiveBlending
};

THREE.SEA3D.prototype.materialTechnique =
( function() {

	var techniques = {}

	// DEFAULT
	techniques[ SEA3D.Material.DEFAULT ] =
	function( tech, mat ) {

		mat.emissive.setHex( tech.ambientColor );
		mat.color.setHex( tech.diffuseColor );
		mat.specular.setHex( this.scaleColor( tech.specularColor, tech.specular ) );
		mat.shininess = tech.gloss;

	}

	// DIFFUSE_MAP
	techniques[ SEA3D.Material.DIFFUSE_MAP ] =
	function( tech, mat ) {

		mat.map = tech.texture.tag;
		mat.transparent = tech.texture.transparent;
		mat.color.setHex( 0xFFFFFF );

	}

	// SPECULAR_MAP
	techniques[ SEA3D.Material.SPECULAR_MAP ] =
	function( tech, mat ) {

		mat.specularMap = tech.texture.tag;

	}

	// NORMAL_MAP
	techniques[ SEA3D.Material.NORMAL_MAP ] =
	function( tech, mat ) {

		mat.normalMap = tech.texture.tag;

	}

	// REFLECTION
	techniques[ SEA3D.Material.REFLECTION ] =
	techniques[ SEA3D.Material.FRESNEL_REFLECTION ] =
	function( tech, mat ) {

		mat.envMap = tech.texture.tag;
		mat.envMap.mapping = THREE.CubeReflectionMapping;
		mat.combine = THREE.MixOperation;

		mat.reflectivity = tech.alpha;

		//if (tech.kind == SEA3D.Material.FRESNEL_REFLECTION) {
		// not implemented
		//}

	}

	// REFLECTION_SPHERICAL
	techniques[ SEA3D.Material.REFLECTION_SPHERICAL ] =
	function( tech, mat ) {

		mat.envMap = tech.texture.tag;
		mat.envMap.mapping = THREE.SphericalReflectionMapping;
		mat.combine = THREE.MixOperation;

		mat.reflectivity = tech.alpha;

	}

	// REFRACTION
	techniques[ SEA3D.Material.REFRACTION_MAP ] =
	function( tech, mat ) {

		mat.envMap = tech.texture.tag;
		mat.envMap.mapping = THREE.CubeRefractionMapping();

		mat.refractionRatio = tech.ior;
		mat.reflectivity = tech.alpha;

	}

	// LIGHT_MAP
	techniques[ SEA3D.Material.LIGHT_MAP ] =
	function( tech, mat ) {

		if ( tech.blendMode == "multiply" ) mat.aoMap = tech.texture.tag;
		else mat.lightMap = tech.texture.tag;

	}

	return techniques;

} )();

THREE.SEA3D.prototype.readMaterial = function( sea ) {

	var mat = this.config.standardMaterial ? new THREE.SEA3D.StandardMaterial() : new THREE.MeshPhongMaterial();
	mat.emissiveToAmbientColor = this.config.ambientColor;
	mat.name = sea.name;

	mat.side = sea.bothSides ? THREE.DoubleSide : THREE.FrontSide;
	mat.shading = sea.smooth ? THREE.SmoothShading : THREE.FlatShading;

	if ( sea.blendMode != "normal" && this.blendMode[ sea.blendMode ] ) {

		mat.blending = this.blendMode[ sea.blendMode ];

	}

	if ( sea.alpha < 1 || mat.blending > THREE.NormalBlending ) {

		mat.opacity = sea.alpha;
		mat.transparent = true;

	}

	for ( var i = 0; i < sea.technique.length; i ++ ) {

		var tech = sea.technique[ i ];

		if ( this.materialTechnique[ tech.kind ] ) {

			this.materialTechnique[ tech.kind ].call( this, tech, mat );

		}

	}

	if ( mat.transparent ) {

		mat.alphaTest = sea.alphaThreshold;

	}

	this.domain.materials = this.materials = this.materials || [];
	this.materials.push( this.objects[ "mat/" + sea.name ] = sea.tag = mat );

};

//
//	Point Light
//

THREE.SEA3D.prototype.readPointLight = function( sea ) {

	var light = new THREE.PointLight( sea.color, sea.multiplier * this.config.multiplier );
	light.name = sea.name;

	if ( sea.attenuation ) {

		light.distance = sea.attenuation.end;

	}

	if ( sea.shadow ) {

		this.setShadowMap( light, sea.shadow.opacity );

	}

	this.domain.lights = this.lights = this.lights || [];
	this.lights.push( this.objects[ "lht/" + sea.name ] = sea.tag = light );

	if ( this.config.lights ) this.addSceneObject( sea );

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

	if ( this.config.lights ) this.addSceneObject( sea );

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

		this.setShadowMap( light, sea.shadow.opacity );

	}

	this.domain.lights = this.lights = this.lights || [];
	this.lights.push( this.objects[ "lht/" + sea.name ] = sea.tag = light );

	if ( this.config.lights ) this.addSceneObject( sea );

	this.updateTransform( light, sea );

	this.applyDefaultAnimation( sea, THREE.SEA3D.LightAnimator );

	this.updateScene();

};

//
//	Camera
//

THREE.SEA3D.prototype.readCamera = function( sea ) {

	var camera = new THREE.SEA3D.Camera( sea.fov );
	camera.name = sea.name;

	this.domain.cameras = this.cameras = this.camera || [];
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
//	Skeleton Animation
//

THREE.SEA3D.prototype.getSkeletonAnimation = function( sea, skl ) {

	if ( sea.tag ) return sea.tag;

	var animations = [],
		delta = sea.frameRate / 1000,
		scale = [ 1, 1, 1 ];

	for ( var i = 0; i < sea.sequence.length; i ++ ) {

		var seq = sea.sequence[ i ];

		var start = seq.start;
		var end = start + seq.count;
		var ns = sea.name + "/" + seq.name;

		var animation = {
			name: ns,
			repeat: seq.repeat,
			fps: sea.frameRate,
			JIT: 0,
			length: delta * ( seq.count - 1 ),
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
					scl: scale
				} );

				time += delta;

			}

			animation.hierarchy[ j ] = node;

		}

		animations.push( animation );

	}

	return sea.tag = animations;

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
	}

};

//
//	Vertex Animation
//

THREE.SEA3D.prototype.readVertexAnimation = function( sea ) {

	var attribs = {
			position : []
		},
		targets = [],
		animations = [];

	for ( var i = 0, l = sea.frame.length; i < l; i ++ ) {

		var frame = sea.frame[ i ];

		attribs.position[ i ] = new THREE.Float32Attribute( new Float32Array( frame.vertex ), 3 );

		if ( frame.normal ) {

			attribs.normal = attribs.normal || [];
			attribs.normal[ i ] = new THREE.Float32Attribute( new Float32Array( frame.normal ), 3 );

		}

		targets[ i ] = { name: i };

	}

	for ( var i = 0; i < sea.sequence.length; i ++ ) {

		var seq = sea.sequence[ i ];

		animations[ i ] = animations[ seq.name ] = {
			name : seq.name,
			start : seq.start,
			end : seq.start + seq.count,
			repeat : seq.repeat
		}

	}

	sea.tag = {
		attribs : attribs,
		targets : targets,
		animations : animations,
		frameRate : sea.frameRate
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

				this.runJSMList( this.domain, act.scripts, true );

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

THREE.SEA3D.prototype.newDomain = function() {

	this.domain = new THREE.SEA3D.Domain(
		this.config.id,
		this.objects = {},
		this.config.container,
		THREE.SEA3D.EXTENSIONS_DOMAIN
	);

}

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

	this.newDomain();

	this.file.onParseComplete = ( function( e ) {

		if ( this.config.manager ) this.config.manager.add( this.domain );

		( onParseComplete || this.onParseComplete ).call( this.file, e );

	} ).bind( this );

	this.file.onParseProgress = onParseProgress || this.onParseProgress;

	// EXTENSIONS

	for ( var i = 0; i < THREE.SEA3D.EXTENSIONS_PARSE.length; i ++ ) {

		THREE.SEA3D.EXTENSIONS_PARSE[ i ].call( this );

	}

	this.file.parse();

	return this;

};

THREE.SEA3D.prototype.load = function( url ) {

	this.loadBytes();
	this.file.load( url );

};

THREE.SEA3D.prototype.onHead = function( args ) {

	if ( args.sign != 'TJS' ) {

		throw "Sign '" + args.sign + "' not supported! Use SEA3D Studio to export.";

	}

};

THREE.SEA3D.EXTENSIONS = [];
THREE.SEA3D.EXTENSIONS_PARSE = [];
THREE.SEA3D.EXTENSIONS_DOMAIN = [];

THREE.SEA3D.prototype.loadBytes = function( data ) {

	this.file = new SEA3D.File();
	this.file.scope = this;
	this.file.streaming = this.config.streaming;
	this.file.timeLimit = this.config.timeLimit;
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

	this.newDomain();

	this.file.typeRead[ SEA3D.Geometry.prototype.type ] =
	this.file.typeRead[ SEA3D.GeometryDelta.prototype.type ] = this.readGeometryBuffer;
	this.file.typeRead[ SEA3D.Mesh.prototype.type ] = this.readMesh;
	this.file.typeRead[ SEA3D.Mesh2D.prototype.type ] = this.readMesh2D;
	this.file.typeRead[ SEA3D.Container3D.prototype.type ] = this.readContainer3D;
	this.file.typeRead[ SEA3D.Dummy.prototype.type ] = this.readDummy;
	this.file.typeRead[ SEA3D.Line.prototype.type ] = this.readLine;
	this.file.typeRead[ SEA3D.Material.prototype.type ] = this.readMaterial;
	this.file.typeRead[ SEA3D.Camera.prototype.type ] = this.readCamera;
	this.file.typeRead[ SEA3D.SkeletonLocal.prototype.type ] = this.readSkeletonLocal;
	this.file.typeRead[ SEA3D.JointObject.prototype.type ] = this.readJointObject;
	this.file.typeRead[ SEA3D.CubeMap.prototype.type ] = this.readCubeMap;
	this.file.typeRead[ SEA3D.CubeRender.prototype.type ] = this.readCubeRender;
	this.file.typeRead[ SEA3D.Animation.prototype.type ] = this.readAnimation;
	this.file.typeRead[ SEA3D.SoundPoint.prototype.type ] = this.readSoundPoint;
	this.file.typeRead[ SEA3D.TextureURL.prototype.type ] = this.readTextureURL;
	this.file.typeRead[ SEA3D.Morph.prototype.type ] = this.readMorpher;
	this.file.typeRead[ SEA3D.VertexAnimation.prototype.type ] = this.readVertexAnimation;
	this.file.typeRead[ SEA3D.PointLight.prototype.type ] = this.readPointLight;
	this.file.typeRead[ SEA3D.DirectionalLight.prototype.type ] = this.readDirectionalLight;
	this.file.typeRead[ SEA3D.HemisphereLight.prototype.type ] = this.readHemisphereLight;
	this.file.typeRead[ SEA3D.Actions.prototype.type ] = this.readActions;

	// UNIVERSAL

	this.file.typeRead[ SEA3D.JPEG.prototype.type ] =
	this.file.typeRead[ SEA3D.JPEG_XR.prototype.type ] =
	this.file.typeRead[ SEA3D.PNG.prototype.type ] =
	this.file.typeRead[ SEA3D.GIF.prototype.type ] = this.readImage;
	this.file.typeRead[ SEA3D.MP3.prototype.type ] = this.readSound;
	this.file.typeRead[ SEA3D.GLSL.prototype.type ] = this.readGLSL;
	this.file.typeRead[ SEA3D.JavaScriptMethod.prototype.type ] = this.readJavaScriptMethod;

	// EXTENSIONS

	for ( var i = 0; i < THREE.SEA3D.EXTENSIONS.length; i ++ ) {

		THREE.SEA3D.EXTENSIONS[ i ].call( this );

	}

	this.file.read( data );

};
