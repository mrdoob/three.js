import { Material } from './Material.js';
import { cloneUniforms, cloneUniformsGroups } from '../renderers/shaders/UniformsUtils.js';

import default_vertex from '../renderers/shaders/ShaderChunk/default_vertex.glsl.js';
import default_fragment from '../renderers/shaders/ShaderChunk/default_fragment.glsl.js';

/**
 * A material rendered with custom shaders. A shader is a small program written in GLSL.
 * that runs on the GPU. You may want to use a custom shader if you need to implement an
 * effect not included with any of the built-in materials.
 *
 * There are the following notes to bear in mind when using a `ShaderMaterial`:
 *
 * - `ShaderMaterial` can only be used with {@link WebGLRenderer}.
 * - Built in attributes and uniforms are passed to the shaders along with your code. If
 * you don't want that, use {@link RawShaderMaterial} instead.
 * - You can use the directive `#pragma unroll_loop_start` and `#pragma unroll_loop_end`
 * in order to unroll a `for` loop in GLSL by the shader preprocessor. The directive has
 * to be placed right above the loop. The loop formatting has to correspond to a defined standard.
 *   - The loop has to be [normalized](https://en.wikipedia.org/wiki/Normalized_loop).
 *   - The loop variable has to be *i*.
 *   - The value `UNROLLED_LOOP_INDEX` will be replaced with the explicitly
 * value of *i* for the given iteration and can be used in preprocessor
 * statements.
 *
 * ```js
 * const material = new THREE.ShaderMaterial( {
 * 	uniforms: {
 * 		time: { value: 1.0 },
 * 		resolution: { value: new THREE.Vector2() }
 * 	},
 * 	vertexShader: document.getElementById( 'vertexShader' ).textContent,
 * 	fragmentShader: document.getElementById( 'fragmentShader' ).textContent
 * } );
 * ```
 *
 * @augments Material
 */
class ShaderMaterial extends Material {

	/**
	 * Constructs a new shader material.
	 *
	 * @param {Object} [parameters] - An object with one or more properties
	 * defining the material's appearance. Any property of the material
	 * (including any property from inherited materials) can be passed
	 * in here. Color values can be passed any type of value accepted
	 * by {@link Color#set}.
	 */
	constructor( parameters ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isShaderMaterial = true;

		this.type = 'ShaderMaterial';

		/**
		 * Defines custom constants using `#define` directives within the GLSL code
		 * for both the vertex shader and the fragment shader; each key/value pair
		 * yields another directive.
		 * ```js
		 * defines: {
		 * 	FOO: 15,
		 * 	BAR: true
		 * }
		 * ```
		 * Yields the lines:
		 * ```
		 * #define FOO 15
		 * #define BAR true
		 * ```
		 *
		 * @type {Object}
		 */
		this.defines = {};

		/**
		 * An object of the form:
		 * ```js
		 * {
		 * 	"uniform1": { value: 1.0 },
		 * 	"uniform2": { value: 2 }
		 * }
		 * ```
		 * specifying the uniforms to be passed to the shader code; keys are uniform
		 * names, values are definitions of the form
		 * ```
		 * {
		 * 	value: 1.0
		 * }
		 * ```
		 * where `value` is the value of the uniform. Names must match the name of
		 * the uniform, as defined in the GLSL code. Note that uniforms are refreshed
		 * on every frame, so updating the value of the uniform will immediately
		 * update the value available to the GLSL code.
		 *
		 * @type {Object}
		 */
		this.uniforms = {};

		/**
		 * An array holding uniforms groups for configuring UBOs.
		 *
		 * @type {Array<UniformsGroup>}
		 */
		this.uniformsGroups = [];

		/**
		 * Vertex shader GLSL code. This is the actual code for the shader.
		 *
		 * @type {string}
		 */
		this.vertexShader = default_vertex;

		/**
		 * Fragment shader GLSL code. This is the actual code for the shader.
		 *
		 * @type {string}
		 */
		this.fragmentShader = default_fragment;

		/**
		 * Controls line thickness or lines.
		 *
		 * WebGL and WebGPU ignore this setting and always render line primitives with a
		 * width of one pixel.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.linewidth = 1;

		/**
		 * Renders the geometry as a wireframe.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.wireframe = false;

		/**
		 * Controls the thickness of the wireframe.
		 *
		 * WebGL and WebGPU ignore this property and always render
		 * 1 pixel wide lines.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.wireframeLinewidth = 1;

		/**
		 * Define whether the material color is affected by global fog settings; `true`
		 * to pass fog uniforms to the shader.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.fog = false;

		/**
		 * Defines whether this material uses lighting; `true` to pass uniform data
		 * related to lighting to this shader.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.lights = false;

		/**
		 * Defines whether this material supports clipping; `true` to let the renderer
		 * pass the clippingPlanes uniform.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.clipping = false;

		/**
		 * Overwritten and set to `true` by default.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.forceSinglePass = true;

		/**
		 * This object allows to enable certain WebGL 2 extensions.
		 *
		 * - clipCullDistance: set to `true` to use vertex shader clipping
		 * - multiDraw: set to `true` to use vertex shader multi_draw / enable gl_DrawID
		 *
		 * @type {{clipCullDistance:false,multiDraw:false}}
		 */
		this.extensions = {
			clipCullDistance: false, // set to use vertex shader clipping
			multiDraw: false // set to use vertex shader multi_draw / enable gl_DrawID
		};

		/**
		 * When the rendered geometry doesn't include these attributes but the
		 * material does, these default values will be passed to the shaders. This
		 * avoids errors when buffer data is missing.
		 *
		 * - color: [ 1, 1, 1 ]
		 * - uv: [ 0, 0 ]
		 * - uv1: [ 0, 0 ]
		 *
		 * @type {Object}
		 */
		this.defaultAttributeValues = {
			'color': [ 1, 1, 1 ],
			'uv': [ 0, 0 ],
			'uv1': [ 0, 0 ]
		};

		/**
		 * If set, this calls [gl.bindAttribLocation](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindAttribLocation)
		 * to bind a generic vertex index to an attribute variable.
		 *
		 * @type {string|undefined}
		 * @default undefined
		 */
		this.index0AttributeName = undefined;

		/**
		 * Can be used to force a uniform update while changing uniforms in
		 * {@link Object3D#onBeforeRender}.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.uniformsNeedUpdate = false;

		/**
		 * Defines the GLSL version of custom shader code.
		 *
		 * @type {?(GLSL1|GLSL3)}
		 * @default null
		 */
		this.glslVersion = null;

		if ( parameters !== undefined ) {

			this.setValues( parameters );

		}

	}

