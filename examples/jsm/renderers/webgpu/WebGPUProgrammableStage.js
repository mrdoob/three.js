let _id = 0;

class WebGPUProgrammableStage {

	constructor( device, code, type ) {

		this.id = _id ++;

		this.code = code;
		this.type = type;
		this.usedTimes = 0;

		this.stage = {
			module: device.createShaderModule( { code, label: type } ),
			entryPoint: 'main'
		};

	}

}

export default WebGPUProgrammableStage;
