Title: Three.js Tips
Description: Small issues that might trip you up using three.js

This article is a collection of small issues you might run into
using three.js that seemed too small to have their own article.

---

<a id="screenshot"></a>

# Taking A Screenshot of the Canvas

In the browser there are effectively 2 functions that will take a screenshot.
The old one 
[`canvas.toDataURL`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL)
and the new better one 
[`canvas.toBlob`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob)

So you'd think it would be easy to take a screenshot by just adding some code like

```html
<canvas id="c"></canvas>
+<button id="screenshot" type="button">Save...</button>
```

```js
const elem = document.querySelector('#screenshot');
elem.addEventListener('click', () => {
  canvas.toBlob((blob) => {
    saveBlob(blob, `screencapture-${canvas.width}x${canvas.height}.png`);
  });
});

const saveBlob = (function() {
  const a = document.createElement('a');
  document.body.appendChild(a);
  a.style.display = 'none';
  return function saveData(blob, fileName) {
     const url = window.URL.createObjectURL(blob);
     a.href = url;
     a.download = fileName;
     a.click();
  };
}());
```

Here's the example from [the article on responsiveness](threejs-responsive.html)
with the code above added and some CSS to place the button

{{{example url="../threejs-tips-screenshot-bad.html"}}}

When I tried it I got this screenshot

<div class="threejs_center"><img src="resources/images/screencapture-413x313.png"></div>

Yes, it's just a black image.

It's possible it worked for you depending on your browser/OS but in general
it's not likely to work.

The issue is that for performance and compatibility reasons, by default the browser
will clear a WebGL canvas's drawing buffer after you've drawn to it.

The solution is to call your rendering code just before capturing.

In our code we need to adjust a few things. First let's separate
out the rendering code.

```js
+const state = {
+  time: 0,
+};

-function render(time) {
-  time *= 0.001;
+function render() {
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  cubes.forEach((cube, ndx) => {
    const speed = 1 + ndx * .1;
-    const rot = time * speed;
+    const rot = state.time * speed;
    cube.rotation.x = rot;
    cube.rotation.y = rot;
  });

  renderer.render(scene, camera);

-  requestAnimationFrame(render);
}

+function animate(time) {
+  state.time = time * 0.001;
+
+  render();
+
+  requestAnimationFrame(animate);
+}
+requestAnimationFrame(animate);
```

Now that `render` is only concerned with actually rendering
we can call it just before capturing the canvas.

```js
const elem = document.querySelector('#screenshot');
elem.addEventListener('click', () => {
+  render();
  canvas.toBlob((blob) => {
    saveBlob(blob, `screencapture-${canvas.width}x${canvas.height}.png`);
  });
});
```

And now it should work.

{{{example url="../threejs-tips-screenshot-good.html" }}}

For a different solution see the next item.

---

<a id="preservedrawingbuffer"></a>

# Preventing the canvas being cleared

Let's say you wanted to let the user paint with an animated
object. You need to pass in `preserveDrawingBuffer: true` when
you create the `WebGLRenderer`. This prevents the browser from
clearing the canvas. You also need to tell three.js not to clear
the canvas as well.

```js
const canvas = document.querySelector('#c');
-const renderer = new THREE.WebGLRenderer({canvas});
+const renderer = new THREE.WebGLRenderer({
+  canvas,
+  preserveDrawingBuffer: true,
+  alpha: true,
+});
+renderer.autoClearColor = false;
```

{{{example url="../threejs-tips-preservedrawingbuffer.html" }}}

Note that if you were serious about making a drawing program this would not be a
solution as the browser will still clear the canvas anytime we change its
resolution. We're changing is resolution based on its display size. Its display
size changes when the window changes size. That includes when the user downloads
a file, even in another tab, and the browser adds a status bar. It also includes when
the user turns their phone and the browser switches from portrait to landscape.

If you really wanted to make a drawing program you'd
[render to a texture using a render target](threejs-rendertargets.html).

