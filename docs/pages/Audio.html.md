*Inheritance: EventDispatcher → Object3D →*

# Audio

Represents a non-positional ( global ) audio object.

This and related audio modules make use of the [Web Audio API](https://www.w3.org/TR/webaudio-1.1/).

## Code Example

```js
// create an AudioListener and add it to the camera
const listener = new THREE.AudioListener();
camera.add( listener );
// create a global audio source
const sound = new THREE.Audio( listener );
// load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load( 'sounds/ambient.ogg', function( buffer ) {
	sound.setBuffer( buffer );
	sound.setLoop( true );
	sound.setVolume( 0.5 );
	sound.play();
});
```

## Constructor

### new Audio( listener : AudioListener )

Constructs a new audio.

**listener**

The global audio listener.

## Properties

### .autoplay : boolean

Whether to start playback automatically or not.

Default is `false`.

### .buffer : AudioBuffer (readonly)

A reference to an audio buffer.

Defined via [Audio#setBuffer](Audio.html#setBuffer).

Default is `null`.

### .context : AudioContext (readonly)

The audio context.

### .detune : number (readonly)

Modify pitch, measured in cents. +/- 100 is a semitone. +/- 1200 is an octave.

Defined via [Audio#setDetune](Audio.html#setDetune).

Default is `0`.

### .duration : undefined | number

Overrides the default duration of the audio.

Default is `undefined`.

### .filters : Array.<AudioNode> (readonly)

Can be used to apply a variety of low-order filters to create more complex sound effects e.g. via `BiquadFilterNode`.

The property is automatically set by [Audio#setFilters](Audio.html#setFilters).

### .gain : GainNode (readonly)

The gain node used for volume control.

### .hasPlaybackControl : boolean (readonly)

Indicates whether the audio playback can be controlled with method like [Audio#play](Audio.html#play) or [Audio#pause](Audio.html#pause).

This flag will be automatically set when audio sources are defined.

Default is `true`.

### .isPlaying : boolean (readonly)

Indicates whether the audio is playing or not.

This flag will be automatically set when using [Audio#play](Audio.html#play), [Audio#pause](Audio.html#pause), [Audio#stop](Audio.html#stop).

Default is `false`.

### .listener : AudioListener (readonly)

The global audio listener.

### .loop : boolean (readonly)

Whether the audio should loop or not.

Defined via [Audio#setLoop](Audio.html#setLoop).

Default is `false`.

### .loopEnd : number

Defines where in the audio buffer the replay should stop, in seconds.

Default is `0`.

### .loopStart : number

Defines where in the audio buffer the replay should start, in seconds.

Default is `0`.

### .offset : number

An offset to the time within the audio buffer the playback should begin, in seconds.

Default is `0`.

### .playbackRate : number (readonly)

The playback speed.

Defined via [Audio#setPlaybackRate](Audio.html#setPlaybackRate).

Default is `1`.

### .source : AudioNode (readonly)

Holds a reference to the current audio source.

The property is automatically by one of the `set*()` methods.

Default is `null`.

### .sourceType : 'empty' | 'audioNode' | 'mediaNode' | 'mediaStreamNode' | 'buffer' (readonly)

Defines the source type.

The property is automatically set by one of the `set*()` methods.

Default is `'empty'`.

## Methods

### .connect() : Audio

Connects to the audio source. This is used internally on initialisation and when setting / removing filters.

**Returns:** A reference to this instance.

### .disconnect() : Audio | undefined

Disconnects to the audio source. This is used internally on initialisation and when setting / removing filters.

**Returns:** A reference to this instance.

### .getDetune() : number

Returns the detuning of oscillation in cents.

**Returns:** The detuning of oscillation in cents.

### .getFilter() : AudioNode | undefined

Returns the first filter in the list of filters.

**Returns:** The first filter in the list of filters.

### .getFilters() : Array.<AudioNode>

Returns the current set filters.

**Returns:** The list of filters.

### .getLoop() : boolean

Returns the loop flag.

Can only be used with compatible audio sources that allow playback control.

**Returns:** Whether the audio should loop or not.

### .getOutput() : GainNode

Returns the output audio node.

**Returns:** The output node.

### .getPlaybackRate() : number

Returns the current playback rate.

**Returns:** The playback rate.

### .getVolume() : number

Returns the volume.

**Returns:** The volume.

### .onEnded()

Automatically called when playback finished.

### .pause() : Audio | undefined

Pauses the playback of the audio.

Can only be used with compatible audio sources that allow playback control.

**Returns:** A reference to this instance.

### .play( delay : number ) : Audio | undefined

Starts the playback of the audio.

Can only be used with compatible audio sources that allow playback control.

**delay**

The delay, in seconds, at which the audio should start playing.

Default is `0`.

**Returns:** A reference to this instance.

### .setBuffer( audioBuffer : AudioBuffer ) : Audio

Sets the given audio buffer as the source of this instance.

[Audio#sourceType](Audio.html#sourceType) is set to `buffer` and [Audio#hasPlaybackControl](Audio.html#hasPlaybackControl) to `true`.

**audioBuffer**

The audio buffer.

**Returns:** A reference to this instance.

### .setDetune( value : number ) : Audio

Defines the detuning of oscillation in cents.

**value**

The detuning of oscillation in cents.

**Returns:** A reference to this instance.

### .setFilter( filter : AudioNode ) : Audio

Applies a single filter node to the audio.

**filter**

The filter to set.

**Returns:** A reference to this instance.

### .setFilters( value : Array.<AudioNode> ) : Audio

Sets an array of filters and connects them with the audio source.

**value**

A list of filters.

**Returns:** A reference to this instance.

### .setLoop( value : boolean ) : Audio | undefined

Sets the loop flag.

Can only be used with compatible audio sources that allow playback control.

**value**

Whether the audio should loop or not.

**Returns:** A reference to this instance.

### .setLoopEnd( value : number ) : Audio

Sets the loop end value which defines where in the audio buffer the replay should stop, in seconds.

**value**

The loop end value.

**Returns:** A reference to this instance.

### .setLoopStart( value : number ) : Audio

Sets the loop start value which defines where in the audio buffer the replay should start, in seconds.

**value**

The loop start value.

**Returns:** A reference to this instance.

### .setMediaElementSource( mediaElement : HTMLMediaElement ) : Audio

Sets the given media element as the source of this instance.

[Audio#sourceType](Audio.html#sourceType) is set to `mediaNode` and [Audio#hasPlaybackControl](Audio.html#hasPlaybackControl) to `false`.

**mediaElement**

The media element.

**Returns:** A reference to this instance.

### .setMediaStreamSource( mediaStream : MediaStream ) : Audio

Sets the given media stream as the source of this instance.

[Audio#sourceType](Audio.html#sourceType) is set to `mediaStreamNode` and [Audio#hasPlaybackControl](Audio.html#hasPlaybackControl) to `false`.

**mediaStream**

The media stream.

**Returns:** A reference to this instance.

### .setNodeSource( audioNode : AudioNode ) : Audio

Sets the given audio node as the source of this instance.

[Audio#sourceType](Audio.html#sourceType) is set to `audioNode` and [Audio#hasPlaybackControl](Audio.html#hasPlaybackControl) to `false`.

**audioNode**

The audio node like an instance of `OscillatorNode`.

**Returns:** A reference to this instance.

### .setPlaybackRate( value : number ) : Audio | undefined

Sets the playback rate.

Can only be used with compatible audio sources that allow playback control.

**value**

The playback rate to set.

**Returns:** A reference to this instance.

### .setVolume( value : number ) : Audio

Sets the volume.

**value**

The volume to set.

**Returns:** A reference to this instance.

### .stop( delay : number ) : Audio | undefined

Stops the playback of the audio.

Can only be used with compatible audio sources that allow playback control.

**delay**

The delay, in seconds, at which the audio should stop playing.

Default is `0`.

**Returns:** A reference to this instance.

## Source

[src/audio/Audio.js](https://github.com/mrdoob/three.js/blob/master/src/audio/Audio.js)