import Node, { addNodeClass } from '../core/Node.js';
import { attribute } from '../core/AttributeNode.js';
import { property, normal } from '../core/PropertyNode.js';
import { cameraViewMatrix } from './CameraNode.js';
import { modelNormalMatrix } from './ModelNode.js';
import { nodeImmutable } from '../shadernode/ShaderNode.js';

class NormalNode extends Node { // @TODO: TempNode doesn't really work if its setup's outputNode is a `property` or variable? This seems similar to the problem with node varyings (that currently is fixed by statements' reordering)

	constructor( scope = NormalNode.LOCAL ) {

		super( 'vec3' );

		this.scope = scope;

	}

	getHash( /*builder*/ ) {

		return `normal-${this.scope}`;

	}

	setup( /*builder*/ ) {

		const scope = this.scope;

		let outputNode = null;

		if ( scope === NormalNode.GEOMETRY ) {

			outputNode = attribute( 'normal', 'vec3' );

		} else if ( scope === NormalNode.LOCAL ) {

			outputNode = normal.varying();

		} else if ( scope === NormalNode.VIEW ) {

			outputNode = modelNormalMatrix.mul( normal ).varying().normalize();

		} else if ( scope === NormalNode.WORLD ) {

			outputNode = normalView.transformDirection( cameraViewMatrix ).varying().normalize();

		} else if ( scope === NormalNode.TRANSFORMED_VIEW ) {

			outputNode = property( 'vec3', 'TransformedNormalView' );

		} else if ( scope === NormalNode.TRANSFORMED_WORLD ) {

			outputNode = transformedNormalView.transformDirection( cameraViewMatrix ).normalize();

		} else if ( scope === NormalNode.TRANSFORMED_CLEARCOAT_VIEW ) {

			outputNode = property( 'vec3', 'TransformedClearcoatNormalView' );

		}

		return outputNode;

	}

	serialize( data ) {

		super.serialize( data );

		data.scope = this.scope;

	}

	deserialize( data ) {

		super.deserialize( data );

		this.scope = data.scope;

	}

}

NormalNode.GEOMETRY = 'geometry';
NormalNode.LOCAL = 'local';
NormalNode.VIEW = 'view';
NormalNode.WORLD = 'world';
NormalNode.TRANSFORMED_VIEW = 'transformedView';
NormalNode.TRANSFORMED_WORLD = 'transformedWorld';
NormalNode.TRANSFORMED_CLEARCOAT_VIEW = 'transformedClearcoatView';

export default NormalNode;

export const normalGeometry = nodeImmutable( NormalNode, NormalNode.GEOMETRY );
export const normalLocal = nodeImmutable( NormalNode, NormalNode.LOCAL ).label( 'Normal' );
export const normalView = nodeImmutable( NormalNode, NormalNode.VIEW );
export const normalWorld = nodeImmutable( NormalNode, NormalNode.WORLD );
export const transformedNormalView = nodeImmutable( NormalNode, NormalNode.TRANSFORMED_VIEW );
export const transformedNormalWorld = nodeImmutable( NormalNode, NormalNode.TRANSFORMED_WORLD );
export const transformedClearcoatNormalView = nodeImmutable( NormalNode, NormalNode.TRANSFORMED_CLEARCOAT_VIEW );

addNodeClass( 'NormalNode', NormalNode );
