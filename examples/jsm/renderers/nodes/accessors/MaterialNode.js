import Node from '../core/Node.js';
import OperatorNode from '../math/OperatorNode.js';
import MaterialReferenceNode from './MaterialReferenceNode.js';

class MaterialNode extends Node {

	static COLOR = 'color';
	static OPACITY = 'opacity';
	static SPECULAR = 'specular';
	static SHININESS = 'shininess';

	constructor( scope = MaterialNode.COLOR ) {

		super();

		this.scope = scope;

	}

	getType( builder ) {

		const scope = this.scope;
		const material = builder.getContextParameter( 'material' );

		if ( scope === MaterialNode.COLOR ) {

			return material.map !== null ? 'vec4' : 'vec3';

		} else if ( scope === MaterialNode.OPACITY ) {

			return 'float';

		} else if ( scope === MaterialNode.SPECULAR ) {

			return 'vec3';

		} else if ( scope === MaterialNode.SHININESS ) {

			return 'float';

		}

	}

	generate( builder, output ) {

		const material = builder.getContextParameter( 'material' );
		const scope = this.scope;

		let node = null;

		if ( scope === MaterialNode.COLOR ) {

			const colorNode = new MaterialReferenceNode( 'color', 'color' );

			if ( material.map !== null && material.map !== undefined && material.map.isTexture === true ) {

				node = new OperatorNode( '*', colorNode, new MaterialReferenceNode( 'map', 'texture' ) );

			} else {

				node = colorNode;

			}

		} else if ( scope === MaterialNode.OPACITY ) {

			const opacityNode = new MaterialReferenceNode( 'opacity', 'float' );

			if ( material.alphaMap !== null && material.alphaMap !== undefined && material.alphaMap.isTexture === true ) {

				node = new OperatorNode( '*', opacityNode, new MaterialReferenceNode( 'alphaMap', 'texture' ) );

			} else {

				node = opacityNode;

			}

		} else if ( scope === MaterialNode.SPECULAR ) {

			const specularColorNode = new MaterialReferenceNode( 'specular', 'color' );

			if ( material.specularMap !== null && material.specularMap !== undefined && material.specularMap.isTexture === true ) {

				node = new OperatorNode( '*', specularColorNode, new MaterialReferenceNode( 'specularMap', 'texture' ) );

			} else {

				node = specularColorNode;

			}

		} else if ( scope === MaterialNode.SHININESS ) {

			node = new MaterialReferenceNode( 'shininess', 'float' );

		}

		return node.build( builder, output );

	}

}

export default MaterialNode;
