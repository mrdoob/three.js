import WebGPURenderPipeline from './WebGPURenderPipeline.js';

let _id = 0;

class WebGPURenderPipelines {

	constructor( renderer, properties, device, glslang, sampleCount, nodes ) {

		this.renderer = renderer;
		this.properties = properties;
		this.device = device;
		this.glslang = glslang;
		this.sampleCount = sampleCount;
		this.nodes = nodes;

		this.pipelines = [];
		this.objectCache = new WeakMap();

		this.shaderModules = {
			vertex: new Map(),
			fragment: new Map()
		};

	}

	get( object ) {

		const device = this.device;
		const properties = this.properties;

		const material = object.material;

		const materialProperties = properties.get( material );
		const objectProperties = properties.get( object );

		let currentPipeline = objectProperties.currentPipeline;

		if ( this._needsUpdate( object ) ) {

			// get shader

			const nodeBuilder = this.nodes.get( object );

			// shader modules

			const glslang = this.glslang;

			let moduleVertex = this.shaderModules.vertex.get( nodeBuilder.vertexShader );

			if ( moduleVertex === undefined ) {

				const byteCodeVertex = glslang.compileGLSL( nodeBuilder.vertexShader, 'vertex' );

				moduleVertex = {
					module: device.createShaderModule( { code: byteCodeVertex } ),
					entryPoint: 'main',
					id: _id ++
				};

				this.shaderModules.vertex.set( nodeBuilder.vertexShader, moduleVertex );

			}

			let moduleFragment = this.shaderModules.fragment.get( nodeBuilder.fragmentShader );

			if ( moduleFragment === undefined ) {

				const byteCodeFragment = glslang.compileGLSL( nodeBuilder.fragmentShader, 'fragment' );

				moduleFragment = {
					module: device.createShaderModule( { code: byteCodeFragment } ),
					entryPoint: 'main',
					id: _id ++
				};

				this.shaderModules.fragment.set( nodeBuilder.fragmentShader, moduleFragment );

			}

			// determine render pipeline

			currentPipeline = this._acquirePipeline( moduleVertex, moduleFragment, object, nodeBuilder );
			objectProperties.currentPipeline = currentPipeline;

			// keep track of all pipelines which are used by a material

			let materialPipelines = materialProperties.pipelines;

			if ( materialPipelines === undefined ) {

				materialPipelines = new Set();
				materialProperties.pipelines = materialPipelines;

			}

			if ( materialPipelines.has( currentPipeline ) === false ) {

				materialPipelines.add( currentPipeline );
				currentPipeline.usedTimes ++;

			}

			// dispose

			if ( materialProperties.disposeCallback === undefined ) {

				const disposeCallback = onMaterialDispose.bind( this );
				materialProperties.disposeCallback = disposeCallback;

				material.addEventListener( 'dispose', disposeCallback );

			}

		}

		return currentPipeline;

	}

	dispose() {

		this.pipelines = [];
		this.objectCache = new WeakMap();
		this.shaderModules = {
			vertex: new Map(),
			fragment: new Map()
		};

	}

	_acquirePipeline( moduleVertex, moduleFragment, object, nodeBuilder ) {

		let pipeline;
		const pipelines = this.pipelines;

		// check for existing pipeline

		const cacheKey = this._computeCacheKey( moduleVertex, moduleFragment, object );

		for ( let i = 0, il = pipelines.length; i < il; i ++ ) {

			const preexistingPipeline = pipelines[ i ];

			if ( preexistingPipeline.cacheKey === cacheKey ) {

				pipeline = preexistingPipeline;
				break;

			}

		}

		if ( pipeline === undefined ) {

			pipeline = new WebGPURenderPipeline( cacheKey, this.device, this.renderer, this.sampleCount );
			pipeline.init( moduleVertex, moduleFragment, object, nodeBuilder );
			pipelines.push( pipeline );

		}

		return pipeline;

	}

	_computeCacheKey( moduleVertex, moduleFragment, object ) {

		const material = object.material;
		const renderer = this.renderer;

		const parameters = [
			moduleVertex.id, moduleFragment.id,
			material.transparent, material.blending, material.premultipliedAlpha,
			material.blendSrc, material.blendDst, material.blendEquation,
			material.blendSrcAlpha, material.blendDstAlpha, material.blendEquationAlpha,
			material.colorWrite,
			material.depthWrite, material.depthTest, material.depthFunc,
			material.stencilWrite, material.stencilFunc,
			material.stencilFail, material.stencilZFail, material.stencilZPass,
			material.stencilFuncMask, material.stencilWriteMask,
			material.side,
			this.sampleCount,
			renderer.getCurrentEncoding(), renderer.getCurrentColorFormat(), renderer.getCurrentDepthStencilFormat()
		];

		return parameters.join();

	}

