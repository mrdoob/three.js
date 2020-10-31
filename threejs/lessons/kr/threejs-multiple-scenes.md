Title: Three.js로 캔버스, 장면 여러 개 만들기
Description: THREE.js로 다수의 장면을 렌더링해봅니다
TOC: 다중 캔버스, 다중 장면 만들기

사람들이 자주 하는 질문 중 하나는 Three.js로 여러 개의 캔버스(canvas)를 렌더링하려면
어떻게 해야 하나요?"입니다. 쇼핑몰 사이트나 3D 도표가 여러 개 있는 웹 페이지를
제작한다고 해봅시다. 얼핏 그리 어려울 건 없어 보입니다. 그냥 도표가 들어갈 곳마다
각각 캔버스를 만들고, 각 캔버스마다 `Renderer`를 생성하면 되지 않을까요?

하지만 이 방법을 적용하자마자 문제가 생깁니다.

1. 브라우저의 WebGL 컨텍스트(context)는 제한적이다.

    일반적으로 약 8개가 최대입니다. 9번째 컨텍스트를 만들면 제일 처음에 만들었던
    컨텍스트가 사라지죠.

2. WebGL 자원은 컨텍스트끼리 공유할 수 없다.

    10MB짜리 모델을 캔버스 두 개에서 사용하려면 모델을 각각 총 두 번 로드해야 하고,
    원래의 두 배인 20MB의 자원을 사용한다는 의미입니다. 컨텍스트끼리는 어떤 것도 공유할
    수 없죠. 또한 초기화도 두 번, 쉐이더 컴파일도 두 번, 같은 동작은 모두 두 번씩
    실행해야 합니다. 캔버스의 개수가 많아질수록 성능에 문제가 생기겠죠.

그렇다면 어떻게 해야 할까요?

방법 중 하나는 캔버스 하나로 화면 전체를 채우고, 각 "가상" 캔버스를 대신할 HTML 요소(element)를
두는 겁니다. `Renderer`는 하나만 만들되 가상 캔버스에 각각 `Scene`을 만드는 거죠. 그리고
가상 HTML 요소의 좌표를 계산해 요소가 화면에 보인다면 Three.js가 해당 장면(scene)을 가상
요소의 좌표에 맞춰 렌더링하도록 합니다.

이 방법은 캔버스를 하나만 사용하므로 위 1번과 2번 문제 모두 해결할 수 있습니다. 컨텍스트를
하나만 사용하니 WebGL 컨텍스트 제한을 걱정할 일도 없고, 자원을 몇 배씩 더 사용할 일도 없죠.

2개의 장면만 만들어 간단히 테스트를 해보겠습니다. 먼저 HTML을 작성합니다.

```html
<canvas id="c"></canvas>
<p>
  <span id="box" class="diagram left"></span>
  I love boxes. Presents come in boxes.
  When I find a new box I'm always excited to find out what's inside.
</p>
<p>
  <span id="pyramid" class="diagram right"></span>
  When I was a kid I dreamed of going on an expedition inside a pyramid
  and finding a undiscovered tomb full of mummies and treasure.
</p>
```

다음으로 CSS를 작성합니다.

```css
#c {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: block;
  z-index: -1;
}
.diagram {
  display: inline-block;
  width: 5em;
  height: 3em;
  border: 1px solid black;
}
.left {
  float: left;
  margin-right: .25em;
}
.right {
  float: right;
  margin-left: .25em;
}
```

캔버스가 화면 전체를 채우도록 하고 `z-index`를 -1로 설정해 다른 요소 뒤로 가도록 했습니다.
가상 요소에 컨텐츠가 없어 크기가 0이니 별도의 width와 height도 지정해줬습니다.

이제 각각의 카메라와 조명이 있는 장면 2개를 만듭니다. 하나에는 정육면체, 다른 하나에는
다이아몬드 모양을 넣을 겁니다.

