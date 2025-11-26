import { EventDispatcher } from 'three';
import { ShaderValueCapture } from './ShaderValueCapture.js';
import { ShaderErrorParser } from './ShaderErrorParser.js';
import { ShaderProfiler } from './ShaderProfiler.js';
import { ShaderTemplateLibrary } from './ShaderTemplateLibrary.js';

/**
 * ShaderDebugger - A comprehensive shader debugging tool for three.js
 * 
 * Features:
 * - Visual value inspection (UVs, normals, depth, position, etc.)
 * - Shader error parsing with suggestions
 * - Performance profiling
 * - Shader template library
 * 
 * @example
 * const debugger = new ShaderDebugger(renderer);
 * debugger.attach(material);
 * debugger.setDebugView('normals');
 */
class ShaderDebugger extends EventDispatcher {

	constructor( renderer, options = {} ) {

		super();

		this.renderer = renderer;
		this.enabled = options.enabled !== false;

		// Components
		this.valueCapture = new ShaderValueCapture();
		this.errorParser = new ShaderErrorParser();
		this.profiler = new ShaderProfiler( renderer );
		this.templateLibrary = new ShaderTemplateLibrary();

		// State
		this.attachedMaterials = new Map();
		this.currentDebugView = null;

		// Hook into shader errors
		this._setupErrorHook();

	}

	/**
	 * Sets up the shader error hook.
	 * @private
	 */
	_setupErrorHook() {

		if ( this.renderer.debug && typeof this.renderer.debug.onShaderError === 'function' ) {

			const originalOnShaderError = this.renderer.debug.onShaderError;

			this.renderer.debug.onShaderError = ( gl, program, vertexShader, fragmentShader ) => {

				// Call original handler
				if ( originalOnShaderError ) {

					originalOnShaderError( gl, program, vertexShader, fragmentShader );

				}

				// Parse and dispatch error
				const vertexLog = gl.getShaderInfoLog( vertexShader );
				const fragmentLog = gl.getShaderInfoLog( fragmentShader );
				const programLog = gl.getProgramInfoLog( program );

				const error = this.errorParser.parse( vertexLog, fragmentLog, programLog );

				this.dispatchEvent( { type: 'error', error: error } );

			};

		}

	}

	/**
	 * Attaches the debugger to a material.
	 * @param {Material} material - The material to debug
	 */
	attach( material ) {

		if ( ! material.isShaderMaterial && ! material.isRawShaderMaterial ) {

			console.warn( 'ShaderDebugger: Can only attach to ShaderMaterial or RawShaderMaterial' );
			return;

		}

		if ( this.attachedMaterials.has( material ) ) {

			return;

		}

		// Store original shaders
		const attachment = {
			originalVertexShader: material.vertexShader,
			originalFragmentShader: material.fragmentShader,
			material: material
		};

		this.attachedMaterials.set( material, attachment );

		this.dispatchEvent( { type: 'attached', material: material } );

	}

	/**
	 * Detaches the debugger from a material.
	 * @param {Material} material - The material to detach
	 */
	detach( material ) {

		const attachment = this.attachedMaterials.get( material );

		if ( ! attachment ) return;

		// Restore original shaders
		material.vertexShader = attachment.originalVertexShader;
		material.fragmentShader = attachment.originalFragmentShader;
		material.needsUpdate = true;

		this.attachedMaterials.delete( material );

		this.dispatchEvent( { type: 'detached', material: material } );

	}

	/**
	 * Sets the debug visualization mode.
	 * @param {string|null} mode - Debug mode ('uvs', 'normals', 'depth', 'position', 'worldPosition', 'viewPosition', 'screenSpace', 'tangents') or null for none
	 */
	setDebugView( mode ) {

		this.currentDebugView = mode;

		this.attachedMaterials.forEach( ( attachment, material ) => {

			if ( mode ) {

				// Inject debug visualization
				const debugCode = this.valueCapture.getDebugCode( mode );

				material.vertexShader = this.valueCapture.injectVertexShader(
					attachment.originalVertexShader,
					mode
				);
				material.fragmentShader = this.valueCapture.injectFragmentShader(
					attachment.originalFragmentShader,
					debugCode
				);

			} else {

				// Restore original shaders
				material.vertexShader = attachment.originalVertexShader;
				material.fragmentShader = attachment.originalFragmentShader;

			}

			material.needsUpdate = true;

		} );

		this.dispatchEvent( { type: 'debugViewChanged', mode: mode } );

	}

	/**
	 * Applies a shader template to a material.
	 * @param {Material} material - The material to modify
	 * @param {string} templateName - Name of the template to apply
	 * @returns {boolean} Success status
	 */
	applyTemplate( material, templateName ) {

		const template = this.templateLibrary.getTemplate( templateName );

		if ( ! template ) {

			console.warn( `ShaderDebugger: Template "${templateName}" not found` );
			return false;

		}

		// Apply template shaders
		material.vertexShader = template.vertexShader;
		material.fragmentShader = template.fragmentShader;

		// Apply template uniforms
		if ( template.uniforms ) {

			material.uniforms = material.uniforms || {};

			for ( const key in template.uniforms ) {

				const uniformDef = template.uniforms[ key ];

				if ( uniformDef.value && uniformDef.value.clone ) {

					material.uniforms[ key ] = { value: uniformDef.value.clone() };

				} else {

					material.uniforms[ key ] = { value: uniformDef.value };

				}

			}

		}

		material.needsUpdate = true;

		// Update stored original shaders
		const attachment = this.attachedMaterials.get( material );
		if ( attachment ) {

			attachment.originalVertexShader = material.vertexShader;
			attachment.originalFragmentShader = material.fragmentShader;

		}

		this.dispatchEvent( { type: 'templateApplied', material: material, templateName: templateName } );

		return true;

	}

	/**
	 * Starts performance profiling.
	 */
	startProfiling() {

		this.profiler.start();

	}

	/**
	 * Stops performance profiling.
	 * @returns {Object} Profiling results
	 */
	stopProfiling() {

		return this.profiler.stop();

	}

	/**
	 * Updates the profiler (call each frame when profiling).
	 */
	updateProfiler() {

		this.profiler.update();

	}

	/**
	 * Disposes of the debugger and restores all materials.
	 */
	dispose() {

		// Restore all attached materials
		this.attachedMaterials.forEach( ( attachment, material ) => {

			material.vertexShader = attachment.originalVertexShader;
			material.fragmentShader = attachment.originalFragmentShader;
			material.needsUpdate = true;

		} );

		this.attachedMaterials.clear();
		this.profiler.dispose();

	}

}

export { ShaderDebugger };

