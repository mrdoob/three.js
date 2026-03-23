# AudioAnalyser

This class can be used to analyse audio data.

## Code Example

```js
// create an AudioListener and add it to the camera
const listener = new THREE.AudioListener();
camera.add( listener );
// create an Audio source
const sound = new THREE.Audio( listener );
// load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load( 'sounds/ambient.ogg', function( buffer ) {
	sound.setBuffer( buffer );
	sound.setLoop(true);
	sound.setVolume(0.5);
	sound.play();
});
// create an AudioAnalyser, passing in the sound and desired fftSize
const analyser = new THREE.AudioAnalyser( sound, 32 );
// get the average frequency of the sound
const data = analyser.getAverageFrequency();
```

## Constructor

### new AudioAnalyser( audio : Audio, fftSize : number )

Constructs a new audio analyzer.

**audio**

The audio to analyze.

**fftSize**

The window size in samples that is used when performing a Fast Fourier Transform (FFT) to get frequency domain data.

Default is `2048`.

## Properties

### .analyser : AnalyserNode

The global audio listener.

### .data : Uint8Array

Holds the analyzed data.

## Methods

### .getAverageFrequency() : number

Returns the average of the frequencies returned by [AudioAnalyser#getFrequencyData](AudioAnalyser.html#getFrequencyData).

**Returns:** The average frequency.

### .getFrequencyData() : Uint8Array

Returns an array with frequency data of the audio.

Each item in the array represents the decibel value for a specific frequency. The frequencies are spread linearly from 0 to 1/2 of the sample rate. For example, for 48000 sample rate, the last item of the array will represent the decibel value for 24000 Hz.

**Returns:** The frequency data.

## Source

[src/audio/AudioAnalyser.js](https://github.com/mrdoob/three.js/blob/master/src/audio/AudioAnalyser.js)