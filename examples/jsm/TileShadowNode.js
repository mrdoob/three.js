import {
	Vector3,
	Object3D,
	ShadowBaseNode,
	Plane,
	Line3,
	CameraHelper,
	DepthArrayTexture,
	LessCompare,
	Vector2,
	RedFormat,
	Mesh,
	PlaneGeometry,
	NodeMaterial,
	DoubleSide,
	ArrayCamera,
	VSMShadowMap,
	NodeUtils,
	RendererUtils,
	Quaternion } from 'three/webgpu';

import { min, Fn, shadow, vec4, vec3, texture, uv, positionLocal, vec2, float, positionWorld, renderGroup, reference, objectPosition, screenSize } from 'three/tsl';

const { getDataFromObject } = NodeUtils;
const { resetRendererAndSceneState, restoreRendererAndSceneState } = RendererUtils;
let _rendererState;

const shadowMaterialLib = /*@__PURE__*/ new WeakMap();
const linearDistance = /*@__PURE__*/ Fn( ( [ position, cameraNear, cameraFar ] ) => {

	let dist = positionWorld.sub( position ).length();
	dist = dist.sub( cameraNear ).div( cameraFar.sub( cameraNear ) );
	dist = dist.saturate(); // clamp to [ 0, 1 ]

	return dist;

} );

const linearShadowDistance = ( light ) => {

	const camera = light.shadow.camera;

	const nearDistance = reference( 'near', 'float', camera ).setGroup( renderGroup );
	const farDistance = reference( 'far', 'float', camera ).setGroup( renderGroup );

	const referencePosition = objectPosition( light );

	return linearDistance( referencePosition, nearDistance, farDistance );

};

const getShadowMaterial = ( light ) => {

	let material = shadowMaterialLib.get( light );

	if ( material === undefined ) {

		const depthNode = light.isPointLight ? linearShadowDistance( light ) : null;

		material = new NodeMaterial();
		material.colorNode = vec4( 0, 0, 0, 1 );
		material.depthNode = depthNode;
		material.isShadowPassMaterial = true; // Use to avoid other overrideMaterial override material.colorNode unintentionally when using material.shadowNode
		material.name = 'ShadowMaterial';
		material.fog = false;

		shadowMaterialLib.set( light, material );

	}

	return material;

};


class LwLight extends Object3D {

	constructor() {

		super();
		this.target = new Object3D();

	}

}

class TileShadowNode extends ShadowBaseNode {

	constructor( light, camera, scene, options = {} ) {

		super( light );

		// Default configuration with sensible defaults
		this.config = {
			tilesX: options.tilesX || 2, // Default to 2x2 grid as before
			tilesY: options.tilesY || 2,
			resolution: options.resolution || light.shadow.mapSize,
			debug: options.debug !== undefined ? options.debug : true
		};

		this.camera = camera;
		this.debug = this.config.debug;

		this.originalLight = light;
		this.lightPlane = new Plane( new Vector3( 0, 1, 0 ), 0 );
		this.line = new Line3();

		// Store the initial light direction to track rotation changes
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
		this._shadowCamHelper = [];

		// Generate tiles based on configuration parameters
		this.tiles = this.generateTiles( this.config.tilesX, this.config.tilesY );

		this.scene = scene;

	}

	// Generate a grid of tiles based on the specified dimensions
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

