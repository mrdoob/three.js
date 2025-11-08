import Linker from './Linker.js';

/**
 * A class that transpiles shader code from one language into another.
 *
 * `Transpiler` can only be used to convert GLSL into TSL right now. It is intended
 * to support developers when they want to migrate their custom materials from the
 * current to the new node-based material system.
 *
 * @three_import import Transpiler from 'three/addons/transpiler/Transpiler.js';
 */
class Transpiler {

	/**
	 * Constructs a new transpiler.
	 *
	 * @param {GLSLDecoder} decoder - The GLSL decoder.
	 * @param {TSLEncoder} encoder - The TSL encoder.
	 */
	constructor( decoder, encoder ) {

		/**
		 * The GLSL decoder. This component parse GLSL and produces
		 * a language-independent AST for further processing.
		 *
		 * @type {GLSLDecoder}
		 */
		this.decoder = decoder;

		/**
		 * The TSL encoder. It takes the AST and emits TSL code.
		 *
		 * @type {TSLEncoder}
		 */
		this.encoder = encoder;

		/**
		 * The linker. It processes the AST and resolves
		 * variable and function references, ensuring that all
		 * dependencies are properly linked.
		 *
		 * @type {Linker}
		 */
		this.linker = new Linker();

	}

	/**
	 * Parses the given GLSL source and returns TSL syntax.
	 *
	 * @param {string} source - The GLSL source.
	 * @return {string} The TSL code.
	 */
	parse( source ) {

		const ast = this.decoder.parse( source );

		// Process the AST to resolve variable and function references and optimizations.
		this.linker.process( ast );

		return this.encoder.emit( ast );

	}

}

export default Transpiler;
