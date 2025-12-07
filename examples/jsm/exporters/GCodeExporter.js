/**
 * A wrapper for exporting G-code using Polyslice.
 *
 * This exporter demonstrates how to integrate with the external Polyslice library
 * (https://github.com/jgphilpott/polyslice) to convert three.js meshes into G-code
 * for 3D printing. Polyslice is an AI-powered slicer designed specifically for the
 * three.js ecosystem.
 *
 * **Important:** This exporter requires the Polyslice library to be loaded separately.
 * You can include it via CDN or npm:
 *
 * CDN (Browser):
 * ```html
 * <script src="https://unpkg.com/@jgphilpott/polyslice/dist/index.browser.min.js"></script>
 * ```
 *
 * NPM (Node.js):
 * ```bash
 * npm install @jgphilpott/polyslice
 * ```
 *
 * Basic usage example:
 * ```js
 * // Browser (Polyslice loaded via CDN)
 * const exporter = new GCodeExporter();
 * const gcode = exporter.parse( mesh, {
 *     printer: 'Ender3',
 *     filament: 'GenericPLA',
 *     layerHeight: 0.2,
 *     infillDensity: 20,
 *     infillPattern: 'grid'
 * } );
 * ```
 *
 * Node.js usage:
 * ```js
 * import { Polyslice, Printer, Filament } from '@jgphilpott/polyslice';
 * const exporter = new GCodeExporter( Polyslice, Printer, Filament );
 * const gcode = exporter.parse( mesh, {
 *     printer: 'Ender3',
 *     filament: 'GenericPLA',
 *     layerHeight: 0.2,
 *     infillDensity: 20,
 *     infillPattern: 'grid'
 * } );
 * ```
 *
 * For more information and advanced usage:
 * - Documentation: https://github.com/jgphilpott/polyslice
 * - Demo Video: https://www.youtube.com/watch?v=V2h3SiafXRc
 * - Live Demo: https://jgphilpott.github.io/polyslice
 *
 * @three_import import { GCodeExporter } from 'three/addons/exporters/GCodeExporter.js';
 */
class GCodeExporter {

	/**
	 * Constructs a new GCodeExporter.
	 *
	 * @param {Object} PolysliceClass - The Polyslice class (optional, uses global if not provided).
	 * @param {Object} PrinterClass - The Printer class (optional, uses global if not provided).
	 * @param {Object} FilamentClass - The Filament class (optional, uses global if not provided).
	 */
	constructor( PolysliceClass, PrinterClass, FilamentClass ) {

		this.PolysliceClass = PolysliceClass;
		this.PrinterClass = PrinterClass;
		this.FilamentClass = FilamentClass;

	}

	/**
	 * Parses the given 3D object and generates G-code using Polyslice.
	 *
	 * @param {Object3D} mesh - A mesh or 3D object to slice and convert to G-code.
	 * @param {GCodeExporter~Options} options - The export options.
	 * @return {string} The generated G-code.
	 */
	parse( mesh, options = {} ) {

		// Check if Polyslice is available
		const PolysliceClass = this.PolysliceClass || ( typeof Polyslice !== 'undefined' ? Polyslice.Polyslice : null );
		const PrinterClass = this.PrinterClass || ( typeof Polyslice !== 'undefined' ? Polyslice.Printer : null );
		const FilamentClass = this.FilamentClass || ( typeof Polyslice !== 'undefined' ? Polyslice.Filament : null );

		if ( ! PolysliceClass || ! PrinterClass || ! FilamentClass ) {

			throw new Error(
				'GCodeExporter: Polyslice library not found. ' +
				'Please load it via CDN or npm. ' +
				'See https://github.com/jgphilpott/polyslice for installation instructions.'
			);

		}

		// Set default options
		const settings = Object.assign( {
			printer: 'Ender3',
			filament: 'GenericPLA',
			layerHeight: 0.2,
			infillDensity: 20,
			infillPattern: 'grid',
			verbose: false
		}, options );

		// Create printer and filament configurations
		const printer = new PrinterClass( settings.printer );
		const filament = new FilamentClass( settings.filament );

		// Create the slicer instance
		const slicer = new PolysliceClass( {
			printer: printer,
			filament: filament,
			layerHeight: settings.layerHeight,
			infillPattern: settings.infillPattern,
			infillDensity: settings.infillDensity,
			verbose: settings.verbose
		} );

		// Slice the mesh and generate G-code
		const gcode = slicer.slice( mesh );

		return gcode;

	}

}

/**
 * Export options for `GCodeExporter`.
 *
 * @typedef {Object} GCodeExporter~Options
 * @property {string} [printer='Ender3'] - Printer profile name (see Polyslice docs for available profiles).
 * @property {string} [filament='GenericPLA'] - Filament profile name (see Polyslice docs for available profiles).
 * @property {number} [layerHeight=0.2] - Layer height in millimeters (0.1-0.4).
 * @property {number} [infillDensity=20] - Infill density percentage (0-100).
 * @property {string} [infillPattern='grid'] - Infill pattern ('grid', 'triangles', or 'hexagons').
 * @property {boolean} [verbose=false] - Enable verbose logging during slicing.
 */

export { GCodeExporter };
