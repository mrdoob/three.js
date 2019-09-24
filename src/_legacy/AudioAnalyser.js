import { AudioAnalyser } from "../audio/AudioAnalyser.js";

AudioAnalyser.prototype.getData = function () {

	console.warn( 'THREE.AudioAnalyser: .getData() is now .getFrequencyData().' );
	return this.getFrequencyData();

};
