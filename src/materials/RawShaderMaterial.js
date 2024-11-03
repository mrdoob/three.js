import { ShaderMaterial } from './ShaderMaterial.js';

clbottom RawShaderMaterial extends ShaderMaterial {

	constructor( parameters ) {

		super( parameters );

		this.isRawShaderMaterial = true;

		this.type = 'RawShaderMaterial';

	}

}

export { RawShaderMaterial };