	copy( source ) {

		super.copy( source );

		this.fragmentShader = source.fragmentShader;
		this.vertexShader = source.vertexShader;

		this.uniforms = cloneUniforms( source.uniforms );
		this.uniformsGroups = cloneUniformsGroups( source.uniformsGroups );

		this.defines = Object.assign( {}, source.defines );

		this.wireframe = source.wireframe;
		this.wireframeLinewidth = source.wireframeLinewidth;

		this.fog = source.fog;
		this.lights = source.lights;
		this.clipping = source.clipping;

		this.extensions = Object.assign( {}, source.extensions );

		this.glslVersion = source.glslVersion;

		return this;

	}

	toJSON( meta ) {

		const data = super.toJSON( meta );

		data.glslVersion = this.glslVersion;
		data.uniforms = {};

		for ( const name in this.uniforms ) {

			const uniform = this.uniforms[ name ];
			const value = uniform.value;

			if ( value && value.isTexture ) {

				data.uniforms[ name ] = {
					type: 't',
					value: value.toJSON( meta ).uuid
				};

			} else if ( value && value.isColor ) {

				data.uniforms[ name ] = {
					type: 'c',
					value: value.getHex()
				};

			} else if ( value && value.isVector2 ) {

				data.uniforms[ name ] = {
					type: 'v2',
					value: value.toArray()
				};

			} else if ( value && value.isVector3 ) {

				data.uniforms[ name ] = {
					type: 'v3',
					value: value.toArray()
				};

			} else if ( value && value.isVector4 ) {

				data.uniforms[ name ] = {
					type: 'v4',
					value: value.toArray()
				};

			} else if ( value && value.isMatrix3 ) {

				data.uniforms[ name ] = {
					type: 'm3',
					value: value.toArray()
				};

			} else if ( value && value.isMatrix4 ) {

				data.uniforms[ name ] = {
					type: 'm4',
					value: value.toArray()
				};

			} else {

				data.uniforms[ name ] = {
					value: value
				};

				// note: the array variants v2v, v3v, v4v, m4v and tv are not supported so far

			}

		}

		if ( Object.keys( this.defines ).length > 0 ) data.defines = this.defines;

		data.vertexShader = this.vertexShader;
		data.fragmentShader = this.fragmentShader;

		data.lights = this.lights;
		data.clipping = this.clipping;

		const extensions = {};

		for ( const key in this.extensions ) {

			if ( this.extensions[ key ] === true ) extensions[ key ] = true;

		}

		if ( Object.keys( extensions ).length > 0 ) data.extensions = extensions;

		return data;

	}

}

/**
 * This type represents the fields required to store and run the shader code.
 *
 * @typedef {Object} ShaderMaterial~Shader
 * @property {string} name - The name of the shader.
 * @property {Object<string, Uniform>} uniforms - The uniforms of the shader.
 * @property {Object<string, any>} defines - The defines of the shader.
 * @property {string} vertexShader - The vertex shader code.
 * @property {string} fragmentShader - The fragment shader code.
 **/

export { ShaderMaterial };
