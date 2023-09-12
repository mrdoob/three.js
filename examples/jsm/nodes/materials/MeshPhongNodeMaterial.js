import NodeMaterial, { addNodeMaterial } from './NodeMaterial.js';
import { shininess, specularColor } from '../core/PropertyNode.js';
import { materialShininess, materialSpecularColor } from '../accessors/MaterialNode.js';
import { float } from '../shadernode/ShaderNode.js';
import PhongLightingModel from '../functions/PhongLightingModel.js';

import { MeshPhongMaterial } from 'three';

const defaultValues = new MeshPhongMaterial();

class MeshPhongNodeMaterial extends NodeMaterial {

	constructor( parameters ) {

		super();

		this.isMeshPhongNodeMaterial = true;

		this.lights = true;

		this.shininessNode = null;
		this.specularNode = null;

		this.setDefaultValues( defaultValues );

		this.setValues( parameters );

	}

	constructLightingModel( /*builder*/ ) {

		return new PhongLightingModel();

	}

	constructVariants( { stack } ) {

		// SHININESS

		const shininessNode = ( this.shininessNode ? float( this.shininessNode ) : materialShininess ).max( 1e-4 ); // to prevent pow( 0.0, 0.0 )

		stack.assign( shininess, shininessNode );

		// SPECULAR COLOR

		const specularNode = this.specularNode || materialSpecularColor;

		stack.assign( specularColor, specularNode );

	}

	copy( source ) {

		this.shininessNode = source.shininessNode;
		this.specularNode = source.specularNode;

		return super.copy( source );

	}

}

export default MeshPhongNodeMaterial;

addNodeMaterial( MeshPhongNodeMaterial );
