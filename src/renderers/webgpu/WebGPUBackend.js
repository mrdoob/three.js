/*// debugger tools */
import 'https://greggman.github.io/webgpu-avoid-redundant-state-setting/webgpu-check-redundant-state-setting.js';

import { GPUFeatureName, GPULoadOp, GPUStoreOp, GPUIndexFormat, GPUTextureViewDimension } from './utils/WebGPUConstants.js';

import WGSLNodeBuilder from './nodes/WGSLNodeBuilder.js';
import Backend from '../common/Backend.js';

import WebGPUUtils from './utils/WebGPUUtils.js';
import WebGPUAttributeUtils from './utils/WebGPUAttributeUtils.js';
import WebGPUBindingUtils from './utils/WebGPUBindingUtils.js';
import WebGPUPipelineUtils from './utils/WebGPUPipelineUtils.js';
import WebGPUTextureUtils from './utils/WebGPUTextureUtils.js';

import { WebGPUCoordinateSystem } from '../../constants.js';
import WebGPUTimestampQueryPool from './utils/WebGPUTimestampQueryPool.js';
import { warnOnce } from '../../utils.js';

/**
 * WebGPUBackend implementation targeting WebGPU.
 *
 * @private
 * @augments Backend
 */
class WebGPUBackend extends Backend {

	constructor( parameters = {} ) {
		super( parameters );

		this.isWebGPUBackend = true;
		this.parameters.alpha = ( parameters.alpha === undefined ) ? true : parameters.alpha;
		this.parameters.requiredLimits = ( parameters.requiredLimits === undefined ) ? {} : parameters.requiredLimits;

		this.device = null;
		this.context = null;
		this.colorBuffer = null;
		this.defaultRenderPassdescriptor = null;

		this.utils = new WebGPUUtils( this );
		this.attributeUtils = new WebGPUAttributeUtils( this );
		this.bindingUtils = new WebGPUBindingUtils( this );
		this.pipelineUtils = new WebGPUPipelineUtils( this );
		this.textureUtils = new WebGPUTextureUtils( this );

		this.occludedResolveCache = new Map();
	}

	async init( renderer ) {
		await super.init( renderer );

		const parameters = this.parameters;
		let device;

		if ( parameters.device === undefined ) {
			const adapterOptions = { powerPreference: parameters.powerPreference };
			const adapter = ( typeof navigator !== 'undefined' ) ? await navigator.gpu.requestAdapter( adapterOptions ) : null;

			if ( adapter === null ) {
				throw new Error( 'WebGPUBackend: Unable to create WebGPU adapter.' );
			}

			const features = Object.values( GPUFeatureName );
			const supportedFeatures = [];
			for ( const name of features ) {
				if ( adapter.features.has( name ) ) supportedFeatures.push( name );
			}

			const deviceDescriptor = {
				requiredFeatures: supportedFeatures,
				requiredLimits: parameters.requiredLimits
			};

			device = await adapter.requestDevice( deviceDescriptor );
		} else {
			device = parameters.device;
		}

		device.lost.then( ( info ) => {
			renderer.onDeviceLost({
				api: 'WebGPU',
				message: info.message || 'Unknown reason',
				reason: info.reason || null,
				originalEvent: info
			});
		});

		const context = ( parameters.context !== undefined ) ? parameters.context : renderer.domElement.getContext( 'webgpu' );

		this.device = device;
		this.context = context;

		const alphaMode = parameters.alpha ? 'premultiplied' : 'opaque';
		this.trackTimestamp = this.trackTimestamp && this.hasFeature( GPUFeatureName.TimestampQuery );

		this.context.configure({
			device: this.device,
			format: this.utils.getPreferredCanvasFormat(),
			usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
			alphaMode: alphaMode
		});

		// Integrate Greggman's redundant state checker properly
		if (typeof window !== 'undefined' && 'checkWebGPUState' in window) {
			checkWebGPUState();
		}

		this.updateSize();
	}

	get coordinateSystem() {
		return WebGPUCoordinateSystem;
	}

	// More methods defined below...
}

export default WebGPUBackend;
