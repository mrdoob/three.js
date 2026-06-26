let _id = 0;

/**
 * Class for representing programmable stages which are vertex,
 * fragment or compute shaders. Unlike fixed-function states (like blending),
 * they represent the programmable part of a pipeline.
 *
 * @private
 */
class ProgrammableStage {

	/**
	 * Constructs a new programmable stage.
	 *
	 * @param {string} code - The shader code.
	 * @param {('vertex'|'fragment'|'compute')} stage - The type of stage.
	 * @param {string} name - The name of the shader.
	 * @param {?Array<Object>} [transforms=null] - The transforms (only relevant for compute stages with WebGL 2 which uses Transform Feedback).
	 * @param {?Array<Object>} [attributes=null] - The attributes (only relevant for compute stages with WebGL 2 which uses Transform Feedback).
	 */
	constructor( code, stage, name, transforms = null, attributes = null ) {

		/**
		 * The id of the programmable stage.
		 *
		 * @type {number}
		 */
		this.id = _id ++;

		/**
		 * The shader code.
		 *
		 * @type {string}
		 */
		this.code = code;

		/**
		 * The type of stage.
		 *
		 * @type {string}
		 */
		this.stage = stage;

		/**
		 * The name of the stage.
		 * This is used for debugging purposes.
		 *
		 * @type {string}
		 */
		this.name = name;

		/**
		 * The transforms (only relevant for compute stages with WebGL 2 which uses Transform Feedback).
		 *
		 * @type {?Array<Object>}
		 */
		this.transforms = transforms;

		/**
		 * The attributes (only relevant for compute stages with WebGL 2 which uses Transform Feedback).
		 *
		 * @type {?Array<Object>}
		 */
		this.attributes = attributes;

		/**
		 * How often the programmable stage is currently in use.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.usedTimes = 0;

	}

}

export default ProgrammableStage;
