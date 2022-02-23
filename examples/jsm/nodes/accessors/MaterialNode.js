import Node from '../core/Node.js';
import OperatorNode from '../math/OperatorNode.js';
import MaterialReferenceNode from './MaterialReferenceNode.js';

class MaterialNode extends Node {

	static AlphaTest = 'alphaTest';
	static Color = 'color';
	static Opacity = 'opacity';
	static Specular = 'specular';
	static Roughness = 'roughness';
	static Metalness = 'metalness';

	constructor( scope = MaterialNode.Color ) {

		super();

		this.scope = scope;

	}

	getNodeType( builder ) {

		const scope = this.scope;
		const material = builder.context.material;

		if ( scope === MaterialNode.Color ) {

			return material.map !== null ? 'vec4' : 'vec3';

		} else if ( scope === MaterialNode.Opacity ) {

			return 'float';

		} else if ( scope === MaterialNode.Specular ) {

			return 'vec3';

		} else if ( scope === MaterialNode.Roughness || scope === MaterialNode.Metalness ) {

			return 'float';

		}

	}

	generate( builder, output ) {

		const material = builder.context.material;
		const scope = this.scope;

		let node = null;

		if ( scope === MaterialNode.AlphaTest ) {

			node = new MaterialReferenceNode( 'alphaTest', 'float' );

		} else if ( scope === MaterialNode.Color ) {

			const colorNode = new MaterialReferenceNode( 'color', 'color' );

			if ( material.map !== null && material.map !== undefined && material.map.isTexture === true ) {

				node = new OperatorNode( '*', colorNode, new MaterialReferenceNode( 'map', 'texture' ) );

			} else {

				node = colorNode;

			}

		} else if ( scope === MaterialNode.Opacity ) {

			const opacityNode = new MaterialReferenceNode( 'opacity', 'float' );

			if ( material.alphaMap !== null && material.alphaMap !== undefined && material.alphaMap.isTexture === true ) {

				node = new OperatorNode( '*', opacityNode, new MaterialReferenceNode( 'alphaMap', 'texture' ) );

			} else {

				node = opacityNode;

			}

		} else if ( scope === MaterialNode.Specular ) {

			const specularColorNode = new MaterialReferenceNode( 'specularColor', 'color' );

			if ( material.specularColorMap !== null && material.specularColorMap !== undefined && material.specularColorMap.isTexture === true ) {

				node = new OperatorNode( '*', specularColorNode, new MaterialReferenceNode( 'specularColorMap', 'texture' ) );

			} else {

				node = specularColorNode;

			}

		} else {

			const outputType = this.getNodeType( builder );

			node = new MaterialReferenceNode( scope, outputType );

		}

		return node.build( builder, output );

	}

}

export default MaterialNode;
