import LightingNode from './LightingNode.js';
import { roughness, clearcoatRoughness } from '../core/PropertyNode.js';
import { cameraViewMatrix } from '../accessors/CameraNode.js';
import { transformedClearcoatNormalView, transformedNormalView, transformedNormalWorld } from '../accessors/NormalNode.js';
import { positionViewDirection } from '../accessors/PositionNode.js';
import { addNodeClass } from '../core/Node.js';
import { float, vec2, setCurrentBuilder } from '../shadernode/ShaderNode.js';
import { cubeTexture } from '../accessors/CubeTextureNode.js';
import { reference } from '../accessors/ReferenceNode.js';

const envNodeCache = new WeakMap();

class EnvironmentNode extends LightingNode {

	constructor( envNode = null ) {

		super();

		this.envNode = envNode;

	}

	setup( builder ) {

		//super.setup( builder );

		let envNode = this.envNode;

		if ( envNode.isTextureNode === true && envNode.isCubeTextureNode !== true ) {

			const texture = envNode.value;

			envNode = envNodeCache.get( texture );

			if ( envNode === undefined ) {

				// @TODO: Add dispose logic here
				const cubeRTT = builder.getCubeRenderTarget( 512 ).fromEquirectangularTexture( builder.renderer, texture );

				setCurrentBuilder( builder ); // we need this because .fromEquirectangularTexture() makes some .render() calls, which change the current node builder

				envNode = cubeTexture( cubeRTT.texture );

				envNodeCache.set( texture, envNode );

			}

		}

		const intensity = reference( 'envMapIntensity', 'float', builder.material ); // @TODO: Add materialEnvIntensity in MaterialNode
		envNode = envNode.rgb.mul( intensity );

		//

		builder.context.radiance.addAssign( envNode.context( createRadianceContext( roughness, transformedNormalView ) ) );
		builder.context.iblIrradiance.addAssign( envNode.context( createIrradianceContext( transformedNormalWorld ) ).mul( Math.PI ) );

		//

		const clearcoatRadiance = builder.context.lightingModel.clearcoatRadiance;

		if ( clearcoatRadiance ) {

			clearcoatRadiance.addAssign( envNode.context( createRadianceContext( clearcoatRoughness, transformedClearcoatNormalView ) ) );

		}

	}

}

const createRadianceContext = ( roughnessNode, normalViewNode ) => {

	let reflectVec = null;
	let textureUVNode = null;

	return {
		getUVNode( textureNode ) {

			let node = null;

			if ( reflectVec === null ) {

				reflectVec = positionViewDirection.negate().reflect( normalViewNode );
				reflectVec = roughnessNode.mul( roughnessNode ).mix( reflectVec, normalViewNode ).normalize();
				reflectVec = reflectVec.transformDirection( cameraViewMatrix );

			}

			if ( textureNode.isCubeTextureNode ) {

				node = reflectVec;

			} else if ( textureNode.isTextureNode ) {

				if ( textureUVNode === null ) {

					// @TODO: Needed PMREM

					textureUVNode = reflectVec.equirectUV();

				}

				node = textureUVNode;

			}

			return node;

		},

		getSamplerLevelNode() {

			return roughnessNode;

		},

		getMipLevelAlgorithmNode( textureNode, levelNode ) {

			return textureNode.specularMipLevel( levelNode );

		}
	};

};

const createIrradianceContext = ( normalWorldNode ) => {

	let textureUVNode = null;

	return {
		getUVNode( textureNode ) {

			let node = null;

			if ( textureNode.isCubeTextureNode ) {

				node = normalWorldNode;

			} else if ( textureNode.isTextureNode ) {

				if ( textureUVNode === null ) {

					// @TODO: Needed PMREM

					textureUVNode = normalWorldNode.equirectUV();
					textureUVNode.y.oneMinusAssign();

				}

				node = textureUVNode;

			}

			return node;

		},

		getSamplerLevelNode() {

			return float( 1 );

		},

		getMipLevelAlgorithmNode( textureNode, levelNode ) {

			return textureNode.specularMipLevel( levelNode );

		}
	};

};

export default EnvironmentNode;

addNodeClass( 'EnvironmentNode', EnvironmentNode );
