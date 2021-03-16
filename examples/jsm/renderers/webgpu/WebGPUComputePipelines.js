class WebGPUComputePipelines {

	constructor( device, glslang ) {

		this.device = device;
		this.glslang = glslang;

		this.pipelines = new WeakMap();
		this.shaderModules = {
			compute: new WeakMap()
		};

	}

	get( param ) {

		let pipeline = this.pipelines.get( param );

		if ( pipeline === undefined ) {

			const device = this.device;
			const shader = {
				computeShader: param.shader
			};

			// shader modules

			const glslang = this.glslang;

			let moduleCompute = this.shaderModules.compute.get( shader );

			if ( moduleCompute === undefined ) {

				const byteCodeCompute = glslang.compileGLSL( shader.computeShader, 'compute' );

				moduleCompute = device.createShaderModule( { code: byteCodeCompute } );

				this.shaderModules.compute.set( shader, moduleCompute );

			}

			//

			const computeStage = {
				module: moduleCompute,
				entryPoint: 'main'
			};

			pipeline = device.createComputePipeline( {
				computeStage: computeStage
			} );

			this.pipelines.set( param, pipeline );

		}

		return pipeline;

	}

	dispose() {

		this.pipelines = new WeakMap();
		this.shaderModules = {
			compute: new WeakMap()
		};

	}

}

export default WebGPUComputePipelines;