		// Calculate and store light direction in world space
		this.initialLightDirection.subVectors(
			this.originalLight.target.getWorldPosition( new Vector3() ),
			this.originalLight.getWorldPosition( new Vector3() )
		).normalize();

	}

	// Updated init method to pass tile info to syncLightTransformation
	init( builder ) {

		this.camera = builder.camera;
		const light = this.originalLight;
		const parent = light.parent;

		const width = this.shadowSize.right - this.shadowSize.left;
		const height = this.shadowSize.top - this.shadowSize.bottom;

		const tileCount = this.tiles.length;
		const shadowWidth = this.config.resolution.width;
		const shadowHeight = this.config.resolution.height;

		const depthTexture = new DepthArrayTexture( shadowWidth, shadowHeight, tileCount );
		depthTexture.compareFunction = LessCompare;
		depthTexture.name = 'ShadowDepthArrayTexture';

		const shadowMap = builder.createRenderTargetArray( shadowWidth, shadowHeight, tileCount, {
	  format: RedFormat
		} );

		const cameras = [];

		shadowMap.depthTexture = depthTexture;
		shadowMap.texture.name = 'ShadowTexture';
		this.shadowMap = shadowMap;

		// Create lights, one for each tile
		for ( let i = 0; i < tileCount; i ++ ) {

			const lwLight = new LwLight();
			lwLight.castShadow = true;

			// Clone the original light's shadow properties
			const lShadow = light.shadow.clone();

			lShadow.filterNode = light.shadow.filterNode;
			// Get the tile configuration
			const tile = this.tiles[ i ];

			// Set the shadow camera dimensions for this tile
			lShadow.camera.left = this.shadowSize.left + width * tile.x[ 0 ];
			lShadow.camera.right = this.shadowSize.left + width * tile.x[ 1 ];
			lShadow.camera.top = this.shadowSize.bottom + height * tile.y[ 1 ];
			lShadow.camera.bottom = this.shadowSize.bottom + height * tile.y[ 0 ];

			// Maintain other shadow properties
			lShadow.bias = light.shadow.bias;
			lShadow.camera.near = light.shadow.camera.near;
			lShadow.camera.far = light.shadow.camera.far;
			lShadow.camera.userData.tileIndex = i;

			lwLight.shadow = lShadow;

			parent.add( lwLight );
			parent.add( lwLight.target );

			// Initialize with the original light's position and rotation
			// but centered on the appropriate tile
			this.syncLightTransformation( lwLight, light );

			this.lights.push( lwLight );
			lShadow.camera.updateMatrixWorld();

			cameras.push( lShadow.camera );
			const shadowNode = shadow( lwLight, lShadow );
			shadowNode._depthLayer = i;
			shadowNode.updateBefore = () => {};

			shadowNode.setupRenderTarget = () => {

				return { shadowMap, depthTexture };

			};

			// Since we're baking shadows once at init, disable auto updates:
			shadowNode.shadow.autoUpdate = false;
			shadowNode.shadow.needsUpdate = true;

			this._shadowNodes.push( shadowNode );

		}

		const camera = new ArrayCamera( cameras );
		this.cameraArray = camera;

		if ( this.debug ) {

	  		this.setupDebugDisplay();

		}

	}

	// Update method also needs to be modified to pass tile info
	update() {

		const light = this.originalLight;

		// Get current bounds from the original light's shadow camera
		const shadowCam = light.shadow.camera;
		const lsMin = new Vector2( shadowCam.left, shadowCam.bottom );
		const lsMax = new Vector2( shadowCam.right, shadowCam.top );

		// Calculate tile dimensions based on the full light frustum
		const fullWidth = lsMax.x - lsMin.x;
		const fullHeight = lsMax.y - lsMin.y;

		// Update each tile light with transformations
		for ( let i = 0; i < this.lights.length; i ++ ) {

			const lwLight = this.lights[ i ];
			const tile = this.tiles[ i ];

			// Sync transformation including position, rotation, and target
			// centered on the appropriate tile
			this.syncLightTransformation( lwLight, light );

			const lShadow = lwLight.shadow;

			// Calculate this tile's boundaries
			const tileLeft = lsMin.x + tile.x[ 0 ] * fullWidth;
			const tileRight = lsMin.x + tile.x[ 1 ] * fullWidth;
			const tileBottom = lsMin.y + tile.y[ 0 ] * fullHeight;
			const tileTop = lsMin.y + tile.y[ 1 ] * fullHeight;

			// Update the frustum boundaries for this tile
			lShadow.camera.left = tileLeft;
			lShadow.camera.right = tileRight;
			lShadow.camera.bottom = tileBottom;
			lShadow.camera.top = tileTop;

			// Near and far properties
			lShadow.camera.near = light.shadow.camera.near;
			lShadow.camera.far = light.shadow.camera.far;

			// Update projection and world matrices
			lShadow.camera.updateProjectionMatrix();
			lShadow.camera.updateWorldMatrix( true, false );
			lShadow.camera.updateMatrixWorld( true );

			// Mark for update
			this._shadowNodes[ i ].shadow.needsUpdate = true;

		}

		// Update debug helpers if needed
		if ( this.debug && this._shadowCamHelper ) {

			for ( const helper of this._shadowCamHelper ) {

				if ( helper ) {

					helper.update();
					helper.updateMatrixWorld( true );

				}

			}

		}

	}

	/**
		 * Updates the shadow.
		 *
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

			renderer.setRenderObjectFunction( ( object, scene, _camera, geometry, material, group, ...params ) => {

				if ( object.castShadow === true || ( object.receiveShadow && shadowType === VSMShadowMap ) ) {

					if ( useVelocity ) {

						getDataFromObject( object ).useVelocity = true;

					}

					object.onBeforeShadow( renderer, object, camera, shadow.camera, geometry, scene.overrideMaterial, group );

					renderer.renderObject( object, scene, _camera, geometry, material, group, ...params );

					object.onAfterShadow( renderer, object, camera, shadow.camera, geometry, scene.overrideMaterial, group );

				}

			} );

			this.shadowMap.setSize( shadow.mapSize.width, shadow.mapSize.height, shadowMap.depth );

		}

		renderer.render( scene, this.cameraArray );
		// this.renderShadow( frame );

		renderer.setRenderObjectFunction( currentRenderObjectFunction );

		// vsm blur pass

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


	// New method to handle debug display setup
	setupDebugDisplay() {

		const tilesX = this.config.tilesX;
		const tilesY = this.config.tilesY;

		// Create a display for each shadow map
		for ( let i = 0; i < this.tiles.length; i ++ ) {

			// Create a simple plane with a single quad
			const display = new Mesh( new PlaneGeometry( 1, 1 ), new NodeMaterial() );

			// Set render order to ensure they appear on top
			display.renderOrder = 9999999;
			display.material.transparent = true;
			display.frustumCulled = false;
			display.side = DoubleSide;

			// Disable depth testing to ensure visibility
			display.material.depthTest = false;
			display.material.depthWrite = false;

			// Calculate row and column for display grid
			const col = i % tilesX;
			const row = Math.floor( i / tilesX );

			display.material.vertexNode = Fn( () => {

				const aspectRatio = screenSize.x.div( screenSize.y );

				// Calculate display size based on number of tiles
				const maxTiles = Math.max( tilesX, tilesY );
				const displaySize = float( 0.8 / maxTiles ); // Size adapts to number of tiles
				const margin = float( 0.01 );
				const cornerOffset = float( 0.05 );

				// Start from left for x-axis to match logical tile layout (left-to-right)
				const xBase = float( - 1.0 ).add( cornerOffset ).add(
					displaySize.div( 2 ).div( aspectRatio )
				).add( float( col ).mul( displaySize.div( aspectRatio ).add( margin ) ) );

				// Start from top for y-axis to match logical tile layout (top-to-bottom)
				const yBase = float( 1.0 ).sub( cornerOffset ).sub(
					displaySize.div( 2 )
				).sub( float( row ).mul( displaySize.add( margin ) ) );

				const scaledPos = vec2(
					positionLocal.x.mul( displaySize.div( aspectRatio ) ),
					positionLocal.y.mul( displaySize )
				);

				const finalPos = vec2(
					scaledPos.x.add( xBase ),
					scaledPos.y.add( yBase )
				);

				return vec4( finalPos.x, finalPos.y, 0.0, 1.0 );

			} )();

			// Sample the depth texture at the proper index
			display.material.outputNode = Fn( () => {

				const sampledDepth = texture( this.shadowMap.depthTexture )
					.sample( uv().flipY() )
					.depth( float( i ) )
					.compare( .9 );

				// Use different color tints for each tile to make them distinguishable
				// Calculate a unique color based on the tile index
				const r = float( 0.5 + ( i % 3 ) * 0.16 );
				const g = float( 0.5 + ( i % 2 ) * 0.25 );
				const b = float( 0.7 + ( i % 4 ) * 0.075 );

				return vec4(
					vec3( r, g, b )
						.mul( sampledDepth )
						.saturate()
						.rgb,
					1
				);

			} )();

			// Add to the scene
			this.scene.add( display );

			// Create camera helper
			this._shadowCamHelper[ i ] = new CameraHelper(
				this._shadowNodes[ i ].shadow.camera
			);
			this._shadowCamHelper[ i ].fog = false;
			this.scene.add( this._shadowCamHelper[ i ] );

		}

	}

	syncLightTransformation( lwLight, sourceLight ) {

		const sourceWorldPos = sourceLight.getWorldPosition( new Vector3() );
		const targetWorldPos = sourceLight.target.getWorldPosition( new Vector3() );
		const forward = new Vector3().subVectors( targetWorldPos, sourceWorldPos );
		const targetDistance = forward.length();
		forward.normalize();

		// Use original position without offsets
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

			// Start with the first shadow node
			const shadowValue = this._shadowNodes[ 0 ].toVar( 'shadowValue' );

			// Combine all shadow values using min function
			for ( let i = 1; i < this._shadowNodes.length; i ++ ) {

				shadowValue.assign( min( shadowValue, this._shadowNodes[ i ] ) );

			}

			return shadowValue;

		} )();

	}

	dispose() {

		for ( const light of this.lights ) {

			const parent = light.parent;
			if ( parent ) {

				parent.remove( light.target );
				parent.remove( light );

			}

		}

		// Remove debug helpers
		if ( this.debug && this._shadowCamHelper ) {

			for ( const helper of this._shadowCamHelper ) {

				if ( helper ) {

					this.scene.remove( helper );

				}

			}

		}

		this.originalLight.visible = true;
		super.dispose();

	}

}

export { TileShadowNode };
