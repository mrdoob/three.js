/**
 * @author mrdoob / http://mrdoob.com/
 */

module.exports = AudioListener;

var Object3D = require( "../../core/Object3D" ),
	Quaternion = require( "../../math/Quaternion" ),
	Vector3 = require( "../../math/Vector3" );

function AudioListener() {

	Object3D.call( this );

	this.type = "AudioListener";

	this.context = ( self.AudioContext !== undefined ) ? new self.AudioContext() : new self.webkitAudioContext();

}

AudioListener.prototype = Object.create( Object3D.prototype );
AudioListener.prototype.constructor = AudioListener;

AudioListener.prototype.updateMatrixWorld = ( function () {

	var position;
	var quaternion;
	var scale;
	var orientation;

	return function ( force ) {

		if ( position === undefined ) { position = new Vector3(); }
		if ( quaternion === undefined ) { quaternion = new Quaternion(); }
		if ( scale === undefined ) { scale = new Vector3(); }
		if ( orientation === undefined ) { orientation = new Vector3(); }

		Object3D.prototype.updateMatrixWorld.call( this, force );

		var listener = this.context.listener;
		var up = this.up;

		this.matrixWorld.decompose( position, quaternion, scale );

		orientation.set( 0, 0, - 1 ).applyQuaternion( quaternion );

		listener.setPosition( position.x, position.y, position.z );
		listener.setOrientation( orientation.x, orientation.y, orientation.z, up.x, up.y, up.z );

	};

}() );
