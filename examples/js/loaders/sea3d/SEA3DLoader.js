/**
 * 	SEA3D.JS + Three.JS
 * 	Copyright (C) 2015 Sunag Entertainment 
 * 
 * 	http://sea3d.poonya.com/
 */

//
//	SEA3D
//
 
THREE.SEA3D = function(config) {
	this.config = config || {};
		
	if (this.config.autoPlay === undefined) this.config.autoPlay = false;
	if (this.config.flip === undefined) this.config.flip = true;
	if (this.config.parser == undefined) this.config.parser = THREE.SEA3D.AUTO;
	if (this.config.multiplier == undefined) this.config.multiplier = 1;
	if (this.config.tangent == undefined) this.config.tangent = true;
	if (this.config.bounding == undefined) this.config.bounding = true;	
	if (this.config.standardMaterial == undefined) this.config.standardMaterial = true;	
	if (this.config.audioRolloffFactor == undefined) this.config.audioRolloffFactor = 10;	
		
	this.container = this.config.container || new THREE.Object3D();	
	this.objects = {};	
}

THREE.SEA3D.prototype = {
	constructor: THREE.SEA3D,
	
	addEventListener: THREE.EventDispatcher.prototype.addEventListener,
	hasEventListener: THREE.EventDispatcher.prototype.hasEventListener,
	removeEventListener: THREE.EventDispatcher.prototype.removeEventListener,
	dispatchEvent: THREE.EventDispatcher.prototype.dispatchEvent
}
 
//
//	Shader
//
 
THREE.SEA3D.ShaderLib = {};
 
