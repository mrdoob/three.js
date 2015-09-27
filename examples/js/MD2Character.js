/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.MD2Character = function () {

	var scope = this;

	this.scale = 1;
	this.animationFPS = 6;

	this.root = new THREE.Object3D();

	this.meshBody = null;
	this.meshWeapon = null;

	this.skinsBody = [];
	this.skinsWeapon = [];

	this.weapons = [];

	this.activeAnimation = null;

	this.mixer = null;

	this.onLoadComplete = function () {};

	this.loadCounter = 0;

	this.loadParts = function ( config ) {

		this.loadCounter = config.weapons.length * 2 + config.skins.length + 1;

		var weaponsTextures = [];
		for ( var i = 0; i < config.weapons.length; i ++ ) weaponsTextures[ i ] = config.weapons[ i ][ 1 ];

		// SKINS

		this.skinsBody = loadTextures( config.baseUrl + "skins/", config.skins );
		this.skinsWeapon = loadTextures( config.baseUrl + "skins/", weaponsTextures );

		// BODY

		var loader = new THREE.MD2Loader();

		loader.load( config.baseUrl + config.body, function( geo ) {

			geo.computeBoundingBox();
			scope.root.position.y = - scope.scale * geo.boundingBox.min.y;

			var mesh = createPart( geo, scope.skinsBody[ 0 ] );
			mesh.scale.set( scope.scale, scope.scale, scope.scale );

			scope.root.add( mesh );

			scope.meshBody = mesh;

			scope.meshBody.clipOffset = 0;
			scope.activeAnimationClipName = mesh.geometry.animations[0].name;

			scope.mixer = new THREE.AnimationMixer( mesh );

			checkLoadingComplete();

		} );

		// WEAPONS

		var generateCallback = function ( index, name ) {

			return function( geo ) {

				var mesh = createPart( geo, scope.skinsWeapon[ index ] );
				mesh.scale.set( scope.scale, scope.scale, scope.scale );
				mesh.visible = false;

				mesh.name = name;

				scope.root.add( mesh );

				scope.weapons[ index ] = mesh;
				scope.meshWeapon = mesh;

				checkLoadingComplete();

			}

		};

		for ( var i = 0; i < config.weapons.length; i ++ ) {

			loader.load( config.baseUrl + config.weapons[ i ][ 0 ], generateCallback( i, config.weapons[ i ][ 0 ] ) );

		}

	};

	this.setPlaybackRate = function ( rate ) {

		if( rate !== 0 ) {
			this.mixer.timeScale = 1 / rate;
		}
		else {
			this.mixer.timeScale = 0;
		}

	};

	this.setWireframe = function ( wireframeEnabled ) {

		if ( wireframeEnabled ) {

			if ( this.meshBody ) this.meshBody.material = this.meshBody.materialWireframe;
			if ( this.meshWeapon ) this.meshWeapon.material = this.meshWeapon.materialWireframe;

		} else {

			if ( this.meshBody ) this.meshBody.material = this.meshBody.materialTexture;
			if ( this.meshWeapon ) this.meshWeapon.material = this.meshWeapon.materialTexture;

		}

	};

	this.setSkin = function( index ) {

		if ( this.meshBody && this.meshBody.material.wireframe === false ) {

			this.meshBody.material.map = this.skinsBody[ index ];

		}

	};

	this.setWeapon = function ( index ) {

		for ( var i = 0; i < this.weapons.length; i ++ ) this.weapons[ i ].visible = false;

		var activeWeapon = this.weapons[ index ];

		if ( activeWeapon ) {

			activeWeapon.visible = true;
			this.meshWeapon = activeWeapon;

			scope.syncWeaponAnimation();

		}

	};

	this.setAnimation = function ( clipName ) {

		if ( this.meshBody ) {

			if( this.meshBody.activeAction ) {
				scope.mixer.removeAction( this.meshBody.activeAction );
				this.meshBody.activeAction = null;
			}

			var clip = THREE.AnimationClip.findByName( this.meshBody.geometry.animations, clipName );
			if( clip ) {

				var action = new THREE.AnimationAction( clip, this.mixer.time ).setLocalRoot( this.meshBody );
				scope.mixer.addAction( action );

				this.meshBody.activeAction = action;

			}

		}

		scope.activeClipName = clipName;

		scope.syncWeaponAnimation();

	};

	this.syncWeaponAnimation = function() {

		var clipName = scope.activeClipName;

		if ( scope.meshWeapon ) {

			if( this.meshWeapon.activeAction ) {
				scope.mixer.removeAction( this.meshWeapon.activeAction );
				this.meshWeapon.activeAction = null;
			}

			var clip = THREE.AnimationClip.findByName( this.meshWeapon.geometry.animations, clipName );
			if( clip ) {

				var action = new THREE.AnimationAction( clip ).syncWith( this.meshBody.activeAction ).setLocalRoot( this.meshWeapon );
				scope.mixer.addAction( action );

				this.meshWeapon.activeAction = action;

			}

		}
			
	}

	this.update = function ( delta ) {

		if( this.mixer ) this.mixer.update( delta );

	};

	function loadTextures( baseUrl, textureUrls ) {

		var mapping = THREE.UVMapping;
		var textures = [];

		for ( var i = 0; i < textureUrls.length; i ++ ) {

			textures[ i ] = THREE.ImageUtils.loadTexture( baseUrl + textureUrls[ i ], mapping, checkLoadingComplete );
			textures[ i ].name = textureUrls[ i ];

		}

		return textures;

	}

	function createPart( geometry, skinMap ) {

		var materialWireframe = new THREE.MeshLambertMaterial( { color: 0xffaa00, wireframe: true, morphTargets: true, morphNormals: true } );
		var materialTexture = new THREE.MeshLambertMaterial( { color: 0xffffff, wireframe: false, map: skinMap, morphTargets: true, morphNormals: true } );

		//

		var mesh = new THREE.Mesh( geometry, materialTexture );
		mesh.rotation.y = - Math.PI / 2;

		mesh.castShadow = true;
		mesh.receiveShadow = true;

		//

		mesh.materialTexture = materialTexture;
		mesh.materialWireframe = materialWireframe;
	
		return mesh;

	}

	function checkLoadingComplete() {

		scope.loadCounter -= 1;

		if ( scope.loadCounter === 0 ) scope.onLoadComplete();

	}

};
