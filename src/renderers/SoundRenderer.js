/**
 * @author mikael emtinger / http://gomo.se/
 */

THREE.SoundRenderer = function() {

	this.volume = 1;
	this.domElement = document.createElement( "div" );
	this.domElement.id = "THREESound";

	this.cameraPosition = new THREE.Vector3();
	this.soundPosition = new THREE.Vector3();

	this.render = function ( scene, camera, callSceneUpdate ) {

		if ( callSceneUpdate ) {

			scene.update( undefined, false, camera );

		}

		var sound;
		var sounds = scene.sounds;
		var s, l = sounds.length;

		for ( s = 0; s < l; s++ ) {

			sound = sounds[ s ];

			this.soundPosition.set(

				sound.matrixWorld.n14,
				sound.matrixWorld.n24,
				sound.matrixWorld.n34

			);

			this.soundPosition.subSelf( camera.position );

			if( sound.isPlaying && sound.isLoaded ) {

				if ( !sound.isAddedToDOM ) {

					sound.addToDOM( this.domElement );

				}

				sound.calculateVolumeAndPan( this.soundPosition );

			}

		}

	}

}
