import {
	Vector3,
	Object3D,
	ShadowBaseNode,
	Plane,
	Line3,
	DepthArrayTexture,
	LessCompare,
	Vector2,
	RedFormat,
	ArrayCamera,
	VSMShadowMap,
	RendererUtils,
	Quaternion
} from 'three/webgpu';

import { min, Fn, shadow, NodeUpdateType, getShadowMaterial, getRenderObjectFunction } from 'three/tsl';

const { resetRendererAndSceneState, restoreRendererAndSceneState } = RendererUtils;
let _rendererState;


class LwLight extends Object3D {

	constructor() {

		super();
		this.target = new Object3D();

	}

}
class TileShadowNode extends ShadowBaseNode {

	constructor( light, options = {} ) {

		super( light );

		// Default configuration with sensible defaults
		this.config = {
			tilesX: options.tilesX || 2,
			tilesY: options.tilesY || 2,
			resolution: options.resolution || light.shadow.mapSize,
			debug: options.debug !== undefined ? options.debug : false
		};

		this.debug = this.config.debug;

		this.originalLight = light;
		this.lightPlane = new Plane( new Vector3( 0, 1, 0 ), 0 );
		this.line = new Line3();

		this.initialLightDirection = new Vector3();
		this.updateLightDirection();

		this.shadowSize = {
			top: light.shadow.camera.top,
			bottom: light.shadow.camera.bottom,
			left: light.shadow.camera.left,
			right: light.shadow.camera.right,
		};

		this.lights = [];
		this._shadowNodes = [];

		this.tiles = this.generateTiles( this.config.tilesX, this.config.tilesY );

	}

	generateTiles( tilesX, tilesY ) {

		const tiles = [];
		const tileWidth = 1 / tilesX;
		const tileHeight = 1 / tilesY;

		for ( let y = 0; y < tilesY; y ++ ) {

			for ( let x = 0; x < tilesX; x ++ ) {

				tiles.push( {
					x: [ x * tileWidth, ( x + 1 ) * tileWidth ],
					y: [ ( tilesY - 1 - y ) * tileHeight, ( tilesY - y ) * tileHeight ], // Start from top row
					index: y * tilesX + x
				} );

			}

		}

		return tiles;

	}

	updateLightDirection() {

		this.initialLightDirection.subVectors(
			this.originalLight.target.getWorldPosition( new Vector3() ),
			this.originalLight.getWorldPosition( new Vector3() )
		).normalize();

	}

	init( builder ) {

		const light = this.originalLight;
		const parent = light.parent;

		const width = this.shadowSize.right - this.shadowSize.left;
		const height = this.shadowSize.top - this.shadowSize.bottom;

		const tileCount = this.tiles.length;
		const shadowWidth = this.config.resolution.width;
		const shadowHeight = this.config.resolution.height;

		// Clear existing lights/nodes if re-initializing
		this.disposeLightsAndNodes();

		const depthTexture = new DepthArrayTexture( shadowWidth, shadowHeight, tileCount );
		depthTexture.compareFunction = LessCompare;
		depthTexture.name = 'ShadowDepthArrayTexture';
		const shadowMap = builder.createRenderTargetArray( shadowWidth, shadowHeight, tileCount, { format: RedFormat } );
		shadowMap.depthTexture = depthTexture;
		shadowMap.texture.name = 'ShadowTexture';
		this.shadowMap = shadowMap;
		const cameras = [];


		// Create lights, one for each tile
		for ( let i = 0; i < tileCount; i ++ ) {

			const lwLight = new LwLight();
			lwLight.castShadow = true;
			const lShadow = light.shadow.clone();
			lShadow.filterNode = light.shadow.filterNode;
			const tile = this.tiles[ i ];
			lShadow.camera.left = this.shadowSize.left + width * tile.x[ 0 ];
			lShadow.camera.right = this.shadowSize.left + width * tile.x[ 1 ];
			lShadow.camera.top = this.shadowSize.bottom + height * tile.y[ 1 ];
			lShadow.camera.bottom = this.shadowSize.bottom + height * tile.y[ 0 ];
			lShadow.bias = light.shadow.bias;
			lShadow.camera.near = light.shadow.camera.near;
			lShadow.camera.far = light.shadow.camera.far;
			lShadow.camera.userData.tileIndex = i;
			lwLight.shadow = lShadow;

			if ( parent ) {

				parent.add( lwLight );
				parent.add( lwLight.target );

			} else {

				console.warn( 'TileShadowNode: Original light has no parent during init. Tile lights not added to scene graph directly.' );

			}

			this.syncLightTransformation( lwLight, light );

			this.lights.push( lwLight );
			lShadow.camera.updateMatrixWorld();

			cameras.push( lShadow.camera );
			const shadowNode = shadow( lwLight, lShadow );
			shadowNode.depthLayer = i;
			shadowNode.updateBeforeType = NodeUpdateType.NONE;

			shadowNode.setupRenderTarget = () => {

				return { shadowMap, depthTexture };

			};

			shadowNode.shadow.autoUpdate = false;
			shadowNode.shadow.needsUpdate = true;
			this._shadowNodes.push( shadowNode );

		}

		const cameraArray = new ArrayCamera( cameras );
		this.cameraArray = cameraArray;

	}

