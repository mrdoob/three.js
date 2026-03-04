# SelectionHelper

A helper for [SelectionBox](SelectionBox.html).

It visualizes the current selection box with a `div` container element.

## Import

SelectionHelper is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { SelectionHelper } from 'three/addons/interactive/SelectionHelper.js';
```

## Constructor

### new SelectionHelper( renderer : WebGPURenderer | WebGLRenderer, cssClassName : string )

Constructs a new selection helper.

**renderer**

The renderer.

**cssClassName**

The CSS class name of the `div`.

## Properties

### .element : HTMLDivElement

The visualization of the selection box.

### .enabled : boolean

Whether helper is enabled or not.

Default is `true`.

### .isDown : boolean

Whether the mouse or pointer is pressed down.

Default is `false`.

### .renderer : WebGPURenderer | WebGLRenderer

A reference to the renderer.

## Methods

### .dispose()

Call this method if you no longer want use to the controls. It frees all internal resources and removes all event listeners.

## Source

[examples/jsm/interactive/SelectionHelper.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/interactive/SelectionHelper.js)