import { EventDispatcher } from './EventDispatcher.js';

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

var id = 0;

function UniformsGroup() {

	Object.defineProperty( this, 'id', { value: id ++ } );

	this.name = '';

	this.dynamic = false;
	this.uniforms = [];

}

UniformsGroup.prototype = Object.assign( Object.create( EventDispatcher.prototype ), {

	constructor: UniformsGroup,

	isUniformsGroup: true,

	add: function ( uniform ) {

		this.uniforms.push( uniform );

		return this;

	},

	remove: function ( uniform ) {

		var index = this.uniforms.indexOf( uniform );

		if ( index !== - 1 ) this.uniforms.splice( index, 1 );

		return this;

	},

	setName: function ( name ) {

		this.name = name;

		return this;

	},

	dispose: function () {

		this.dispatchEvent( { type: 'dispose' } );

		return this;

	},

	copy: function ( source ) {

		this.name = source.name;
		this.dynamic = source.dynamic;

		var uniformsSource = source.uniforms;

		this.uniforms.length = 0;

		for ( var i = 0, l = uniformsSource.length; i < l; i ++ ) {

			this.uniforms.push( uniformsSource[ i ].clone() );

		}

		return this;

	},

	clone: function () {

		return new this.constructor().copy( this );

	}

} );


export { UniformsGroup };
