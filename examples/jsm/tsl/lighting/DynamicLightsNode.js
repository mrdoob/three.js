import { LightsNode, NodeUtils, warn } from 'three/webgpu';
import { nodeObject } from 'three/tsl';

import AmbientLightDataNode from './data/AmbientLightDataNode.js';
import DirectionalLightDataNode from './data/DirectionalLightDataNode.js';
import PointLightDataNode from './data/PointLightDataNode.js';
import SpotLightDataNode from './data/SpotLightDataNode.js';
import HemisphereLightDataNode from './data/HemisphereLightDataNode.js';

const _lightNodeRef = /*@__PURE__*/ new WeakMap();
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

const sortLights = ( lights ) => lights.sort( ( a, b ) => a.id - b.id );

const isSpecialSpotLight = ( light ) => {

	return light.isSpotLight === true && ( light.map !== null || light.colorNode !== undefined );

};

const canBatchLight = ( light ) => {

	return light.isNode !== true &&
		light.castShadow !== true &&
		isSpecialSpotLight( light ) === false &&
		_lightTypeToDataNode[ light.constructor.name ] !== undefined;

};

const getOrCreateLightNode = ( light, nodeLibrary ) => {

	const lightNodeClass = nodeLibrary.getLightNodeClass( light.constructor );

	if ( lightNodeClass === null ) {

		warn( `DynamicLightsNode: Light node not found for ${ light.constructor.name }.` );
		return null;

	}

	if ( _lightNodeRef.has( light ) === false ) {

		_lightNodeRef.set( light, new lightNodeClass( light ) );

	}

	return _lightNodeRef.get( light );

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

		this._dataNodes = new Map();

	}

	customCacheKey() {

		const typeSet = new Set();

		for ( let i = 0; i < this._lights.length; i ++ ) {

			const light = this._lights[ i ];

			if ( canBatchLight( light ) ) {

				typeSet.add( light.constructor.name );

			} else {

				_hashData.push( light.id );
				_hashData.push( light.castShadow ? 1 : 0 );

				if ( light.isSpotLight === true ) {

					const hashMap = light.map !== null ? light.map.id : - 1;
					const hashColorNode = light.colorNode ? light.colorNode.getCacheKey() : - 1;

					_hashData.push( hashMap, hashColorNode );

				}

			}

		}

		for ( const typeName of this._dataNodes.keys() ) {

			typeSet.add( typeName );

		}

		for ( const typeName of [ ...typeSet ].sort() ) {

			_hashData.push( NodeUtils.hashString( typeName ) );

		}

		const cacheKey = NodeUtils.hashArray( _hashData );

		_hashData.length = 0;

		return cacheKey;

	}

	setupLightsNode( builder ) {

		const lightNodes = [];
		const lightsByType = new Map();
		const lights = sortLights( this._lights );
		const nodeLibrary = builder.renderer.library;

		for ( const light of lights ) {

			if ( light.isNode === true ) {

				lightNodes.push( nodeObject( light ) );
				continue;

			}

			if ( canBatchLight( light ) ) {

				const typeName = light.constructor.name;
				const typeLights = lightsByType.get( typeName );

				if ( typeLights === undefined ) {

					lightsByType.set( typeName, [ light ] );

				} else {

					typeLights.push( light );

				}

				continue;

			}

			const lightNode = getOrCreateLightNode( light, nodeLibrary );

			if ( lightNode !== null ) {

				lightNodes.push( lightNode );

			}

		}

		for ( const [ typeName, typeLights ] of lightsByType ) {

			let dataNode = this._dataNodes.get( typeName );

			if ( dataNode === undefined ) {

				const DataNodeClass = _lightTypeToDataNode[ typeName ];
				const maxProp = _lightTypeToMaxProp[ typeName ];
				const maxCount = maxProp !== undefined ? this[ maxProp ] : undefined;

				dataNode = maxCount !== undefined ? new DataNodeClass( maxCount ) : new DataNodeClass();

				this._dataNodes.set( typeName, dataNode );

			}

			dataNode.setLights( typeLights );
			lightNodes.push( dataNode );

		}

		for ( const [ typeName, dataNode ] of this._dataNodes ) {

			if ( lightsByType.has( typeName ) === false ) {

				dataNode.setLights( [] );
				lightNodes.push( dataNode );

			}

		}

		this._lightNodes = lightNodes;

	}

	setLights( lights ) {

		super.setLights( lights );

		if ( this._dataNodes.size > 0 ) {

			this._updateDataNodeLights( lights );

		}

		return this;

	}

	_updateDataNodeLights( lights ) {

		const lightsByType = new Map();

		for ( const light of lights ) {

			if ( canBatchLight( light ) === false ) continue;

			const typeName = light.constructor.name;
			const typeLights = lightsByType.get( typeName );

			if ( typeLights === undefined ) {

				lightsByType.set( typeName, [ light ] );

			} else {

				typeLights.push( light );

			}

		}

		for ( const [ typeName, dataNode ] of this._dataNodes ) {

			dataNode.setLights( lightsByType.get( typeName ) || [] );

		}

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
