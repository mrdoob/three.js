import Node, { addNodeClass } from '../core/Node.js';
import { uniform } from '../core/UniformNode.js';
import { materialReference } from './MaterialReferenceNode.js';
import { uv } from './UVNode.js';
import { nodeImmutable, vec3 } from '../shadernode/ShaderNode.js';

class MaterialNode extends Node {

	constructor( scope ) {

		super();

		this.scope = scope;

	}

	getNodeType( builder ) {

		const scope = this.scope;
		const material = builder.context.material;

		if ( scope === MaterialNode.COLOR ) {

			return material.map !== null ? 'vec4' : 'vec3';

		} else if ( scope === MaterialNode.OPACITY || scope === MaterialNode.ROTATION ) {

			return 'float';

		} else if ( scope === MaterialNode.UV ) {

			return 'vec2';

		} else if ( scope === MaterialNode.EMISSIVE ) {

			return 'vec3';

		} else if ( scope === MaterialNode.ROUGHNESS || scope === MaterialNode.METALNESS || scope === MaterialNode.SPECULAR || scope === MaterialNode.SHININESS ) {

			return 'float';

		}

	}

	getFloat( property ) {

		//@TODO: Check if it can be cached by property name.

		return materialReference( property, 'float' );

	}

	getColor( property ) {

		//@TODO: Check if it can be cached by property name.

		return materialReference( property, 'color' );

	}

	getTexture( property ) {

		//@TODO: Check if it can be cached by property name.

		const textureRefNode = materialReference( property, 'texture' );
		textureRefNode.node.uvNode = materialUV;

		return textureRefNode;

	}

	construct( builder ) {

		const material = builder.context.material;
		const scope = this.scope;

		let node = null;

		if ( scope === MaterialNode.ALPHA_TEST ) {

			node = this.getFloat( 'alphaTest' );

		} else if ( scope === MaterialNode.COLOR ) {

			const colorNode = this.getColor( 'color' );

			if ( material.map && material.map.isTexture === true ) {

				node = colorNode.mul( this.getTexture( 'map' ) );

			} else {

				node = colorNode;

			}

		} else if ( scope === MaterialNode.OPACITY ) {

			const opacityNode = this.getFloat( 'opacity' );

			if ( material.alphaMap && material.alphaMap.isTexture === true ) {

				node = opacityNode.mul( this.getTexture( 'alphaMap' ) );

			} else {

				node = opacityNode;

			}

		} else if ( scope === MaterialNode.SHININESS ) {

			node = this.getFloat( 'shininess' );

		} else if ( scope === MaterialNode.SPECULAR_COLOR ) {

			node = this.getColor( 'specular' );

		} else if ( scope === MaterialNode.REFLECTIVITY ) {

			const reflectivityNode = this.getFloat( 'reflectivity' );

			if ( material.specularMap && material.specularMap.isTexture === true ) {

				node = reflectivityNode.mul( this.getTexture( 'specularMap' ).r );

			} else {

				node = reflectivityNode;

			}

		} else if ( scope === MaterialNode.ROUGHNESS ) {

			const roughnessNode = this.getFloat( 'roughness' );

			if ( material.roughnessMap && material.roughnessMap.isTexture === true ) {

				node = roughnessNode.mul( this.getTexture( 'roughnessMap' ).g );

			} else {

				node = roughnessNode;

			}

		} else if ( scope === MaterialNode.METALNESS ) {

			const metalnessNode = this.getFloat( 'metalness' );

			if ( material.metalnessMap && material.metalnessMap.isTexture === true ) {

				node = metalnessNode.mul( this.getTexture( 'metalnessMap' ).b );

			} else {

				node = metalnessNode;

			}

		} else if ( scope === MaterialNode.EMISSIVE ) {

			const emissiveNode = this.getColor( 'emissive' );

			if ( material.emissiveMap && material.emissiveMap.isTexture === true ) {

				node = emissiveNode.mul( this.getTexture( 'emissiveMap' ) );

			} else {

				node = emissiveNode;

			}

		} else if ( scope === MaterialNode.ROTATION ) {

			node = this.getFloat( 'rotation' );

		} else if ( scope === MaterialNode.UV ) {

			// uv repeat and offset setting priorities

			let uvScaleMap =
				material.map ||
				material.specularMap ||
				material.displacementMap ||
				material.normalMap ||
				material.bumpMap ||
				material.roughnessMap ||
				material.metalnessMap ||
				material.alphaMap ||
				material.emissiveMap ||
				material.clearcoatMap ||
				material.clearcoatNormalMap ||
				material.clearcoatRoughnessMap ||
				material.iridescenceMap ||
				material.iridescenceThicknessMap ||
				material.specularIntensityMap ||
				material.specularColorMap ||
				material.transmissionMap ||
				material.thicknessMap ||
				material.sheenColorMap ||
				material.sheenRoughnessMap;

			if ( uvScaleMap ) {

				// backwards compatibility
				if ( uvScaleMap.isWebGLRenderTarget ) {

					uvScaleMap = uvScaleMap.texture;

				}

				if ( uvScaleMap.matrixAutoUpdate === true ) {

					uvScaleMap.updateMatrix();

				}

				node = uniform( uvScaleMap.matrix ).mul( vec3( uv(), 1 ) );

			} else {

				node = uv();

			}

		} else {

			const outputType = this.getNodeType( builder );

			node = materialReference( scope, outputType );

		}

		return node;

	}

}

MaterialNode.ALPHA_TEST = 'alphaTest';
MaterialNode.COLOR = 'color';
MaterialNode.OPACITY = 'opacity';
MaterialNode.SHININESS = 'shininess';
MaterialNode.SPECULAR_COLOR = 'specularColor';
MaterialNode.REFLECTIVITY = 'reflectivity';
MaterialNode.ROUGHNESS = 'roughness';
MaterialNode.METALNESS = 'metalness';
MaterialNode.EMISSIVE = 'emissive';
MaterialNode.ROTATION = 'rotation';
MaterialNode.UV = 'uv';

export default MaterialNode;

export const materialUV = nodeImmutable( MaterialNode, MaterialNode.UV );
export const materialAlphaTest = nodeImmutable( MaterialNode, MaterialNode.ALPHA_TEST );
export const materialColor = nodeImmutable( MaterialNode, MaterialNode.COLOR );
export const materialShininess = nodeImmutable( MaterialNode, MaterialNode.SHININESS );
export const materialEmissive = nodeImmutable( MaterialNode, MaterialNode.EMISSIVE );
export const materialOpacity = nodeImmutable( MaterialNode, MaterialNode.OPACITY );
export const materialSpecularColor = nodeImmutable( MaterialNode, MaterialNode.SPECULAR_COLOR );
export const materialReflectivity = nodeImmutable( MaterialNode, MaterialNode.REFLECTIVITY );
export const materialRoughness = nodeImmutable( MaterialNode, MaterialNode.ROUGHNESS );
export const materialMetalness = nodeImmutable( MaterialNode, MaterialNode.METALNESS );
export const materialRotation = nodeImmutable( MaterialNode, MaterialNode.ROTATION );

addNodeClass( MaterialNode );