	_releasePipeline( pipeline ) {

		if ( -- pipeline.usedTimes === 0 ) {

			const pipelines = this.pipelines;

			const i = pipelines.indexOf( pipeline );
			pipelines[ i ] = pipelines[ pipelines.length - 1 ];
			pipelines.pop();

		}

	}

	_needsUpdate( object ) {

		let cache = this.objectCache.get( object );

		if ( cache === undefined ) {

			cache = {};
			this.objectCache.set( object, cache );

		}

		const material = object.material;

		let needsUpdate = false;

		// check material state

		if ( cache.material !== material || cache.materialVersion !== material.version ||
			cache.transparent !== material.transparent || cache.blending !== material.blending || cache.premultipliedAlpha !== material.premultipliedAlpha ||
			cache.blendSrc !== material.blendSrc || cache.blendDst !== material.blendDst || cache.blendEquation !== material.blendEquation ||
			cache.blendSrcAlpha !== material.blendSrcAlpha || cache.blendDstAlpha !== material.blendDstAlpha || cache.blendEquationAlpha !== material.blendEquationAlpha ||
			cache.colorWrite !== material.colorWrite ||
			cache.depthWrite !== material.depthWrite || cache.depthTest !== material.depthTest || cache.depthFunc !== material.depthFunc ||
			cache.stencilWrite !== material.stencilWrite || cache.stencilFunc !== material.stencilFunc ||
			cache.stencilFail !== material.stencilFail || cache.stencilZFail !== material.stencilZFail || cache.stencilZPass !== material.stencilZPass ||
			cache.stencilFuncMask !== material.stencilFuncMask || cache.stencilWriteMask !== material.stencilWriteMask ||
			cache.side !== material.side
		) {

			cache.material = material; cache.materialVersion = material.version;
			cache.transparent = material.transparent; cache.blending = material.blending; cache.premultipliedAlpha = material.premultipliedAlpha;
			cache.blendSrc = material.blendSrc; cache.blendDst = material.blendDst; cache.blendEquation = material.blendEquation;
			cache.blendSrcAlpha = material.blendSrcAlpha; cache.blendDstAlpha = material.blendDstAlpha; cache.blendEquationAlpha = material.blendEquationAlpha;
			cache.colorWrite = material.colorWrite;
			cache.depthWrite = material.depthWrite; cache.depthTest = material.depthTest; cache.depthFunc = material.depthFunc;
			cache.stencilWrite = material.stencilWrite; cache.stencilFunc = material.stencilFunc;
			cache.stencilFail = material.stencilFail; cache.stencilZFail = material.stencilZFail; cache.stencilZPass = material.stencilZPass;
			cache.stencilFuncMask = material.stencilFuncMask; cache.stencilWriteMask = material.stencilWriteMask;
			cache.side = material.side;

			needsUpdate = true;

		}

		// check renderer state

		const renderer = this.renderer;

		const encoding = renderer.getCurrentEncoding();
		const colorFormat = renderer.getCurrentColorFormat();
		const depthStencilFormat = renderer.getCurrentDepthStencilFormat();

		if ( cache.sampleCount !== this.sampleCount || cache.encoding !== encoding ||
			cache.colorFormat !== colorFormat || cache.depthStencilFormat !== depthStencilFormat ) {

			cache.sampleCount = this.sampleCount;
			cache.encoding = encoding;
			cache.colorFormat = colorFormat;
			cache.depthStencilFormat = depthStencilFormat;

			needsUpdate = true;

		}

		return needsUpdate;

	}

}

function onMaterialDispose( event ) {

	const properties = this.properties;

	const material = event.target;
	const materialProperties = properties.get( material );

	material.removeEventListener( 'dispose', materialProperties.disposeCallback );

	properties.remove( material );

	// remove references to pipelines

	const pipelines = properties.get( material ).pipelines;

	if ( pipelines !== undefined ) {

		pipelines.forEach( function ( pipeline ) {

			this._releasePipeline( pipeline );

		} );

	}

	// @TODO: still need remove nodes and bindings

}

export default WebGPURenderPipelines;
