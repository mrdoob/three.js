import {
	AnimationMixer,
	Box3,
	Mesh,
	MeshLambertMaterial,
	Object3D,
	TextureLoader,
	UVMapping,
	SRGBColorSpace
} from 'three';
import { MD2Loader } from '../loaders/MD2Loader.js';

/**
 * This class represents a management component for animated MD2
 * character assets.
 *
 * @three_import import { MD2Character } from 'three/addons/misc/MD2Character.js';
 */
class MD2Character {

	/**
	 * Constructs a new MD2 character.
	 */
	constructor() {

		/**
		 * The mesh scale.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.scale = 1;

		/**
		 * The FPS
		 *
		 * @type {number}
		 * @default 6
		 */
		this.animationFPS = 6;

		/**
		 * The root 3D object
		 *
		 * @type {Object3D}
		 */
		this.root = new Object3D();

		/**
		 * The body mesh.
		 *
		 * @type {?Mesh}
		 * @default null
		 */
		this.meshBody = null;

		/**
		 * The weapon mesh.
		 *
		 * @type {?Mesh}
		 * @default null
		 */
		this.meshWeapon = null;

		/**
		 * The body skins.
		 *
		 * @type {Array<Texture>}
		 */
		this.skinsBody = [];

		/**
		 * The weapon skins.
		 *
		 * @type {Array<Texture>}
		 */
		this.skinsWeapon = [];

		/**
		 * The weapon meshes.
		 *
		 * @type {Array<Mesh>}
		 */
		this.weapons = [];

		/**
		 * The name of the active animation clip.
		 *
		 * @type {?string}
		 * @default null
		 */
		this.activeAnimationClipName = null;

		/**
		 * The animation mixer.
		 *
		 * @type {?AnimationMixer}
		 * @default null
		 */
		this.mixer = null;

		/**
		 * The `onLoad` callback function.
		 *
		 * @type {Function}
		 */
		this.onLoadComplete = function () {};

		// internal

		this.loadCounter = 0;

	}

	/**
	 * Loads the character model for the given config.
	 *
	 * @param {Object} config - The config which defines the model and textures paths.
	 */
	loadParts( config ) {

		const scope = this;

		function createPart( geometry, skinMap ) {

			const materialWireframe = new MeshLambertMaterial( { color: 0xffaa00, wireframe: true } );
			const materialTexture = new MeshLambertMaterial( { color: 0xffffff, wireframe: false, map: skinMap } );

			//

			const mesh = new Mesh( geometry, materialTexture );
			mesh.rotation.y = - Math.PI / 2;

			mesh.castShadow = true;
			mesh.receiveShadow = true;

			//

			mesh.materialTexture = materialTexture;
			mesh.materialWireframe = materialWireframe;

			return mesh;

		}

		function loadTextures( baseUrl, textureUrls ) {

			const textureLoader = new TextureLoader();
			const textures = [];

			for ( let i = 0; i < textureUrls.length; i ++ ) {

				textures[ i ] = textureLoader.load( baseUrl + textureUrls[ i ], checkLoadingComplete );
				textures[ i ].mapping = UVMapping;
				textures[ i ].name = textureUrls[ i ];
				textures[ i ].colorSpace = SRGBColorSpace;

			}

			return textures;

		}

		function checkLoadingComplete() {

			scope.loadCounter -= 1;

			if ( scope.loadCounter === 0 ) scope.onLoadComplete();

		}

		this.loadCounter = config.weapons.length * 2 + config.skins.length + 1;

		const weaponsTextures = [];
		for ( let i = 0; i < config.weapons.length; i ++ ) weaponsTextures[ i ] = config.weapons[ i ][ 1 ];
		// SKINS

		this.skinsBody = loadTextures( config.baseUrl + 'skins/', config.skins );
		this.skinsWeapon = loadTextures( config.baseUrl + 'skins/', weaponsTextures );

		// BODY

		const loader = new MD2Loader();

		loader.load( config.baseUrl + config.body, function ( geo ) {

			const boundingBox = new Box3();
			boundingBox.setFromBufferAttribute( geo.attributes.position );

			scope.root.position.y = - scope.scale * boundingBox.min.y;

			const mesh = createPart( geo, scope.skinsBody[ 0 ] );
			mesh.scale.set( scope.scale, scope.scale, scope.scale );

			scope.root.add( mesh );

			scope.meshBody = mesh;

			scope.meshBody.clipOffset = 0;
			scope.activeAnimationClipName = mesh.geometry.animations[ 0 ].name;

			scope.mixer = new AnimationMixer( mesh );

			checkLoadingComplete();

		} );

		// WEAPONS

		const generateCallback = function ( index, name ) {

			return function ( geo ) {

				const mesh = createPart( geo, scope.skinsWeapon[ index ] );
				mesh.scale.set( scope.scale, scope.scale, scope.scale );
				mesh.visible = false;

				mesh.name = name;

				scope.root.add( mesh );

				scope.weapons[ index ] = mesh;
				scope.meshWeapon = mesh;

				checkLoadingComplete();

			};

		};

		for ( let i = 0; i < config.weapons.length; i ++ ) {

			loader.load( config.baseUrl + config.weapons[ i ][ 0 ], generateCallback( i, config.weapons[ i ][ 0 ] ) );

		}

	}