```js
function makeScene(elem) {
  const scene = new THREE.Scene();

  const fov = 45;
  const aspect = 2;  // 캔버스 기본값
  const near = 0.1;
  const far = 5;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 2;
  camera.position.set(0, 1, 2);
  camera.lookAt(0, 0, 0);

  {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
  }

  return { scene, camera, elem };
}

function setupScene1() {
  const sceneInfo = makeScene(document.querySelector('#box'));
  const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
  const material = new THREE.MeshPhongMaterial({color: 'red'});
  const mesh = new THREE.Mesh(geometry, material);
  sceneInfo.scene.add(mesh);
  sceneInfo.mesh = mesh;
  return sceneInfo;
}

function setupScene2() {
  const sceneInfo = makeScene(document.querySelector('#pyramid'));
  const radius = .8;
  const widthSegments = 4;
  const heightSegments = 2;
  const geometry = new THREE.SphereBufferGeometry(radius, widthSegments, heightSegments);
  const material = new THREE.MeshPhongMaterial({
    color: 'blue',
    flatShading: true,
  });
  const mesh = new THREE.Mesh(geometry, material);
  sceneInfo.scene.add(mesh);
  sceneInfo.mesh = mesh;
  return sceneInfo;
}

const sceneInfo1 = setupScene1();
const sceneInfo2 = setupScene2();
```

이제 각 요소가 화면에 보일 때만 장면을 렌더링할 함수를 만듭니다. `Renderer.setScissorTest`를
호출해 *가위(scissor)* 테스트를 활성화하면 Three.js가 캔버스의 특정 부분만 렌더링하도록
할 수 있습니다. 그리고 `Renderer.setScissor`로 가위를 설정한 뒤 `Renderer.setViewport`로
장면의 좌표를 설정합니다.

```js
function renderSceneInfo(sceneInfo) {
  const { scene, camera, elem } = sceneInfo;

  // 해당 요소의 화면 대비 좌표를 가져옵니다
  const { left, right, top, bottom, width, height } =
      elem.getBoundingClientRect();

  const isOffscreen =
      bottom < 0 ||
      top > renderer.domElement.clientHeight ||
      right < 0 ||
      left > renderer.domElement.clientWidth;

  if (isOffscreen) {
    return;
  }

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  const positiveYUpBottom = canvasRect.height - bottom;
  renderer.setScissor(left, positiveYUpBottom, width, height);
  renderer.setViewport(left, positiveYUpBottom, width, height);

  renderer.render(scene, camera);
}
```

다음으로 `render` 함수 안에서 먼저 캔버스 전체를 비운 뒤 각 장면을 렌더링합니다.

```js
function render(time) {
  time *= 0.001;

  resizeRendererToDisplaySize(renderer);

  renderer.setScissorTest(false);
  renderer.clear(true, true);
  renderer.setScissorTest(true);

  sceneInfo1.mesh.rotation.y = time * .1;
  sceneInfo2.mesh.rotation.y = time * .1;

  renderSceneInfo(sceneInfo1);
  renderSceneInfo(sceneInfo2);

  requestAnimationFrame(render);
}
```

결과를 확인해볼까요?

{{{example url="../threejs-multiple-scenes-v1.html" }}}

첫 번째 `<span>` 요소가 있는 곳에는 빨간 정육면체가, 두 번째 `<span>` 요소가 있는 곳에는
파란 다이아몬드가 보일 겁니다.

## 동기화하기

위 코드는 나쁘지 않지만 작은 문제가 있습니다. 복잡한 장면 등 무슨 이유라도 렌더링하는
데 시간이 오래 걸린다면, 장면의 좌표는 페이지의 다른 컨텐츠에 비해 더디게 내려올 겁니다.

각 가상 요소에 테두리를 넣고

```css
.diagram {
  display: inline-block;
  width: 5em;
  height: 3em;
+  border: 1px solid black;
}
```

각 장면에 배경색도 넣어줍니다.

```js
const scene = new THREE.Scene();
+scene.background = new THREE.Color('red');
```

