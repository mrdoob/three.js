import ShadowBaseNode, { shadowPositionWorld } from './ShadowBaseNode.js';
import { float, vec2, vec3, int, Fn, nodeObject } from '../tsl/TSLBase.js';
import { reference } from '../accessors/ReferenceNode.js';
import { texture } from '../accessors/TextureNode.js';
import { normalWorld } from '../accessors/Normal.js';
import { mix, sqrt } from '../math/MathNode.js';
import { add } from '../math/OperatorNode.js';
import { DepthTexture } from '../../textures/DepthTexture.js';
import NodeMaterial from '../../materials/nodes/NodeMaterial.js';
import QuadMesh from '../../renderers/common/QuadMesh.js';
import { Loop } from '../utils/LoopNode.js';
import { screenCoordinate } from '../display/ScreenNode.js';
import { HalfFloatType, LessCompare, RGFormat, VSMShadowMap, WebGPUCoordinateSystem } from '../../constants.js';
import { renderGroup } from '../core/UniformGroupNode.js';
import { viewZToLogarithmicDepth } from '../display/ViewportDepthNode.js';
import { lightShadowMatrix } from '../accessors/Lights.js';
import { resetRendererAndSceneState, restoreRendererAndSceneState } from '../../renderers/common/RendererUtils.js';
import { getDataFromObject } from '../core/NodeUtils.js';
import { getShadowMaterial, BasicShadowFilter, PCFShadowFilter, PCFSoftShadowFilter, VSMShadowFilter } from './ShadowFilterNode.js';
import ChainMap from '../../renderers/common/ChainMap.js';

//

const _shadowRenderObjectLibrary = /*@__PURE__*/ new ChainMap();
const _shadowRenderObjectKeys = [];

/**
 * Creates a function to render shadow objects in a scene.
 *
 * @param {Renderer} renderer - The renderer.
 * @param {LightShadow} shadow - The light shadow object containing shadow properties.
 * @param {number} shadowType - The type of shadow map (e.g., BasicShadowMap).
 * @param {boolean} useVelocity - Whether to use velocity data for rendering.
 * @return {Function} A function that renders shadow objects.
 *
 * The returned function has the following parameters:
 * @param {Object3D} object - The 3D object to render.
 * @param {Scene} scene - The scene containing the object.
 * @param {Camera} _camera - The camera used for rendering.
 * @param {BufferGeometry} geometry - The geometry of the object.
 * @param {Material} material - The material of the object.
 * @param {Group} group - The group the object belongs to.
 * @param {...any} params - Additional parameters for rendering.
 */
export const getShadowRenderObjectFunction = ( renderer, shadow, shadowType, useVelocity ) => {

	_shadowRenderObjectKeys[ 0 ] = renderer;
	_shadowRenderObjectKeys[ 1 ] = shadow;

	let renderObjectFunction = _shadowRenderObjectLibrary.get( _shadowRenderObjectKeys );

	if ( renderObjectFunction === undefined || ( renderObjectFunction.shadowType !== shadowType || renderObjectFunction.useVelocity !== useVelocity ) ) {

		renderObjectFunction = ( object, scene, _camera, geometry, material, group, ...params ) => {

			if ( object.castShadow === true || ( object.receiveShadow && shadowType === VSMShadowMap ) ) {

				if ( useVelocity ) {

					getDataFromObject( object ).useVelocity = true;

				}

				object.onBeforeShadow( renderer, object, _camera, shadow.camera, geometry, scene.overrideMaterial, group );

				renderer.renderObject( object, scene, _camera, geometry, material, group, ...params );

				object.onAfterShadow( renderer, object, _camera, shadow.camera, geometry, scene.overrideMaterial, group );

			}

		};

		renderObjectFunction.shadowType = shadowType;
		renderObjectFunction.useVelocity = useVelocity;

		_shadowRenderObjectLibrary.set( _shadowRenderObjectKeys, renderObjectFunction );

	}

	_shadowRenderObjectKeys[ 0 ] = null;
	_shadowRenderObjectKeys[ 1 ] = null;

	return renderObjectFunction;

};

