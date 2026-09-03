import Node from '../core/Node.js';
import NodeMaterial from '../../materials/nodes/NodeMaterial.js';
import ChainMap from '../../renderers/common/ChainMap.js';
import { getDataFromObject } from '../core/NodeUtils.js';
import { NodeUpdateType } from '../core/constants.js';
import { property, vec4 } from '../tsl/TSLBase.js';
import { positionWorld } from '../accessors/Position.js';
import { NoBlending, VSMShadowMap } from '../../constants.js';

const _shadowMaterialLib = /*@__PURE__*/ new WeakMap();
const _shadowRenderObjectLibrary = /*@__PURE__*/ new ChainMap();
const _shadowRenderObjectKeys = [];

/**
 * Retrieves or creates a shadow material for the given light source.
 *
 * This function checks if a shadow material already exists for the provided light.
 * If not, it creates a new `NodeMaterial` configured for shadow rendering and stores it
 * in the `shadowMaterialLib` for future use.
 *
 * @private
 * @function
 * @param {Light} light - The light source for which the shadow material is needed.
 *                         If the light is a point light, a depth node is calculated
 *                         using the linear shadow distance.
 * @returns {NodeMaterial} The shadow material associated with the given light.
 */
const _getShadowMaterial = ( light ) => {

	let material = _shadowMaterialLib.get( light );

	if ( material === undefined ) {

		material = new NodeMaterial();
		material.colorNode = vec4( 0, 0, 0, 1 );
		material.isShadowPassMaterial = true; // Use to avoid other overrideMaterial override material.colorNode unintentionally when using material.shadowNode
		material.name = 'ShadowMaterial';
		material.blending = NoBlending;
		material.fog = false;

		_shadowMaterialLib.set( light, material );

	}

	return material;

};

/**
 * Disposes the shadow material for the given light source.
 *
 * @private
 * @param {Light} light - The light source.
 */
const _disposeShadowMaterial = ( light ) => {

	const material = _shadowMaterialLib.get( light );

	if ( material !== undefined ) {

		material.dispose();
		_shadowMaterialLib.delete( light );

	}

};

/**
 * Creates a function to render shadow objects in a scene.
 *
 * @private
 * @function
 * @param {Renderer} renderer - The renderer.
 * @param {LightShadow} shadow - The light shadow object containing shadow properties.
 * @param {number} shadowType - The type of shadow map (e.g., BasicShadowMap).
 * @param {boolean} useVelocity - Whether to use velocity data for rendering.
 * @return {shadowRenderObjectFunction} A function that renders shadow objects.
 */
const _getShadowRenderObjectFunction = ( renderer, shadow, shadowType, useVelocity ) => {

	_shadowRenderObjectKeys[ 0 ] = renderer;
	_shadowRenderObjectKeys[ 1 ] = shadow;

	let renderObjectFunction = _shadowRenderObjectLibrary.get( _shadowRenderObjectKeys );

	if ( renderObjectFunction === undefined || ( renderObjectFunction.shadowType !== shadowType || renderObjectFunction.useVelocity !== useVelocity ) ) {

		renderObjectFunction = ( object, scene, _camera, geometry, material, group, lightsNode, clippingContext, passId ) => {

			if ( object.castShadow === true || ( object.receiveShadow && shadowType === VSMShadowMap ) ) {

				if ( useVelocity ) {

					getDataFromObject( object ).useVelocity = true;

				}

				object.onBeforeShadow( renderer, object, _camera, shadow.camera, geometry, scene.overrideMaterial, group );

				renderer.renderObject( object, scene, _camera, geometry, material, group, lightsNode, clippingContext, passId );

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
 * Base class for all shadow nodes.
 *
 * Shadow nodes encapsulate shadow related logic and are always coupled to lighting nodes.
 * Lighting nodes might share the same shadow node type or use specific ones depending on
 * their requirements.
 *
 * @augments Node
 */
class ShadowBaseNode extends Node {

	static get type() {

		return 'ShadowBaseNode';

	}

	/**
	 * Constructs a new shadow base node.
	 *
	 * @param {Light} light - The shadow casting light.
	 */
	constructor( light ) {

		super();

		/**
		 * The shadow casting light.
		 *
		 * @type {Light}
		 */
		this.light = light;

		/**
		 * Overwritten since shadows are updated by default per render.
		 *
		 * @type {string}
		 * @default 'render'
		 */
		this.updateBeforeType = NodeUpdateType.RENDER;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isShadowBaseNode = true;

	}

	/**
	 * Retrieves or creates a shadow material for the shadow casting light source.
	 *
	 * This method checks if a shadow material already exists for the provided light in the internal library.
	 * If not, it creates a new `NodeMaterial` configured for shadow rendering and stores it for future use.
	 *
	 * @return {NodeMaterial} The shadow material associated with the given light.
	 */
	getShadowMaterial() {

		return _getShadowMaterial( this.light );

	}

	/**
	 * Disposes the shadow material for the shadow casting light source.
	 */
	disposeShadowMaterial() {

		_disposeShadowMaterial( this.light );

	}

	/**
	 * Returns a function to render shadow objects in a scene for the given light shadow and renderer.
	 *
	 * @param {Renderer} renderer - The renderer.
	 * @param {LightShadow} [shadow=this.light.shadow] - The light shadow object containing shadow properties.
	 * @return {Function} A function that renders shadow objects.
	 */
	getShadowRenderObjectFunction( renderer, shadow = this.light.shadow ) {

		const shadowType = renderer.shadowMap.type;

		const currentMRT = renderer.getMRT();
		const useVelocity = currentMRT ? currentMRT.has( 'velocity' ) : false;

		return _getShadowRenderObjectFunction( renderer, shadow, shadowType, useVelocity );

	}

	/**
	 * Setups the shadow position node which is by default the predefined TSL node object `shadowPositionWorld`.
	 *
	 * @param {NodeBuilder} object - A configuration object that must at least hold a material reference.
	 */
	setupShadowPosition( { context, material } ) {

		// Use assign inside an Fn()

		shadowPositionWorld.assign( material.receivedShadowPositionNode || context.shadowPositionWorld || positionWorld );

	}

}

/**
 * TSL object that represents the vertex position in world space during the shadow pass.
 *
 * @tsl
 * @type {Node<vec3>}
 */
export const shadowPositionWorld = /*@__PURE__*/ property( 'vec3', 'shadowPositionWorld' );

export default ShadowBaseNode;