---

<a id="tabindex"></a>

# Getting Keyboard Input

Throughout these tutorials we've often attached event listeners to the `canvas`.
While many events work, one that does not work by default is keyboard
events.

To get keyboard events, set the [`tabindex`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/tabIndex)
of the canvas to 0 or more. Eg.

```html
<canvas tabindex="0"></canvas>
```

This ends up causing a new issue though. Anything that has a `tabindex` set
will get highlighted when it has the focus. To fix that set its focus CSS outline
to none

```css
canvas:focus {
  outline:none;
}
```

To demonstrate here are 3 canvases 

```html
<canvas id="c1"></canvas>
<canvas id="c2" tabindex="0"></canvas>
<canvas id="c3" tabindex="1"></canvas>
```

and some css just for the last canvas 

```css
#c3:focus {
    outline: none;
}
```

Let's attach the same event listeners to all of them

```js
document.querySelectorAll('canvas').forEach((canvas) => {
  const ctx = canvas.getContext('2d');

  function draw(str) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(str, canvas.width / 2, canvas.height / 2);
  }
  draw(canvas.id);

  canvas.addEventListener('focus', () => {
    draw('has focus press a key');
  });

  canvas.addEventListener('blur', () => {
    draw('lost focus');
  });

  canvas.addEventListener('keydown', (e) => {
    draw(`keyCode: ${e.keyCode}`);
  });
});
```

Notice you can't get the first canvas to accept keyboard input.
The second canvas you can but it gets highlighted. The 3rd
canvas has both solutions applied.

{{{example url="../threejs-tips-tabindex.html"}}}

---

<a id="transparent-canvas"></a>
 
# Making the Canvas Transparent

By default THREE.js makes the canvas opaque. If you want the
canvas to be transparent pass in [`alpha:true`](WebGLRenderer.alpha) when you create
the `WebGLRenderer`

```js
const canvas = document.querySelector('#c');
-const renderer = new THREE.WebGLRenderer({canvas});
+const renderer = new THREE.WebGLRenderer({
+  canvas,
+  alpha: true,
+});
```

You probably also want to tell it that your results are **not** using premultiplied alpha

```js
const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
+  premultipliedAlpha: false,
});
```

Three.js defaults to the canvas using
[`premultipliedAlpha: true`](WebGLRenderer.premultipliedAlpha) but defaults
to materials outputting [`premultipliedAlpha: false`](Material.premultipliedAlpha).

If you'd like a better understanding of when and when not to use premultiplied alpha
here's [a good article on it](https://developer.nvidia.com/content/alpha-blending-pre-or-not-pre).

In any case let's setup a simple example with a transparent canvas.

We applied the settings above to the example from [the article on responsiveness](threejs-responsive.html).
Let's also make the materials more transparent.

```js
function makeInstance(geometry, color, x) {
-  const material = new THREE.MeshPhongMaterial({color});
+  const material = new THREE.MeshPhongMaterial({
+    color,
+    opacity: 0.5,
+  });

...

```

And let's add some HTML content

```html
<body>
  <canvas id="c"></canvas>
+  <div id="content">
+    <div>
+      <h1>Cubes-R-Us!</h1>
+      <p>We make the best cubes!</p>
+    </div>
+  </div>
</body>
```

as well as some CSS to put the canvas in front

```css
body {
    margin: 0;
}
#c {
    width: 100vw;
    height: 100vh;
    display: block;
+    position: fixed;
+    left: 0;
+    top: 0;
+    z-index: 2;
+    pointer-events: none;
}
+#content {
+  font-size: 7vw;
+  font-family: sans-serif;
+  text-align: center;
+  width: 100vw;
+  height: 100vh;
+  display: flex;
+  justify-content: center;
+  align-items: center;
+}
```

note that `pointer-events: none` makes the canvas invisible to the mouse
and touch events so you can select the text beneath.

{{{example url="../threejs-tips-transparent-canvas.html" }}}