/**
 * Represents the shader code for the first VSM render pass.
 *
 * @method
 * @param {Object} inputs - The input parameter object.
 * @param {Node<float>} inputs.samples - The number of samples
 * @param {Node<float>} inputs.radius - The radius.
 * @param {Node<float>} inputs.size - The size.
 * @param {TextureNode} inputs.shadowPass - A reference to the render target's depth data.
 * @return {Node<vec2>} The VSM output.
 */
const VSMPassVertical = /*@__PURE__*/ Fn( ( { samples, radius, size, shadowPass, depthLayer } ) => {

	const mean = float( 0 ).toVar( 'meanVertical' );
	const squaredMean = float( 0 ).toVar( 'squareMeanVertical' );

	const uvStride = samples.lessThanEqual( float( 1 ) ).select( float( 0 ), float( 2 ).div( samples.sub( 1 ) ) );
	const uvStart = samples.lessThanEqual( float( 1 ) ).select( float( 0 ), float( - 1 ) );

	Loop( { start: int( 0 ), end: int( samples ), type: 'int', condition: '<' }, ( { i } ) => {

		const uvOffset = uvStart.add( float( i ).mul( uvStride ) );

		let depth = shadowPass.sample( add( screenCoordinate.xy, vec2( 0, uvOffset ).mul( radius ) ).div( size ) );

		if ( shadowPass.value.isArrayTexture ) {

			depth = depth.depth( depthLayer );

		}

		depth = depth.x;

		mean.addAssign( depth );
		squaredMean.addAssign( depth.mul( depth ) );

	} );

	mean.divAssign( samples );
	squaredMean.divAssign( samples );

	const std_dev = sqrt( squaredMean.sub( mean.mul( mean ) ) );
	return vec2( mean, std_dev );

} );

/**
 * Represents the shader code for the second VSM render pass.
 *
 * @method
 * @param {Object} inputs - The input parameter object.
 * @param {Node<float>} inputs.samples - The number of samples
 * @param {Node<float>} inputs.radius - The radius.
 * @param {Node<float>} inputs.size - The size.
 * @param {TextureNode} inputs.shadowPass - The result of the first VSM render pass.
 * @return {Node<vec2>} The VSM output.
 */
const VSMPassHorizontal = /*@__PURE__*/ Fn( ( { samples, radius, size, shadowPass, depthLayer } ) => {

	const mean = float( 0 ).toVar( 'meanHorizontal' );
	const squaredMean = float( 0 ).toVar( 'squareMeanHorizontal' );

	const uvStride = samples.lessThanEqual( float( 1 ) ).select( float( 0 ), float( 2 ).div( samples.sub( 1 ) ) );
	const uvStart = samples.lessThanEqual( float( 1 ) ).select( float( 0 ), float( - 1 ) );

	Loop( { start: int( 0 ), end: int( samples ), type: 'int', condition: '<' }, ( { i } ) => {

		const uvOffset = uvStart.add( float( i ).mul( uvStride ) );

		let distribution = shadowPass.sample( add( screenCoordinate.xy, vec2( uvOffset, 0 ).mul( radius ) ).div( size ) );

		if ( shadowPass.value.isArrayTexture ) {

			distribution = distribution.depth( depthLayer );

		}

		mean.addAssign( distribution.x );
		squaredMean.addAssign( add( distribution.y.mul( distribution.y ), distribution.x.mul( distribution.x ) ) );

	} );

	mean.divAssign( samples );
	squaredMean.divAssign( samples );

	const std_dev = sqrt( squaredMean.sub( mean.mul( mean ) ) );
	return vec2( mean, std_dev );

} );

const _shadowFilterLib = [ BasicShadowFilter, PCFShadowFilter, PCFSoftShadowFilter, VSMShadowFilter ];

//

let _rendererState;
const _quadMesh = /*@__PURE__*/ new QuadMesh();

/**
 * Represents the default shadow implementation for lighting nodes.
 *
 * @augments ShadowBaseNode
 */
class ShadowNode extends ShadowBaseNode {

	static get type() {

		return 'ShadowNode';

	}

