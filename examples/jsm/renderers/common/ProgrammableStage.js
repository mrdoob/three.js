let _id = 0;

class ProgrammableStage {

	constructor( code, type ) {

		this.id = _id ++;

		this.code = code;
		this.stage = type;

		this.usedTimes = 0;

	}

}

export default ProgrammableStage;
