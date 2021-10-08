let _id = 0;

class WebGPUProgrammableStage {

	constructor( device, glslang, code, type ) {

		this.id = _id ++;

		this.code = code;
		this.type = type;
		this.usedTimes = 0;

		let data = null;

		if ( /^#version 450/.test( code ) === true ) {

			// GLSL

			data = glslang.compileGLSL( code, type );

		} else {

			// WGSL

			data = code;

		}

		this.stage = {
			module: device.createShaderModule( { code: data } ),
			entryPoint: 'main'
		};

	}

}

export default WebGPUProgrammableStage;