	/**
	 * Constructs a new shadow node.
	 *
	 * @param {Light} light - The shadow casting light.
	 * @param {?LightShadow} [shadow=null] - An optional light shadow.
	 */
	constructor( light, shadow = null ) {

		super( light );

		/**
		 * The light shadow which defines the properties light's
		 * shadow.
		 *
		 * @type {?LightShadow}
		 * @default null
		 */
		this.shadow = shadow || light.shadow;

		/**
		 * A reference to the shadow map which is a render target.
		 *
		 * @type {?RenderTarget}
		 * @default null
		 */
		this.shadowMap = null;

		/**
		 * Only relevant for VSM shadows. Render target for the
		 * first VSM render pass.
		 *
		 * @type {?RenderTarget}
		 * @default null
		 */
		this.vsmShadowMapVertical = null;

		/**
		 * Only relevant for VSM shadows. Render target for the
		 * second VSM render pass.
		 *
		 * @type {?RenderTarget}
		 * @default null
		 */
		this.vsmShadowMapHorizontal = null;

		/**
		 * Only relevant for VSM shadows. Node material which
		 * is used to render the first VSM pass.
		 *
		 * @type {?NodeMaterial}
		 * @default null
		 */
		this.vsmMaterialVertical = null;

		/**
		 * Only relevant for VSM shadows. Node material which
		 * is used to render the second VSM pass.
		 *
		 * @type {?NodeMaterial}
		 * @default null
		 */
		this.vsmMaterialHorizontal = null;

		/**
		 * A reference to the output node which defines the
		 * final result of this shadow node.
		 *
		 * @type {?Node}
		 * @private
		 * @default null
		 */
		this._node = null;

		this._cameraFrameId = new WeakMap();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isShadowNode = true;

		/**
		 * This index can be used when overriding setupRenderTarget with a RenderTarget Array to specify the depth layer.
		 *
		 * @type {number}
		 * @readonly
		 * @default true
		 */
		this.depthLayer = 0;

	}

	/**
	 * Setups the shadow filtering.
	 *
	 * @param {NodeBuilder} builder - A reference to the current node builder.
	 * @param {Object} inputs - A configuration object that defines the shadow filtering.
	 * @param {Function} inputs.filterFn - This function defines the filtering type of the shadow map e.g. PCF.
	 * @param {DepthTexture} inputs.depthTexture - A reference to the shadow map's texture data.
	 * @param {Node<vec3>} inputs.shadowCoord - Shadow coordinates which are used to sample from the shadow map.
	 * @param {LightShadow} inputs.shadow - The light shadow.
	 * @return {Node<float>} The result node of the shadow filtering.
	 */
	setupShadowFilter( builder, { filterFn, depthTexture, shadowCoord, shadow, depthLayer } ) {

		const frustumTest = shadowCoord.x.greaterThanEqual( 0 )
			.and( shadowCoord.x.lessThanEqual( 1 ) )
			.and( shadowCoord.y.greaterThanEqual( 0 ) )
			.and( shadowCoord.y.lessThanEqual( 1 ) )
			.and( shadowCoord.z.lessThanEqual( 1 ) );

		const shadowNode = filterFn( { depthTexture, shadowCoord, shadow, depthLayer } );

		return frustumTest.select( shadowNode, float( 1 ) );

	}

	/**
	 * Setups the shadow coordinates.
	 *
	 * @param {NodeBuilder} builder - A reference to the current node builder.
	 * @param {Node<vec3>} shadowPosition - A node representing the shadow position.
	 * @return {Node<vec3>} The shadow coordinates.
	 */
	setupShadowCoord( builder, shadowPosition ) {

		const { shadow } = this;
		const { renderer } = builder;

		const bias = reference( 'bias', 'float', shadow ).setGroup( renderGroup );

		let shadowCoord = shadowPosition;
		let coordZ;

		if ( shadow.camera.isOrthographicCamera || renderer.logarithmicDepthBuffer !== true ) {

			shadowCoord = shadowCoord.xyz.div( shadowCoord.w );

			coordZ = shadowCoord.z;

			if ( renderer.coordinateSystem === WebGPUCoordinateSystem ) {

				coordZ = coordZ.mul( 2 ).sub( 1 ); // WebGPU: Conversion [ 0, 1 ] to [ - 1, 1 ]

			}

		} else {

			const w = shadowCoord.w;
			shadowCoord = shadowCoord.xy.div( w ); // <-- Only divide X/Y coords since we don't need Z

			// The normally available "cameraNear" and "cameraFar" nodes cannot be used here because they do not get
			// updated to use the shadow camera. So, we have to declare our own "local" ones here.
			// TODO: How do we get the cameraNear/cameraFar nodes to use the shadow camera so we don't have to declare local ones here?
			const cameraNearLocal = reference( 'near', 'float', shadow.camera ).setGroup( renderGroup );
			const cameraFarLocal = reference( 'far', 'float', shadow.camera ).setGroup( renderGroup );

			coordZ = viewZToLogarithmicDepth( w.negate(), cameraNearLocal, cameraFarLocal );

		}

		shadowCoord = vec3(
			shadowCoord.x,
			shadowCoord.y.oneMinus(), // follow webgpu standards
			coordZ.add( bias )
		);

		return shadowCoord;

	}

