import WebGPUProgrammableStage from './WebGPUProgrammableStage.js';

class WebGPUComputePipelines {

	constructor( device ) {

		this.device = device;

		this.pipelines = new WeakMap();
		this.stages = {
			compute: new WeakMap()
		};

	}

	get( param ) {

		let pipeline = this.pipelines.get( param );

		// @TODO: Reuse compute pipeline if possible, introduce WebGPUComputePipeline

		if ( pipeline === undefined ) {

			const device = this.device;

			const shader = {
				computeShader: param.shader
			};

			// programmable stage

			let stageCompute = this.stages.compute.get( shader );

			if ( stageCompute === undefined ) {

 				stageCompute = new WebGPUProgrammableStage( device, shader.computeShader, 'compute' );

				this.stages.compute.set( shader, stageCompute );

			}

			pipeline = device.createComputePipeline( {
				compute: stageCompute.stage
			} );

			this.pipelines.set( param, pipeline );

		}

		return pipeline;

	}

	dispose() {

		this.pipelines = new WeakMap();
		this.stages = {
			compute: new WeakMap()
		};

	}

}

export default WebGPUComputePipelines;
