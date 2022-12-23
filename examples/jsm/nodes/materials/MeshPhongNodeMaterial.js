import NodeMaterial from './NodeMaterial.js';
import {
	float, vec3,
	materialShininess, materialSpecularColor,
	shininess, specularColor
} from '../shadernode/ShaderNodeElements.js';
import phongLightingModel from '../functions/PhongLightingModel.js';

import { MeshPhongMaterial } from 'three';

const defaultValues = new MeshPhongMaterial();

class MeshPhongNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.isMeshPhongNodeMaterial = true;

		this.lights = true;

		this.colorNode = null;
		this.opacityNode = null;

		this.shininessNode = null;
		this.specularNode = null;

		this.alphaTestNode = null;

		this.lightNode = null;

		this.positionNode = null;

		this.setDefaultValues( defaultValues );

		this.setValues( parameters );

	}

	constructLightingModel( /*builder*/ ) {

		return phongLightingModel;

	}

	constructVariants( builder, stack ) {

		// SHININESS

		const shininessNode = float( this.shininessNode || materialShininess ).max( 1e-4 ); // to prevent pow( 0.0, 0.0 )

		stack.assign( shininess, shininessNode );

		// SPECULAR COLOR

		const specularNode = vec3( this.specularNode || materialSpecularColor );

		stack.assign( specularColor, specularNode );

	}

	copy( source ) {

		this.colorNode = source.colorNode;
		this.opacityNode = source.opacityNode;

		this.alphaTestNode = source.alphaTestNode;

		this.shininessNode = source.shininessNode;
		this.specularNode = source.specularNode;

		this.lightNode = source.lightNode;

		this.positionNode = source.positionNode;

		return super.copy( source );

	}

}

export default MeshPhongNodeMaterial;
