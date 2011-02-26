/**
 * @author mikael emtinger / http://gomo.se/
 */

THREE.Sound3D = function ( sources, radius, volume, loop ) {

	THREE.Object3D.call( this );

	this.isLoaded = false;
	this.isAddedToDOM = false;
	this.isPlaying = false;
	this.duration = -1;
	this.radius = radius !== undefined ? Math.abs( radius ) : 100;
	this.volume = Math.min( 1, Math.max( 0, volume !== undefined ? volume : 1 ) );

	this.domElement = document.createElement( 'audio' );
	this.domElement.volume = 0;
	this.domElement.pan = 0;
	this.domElement.loop = loop !== undefined ? loop : true;

	// init sources

	this.sources = sources instanceof Array ? sources : [ sources ];

	var element, source, type, s, sl = this.sources.length;

	for ( s = 0; s < sl; s++ ) {

		source = this.sources[ s ];
		source.toLowerCase();

		if ( source.indexOf( ".mp3" ) !== -1 ) {

			type = "audio/mpeg";

		} else if( source.indexOf( ".ogg" ) !== -1 ) {

			type = "audio/ogg";

		} else if( source.indexOf( ".wav" ) !== -1 ) {

			type = "audio/wav";

		}

		if ( this.domElement.canPlayType( type ) ) {

			element = document.createElement( "source" );
			element.src = this.sources[ s ];

			this.domElement.THREESound3D = this;
			this.domElement.appendChild( element );
			this.domElement.addEventListener( "canplay", this.onLoad, true );
			this.domElement.load();

			break;

		}

	}

};


THREE.Sound3D.prototype = new THREE.Object3D();
THREE.Sound3D.prototype.constructor = THREE.Sound3D;
THREE.Sound3D.prototype.supr = THREE.Object3D.prototype;


THREE.Sound3D.prototype.onLoad = function () {

	var sound3D = this.THREESound3D;

	if ( sound3D.isLoaded ) {

		return;

	}

	this.removeEventListener( "canplay", this.onLoad, true );

	sound3D.isLoaded = true;
	sound3D.duration = this.duration;

	if ( sound3D.isPlaying ) {

		sound3D.play();

	}

};

THREE.Sound3D.prototype.addToDOM = function ( parent ) {

	this.isAddedToDOM = true;
	parent.appendChild( this.domElement );

};

THREE.Sound3D.prototype.play = function ( startTime ) {

	this.isPlaying = true;

	if ( this.isLoaded ) {

		this.domElement.play();

		if ( startTime ) {

			this.domElement.currentTime = startTime % this.duration;

		}

	}

};

THREE.Sound3D.prototype.pause = function () {

	this.isPlaying = false;
	this.domElement.pause();

};

THREE.Sound3D.prototype.stop = function (){

	this.isPlaying = false;
	this.domElement.pause();
	this.domElement.currentTime = 0;

};

THREE.Sound3D.prototype.calculateVolumeAndPan = function ( cameraRelativePosition ) {

	var distance = cameraRelativePosition.length();

	if( distance <= this.radius ) {

		this.domElement.volume = this.volume * ( 1 - distance / this.radius );

	} else {

		this.domElement.volume = 0;

	}

};

THREE.Sound3D.prototype.update = function ( parentGlobalMatrix, forceUpdate, camera ) {

	// update local (rotation/scale is not used)

	if ( this.matrixAutoUpdate ) {

		this.localMatrix.setPosition( this.position );
		forceUpdate = true;

	}


	// update global

	if ( forceUpdate || this.matrixNeedsUpdate ) {

		if ( parentGlobalMatrix ) {

			this.globalMatrix.multiply( parentGlobalMatrix, this.localMatrix );

		} else {

			this.globalMatrix.copy( this.localMatrix );

		}

		this.matrixNeedsUpdate = false;
		forceUpdate = true;

	}


	// update children

	var i, l = this.children.length;

	for ( i = 0; i < l; i++ ) {

		this.children[ i ].update( this.globalMatrix, forceUpdate, camera );

	}

};
