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

	this.onLoadComplete = function () {};

	this.loadCounter = 0;

	this.loadParts = function ( config ) {

		this.loadCounter = config.weapons.length * 2 + config.skins.length + 1;

		var weaponsTextures = []
		for ( var i = 0; i < config.weapons.length; i ++ ) weaponsTextures[ i ] = config.weapons[ i ][ 1 ];

		// SKINS

		this.skinsBody = loadTextures( config.baseUrl + "skins/", config.skins );
		this.skinsWeapon = loadTextures( config.baseUrl + "skins/", weaponsTextures );

		// BODY

		var loader = new THREE.JSONLoader();

		loader.load( config.baseUrl + config.body, function( geo ) {

			geo.computeBoundingBox();
			scope.root.position.y = - scope.scale * geo.boundingBox.min.y;

			var mesh = createPart( geo, scope.skinsBody[ 0 ] );
			mesh.scale.set( scope.scale, scope.scale, scope.scale );

			scope.root.add( mesh );

			scope.meshBody = mesh;
			scope.activeAnimation = geo.firstAnimation;

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

		}

		for ( var i = 0; i < config.weapons.length; i ++ ) {

			loader.load( config.baseUrl + config.weapons[ i ][ 0 ], generateCallback( i, config.weapons[ i ][ 0 ] ) );

		}

	};

	this.setPlaybackRate = function ( rate ) {

		if ( this.meshBody ) this.meshBody.duration = this.meshBody.baseDuration / rate;
		if ( this.meshWeapon ) this.meshWeapon.duration = this.meshWeapon.baseDuration / rate;

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

			activeWeapon.playAnimation( this.activeAnimation, this.animationFPS );

			this.meshWeapon.baseDuration = this.meshWeapon.duration;

			this.meshWeapon.time = this.meshBody.time;
			this.meshWeapon.duration = this.meshBody.duration;

		}

	};

	this.setAnimation = function ( animationName ) {

		if ( this.meshBody ) {

			this.meshBody.playAnimation( animationName, this.animationFPS );
			this.meshBody.baseDuration = this.meshBody.duration;

		}

		if ( this.meshWeapon ) {

			this.meshWeapon.playAnimation( animationName, this.animationFPS );
			this.meshWeapon.baseDuration = this.meshWeapon.duration;
			this.meshWeapon.time = this.meshBody.time;

		}

		this.activeAnimation = animationName;

	};

	this.update = function ( delta ) {

		if ( this.meshBody ) {

			this.meshBody.updateAnimation( 1000 * delta );

		}

		if ( this.meshWeapon ) {

			this.meshWeapon.updateAnimation( 1000 * delta );

		}

	};

	function loadTextures( baseUrl, textureUrls ) {

		var mapping = THREE.UVMapping;
		var textures = [];

		for ( var i = 0; i < textureUrls.length; i ++ ) {

			textures[ i ] = THREE.ImageUtils.loadTexture( baseUrl + textureUrls[ i ], mapping, checkLoadingComplete );
			textures[ i ].name = textureUrls[ i ];

		}

		return textures;

	};

	function createPart( geometry, skinMap ) {

		geometry.computeMorphNormals();

		var whiteMap = THREE.ImageUtils.generateDataTexture( 1, 1, new THREE.Color( 0xffffff ) );
		var materialWireframe = new THREE.MeshPhongMaterial( { color: 0xffaa00, specular: 0x111111, shininess: 50, wireframe: true, shading: THREE.SmoothShading, map: whiteMap, morphTargets: true, morphNormals: true, metal: false } );

		var materialTexture = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x111111, shininess: 50, wireframe: false, shading: THREE.SmoothShading, map: skinMap, morphTargets: true, morphNormals: true, metal: false } );
		materialTexture.wrapAround = true;

		//

		var mesh = new THREE.MorphAnimMesh( geometry, materialTexture );
		mesh.rotation.y = -Math.PI/2;

		mesh.castShadow = true;
		mesh.receiveShadow = true;

		//

		mesh.materialTexture = materialTexture;
		mesh.materialWireframe = materialWireframe;

		//

		mesh.parseAnimations();

		mesh.playAnimation( geometry.firstAnimation, scope.animationFPS );
		mesh.baseDuration = mesh.duration;

		return mesh;

	};

	function checkLoadingComplete() {

		scope.loadCounter -= 1;

		if ( scope.loadCounter === 0 ) scope.onLoadComplete();

	};

};
