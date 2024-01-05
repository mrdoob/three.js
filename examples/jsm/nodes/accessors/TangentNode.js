import TempNode from '../core/TempNode.js';
import { addNodeClass } from '../core/Node.js';
import { attribute } from '../core/AttributeNode.js';
import { tangent } from '../core/PropertyNode.js';
import { cameraViewMatrix } from './CameraNode.js';
import { modelViewMatrix } from './ModelNode.js';
import { nodeImmutable } from '../shadernode/ShaderNode.js';

class TangentNode extends TempNode {

	constructor( scope = TangentNode.LOCAL ) {

		super( scope === TangentNode.GEOMETRY ? 'vec4' : 'vec3' );

		this.scope = scope;

	}

	getHash( /*builder*/ ) {

		return `tangent-${this.scope}`;

	}

	setup( /*builder*/ ) {

		const scope = this.scope;

		let outputNode = null;

		if ( scope === TangentNode.GEOMETRY ) {

			outputNode = attribute( 'tangent', 'vec4' );

		} else if ( scope === TangentNode.LOCAL ) {

			outputNode = tangent.varying();

		} else if ( scope === TangentNode.VIEW ) {

			outputNode = modelViewMatrix.transformDirection( tangent ).varying().normalize();

		} else if ( scope === TangentNode.WORLD ) {

			outputNode = tangentView.transformDirection( cameraViewMatrix ).varying().normalize();

		} else if ( scope === TangentNode.TRANSFORMED_VIEW ) {

			outputNode = transformedTangentView;

		} else if ( scope === TangentNode.TRANSFORMED_WORLD ) {

			outputNode = transformedTangentView.transformDirection( cameraViewMatrix ).normalize();

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

TangentNode.GEOMETRY = 'geometry';
TangentNode.LOCAL = 'local';
TangentNode.VIEW = 'view';
TangentNode.WORLD = 'world';
TangentNode.TRANSFORMED_VIEW = 'transformedView';
TangentNode.TRANSFORMED_WORLD = 'transformedWorld';

export default TangentNode;

export const tangentGeometry = nodeImmutable( TangentNode, TangentNode.GEOMETRY );
export const tangentLocal = nodeImmutable( TangentNode, TangentNode.LOCAL );
export const tangentView = nodeImmutable( TangentNode, TangentNode.VIEW );
export const tangentWorld = nodeImmutable( TangentNode, TangentNode.WORLD );
export const transformedTangentView = tangentView.label( 'TransformedTangentView' );
export const transformedTangentWorld = nodeImmutable( TangentNode, TangentNode.TRANSFORMED_WORLD );

addNodeClass( 'TangentNode', TangentNode );
