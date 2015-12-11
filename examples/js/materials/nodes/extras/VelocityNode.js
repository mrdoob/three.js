/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.VelocityNode = function( target, params ) {

	THREE.Vector3Node.call( this );

	this.requestUpdate = true;

	this.target = target;

	this.position = this.target.position.clone();
	this.velocity = new THREE.Vector3();
	this.moment = new THREE.Vector3();

	this.params = params || {};

};

THREE.VelocityNode.prototype = Object.create( THREE.Vector3Node.prototype );
THREE.VelocityNode.prototype.constructor = THREE.VelocityNode;

THREE.VelocityNode.prototype.updateAnimation = function( delta ) {

	this.velocity.subVectors( this.target.position, this.position );
	this.position.copy( this.target.position );

	switch ( this.params.type ) {

		case "elastic":

			delta *= this.params.fps || 60;

			var spring = Math.pow( this.params.spring, delta );
			var friction = Math.pow( this.params.friction, delta );

			// spring
			this.moment.x += this.velocity.x * spring;
			this.moment.y += this.velocity.y * spring;
			this.moment.z += this.velocity.z * spring;

			// friction
			this.moment.x *= friction;
			this.moment.y *= friction;
			this.moment.z *= friction;

			this.value.copy( this.moment );

			break;

		default:

			this.value.copy( this.velocity );

			break;
	}

};
