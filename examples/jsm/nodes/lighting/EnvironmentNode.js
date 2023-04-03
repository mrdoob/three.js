import LightingNode from './LightingNode.js';
import { cache } from '../core/CacheNode.js';
import { context } from '../core/ContextNode.js';
import { roughness } from '../core/PropertyNode.js';
import { equirectUV } from '../utils/EquirectUVNode.js';
import { specularMIPLevel } from '../utils/SpecularMIPLevelNode.js';
import { cameraViewMatrix } from '../accessors/CameraNode.js';
import { transformedNormalView, transformedNormalWorld } from '../accessors/NormalNode.js';
import { positionViewDirection } from '../accessors/PositionNode.js';
import { addNodeClass } from '../core/Node.js';
import { float, vec2 } from '../shadernode/ShaderNode.js';

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

		const radianceContext = context( envNode, {
			getUVNode: ( textureNode ) => {

				let node = null;

				if ( reflectVec === undefined ) {

					reflectVec = positionViewDirection.negate().reflect( transformedNormalView );
					reflectVec = roughness.mul( roughness ).mix( reflectVec, transformedNormalView ).normalize();
					reflectVec = reflectVec.transformDirection( cameraViewMatrix );

				}

				if ( textureNode.isCubeTextureNode ) {

					node = reflectVec;

				} else if ( textureNode.isTextureNode ) {

					if ( radianceTextureUVNode === undefined ) {

						// @TODO: Needed PMREM

						radianceTextureUVNode = equirectUV( reflectVec );
						radianceTextureUVNode = vec2( radianceTextureUVNode.x, radianceTextureUVNode.y.oneMinus() );

					}

					node = radianceTextureUVNode;

				}

				return node;

			},
			getSamplerLevelNode: () => {

				return roughness;

			},
			getMIPLevelAlgorithmNode: ( textureNode, levelNode ) => {

				return specularMIPLevel( textureNode, levelNode );

			}
		} );

		const irradianceContext = context( envNode, {
			getUVNode: ( textureNode ) => {

				let node = null;

				if ( textureNode.isCubeTextureNode ) {

					node = transformedNormalWorld;

				} else if ( textureNode.isTextureNode ) {

					if ( irradianceTextureUVNode === undefined ) {

						// @TODO: Needed PMREM

						irradianceTextureUVNode = equirectUV( transformedNormalWorld );
						irradianceTextureUVNode = vec2( irradianceTextureUVNode.x, irradianceTextureUVNode.y.oneMinus() );

					}

					node = irradianceTextureUVNode;

				}

				return node;

			},
			getSamplerLevelNode: () => {

				return float( 1 );

			},
			getMIPLevelAlgorithmNode: ( textureNode, levelNode ) => {

				return specularMIPLevel( textureNode, levelNode );

			}
		} );

		//

		const isolateRadianceFlowContext = cache( radianceContext );

		//

		builder.context.radiance.addAssign( isolateRadianceFlowContext );

		builder.context.iblIrradiance.addAssign( irradianceContext.mul( Math.PI ) );

		properties.radianceContext = isolateRadianceFlowContext;
		properties.irradianceContext = irradianceContext;

	}

}

export default EnvironmentNode;

addNodeClass( EnvironmentNode );
