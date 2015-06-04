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

THREE.InstancedBufferGeometry.prototype.addDrawCall = function ( start, count, indexOffset, instances ) {

	this.drawcalls.push( {

		start: start,
		count: count,
		index: indexOffset !== undefined ? indexOffset : 0,
		instances: instances

	} );

},

THREE.InstancedBufferGeometry.prototype.clone = function () {

	var geometry = new THREE.InstancedBufferGeometry();

	for ( var attr in this.attributes ) {

		var sourceAttr = this.attributes[attr];
		geometry.addAttribute( attr, sourceAttr.clone() );

	}

	for ( var i = 0, il = this.offsets.length; i < il; i++ ) {

		var offset = this.offsets[i];

		geometry.offsets.push( {

			start: offset.start,
			index: offset.index,
			count: offset.count,
			instances: offset.instances

		} );

	}

	return geometry;

};

THREE.EventDispatcher.prototype.apply( THREE.InstancedBufferGeometry.prototype );