그런 다음 <a href="../threejs-multiple-scenes-v2.html" target="_blank">빠르게 스크롤을 위아래로 반복해보면</a>
문제가 보일겁니다. 아래는 스크롤 애니메이션 캡쳐본의 속도를 10배 낮춘 예시입니다.

<div class="threejs_center"><img class="border" src="resources/images/multi-view-skew.gif"></div>

추가로 처리해줘야 할 것이 있긴 하지만, 캔버스의 CSS를 `position: fixed`에서 `position: absolute`로
바꿔 문제를 해결할 수 있습니다.

```css
#c {
-  position: fixed;
+  position: absolute;
```

그리고 페이지 스크롤에 상관 없이 캔버스가 항상 화면의 상단에 위치할 수 있도록 캔버스에
transform 스타일을 지정해줍니다.

```js
function render(time) {
  ...

  const transform = `translateY(${ window.scrollY }px)`;
  renderer.domElement.style.transform = transform;

```

캔버스에 `position: fixed`를 적용하면 캔버스는 스크롤의 영향을 받지 않습니다. `position: absolute`를
적용하면 렌더링하는 데 시간이 걸리더라도 일단 다른 페이지와 같이 스크롤이 되겠죠. 그리고
렌더링하기 전에 캔버스를 다시 움직여 화면 전체에 맞춘 뒤 캔버스를 렌더링하는 겁니다. 이러면
화면의 가장자리에 살짝 렌더링되지 않은 부분이 보일 수는 있어도 나머지 페이지에 있는 요소는
버벅이지 않고 제자리에 있을 겁니다. 아래는 해당 코드를 적용한 화면의 캡쳐본을 아까와 마찬가지로
10배 느리게 만든 것입니다.

<div class="threejs_center"><img class="border" src="resources/images/multi-view-fixed.gif"></div>

## 확장하기 쉽게 만들기

여러 장면을 구현했으니 이제 이 예제를 좀 더 확장하기 쉽게 만들어보겠습니다.

먼저 기존처럼 캔버스 전체를 렌더링하는 `render` 함수를 두고, 각 장면에 해당하는 가상 요소,
해당 장면을 렌더링하는 함수로 이루어진 객체의 배열을 만듭니다. `render` 함수에서 가상 요소가
화면에 보이는지 확인한 뒤, 가상 요소가 화면에 보인다면 상응하는 렌더링 함수를 호출합니다. 이러면
확장성은 물론 각 장면의 렌더링 함수를 작성할 때도 전체를 신경쓸 필요가 없죠.

아래는 전체를 담당하는 `render` 함수입니다.

```js
const sceneElements = [];
function addScene(elem, fn) {
  sceneElements.push({ elem, fn });
}

function render(time) {
  time *= 0.001;

  resizeRendererToDisplaySize(renderer);

  renderer.setScissorTest(false);
  renderer.setClearColor(clearColor, 0);
  renderer.clear(true, true);
  renderer.setScissorTest(true);

  const transform = `translateY(${ window.scrollY }px)`;
  renderer.domElement.style.transform = transform;

  for (const { elem, fn } of sceneElements) {
    // 해당 요소의 화면 대비 좌표를 가져옵니다
    const rect = elem.getBoundingClientRect();
    const {left, right, top, bottom, width, height} = rect;

    const isOffscreen =
        bottom < 0 ||
        top > renderer.domElement.clientHeight ||
        right < 0 ||
        left > renderer.domElement.clientWidth;

    if (!isOffscreen) {
      const positiveYUpBottom = renderer.domElement.clientHeight - bottom;
      renderer.setScissor(left, positiveYUpBottom, width, height);
      renderer.setViewport(left, positiveYUpBottom, width, height);

      fn(time, rect);
    }
  }

  requestAnimationFrame(render);
}
```

`render` 함수는 `elem`과 `fn` 속성의 객체로 이루어진 `sceneElements` 배열을 순회합니다.

그리고 각 요소가 화면에 보이는지 확인하고, 화면에 보인다면 `fn`에 해당 장면이 들어가야할
사각 좌표와 현재 시간값을 넘겨주어 호출합니다.

