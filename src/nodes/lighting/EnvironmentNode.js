import LightingNode from './LightingNode.js';
import { isolate } from '../core/IsolateNode.js';
import { roughness, clearcoatRoughness, retroreflectivity } from '../core/PropertyNode.js';
import { cameraWorldMatrix } from '../accessors/Camera.js';
import { normalView, clearcoatNormalView, normalWorld } from '../accessors/Normal.js';
import { positionViewDirection } from '../accessors/Position.js';
import { float, pow4, vec3 } from '../tsl/TSLBase.js';
import { bentNormalView } from '../accessors/AccessorsUtils.js';
import { pmremTexture } from '../pmrem/PMREMNode.js';
import { materialEnvIntensity } from '../accessors/MaterialProperties.js';
import { NodeUpdateType } from '../core/constants.js';

const _rendererCache = new WeakMap();

/**
 * Represents a physical model for Image-based lighting (IBL). The environment
 * is defined by an equirectangular or cube texture.
 * `EnvironmentNode` is intended for PBR materials like {@link MeshStandardNodeMaterial}.
 *
 * @augments LightingNode
 */
class EnvironmentNode extends LightingNode {

	static get type() {

		return 'EnvironmentNode';

	}

	/**
	 * Constructs a new environment node.
	 *
	 * @param {Node} [envNode=null] - A node representing the environment.
	 */
	constructor( envNode = null ) {

		super();

		/**
		 * A node representing the environment.
		 *
		 * @type {?Node}
		 * @default null
		 */
		this.envNode = envNode;

		/**
		 * The PMREM node of a texture or material reference environment. Its texture is
		 * resolved before rendering since materials with different environments can share a shader.
		 *
		 * @private
		 * @type {?PMREMNode}
		 * @default null
		 */
		this._pmremNode = null;

	}

	setup( builder ) {

		const { material } = builder;

		let envNode = this.envNode;

		if ( envNode && ( envNode.isTextureNode || envNode.isMaterialReferenceNode ) ) {

			const cache = this._getPMREMNodeCache( builder.renderer );

			let pmremNode = cache.get( envNode );

			if ( pmremNode === undefined ) {

				pmremNode = pmremTexture( this._getEnvTexture( builder ) );

				cache.set( envNode, pmremNode );

			}

			this._pmremNode = pmremNode;
			this.updateBeforeType = envNode.isMaterialReferenceNode ? NodeUpdateType.OBJECT : NodeUpdateType.RENDER;

			envNode = pmremNode;

		}

		//

		const useAnisotropy = material.useAnisotropy === true || material.anisotropy > 0;
		const radianceNormalView = useAnisotropy ? bentNormalView : normalView;

		const specular = builder.context.indirectSpecularNode;
		const sampleSpecular = ( samplingContext, normal = normalWorld ) => specular
			? specular.sample( { direction: samplingContext.getUV(), normal, viewDirection: positionViewDirection.transformDirection( cameraWorldMatrix ), roughness: samplingContext.getTextureLevel() } ).rgb
			: envNode.context( samplingContext ).mul( materialEnvIntensity );

		let radiance = isolate( sampleSpecular( createRadianceContext( roughness, radianceNormalView ), radianceNormalView.transformDirection( cameraWorldMatrix ) ) );

		if ( material.useRetroreflection === true || material.retroreflectivity > 0 ) {

			const retroRadiance = isolate( sampleSpecular( createRetroRadianceContext( roughness, radianceNormalView ), radianceNormalView.transformDirection( cameraWorldMatrix ) ) );

			radiance = retroreflectivity.clamp().mix( radiance, retroRadiance );

		}

		// Resolve the broad lobe separately for specular multiple scattering.
		// Ordinary environment diffuse lighting keeps its own irradiance.
		const irradiance = sampleSpecular( createIrradianceContext( normalWorld ) ).mul( Math.PI );
		const isolateIrradiance = isolate( irradiance );
		const diffuseIrradiance = envNode
			? ( specular ? isolate( envNode.context( createIrradianceContext( normalWorld ) ).mul( Math.PI ).mul( materialEnvIntensity ) ) : isolateIrradiance )
			: vec3( 0 );

		//

		builder.context.radiance.addAssign( radiance );

		builder.context.iblIrradiance.addAssign( isolateIrradiance );
		builder.context.iblDiffuseIrradiance.addAssign( diffuseIrradiance );

		//

		const clearcoatRadiance = builder.context.lightingModel.clearcoatRadiance;

		if ( clearcoatRadiance ) {

			const clearcoatRadianceContext = sampleSpecular( createRadianceContext( clearcoatRoughness, clearcoatNormalView ), clearcoatNormalView.transformDirection( cameraWorldMatrix ) );
			const isolateClearcoatRadiance = isolate( clearcoatRadianceContext );

			clearcoatRadiance.addAssign( isolateClearcoatRadiance );

		}

	}

	updateBefore( frame ) {

		const texture = this._getEnvTexture( frame );

		// the texture can be removed without a rebuild of the material

		if ( texture && this._pmremNode.value !== texture ) {

			this._pmremNode.value = texture;
			this._pmremNode.updateBefore( frame );

		}

	}

	/**
	 * Returns the current texture of the environment node.
	 *
	 * @private
	 * @param {(NodeFrame|NodeBuilder)} state - The current state.
	 * @return {Texture} The environment texture.
	 */
	_getEnvTexture( state ) {

		const envNode = this.envNode;
		if ( envNode === null ) return null;

		if ( envNode.isMaterialReferenceNode ) {

			envNode.updateReference( state );

			return envNode.getValueFromReference();

		}

		return envNode.value;

	}

	/**
	 * Returns the PMREM node cache of the current renderer.
	 *
	 * @private
	 * @param {Renderer} renderer - The current renderer.
	 * @return {WeakMap} The node cache.
	 */
	_getPMREMNodeCache( renderer ) {

		let pmremCache = _rendererCache.get( renderer );

		if ( pmremCache === undefined ) {

			pmremCache = new WeakMap();

			_rendererCache.set( renderer, pmremCache );

		}

		return pmremCache;

	}

}

export default EnvironmentNode;

const createRadianceContext = ( roughnessNode, normalViewNode ) => {

	let reflectVec = null;

	return {
		getUV: () => {

			if ( reflectVec === null ) {

				reflectVec = positionViewDirection.negate().reflect( normalViewNode );

				// Mixing the reflection with the normal is more accurate and keeps rough objects from gathering light from behind their tangent plane.
				reflectVec = pow4( roughnessNode ).mix( reflectVec, normalViewNode ).normalize();

				reflectVec = reflectVec.transformDirection( cameraWorldMatrix );

			}

			return reflectVec;

		},
		getTextureLevel: () => {

			return roughnessNode;

		}
	};

};

const createRetroRadianceContext = ( roughnessNode, normalViewNode ) => {

	let retroVec = null;

	return {
		getUV: () => {

			if ( retroVec === null ) {

				// The retroreflective lobe returns light toward its source, so the environment is sampled along the view direction
				retroVec = pow4( roughnessNode ).mix( positionViewDirection, normalViewNode ).normalize();

				retroVec = retroVec.transformDirection( cameraWorldMatrix );

			}

			return retroVec;

		},
		getTextureLevel: () => {

			return roughnessNode;

		}
	};

};

const createIrradianceContext = ( normalWorldNode ) => {

	return {
		getUV: () => {

			return normalWorldNode;

		},
		getTextureLevel: () => {

			return float( 1.0 );

		}
	};

};
