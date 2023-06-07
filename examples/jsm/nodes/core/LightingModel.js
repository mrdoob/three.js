class LightingModel {

	constructor( init = null, direct = null, indirectDiffuse = null, indirectSpecular = null, ambientOcclusion = null ) {

		this.init = init;
		this.direct = direct;
		this.indirectDiffuse = indirectDiffuse;
		this.indirectSpecular = indirectSpecular;
		this.ambientOcclusion = ambientOcclusion;

	}

}

export default LightingModel;

export const lightingModel = ( ...params ) => new LightingModel( ...params );
