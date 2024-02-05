let _id = 0;

class ProgrammableStage {

	constructor( code, type, transforms = null, attributes = null ) {

		this.id = _id ++;

		this.code = code;
		this.stage = type;
		this.transforms = transforms;
		this.attributes = attributes;

		this.usedTimes = 0;

	}

}

export default ProgrammableStage;
