import LightingNode from './LightingNode.js';
import ContextNode from '../core/ContextNode.js';
import CacheNode from '../core/CacheNode.js';
import SpecularMIPLevelNode from '../utils/SpecularMIPLevelNode.js';
import { float, mul, roughness, reflect, mix, positionViewDirection, negate, normalize, transformedNormalView, transformedNormalWorld, transformDirection, cameraViewMatrix, equirectUV, vec2, invert } from '../shadernode/ShaderNodeElements.js';

class EnvironmentNode extends LightingNode {

	constructor( envNode = null ) {

		super();

		this.envNode = envNode;

	}

	construct( builder ) {

		const envNode = this.envNode;
		const properties = builder.getNodeProperties( this );

		let reflectVec;
		let radianceTextureUVNode;
		let irradianceTextureUVNode;

		const radianceContext = new ContextNode( envNode, {
			getUVNode: ( textureNode ) => {

				let node = null;

				if ( reflectVec === undefined ) {

					reflectVec = reflect( negate( positionViewDirection ), transformedNormalView );
					reflectVec = normalize( mix( reflectVec, transformedNormalView, mul( roughness, roughness ) ) );
					reflectVec = transformDirection( reflectVec, cameraViewMatrix );

				}

				if ( textureNode.isCubeTextureNode ) {

					node = reflectVec;

				} else if ( textureNode.isTextureNode ) {

					if ( radianceTextureUVNode === undefined ) {

						// @TODO: Needed PMREM

						radianceTextureUVNode = equirectUV( reflectVec );
						radianceTextureUVNode = vec2( radianceTextureUVNode.x, invert( radianceTextureUVNode.y ) );

					}

					node = radianceTextureUVNode;

				}

				return node;

			},
			getSamplerLevelNode: () => {

				return roughness;

			},
			getMIPLevelAlgorithmNode: ( textureNode, levelNode ) => {

				return new SpecularMIPLevelNode( textureNode, levelNode );

			}
		} );

		const irradianceContext = new ContextNode( envNode, {
			getUVNode: ( textureNode ) => {

				let node = null;

				if ( textureNode.isCubeTextureNode ) {

					node = transformedNormalWorld;

				} else if ( textureNode.isTextureNode ) {

					if ( irradianceTextureUVNode === undefined ) {

						// @TODO: Needed PMREM

						irradianceTextureUVNode = equirectUV( transformedNormalWorld );
						irradianceTextureUVNode = vec2( irradianceTextureUVNode.x, invert( irradianceTextureUVNode.y ) );

					}

					node = irradianceTextureUVNode;

				}

				return node;

			},
			getSamplerLevelNode: () => {

				return float( 1 );

			},
			getMIPLevelAlgorithmNode: ( textureNode, levelNode ) => {

				return new SpecularMIPLevelNode( textureNode, levelNode );

			}
		} );

		//

		const isolateRadianceFlowContext = new CacheNode( radianceContext );

		//

		builder.context.radiance.add( isolateRadianceFlowContext );

		builder.context.iblIrradiance.add( mul( Math.PI, irradianceContext ) );

		properties.radianceContext = isolateRadianceFlowContext;
		properties.irradianceContext = irradianceContext;

	}

}

export default EnvironmentNode;
