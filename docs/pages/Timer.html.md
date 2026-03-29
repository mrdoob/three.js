# Timer

This class is an alternative to [Clock](Clock.html) with a different API design and behavior. The goal is to avoid the conceptual flaws that became apparent in `Clock` over time.

*   `Timer` has an `update()` method that updates its internal state. That makes it possible to call `getDelta()` and `getElapsed()` multiple times per simulation step without getting different values.
*   The class can make use of the Page Visibility API to avoid large time delta values when the app is inactive (e.g. tab switched or browser hidden).

## Code Example

```js
const timer = new Timer();
timer.connect( document ); // use Page Visibility API
```

## Constructor

### new Timer()

Constructs a new timer.

## Methods

### .connect( document : Document )

Connect the timer to the given document.Calling this method is not mandatory to use the timer but enables the usage of the Page Visibility API to avoid large time delta values.

**document**

The document.

### .disconnect()

Disconnects the timer from the DOM and also disables the usage of the Page Visibility API.

### .dispose()

Can be used to free all internal resources. Usually called when the timer instance isn't required anymore.

### .getDelta() : number

Returns the time delta in seconds.

**Returns:** The time delta in second.

### .getElapsed() : number

Returns the elapsed time in seconds.

**Returns:** The elapsed time in second.

### .getTimescale() : number

Returns the timescale.

**Returns:** The timescale.

### .reset() : Timer

Resets the time computation for the current simulation step.

**Returns:** A reference to this timer.

### .setTimescale( timescale : number ) : Timer

Sets the given timescale which scale the time delta computation in `update()`.

**timescale**

The timescale to set.

**Returns:** A reference to this timer.

### .update( timestamp : number ) : Timer

Updates the internal state of the timer. This method should be called once per simulation step and before you perform queries against the timer (e.g. via `getDelta()`).

**timestamp**

The current time in milliseconds. Can be obtained from the `requestAnimationFrame` callback argument. If not provided, the current time will be determined with `performance.now`.

**Returns:** A reference to this timer.

## Source

[src/core/Timer.js](https://github.com/mrdoob/three.js/blob/master/src/core/Timer.js)