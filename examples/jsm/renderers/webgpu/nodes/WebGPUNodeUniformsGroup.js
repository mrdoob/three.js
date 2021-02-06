import WebGPUUniformsGroup from '../WebGPUUniformsGroup.js';

class WebGPUNodeUniformsGroup extends WebGPUUniformsGroup {

	constructor( shaderStage ) {

		super( 'nodeUniforms' );

		let shaderStageVisibility;

		if ( shaderStage === 'vertex' ) shaderStageVisibility = GPUShaderStage.VERTEX;
		else if ( shaderStage === 'fragment' ) shaderStageVisibility = GPUShaderStage.FRAGMENT;

		this.setVisibility( shaderStageVisibility );

	}

}

export default WebGPUNodeUniformsGroup;
