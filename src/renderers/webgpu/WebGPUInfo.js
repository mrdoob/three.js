import Info from '../common/Info.js';

/**
 * This renderer module provides a series of statistical information
 * specific to the rendering process of the WebGPUBackend. Useful for debugging
 * and monitoring.
 *
 * Updates to parameters specific to the WebGPUBackend should only occur in
 * WebGPUBackend.js or other WebGPUBackend classes (WebGPUPipelineUtils.js,
 * WebGPUBindingUtils.js, etc)
 */
class WebGPUInfo extends Info {

	/**
	 * Constructs a new info component.
	 */
	constructor() {

		super();

		/**
		 * Metrics related to the WebGPU backend of the current renderer.
		 *
		 * @type {Object}
		 * @readonly
		 * @property {number} renderPassEncoders - The number of renderPassEncoders created in the current render thread.
		 * @property {number} renderBundleEncoders - The number of renderBundleEncoders created in the current render thread.
		 * @property {number} computePassEncoders - The number of computePassEncoders created in the current compute thread.
		 * @property {number} commandEncoders - The number of commandEncoders created for the current render/compute thread.
		 * @property {number} deviceEncoderSubmits - The number of calls to device.queue.submit within the current render/compute thread.
		 * @property {number} renderPipelines - The number of calls to GPURenderPassEncoder.setPipeline() within a render thread.
		 * @property {number} computePipelines - The number of calls to GPUComputePassEncoder.setPipeline() within a compute thread.
		 */
		this.backendInfo = {
			// Pass Encoders
			renderPassEncoders: 0,
			renderBundleEncoders: 0,
			computePassEncoders: 0,
			// Command and Device
			commandEncoders: 0,
			deviceEncoderSubmits: 0,
			// Pipelines
			renderPipelines: 0,
			computePipelines: 0
		};

	}

	/**
	 * Resets frame related metrics.
	 */
	reset() {

		super.reset();

		this.backendInfo.renderPassEncoders = 0;
		this.backendInfo.renderBundleEncoders = 0;
		this.backendInfo.computePassEncoders = 0;
		this.backendInfo.commandEncoders = 0;
		this.backendInfo.deviceEncoderSubmits = 0;

		this.backendInfo.renderPipelines = 0;
		this.backendInfo.computePipelines = 0;

	}

}


export default WebGPUInfo;
