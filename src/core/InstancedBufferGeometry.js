/**
 * @author benaadams / https://twitter.com/ben_a_adams
 */

THREE.InstancedBufferGeometry = function () {

	THREE.BufferGeometry.call( this );

	this.type = 'InstancedBufferGeometry';
	this.maxInstancedCount = undefined;

};

THREE.InstancedBufferGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
THREE.InstancedBufferGeometry.prototype.constructor = THREE.InstancedBufferGeometry;

THREE.InstancedBufferGeometry.prototype.addDrawCall = function ( start, count, instances ) {

	this.drawcalls.push( {

		start: start,
		count: count,
		instances: instances

	} );

};

THREE.InstancedBufferGeometry.prototype.copy = function ( source ) {

	for ( var attr in source.attributes ) {

		var sourceAttr = source.attributes[ attr ];
		this.addAttribute( attr, sourceAttr.clone() );

	}

	for ( var i = 0, il = source.drawcalls.length; i < il; i ++ ) {

		var offset = source.drawcalls[ i ];
		this.addDrawCall( offset.start, offset.count, offset.instances );

	}

	return this;

};

THREE.EventDispatcher.prototype.apply( THREE.InstancedBufferGeometry.prototype );
