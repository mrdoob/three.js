import { Audio } from "../audio/Audio.js";
import { AudioLoader } from "../loaders/AudioLoader.js";

Audio.prototype.load = function ( file ) {

	console.warn( 'THREE.Audio: .load has been deprecated. Use THREE.AudioLoader instead.' );
	var scope = this;
	var audioLoader = new AudioLoader();
	audioLoader.load( file, function ( buffer ) {

		scope.setBuffer( buffer );

	} );
	return this;

};
