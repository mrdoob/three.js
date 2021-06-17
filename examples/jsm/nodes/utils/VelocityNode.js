import { Vector3 } from '../../../../build/three.module.js';

import { Vector3Node } from '../inputs/Vector3Node.js';

class VelocityNode extends Vector3Node {

	constructor( target, params ) {

		super();

		this.params = {};

		this.velocity = new Vector3();

		this.setTarget( target );
		this.setParams( params );

	}

	getReadonly( /*builder*/ ) {

		return false;

	}

	setParams( params ) {

		switch ( this.params.type ) {

			case 'elastic':

				delete this.moment;

				delete this.speed;
				delete this.springVelocity;

				delete this.lastVelocity;

				break;

		}

		this.params = params || {};

		switch ( this.params.type ) {

			case 'elastic':

				this.moment = new Vector3();

				this.speed = new Vector3();
				this.springVelocity = new Vector3();

				this.lastVelocity = new Vector3();

				break;

		}

	}

	setTarget( target ) {

		if ( this.target ) {

			delete this.position;
			delete this.oldPosition;

		}

		this.target = target;

		if ( target ) {

			this.position = target.getWorldPosition( this.position || new Vector3() );
			this.oldPosition = this.position.clone();

		}

	}

	updateFrameVelocity( /*frame*/ ) {

		if ( this.target ) {

			this.position = this.target.getWorldPosition( this.position || new Vector3() );
			this.velocity.subVectors( this.position, this.oldPosition );
			this.oldPosition.copy( this.position );

		}

	}

	updateFrame( frame ) {

		this.updateFrameVelocity( frame );

		switch ( this.params.type ) {

			case 'elastic':

				// convert to real scale: 0 at 1 values
				const deltaFps = frame.delta * ( this.params.fps || 60 );

				const spring = Math.pow( this.params.spring, deltaFps ),
					damping = Math.pow( this.params.damping, deltaFps );

				// fix relative frame-rate
				this.velocity.multiplyScalar( Math.exp( - this.params.damping * deltaFps ) );

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

	}

	copy( source ) {

		super.copy( source );

		if ( source.target ) this.setTarget( source.target );

		this.setParams( source.params );

		return this;

	}

	toJSON( meta ) {

		const data = super.toJSON( meta );

		if ( this.target ) data.target = this.target.uuid;

		// clone params
		data.params = JSON.parse( JSON.stringify( this.params ) );

		return data;

	}

}

VelocityNode.prototype.nodeType = 'Velocity';

export { VelocityNode };
