import {
	AnimationMixer,
	Box3,
	Mesh,
	MeshLambertMaterial,
	Object3D,
	TextureLoader,
	UVMapping,
	sRGBEncoding
} from '../../../build/three.module.js';
import { MD2Loader } from '../loaders/MD2Loader.js';

var MD2Character = function () {

	var scope = this;

	this.scale = 1;
	this.animationFPS = 6;

	this.root = new Object3D();

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

		this.skinsBody = loadTextures( config.baseUrl + 'skins/', config.skins );
		this.skinsWeapon = loadTextures( config.baseUrl + 'skins/', weaponsTextures );

		// BODY

		var loader = new MD2Loader();

		loader.load( config.baseUrl + config.body, function ( geo ) {

			var boundingBox = new Box3();
			boundingBox.setFromBufferAttribute( geo.attributes.position );

			scope.root.position.y = - scope.scale * boundingBox.min.y;

			var mesh = createPart( geo, scope.skinsBody[ 0 ] );
			mesh.scale.set( scope.scale, scope.scale, scope.scale );

			scope.root.add( mesh );

			scope.meshBody = mesh;

			scope.meshBody.clipOffset = 0;
			scope.activeAnimationClipName = mesh.geometry.animations[ 0 ].name;

			scope.mixer = new AnimationMixer( mesh );

			checkLoadingComplete();

		} );

		// WEAPONS

		var generateCallback = function ( index, name ) {

			return function ( geo ) {

				var mesh = createPart( geo, scope.skinsWeapon[ index ] );
				mesh.scale.set( scope.scale, scope.scale, scope.scale );
				mesh.visible = false;

				mesh.name = name;

				scope.root.add( mesh );

				scope.weapons[ index ] = mesh;
				scope.meshWeapon = mesh;

				checkLoadingComplete();

			};

		};

		for ( var i = 0; i < config.weapons.length; i ++ ) {

			loader.load( config.baseUrl + config.weapons[ i ][ 0 ], generateCallback( i, config.weapons[ i ][ 0 ] ) );

		}

	};

	this.setPlaybackRate = function ( rate ) {

		if ( rate !== 0 ) {

			this.mixer.timeScale = 1 / rate;

		} else {

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

	this.setSkin = function ( index ) {

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

			if ( this.meshBody.activeAction ) {

				this.meshBody.activeAction.stop();
				this.meshBody.activeAction = null;

			}

			var action = this.mixer.clipAction( clipName, this.meshBody );

			if ( action ) {

				this.meshBody.activeAction = action.play();

			}

		}

		scope.activeClipName = clipName;

		scope.syncWeaponAnimation();

	};

	this.syncWeaponAnimation = function () {

		var clipName = scope.activeClipName;

		if ( scope.meshWeapon ) {

			if ( this.meshWeapon.activeAction ) {

				this.meshWeapon.activeAction.stop();
				this.meshWeapon.activeAction = null;

			}

			var action = this.mixer.clipAction( clipName, this.meshWeapon );

			if ( action ) {

				this.meshWeapon.activeAction = action.syncWith( this.meshBody.activeAction ).play();

			}

		}

	};

	this.update = function ( delta ) {

		if ( this.mixer ) this.mixer.update( delta );

	};

	function loadTextures( baseUrl, textureUrls ) {

		var textureLoader = new TextureLoader();
		var textures = [];

		for ( var i = 0; i < textureUrls.length; i ++ ) {

			textures[ i ] = textureLoader.load( baseUrl + textureUrls[ i ], checkLoadingComplete );
			textures[ i ].mapping = UVMapping;
			textures[ i ].name = textureUrls[ i ];
			textures[ i ].encoding = sRGBEncoding;

		}

		return textures;

	}

	function createPart( geometry, skinMap ) {

		var materialWireframe = new MeshLambertMaterial( { color: 0xffaa00, wireframe: true, morphTargets: true, morphNormals: true } );
		var materialTexture = new MeshLambertMaterial( { color: 0xffffff, wireframe: false, map: skinMap, morphTargets: true, morphNormals: true } );

		//

		var mesh = new Mesh( geometry, materialTexture );
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

export { MD2Character };
