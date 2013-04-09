/**
 * @author alteredq / http://alteredqualia.com/
 *
 * AudioObject
 *
 *	- 3d spatialized sound with Doppler-shift effect
 *
 *	- uses Audio API (currently supported in WebKit-based browsers)
 *		https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html
 *
 *	- based on Doppler effect demo from Chromium
 * 		http://chromium.googlecode.com/svn/trunk/samples/audio/doppler.html
 *
 * - parameters
 *
 *		- listener
 *			dopplerFactor	// A constant used to determine the amount of pitch shift to use when rendering a doppler effect.
 *			speedOfSound	// The speed of sound used for calculating doppler shift. The default value is 343.3 meters / second.
 *
 *		- panner
 *			refDistance		// A reference distance for reducing volume as source move further from the listener.
 *			maxDistance		// The maximum distance between source and listener, after which the volume will not be reduced any further.
 *			rolloffFactor	// Describes how quickly the volume is reduced as source moves away from listener.
 * 			coneInnerAngle	// An angle inside of which there will be no volume reduction.
 *			coneOuterAngle 	// An angle outside of which the volume will be reduced to a constant value of coneOuterGain.
 *			coneOuterGain	// Amount of volume reduction outside of the coneOuterAngle.
 */

THREE.AudioObject = function ( url, volume, playbackRate, loop ) {

	THREE.Object3D.call( this );

	if ( playbackRate === undefined ) playbackRate = 1;
	if ( volume === undefined ) volume = 1;
	if ( loop === undefined ) loop = true;

	if ( ! this.context ) {

		try {

			THREE.AudioObject.prototype.context = new webkitAudioContext();

		} catch( error ) {

			console.warn( "THREE.AudioObject: webkitAudioContext not found" );
			return this;

		}

	}

	this.directionalSource = false;

	this.listener = this.context.listener;
	this.panner = this.context.createPanner();
	this.source = this.context.createBufferSource();

	this.masterGainNode = this.context.createGainNode();
	this.dryGainNode = this.context.createGainNode();

	// Setup initial gains

	this.masterGainNode.gain.value = volume;
	this.dryGainNode.gain.value = 3.0;

	// Connect dry mix

	this.source.connect( this.panner );
	this.panner.connect( this.dryGainNode );
	this.dryGainNode.connect( this.masterGainNode );

	// Connect master gain

	this.masterGainNode.connect( this.context.destination );

	// Set source parameters and load sound

	this.source.playbackRate.value = playbackRate;
	this.source.loop = loop;

	loadBufferAndPlay( url );

	// private properties

	var soundPosition = new THREE.Vector3(),
	cameraPosition = new THREE.Vector3(),
	oldSoundPosition = new THREE.Vector3(),
	oldCameraPosition = new THREE.Vector3(),

	soundDelta = new THREE.Vector3(),
	cameraDelta = new THREE.Vector3(),

	soundFront = new THREE.Vector3(),
	cameraFront = new THREE.Vector3(),
	soundUp = new THREE.Vector3(),
	cameraUp = new THREE.Vector3();

	var _this = this;

	// API

	this.setVolume = function ( volume ) {

		this.masterGainNode.gain.value = volume;

	};

	this.update = function ( camera ) {

		oldSoundPosition.copy( soundPosition );
		oldCameraPosition.copy( cameraPosition );

		soundPosition.getPositionFromMatrix( this.matrixWorld );
		cameraPosition.getPositionFromMatrix( camera.matrixWorld );

		soundDelta.subVectors( soundPosition, oldSoundPosition );
		cameraDelta.subVectors( cameraPosition, oldCameraPosition );

		cameraUp.copy( camera.up );

		cameraFront.set( 0, 0, -1 );
		cameraFront.transformDirection( camera.matrixWorld );

		this.listener.setPosition( cameraPosition.x, cameraPosition.y, cameraPosition.z );
		this.listener.setVelocity( cameraDelta.x, cameraDelta.y, cameraDelta.z );
		this.listener.setOrientation( cameraFront.x, cameraFront.y, cameraFront.z, cameraUp.x, cameraUp.y, cameraUp.z );

		this.panner.setPosition( soundPosition.x, soundPosition.y, soundPosition.z );
		this.panner.setVelocity( soundDelta.x, soundDelta.y, soundDelta.z );

		if ( this.directionalSource ) {

			soundFront.set( 0, 0, -1 );
			soundFront.transformDirection( this.matrixWorld );

			soundUp.copy( this.up );
			this.panner.setOrientation( soundFront.x, soundFront.y, soundFront.z, soundUp.x, soundUp.y, soundUp.z );

		}


	};

	function loadBufferAndPlay( url ) {

		// Load asynchronously

		var request = new XMLHttpRequest();
		request.open( "GET", url, true );
		request.responseType = "arraybuffer";

		request.onload = function() {

			_this.source.buffer = _this.context.createBuffer( request.response, true );
			_this.source.noteOn( 0 );

		}

		request.send();

	}

};

THREE.AudioObject.prototype = Object.create( THREE.Object3D.prototype );

THREE.AudioObject.prototype.context = null;
THREE.AudioObject.prototype.type = null;