	/**
	 * Returns the shadow filtering function for the given shadow type.
	 *
	 * @param {number} type - The shadow type.
	 * @return {Function} The filtering function.
	 */
	getShadowFilterFn( type ) {

		return _shadowFilterLib[ type ];

	}


	setupRenderTarget( shadow, builder ) {

		const depthTexture = new DepthTexture( shadow.mapSize.width, shadow.mapSize.height );
		depthTexture.name = 'ShadowDepthTexture';
		depthTexture.compareFunction = LessCompare;

		const shadowMap = builder.createRenderTarget( shadow.mapSize.width, shadow.mapSize.height );
		shadowMap.texture.name = 'ShadowMap';
		shadowMap.texture.type = shadow.mapType;
		shadowMap.depthTexture = depthTexture;

		return { shadowMap, depthTexture };

	}

	/**
	 * Setups the shadow output node.
	 *
	 * @param {NodeBuilder} builder - A reference to the current node builder.
	 * @return {Node<vec3>} The shadow output node.
	 */
	setupShadow( builder ) {

		const { renderer } = builder;

		const { light, shadow } = this;

		const shadowMapType = renderer.shadowMap.type;

		const { depthTexture, shadowMap } = this.setupRenderTarget( shadow, builder );

		shadow.camera.updateProjectionMatrix();

		// VSM

		if ( shadowMapType === VSMShadowMap && shadow.isPointLightShadow !== true ) {

			depthTexture.compareFunction = null; // VSM does not use textureSampleCompare()/texture2DCompare()

			if ( shadowMap.depth > 1 ) {

				if ( ! shadowMap._vsmShadowMapVertical ) {

					shadowMap._vsmShadowMapVertical = builder.createRenderTarget( shadow.mapSize.width, shadow.mapSize.height, { format: RGFormat, type: HalfFloatType, depth: shadowMap.depth, depthBuffer: false } );
					shadowMap._vsmShadowMapVertical.texture.name = 'VSMVertical';

				}

				this.vsmShadowMapVertical = shadowMap._vsmShadowMapVertical;

				if ( ! shadowMap._vsmShadowMapHorizontal ) {

					shadowMap._vsmShadowMapHorizontal = builder.createRenderTarget( shadow.mapSize.width, shadow.mapSize.height, { format: RGFormat, type: HalfFloatType, depth: shadowMap.depth, depthBuffer: false } );
					shadowMap._vsmShadowMapHorizontal.texture.name = 'VSMHorizontal';

				}

				this.vsmShadowMapHorizontal = shadowMap._vsmShadowMapHorizontal;

			} else {

				this.vsmShadowMapVertical = builder.createRenderTarget( shadow.mapSize.width, shadow.mapSize.height, { format: RGFormat, type: HalfFloatType, depthBuffer: false } );
				this.vsmShadowMapHorizontal = builder.createRenderTarget( shadow.mapSize.width, shadow.mapSize.height, { format: RGFormat, type: HalfFloatType, depthBuffer: false } );

			}


			let shadowPassVertical = texture( depthTexture );

			if ( depthTexture.isArrayTexture ) {

				shadowPassVertical = shadowPassVertical.depth( this.depthLayer );

			}

			let shadowPassHorizontal = texture( this.vsmShadowMapVertical.texture );

			if ( depthTexture.isArrayTexture ) {

				shadowPassHorizontal = shadowPassHorizontal.depth( this.depthLayer );

			}

			const samples = reference( 'blurSamples', 'float', shadow ).setGroup( renderGroup );
			const radius = reference( 'radius', 'float', shadow ).setGroup( renderGroup );
			const size = reference( 'mapSize', 'vec2', shadow ).setGroup( renderGroup );

			let material = this.vsmMaterialVertical || ( this.vsmMaterialVertical = new NodeMaterial() );
			material.fragmentNode = VSMPassVertical( { samples, radius, size, shadowPass: shadowPassVertical, depthLayer: this.depthLayer } ).context( builder.getSharedContext() );
			material.name = 'VSMVertical';

			material = this.vsmMaterialHorizontal || ( this.vsmMaterialHorizontal = new NodeMaterial() );
			material.fragmentNode = VSMPassHorizontal( { samples, radius, size, shadowPass: shadowPassHorizontal, depthLayer: this.depthLayer } ).context( builder.getSharedContext() );
			material.name = 'VSMHorizontal';

		}

		//

		const shadowIntensity = reference( 'intensity', 'float', shadow ).setGroup( renderGroup );
		const normalBias = reference( 'normalBias', 'float', shadow ).setGroup( renderGroup );

		const shadowPosition = lightShadowMatrix( light ).mul( shadowPositionWorld.add( normalWorld.mul( normalBias ) ) );
		const shadowCoord = this.setupShadowCoord( builder, shadowPosition );

		//

		const filterFn = shadow.filterNode || this.getShadowFilterFn( renderer.shadowMap.type ) || null;

		if ( filterFn === null ) {

			throw new Error( 'THREE.WebGPURenderer: Shadow map type not supported yet.' );

		}

		const shadowDepthTexture = ( shadowMapType === VSMShadowMap && shadow.isPointLightShadow !== true ) ? this.vsmShadowMapHorizontal.texture : depthTexture;

		const shadowNode = this.setupShadowFilter( builder, { filterFn, shadowTexture: shadowMap.texture, depthTexture: shadowDepthTexture, shadowCoord, shadow, depthLayer: this.depthLayer } );

		let shadowColor = texture( shadowMap.texture, shadowCoord );

		if ( depthTexture.isArrayTexture ) {

			shadowColor = shadowColor.depth( this.depthLayer );

		}

		const shadowOutput = mix( 1, shadowNode.rgb.mix( shadowColor, 1 ), shadowIntensity.mul( shadowColor.a ) ).toVar();

		this.shadowMap = shadowMap;
		this.shadow.map = shadowMap;

		return shadowOutput;

	}

