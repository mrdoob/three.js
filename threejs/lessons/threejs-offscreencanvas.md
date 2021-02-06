Title: Three.js OffscreenCanvas
Description: How to use three.js in a web worker
TOC: Using OffscreenCanvas in a Web Worker

[`OffscreenCanvas`](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)
is a relatively new browser feature currently only available in Chrome but apparently
coming to other browsers. `OffscreenCanvas` allows a web worker to render
to a canvas. This is a way to offload heavy work, like rendering a complex 3D scene,
to a web worker so as not to slow down the responsiveness of the browser. It
also means data is loaded and parsed in the worker so possibly less jank while
the page loads.

Getting *started* using it is pretty straight forward. Let's port the 3 spinning cube
example from [the article on responsiveness](threejs-responsive.html).

Workers generally have their code separated
into another script file whereas most of the examples on this site have had
their scripts embedded into the HTML file of the page they are on.

In our case we'll make a file called `offscreencanvas-cubes.js` and
copy all the JavaScript from [the responsive example](threejs-responsive.html) into it. We'll then
make the changes needed for it to run in a worker.

We still need some JavaScript in our HTML file. The first thing
we need to do there is look up the canvas and then transfer control of that
canvas to be offscreen by calling `canvas.transferControlToOffscreen`.

```js
function main() {
  const canvas = document.querySelector('#c');
  const offscreen = canvas.transferControlToOffscreen();

  ...
```

We can then start our worker with `new Worker(pathToScript, {type: 'module'})`.
and pass the `offscreen` object to it.

```js
function main() {
  const canvas = document.querySelector('#c');
  const offscreen = canvas.transferControlToOffscreen();
  const worker = new Worker('offscreencanvas-cubes.js', {type: 'module'});
  worker.postMessage({type: 'main', canvas: offscreen}, [offscreen]);
}
main();
```

It's important to note that workers can't access the `DOM`. They
can't look at HTML elements nor can they receive mouse events or
keyboard events. The only thing they can generally do is respond
to messages sent to them and send messages back to the page.