	/**
	 * Sets the animation playback rate.
	 *
	 * @param {number} rate - The playback rate to set.
	 */
	setPlaybackRate( rate ) {

		if ( rate !== 0 ) {

			this.mixer.timeScale = 1 / rate;

		} else {

			this.mixer.timeScale = 0;

		}

	}

	/**
	 * Sets the wireframe material flag.
	 *
	 * @param {boolean} wireframeEnabled - Whether to enable wireframe rendering or not.
	 */
	setWireframe( wireframeEnabled ) {

		if ( wireframeEnabled ) {

			if ( this.meshBody ) this.meshBody.material = this.meshBody.materialWireframe;
			if ( this.meshWeapon ) this.meshWeapon.material = this.meshWeapon.materialWireframe;

		} else {

			if ( this.meshBody ) this.meshBody.material = this.meshBody.materialTexture;
			if ( this.meshWeapon ) this.meshWeapon.material = this.meshWeapon.materialTexture;

		}

	}

	/**
	 * Sets the skin defined by the given skin index. This will result in a different texture
	 * for the body mesh.
	 *
	 * @param {number} index - The skin index.
	 */
	setSkin( index ) {

		if ( this.meshBody && this.meshBody.material.wireframe === false ) {

			this.meshBody.material.map = this.skinsBody[ index ];

		}

	}

	/**
	 * Sets the weapon defined by the given weapon index. This will result in a different weapon
	 * hold by the character.
	 *
	 * @param {number} index - The weapon index.
	 */
	setWeapon( index ) {

		for ( let i = 0; i < this.weapons.length; i ++ ) this.weapons[ i ].visible = false;

		const activeWeapon = this.weapons[ index ];

		if ( activeWeapon ) {

			activeWeapon.visible = true;
			this.meshWeapon = activeWeapon;

			this.syncWeaponAnimation();

		}

	}

	/**
	 * Sets the defined animation clip as the active animation.
	 *
	 * @param {string} clipName - The name of the animation clip.
	 */
	setAnimation( clipName ) {

		if ( this.meshBody ) {

			if ( this.meshBody.activeAction ) {

				this.meshBody.activeAction.stop();
				this.meshBody.activeAction = null;

			}

			const action = this.mixer.clipAction( clipName, this.meshBody );

			if ( action ) {

				this.meshBody.activeAction = action.play();

			}

		}

		this.activeClipName = clipName;

		this.syncWeaponAnimation();

	}

	/**
	 * Synchronizes the weapon with the body animation.
	 */
	syncWeaponAnimation() {

		const clipName = this.activeClipName;

		if ( this.meshWeapon ) {

			if ( this.meshWeapon.activeAction ) {

				this.meshWeapon.activeAction.stop();
				this.meshWeapon.activeAction = null;

			}

			const action = this.mixer.clipAction( clipName, this.meshWeapon );

			if ( action ) {

				this.meshWeapon.activeAction = action.syncWith( this.meshBody.activeAction ).play();

			}

		}

	}

	/**
	 * Updates the animations of the mesh. Must be called inside the animation loop.
	 *
	 * @param {number} delta - The delta time in seconds.
	 */
	update( delta ) {

		if ( this.mixer ) this.mixer.update( delta );

	}

}

export { MD2Character };
