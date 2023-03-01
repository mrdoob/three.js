class LightingModel {

	constructor( direct = null, indirectDiffuse = null, indirectSpecular = null, ambientOcclusion = null ) {

		this.direct = direct;
		this.indirectDiffuse = indirectDiffuse;
		this.indirectSpecular = indirectSpecular;
		this.ambientOcclusion = ambientOcclusion;

	}

}

export default LightingModel;

export const lightingModel = ( ...params ) => new LightingModel( ...params );
