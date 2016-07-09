import { ShaderMaterial } from './ShaderMaterial';

/**
 * @author mrdoob / http://mrdoob.com/
 */

function RawShaderMaterial ( parameters ) {
	this.isRawShaderMaterial = this.isShaderMaterial = this.isMaterial = true;

	ShaderMaterial.call( this, parameters );

	this.type = 'RawShaderMaterial';

};

RawShaderMaterial.prototype = Object.create( ShaderMaterial.prototype );
RawShaderMaterial.prototype.constructor = RawShaderMaterial;


export { RawShaderMaterial };