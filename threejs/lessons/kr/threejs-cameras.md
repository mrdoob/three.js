Title: Three.js 카메라
Description: Three.js의 카메라에 대해 알아봅니다
TOC: 카메라(Cameras)

※ 이 글은 Three.js의 튜토리얼 시리즈로서,
먼저 [Three.js의 기본 구조에 관한 글](threejs-fundamentals.html)을
읽고 오길 권장합니다.


이번 장에서는 카메라(cemaras)에 대해 알아보겠습니다. [첫 번째 장](threejs-fundamentals.html)에서
일부 다루긴 했지만, 중요 요소인 만큼 더 자세히 살펴볼 필요가 있습니다.

Three.js에서 가장 자주 사용하는 카메라는 여태까지 썼던 `PerspectiveCamera`(원근 카메라)입니다.
이 카메라는 멀리 있는 물체를 가까이 있는 것보다 상대적으로 작게 보이도록 해주죠.

`PerspectiveCamera`는 *절두체(frustum)*를 만듭니다. [절두체(frustum)는 입체(보통 원뿔이나 각뿔)를
절단하는 하나나 두 평행면 사이의 부분](https://ko.wikipedia.org/wiki/%EC%A0%88%EB%91%90%EC%B2%B4)을
의미하죠. 여기서 입체란 정육면체, 원뿔, 구, 원통, 절두체 등의 3D 요소입니다.

<div class="spread">
  <div><div data-diagram="shapeCube"></div><div>정육면체(cube)</div></div>
  <div><div data-diagram="shapeCone"></div><div>원뿔(cone)</div></div>
  <div><div data-diagram="shapeSphere"></div><div>구(sphere)</div></div>
  <div><div data-diagram="shapeCylinder"></div><div>원통(cylinder)</div></div>
  <div><div data-diagram="shapeFrustum"></div><div>절두체(frustum)</div></div>
</div>

이걸 굳이 언급하는 이유는 글을 쓰는 저도 몇 년 동안 이를 몰랐기 때문입니다. 책이든 인터넷 글이든,
*절두체*라는 단어를 봤다면 눈이 뒤집어졌을 겁니다. 입체의 이름을 알면 이해하기도, 기억하기도 훨씬
쉽죠 &#128517;.

`PerspectiveCamera`는 4가지 속성을 바탕으로 절두체를 만듭니다. `near`는 절두체가 어디서 시작할지
결정하는 속성이고, `far`는 절두체의 끝입니다. `fov`는 시아갹(field of view)으로, `near`과 카메라의
거리에 따라 절두체의 높이를 계산해 적용합니다. `aspect`는 절두체의 너비에 관여하는 비율으로, 절두체의
너비는 절두체의 높이에 이 비율을 곱한 값입니다.

<img src="resources/frustum-3d.svg" width="500" class="threejs_center"/>

[이전 장](threejs-lights.html)에서 썼던 바닥면, 구체, 정육면체로 이루어진 예제를 다시 사용해
카메라의 속성을 조정할 수 있도록 만들겠습니다.

`near` 속성은 항상 `far` 속성보다 커야하니, 이를 제어할 `MinMaxGUIHelper` 헬퍼 클래스를
만들겠습니다. 이 클래스는 dat.GUI가 제어할 `min`과 `max` 속성이 있고, dat.GUI가 이를 조정할
때 지정한 두 가지 속성을 동시에 변경합니다.

```js
class MinMaxGUIHelper {
  constructor(obj, minProp, maxProp, minDif) {
    this.obj = obj;
    this.minProp = minProp;
    this.maxProp = maxProp;
    this.minDif = minDif;
  }
  get min() {
    return this.obj[this.minProp];
  }
  set min(v) {
    this.obj[this.minProp] = v;
    this.obj[this.maxProp] = Math.max(this.obj[this.maxProp], v + this.minDif);
  }
  get max() {
    return this.obj[this.maxProp];
  }
  set max(v) {
    this.obj[this.maxProp] = v;
    this.min = this.min;  // min setter로 작동
  }
}
```

이제 GUI를 만들어보죠.

```js
function updateCamera() {
  camera.updateProjectionMatrix();
}

const gui = new GUI();
gui.add(camera, 'fov', 1, 180).onChange(updateCamera);
const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
gui.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far').onChange(updateCamera);
```

카메라의 속성을 변경할 때마다 카메라의 [`updateProjectionMatrix`](PerspectiveCamera.updateProjectionMatrix)
메서드를 호출해야 하므로, `updateCamera`라는 함수를 만들어 값이 변경될 때마다 함수를 호출하도록
합니다.

{{{example url="../threejs-cameras-perspective.html" }}}

값을 조정하며 카메라가 어떤 식으로 작동하는지 확인해보세요. `aspect`는 창의 비율을 그대로 사용하도록
설정되어 있으므로, 이를 바꾸고 싶다면 예제를 새 창에서 열어 코드를 직접 수정해야 합니다.

아직도 카메라가 어떤 식으로 작동하는지 보기 어려운가요? 까짓것 그럼 카메라를 하나 더 만들어보죠.
하나는 위의 예제와 같은 방식의 카메라이고, 다른 하나는 이 카메라의 시야와 절두체를 렌더링해
카메라가 어떻게 움직이는지 관찰할 수 있도록 만들겠습니다.

Three.js의 가위 함수(scissor function)을 이용하면 쉽습니다. 가위 함수를 사용해 양쪽에
장면 두 개, 카메라 두 개를 렌더링하겠습니다.

먼저 HTML과 CSS로 양쪽에 div 요소를 배치합니다. 이러면 각각의 카메라에 `OrbitControls`를
두어 이벤트 처리하기도 훨씬 간단합니다.

```html
<body>
  <canvas id="c"></canvas>
+  <div class="split">
+     <div id="view1" tabindex="1"></div>
+     <div id="view2" tabindex="2"></div>
+  </div>
</body>
```

CSS로 두 div 요소가 canvas 위 양쪽에 자리하게 합니다.

```css
.split {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
}
.split > div {
  width: 100%;
  height: 100%;
}
```

카메라의 절두체를 시각화할 `CameraHelper`를 추가합니다.

```js
const cameraHelper = new THREE.CameraHelper(camera);

...

scene.add(cameraHelper);
```

다음으로 두 div 요소를 참조합니다.

```js
const view1Elem = document.querySelector('#view1');
const view2Elem = document.querySelector('#view2');
```

그리고 기존 `OrbitControls`가 왼쪽 div 요소의 이벤트에만 반응하도록 설정합니다.

```js
-const controls = new OrbitControls(camera, canvas);
+const controls = new OrbitControls(camera, view1Elem);
```

다음으로 `PerspectiveCamera`와 두 번째 `OrbitControls`를 추가합니다. 두 번째
`OrbitControls`는 두 번째 카메라에 종속적이며, 오른쪽 div 요소의 이벤트에
반응합니다.

```js
const camera2 = new THREE.PerspectiveCamera(
  60,  // 시야각(fov)
  2,   // 비율(aspect)
  0.1, // near
  500, // far
);
camera2.position.set(40, 10, 30);
camera2.lookAt(0, 5, 0);

const controls2 = new OrbitControls(camera2, view2Elem);
controls2.target.set(0, 5, 0);
controls2.update();
```

Finally we need to render the scene from the point of view of each
camera using the scissor function to only render to part of the canvas.

Here is a function that given an element will compute the rectangle
of that element that overlaps the canvas. It will then set the scissor
and viewport to that rectangle and return the aspect for that size.

```js
function setScissorForElement(elem) {
  const canvasRect = canvas.getBoundingClientRect();
  const elemRect = elem.getBoundingClientRect();

  // compute a canvas relative rectangle
  const right = Math.min(elemRect.right, canvasRect.right) - canvasRect.left;
  const left = Math.max(0, elemRect.left - canvasRect.left);
  const bottom = Math.min(elemRect.bottom, canvasRect.bottom) - canvasRect.top;
  const top = Math.max(0, elemRect.top - canvasRect.top);

  const width = Math.min(canvasRect.width, right - left);
  const height = Math.min(canvasRect.height, bottom - top);

  // setup the scissor to only render to that part of the canvas
  const positiveYUpBottom = canvasRect.height - bottom;
  renderer.setScissor(left, positiveYUpBottom, width, height);
  renderer.setViewport(left, positiveYUpBottom, width, height);

  // return the aspect
  return width / height;
}
```

And now we can use that function to draw the scene twice in our `render` function

```js
  function render() {

-    if (resizeRendererToDisplaySize(renderer)) {
-      const canvas = renderer.domElement;
-      camera.aspect = canvas.clientWidth / canvas.clientHeight;
-      camera.updateProjectionMatrix();
-    }

+    resizeRendererToDisplaySize(renderer);
+
+    // turn on the scissor
+    renderer.setScissorTest(true);
+
+    // render the original view
+    {
+      const aspect = setScissorForElement(view1Elem);
+
+      // adjust the camera for this aspect
+      camera.aspect = aspect;
+      camera.updateProjectionMatrix();
+      cameraHelper.update();
+
+      // don't draw the camera helper in the original view
+      cameraHelper.visible = false;
+
+      scene.background.set(0x000000);
+
+      // render
+      renderer.render(scene, camera);
+    }
+
+    // render from the 2nd camera
+    {
+      const aspect = setScissorForElement(view2Elem);
+
+      // adjust the camera for this aspect
+      camera2.aspect = aspect;
+      camera2.updateProjectionMatrix();
+
+      // draw the camera helper in the 2nd view
+      cameraHelper.visible = true;
+
+      scene.background.set(0x000040);
+
+      renderer.render(scene, camera2);
+    }

-    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}
```

The code above sets the background color of the scene when rendering the
second view to dark blue just to make it easier to distinguish the two views.

We can also remove our `updateCamera` code since we're updating everything
in the `render` function.

```js
-function updateCamera() {
-  camera.updateProjectionMatrix();
-}

const gui = new GUI();
-gui.add(camera, 'fov', 1, 180).onChange(updateCamera);
+gui.add(camera, 'fov', 1, 180);
const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
-gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
-gui.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far').onChange(updateCamera);
+gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near');
+gui.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far');
```

And now you can use one view to see the frustum of the other.

{{{example url="../threejs-cameras-perspective-2-scenes.html" }}}

On the left you can see the original view and on the right you can
see a view showing the frustum of the camera on the left. As you adjust
`near`, `far`, `fov` and move the camera with mouse you can see that
only what's inside the frustum shown on the right appears in the scene on
the left.

Adjust `near` up to around 20 and you'll easily see the front of objects
disappear as they are no longer in the frustum. Adjust `far` below about 35
and you'll start to see the ground plane disappear as it's no longer in
the frustum.

This brings up the question, why not just set `near` to 0.0000000001 and `far`
to 10000000000000 or something like that so you can just see everything?
The reason is your GPU only has so much precision to decide if something
is in front or behind something else. That precision is spread out between
`near` and `far`. Worse, by default the precision close the camera is detailed
and the precision far from the camera is coarse. The units start with `near`
and slowly expand as they approach `far`.

Starting with the top example, let's change the code to insert 20 spheres in a
row.

```js
{
  const sphereRadius = 3;
  const sphereWidthDivisions = 32;
  const sphereHeightDivisions = 16;
  const sphereGeo = new THREE.SphereBufferGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
  const numSpheres = 20;
  for (let i = 0; i < numSpheres; ++i) {
    const sphereMat = new THREE.MeshPhongMaterial();
    sphereMat.color.setHSL(i * .73, 1, 0.5);
    const mesh = new THREE.Mesh(sphereGeo, sphereMat);
    mesh.position.set(-sphereRadius - 1, sphereRadius + 2, i * sphereRadius * -2.2);
    scene.add(mesh);
  }
}
```

and let's set `near` to 0.00001

```js
const fov = 45;
const aspect = 2;  // the canvas default
-const near = 0.1;
+const near = 0.00001;
const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
```

We also need to tweak the GUI code a little to allow 0.00001 if the value is edited

```js
-gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
+gui.add(minMaxGUIHelper, 'min', 0.00001, 50, 0.00001).name('near').onChange(updateCamera);
```

What do you think will happen?

{{{example url="../threejs-cameras-z-fighting.html" }}}

This is an example of *z fighting* where the GPU on your computer does not have
enough precision to decide which pixels are in front and which pixels are behind.

Just in case the issue doesn't show on your machine here's what I see on mine

<div class="threejs_center"><img src="resources/images/z-fighting.png" style="width: 570px;"></div>

One solution is to tell three.js use to a different method to compute which
pixels are in front and which are behind. We can do that by enabling
`logarithmicDepthBuffer` when we create the `WebGLRenderer`

```js
-const renderer = new THREE.WebGLRenderer({canvas});
+const renderer = new THREE.WebGLRenderer({
+  canvas,
+  logarithmicDepthBuffer: true,
+});
```

and with that it might work

{{{example url="../threejs-cameras-logarithmic-depth-buffer.html" }}}

If this didn't fix the issue for you then you've run into one reason why
you can't always use this solution. That reason is because only certain GPUs
support it. As of September 2018 almost no mobile devices support this
solution whereas most desktops do.

Another reason not to choose this solution is it can be significantly slower
than the standard solution.

Even with this solution there is still limited resolution. Make `near` even
smaller or `far` even bigger and you'll eventually run into the same issues.

What that means is that you should always make an effort to choose a `near`
and `far` setting that fits your use case. Set `near` as far away from the camera
as you can and not have things disappear. Set `far` as close to the camera
as you can and not have things disappear. If you're trying to draw a giant
scene and show a close up of someone's face so you can see their eyelashes
while in the background you can see all the way to mountains 50 kilometers
in the distance well then you'll need to find other creative solutions that
maybe we'll go over later. For now, just be aware you should take care
to choose appropriate `near` and `far` values for your needs.

The 2nd most common camera is the `OrthographicCamera`. Rather than
specify a frustum it specifies a box with the settings `left`, `right`
`top`, `bottom`, `near`, and `far`. Because it's projecting a box
there is no perspective.

Let's change the 2 view example above to use an `OrthographicCamera`
in the first view.

First let's setup an `OrthographicCamera`.

```js
const left = -1;
const right = 1;
const top = 1;
const bottom = -1;
const near = 5;
const far = 50;
const camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
camera.zoom = 0.2;
```

We set `left` and `bottom` to -1 and `right` and `top` to 1. This would make
a box 2 units wide and 2 units tall but we're going to adjust the `left` and `top`
by the aspect of the rectangle we're drawing to. We'll use the `zoom` property
to make it easy to adjust how many units are actually shown by the camera.

Let's add a GUI setting for `zoom`

```js
const gui = new GUI();
+gui.add(camera, 'zoom', 0.01, 1, 0.01).listen();
```

The call to `listen` tells dat.GUI to watch for changes. This is here because
the `OrbitControls` can also control zoom. For example the scroll wheel on
a mouse will zoom via the `OrbitControls`.

Last we just need to change the part that renders the left
side to update the `OrthographicCamera`.

```js
{
  const aspect = setScissorForElement(view1Elem);

  // update the camera for this aspect
-  camera.aspect = aspect;
+  camera.left   = -aspect;
+  camera.right  =  aspect;
  camera.updateProjectionMatrix();
  cameraHelper.update();

  // don't draw the camera helper in the original view
  cameraHelper.visible = false;

  scene.background.set(0x000000);
  renderer.render(scene, camera);
}
```

and now you can see an `OrthographicCamera` at work.

{{{example url="../threejs-cameras-orthographic-2-scenes.html" }}}

An `OrthographicCamera` is most often used if using three.js
to draw 2D things. You'd decide how many units you want the camera
to show. For example if you want one pixel of canvas to match
one unit in the camera you could do something like

To put the origin at the center and have 1 pixel = 1 three.js unit
something like

```js
camera.left = -canvas.width / 2;
camera.right = canvas.width / 2;
camera.top = canvas.height / 2;
camera.bottom = -canvas.height / 2;
camera.near = -1;
camera.far = 1;
camera.zoom = 1;
```

Or if we wanted the origin to be in the top left just like a
2D canvas we could use this

```js
camera.left = 0;
camera.right = canvas.width;
camera.top = 0;
camera.bottom = canvas.height;
camera.near = -1;
camera.far = 1;
camera.zoom = 1;
```

In which case the top left corner would be 0,0 just like a 2D canvas

Let's try it! First let's set the camera up

```js
const left = 0;
const right = 300;  // default canvas size
const top = 0;
const bottom = 150;  // default canvas size
const near = -1;
const far = 1;
const camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
camera.zoom = 1;
```

Then let's load 6 textures and make 6 planes, one for each texture.
We'll parent each plane to a `THREE.Object3D` to make it easy to offset
the plane so it's center appears to be at it's top left corner.

```js
const loader = new THREE.TextureLoader();
const textures = [
  loader.load('resources/images/flower-1.jpg'),
  loader.load('resources/images/flower-2.jpg'),
  loader.load('resources/images/flower-3.jpg'),
  loader.load('resources/images/flower-4.jpg'),
  loader.load('resources/images/flower-5.jpg'),
  loader.load('resources/images/flower-6.jpg'),
];
const planeSize = 256;
const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
const planes = textures.map((texture) => {
  const planePivot = new THREE.Object3D();
  scene.add(planePivot);
  texture.magFilter = THREE.NearestFilter;
  const planeMat = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(planeGeo, planeMat);
  planePivot.add(mesh);
  // move plane so top left corner is origin
  mesh.position.set(planeSize / 2, planeSize / 2, 0);
  return planePivot;
});
```

and we need to update the camera if the size of the canvas
changes.

```js
function render() {

  if (resizeRendererToDisplaySize(renderer)) {
    camera.right = canvas.width;
    camera.bottom = canvas.height;
    camera.updateProjectionMatrix();
  }

  ...
```

`planes` is an array of `THREE.Mesh`, one for each plane.
Let's move them around based on the time.

```js
function render(time) {
  time *= 0.001;  // convert to seconds;

  ...

  const xRange = Math.max(20, canvas.width - planeSize) * 2;
  const yRange = Math.max(20, canvas.height - planeSize) * 2;

  planes.forEach((plane, ndx) => {
    const speed = 180;
    const t = time * speed + ndx * 300;
    const xt = t % xRange;
    const yt = t % yRange;

    const x = xt < xRange / 2 ? xt : xRange - xt;
    const y = yt < yRange / 2 ? yt : yRange - yt;

    plane.position.set(x, y, 0);
  });

  renderer.render(scene, camera);
```

And you can see the images bounce pixel perfect off the edges of the
canvas using pixel math just like a 2D canvas

{{{example url="../threejs-cameras-orthographic-canvas-top-left-origin.html" }}}

Another common use for an `OrthographicCamera` is to draw the
up, down, left, right, front, back views of a 3D modeling
program or a game engine's editor.

<div class="threejs_center"><img src="resources/images/quad-viewport.png" style="width: 574px;"></div>

In the screenshot above you can see 1 view is a perspective view and 3 views are
orthographic views.

That's the fundamentals of cameras. We'll cover a few common ways to move cameras
in other articles. For now let's move on to [shadows](threejs-shadows.html).

<canvas id="c"></canvas>
<script type="module" src="../resources/threejs-cameras.js"></script>