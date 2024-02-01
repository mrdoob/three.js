import { texture } from '../Nodes.js';
import Node, { addNodeClass } from '../core/Node.js';
import { DataTexture, RGBAFormat, FloatType } from 'three';

class ArrayElementNode extends Node { // @TODO: If extending from TempNode it breaks webgpu_compute

	constructor( node, indexNode ) {

		super();

		this.node = node;
		this.indexNode = indexNode;

		this.isArrayElementNode = true;

	}

	getNodeType( builder ) {

		return this.node.getNodeType( builder );

	}

	setup( builder ) {

		if ( this.node.isStorageBufferNode && ! builder.isAvailable( 'storageBuffer' ) ) {

			if ( ! this.node.instanceIndex ) {

				const attribute = this.node.value;

				if ( attribute.pbo === undefined ) {

					const square = Math.sqrt( attribute.array.length / 4 );
					const width = Math.floor( square );
					const height = Math.ceil( square );

					const pboTexture = new DataTexture( attribute.array, width, height, RGBAFormat, FloatType );
					pboTexture.needsUpdate = true;
					pboTexture.isPBOTexture = true;
					const pbo = texture( pboTexture );
					pbo.setPrecision( 'high' );

					attribute.pboNode = pbo;
					attribute.pbo = pbo.value;


				}

			}


		}

		super.setup( builder );


	}

	generate( builder, output ) {

		const nodeSnippet = this.node.build( builder );
		const indexSnippet = this.indexNode.build( builder, 'uint' );

		if ( this.node.isStorageBufferNode && ! builder.isAvailable( 'storageBuffer' ) ) {


			const attribute = this.node.value;

			if ( attribute.pboNode ) {

				const nodeUniform = builder.getUniformFromNode( attribute.pboNode, 'texture', builder.shaderStage, builder.context.label );

				const propertyNameTexture = builder.getPropertyName( nodeUniform );

				const snippet = /* glsl */`
					texelFetch(
						${propertyNameTexture}, 
						ivec2(
							${indexSnippet} / uint(4) % uint(textureSize(${propertyNameTexture}, 0).x),
							${indexSnippet} / (uint(4) * uint(textureSize(${propertyNameTexture}, 0).x))
						),
						0
					)[${indexSnippet} % uint(4)]`;

				return output !== 'assign' ? snippet : nodeSnippet;

			}




			return nodeSnippet;

		}

		return `${nodeSnippet}[ ${indexSnippet} ]`;

	}

}

export default ArrayElementNode;

addNodeClass( 'ArrayElementNode', ArrayElementNode );
