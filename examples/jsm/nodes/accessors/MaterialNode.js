import Node from '../core/Node.js';
import OperatorNode from '../math/OperatorNode.js';
import MaterialReferenceNode from './MaterialReferenceNode.js';
import TextureNode from './TextureNode.js';
import SplitNode from '../utils/SplitNode.js';

class MaterialNode extends Node {

	static ALPHA_TEST = 'alphaTest';
	static COLOR = 'color';
	static OPACITY = 'opacity';
	static ROUGHNESS = 'roughness';
	static METALNESS = 'metalness';
	static EMISSIVE = 'emissive';
	static ROTATION = 'rotation';

	constructor( scope = MaterialNode.COLOR ) {

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

		} else if ( scope === MaterialNode.EMISSIVE ) {

			return 'vec3';

		} else if ( scope === MaterialNode.ROUGHNESS || scope === MaterialNode.METALNESS ) {

			return 'float';

		}

	}

	generate( builder, output ) {

		const material = builder.context.material;
		const scope = this.scope;

		let node = null;

		if ( scope === MaterialNode.ALPHA_TEST ) {

			node = new MaterialReferenceNode( 'alphaTest', 'float' );

		} else if ( scope === MaterialNode.COLOR ) {

			const colorNode = new MaterialReferenceNode( 'color', 'color' );

			if ( material.map?.isTexture === true ) {

				//new MaterialReferenceNode( 'map', 'texture' )
				const map = new TextureNode( material.map );

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

		} else {

			const outputType = this.getNodeType( builder );

			node = new MaterialReferenceNode( scope, outputType );

		}

		return node.build( builder, output );

	}

}

export default MaterialNode;
