let _id = 0;

class WebGPUProgrammableStage {

	constructor( device, glslang, code, type ) {

		this.id = _id ++;

		this.code = code;
		this.type = type;
		this.usedTimes = 0;

		const byteCode = glslang.compileGLSL( code, type );

		this.stage = {
			module: device.createShaderModule( { code: byteCode } ),
			entryPoint: 'main'
		};

	}

}

export default WebGPUProgrammableStage;
