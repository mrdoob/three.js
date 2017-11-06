/**
 * @author sunag / http://www.sunag.com.br/
 */

THREE.VelocityNode = function ( target, params ) {

	THREE.Vector3Node.call( this );

	this.requestUpdate = true;

	this.target = target;
	this.params = params || {};

	this.position = this.target.position.clone();
	this.velocity = new THREE.Vector3();

	switch ( this.params.type ) {

		case "elastic":

			this.moment = new THREE.Vector3();

			this.speed = new THREE.Vector3();
			this.springVelocity = new THREE.Vector3();

			this.lastVelocity = new THREE.Vector3();

			break;

	}

};

THREE.VelocityNode.prototype = Object.create( THREE.Vector3Node.prototype );
THREE.VelocityNode.prototype.constructor = THREE.VelocityNode;

THREE.VelocityNode.prototype.updateFrame = function ( delta ) {

	this.velocity.subVectors( this.target.position, this.position );
	this.position.copy( this.target.position );

	switch ( this.params.type ) {

		case "elastic":

			// convert to real scale: 0 at 1 values
			var deltaFps = delta * (this.params.fps || 60);

			var spring = Math.pow( this.params.spring, deltaFps ),
				damping = Math.pow( this.params.damping, deltaFps );

			// fix relative frame-rate
			this.velocity.multiplyScalar( Math.exp( -this.params.damping * deltaFps ) );

			// elastic
			this.velocity.add( this.springVelocity );
			this.velocity.add( this.speed.multiplyScalar( damping ).multiplyScalar( 1 - spring ) );

			// speed
			this.speed.subVectors( this.velocity, this.lastVelocity );

			// spring velocity
			this.springVelocity.add( this.speed );
			this.springVelocity.multiplyScalar( spring );

			// moment
			this.moment.add( this.springVelocity );

			// damping
			this.moment.multiplyScalar( damping );

			this.lastVelocity.copy( this.velocity );
			this.value.copy( this.moment );

			break;

		default:

			this.value.copy( this.velocity );

	}

};
