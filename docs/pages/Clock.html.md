# Clock

Class for keeping track of time.

## Constructor

### new Clock( autoStart : boolean )

Constructs a new clock.

**autoStart**

Whether to automatically start the clock when `getDelta()` is called for the first time.

Default is `true`.

**Deprecated:** since r183.

## Properties

### .autoStart : boolean

If set to `true`, the clock starts automatically when `getDelta()` is called for the first time.

Default is `true`.

### .elapsedTime : number

Keeps track of the total time that the clock has been running.

Default is `0`.

### .oldTime : number

Holds the time at which the clock's `start()`, `getElapsedTime()` or `getDelta()` methods were last called.

Default is `0`.

### .running : boolean

Whether the clock is running or not.

Default is `true`.

### .startTime : number

Holds the time at which the clock's `start()` method was last called.

Default is `0`.

## Methods

### .getDelta() : number

Returns the delta time in seconds.

**Returns:** The delta time.

### .getElapsedTime() : number

Returns the elapsed time in seconds.

**Returns:** The elapsed time.

### .start()

Starts the clock. When `autoStart` is set to `true`, the method is automatically called by the class.

### .stop()

Stops the clock.

## Source

[src/core/Clock.js](https://github.com/mrdoob/three.js/blob/master/src/core/Clock.js)