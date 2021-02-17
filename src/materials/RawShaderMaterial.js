import { ShaderMaterial } from './ShaderMaterial.js';

class RawShaderMaterial extends ShaderMaterial {

	constructor( parameters ) {

		super( parameters );

		Object.defineProperty( this, 'isRawShaderMaterial', { value: true } );

		this.type = 'RawShaderMaterial';

	}

}

export { RawShaderMaterial };
