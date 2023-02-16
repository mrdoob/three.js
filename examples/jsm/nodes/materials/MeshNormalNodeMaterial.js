import NodeMaterial from './NodeMaterial.js';
import { MeshNormalMaterial } from 'three';
import { vec4, diffuseColor, materialOpacity, transformedNormalView, directionToColor } from '../shadernode/ShaderNodeElements.js';

const defaultValues = new MeshNormalMaterial();

class MeshNormalNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.isMeshNormalNodeMaterial = true;

		this.opacityNode = null;

		this.positionNode = null;

		this.setDefaultValues( defaultValues );

		this.setValues( parameters );

	}

	constructDiffuseColor( builder, stack ) {

		const opacityNode = this.opacityNode ? float( this.opacityNode ) : materialOpacity;

		stack.assign( diffuseColor, vec4( directionToColor( transformedNormalView ), opacityNode ) );

	}

	copy( source ) {

		this.opacityNode = source.opacityNode;

		this.positionNode = source.positionNode;

		return super.copy( source );

	}

}

export default MeshNormalNodeMaterial;