이제 각 장면을 만들고 상응하는 요소와 렌더링 함수를 추가합니다.

```js
{
  const elem = document.querySelector('#box');
  const { scene, camera } = makeScene();
  const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
  const material = new THREE.MeshPhongMaterial({ color: 'red' });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  addScene(elem, (time, rect) => {
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
    mesh.rotation.y = time * .1;
    renderer.render(scene, camera);
  });
}

{
  const elem = document.querySelector('#pyramid');
  const { scene, camera } = makeScene();
  const radius = .8;
  const widthSegments = 4;
  const heightSegments = 2;
  const geometry = new THREE.SphereBufferGeometry(radius, widthSegments, heightSegments);
  const material = new THREE.MeshPhongMaterial({
    color: 'blue',
    flatShading: true,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  addScene(elem, (time, rect) => {
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
    mesh.rotation.y = time * .1;
    renderer.render(scene, camera);
  });
}
```

`sceneInfo1`, `sceneInfo2`는 더 이상 필요 없으니 제거합니다. 대신 각 mesh의 회전은 해당
장면에서 처리해야 합니다.

{{{example url="../threejs-multiple-scenes-generic.html" }}}

## HTML Dataset 사용하기

HTML의 [dataset](https://developer.mozilla.org/ko/docs/Web/API/HTMLElement/dataset)을
이용하면 좀 더 확장하기 쉬운 환경을 만들 수 있습니다. `id="..."` 대신 `data-diagram="..."`을
이용해 데이터를 직접 HTML 요소에 지정하는 거죠.

```html
<canvas id="c"></canvas>
<p>
-  <span id="box" class="diagram left"></span>
+  <span data-diagram="box" class="left"></span>
  I love boxes. Presents come in boxes.
  When I find a new box I'm always excited to find out what's inside.
</p>
<p>
-  <span id="pyramid" class="diagram left"></span>
+  <span data-diagram="pyramid" class="right"></span>
  When I was a kid I dreamed of going on an expedition inside a pyramid
  and finding a undiscovered tomb full of mummies and treasure.
</p>
```

요소의 id를 제거했으니 CSS 셀렉터도 다음처럼 바꾸어야 합니다.

```css
-.diagram
+*[data-diagram] {
  display: inline-block;
  width: 5em;
  height: 3em;
}
```

또한 각 장면을 만드는 코드를 *scene initialization functions*라는 맵으로 만듭니다.
이 맵은 키값에 대응하는 *장면 렌더링 함수*를 반환할 겁니다.

```js
const sceneInitFunctionsByName = {
  'box': () => {
    const { scene, camera } = makeScene();
    const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({color: 'red'});
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    return (time, rect) => {
      mesh.rotation.y = time * .1;
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };
  },
  'pyramid': () => {
    const { scene, camera } = makeScene();
    const radius = .8;
    const widthSegments = 4;
    const heightSegments = 2;
    const geometry = new THREE.SphereBufferGeometry(radius, widthSegments, heightSegments);
    const material = new THREE.MeshPhongMaterial({
      color: 'blue',
      flatShading: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    return (time, rect) => {
      mesh.rotation.y = time * .1;
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };
  },
};
```

그리고 `querySelectorAll`로 가상 요소를 전부 불러와 해당 요소에 상응하는 렌더링 함수를
실행합니다.

```js
document.querySelectorAll('[data-diagram]').forEach((elem) => {
  const sceneName = elem.dataset.diagram;
  const sceneInitFunction = sceneInitFunctionsByName[sceneName];
  const sceneRenderFunction = sceneInitFunction(elem);
  addScene(elem, sceneRenderFunction);
});
```

이제 코드를 확장하기가 한결 편해졌습니다.

{{{examples url="../threejs-multiple-scenes-selector.html" }}}

## 각 요소에 액션 추가하기

사용자 액션, 예를 들어 `TrackballControls`를 추가하는 건 아주 간단합니다. 먼저 스크립트를
불러옵니다.

```js
import { TrackballControls } from './resources/threejs/r122/examples/jsm/controls/TrackballControls.js';
```

그리고 각 장면에 대응하는 요소에 `TrackballControls`를 추가합니다.

```js
-function makeScene() {
+function makeScene(elem) {
  const scene = new THREE.Scene();

  const fov = 45;
  const aspect = 2;  // 캔버스 기본값
  const near = 0.1;
  const far = 5;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 1, 2);
  camera.lookAt(0, 0, 0);
+  scene.add(camera);

+  const controls = new TrackballControls(camera, elem);
+  controls.noZoom = true;
+  controls.noPan = true;

  {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
-    scene.add(light);
+    camera.add(light);
  }

-  return { scene, camera };
+ return { scene, camera, controls };
}
```

위 코드에서는 카메라를 장면에 추가하고, 카메라에 조명을 추가했습니다. 이러면 조명이 카메라를
따라다니겠죠. `TrackballControls`는 카메라를 조정하기 때문에 이렇게 해야 빛이 계속 우리가
바라보는 방향에서 나갑니다.

또한 컨트롤을 렌더링 함수에서 업데이트해줘야 합니다.

```js
const sceneInitFunctionsByName = {
- 'box': () => {
-    const {scene, camera} = makeScene();
+ 'box': (elem) => {
+    const { scene, camera, controls } = makeScene(elem);
    const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({color: 'red'});
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    return (time, rect) => {
      mesh.rotation.y = time * .1;
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
+      controls.handleResize();
+      controls.update();
      renderer.render(scene, camera);
    };
  },
-  'pyramid': () => {
-    const { scene, camera } = makeScene();
+  'pyramid': (elem) => {
+    const { scene, camera, controls } = makeScene(elem);
    const radius = .8;
    const widthSegments = 4;
    const heightSegments = 2;
    const geometry = new THREE.SphereBufferGeometry(radius, widthSegments, heightSegments);
    const material = new THREE.MeshPhongMaterial({
      color: 'blue',
      flatShading: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    return (time, rect) => {
      mesh.rotation.y = time * .1;
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
+      controls.handleResize();
+      controls.update();
      renderer.render(scene, camera);
    };
  },
};
```

이제 각 물체를 자유롭게 회전시킬 수 있습니다.

{{{example url="../threejs-multiple-scenes-controls.html" }}}

이 기법은 이 사이트 전체에 사용한 기법입니다. [원시 모델에 관한 글](threejs-primitives.html)과
[재질에 관한 글](threejs-materials.html)에서 다양한 예시를 보여주기 위해 사용했죠.

다른 방법으로는 화면 밖의 캔버스에서 장면을 렌더링해 각 요소에 2D 캔버스 형태로 넘겨주는
방법이 있습니다. 이 방법의 장점은 각 영역을 어떻게 분리할지 고민하지 않아도 된다는 것이죠.
위에서 살펴본 방법은 캔버스를 화면 전체의 배경으로 써야 하지만, 이 방법은 일반 HTML 형태로
사용할 수 있습니다.

하지만 이 방법은 각 영역을 복사하는 것이기에 성능이 더 느립니다. 얼마나 느릴지는 브라우저와
GPU 성능에 따라 다르죠.

바꿔야 하는 건 생각보다 많지 않습니다.

먼저 배경에서 캔버스 요소를 제거합니다.

```html
<body>
-  <canvas id="c"></canvas>
  ...
</body>
```

CSS도 바꿔줍니다.

```css
-#c {
-  position: absolute;
-  left: 0;
-  top: 0;
-  width: 100%;
-  height: 100%;
-  display: block;
-  z-index: -1;
-}
canvas {
  width: 100%;
  height: 100%;
  display: block;
}
*[data-diagram] {
  display: inline-block;
  width: 5em;
  height: 3em;
}
```

캔버스 요소가 부모에 꽉 차도록 변경했습니다.

이제 자바스크립트를 변경해봅시다. 먼저 캔버스를 참조할 필요가 없으니 대신 캔버스 요소를
새로 만듭니다. 또한 가위 테스트를 처음에 활성화합니다.

```js
function main() {
-  const canvas = document.querySelector('#c');
+  const canvas = document.createElement('canvas');
  const renderer = new THREE.WebGLRenderer({canvas, alpha: true});
+  renderer.setScissorTest(true);

  ...
```

다음으로 각 장면에 2D 렌더링 컨텍스트를 생성하고 장면에 대응하는 요소에 캔버스를 추가합니다.

```js
const sceneElements = [];
function addScene(elem, fn) {
+  const ctx = document.createElement('canvas').getContext('2d');
+  elem.appendChild(ctx.canvas);
-  sceneElements.push({ elem, fn });
+  sceneElements.push({ elem, ctx, fn });
}
```

만약 렌더링 시 렌더링용 캔버스의 크기가 장면의 크기보다 작을 경우, 렌더링용 캔버스의 크기를
키웁니다. 또한 2D 캔버스의 크기가 부모 요소와 다르다면 2D 캔버스의 크기를 조정합니다. 마지막으로
가위와 화면을 설정하고, 해당 장면을 렌더링한 뒤, 요소의 캔버스로 렌더링 결과물을 복사합니다.

```js
function render(time) {
  time *= 0.001;

-  resizeRendererToDisplaySize(renderer);
-
-  renderer.setScissorTest(false);
-  renderer.setClearColor(clearColor, 0);
-  renderer.clear(true, true);
-  renderer.setScissorTest(true);
-
-  const transform = `translateY(${ window.scrollY }px)`;
-  renderer.domElement.style.transform = transform;

-  for (const { elem, fn } of sceneElements) {
+  for (const { elem, fn, ctx } of sceneElements) {
    // 해당 요소의 화면 대비 좌표를 가져옵니다
    const rect = elem.getBoundingClientRect();
    const { left, right, top, bottom, width, height } = rect;
+    const rendererCanvas = renderer.domElement;

    const isOffscreen =
        bottom < 0 ||
-        top > renderer.domElement.clientHeight ||
+        top > window.innerHeight ||
        right < 0 ||
-        left > renderer.domElement.clientWidth;
+        left > window.innerWidth;

    if (!isOffscreen) {
-      const positiveYUpBottom = renderer.domElement.clientHeight - bottom;
-      renderer.setScissor(left, positiveYUpBottom, width, height);
-      renderer.setViewport(left, positiveYUpBottom, width, height);

+      // 렌더링용 캔버스 크기 조정
+      if (rendererCanvas.width < width || rendererCanvas.height < height) {
+        renderer.setSize(width, height, false);
+      }
+
+      // 2D 캔버스의 크기가 요소의 크기와 같도록 조정
+      if (ctx.canvas.width !== width || ctx.canvas.height !== height) {
+        ctx.canvas.width = width;
+        ctx.canvas.height = height;
+      }
+
+      renderer.setScissor(0, 0, width, height);
+      renderer.setViewport(0, 0, width, height);

      fn(time, rect);

+      // 렌더링된 장면을 2D 캔버스에 복사
+      ctx.globalCompositeOperation = 'copy';
+      ctx.drawImage(
+          rendererCanvas,
+          0, rendererCanvas.height - height, width, height,  // 원본 사각 좌표
+          0, 0, width, height);                              // 결과물 사각 좌표
    }
  }

  requestAnimationFrame(render);
}
```

결과물은 위와 다르지 않습니다.

{{{example url="../threejs-multiple-scenes-copy-canvas.html" }}}

이 기법의 다른 장점은 [`OffscreenCanvas`](https://developer.mozilla.org/ko/docs/Web/API/OffscreenCanvas)
웹 워커를 이용해 이 기능을 별도 스레드에서 구현할 수 있다는 겁니다. 하지만 아쉽게도
2020년 7월을 기준으로 `OffscreenCanvas`는 아직 크로미움 기반 브라우저에서만 지원합니다.