import { EventDispatcher } from './EventDispatcher.js';
import { StaticDrawUsage } from '../constants.js';

let _id = 0;

/**
 * A class for managing multiple uniforms in a single group. The renderer will process
 * such a definition as a single UBO.
 *
 * Since this class can only be used in context of {@link ShaderMaterial}, it is only supported
 * in {@link WebGLRenderer}.
 *
 * @augments EventDispatcher
 */
class UniformsGroup extends EventDispatcher {

	/**
	 * Constructs a new uniforms group.
	 */
	constructor() {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isUniformsGroup = true;

		/**
		 * The ID of the 3D object.
		 *
		 * @name UniformsGroup#id
		 * @type {number}
		 * @readonly
		 */
		Object.defineProperty( this, 'id', { value: _id ++ } );

		/**
		 * The name of the uniforms group.
		 *
		 * @type {string}
		 */
		this.name = '';

		/**
		 * The buffer usage.
		 *
		 * @type {(StaticDrawUsage|DynamicDrawUsage|StreamDrawUsage|StaticReadUsage|DynamicReadUsage|StreamReadUsage|StaticCopyUsage|DynamicCopyUsage|StreamCopyUsage)}
		 * @default StaticDrawUsage
		 */
		this.usage = StaticDrawUsage;

		/**
		 * An array holding the uniforms.
		 *
		 * @type {Array<Uniform>}
		 */
		this.uniforms = [];

	}

	/**
	 * Adds the given uniform to this uniforms group.
	 *
	 * @param {Uniform} uniform - The uniform to add.
	 * @return {UniformsGroup} A reference to this uniforms group.
	 */
	add( uniform ) {

		this.uniforms.push( uniform );

		return this;

	}

	/**
	 * Removes the given uniform from this uniforms group.
	 *
	 * @param {Uniform} uniform - The uniform to remove.
	 * @return {UniformsGroup} A reference to this uniforms group.
	 */
	remove( uniform ) {

		const index = this.uniforms.indexOf( uniform );

		if ( index !== - 1 ) this.uniforms.splice( index, 1 );

		return this;

	}

	/**
	 * Sets the name of this uniforms group.
	 *
	 * @param {string} name - The name to set.
	 * @return {UniformsGroup} A reference to this uniforms group.
	 */
	setName( name ) {

		this.name = name;

		return this;

	}

	/**
	 * Sets the usage of this uniforms group.
	 *
	 * @param {(StaticDrawUsage|DynamicDrawUsage|StreamDrawUsage|StaticReadUsage|DynamicReadUsage|StreamReadUsage|StaticCopyUsage|DynamicCopyUsage|StreamCopyUsage)} value - The usage to set.
	 * @return {UniformsGroup} A reference to this uniforms group.
	 */
	setUsage( value ) {

		this.usage = value;

		return this;

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever this instance is no longer used in your app.
	 *
	 * @fires Texture#dispose
	 */
	dispose() {

		this.dispatchEvent( { type: 'dispose' } );

	}

	/**
	 * Copies the values of the given uniforms group to this instance.
	 *
	 * @param {UniformsGroup} source - The uniforms group to copy.
	 * @return {UniformsGroup} A reference to this uniforms group.
	 */
	copy( source ) {

		this.name = source.name;
		this.usage = source.usage;

		const uniformsSource = source.uniforms;

		this.uniforms.length = 0;

		for ( let i = 0, l = uniformsSource.length; i < l; i ++ ) {

			const uniforms = Array.isArray( uniformsSource[ i ] ) ? uniformsSource[ i ] : [ uniformsSource[ i ] ];

			for ( let j = 0; j < uniforms.length; j ++ ) {

				this.uniforms.push( uniforms[ j ].clone() );

			}

		}

		return this;

	}

	/**
	 * Returns a new uniforms group with copied values from this instance.
	 *
	 * @return {UniformsGroup} A clone of this instance.
	 */
	clone() {

		return new this.constructor().copy( this );

	}

}

export { UniformsGroup };
