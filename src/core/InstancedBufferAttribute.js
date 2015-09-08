/**
 * @author benaadams / https://twitter.com/ben_a_adams
 */

module.exports = InstancedBufferAttribute;

var BufferAttribute = require( "./BufferAttribute" );

function InstancedBufferAttribute( array, itemSize, meshPerAttribute ) {

	BufferAttribute.call( this, array, itemSize );

	this.meshPerAttribute = meshPerAttribute || 1;

}

InstancedBufferAttribute.prototype = Object.create( BufferAttribute.prototype );
InstancedBufferAttribute.prototype.constructor = InstancedBufferAttribute;

InstancedBufferAttribute.prototype.copy = function ( source ) {

	BufferAttribute.prototype.copy.call( this, source );

	this.meshPerAttribute = source.meshPerAttribute;

	return this;

};
