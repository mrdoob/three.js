import LightingNode from './LightingNode.js';
import { isolate } from '../core/IsolateNode.js';
import { roughness, clearcoatRoughness } from '../core/PropertyNode.js';
import { cameraViewMatrix } from '../accessors/Camera.js';
import { normalView, clearcoatNormalView, normalWorld } from '../accessors/Normal.js';
import { positionViewDirection } from '../accessors/Position.js';
import { float, pow4 } from '../tsl/TSLBase.js';
import { bentNormalView } from '../accessors/AccessorsUtils.js';
import { pmremTexture } from '../pmrem/PMREMNode.js';
import { materialEnvIntensity } from '../accessors/MaterialProperties.js';

const _envNodeCache = new WeakMap();

/**
 * Represents a physical model for Image-based lighting (IBL). The environment
 * is defined via environment maps in the equirectangular, cube map or cubeUV (PMREM) format.
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

	}

	setup( builder ) {

		const { material } = builder;

		let envNode = this.envNode;

		if ( envNode.isTextureNode || envNode.isMaterialReferenceNode ) {

			const value = ( envNode.isTextureNode ) ? envNode.value : material[ envNode.property ];

			let cacheEnvNode = _envNodeCache.get( value );

			if ( cacheEnvNode === undefined ) {

				cacheEnvNode = pmremTexture( value );

				_envNodeCache.set( value, cacheEnvNode );

			}

			envNode	= cacheEnvNode;

		}

		//

		const useAnisotropy = material.useAnisotropy === true || material.anisotropy > 0;
		const radianceNormalView = useAnisotropy ? bentNormalView : normalView;

		const radiance = envNode.context( createRadianceContext( roughness, radianceNormalView ) ).mul( materialEnvIntensity );
		const irradiance = envNode.context( createIrradianceContext( normalWorld ) ).mul( Math.PI ).mul( materialEnvIntensity );

		const isolateRadiance = isolate( radiance );
		const isolateIrradiance = isolate( irradiance );

		//

		builder.context.radiance.addAssign( isolateRadiance );

		builder.context.iblIrradiance.addAssign( isolateIrradiance );

		//

		const clearcoatRadiance = builder.context.lightingModel.clearcoatRadiance;

		if ( clearcoatRadiance ) {

			const clearcoatRadianceContext = envNode.context( createRadianceContext( clearcoatRoughness, clearcoatNormalView ) ).mul( materialEnvIntensity );
			const isolateClearcoatRadiance = isolate( clearcoatRadianceContext );

			clearcoatRadiance.addAssign( isolateClearcoatRadiance );

		}

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

				reflectVec = reflectVec.transformDirection( cameraViewMatrix );

			}

			return reflectVec;

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
