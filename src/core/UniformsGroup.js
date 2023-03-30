import { EventDispatcher } from './EventDispatcher.js';
import { StaticDrawUsage } from '../constants.js';

let id = 0;

class UniformsGroup extends EventDispatcher {

	constructor( count ) {

		super();

		this.isUniformsGroup = true;

		Object.defineProperty( this, 'id', { value: id ++ } );

		this.name = '';

		this.usage = StaticDrawUsage;
		this.uniforms = [];
		this.__offsetNeedsUpdate = [];
		this.count = count !== undefined ? count : 1;

	}

	add( uniform ) {

		this.uniforms.push( uniform );

		return this;

	}

	remove( uniform ) {


		// Handle promise subdata update for dynamic uniforms
		if ( this.count > 0 && uniform && uniform.__offset !== undefined && uniform.__data.length >= 0 ) {

			this.__offsetNeedsUpdate.push( [ uniform.__offset, uniform.__data.slice().fill( 0 ) ] );

		}

		// Cannot remove the last uniform or UBO will break (use a uniform buffer that is too small)
		if ( this.uniforms.length === 1 ) {

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

			this.uniforms.push( uniformsSource[ i ].clone() );

		}

		return this;

	}

	clone() {

		return new this.constructor().copy( this );

	}

}

export { UniformsGroup };
