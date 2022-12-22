import Node from '../core/Node.js';
import UniformNode from '../core/UniformNode.js';
import UVNode from '../accessors/UVNode.js';
import ConstNode from '../core/ConstNode.js';
import OperatorNode from '../math/OperatorNode.js';
import JoinNode from '../utils/JoinNode.js';
import MaterialReferenceNode from './MaterialReferenceNode.js';
import TextureNode from './TextureNode.js';
import SplitNode from '../utils/SplitNode.js';

class MaterialNode extends Node {

	static ALPHA_TEST = 'alphaTest';
	static COLOR = 'color';
	static OPACITY = 'opacity';
	static SHININESS = 'shininess';
	static SPECULAR_COLOR = 'specularColor';
	static REFLECTIVITY = 'reflectivity';
	static ROUGHNESS = 'roughness';
	static METALNESS = 'metalness';
	static EMISSIVE = 'emissive';
	static ROTATION = 'rotation';
	static UV = 'uv';

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

	construct( builder ) {

		const material = builder.context.material;
		const scope = this.scope;

		let node = null;

		if ( scope === MaterialNode.ALPHA_TEST ) {

			node = new MaterialReferenceNode( 'alphaTest', 'float' );

		} else if ( scope === MaterialNode.COLOR ) {

			const colorNode = new MaterialReferenceNode( 'color', 'color' );

			if ( material.map?.isTexture === true ) {

				//const map = new MaterialReferenceNode( 'map', 'texture' );
				const map = new TextureNode( material.map, new MaterialNode( MaterialNode.UV ) );

				node = new OperatorNode( '*', colorNode, map );

			} else {

				node = colorNode;

			}

		} else if ( scope === MaterialNode.OPACITY ) {

			const opacityNode = new MaterialReferenceNode( 'opacity', 'float' );

			if ( material.alphaMap?.isTexture === true ) {

				node = new OperatorNode( '*', opacityNode, new MaterialReferenceNode( 'alphaMap', 'texture' ) );

			} else {

				node = opacityNode;

			}

		} else if ( scope === MaterialNode.SHININESS ) {

			return new MaterialReferenceNode( 'shininess', 'float' );

		} else if ( scope === MaterialNode.SPECULAR_COLOR ) {

			node = new MaterialReferenceNode( 'specular', 'color' );

		} else if ( scope === MaterialNode.REFLECTIVITY ) {

			const reflectivityNode = new MaterialReferenceNode( 'reflectivity', 'float' );

			if ( material.specularMap?.isTexture === true ) {

				node = new OperatorNode( '*', reflectivityNode, new SplitNode( new TextureNode( material.specularMap ), 'r' ) );

			} else {

				node = reflectivityNode;

			}

		} else if ( scope === MaterialNode.ROUGHNESS ) {

			const roughnessNode = new MaterialReferenceNode( 'roughness', 'float' );

			if ( material.roughnessMap?.isTexture === true ) {

				node = new OperatorNode( '*', roughnessNode, new SplitNode( new TextureNode( material.roughnessMap ), 'g' ) );

			} else {

				node = roughnessNode;

			}

		} else if ( scope === MaterialNode.METALNESS ) {

			const metalnessNode = new MaterialReferenceNode( 'metalness', 'float' );

			if ( material.metalnessMap?.isTexture === true ) {

				node = new OperatorNode( '*', metalnessNode, new SplitNode( new TextureNode( material.metalnessMap ), 'b' ) );

			} else {

				node = metalnessNode;

			}

		} else if ( scope === MaterialNode.EMISSIVE ) {

			const emissiveNode = new MaterialReferenceNode( 'emissive', 'color' );

			if ( material.emissiveMap?.isTexture === true ) {

				node = new OperatorNode( '*', emissiveNode, new TextureNode( material.emissiveMap ) );

			} else {

				node = emissiveNode;

			}

		} else if ( scope === MaterialNode.ROTATION ) {

			node = new MaterialReferenceNode( 'rotation', 'float' );

		} else if ( scope === MaterialNode.UV ) {

			// uv repeat and offset setting priorities
			// 1. color map
			// 2. specular map
			// 3. displacementMap map
			// 4. normal map
			// 5. bump map
			// 6. roughnessMap map
			// 7. metalnessMap map
			// 8. alphaMap map
			// 9. emissiveMap map
			// 10. clearcoat map
			// 11. clearcoat normal map
			// 12. clearcoat roughnessMap map
			// 13. iridescence map
			// 14. iridescence thickness map
			// 15. specular intensity map
			// 16. specular tint map
			// 17. transmission map
			// 18. thickness map

			let uvScaleMap;
			let uvNode;

			if ( material.map ) {

				uvScaleMap = material.map;

			} else if ( material.specularMap ) {

				uvScaleMap = material.specularMap;

			} else if ( material.displacementMap ) {

				uvScaleMap = material.displacementMap;

			} else if ( material.normalMap ) {

				uvScaleMap = material.normalMap;

			} else if ( material.bumpMap ) {

				uvScaleMap = material.bumpMap;

			} else if ( material.roughnessMap ) {

				uvScaleMap = material.roughnessMap;

			} else if ( material.metalnessMap ) {

				uvScaleMap = material.metalnessMap;

			} else if ( material.alphaMap ) {

				uvScaleMap = material.alphaMap;

			} else if ( material.emissiveMap ) {

				uvScaleMap = material.emissiveMap;

			} else if ( material.clearcoatMap ) {

				uvScaleMap = material.clearcoatMap;

			} else if ( material.clearcoatNormalMap ) {

				uvScaleMap = material.clearcoatNormalMap;

			} else if ( material.clearcoatRoughnessMap ) {

				uvScaleMap = material.clearcoatRoughnessMap;

			} else if ( material.iridescenceMap ) {

				uvScaleMap = material.iridescenceMap;

			} else if ( material.iridescenceThicknessMap ) {

				uvScaleMap = material.iridescenceThicknessMap;

			} else if ( material.specularIntensityMap ) {

				uvScaleMap = material.specularIntensityMap;

			} else if ( material.specularColorMap ) {

				uvScaleMap = material.specularColorMap;

			} else if ( material.transmissionMap ) {

				uvScaleMap = material.transmissionMap;

			} else if ( material.thicknessMap ) {

				uvScaleMap = material.thicknessMap;

			} else if ( material.sheenColorMap ) {

				uvScaleMap = material.sheenColorMap;

			} else if ( material.sheenRoughnessMap ) {

				uvScaleMap = material.sheenRoughnessMap;

			}

			if ( uvScaleMap !== undefined ) {

				// backwards compatibility
				if ( uvScaleMap.isWebGLRenderTarget ) {

					uvScaleMap = uvScaleMap.texture;

				}

				if ( uvScaleMap.matrixAutoUpdate === true ) {

					uvScaleMap.updateMatrix();

				}

				uvNode = new OperatorNode( '*', new UniformNode( uvScaleMap.matrix ), new JoinNode( [ new UVNode(), new ConstNode( 1 ) ] ) );

			}

			return uvNode || new UVNode();

		} else {

			const outputType = this.getNodeType( builder );

			node = new MaterialReferenceNode( scope, outputType );

		}

		return node;

	}

}

export default MaterialNode;