	/**
	 * The implementation performs the setup of the output node. An output is only
	 * produces if shadow mapping is globally enabled in the renderer.
	 *
	 * @param {NodeBuilder} builder - A reference to the current node builder.
	 * @return {ShaderCallNodeInternal} The output node.
	 */
	setup( builder ) {

		if ( builder.renderer.shadowMap.enabled === false ) return;

		return Fn( () => {

			let node = this._node;

			this.setupShadowPosition( builder );

			if ( node === null ) {

				this._node = node = this.setupShadow( builder );

			}

			if ( builder.material.shadowNode ) { // @deprecated, r171

				console.warn( 'THREE.NodeMaterial: ".shadowNode" is deprecated. Use ".castShadowNode" instead.' );

			}

			if ( builder.material.receivedShadowNode ) {

				node = builder.material.receivedShadowNode( node );

			}

			return node;

		} )();

	}

	/**
	 * Renders the shadow. The logic of this function could be included
	 * into {@link ShadowNode#updateShadow} however more specialized shadow
	 * nodes might require a custom shadow map rendering. By having a
	 * dedicated method, it's easier to overwrite the default behavior.
	 *
	 * @param {NodeFrame} frame - A reference to the current node frame.
	 */
	renderShadow( frame ) {

		const { shadow, shadowMap, light } = this;
		const { renderer, scene } = frame;

		shadow.updateMatrices( light );

		shadowMap.setSize( shadow.mapSize.width, shadow.mapSize.height, shadowMap.depth );

		renderer.render( scene, shadow.camera );

	}