	update() {

		const light = this.originalLight;

		const shadowCam = light.shadow.camera;
		const lsMin = new Vector2( shadowCam.left, shadowCam.bottom );
		const lsMax = new Vector2( shadowCam.right, shadowCam.top );
		const fullWidth = lsMax.x - lsMin.x;
		const fullHeight = lsMax.y - lsMin.y;

		for ( let i = 0; i < this.lights.length; i ++ ) {

			const lwLight = this.lights[ i ];
			const tile = this.tiles[ i ];
			this.syncLightTransformation( lwLight, light );
			const lShadow = lwLight.shadow;
			const tileLeft = lsMin.x + tile.x[ 0 ] * fullWidth;
			const tileRight = lsMin.x + tile.x[ 1 ] * fullWidth;
			const tileBottom = lsMin.y + tile.y[ 0 ] * fullHeight;
			const tileTop = lsMin.y + tile.y[ 1 ] * fullHeight;
			lShadow.camera.left = tileLeft;
			lShadow.camera.right = tileRight;
			lShadow.camera.bottom = tileBottom;
			lShadow.camera.top = tileTop;
			lShadow.camera.near = light.shadow.camera.near;
			lShadow.camera.far = light.shadow.camera.far;
			lShadow.camera.updateProjectionMatrix();
			lShadow.camera.updateWorldMatrix( true, false );
			lShadow.camera.updateMatrixWorld( true );
			this._shadowNodes[ i ].shadow.needsUpdate = true;

		}

	}

	/**
     * Updates the shadow map rendering.
     * @param {NodeFrame} frame - A reference to the current node frame.
     */
	updateShadow( frame ) {

		const { shadowMap, light } = this;
		const { renderer, scene, camera } = frame;
		const shadowType = renderer.shadowMap.type;
		const depthVersion = shadowMap.depthTexture.version;
		this._depthVersionCached = depthVersion;
		const currentRenderObjectFunction = renderer.getRenderObjectFunction();
		const currentMRT = renderer.getMRT();
		const useVelocity = currentMRT ? currentMRT.has( 'velocity' ) : false;

		_rendererState = resetRendererAndSceneState( renderer, scene, _rendererState );
		scene.overrideMaterial = getShadowMaterial( light );
		renderer.setRenderTarget( this.shadowMap );

		for ( let index = 0; index < this.lights.length; index ++ ) {

			const light = this.lights[ index ];
			const shadow = light.shadow;
			shadow.camera.layers.mask = camera.layers.mask;
			shadow.updateMatrices( light );

			renderer.setRenderObjectFunction( getRenderObjectFunction( renderer, shadow, shadowType, useVelocity ) );
			this.shadowMap.setSize( shadow.mapSize.width, shadow.mapSize.height, shadowMap.depth );

		}

		renderer.render( scene, this.cameraArray );
		renderer.setRenderObjectFunction( currentRenderObjectFunction );

		if ( light.isPointLight !== true && shadowType === VSMShadowMap ) {

			this.vsmPass( renderer );

		}

		restoreRendererAndSceneState( renderer, scene, _rendererState );

	}

	/**
	 * The implementation performs the update of the shadow map if necessary.
	 *
	 * @param {NodeFrame} frame - A reference to the current node frame.
	 */
	updateBefore( frame ) {

		this.update();
		this.updateShadow( frame );

	}


	syncLightTransformation( lwLight, sourceLight ) {

		const sourceWorldPos = sourceLight.getWorldPosition( new Vector3() );
		const targetWorldPos = sourceLight.target.getWorldPosition( new Vector3() );
		const forward = new Vector3().subVectors( targetWorldPos, sourceWorldPos );
		const targetDistance = forward.length();
		forward.normalize();
		lwLight.position.copy( sourceWorldPos );
		lwLight.target.position.copy( sourceWorldPos ).add( forward.multiplyScalar( targetDistance ) );
		lwLight.quaternion.copy( sourceLight.getWorldQuaternion( new Quaternion() ) );
		lwLight.scale.copy( sourceLight.scale );
		lwLight.updateMatrix();
		lwLight.updateMatrixWorld( true );
		lwLight.target.updateMatrix();
		lwLight.target.updateMatrixWorld( true );

	}

	setup( builder ) {

		if ( this.lights.length === 0 ) {

			this.init( builder );

		}

		return Fn( ( builder ) => {

			this.setupShadowPosition( builder );
			return min( ...this._shadowNodes ).toVar( 'shadowValue' );

		} )();

	}

	/**
     * Helper method to remove lights and associated nodes/targets.
     * Used internally during dispose and potential re-initialization.
     */
	disposeLightsAndNodes() {

		for ( const light of this.lights ) {

			const parent = light.parent;
			if ( parent ) {

				parent.remove( light.target );
				parent.remove( light );

			}

		}

		this.lights = [];
		this._shadowNodes = [];

		if ( this.shadowMap ) {

			this.shadowMap.dispose(); // Disposes render target and textures
			this.shadowMap = null;

		}

	}


	dispose() {

		// Dispose lights, nodes, and shadow map
		this.disposeLightsAndNodes();
		super.dispose();

	}

}

export { TileShadowNode };
