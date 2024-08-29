import { registerNode } from '../core/Node.js';
import LightingNode from './LightingNode.js';
import { cache } from '../core/CacheNode.js';
import { roughness, clearcoatRoughness } from '../core/PropertyNode.js';
import { cameraViewMatrix } from '../accessors/Camera.js';
import { transformedClearcoatNormalView, transformedNormalView, transformedNormalWorld } from '../accessors/Normal.js';
import { positionViewDirection } from '../accessors/Position.js';
import { float } from '../tsl/TSLBase.js';
import { reference } from '../accessors/ReferenceNode.js';
import { transformedBentNormalView } from '../accessors/AccessorsUtils.js';
import { pmremTexture } from '../pmrem/PMREMNode.js';

const _envNodeCache = new WeakMap();

class EnvironmentNode extends LightingNode {

	constructor( envNode = null ) {

		super();

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

		const envMap = material.envMap;
		const intensity = envMap ? reference( 'envMapIntensity', 'float', builder.material ) : reference( 'environmentIntensity', 'float', builder.scene ); // @TODO: Add materialEnvIntensity in MaterialNode

		const useAnisotropy = material.useAnisotropy === true || material.anisotropy > 0;
		const radianceNormalView = useAnisotropy ? transformedBentNormalView : transformedNormalView;

		const radiance = envNode.context( createRadianceContext( roughness, radianceNormalView ) ).mul( intensity );
		const irradiance = envNode.context( createIrradianceContext( transformedNormalWorld ) ).mul( Math.PI ).mul( intensity );

		const isolateRadiance = cache( radiance );
		const isolateIrradiance = cache( irradiance );

		//

		builder.context.radiance.addAssign( isolateRadiance );

		builder.context.iblIrradiance.addAssign( isolateIrradiance );

		//

		const clearcoatRadiance = builder.context.lightingModel.clearcoatRadiance;

		if ( clearcoatRadiance ) {

			const clearcoatRadianceContext = envNode.context( createRadianceContext( clearcoatRoughness, transformedClearcoatNormalView ) ).mul( intensity );
			const isolateClearcoatRadiance = cache( clearcoatRadianceContext );

			clearcoatRadiance.addAssign( isolateClearcoatRadiance );

		}

	}

}

export default EnvironmentNode;

EnvironmentNode.type = /*@__PURE__*/ registerNode( 'Environment', EnvironmentNode );

const createRadianceContext = ( roughnessNode, normalViewNode ) => {

	let reflectVec = null;

	return {
		getUV: () => {

			if ( reflectVec === null ) {

				reflectVec = positionViewDirection.negate().reflect( normalViewNode );

				// Mixing the reflection with the normal is more accurate and keeps rough objects from gathering light from behind their tangent plane.
				reflectVec = roughnessNode.mul( roughnessNode ).mix( reflectVec, normalViewNode ).normalize();

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