	/**
	 * Updates the shadow.
	 *
	 * @param {NodeFrame} frame - A reference to the current node frame.
	 */
	updateShadow( frame ) {

		const { shadowMap, light, shadow } = this;
		const { renderer, scene, camera } = frame;

		const shadowType = renderer.shadowMap.type;

		const depthVersion = shadowMap.depthTexture.version;
		this._depthVersionCached = depthVersion;

		const _shadowCameraLayer = shadow.camera.layers.mask;

		if ( ( shadow.camera.layers.mask & 0xFFFFFFFE ) === 0 ) {

			shadow.camera.layers.mask = camera.layers.mask;

		}

		const currentRenderObjectFunction = renderer.getRenderObjectFunction();

		const currentMRT = renderer.getMRT();
		const useVelocity = currentMRT ? currentMRT.has( 'velocity' ) : false;

		_rendererState = resetRendererAndSceneState( renderer, scene, _rendererState );

		scene.overrideMaterial = getShadowMaterial( light );

		renderer.setRenderObjectFunction( getShadowRenderObjectFunction( renderer, shadow, shadowType, useVelocity ) );

		renderer.setClearColor( 0x000000, 0 );

		renderer.setRenderTarget( shadowMap );

		this.renderShadow( frame );

		renderer.setRenderObjectFunction( currentRenderObjectFunction );

		// vsm blur pass

		if ( shadowType === VSMShadowMap && shadow.isPointLightShadow !== true ) {

			this.vsmPass( renderer );

		}

		shadow.camera.layers.mask = _shadowCameraLayer;

		restoreRendererAndSceneState( renderer, scene, _rendererState );

	}

	/**
	 * For VSM additional render passes are required.
	 *
	 * @param {Renderer} renderer - A reference to the current renderer.
	 */
	vsmPass( renderer ) {

		const { shadow } = this;

		const depth = this.shadowMap.depth;
		this.vsmShadowMapVertical.setSize( shadow.mapSize.width, shadow.mapSize.height, depth );
		this.vsmShadowMapHorizontal.setSize( shadow.mapSize.width, shadow.mapSize.height, depth );

		renderer.setRenderTarget( this.vsmShadowMapVertical );
		_quadMesh.material = this.vsmMaterialVertical;
		_quadMesh.render( renderer );

		renderer.setRenderTarget( this.vsmShadowMapHorizontal );
		_quadMesh.material = this.vsmMaterialHorizontal;
		_quadMesh.render( renderer );

	}

	/**
	 * Frees the internal resources of this shadow node.
	 */
	dispose() {

		this.shadowMap.dispose();
		this.shadowMap = null;

		if ( this.vsmShadowMapVertical !== null ) {

			this.vsmShadowMapVertical.dispose();
			this.vsmShadowMapVertical = null;

			this.vsmMaterialVertical.dispose();
			this.vsmMaterialVertical = null;

		}

		if ( this.vsmShadowMapHorizontal !== null ) {

			this.vsmShadowMapHorizontal.dispose();
			this.vsmShadowMapHorizontal = null;

			this.vsmMaterialHorizontal.dispose();
			this.vsmMaterialHorizontal = null;

		}

		super.dispose();

	}

	/**
	 * The implementation performs the update of the shadow map if necessary.
	 *
	 * @param {NodeFrame} frame - A reference to the current node frame.
	 */
	updateBefore( frame ) {

		const { shadow } = this;

		let needsUpdate = shadow.needsUpdate || shadow.autoUpdate;

		if ( needsUpdate ) {

			if ( this._cameraFrameId[ frame.camera ] === frame.frameId ) {

				needsUpdate = false;

			}

			this._cameraFrameId[ frame.camera ] = frame.frameId;

		}

		if ( needsUpdate ) {

			this.updateShadow( frame );

			if ( this.shadowMap.depthTexture.version === this._depthVersionCached ) {

				shadow.needsUpdate = false;

			}

		}

	}

}

export default ShadowNode;

/**
 * TSL function for creating an instance of `ShadowNode`.
 *
 * @tsl
 * @function
 * @param {Light} light - The shadow casting light.
 * @param {?LightShadow} [shadow] - The light shadow.
 * @return {ShadowNode} The created shadow node.
 */
export const shadow = ( light, shadow ) => nodeObject( new ShadowNode( light, shadow ) );
