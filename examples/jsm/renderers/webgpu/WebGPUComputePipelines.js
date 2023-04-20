import WebGPUProgrammableStage from './WebGPUProgrammableStage.js';

class WebGPUComputePipelines {

	constructor( device, nodes ) {

		this.device = device;
		this.nodes = nodes;

		this.pipelines = new WeakMap();
		this.stages = {
			compute: new WeakMap()
		};

	}

	has( computeNode ) {

		return this.pipelines.get( computeNode ) !== undefined;

	}

	get( computeNode ) {

		let pipeline = this.pipelines.get( computeNode );

		// @TODO: Reuse compute pipeline if possible, introduce WebGPUComputePipeline

		if ( pipeline === undefined ) {

			const device = this.device;

			// get shader

			const nodeBuilder = this.nodes.getForCompute( computeNode );
			const computeShader = nodeBuilder.computeShader;

			const shader = {
				computeShader
			};

			// programmable stage

			let stageCompute = this.stages.compute.get( shader );

			if ( stageCompute === undefined ) {

 				stageCompute = new WebGPUProgrammableStage( device, computeShader, 'compute' );

				this.stages.compute.set( shader, stageCompute );

			}

			pipeline = device.createComputePipeline( {
				compute: stageCompute.stage,
				layout: 'auto'
			} );

			this.pipelines.set( computeNode, pipeline );

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
