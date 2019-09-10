/**
 * @author sunag / http://www.sunag.com.br/
 */

import { Vector3 } from '../../../../build/three.module.js';

import { Vector3Node } from '../inputs/Vector3Node.js';

export class VelocityNode extends Vector3Node {

	constructor( scope, target ) {

		super();

		this.fps = 60;
		this.scope = undefined;

		this.velocity = new Vector3();

		this.setScope( scope );
		this.setTarget( target );

		this.nodeType = "Velocity";

	}

	getConst() {

		return false;

	}

	setScope( scope ) {

		switch ( this.scope ) {

			case 'elastic':

				this.spring = 0;
				this.damping = 0;

				this.moment = new Vector3();

				this.speed = new Vector3();
				this.springVelocity = new Vector3();

				this.lastVelocity = new Vector3();

				break;
		}

		this.scope = scope;

		switch ( scope ) {

			case 'elastic':

				this.spring = 0;
				this.damping = 0;

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

	updateFrameVelocity() {

		if ( this.target ) {

			this.position = this.target.getWorldPosition( this.position || new Vector3() );
			this.velocity.subVectors( this.position, this.oldPosition );
			this.oldPosition.copy( this.position );

		}

	}

	updateFrame( frame ) {

		this.updateFrameVelocity( frame );

		switch ( this.scope ) {

			case 'elastic':

				// convert to real scale: 0 at 1 values
				var deltaFps = frame.delta * ( this.fps || 60 );

				var spring = Math.pow( this.spring, deltaFps ),
					damping = Math.pow( this.damping, deltaFps );

				// fix relative frame-rate
				this.velocity.multiplyScalar( Math.exp( - this.damping * deltaFps ) );

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

		this.setScope( source.scope );

		if ( source.damping !== undefined ) this.damping = source.damping;
		if ( source.spring !== undefined ) this.spring = source.spring;

		return this;

	}

	toJSON( meta ) {

		var data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.type = this.type;
			data.fps = this.fps;

			if ( this.damping !== undefined ) data.damping = this.damping;
			if ( this.spring !== undefined ) data.spring = this.spring;

			if ( this.target ) data.target = this.target.uuid;

		}

		return data;

	}

}

VelocityNode.VELOCITY = 'velocity';
VelocityNode.ELASTIC = 'elastic';
