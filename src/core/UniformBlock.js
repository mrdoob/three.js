import { EventDispatcher } from './EventDispatcher.js';

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

var id = 0;

function UniformBlock() {

	Object.defineProperty( this, 'id', { value: id ++ } );

	this.name = '';

	this.dynamic = false;
	this.uniforms = [];

}

UniformBlock.prototype = Object.assign( Object.create( EventDispatcher.prototype ), {

	constructor: UniformBlock,

	isUniformBlock: true,

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

	}

} );


export { UniformBlock };