To send a message to a worker we call [`worker.postMessage`](https://developer.mozilla.org/en-US/docs/Web/API/Worker/postMessage) and
pass it 1 or 2 arguments. The first argument is a JavaScript object
that will be [cloned](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm) 
and sent to the worker. The second argument is an optional array
of objects that are part of the first object that we want *transferred*
to the worker. These objects will not be cloned. Instead they will be *transferred*
and will cease to exist in the main page. Cease to exist is the probably
the wrong description, rather they are neutered. Only certain types of
objects can be transferred instead of cloned. They include `OffscreenCanvas`
so once transferred the `offscreen` object back in the main page is useless.

Workers receive messages from their `onmessage` handler. The object
we passed to `postMessage` arrives on `event.data` passed to the `onmessage`
handler on the worker. The code above declares a `type: 'main'` in the object it passes
to the worker. This object has no meaning to the browser. It's entirely for
our own usage. We'll make a handler that based on `type` calls
a different function in the worker. Then we can add functions as
needed and easily call them from the main page.

```js
const handlers = {
  main,
};

self.onmessage = function(e) {
  const fn = handlers[e.data.type];
  if (!fn) {
    throw new Error('no handler for type: ' + e.data.type);
  }
  fn(e.data);
};
```

You can see above we just look up the handler based on the `type` pass it the `data`
that was sent from the main page.

So now we just need to start changing the `main` we pasted into 
`offscreencanvas-cubes.js` from [the responsive article](threejs-responsive.html).

Instead of looking up the canvas from the DOM we'll receive it from the
event data.

```js
-function main() {
-  const canvas = document.querySelector('#c');
+function main(data) {
+  const {canvas} = data;
  const renderer = new THREE.WebGLRenderer({canvas});

  ...

```

Remembering that workers can't see the DOM at all the first problem
we run into is `resizeRendererToDisplaySize` can't look at `canvas.clientWidth`
and `canvas.clientHeight` as those are DOM values. Here's the original code

```js
function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}
```

Instead we'll need to send sizes as they change to the worker. 
So, let's add some global state and keep the width and height there.

```js
const state = {
  width: 300,  // canvas default
  height: 150,  // canvas default
};
```

Then let's add a `'size'` handler to update those values. 

```js
+function size(data) {
+  state.width = data.width;
+  state.height = data.height;
+}

const handlers = {
  main,
+  size,
};
```

Now we can change `resizeRendererToDisplaySize` to use `state.width` and `state.height`

```js
function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
-  const width = canvas.clientWidth;
-  const height = canvas.clientHeight;
+  const width = state.width;
+  const height = state.height;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}
```

and where we compute the aspect we need similar changes

```js
function render(time) {
  time *= 0.001;

  if (resizeRendererToDisplaySize(renderer)) {
-    camera.aspect = canvas.clientWidth / canvas.clientHeight;
+    camera.aspect = state.width / state.height;
    camera.updateProjectionMatrix();
  }

  ...
```

Back in the main page we'll send a `size` event anytime the page changes size.

```js
const worker = new Worker('offscreencanvas-picking.js', {type: 'module'});
worker.postMessage({type: 'main', canvas: offscreen}, [offscreen]);

+function sendSize() {
+  worker.postMessage({
+    type: 'size',
+    width: canvas.clientWidth,
+    height: canvas.clientHeight,
+  });
+}
+
+window.addEventListener('resize', sendSize);
+sendSize();
```

We also call it once to send the initial size.

And with just those few changes, assuming your browser fully supports `OffscreenCanvas`
it should work. Before we run it though let's check if the browser actually supports
`OffscreenCanvas` and if not display an error. First let's add some HTML to display the error.

```html
<body>
  <canvas id="c"></canvas>
+  <div id="noOffscreenCanvas" style="display:none;">
+    <div>no OffscreenCanvas support</div>
+  </div>
</body>
```

and some CSS for that

```css
#noOffscreenCanvas {
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
    background: red;
    color: white;
}
```

and then we can check for the existence of `transferControlToOffscreen` to see
if the browser supports `OffscreenCanvas`

```js
function main() {
  const canvas = document.querySelector('#c');
+  if (!canvas.transferControlToOffscreen) {
+    canvas.style.display = 'none';
+    document.querySelector('#noOffscreenCanvas').style.display = '';
+    return;
+  }
  const offscreen = canvas.transferControlToOffscreen();
  const worker = new Worker('offscreencanvas-picking.js', {type: 'module});
  worker.postMessage({type: 'main', canvas: offscreen}, [offscreen]);

  ...
```

and with that, if your browser supports `OffscreenCanvas` this example should work

{{{example url="../threejs-offscreencanvas.html" }}}

So that's great but since not every browser supports `OffscreenCanvas` at the moment
let's change the code to work with both `OffscreenCanvas` and if not then fallback to using
the canvas in the main page like normal.

> As an aside, if you need OffscreenCanvas to make your page responsive then
> it's not clear what the point of having a fallback is. Maybe based on if
> you end up running on the main page or in a worker you might adjust the amount
> of work done so that when running in a worker you can do more than when
> running in the main page. What you do is really up to you.

The first thing we should probably do is separate out the three.js
code from the code that is specific to the worker. That way we can
use the same code on both the main page and the worker. In other words
we will now have 3 files

1. our html file.

   `threejs-offscreencanvas-w-fallback.html`

2. a JavaScript that contains our three.js code.

   `shared-cubes.js`

3. our worker support code

   `offscreencanvas-worker-cubes.js`

`shared-cubes.js` and `offscreencanvas-worker-cubes.js` are basically
the split of our previous `offscreencanvas-cubes.js` file. First we
copy all of `offscreencanvas-cubes.js` to `shared-cube.js`. Then
we rename `main` to `init` since we already have a `main` in our
HTML file and we need to export `init` and `state`

```js
import * as THREE from './resources/threejs/r125/build/three.module.js';

-const state = {
+export const state = {
  width: 300,   // canvas default
  height: 150,  // canvas default
};

-function main(data) {
+export function init(data) {
  const {canvas} = data;
  const renderer = new THREE.WebGLRenderer({canvas});
```

and cut out the just the non three.js relates parts

```js
-function size(data) {
-  state.width = data.width;
-  state.height = data.height;
-}
-
-const handlers = {
-  main,
-  size,
-};
-
-self.onmessage = function(e) {
-  const fn = handlers[e.data.type];
-  if (!fn) {
-    throw new Error('no handler for type: ' + e.data.type);
-  }
-  fn(e.data);
-};
```

Then we copy those parts we just deleted to `offscreencanvas-worker-cubes.js`
and import `shared-cubes.js` as well as call `init` instead of `main`.

```js
import {init, state} from './shared-cubes.js';

function size(data) {
  state.width = data.width;
  state.height = data.height;
}

const handlers = {
-  main,
+  init,
  size,
};

self.onmessage = function(e) {
  const fn = handlers[e.data.type];
  if (!fn) {
    throw new Error('no handler for type: ' + e.data.type);
  }
  fn(e.data);
};
```

Similarly we need to include `shared-cubes.js` in the main page

```html
<script type="module">
+import {init, state} from './shared-cubes.js';
```
We can remove the HTML and CSS we added previously

```html
<body>
  <canvas id="c"></canvas>
-  <div id="noOffscreenCanvas" style="display:none;">
-    <div>no OffscreenCanvas support</div>
-  </div>
</body>
```

and some CSS for that

```css
-#noOffscreenCanvas {
-    display: flex;
-    width: 100%;
-    height: 100%;
-    align-items: center;
-    justify-content: center;
-    background: red;
-    color: white;
-}
```

Then let's change the code in the main page to call one start
function or another depending on if the browser supports `OffscreenCanvas`.

```js
function main() {
  const canvas = document.querySelector('#c');
-  if (!canvas.transferControlToOffscreen) {
-    canvas.style.display = 'none';
-    document.querySelector('#noOffscreenCanvas').style.display = '';
-    return;
-  }
-  const offscreen = canvas.transferControlToOffscreen();
-  const worker = new Worker('offscreencanvas-picking.js', {type: 'module'});
-  worker.postMessage({type: 'main', canvas: offscreen}, [offscreen]);
+  if (canvas.transferControlToOffscreen) {
+    startWorker(canvas);
+  } else {
+    startMainPage(canvas);
+  }
  ...
```

We'll move all the code we had to setup the worker inside `startWorker`

```js
function startWorker(canvas) {
  const offscreen = canvas.transferControlToOffscreen();
  const worker = new Worker('offscreencanvas-worker-cubes.js', {type: 'module'});
  worker.postMessage({type: 'main', canvas: offscreen}, [offscreen]);

  function sendSize() {
    worker.postMessage({
      type: 'size',
      width: canvas.clientWidth,
      height: canvas.clientHeight,
    });
  }

  window.addEventListener('resize', sendSize);
  sendSize();

  console.log('using OffscreenCanvas');
}
```

and send `init` instead of `main`

```js
-  worker.postMessage({type: 'main', canvas: offscreen}, [offscreen]);
+  worker.postMessage({type: 'init', canvas: offscreen}, [offscreen]);
```

for starting in the main page we can do this

```js
function startMainPage(canvas) {
  init({canvas});

  function sendSize() {
    state.width = canvas.clientWidth;
    state.height = canvas.clientHeight;
  }
  window.addEventListener('resize', sendSize);
  sendSize();

  console.log('using regular canvas');
}
```

and with that our example will run either in an OffscreenCanvas or
fallback to running in the main page.

{{{example url="../threejs-offscreencanvas-w-fallback.html" }}}

So that was relatively easy. Let's try picking. We'll take some code from
the `RayCaster` example from [the article on picking](threejs-picking.html)
and make it work offscreen.

Let's copy the `shared-cube.js` to `shared-picking.js` and add the
picking parts. We copy in the `PickHelper` 

```js
class PickHelper {
  constructor() {
    this.raycaster = new THREE.Raycaster();
    this.pickedObject = null;
    this.pickedObjectSavedColor = 0;
  }
  pick(normalizedPosition, scene, camera, time) {
    // restore the color if there is a picked object
    if (this.pickedObject) {
      this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
      this.pickedObject = undefined;
    }

    // cast a ray through the frustum
    this.raycaster.setFromCamera(normalizedPosition, camera);
    // get the list of objects the ray intersected
    const intersectedObjects = this.raycaster.intersectObjects(scene.children);
    if (intersectedObjects.length) {
      // pick the first object. It's the closest one
      this.pickedObject = intersectedObjects[0].object;
      // save its color
      this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
      // set its emissive color to flashing red/yellow
      this.pickedObject.material.emissive.setHex((time * 8) % 2 > 1 ? 0xFFFF00 : 0xFF0000);
    }
  }
}

const pickPosition = {x: 0, y: 0};
const pickHelper = new PickHelper();
```

We updated `pickPosition` from the mouse like this

```js
function getCanvasRelativePosition(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * canvas.width  / rect.width,
    y: (event.clientY - rect.top ) * canvas.height / rect.height,
  };
}

function setPickPosition(event) {
  const pos = getCanvasRelativePosition(event);
  pickPosition.x = (pos.x / canvas.width ) *  2 - 1;
  pickPosition.y = (pos.y / canvas.height) * -2 + 1;  // note we flip Y
}
window.addEventListener('mousemove', setPickPosition);
```

A worker can't read the mouse position directly so just like the size code
let's send a message with the mouse position. Like the size code we'll
send the mouse position and update `pickPosition`

```js
function size(data) {
  state.width = data.width;
  state.height = data.height;
}

+function mouse(data) {
+  pickPosition.x = data.x;
+  pickPosition.y = data.y;
+}

const handlers = {
  init,
+  mouse,
  size,
};

self.onmessage = function(e) {
  const fn = handlers[e.data.type];
  if (!fn) {
    throw new Error('no handler for type: ' + e.data.type);
  }
  fn(e.data);
};
```

Back in our main page we need to add code to pass the mouse
to the worker or the main page.

```js
+let sendMouse;

function startWorker(canvas) {
  const offscreen = canvas.transferControlToOffscreen();
  const worker = new Worker('offscreencanvas-worker-picking.js', {type: 'module'});
  worker.postMessage({type: 'init', canvas: offscreen}, [offscreen]);

+  sendMouse = (x, y) => {
+    worker.postMessage({
+      type: 'mouse',
+      x,
+      y,
+    });
+  };

  function sendSize() {
    worker.postMessage({
      type: 'size',
      width: canvas.clientWidth,
      height: canvas.clientHeight,
    });
  }

  window.addEventListener('resize', sendSize);
  sendSize();

  console.log('using OffscreenCanvas');  /* eslint-disable-line no-console */
}

function startMainPage(canvas) {
  init({canvas});

+  sendMouse = (x, y) => {
+    pickPosition.x = x;
+    pickPosition.y = y;
+  };

  function sendSize() {
    state.width = canvas.clientWidth;
    state.height = canvas.clientHeight;
  }
  window.addEventListener('resize', sendSize);
  sendSize();

  console.log('using regular canvas');  /* eslint-disable-line no-console */
}

```

Then we can copy in all the mouse handling code to the main page and 
make just minor changes to use `sendMouse`

```js
function setPickPosition(event) {
  const pos = getCanvasRelativePosition(event);
-  pickPosition.x = (pos.x / canvas.clientWidth ) *  2 - 1;
-  pickPosition.y = (pos.y / canvas.clientHeight) * -2 + 1;  // note we flip Y
+  sendMouse(
+      (pos.x / canvas.clientWidth ) *  2 - 1,
+      (pos.y / canvas.clientHeight) * -2 + 1);  // note we flip Y
}

function clearPickPosition() {
  // unlike the mouse which always has a position
  // if the user stops touching the screen we want
  // to stop picking. For now we just pick a value
  // unlikely to pick something
-  pickPosition.x = -100000;
-  pickPosition.y = -100000;
+  sendMouse(-100000, -100000);
}
window.addEventListener('mousemove', setPickPosition);
window.addEventListener('mouseout', clearPickPosition);
window.addEventListener('mouseleave', clearPickPosition);

window.addEventListener('touchstart', (event) => {
  // prevent the window from scrolling
  event.preventDefault();
  setPickPosition(event.touches[0]);
}, {passive: false});

window.addEventListener('touchmove', (event) => {
  setPickPosition(event.touches[0]);
});

window.addEventListener('touchend', clearPickPosition);
```

and with that picking should be working with `OffscreenCanvas`.

{{{example url="../threejs-offscreencanvas-w-picking.html" }}}

Let's take it one more step and add in the `OrbitControls`.
This will be little more involved. The `OrbitControls` use
the DOM pretty extensively checking the mouse, touch events,
and the keyboard.

Unlike our code so far we can't really use a global `state` object
without re-writing all the OrbitControls code to work with it.
The OrbitControls take an `HTMLElement` to which they attach most
of the DOM events they use. Maybe we could pass in our own
object that has the same API surface as a DOM element. 
We only need to support the features the OrbitControls need.

Digging through the [OrbitControls source code](https://github.com/gfxfundamentals/threejsfundamentals/blob/master/threejs/resources/threejs/r125/examples/js/controls/OrbitControls.js)
it looks like we need to handle the following events.

* contextmenu
* mousedown
* mousemove
* mouseup
* touchstart
* touchmove
* touchend
* wheel
* keydown

For the mouse events we need the `ctrlKey`, `metaKey`, `shiftKey`, 
`button`, `clientX`, `clientY`, `pageX`, and `pageY`, properties

For the keydown events we need the `ctrlKey`, `metaKey`, `shiftKey`, 
and `keyCode` properties.

For the wheel event we only need the `deltaY` property

And for the touch events we only need `pageX` and `pageY` from
the `touches` property.

So, let's make a proxy object pair. One part will run in the main page,
get all those events, and pass on the relevant property values
to the worker. The other part will run in the worker, receive those
events and pass them on using events that have the same structure
as the original DOM events so the OrbitControls won't be able to
tell the difference.

Here's the code for the worker part.

```js
import {EventDispatcher} from './resources/threejs/r125/build/three.module.js';

class ElementProxyReceiver extends EventDispatcher {
  constructor() {
    super();
  }
  handleEvent(data) {
    this.dispatchEvent(data);
  }
}
```

All it does is if it receives a message it dispatches it.
It inherits from `EventDispatcher` which provides methods like
`addEventListener` and `removeEventListener` just like a DOM
element so if we pass it to the OrbitControls it should work.

`ElementProxyReceiver` handles 1 element. In our case we only need
one but it's best to think head so lets make a manager to manage
more than one of them.

```js
class ProxyManager {
  constructor() {
    this.targets = {};
    this.handleEvent = this.handleEvent.bind(this);
  }
  makeProxy(data) {
    const {id} = data;
    const proxy = new ElementProxyReceiver();
    this.targets[id] = proxy;
  }
  getProxy(id) {
    return this.targets[id];
  }
  handleEvent(data) {
    this.targets[data.id].handleEvent(data.data);
  }
}
```

We can make a instance of `ProxyManager` and call its `makeProxy`
method with an id which will make an `ElementProxyReceiver` that
responds to messages with that id.

Let's hook it up to our worker's message handler.

```js
const proxyManager = new ProxyManager();

function start(data) {
  const proxy = proxyManager.getProxy(data.canvasId);
  init({
    canvas: data.canvas,
    inputElement: proxy,
  });
}

function makeProxy(data) {
  proxyManager.makeProxy(data);
}

...

const handlers = {
-  init,
-  mouse,
+  start,
+  makeProxy,
+  event: proxyManager.handleEvent,
   size,
};

self.onmessage = function(e) {
  const fn = handlers[e.data.type];
  if (!fn) {
    throw new Error('no handler for type: ' + e.data.type);
  }
  fn(e.data);
};
```

In our shared three.js code we need to import the `OrbitControls` and set them up.

```js
import * as THREE from './resources/threejs/r125/build/three.module.js';
+import {OrbitControls} from './resources/threejs/r125/examples/jsm/controls/OrbitControls.js';

export function init(data) {
-  const {canvas} = data;
+  const {canvas, inputElement} = data;
  const renderer = new THREE.WebGLRenderer({canvas});

+  const controls = new OrbitControls(camera, inputElement);
+  controls.target.set(0, 0, 0);
+  controls.update();
```

Notice we're passing the OrbitControls our proxy via `inputElement`
instead of passing in the canvas like we do in other non-OffscreenCanvas
examples.

Next we can move all the picking event code from the HTML file
to the shared three.js code as well while changing
`canvas` to `inputElement`.

```js
function getCanvasRelativePosition(event) {
-  const rect = canvas.getBoundingClientRect();
+  const rect = inputElement.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function setPickPosition(event) {
  const pos = getCanvasRelativePosition(event);
-  sendMouse(
-      (pos.x / canvas.clientWidth ) *  2 - 1,
-      (pos.y / canvas.clientHeight) * -2 + 1);  // note we flip Y
+  pickPosition.x = (pos.x / inputElement.clientWidth ) *  2 - 1;
+  pickPosition.y = (pos.y / inputElement.clientHeight) * -2 + 1;  // note we flip Y
}

function clearPickPosition() {
  // unlike the mouse which always has a position
  // if the user stops touching the screen we want
  // to stop picking. For now we just pick a value
  // unlikely to pick something
-  sendMouse(-100000, -100000);
+  pickPosition.x = -100000;
+  pickPosition.y = -100000;
}

*inputElement.addEventListener('mousemove', setPickPosition);
*inputElement.addEventListener('mouseout', clearPickPosition);
*inputElement.addEventListener('mouseleave', clearPickPosition);

*inputElement.addEventListener('touchstart', (event) => {
  // prevent the window from scrolling
  event.preventDefault();
  setPickPosition(event.touches[0]);
}, {passive: false});

*inputElement.addEventListener('touchmove', (event) => {
  setPickPosition(event.touches[0]);
});

*inputElement.addEventListener('touchend', clearPickPosition);
```

Back in the main page we need code to send messages for
all the events we enumerated above.

```js
let nextProxyId = 0;
class ElementProxy {
  constructor(element, worker, eventHandlers) {
    this.id = nextProxyId++;
    this.worker = worker;
    const sendEvent = (data) => {
      this.worker.postMessage({
        type: 'event',
        id: this.id,
        data,
      });
    };

    // register an id
    worker.postMessage({
      type: 'makeProxy',
      id: this.id,
    });
    for (const [eventName, handler] of Object.entries(eventHandlers)) {
      element.addEventListener(eventName, function(event) {
        handler(event, sendEvent);
      });
    }
  }
}
```

`ElementProxy` takes the element who's events we want to proxy. It
then registers an id with the worker by picking one and sending it
via the `makeProxy` message we setup earlier. The worker will make
an `ElementProxyReceiver` and register it to that id.

We then have an object of event handlers to register. This way
we can pass handlers only for these events we want to forward to
the worker.

When we start the worker we first make a proxy and pass in our event handlers.

```js
function startWorker(canvas) {
  const offscreen = canvas.transferControlToOffscreen();
  const worker = new Worker('offscreencanvas-worker-orbitcontrols.js', {type: 'module'});

+  const eventHandlers = {
+    contextmenu: preventDefaultHandler,
+    mousedown: mouseEventHandler,
+    mousemove: mouseEventHandler,
+    mouseup: mouseEventHandler,
+    touchstart: touchEventHandler,
+    touchmove: touchEventHandler,
+    touchend: touchEventHandler,
+    wheel: wheelEventHandler,
+    keydown: filteredKeydownEventHandler,
+  };
+  const proxy = new ElementProxy(canvas, worker, eventHandlers);
  worker.postMessage({
    type: 'start',
    canvas: offscreen,
+    canvasId: proxy.id,
  }, [offscreen]);
  console.log('using OffscreenCanvas');  /* eslint-disable-line no-console */
}
```

And here are the event handlers. All they do is copy a list of properties
from the event they receive. They are passed a `sendEvent` function to which they pass the data
they make. That function will add the correct id and send it to the worker.

```js
const mouseEventHandler = makeSendPropertiesHandler([
  'ctrlKey',
  'metaKey',
  'shiftKey',
  'button',
  'clientX',
  'clientY',
  'pageX',
  'pageY',
]);
const wheelEventHandlerImpl = makeSendPropertiesHandler([
  'deltaX',
  'deltaY',
]);
const keydownEventHandler = makeSendPropertiesHandler([
  'ctrlKey',
  'metaKey',
  'shiftKey',
  'keyCode',
]);

function wheelEventHandler(event, sendFn) {
  event.preventDefault();
  wheelEventHandlerImpl(event, sendFn);
}

function preventDefaultHandler(event) {
  event.preventDefault();
}

function copyProperties(src, properties, dst) {
  for (const name of properties) {
      dst[name] = src[name];
  }
}

function makeSendPropertiesHandler(properties) {
  return function sendProperties(event, sendFn) {
    const data = {type: event.type};
    copyProperties(event, properties, data);
    sendFn(data);
  };
}

function touchEventHandler(event, sendFn) {
  const touches = [];
  const data = {type: event.type, touches};
  for (let i = 0; i < event.touches.length; ++i) {
    const touch = event.touches[i];
    touches.push({
      pageX: touch.pageX,
      pageY: touch.pageY,
    });
  }
  sendFn(data);
}

// The four arrow keys
const orbitKeys = {
  '37': true,  // left
  '38': true,  // up
  '39': true,  // right
  '40': true,  // down
};
function filteredKeydownEventHandler(event, sendFn) {
  const {keyCode} = event;
  if (orbitKeys[keyCode]) {
    event.preventDefault();
    keydownEventHandler(event, sendFn);
  }
}
```

This seems close to running but if we actually try it we'll see
that the `OrbitControls` need a few more things.

One is they call `element.focus`. We don't need that to happen
in the worker so let's just add a stub.

```js
class ElementProxyReceiver extends THREE.EventDispatcher {
  constructor() {
    super();
  }
  handleEvent(data) {
    this.dispatchEvent(data);
  }
+  focus() {
+    // no-op
+  }
}
```

Another is they call `event.preventDefault` and `event.stopPropagation`.
We're already handling that in the main page so those can also be a noop.

```js
+function noop() {
+}

class ElementProxyReceiver extends THREE.EventDispatcher {
  constructor() {
    super();
  }
  handleEvent(data) {
+    data.preventDefault = noop;
+    data.stopPropagation = noop;
    this.dispatchEvent(data);
  }
  focus() {
    // no-op
  }
}
```

Another is they look at `clientWidth` and `clientHeight`. We
were passing the size before but we can update the proxy pair
to pass that as well.

In the worker...

```js
class ElementProxyReceiver extends THREE.EventDispatcher {
  constructor() {
    super();
  }
+  get clientWidth() {
+    return this.width;
+  }
+  get clientHeight() {
+    return this.height;
+  }
+  getBoundingClientRect() {
+    return {
+      left: this.left,
+      top: this.top,
+      width: this.width,
+      height: this.height,
+      right: this.left + this.width,
+      bottom: this.top + this.height,
+    };
+  }
  handleEvent(data) {
+    if (data.type === 'size') {
+      this.left = data.left;
+      this.top = data.top;
+      this.width = data.width;
+      this.height = data.height;
+      return;
+    }
    data.preventDefault = noop;
    data.stopPropagation = noop;
    this.dispatchEvent(data);
  }
  focus() {
    // no-op
  }
}
```

back in the main page we need to send the size and the left and top positions as well.
Note that as is we don't handle if the canvas moves, only if it resizes. If you wanted
to handle moving you'd need to call `sendSize` anytime something moved the canvas.

```js
class ElementProxy {
  constructor(element, worker, eventHandlers) {
    this.id = nextProxyId++;
    this.worker = worker;
    const sendEvent = (data) => {
      this.worker.postMessage({
        type: 'event',
        id: this.id,
        data,
      });
    };

    // register an id
    worker.postMessage({
      type: 'makeProxy',
      id: this.id,
    });
+    sendSize();
    for (const [eventName, handler] of Object.entries(eventHandlers)) {
      element.addEventListener(eventName, function(event) {
        handler(event, sendEvent);
      });
    }

+    function sendSize() {
+      const rect = element.getBoundingClientRect();
+      sendEvent({
+        type: 'size',
+        left: rect.left,
+        top: rect.top,
+        width: element.clientWidth,
+        height: element.clientHeight,
+      });
+    }
+
+    window.addEventListener('resize', sendSize);
  }
}
```

and in our shared three.js code we no longer need `state`

```js
-export const state = {
-  width: 300,   // canvas default
-  height: 150,  // canvas default
-};

...

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
-  const width = state.width;
-  const height = state.height;
+  const width = inputElement.clientWidth;
+  const height = inputElement.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

function render(time) {
  time *= 0.001;

  if (resizeRendererToDisplaySize(renderer)) {
-    camera.aspect = state.width / state.height;
+    camera.aspect = inputElement.clientWidth / inputElement.clientHeight;
    camera.updateProjectionMatrix();
  }

  ...
```

A few more hacks. The OrbitControls add `mousemove` and `mouseup` events to the
`ownerDocument` of the element to handle mouse capture (when the mouse goes
outside the window).

Further the code references the global `document` but there is no global document
in a worker. 

We can solve all of these with a 2 quick hacks. In our worker
code we'll re-use our proxy for both problems.

```js
function start(data) {
  const proxy = proxyManager.getProxy(data.canvasId);
+  proxy.ownerDocument = proxy; // HACK!
+  self.document = {} // HACK!
  init({
    canvas: data.canvas,
    inputElement: proxy,
  });
}
```

This will give the `OrbitControls` something to inspect which
matches their expectations.

I know that was kind of hard to follow. The short version is:
`ElementProxy` runs on the main page and forwards DOM events 
to `ElementProxyReceiver` in the worker which
masquerades as an `HTMLElement` that we can use both with the
`OrbitControls` and with our own code.

The final thing is our fallback when we are not using OffscreenCanvas.
All we have to do is pass the canvas itself as our `inputElement`.

```js
function startMainPage(canvas) {
-  init({canvas});
+  init({canvas, inputElement: canvas});
  console.log('using regular canvas');
}
```

and now we should have OrbitControls working with OffscreenCanvas

{{{example url="../threejs-offscreencanvas-w-orbitcontrols.html" }}}

This is probably the most complicated example on this site. It's a
little hard to follow because there are 3 files involved for each
sample. The HTML file, the worker file, the shared three.js code.

I hope it wasn't too difficult to understand and that it provided some 
useful examples of working with three.js, OffscreenCanvas and web workers.
