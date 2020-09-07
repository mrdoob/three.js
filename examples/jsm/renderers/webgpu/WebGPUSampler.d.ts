import WebGPUBinding from './WebGPUBinding.js';

export default class WebGPUSampler extends WebGPUBinding {

	constructor();

	name: string;
	static type: 'sampler';
	static isSampler: true;

	visibility = GPUShaderStage.FRAGMENT;
	samplerGPU: null;

	setName( name ): void;

}