THREE.SEA3D.ShaderLib.replaceCode = function(src, target, replace) {
	for (var i = 0; i < target.length; i++) {
		var tar = target[i],
			rep = replace[i],
			index = src.indexOf(tar);
		
		if (index > -1)
			src = src.substring(0, index) + rep + src.substring(index + tar.length);		
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

THREE.SEA3D.StandardMaterial.prototype.__defineSetter__("__webglShader", function(val) {

	val.fragmentShader = THREE.SEA3D.ShaderLib.fragStdMtl;	
	this.__webglShader__ = val;

});

THREE.SEA3D.StandardMaterial.prototype.__defineGetter__("__webglShader", function() {

	return this.__webglShader__;

});

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
			
	THREE.Mesh.prototype.updateMatrixWorld.call( this, force );
	
	this.animateMatrix.compose( this.animatePosition, this.animateQuaternion, this.animateScale );

	this.matrixWorld.multiplyMatrices( this.matrixWorld, this.animateMatrix );
	
};

THREE.SEA3D.Object3D.prototype.setAnimateMatrix = function(val) {

	if (this.getAnimateMatrix() == val) 
		return;
	
	if (val) {
		this.animateMatrix = new THREE.Matrix4();
		
		this.animatePosition = new THREE.Vector3();		
		this.animateQuaternion = new THREE.Quaternion();
		this.animateScale = new THREE.Vector3(1,1,1);
		
		this.updateMatrixWorld = THREE.SEA3D.Object3D.prototype.updateAnimateMatrix;
	} else {
		delete this.animateMatrix;
		
		delete this.animatePosition;
		delete this.animateQuaternion;
		delete this.animateScale;		
		
		this.updateMatrixWorld = THREE.Mesh.prototype.updateMatrixWorld;
	}	
	
	this.matrixWorldNeedsUpdate = true;

};
 
THREE.SEA3D.Object3D.prototype.getAnimateMatrix = function() {

	return this.animateMatrix != null;

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
 
THREE.SEA3D.Mesh.prototype.setWeight = function(name, val) {

	this.morphTargetInfluences[ this.geometry.morphTargets[name] ] = val;

};

THREE.SEA3D.Mesh.prototype.getWeight = function(name) {

	return this.morphTargetInfluences[ this.geometry.morphTargets[name] ];

};

THREE.SEA3D.Mesh.prototype.dispose = function () {

	if (this.animation) 
		this.animation.dispose();

	this.animations = null;
		
	THREE.Mesh.prototype.dispose.call( this );

};

THREE.SEA3D.Mesh.prototype.copy = function ( source ) {

	THREE.Mesh.prototype.copy.call( this, source );

	if (this.animation)
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

THREE.SEA3D.SkinnedMesh.prototype.setAnimateMatrix = THREE.SEA3D.Mesh.prototype.setAnimateMatrix;
THREE.SEA3D.SkinnedMesh.prototype.getAnimateMatrix = THREE.SEA3D.Mesh.prototype.getAnimateMatrix;

THREE.SEA3D.SkinnedMesh.prototype.setWeight = THREE.SEA3D.Mesh.prototype.setWeight;
THREE.SEA3D.SkinnedMesh.prototype.getWeight = THREE.SEA3D.Mesh.prototype.getWeight;

THREE.SEA3D.SkinnedMesh.prototype.isPlaying = false;

THREE.SEA3D.SkinnedMesh.prototype.stop = function() {
	if (this.currentAnimation) {
		this.currentAnimation.stop();
		this.currentAnimation = null;		
		this.isPlaying = false;
	}
}

THREE.SEA3D.SkinnedMesh.prototype.pause = function() {
	if (this.isPlaying) {
		this.currentAnimation.pause();			
		this.isPlaying = false;		
	}
}

THREE.SEA3D.SkinnedMesh.prototype.resume = function() {
	if (!this.isPlaying && this.currentAnimation) {
		this.currentAnimation.pause();			
		this.isPlaying = true;
	}
}

THREE.SEA3D.SkinnedMesh.prototype.play = function(name, crossfade, offset) {	
	this.previousAnimation = this.currentAnimation;
	this.currentAnimation = this.animations[name];
	
	if (!this.currentAnimation)
		throw new Error('Animation "' + name + '" not found.');
	
	if (this.previousAnimation && this.previousAnimation !== this.currentAnimation && crossfade > 0) {					
		
		this.previousAnimation.play(this.previousAnimation.currentTime, this.previousAnimation.weight);
		this.currentAnimation.play(offset !== undefined ? offset : this.currentAnimation.currentTime, this.currentAnimation.weight);
		
		THREE.SEA3D.AnimationHandler.addCrossfade( this, crossfade );		
		
	} else {
		this.currentAnimation.play(offset !== undefined ? offset : this.currentAnimation.currentTime, 1);
	}		
	
	this.isPlaying = true;
}

THREE.SEA3D.SkinnedMesh.prototype.setAnimations = function(animations) {
	this.animations = [];	
	this.weightSchedule = [];
	this.warpSchedule = [];
	
	var nsIndex = animations[0].name.indexOf("/")+1;
	this.animationNamespace = animations[0].name.substring(0, nsIndex);		
	
	for (var i = 0; i < animations.length; i++) {								
		var ns = animations[i].name;	
		var name = ns.substring(nsIndex);		
		
		this.animations[i] = new THREE.SEA3D.Animation( this, animations[i] );
		this.animations[i].loop = animations[i].repeat;
		this.animations[i].name = name;		
		
		this.animations[name] = this.animations[i];
	}
}

THREE.SEA3D.SkinnedMesh.prototype.boneByName = function(name) {
	var bones = this.bones;
	
	for(var i = 0, bl = bones.length; i < bl; i++) {
		if (name == bones[i].name)
			return bones[i];		
	}
}

THREE.SEA3D.SkinnedMesh.prototype.dispose = function () {	

	this.stop();
	
	if (this.animation) 
		this.animation.dispose();

	this.animations = null;
	
	THREE.SkinnedMesh.prototype.dispose.call( this );

}

THREE.SEA3D.SkinnedMesh.prototype.copy = function ( source ) {

	THREE.SkinnedMesh.prototype.copy.call( this, source );

	if (this.animation)
		this.animation = source.animation.clone( this );

	this.animations = [];

	if (source.geometry.animations) {
		var refAnimations = source.geometry.animations;
		var nsIndex = refAnimations[0].name.indexOf("/")+1;

		for (var i = 0; i < refAnimations.length; i++) {
			var name = refAnimations[i].name.substring(nsIndex);
			var data = refAnimations[i];

			data.initialized = false;

			this.animations[i] = new THREE.SEA3D.Animation( this, data );
			this.animations[i].loop = refAnimations[i].repeat;
			this.animations[i].name = name;
		}
	}

	return this;

};

THREE.SEA3D.SkinnedMesh.prototype.clone = function ( object ) {

	return new THREE.SEA3D.SkinnedMesh( this.geometry, this.material, this.useVertexTexture ).copy( this );
};

//
//	Animation Update
//

THREE.SEA3D.AnimationHandler = {
	
	crossfade : [],
	
	update : function( dt ) {

		var i, cf = THREE.SEA3D.AnimationHandler.crossfade;

		//	crossfade
		i = 0;
		while ( i < cf.length ) {
			var mesh = cf[i];

			mesh.currentAnimation.weight += dt / mesh.crossfade;						

			if (mesh.currentAnimation.weight > 1) {
				mesh.previousAnimation.weight = 0;						
				mesh.currentAnimation.weight = 1;			

				if (mesh.onCrossfadeComplete)
					mesh.onCrossfadeComplete( mesh );

				cf.splice( i, 1 );

				delete mesh.crossfade;			
			} else 
				++i;		

			mesh.previousAnimation.weight = 1 - mesh.currentAnimation.weight;

		}
		
		SEA3D.AnimationHandler.update( dt ); 

	},
	
	addCrossfade : function( mesh, crossfade ) {

		if (mesh.crossfade !== undefined)
			THREE.SEA3D.AnimationHandler.crossfade.splice( THREE.SEA3D.AnimationHandler.crossfade.indexOf( mesh ), 1 );

		mesh.crossfade = crossfade;	

		THREE.SEA3D.AnimationHandler.crossfade.push( mesh );

	}
	
}

//
//	Animation Event
//

THREE.SEA3D.Animation = function ( root, data ) {

	THREE.Animation.call( this, root, data );
	
}; 

THREE.SEA3D.Animation.prototype = Object.create( THREE.Animation.prototype );
THREE.SEA3D.Animation.prototype.constructor = THREE.SEA3D.Animation; 

THREE.SEA3D.Animation.prototype.stop = function() {

	if (this.onComplete)
		this.onComplete( this );

	THREE.Animation.prototype.stop.call( this );

};

THREE.SEA3D.Animation.prototype.reset = function() {

	if (this.onReset)
		this.onReset( this );

	THREE.Animation.prototype.reset.call( this );

};

//
//	Config
//

THREE.SEA3D.BUFFER0 = new THREE.Matrix4();
THREE.SEA3D.BUFFER1 = new THREE.Matrix4();
THREE.SEA3D.BUFFER2 = new THREE.Matrix4();
THREE.SEA3D.BUFFER3 = new THREE.Matrix4();
THREE.SEA3D.QUABUF0 = new THREE.Quaternion();
THREE.SEA3D.QUABUF1 = new THREE.Quaternion();
THREE.SEA3D.VECBUF0 = new THREE.Vector3();
THREE.SEA3D.VECBUF1 = new THREE.Vector3();
THREE.SEA3D.CONTAINER = new THREE.Object3D();

THREE.SEA3D.VECZERO = new THREE.Vector3();

THREE.SEA3D.AUTO = 'auto'; 
THREE.SEA3D.DEFAULT = 'default';
THREE.SEA3D.BUFFER = 'buffer';

THREE.SEA3D.BACKGROUND_COLOR = 0x333333;
THREE.SEA3D.HELPER_COLOR = 0x9AB9E5;
THREE.SEA3D.TEXTURE_SIZE = 512;

THREE.SEA3D.prototype.setShadowMap = function(light, opacity) {
	light.shadowMapWidth = 
	light.shadowMapHeight = 2048;
	
	light.castShadow = true;
	light.shadowDarkness = opacity !== undefined ? opacity : 1;
}

//
//	Output
//

THREE.SEA3D.prototype.getMesh = function(name) {
	return this.objects["m3d/" + name];
}

THREE.SEA3D.prototype.getDummy = function(name) {
	return this.objects["dmy/" + name];
}

THREE.SEA3D.prototype.getLine = function(name) {
	return this.objects["line/" + name];
}

THREE.SEA3D.prototype.getSound3D = function(name) {
	return this.objects["sn3d/" + name];
}

THREE.SEA3D.prototype.getMaterial = function(name) {
	return this.objects["mat/" + name];
}

THREE.SEA3D.prototype.getLight = function(name) {
	return this.objects["lht/" + name];
}

THREE.SEA3D.prototype.getGLSL = function(name) {
	return this.objects["glsl/" + name];
}

THREE.SEA3D.prototype.getCamera = function(name) {
	return this.objects["cam/" + name];
}

THREE.SEA3D.prototype.getTexture = function(name) {
	return this.objects["tex/" + name];
}

THREE.SEA3D.prototype.getCubeMap = function(name) {
	return this.objects["cmap/" + name];
}

THREE.SEA3D.prototype.getJointObject = function(name) {
	return this.objects["jnt/" + name];
}

THREE.SEA3D.prototype.getContainer3D = function(name) {
	return this.objects["c3d/" + name];
}

THREE.SEA3D.prototype.getSprite = function(name) {
	return this.objects["m2d/" + name];
}

THREE.SEA3D.prototype.getProperty = function(name) {
	return this.objects["prop/" + name];
}

//
//	Utils
//

THREE.SEA3D.prototype.isPowerOfTwo = function(num) {
	return num ? ((num & -num) == num) : false;
}

THREE.SEA3D.prototype.nearestPowerOfTwo = function(num) {
	return Math.pow( 2, Math.round( Math.log( num ) / Math.LN2 ) );
}

THREE.SEA3D.prototype.vectorToVector3 = function(list) {
	var n = [];	
	var i = 0, j = 0;
	while(i < list.length)
		n[j++] = new THREE.Vector3(list[i++], list[i++], list[i++]);
	return n;
}

THREE.SEA3D.prototype.vectorToVector3Inv = function(list) {
	var n = [];	
	var i = 0, j = 0;
	while(i < list.length)
		n[j++] = new THREE.Vector3(list[i++], list[i++], -list[i++]);
	return n;
}

THREE.SEA3D.prototype.flipMatrixScale = function(mtx) {
	mtx.decompose( THREE.SEA3D.VECBUF0, THREE.SEA3D.QUABUF0, THREE.SEA3D.VECBUF1 );	
	THREE.SEA3D.VECBUF1.z = -THREE.SEA3D.VECBUF1.z;	
	mtx.compose( THREE.SEA3D.VECBUF0, THREE.SEA3D.QUABUF0, THREE.SEA3D.VECBUF1 );			
	return mtx;
}

THREE.SEA3D.prototype.flipMatrixGlobal = function(mtx) {
	mtx.decompose( THREE.SEA3D.VECBUF0, THREE.SEA3D.QUABUF0, THREE.SEA3D.VECBUF1 );	
	THREE.SEA3D.VECBUF1.z = -THREE.SEA3D.VECBUF1.z;	
	THREE.SEA3D.VECBUF1.y = -THREE.SEA3D.VECBUF1.y;
	THREE.SEA3D.VECBUF1.x = -THREE.SEA3D.VECBUF1.x;	
	mtx.compose( THREE.SEA3D.VECBUF0, THREE.SEA3D.QUABUF0, THREE.SEA3D.VECBUF1 );			
	return mtx;
}

THREE.SEA3D.prototype.flipMatrix = function(mtx) {
	var mtx_data = THREE.SEA3D.BUFFER0.copy( mtx );
	
	mtx.setPosition( THREE.SEA3D.VECZERO );	
	mtx.multiplyMatrices( THREE.SEA3D.BUFFER1.makeRotationAxis( THREE.SEA3D.VECBUF0.set(0, 0, 1), THREE.Math.degToRad( 180 ) ), mtx );		
	mtx.makeRotationFromQuaternion( THREE.SEA3D.QUABUF0.setFromRotationMatrix( mtx ) );	
	
	var pos = THREE.SEA3D.VECBUF0.setFromMatrixPosition( mtx_data );
	pos.z = -pos.z;
	mtx.setPosition(pos);
	
	return mtx;
}

THREE.SEA3D.prototype.applyMatrix = function(obj3d, mtx) {
	var vec = THREE.SEA3D.VECBUF0;
	
	obj3d.position.setFromMatrixPosition( mtx );		
	obj3d.scale.setFromMatrixScale( mtx );
	
	// ignore rotation scale
	mtx.scale( vec.set( 1 / obj3d.scale.x, 1 / obj3d.scale.y, 1 / obj3d.scale.z ) );		
	obj3d.rotation.setFromRotationMatrix( mtx );
}

THREE.SEA3D.prototype.updateMatrix = function(obj3d) {
	var buf = THREE.SEA3D.BUFFER2;
	var buf1 = THREE.SEA3D.BUFFER3;	
	
	// convert to global
	
	obj3d.updateMatrixWorld();
	buf.copy( obj3d.matrixWorld );
	
	this.flipMatrixScale( buf ); // flip matrix
	
	// convert to local
			
	buf1.copy( obj3d.parent.matrixWorld );
	
	if (obj3d.parent instanceof THREE.Bone)
		this.flipMatrixGlobal( buf1 );	
	else 
		this.flipMatrixScale( buf1 );	
	
	buf1.getInverse( buf1 );
	
	buf.multiplyMatrices( buf1, buf );		
	
	this.applyMatrix(obj3d, buf);
}

THREE.SEA3D.prototype.updateTransform = function(obj3d, sea) {
	var buf = THREE.SEA3D.BUFFER2;
	
	if (sea.transform)
		buf.elements = sea.transform;
	else
		buf.makeTranslation(sea.position.x, sea.position.y, sea.position.z);
		
	// matrix
	
	this.applyMatrix(obj3d, buf);
	
	// flip matrix
	
	this.updateMatrix(obj3d);
	
	// optimize if is static
	
	if (sea.isStatic) {
		obj3d.updateMatrixWorld();
		obj3d.matrixAutoUpdate = false;		
	} 			
}

THREE.SEA3D.prototype.updateAnimationSet = function(obj3d) {
	var buf = THREE.SEA3D.BUFFER2;
	var anmSet = obj3d.animation.animationSet;
	var relative = obj3d.animation.relative;
	var anms = anmSet.animations;
	
	if (anmSet.flip && !anms.length)
		return;
	
	var dataList = anms[0].dataList;				
	var t_anm = [];		
			
	for (i = 0; i < dataList.length; i++) {
		var data = dataList[i];	
		var raw = dataList[i].data;	
		var kind = data.kind;
		var numFrames = raw.length / data.blockLength;			
		
		switch(kind) {
			case SEA3D.Animation.POSITION:
			case SEA3D.Animation.ROTATION:				
				t_anm.push( {
					kind : kind,
					numFrames : numFrames,
					raw : raw						
				} );					
				break;
		}
	}
	
	if (t_anm.length > 0) {	
		
		var numFrames = t_anm[0].numFrames,
			ct = THREE.SEA3D.CONTAINER,			
			tar = relative ? obj3d : obj3d.parent;

		if (obj3d.animation.relative) {				
			ct.position.set(0, 0, 0);
			ct.rotation.set(0, 0, 0);
			ct.scale.set(1, 1, 1);
		} else {
			ct.position.copy(obj3d.position);
			ct.rotation.copy(obj3d.rotation);
			ct.scale.copy(obj3d.scale);
		}

		tar.add( ct );
		
		for (var f = 0, t, c; f < numFrames; f++) {
							
			for (t = 0; t < t_anm.length; t++) {				
				
				var raw = t_anm[t].raw,
					kind = t_anm[t].kind;
				
				switch(kind) {
					case SEA3D.Animation.POSITION:
						
						c = f * 3;
						
						ct.position.set(
							raw[c    ], 
							raw[c + 1], 
							raw[c + 2]
						);		

						break;
						
					case SEA3D.Animation.ROTATION:
						
						c = f * 4;
						
						ct.quaternion.set(
							raw[c    ], 
							raw[c + 1], 
							raw[c + 2],
							raw[c + 3]
						);
						
						break;
				}
			}
			
			this.updateMatrix( ct );
			
			for (t = 0; t < t_anm.length; t++) {				
				
				var raw = t_anm[t].raw,				
					kind = t_anm[t].kind;
				
				switch(kind) {
					case SEA3D.Animation.POSITION:
						
						c = f * 3;														

						raw[c    ] = ct.position.x;
						raw[c + 1] = ct.position.y;
						raw[c + 2] = ct.position.z;																									
				
						break;
						
					case SEA3D.Animation.ROTATION:
						
						c = f * 4;

						raw[c    ] = ct.quaternion.x;	
						raw[c + 1] = ct.quaternion.y;	
						raw[c + 2] = ct.quaternion.z;	
						raw[c + 3] = ct.quaternion.w;	

						break;
				}					
			}
		}

		tar.remove( ct );			
	}	
	
	anmSet.flip = true;
}

THREE.SEA3D.prototype.vectorToColor = function(list) {
	var n = [];
	var i = 0, j = 0;
	var r, g, b, a;
	while(i < list.length) {
		r = list[i++] * 0xFF;
		g = list[i++] * 0xFF;
		b = list[i++] * 0xFF;
		a = list[i++] * 0xFF;
		
		n[j++] = new THREE.Color(a << 24 | r << 16 | g << 8 | b);
	}
	return n;
}

THREE.SEA3D.prototype.vectorToUV = function(list) {
	var uvs = [];
	for(var ch=0;ch<list.length;ch++) {
		var uv_ch = uvs[ch] = [];
		var uv = list[ch];
		for(var i=0,j=0;i<uv.length;i+=2) {
			uv_ch[j++] = new THREE.Vector2(uv[i], uv[i+1]);
		}
	}
	return uvs;
}

THREE.SEA3D.prototype.toVector3 = function(data) {

	return new THREE.Vector3(data.x, data.y, data.z);

}

THREE.SEA3D.prototype.scaleColor = function(color, scale) {
	var r = (color >> 16) * scale;
    var g = (color >> 8 & 0xFF) * scale;
    var b = (color & 0xFF) * scale;

    return (r << 16 | g << 8 | b);
}

THREE.SEA3D.prototype.updateScene = function () {

	if (this.materials != undefined) {
		for(var i = 0, l = this.materials.length; i < l; ++i) {
			this.materials[i].needsUpdate = true;
		}		
	}

}

THREE.SEA3D.prototype.addSceneObject = function(sea) {

	var obj3d = sea.tag;
	
	obj3d.props = sea.properties;
	
	if (sea.scripts)
	{	
		for(var i = 0; i < sea.scripts.length; i++)
		{
			var script = sea.scripts[i];
			
			if (script.tag.type == 'js')			
				this.runJS( obj3d, script );			
		}
	}	
	
	if (sea.parent)			
		sea.parent.tag.add( obj3d ); 
	else if (this.config.container)
		this.config.container.add( obj3d );
	else
		this.container.add( obj3d );

}

THREE.SEA3D.prototype.bufferToTexture = function(raw) {

	return "data:image/png;base64," + SEA3D.Stream.bufferToBase64(raw);

}

THREE.SEA3D.prototype.bufferToSound = function(raw) {

	return "data:audio/mp3;base64," + SEA3D.Stream.bufferToBase64(raw);

}

THREE.SEA3D.prototype.applyDefaultAnimation = function(sea, ANIMATOR_CLASS) {
	var obj = sea.tag;
	
	for(var i = 0, count = sea.animations ? sea.animations.length : 0; i < count; i++) {
		var anm = sea.animations[i];			
		
		switch(anm.tag.type) {
			case SEA3D.Animation.prototype.type:
				obj.animation = new ANIMATOR_CLASS(obj, anm.tag.tag);
				obj.animation.setRelative( anm.relative );
		
				if (this.config.flip)
					this.updateAnimationSet(obj);

				if (this.config.autoPlay) 
					obj.animation.play( obj.animation.getStateNameByIndex(0) );

				return obj.animation;
				break;
		}
	}
}

//
//	Animation
//

THREE.SEA3D.prototype.readAnimation = function(sea) {
	var anmSet = new SEA3D.AnimationSet();
	
	for(var i = 0; i < sea.sequence.length; i++) {
		var seq = sea.sequence[i],		
			node = new SEA3D.AnimationNode(seq.name, sea.frameRate, seq.count, seq.repeat, seq.intrpl);
		
		for(var j = 0; j < sea.dataList.length; j++) {				
			var anmData = sea.dataList[j];						
			node.addData( new SEA3D.AnimationData(anmData.kind, anmData.type, anmData.data, seq.start * anmData.blockSize) );
		}
		
		anmSet.addAnimation( node );
	}
	
	this.animationSets = this.animationSets || [];
	this.animationSets.push(this.objects[sea.name + '.#anm'] = sea.tag = anmSet);
}

//
//	Object3D Animator
//

THREE.SEA3D.Object3DAnimator = function(object3d, animationSet) {
	SEA3D.AnimationHandler.call( this, animationSet );	
	this.object3d = object3d;	
}

THREE.SEA3D.Object3DAnimator.prototype = Object.create( SEA3D.AnimationHandler.prototype );

THREE.SEA3D.Object3DAnimator.prototype.STOP = THREE.SEA3D.Object3DAnimator.prototype.stop;
THREE.SEA3D.Object3DAnimator.prototype.stop = function() {
	if (this.relative) {
		this.object3d.animatePosition = new THREE.Vector3();		
		this.object3d.animateQuaternion = new THREE.Quaternion();
		this.object3d.animateScale = new THREE.Vector3(1,1,1);
	}
	
	this.STOP();	
}

THREE.SEA3D.Object3DAnimator.prototype.setRelative = function(val) {
	this.object3d.setAnimateMatrix( this.relative = val );	
}

THREE.SEA3D.Object3DAnimator.prototype.updateAnimationFrame = function(frame, kind) {
	if (this.relative) {		
		switch(kind) {
			case SEA3D.Animation.POSITION:	
				var v = frame.toVector();
				this.object3d.animatePosition.set(v.x, v.y, v.z);	
				break;
				
			case SEA3D.Animation.ROTATION:			
				var v = frame.toVector();				
				this.object3d.animateQuaternion.set(v.x, v.y, v.z, v.w);
				break;	
				
			case SEA3D.Animation.SCALE:	
				var v = frame.toVector();		
				this.object3d.animateScale.set(v.x, v.y, v.z);
				break;
		}
		
		this.object3d.matrixWorldNeedsUpdate = true;
	} else {
		switch(kind) {
			case SEA3D.Animation.POSITION:					
				var v = frame.toVector();
				this.object3d.position.set(v.x, v.y, v.z);				
				break;
				
			case SEA3D.Animation.ROTATION:		
				var v = frame.toVector();	
				this.object3d.quaternion.set(v.x, v.y, v.z, v.w);
				break;	
				
			case SEA3D.Animation.SCALE:	
				var v = frame.toVector();
				this.object3d.scale.set(v.x, v.y, v.z);
				break;
		}
	}
}

//
//	Camera Animator
//

THREE.SEA3D.CameraAnimator = function(object3d, animationSet) {
	THREE.SEA3D.Object3DAnimator.call( this, object3d, animationSet );	
}

THREE.SEA3D.CameraAnimator.prototype = Object.create( THREE.SEA3D.Object3DAnimator.prototype );

THREE.SEA3D.CameraAnimator.prototype.updateAnimationFrame = function(frame, kind) {
	switch(kind) {
		case SEA3D.Animation.FOV:	
			this.object3d.fov = frame.getX();
			break;	
	
		default:	
			this.$updateAnimationFrame(frame, kind);
			break;
	}
}

THREE.SEA3D.CameraAnimator.prototype.$updateAnimationFrame = THREE.SEA3D.Object3DAnimator.prototype.updateAnimationFrame;

//
//	Light Animator
//

THREE.SEA3D.LightAnimator = function(object3d, animationSet) {
	THREE.SEA3D.Object3DAnimator.call( this, object3d, animationSet );	
}

THREE.SEA3D.LightAnimator.prototype = Object.create( THREE.SEA3D.Object3DAnimator.prototype );

THREE.SEA3D.LightAnimator.prototype.updateAnimationFrame = function(frame, kind) {
	switch(kind) {
		case SEA3D.Animation.COLOR:	
			this.object3d.color.setHex( frame.getX() );			
			break;	
			
		case SEA3D.Animation.MULTIPLIER:		
			this.object3d.intensity = frame.getX();
			break;
			
		default:			
			this.$updateAnimationFrame(frame, kind);
			break;
	}
}

THREE.SEA3D.LightAnimator.prototype.$updateAnimationFrame = THREE.SEA3D.Object3DAnimator.prototype.updateAnimationFrame;

//
//	Geometry
//

THREE.SEA3D.prototype.readGeometrySwitch = function(sea) {
	if (sea.indexes.length === 1)	
		this.readGeometryBuffer(sea);	
	else
		this.readGeometry(sea);	
}

THREE.SEA3D.prototype.readGeometryBuffer = function(sea) {
	var	index = sea.indexes[0],
		count = index.length,
		geo = new THREE.BufferGeometry();
	
	var indices, position, normals, tangents, uv, uv2, colors, skinIndex, skinWeight;
	
	indices = new Uint16Array( count );
	position = new Float32Array( count * 3 );
	
	var a, b, c,
		v = sea.vertex,
		n = sea.normal,
		t = sea.tangent,
		u = sea.uv ? sea.uv[0] : undefined,
		u2 = sea.uv && sea.uv.length > 1 ? sea.uv[1] : undefined,
		vc = sea.color ? sea.color[0] : undefined,
		sI = sea.joint,
		sW = sea.weight;
	
	if (n) normals = new Float32Array( count * 3 );	
	if (t) tangents = new Float32Array( count * 3 );	
	if (u) uv = new Float32Array( count * 2 );		
	if (u2) uv2 = new Float32Array( count * 2 );	
	if (vc) colors = new Float32Array( count * 3 );	
	if (sI) {
		skinIndex = new Float32Array( count * 4 );	
		skinWeight = new Float32Array( count * 4 );	
		
		var jointPerVertex = Math.min( sea.jointPerVertex, 4 );
		var compJointPerVertex = sea.jointPerVertex.length > 4;
	}
	
	var flip = this.config.flip ? -1 : 1;
	
	for (var f = 0, vt = 0, vu=0, jt=0; f < count; f+=3, vt+=9, vu+=6, jt+=12) {
	
		// index
	
		a = index[ f     ] * 3;
		b = index[ f + 2 ] * 3;
		c = index[ f + 1 ] * 3;
		
		// position
		
		position[ vt     ] = v[ a     ];
		position[ vt + 1 ] = v[ a + 1 ];
		position[ vt + 2 ] = v[ a + 2 ] * flip;
		
		position[ vt + 3 ] = v[ b     ];
		position[ vt + 4 ] = v[ b + 1 ];
		position[ vt + 5 ] = v[ b + 2 ] * flip;
		
		position[ vt + 6 ] = v[ c     ];
		position[ vt + 7 ] = v[ c + 1 ];
		position[ vt + 8 ] = v[ c + 2 ] * flip;
		
		// normal
		
		if (n)
		{
			normals[ vt     ] = n[ a     ];
			normals[ vt + 1 ] = n[ a + 1 ];
			normals[ vt + 2 ] = n[ a + 2 ] * flip;
			
			normals[ vt + 3 ] = n[ b     ];
			normals[ vt + 4 ] = n[ b + 1 ];
			normals[ vt + 5 ] = n[ b + 2 ] * flip;
			
			normals[ vt + 6 ] = n[ c     ];
			normals[ vt + 7 ] = n[ c + 1 ];
			normals[ vt + 8 ] = n[ c + 2 ] * flip;
		}
		
		// tangent
		
		if (t)
		{
			tangents[ vt     ] = t[ a     ];
			tangents[ vt + 1 ] = t[ a + 1 ];
			tangents[ vt + 2 ] = t[ a + 2 ] * flip;
			tangents[ vt + 3 ] = handleVertex(tangents, vt);
			
			tangents[ vt + 4 ] = t[ b     ];
			tangents[ vt + 5 ] = t[ b + 1 ];
			tangents[ vt + 6 ] = t[ b + 2 ] * flip;
			tangents[ vt + 7 ] = handleVertex(tangents + 5, vt);
			
			tangents[ vt + 8 ] = t[ c     ];
			tangents[ vt + 9 ] = t[ c + 1 ];
			tangents[ vt + 10 ] = t[ c + 2 ] * flip;
			tangents[ vt + 11 ] = handleVertex(tangents + 8, vt);
		}
		
		// uv		
		
		if (u)
		{
			a = index[ f     ] * 2;
			b = index[ f + 2 ] * 2;
			c = index[ f + 1 ] * 2;
			
			uv[ vu     ] = u[ a     ];
			uv[ vu + 1 ] = u[ a + 1 ];
		
			uv[ vu + 2 ] = u[ b     ];
			uv[ vu + 3 ] = u[ b + 1 ];
			
			uv[ vu + 4 ] = u[ c     ];
			uv[ vu + 5 ] = u[ c + 1 ];
		}
		else
		{
			uv[ vu     ] = 0;
			uv[ vu + 1 ] = 0;
		
			uv[ vu + 2 ] = 0;
			uv[ vu + 3 ] = 1;		
			
			uv[ vu + 4 ] = 1;
			uv[ vu + 5 ] = 1;
		}
		
		// uv2
		
		if (u2)
		{
			a = index[ f     ] * 2;
			b = index[ f + 2 ] * 2;
			c = index[ f + 1 ] * 2;
			
			uv2[ vu     ] = u2[ a     ];
			uv2[ vu + 1 ] = u2[ a + 1 ];
		
			uv2[ vu + 2 ] = u2[ b     ];
			uv2[ vu + 3 ] = u2[ b + 1 ];
			
			uv2[ vu + 4 ] = u2[ c     ];
			uv2[ vu + 5 ] = u2[ c + 1 ];
		}
		
		// colors
		
		if (vc)
		{
			a = index[ f     ] * 4;
			b = index[ f + 2 ] * 4;
			c = index[ f + 1 ] * 4;
			
			colors[ vt     ] = vc[ a     ];
			colors[ vt + 1 ] = vc[ a + 1 ];
			colors[ vt + 2 ] = vc[ a + 2 ];
			
			colors[ vt + 3 ] = vc[ b     ];
			colors[ vt + 4 ] = vc[ b + 1 ];
			colors[ vt + 5 ] = vc[ b + 2 ];
			
			colors[ vt + 6 ] = vc[ c     ];
			colors[ vt + 7 ] = vc[ c + 1 ];
			colors[ vt + 8 ] = vc[ c + 2 ];
		}
		
		// skin
		
		if (sI)
		{
			var i = 0, totalA = 0, totalB = 0, totalC = 0;
			
			a = index[ f     ] * sea.jointPerVertex;
			b = index[ f + 2 ] * sea.jointPerVertex;
			c = index[ f + 1 ] * sea.jointPerVertex;
			
			i = 0;
			while ( i < jointPerVertex )
			{
				skinIndex[ jt + i ] = sI[ a + i ];				
				totalA += skinWeight[ jt + i ] = sW[ a + i ];	
				
				skinIndex[ jt + i + 4 ] = sI[ b + i ];				
				totalB += skinWeight[ jt + i + 4 ] = sW[ b + i ];	
				
				skinIndex[ jt + i + 8 ] = sI[ c + i ];				
				totalC += skinWeight[ jt + i + 8 ] = sW[ c + i ];	
				
				++i;
			}
			
			skinWeight[ jt ] += 1 - totalA;
			skinWeight[ jt + 4 ] += 1 - totalB;
			skinWeight[ jt + 8 ] += 1 - totalC;
		}
		
		// indices
		
		indices[ f     ] = f;
		indices[ f + 1 ] = f + 1;
		indices[ f + 2 ] = f + 2;
	}
	
	geo.addAttribute( 'position', new THREE.BufferAttribute( position, 3 ) );
	geo.addAttribute( 'index', new THREE.BufferAttribute( indices, 1 ) );
	
	if (normals) geo.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );
	if (tangents) geo.addAttribute( 'tangent', new THREE.BufferAttribute( tangents, 4 ) );
	if (uv) geo.addAttribute( 'uv', new THREE.BufferAttribute( uv, 2 ) );
	if (uv2) geo.addAttribute( 'uv2', new THREE.BufferAttribute( uv2, 2 ) );		
	if (colors) geo.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
	if (skinIndex) {
		geo.addAttribute( 'skinIndex', new THREE.Float32Attribute( skinIndex, 4 ) );		
		geo.addAttribute( 'skinWeight', new THREE.Float32Attribute( skinWeight, 4 ) );		
	}
	
	if (sea.numVertex >= 0xFFFE)	
		geo.computeOffsets();	
	
	if (!n)	
		geo.computeVertexNormals();	
	
	if (this.config.tangent && !sea.tangent)
		geo.computeTangents();
	
	if (this.config.bounding)
	{
		geo.computeBoundingBox();
		geo.computeBoundingSphere();
	}
	
	geo.name = sea.name;
	
	sea.tag = geo;
}

THREE.SEA3D.prototype.readGeometry = function(sea) {
	var i, j, k, l,
		geo = new THREE.Geometry(),
		vertex, normal, tangent, color, uv;

	vertex = geo.vertices = this.config.flip ? this.vectorToVector3Inv(sea.vertex) : this.vectorToVector3(sea.vertex);	
	if (sea.normal) normal = this.config.flip ? this.vectorToVector3Inv(sea.normal) : this.vectorToVector3(sea.normal);
	if (sea.tangent) tangent = this.config.flip ? this.vectorToVector3Inv(sea.tangent) : this.vectorToVector3(sea.tangent);
	if (sea.color) color = this.vectorToColor(sea.color[0]);
	
	if (sea.uv) 
	{
		uv = this.vectorToUV(sea.uv);
	
		for (k = 0; k < uv.length; k++) {
			geo.faceVertexUvs[k] = [];
		}
	}
	
	for (i = 0; i < sea.indexes.length; i++) {		
		var indexes = sea.indexes[i];
		var num_index = indexes.length / 3;
		
		for (j = 0; j < num_index; j++) {
			var index = j * 3,
				indexX, indexY, indexZ;
			
			// invert faces order XZY
			indexX = indexes[index];
			indexZ = indexes[index+1];
			indexY = indexes[index+2];
			
			var face = new THREE.Face3( indexX , indexY , indexZ , 
			
				normal ? [ 
					normal[ indexX ] , 
					normal[ indexY ] , 
					normal[ indexZ ]
				] : undefined,
				
				color ? [
					color[ indexX ] ,
					color[ indexY ] ,
					color[ indexZ ]										
				] : undefined,

				i // face index
			);
			
			if (tangent) {
				face.vertexTangents = [ 
					tangent[ indexX ] , 
					tangent[ indexY ] , 
					tangent[ indexZ ]
				];
			}
			
			geo.faces.push(face);
			
			if (uv)
			{
				for (k = 0; k < uv.length; k++) {
					var _uv = [
								uv[k][indexX] ,
								uv[k][indexY] ,
								uv[k][indexZ]	
							  ];
								
					geo.faceVertexUvs[k].push( _uv );
				}
			}
			else
			{
				geo.faceVertexUvs[ 0 ].push( [
					new THREE.Vector2( 0, 0 ),
					new THREE.Vector2( 0, 1 ),
					new THREE.Vector2( 1, 1 )
				] );
			}
		}				
	}
	
	// for skeleton animation
	
	if (sea.joint) {
		var indice_buffer = [0,0,0,0];
		var weight_buffer = [0,0,0,0];
		
		var jointPerVertex = sea.jointPerVertex;
		
		if (jointPerVertex > 4) {
		
			console.warn( "SEA3D: Joint Per Vertex can not be greater than 4 (currently " + sea.jointPerVertex + "). Using compression for joints.\nTip: Use SEA3D Studio for automatic compression." );
			
			for (k = 0; k < sea.joint.length; k+=jointPerVertex) {
				
				var jointIndex = [0];
				
				// get indices with greater influence
				for (l = 1; l < jointPerVertex; l++) {		
					var w = sea.weight[k + l],
						actW = sea.weight[k + jointIndex[0]];
					
					if (w > actW) jointIndex.unshift( l );
					else jointIndex.push( l );
				}
				
				// diferrence
				var w = (1 - ((sea.weight[k + jointIndex[0]] + sea.weight[k + jointIndex[1]] +
							 sea.weight[k + jointIndex[2]] + sea.weight[k + jointIndex[3]]))) / 4;
				
				// compress
				for (l = 0; l < 4; l++) {
					i = jointIndex[l];
					
					indice_buffer[l] = sea.joint[k + i];			
					weight_buffer[l] = sea.weight[k + i] + w;
				}
				
				geo.skinIndices.push( new THREE.Vector4( indice_buffer[0], indice_buffer[1], indice_buffer[2], indice_buffer[3] ) );
				geo.skinWeights.push( new THREE.Vector4( weight_buffer[0], weight_buffer[1], weight_buffer[2], weight_buffer[3] ) );
			}			
		} else {	
			for (k = 0; k < sea.joint.length; k+=jointPerVertex) {
				
				for (l = 0; l < jointPerVertex; l++) {
					indice_buffer[l] = sea.joint[k + l];			
					weight_buffer[l] = sea.weight[k + l];
				}					
				
				geo.skinIndices.push( new THREE.Vector4( indice_buffer[0], indice_buffer[1], indice_buffer[2], indice_buffer[3] ) );
				geo.skinWeights.push( new THREE.Vector4( weight_buffer[0], weight_buffer[1], weight_buffer[2], weight_buffer[3] ) );
			}
		}
	}
	
	if (!sea.normal)
	{
		geo.computeFaceNormals();
		geo.computeVertexNormals();
	}
		
	if (this.config.tangent && !sea.tangent)
		geo.computeTangents();
	
	if (this.config.bounding)
	{
		geo.computeBoundingBox();
		geo.computeBoundingSphere();
	}
	
	geo.name = sea.name;
	
	sea.tag = geo;
}

//
//	Dummy
//

THREE.SEA3D.prototype.readDummy = function(sea) {
	var geo = new THREE.BoxGeometry( sea.width, sea.height, sea.depth, 1, 1, 1 );	
	var mat = new THREE.MeshBasicMaterial( { wireframe: true, color: THREE.SEA3D.HELPER_COLOR } );	
	
	var dummy = new THREE.Mesh( geo, mat );
	dummy.name = sea.name;
	
	this.dummys = this.dummys || [];
	this.dummys.push( this.objects["dmy/" + sea.name] = sea.tag = dummy );
			
	this.addSceneObject( sea );
	this.updateTransform(dummy, sea);
	
	this.applyDefaultAnimation( sea, THREE.SEA3D.Object3DAnimator );		
}

//
//	Line
//

THREE.SEA3D.prototype.readLine = function(sea) {	
	var geo = new THREE.Geometry();	
	geo.vertices = this.config.flip ? this.vectorToVector3Inv(sea.vertex) : this.vectorToVector3(sea.vertex);	
	
	if (sea.closed)	
		geo.vertices.push( geo.vertices[0] );	
	
	var line = new THREE.Line( geo, new THREE.LineBasicMaterial( { color: THREE.SEA3D.HELPER_COLOR, linewidth: 3 } ) );	
	line.name = sea.name;
		
	this.lines = this.lines || [];
	this.lines.push( this.objects["line/" + sea.name] = sea.tag = line );		
	
	this.addSceneObject( sea );
	this.updateTransform(line, sea);
	
	this.applyDefaultAnimation( sea, THREE.SEA3D.Object3DAnimator );		
}

//
//	Container3D
//

THREE.SEA3D.prototype.readContainer3D = function(sea) {
	var container = new THREE.SEA3D.Object3D();		
	
	this.containers = this.containers || [];
	this.containers.push( this.objects["c3d/" + sea.name] = sea.tag = container );
			
	this.addSceneObject( sea );
	this.updateTransform(container, sea);		
	
	this.applyDefaultAnimation( sea, THREE.SEA3D.Object3DAnimator );		
}

//
//	Mesh2D | Sprite
//

THREE.SEA3D.prototype.readMesh2D = function(sea) {
	var material;
	
	if ( sea.material )
	{
		if ( !sea.material.tag.sprite )
		{
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
			
	this.sprites = this.sprites || [];
	this.sprites.push( this.objects["m2d/" + sea.name] = sea.tag = sprite );
	
	this.addSceneObject( sea );		
	this.updateTransform(sprite, sea);
	sprite.scale.set( sea.width, sea.height, 1 );
}

//
//	Mesh
//

THREE.SEA3D.prototype.readMesh = function(sea) {
	var geo = sea.geometry.tag,
		mesh, mat, skeleton, skeletonAnimation, morpher, vtxAnm;
	
	for(var i = 0, count = sea.modifiers ? sea.modifiers.length : 0; i < count; i++) {
		var mod = sea.modifiers[i];
		
		switch(mod.type)
		{				
			case SEA3D.Skeleton.prototype.type:
				skeleton = mod;
				geo.bones = skeleton.tag;	
				break;
		
			case SEA3D.Morph.prototype.type:
				morpher = mod;				
				break;
		}
	}
	
	for(var i = 0, count = sea.animations ? sea.animations.length : 0; i < count; i++) {
		var anm = sea.animations[i];			
		
		switch(anm.tag.type)
		{
			case SEA3D.SkeletonAnimation.prototype.type:
				skeletonAnimation = anm.tag;
				geo.animations = this.getSkeletonAnimation( skeletonAnimation, skeleton );	
				break;
				
			case SEA3D.VertexAnimation.prototype.type:
				vtxAnm = anm.tag;								
				break;
		}
	}
	
	if (sea.material) {
		if (sea.material.length > 1) {
			var mats = [];
			
			for(var i = 0; i < sea.material.length; i++) {
				mats[i] = sea.material[i].tag;
				mats[i].skinning = skeleton != null;
				mats[i].morphTargets = morpher != null;
				mats[i].morphNormals = false;
				mats[i].vertexColors = sea.geometry.color ? THREE.VertexColors : THREE.NoColors;
			}
			
			mat = new THREE.MeshFaceMaterial( mats );
		} else {
			mat = sea.material[0].tag;
			mat.skinning = skeleton != null;
			mat.morphTargets = morpher != null;
			mat.morphNormals = false;
			mat.vertexColors = sea.geometry.color ? THREE.VertexColors : THREE.NoColors;			
		}
	}
	
	if (morpher)
		geo.morphTargets = this.getMorpher( morpher, sea.geometry );		
	
	if (skeleton) {
		mesh = new THREE.SEA3D.SkinnedMesh( geo, mat, false );				
		
		if (skeletonAnimation) {
			mesh.setAnimations( geo.animations );
			
			if (this.config.autoPlay) 
				mesh.play( mesh.animations[0].name );
		}
	} else {
		mesh = new THREE.SEA3D.Mesh( geo, mat );
		
		if (vtxAnm)
			geo.morphTargets = this.getVertexAnimation( vtxAnm );
	}
	
	mesh.name = sea.name;
	
	mesh.castShadow = sea.castShadows;
	mesh.receiveShadow = sea.material ? sea.material[0].receiveShadows : true;
	
	this.meshes = this.meshes || [];
	this.meshes.push( this.objects["m3d/" + sea.name] = sea.tag = mesh );
	
	this.addSceneObject( sea );		
	this.updateTransform(mesh, sea);		
	
	this.applyDefaultAnimation( sea, THREE.SEA3D.Object3DAnimator );
}

//
//	Sound Point
//

THREE.SEA3D.prototype.readSoundPoint = function(sea) {
	
	if (!this.audioListener) {
		 this.audioListener = new THREE.AudioListener();
		 this.container.add( this.audioListener );
	}
	
	var sound3d = new THREE.Audio( this.audioListener );
	
	sound3d.load( sea.sound.tag );
	sound3d.autoplay = sea.autoPlay;
	sound3d.setLoop( sea.autoPlay );
	sound3d.setVolume( sea.volume );
	sound3d.setRefDistance( sea.distance );
	sound3d.setRolloffFactor( this.config.audioRolloffFactor );
	
	sound3d.name = sea.name;
	
	this.sounds3d = this.sounds3d || [];
	this.sounds3d.push( this.objects["sn3d/" + sea.name] = sea.tag = sound3d );	
	
	this.addSceneObject( sea );
	this.updateTransform(sound3d, sea);
	
	this.applyDefaultAnimation( sea, THREE.SEA3D.Object3DAnimator );	
	
}

//
//	Cube Render
//

THREE.SEA3D.prototype.readCubeRender = function(sea) {	
	var cube = new THREE.CubeCamera( 0.1, 5000, THREE.SEA3D.TEXTURE_SIZE );	
	cube.renderTarget.cubeCamera = cube;	
	
	this.cubeRenderers = this.cubeRenderers || [];
	this.cubeRenderers.push( this.objects["rttc/" + sea.name] = sea.tag = cube.renderTarget );	
	
	this.addSceneObject( sea );
	this.updateTransform(cube, sea);
	
	this.applyDefaultAnimation( sea, THREE.SEA3D.Object3DAnimator );
}

//
//	Images (WDP, JPEG, PNG and GIF)
//

THREE.SEA3D.prototype.readImage = function(sea) {		
	var image = new Image(), texture = new THREE.Texture(), scope = this;
	
	texture.name = sea.name;
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;	
	texture.flipY = false;
	
	image.onload = function () { 		
		if (!scope.isPowerOfTwo(image.width) || 
			!scope.isPowerOfTwo(image.height))
		{		
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
	
	this.textures = this.textures || [];
	this.textures.push( this.objects["tex/" + sea.name] = sea.tag = texture );
}

//
//	Cube Map
//

THREE.SEA3D.prototype.readCubeMap = function(sea) {		
	var images = [], 
		texture = new THREE.Texture();
	
	// xyz(- / +) to xyz(+ / -) sequence
	var faces = [];
	faces[0] = sea.faces[1];
	faces[1] = sea.faces[0];
	faces[2] = sea.faces[3];
	faces[3] = sea.faces[2];
	faces[4] = sea.faces[5];
	faces[5] = sea.faces[4];
	
	images.loadedCount = 0;
	
	texture.name = sea.name;
	texture.image = images;	
	texture.flipY = false;	
	
	for ( var i=0, il=faces.length; i<il; ++i) {
		var cubeImage = new Image();
		images[i] = cubeImage;
		
		cubeImage.onload = function () {			
			if (++images.loadedCount == 6)
				texture.needsUpdate = true;			
		}

		cubeImage.src = this.bufferToTexture( faces[i].buffer );
	}
	
	this.cubmaps = this.cubmaps || [];
	this.cubmaps.push( this.objects["cmap/" + sea.name] = sea.tag = texture );
}

//
//	Sound (MP3, OGG)
//

THREE.SEA3D.prototype.readSound = function(sea) {	
	var sound = this.bufferToSound( sea.data.buffer );
	
	this.sounds = this.sounds || [];
	this.sounds.push( this.objects["snd/" + sea.name] = sea.tag = sound );
}

//
//	Texture URL
//

THREE.SEA3D.prototype.readTextureURL = function(sea) {	
	var texture = THREE.ImageUtils.loadTexture( sea.url );
	
	texture.name = sea.name;
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping;	
	texture.flipY = false;
	
	this.textures = this.textures || [];
	this.textures.push( this.objects["tex/" + sea.name] = sea.tag = texture );
}

//
//	JavaScript
//

SEA3D.GLOBAL = {};

SEA3D.PRINT = function() { console.log.apply(console, arguments); }
SEA3D.WATCH = function() {}

SEA3D.REF = function(ns) { return eval(ns); }

THREE.SEA3D.prototype.runJS = function(obj, script)
{
	if (obj.local === undefined) obj.local = {};
	
	var global = 
	{
		print : SEA3D.PRINT,
		watch : SEA3D.WATCH,
		sea3d : this,
		scene : this.container
	}
	
	try
	{
		this.script[script.method]
		(
			global,
			SEA3D.REF, 
			SEA3D.GLOBAL,
			obj.local,
			obj,
			script.params
		)
	}
	catch(e)
	{
		console.error('SEA3D JavaScript: Error running method "' + script.method + '".');
		console.error(e);
	}
}

THREE.SEA3D.prototype.readJavaScript = function(sea) {		
	try
	{
		var custom = 
'var watch = $GLOBAL["watch"],\n' +
'sea3d = $GLOBAL["sea3d"],\n' +
'scene = $GLOBAL["scene"],\n' +
'print = $GLOBAL["print"];';

		var src = '(' + sea.src.replace(/"%CUSTOM%"/g, custom) + ')';
		var func = eval(src);
		
		this.script = func();
	}
	catch(e)
	{
		console.error('SEA3D JavaScript: Error running "' + sea.name + '".');		
		console.error(e);
	}
}

//
//	GLSL
//

THREE.SEA3D.prototype.readGLSL = function(sea) {	
	this.glsl = this.glsl || [];
	this.glsl.push( this.objects["glsl/" + sea.name] = sea.tag = sea.src );
}

//
//	Material
//

THREE.SEA3D.prototype.blendMode = {
	normal:THREE.NormalBlending,
	add:THREE.AdditiveBlending,
	subtract:THREE.SubtractiveBlending,
	multiply:THREE.MultiplyBlending,
	screen:THREE.AdditiveBlending
}

THREE.SEA3D.prototype.materialTechnique =
(function(){
	var techniques = {}
	
	// DEFAULT
	techniques[SEA3D.Material.DEFAULT] = 	
	function(tech, mat) {		
		mat.emissive.setHex(tech.ambientColor);			
		mat.color.setHex(tech.diffuseColor);
		mat.specular.setHex(this.scaleColor(tech.specularColor, tech.specular));
		mat.shininess = tech.gloss;		
	}
	
	// DIFFUSE_MAP	
	techniques[SEA3D.Material.DIFFUSE_MAP] = 	
	function(tech, mat) {							
		mat.map = tech.texture.tag;
		mat.transparent = tech.texture.transparent;
		mat.color.setHex(0xFFFFFF);
	}
	
	// SPECULAR_MAP
	techniques[SEA3D.Material.SPECULAR_MAP] = 	
	function(tech, mat) {
		mat.specularMap = tech.texture.tag;
	}
	
	// NORMAL_MAP
	techniques[SEA3D.Material.NORMAL_MAP] = 	
	function(tech, mat) {
		mat.normalMap = tech.texture.tag;
	}
	
	// REFLECTION
	techniques[SEA3D.Material.REFLECTION] = 
	techniques[SEA3D.Material.FRESNEL_REFLECTION] = 	
	function(tech, mat) {
		mat.envMap = tech.texture.tag;		
		mat.envMap.mapping = THREE.CubeReflectionMapping;	
		mat.combine = THREE.MixOperation;
		
		mat.reflectivity = tech.alpha;
		
		//if (tech.kind == SEA3D.Material.FRESNEL_REFLECTION) {
			// not implemented
		//}
	}
	
	// REFLECTION_SPHERICAL
	techniques[SEA3D.Material.REFLECTION_SPHERICAL] = 	
	function(tech, mat) {
		mat.envMap = tech.texture.tag;		
		mat.envMap.mapping = THREE.SphericalReflectionMapping;	
		mat.combine = THREE.MixOperation;
		
		mat.reflectivity = tech.alpha;
	}
	
	// REFRACTION
	techniques[SEA3D.Material.REFRACTION_MAP] = 	
	function(tech, mat) {
		mat.envMap = tech.texture.tag;		
		mat.envMap.mapping = THREE.CubeRefractionMapping();		
		
		mat.refractionRatio = tech.ior;
		mat.reflectivity = tech.alpha;
	}
	
	// LIGHT_MAP
	techniques[SEA3D.Material.LIGHT_MAP] = 	
	function(tech, mat) {
		mat.lightMap = tech.texture.tag;
	}
	
	return techniques;
})();

THREE.SEA3D.prototype.readMaterial = function(sea) {	
	var mat = this.config.standardMaterial ? new THREE.SEA3D.StandardMaterial() : new THREE.MeshPhongMaterial();
	mat.emissiveToAmbientColor = this.config.ambientColor;
	mat.name = sea.name;
	
	mat.side = sea.bothSides ? THREE.DoubleSide : THREE.FrontSide;
	mat.shading = sea.smooth ? THREE.SmoothShading : THREE.FlatShading;
	
	if (sea.blendMode != "normal" && this.blendMode[sea.blendMode])
		mat.blending = this.blendMode[sea.blendMode];
	
	if (sea.alpha < 1 || mat.blending > THREE.NormalBlending) {
		mat.opacity = sea.alpha;
		mat.transparent = true;
	}
	
	for(var i = 0; i < sea.technique.length; i++) {
		var tech = sea.technique[i];
		
		if (this.materialTechnique[tech.kind])			
			this.materialTechnique[tech.kind].call(this, tech, mat);
	}
	
	if (mat.transparent) {
		mat.alphaTest = sea.alphaThreshold;
	}
	
	this.materials = this.materials || [];
	this.materials.push( this.objects["mat/" + sea.name] = sea.tag = mat );
}

//
//	Point Light
//

THREE.SEA3D.prototype.readPointLight = function(sea) {	
	var light = new THREE.PointLight( sea.color, sea.multiplier * this.config.multiplier );
	light.name = sea.name;
	
	if (sea.attenuation) {
		light.distance = sea.attenuation.end;
	}
	
	if (sea.shadow)		
		this.setShadowMap(light, sea.shadow.opacity);		
	
	this.lights = this.lights || [];
	this.lights.push( this.objects["lht/" + sea.name] = sea.tag = light );
		
	this.addSceneObject( sea );	
	this.updateTransform(light, sea);
	
	this.applyDefaultAnimation( sea, THREE.SEA3D.LightAnimator );	
	
	this.updateScene();
}

//
//	Hemisphere Light
//

THREE.SEA3D.prototype.readHemisphereLight = function(sea) {	
	var light = new THREE.HemisphereLight( sea.color, sea.secondColor, sea.multiplier * this.config.multiplier );
	light.name = sea.name;
	
	this.lights = this.lights || [];
	this.lights.push( this.objects["lht/" + sea.name] = sea.tag = light );
		
	this.addSceneObject( sea );			
	
	this.applyDefaultAnimation( sea, THREE.SEA3D.LightAnimator );	
	
	this.updateScene();
}

//
//	Directional Light
//

THREE.SEA3D.prototype.readDirectionalLight = function(sea) {	
	var light = new THREE.DirectionalLight( sea.color, sea.multiplier * this.config.multiplier );	
	light.name = sea.name;
			
	if (sea.shadow)		
		this.setShadowMap(light, sea.shadow.opacity);			
	
	this.lights = this.lights || [];
	this.lights.push( this.objects["lht/" + sea.name] = sea.tag = light );
	
	this.addSceneObject( sea );	
	this.updateTransform(light, sea);
	
	this.applyDefaultAnimation( sea, THREE.SEA3D.LightAnimator );		
	
	this.updateScene();
}

//
//	Camera
//

THREE.SEA3D.prototype.readCamera = function(sea) {	
	var camera = new THREE.PerspectiveCamera( sea.fov );	
	camera.name = sea.name;
			
	this.cameras = this.camera || [];
	this.cameras.push( this.objects["cam/" + sea.name] = sea.tag = camera );
	
	this.addSceneObject( sea );	
	this.updateTransform(camera, sea);
	
	this.applyDefaultAnimation( sea, THREE.SEA3D.CameraAnimator );		
}

//
//	Skeleton
//

THREE.SEA3D.prototype.readSkeleton = function(sea) {		
	var bones = [],		
		mtx_inv = new THREE.Matrix4(),
		mtx = new THREE.Matrix4(),
		mtx_loc = new THREE.Matrix4(),
		pos = new THREE.Vector3(),
		quat = new THREE.Quaternion();
	
	for (var i = 0; i < sea.joint.length; i++)
	{
		var bone = sea.joint[i]			
		
		mtx_inv.elements = bone.inverseBindMatrix; // get world inverse matrix		
		mtx.getInverse( mtx_inv ); // convert to world matrix				
		
		this.flipMatrix(mtx); // convert to three.js order
		
		if (bone.parentIndex > -1)
		{
			// to world
			
			mtx_inv.elements = sea.joint[bone.parentIndex].inverseBindMatrix;									
			mtx_loc.getInverse( mtx_inv );									
			
			this.flipMatrix(mtx_loc); // convert to three.js order
			
			// to local
			
			mtx_loc.getInverse( mtx_loc );									
			
			mtx.multiplyMatrices( mtx_loc, mtx );				
		}
		
		// mtx is local matrix
		
		pos.setFromMatrixPosition( mtx );
		quat.setFromRotationMatrix( mtx );				
		
		bones[i] = {
				name:bone.name,
				pos:[pos.x, pos.y, pos.z],				
				rotq:[quat.x, quat.y, quat.z, quat.w],
				parent:bone.parentIndex
			}		
	}
		
	sea.tag = bones;
}

//
//	Skeleton Local
//

THREE.SEA3D.prototype.readSkeletonLocal = function(sea) {	
	var bones = [];
	
	for (var i = 0; i < sea.joint.length; i++) {
		var bone = sea.joint[i];
		
		bones[i] = {
				name:bone.name,
				pos:[bone.x, bone.y, bone.z],				
				rotq:[bone.qx, bone.qy, bone.qz, bone.qw],
				parent:bone.parentIndex
			}
	}
	
	sea.tag = bones;
}

//
//	Joint Object
//

THREE.SEA3D.prototype.readJointObject = function(sea) {	
	var mesh = sea.target.tag,
		bone = mesh.skeleton.bones[sea.joint];
	
	this.joints = this.joints || [];
	this.joints.push( this.objects["jnt/" + sea.name] = sea.tag = bone );
	
}

//
//	Skeleton Animation
//

THREE.SEA3D.prototype.getSkeletonAnimation = function(sea, skl) {	
	if (sea.tag) return sea.tag;
	
	var animations = [],
		delta = sea.frameRate / 1000,
		scale = [1,1,1],
		mtx_inv = new THREE.Matrix4();
	
	for (var i = 0; i < sea.sequence.length; i++) {
		var seq = sea.sequence[i];
		
		var start = seq.start;
		var end = start + seq.count;		
		var ns = sea.name + "/" + seq.name;
		
		var animation = {
			name:ns,
			repeat:seq.repeat,
			fps:sea.frameRate,
			JIT:0,
			length:delta * (seq.count - 1),
			hierarchy:[]
		}
		
		var len = sea.pose[0].length;
		
		for (var j = 0; j < len; j++) {			
			var bone = skl.joint[j],
				node = {parent:bone.parentIndex, keys:[]},
				keys = node.keys,
				time = 0;
			
			for (var t = start; t < end; t++) {	
				var joint = sea.pose[t][j];
				
				var mtx_global = THREE.SEA3D.BUFFER2.makeRotationFromQuaternion(new THREE.Quaternion(joint.qx, joint.qy, joint.qz, joint.qw));
				mtx_global.setPosition(new THREE.Vector3(joint.x, joint.y, joint.z));						
				
				if (bone.parentIndex > -1)
				{
					// to global
					
					mtx_inv.elements = skl.joint[bone.parentIndex].inverseBindMatrix;						
															
					var mtx_rect = THREE.SEA3D.BUFFER3.getInverse( mtx_inv );
					
					mtx_global.multiplyMatrices( mtx_rect, mtx_global );	
					
					// convert to three.js matrix
					
					this.flipMatrix(mtx_global);
					
					// To Local
					
					mtx_rect.getInverse( mtx_inv );
					
					this.flipMatrix(mtx_rect); // flip parent inverse
					
					mtx_rect.getInverse( mtx_rect ); // reverse to normal direction
					
					mtx_global.multiplyMatrices( mtx_rect, mtx_global );
				}
				else
				{
					this.flipMatrix(mtx_global);
				}
				
				var posQ = THREE.SEA3D.VECBUF0.setFromMatrixPosition(mtx_global);
				var newQ = THREE.SEA3D.QUABUF0.setFromRotationMatrix(mtx_global);
				
				keys.push({
						time:time,								
						pos:[posQ.x, posQ.y, posQ.z],												
						rot:[newQ.x, newQ.y, newQ.z, newQ.w],											
						scl:scale
					});
				
				time += delta;
			}
			
			animation.hierarchy[j] = node;
		}
		
		animations.push( animation );
	}
	
	return sea.tag = animations;		
}

//
//	Morpher
//

THREE.SEA3D.prototype.getMorpher = function(sea, geo) {	
	var morphs = [],
		flip = this.config.flip ? -1 : 1;
	
	for(var i = 0; i < sea.node.length; i++) {
		var node = sea.node[i],
			vertex = [];
				
		var j = 0, k = 0;
		while(j < geo.vertex.length)
			vertex[k++] = new THREE.Vector3(
				(geo.vertex[j] + node.vertex[j++]), 
				geo.vertex[j] + node.vertex[j++], 
				(geo.vertex[j] + node.vertex[j++]) * flip
			);
		
		morphs[node.name] = i;
		morphs[i] = {
			name:node.name, 
			vertices:vertex			
		}
	}
	
	return morphs;
}

//
//	Vertex Animation
//

THREE.SEA3D.prototype.getVertexAnimation = function(sea) {	
	var vtxAnms = [],
		flip = this.config.flip ? -1 : 1;
	
	for(var i = 0; i < sea.frame.length; i++) {
		var frame = sea.frame[i],
			vertex = [];
		
		var j = 0, k = 0;
		while(j < frame.vertex.length)
			vertex[k++] = new THREE.Vector3(
				frame.vertex[j++], 
				frame.vertex[j++], 
				frame.vertex[j++] * flip
			);
		
		vtxAnms[i] = {
			vertices:vertex			
		}
	}
	
	return vtxAnms;
}

//
//	Events
//

THREE.SEA3D.Event = {
	LOAD_PROGRESS:"sea3d_progress",
	DOWNLOAD_PROGRESS:"sea3d_download",
	COMPLETE:"sea3d_complete",
	OBJECT_COMPLETE:"sea3d_object",
	ERROR:"sea3d_error"
}

THREE.SEA3D.prototype.onProgress = null;

THREE.SEA3D.prototype.onComplete = function( args ) {
	args.file = this.scope; args.type = THREE.SEA3D.Event.COMPLETE; 	
	args.file.dispatchEvent(args);
	//console.log("SEA3D:", args.message);
}

THREE.SEA3D.prototype.onLoadProgress = function( args ) {
	args.file = this.scope; args.type = THREE.SEA3D.Event.LOAD_PROGRESS;
	args.file.dispatchEvent(args);
	//console.log("SEA3D:", args.progress);	
	if (args.file.onProgress) args.file.onProgress( args );
}

THREE.SEA3D.prototype.onDownloadProgress = function( args ) {
	args.file = this.scope; args.type = THREE.SEA3D.Event.DOWNLOAD_PROGRESS;
	args.file.dispatchEvent(args);	
	//console.log("SEA3D:", args.progress);
	if (args.file.onProgress) args.file.onProgress( args );
}

THREE.SEA3D.prototype.onCompleteObject = function( args ) {
	args.file = this.scope; args.type = THREE.SEA3D.Event.OBJECT_COMPLETE;
	args.file.dispatchEvent(args);
	//console.log("SEA3D:", args.object.name + "." + args.object.type);
}

THREE.SEA3D.prototype.onError = function( args ) {
	args.file = this.scope; args.type = THREE.SEA3D.Event.ERROR;
	args.file.dispatchEvent(args);
	//console.log("SEA3D:", args.message);
}

//
//	Loader
//

THREE.SEA3D.prototype.load = function( url ) {			
	this.loadBytes();
	this.file.load(url);		
}

THREE.SEA3D.prototype.loadBytes = function( data ) {			
	this.file = new SEA3D.File( data );
	this.file.scope = this;
	this.file.onComplete = this.onComplete;
	this.file.onProgress = this.onLoadProgress;
	this.file.onCompleteObject = this.onCompleteObject;
	this.file.onDownloadProgress = this.onDownloadProgress;
	this.file.onError = this.onError;
	
	//	SEA3D
	
	switch(this.config.parser)
	{
		case THREE.SEA3D.AUTO: 
			this.file.typeRead[SEA3D.Geometry.prototype.type] = 
			this.file.typeRead[SEA3D.GeometryDelta.prototype.type] =
				this.readGeometrySwitch; 
			break;
			
		case THREE.SEA3D.BUFFER: 
			this.file.typeRead[SEA3D.Geometry.prototype.type] = 
			this.file.typeRead[SEA3D.GeometryDelta.prototype.type] = 
				this.readGeometryBuffer; 
			break;
			
		default: 
			this.file.typeRead[SEA3D.Geometry.prototype.type] = 
			this.file.typeRead[SEA3D.GeometryDelta.prototype.type] = 
				this.readGeometry; 			
			break;
	}	
	
	this.file.typeRead[SEA3D.Mesh.prototype.type] = this.readMesh;	
	this.file.typeRead[SEA3D.Mesh2D.prototype.type] = this.readMesh2D;	
	this.file.typeRead[SEA3D.Container3D.prototype.type] = this.readContainer3D;	
	this.file.typeRead[SEA3D.Dummy.prototype.type] = this.readDummy;	
	this.file.typeRead[SEA3D.Line.prototype.type] = this.readLine;	
	this.file.typeRead[SEA3D.Material.prototype.type] = this.readMaterial;
	this.file.typeRead[SEA3D.PointLight.prototype.type] = this.readPointLight;	
	this.file.typeRead[SEA3D.DirectionalLight.prototype.type] = this.readDirectionalLight;
	this.file.typeRead[SEA3D.HemisphereLight.prototype.type] = this.readHemisphereLight;
	this.file.typeRead[SEA3D.Camera.prototype.type] = this.readCamera;
	this.file.typeRead[SEA3D.Skeleton.prototype.type] = this.readSkeleton;		
	this.file.typeRead[SEA3D.SkeletonLocal.prototype.type] = this.readSkeletonLocal;	
	this.file.typeRead[SEA3D.JointObject.prototype.type] = this.readJointObject;
	this.file.typeRead[SEA3D.CubeMap.prototype.type] = this.readCubeMap;
	this.file.typeRead[SEA3D.CubeRender.prototype.type] = this.readCubeRender;	
	this.file.typeRead[SEA3D.Animation.prototype.type] = this.readAnimation;
	this.file.typeRead[SEA3D.SoundPoint.prototype.type] = this.readSoundPoint;	
	this.file.typeRead[SEA3D.TextureURL.prototype.type] = this.readTextureURL;	
	
	//	UNIVERSAL
	this.file.typeRead[SEA3D.JPEG.prototype.type] = this.readImage;		
	this.file.typeRead[SEA3D.JPEG_XR.prototype.type] = this.readImage;	
	this.file.typeRead[SEA3D.PNG.prototype.type] = this.readImage;	
	this.file.typeRead[SEA3D.GIF.prototype.type] = this.readImage;	
	this.file.typeRead[SEA3D.MP3.prototype.type] = this.readSound;	
	this.file.typeRead[SEA3D.GLSL.prototype.type] = this.readGLSL;
	this.file.typeRead[SEA3D.JavaScript.prototype.type] = this.readJavaScript;
	
	if (data) this.file.read();	
}