import { LightsNode, NodeUtils } from 'three/webgpu';

import AmbientLightDataNode from './data/AmbientLightDataNode.js';
import DirectionalLightDataNode from './data/DirectionalLightDataNode.js';
import PointLightDataNode from './data/PointLightDataNode.js';
import SpotLightDataNode from './data/SpotLightDataNode.js';
import HemisphereLightDataNode from './data/HemisphereLightDataNode.js';

const _hashData = [];

const _lightTypeToDataNode = {
	AmbientLight: AmbientLightDataNode,
	DirectionalLight: DirectionalLightDataNode,
	PointLight: PointLightDataNode,
	SpotLight: SpotLightDataNode,
	HemisphereLight: HemisphereLightDataNode
};

const _lightTypeToMaxProp = {
	DirectionalLight: 'maxDirectionalLights',
	PointLight: 'maxPointLights',
	SpotLight: 'maxSpotLights',
	HemisphereLight: 'maxHemisphereLights'
};

const isSpecialSpotLight = ( light ) => {

	return light.isSpotLight === true && ( light.map !== null || light.colorNode !== undefined );

};

const canBatchLight = ( light ) => {

	return light.isNode !== true &&
		light.castShadow !== true &&
		isSpecialSpotLight( light ) === false &&
		_lightTypeToDataNode[ light.constructor.name ] !== undefined;

};

/**
 * A custom version of `LightsNode` that batches supported analytic lights into
 * uniform arrays and loops.
 *
 * Unsupported lights, node lights, shadow-casting lights, and projected spot
 * lights keep the default per-light path.
 *
 * @augments LightsNode
 * @three_import import { DynamicLightsNode } from 'three/addons/tsl/lighting/DynamicLightsNode.js';
 */
class DynamicLightsNode extends LightsNode {

	static get type() {

		return 'DynamicLightsNode';

	}

	/**
	 * Constructs a new dynamic lights node.
	 *
	 * @param {Object} [options={}] - Dynamic lighting configuration.
	 * @param {number} [options.maxDirectionalLights=8] - Maximum number of batched directional lights.
	 * @param {number} [options.maxPointLights=16] - Maximum number of batched point lights.
	 * @param {number} [options.maxSpotLights=16] - Maximum number of batched spot lights.
	 * @param {number} [options.maxHemisphereLights=4] - Maximum number of batched hemisphere lights.
	 */
	constructor( options = {} ) {

		super();

		this.maxDirectionalLights = options.maxDirectionalLights !== undefined ? options.maxDirectionalLights : 8;
		this.maxPointLights = options.maxPointLights !== undefined ? options.maxPointLights : 16;
		this.maxSpotLights = options.maxSpotLights !== undefined ? options.maxSpotLights : 16;
		this.maxHemisphereLights = options.maxHemisphereLights !== undefined ? options.maxHemisphereLights : 4;

		this._builtinLights = [];
		this._dataNodes = new Map();

	}

	customCacheKey() {

		_hashData.push( super.customCacheKey() );

		for ( const typeName of [ ...this._dataNodes.keys() ].sort() ) {

			_hashData.push( NodeUtils.hashString( typeName ) );

		}

		const cacheKey = NodeUtils.hashArray( _hashData );

		_hashData.length = 0;

		return cacheKey;

	}

	setupLightsNode( builder ) {

		const lightNodes = super.setupLightsNode( builder );

		for ( const dataNode of this._dataNodes.values() ) {

			lightNodes.push( dataNode );

		}

		return lightNodes;

	}

	setLights( lights ) {

		const builtinLights = this._builtinLights;
		const lightsByType = new Map();

		builtinLights.length = 0;

		for ( const light of lights ) {

			if ( canBatchLight( light ) === false ) {

				builtinLights.push( light );
				continue;

			}

			const typeName = light.constructor.name;
			const typeLights = lightsByType.get( typeName );

			if ( typeLights === undefined ) {

				lightsByType.set( typeName, [ light ] );

			} else {

				typeLights.push( light );

			}

		}

		for ( const typeName of lightsByType.keys() ) {

			if ( this._dataNodes.has( typeName ) === false ) {

				const DataNodeClass = _lightTypeToDataNode[ typeName ];
				const maxProp = _lightTypeToMaxProp[ typeName ];
				const maxCount = maxProp !== undefined ? this[ maxProp ] : undefined;

				this._dataNodes.set( typeName, maxCount !== undefined ? new DataNodeClass( maxCount ) : new DataNodeClass() );

			}

		}

		for ( const [ typeName, dataNode ] of this._dataNodes ) {

			dataNode.setLights( lightsByType.get( typeName ) || [] );

		}

		return super.setLights( lights );

	}

	getBuiltinLights() {

		return this._builtinLights;

	}

	get hasLights() {

		return super.hasLights || this._dataNodes.size > 0;

	}

}

export default DynamicLightsNode;

/**
 * TSL function that creates a dynamic lights node.
 *
 * @tsl
 * @function
 * @param {Object} [options={}] - Dynamic lighting configuration.
 * @return {DynamicLightsNode} The created dynamic lights node.
 */
export const dynamicLights = ( options = {} ) => new DynamicLightsNode( options );
