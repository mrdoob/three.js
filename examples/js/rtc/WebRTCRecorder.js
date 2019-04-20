/**
 * @author hypnosnova / https://github.com/HypnosNova
 * @param canvas: in most time, it is renderer.domElement.
 * @param options: {
 *     fps: default is 60,
 *     format: default is 'webm',
 *     codecs: default is 'vp8'
 * }
 */

THREE.WebRTCRecorder = function ( canvas, options ) {

	if ( ! MediaSource ) {

		console.error( "Your browser doesn't support WebRTC MediaSource. Try to use chrome or firefox browser." );
		return;

	}

	if ( ! canvas.captureStream ) {

		console.error( "Your browser doesn't support canvas captureStream. Try to use chrome or firefox browser." );
		return;

	}

	// this.video = document.createElement( "video" );
	this.canvas = canvas;
	this.state = "stopped";
	this.init( options );

};

THREE.WebRTCRecorder.prototype = Object.assign( THREE.WebRTCRecorder.prototype, {

	constructor: THREE.WebRTCRecorder,

	isWebRTCRecorder: true,

	init: function ( options ) {

		this.dispose();
		if ( ! options ) {

			options = {
				fps: 60,
				format: "webm",
				codecs: "vp9"
			};

		}
		this.fps = options.fps || 60;
		this.format = options.format || "webm";
		this.codecs = options.codecs || "vp9";

		this.mediaSource = new MediaSource();
		this.stream = this.canvas.captureStream( this.fps );

	},

	dispose: function () {

		if ( this.mediaSource ) {

			let arr = this.mediaSource.sourceBuffers;
			for ( var i = 0; i < arr.length; i ++ ) {

				this.mediaSource.removeSourceBuffer( arr[ i ] );

			}

		}
		if ( this.stream ) {

			let arr = this.stream.getTracks();
			for ( var i = 0; i < arr.length; i ++ ) {

				arr[ i ].enabled = false;
				arr[ i ].stop();
				this.stream.removeTrack( arr[ i ] );

			}

		}
		this.recordedBlobs = [];

	},

	download: function ( fileName ) {

		const blob = new Blob( this.recordedBlobs, { type: "video/" + this.format } );
		const url = window.URL.createObjectURL( blob );
		const a = document.createElement( 'a' );
		a.style.display = 'none';
		a.href = url;
		a.download = ( fileName || "canvas_capture" ) + "." + this.format;
		document.body.appendChild( a );
		a.click();
		setTimeout( () => {

			document.body.removeChild( a );
			window.URL.revokeObjectURL( url );

		}, 100 );

	},

	getBlob: function () {

		return new Blob( this.recordedBlobs, { type: "video/" + this.format } );

	},

	getUrl: function () {

		return window.URL.createObjectURL( this.getBlob() );

	},

	startRecording: function ( ms ) {

		var options1 = { mimeType: "video/" + this.format + ";codecs=" + this.codecs };
		var options2 = { mimeType: "video/" + this.format };
		this.recordedBlobs = [];
		if ( MediaRecorder.isTypeSupported( options1.mimeType ) ) {

			this.mediaRecorder = new MediaRecorder( this.stream, options1 );

		} else if ( MediaRecorder.isTypeSupported( options2.mimeType ) ) {

			this.mediaRecorder = new MediaRecorder( this.stream, options2 );

		} else {

			console.error( "Your browser doesn't support format in MediaRecorder: " + this.format );
			this.state = "stopped";
			return;

		}

		this.mediaRecorder.onstop = function () {

			var superBuffer = new Blob( this.recordedBlobs, { type: "video/" + this.format } );
			// this.video.src = window.URL.createObjectURL( superBuffer );

		}.bind( this );

		this.mediaRecorder.ondataavailable = function ( event ) {

			if ( event.data && event.data.size > 0 ) {

				this.recordedBlobs.push( event.data );

			}

		}.bind( this );

		this.mediaRecorder.start( ms || 100 );
		this.state = "started";

	},

	pauseRecording: function () {

		if ( this.state === "started" ) {

			this.mediaRecorder.pause();
			this.state = "paused";

		} else {

			console.warning( "The record is not \"started\". Current state is: " + this.state );

		}

	},

	resumeRecording: function () {

		if ( this.state === "paused" ) {

			this.mediaRecorder.resume();
			this.state = "started";

		} else {

			console.warning( "The record is not \"paused\". Current state is: " + this.state );

		}

	},

	stopRecording: function () {

		this.state = "stop";
		this.mediaRecorder.stop();

	},

	toggleRecording: function () {

		if ( this.state === "stopped" ) {

			this.startRecording();

		} else {

			this.stopRecording();

		}

	}
} );
