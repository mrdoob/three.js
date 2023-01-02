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

			if ( material.map && material.map.isTexture === true ) {

				//const map = new MaterialReferenceNode( 'map', 'texture' );
				const map = new TextureNode( material.map, new MaterialNode( MaterialNode.UV ) );

				node = new OperatorNode( '*', colorNode, map );

			} else {

				node = colorNode;

			}

		} else if ( scope === MaterialNode.OPACITY ) {

			const opacityNode = new MaterialReferenceNode( 'opacity', 'float' );

			if ( material.alphaMap && material.alphaMap.isTexture === true ) {

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

			if ( material.specularMap && material.specularMap.isTexture === true ) {

				node = new OperatorNode( '*', reflectivityNode, new SplitNode( new TextureNode( material.specularMap ), 'r' ) );

			} else {

				node = reflectivityNode;

			}

		} else if ( scope === MaterialNode.ROUGHNESS ) {

			const roughnessNode = new MaterialReferenceNode( 'roughness', 'float' );

			if ( material.roughnessMap && material.roughnessMap.isTexture === true ) {

				node = new OperatorNode( '*', roughnessNode, new SplitNode( new TextureNode( material.roughnessMap ), 'g' ) );

			} else {

				node = roughnessNode;

			}

		} else if ( scope === MaterialNode.METALNESS ) {

			const metalnessNode = new MaterialReferenceNode( 'metalness', 'float' );

			if ( material.metalnessMap && material.metalnessMap.isTexture === true ) {

				node = new OperatorNode( '*', metalnessNode, new SplitNode( new TextureNode( material.metalnessMap ), 'b' ) );

			} else {

				node = metalnessNode;

			}

		} else if ( scope === MaterialNode.EMISSIVE ) {

			const emissiveNode = new MaterialReferenceNode( 'emissive', 'color' );

			if ( material.emissiveMap && material.emissiveMap.isTexture === true ) {

				node = new OperatorNode( '*', emissiveNode, new TextureNode( material.emissiveMap ) );

			} else {

				node = emissiveNode;

			}

		} else if ( scope === MaterialNode.ROTATION ) {

			node = new MaterialReferenceNode( 'rotation', 'float' );

		} else if ( scope === MaterialNode.UV ) {

			// uv repeat and offset setting priorities

			let uvNode;
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
