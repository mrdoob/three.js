import { ShaderMaterial } from './ShaderMaterial.js';

/**
 * @author mrdoob / http://mrdoob.com/
 */

function RawShaderMaterial( parameters ) {

	ShaderMaterial.call( this, parameters );

	this.type = 'RawShaderMaterial';

}

RawShaderMaterial.prototype = Object.create( ShaderMaterial.prototype );
RawShaderMaterial.prototype.constructor = RawShaderMaterial;

RawShaderMaterial.prototype.isRawShaderMaterial = true;


export { RawShaderMaterial };
