import { EventDispatcher } from './EventDispatcher.js';
import { StaticDrawUsage } from '../constants.js';

let _id = 0;

class UniformsGroup extends EventDispatcher {

	constructor() {

		super();

		this.isUniformsGroup = true;

		Object.defineProperty( this, 'id', { value: _id ++ } );

		this.name = '';

		this.usage = StaticDrawUsage;
		this.uniforms = [];

	}

	add( uniform ) {

		this.uniforms.push( uniform );

		return this;

	}

	remove( uniform ) {

		// Cannot remove the last uniform or UBO will break (use a uniform buffer that is too small)
		if ( this.uniforms.length === 1 ) {

			console.warn( 'THREE.UniformsGroup: Can not remove the last uniform from a UniformsGroup.' );

			// TODO: Should we unbind in the renderer instead?
			return;

		}

		const index = this.uniforms.indexOf( uniform );

		if ( index !== - 1 ) this.uniforms.splice( index, 1 );

		return this;

	}

	setName( name ) {

		this.name = name;

		return this;

	}

	setUsage( value ) {

		this.usage = value;

		return this;

	}

	dispose() {

		this.dispatchEvent( { type: 'dispose' } );

		return this;

	}

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

	clone() {

		return new this.constructor().copy( this );

	}

}

export { UniformsGroup };
