Title: Three.js OffscreenCanvas
Description: Three.js에서 웹 워커를 활용하는 법을 알아봅니다
TOC: 웹 워커에서 OffscreenCanvas 사용하기

[`OffscreenCanvas`](https://developer.mozilla.org/ko/docs/Web/API/OffscreenCanvas)는 비교적 최근 도입된 브라우저 API로 아직 크로미움 기반 브라우저에서만 사용가능하지만, 갈수록 대부분의 브라우저에서 이 API를 사용할 수 있을 겁니다. `OffscreenCanvas`를 이용하면 [웹 워커(Web Worker)](https://developer.mozilla.org/ko/docs/Web/API/Web_Workers_API)에서 캔버스를 렌더링해 복잡한 3D 장면 등의 무거운 작업을 별도 프로세스에서 처리할 수 있습니다. 이러면 무거운 작업을 처리할 때 브라우저가 덜 버벅이도록 할 수 있죠. 또한 데이터도 워커에서 불러와 처리하므로 페이지 초기 로드 시 버벅임을 훨씬 줄일 수 있습니다.

사용법은 꽤나 직관적입니다. 먼저 [반응형 디자인에 관한 글](threejs-responsive.html)에서 썼던 예제를 가져오도록 하죠.

이 사이트 대부분의 예제는 스크립트를 해당 HTML 파일에 인라인으로 작성했습니다. 반면에 워커는 일반적으로 별도의 스크립트 파일로 분리해 작성합니다.

이 글에서는 `offscreencanvas-cubes.js`라는 별도 파일을 만들어 [반응형 디자인에서 가져온 예제](threejs-responsive.html)의 자바스크립트 코드를 전부 복사해 넣을 겁니다. 그런 다음 바꿔야할 부분을 바꿔보도록 하죠.

하지만 여전히 HTML 파일에 약간의 자바스크립트 코드가 필요합니다. 캔버스 요소를 참조하고 `canvas.transferControlToOffscreen` 메서드를 호출해 캔버스의 제어권을 `offscreen`에 넘겨줍니다.

```js
function main() {
  const canvas = document.querySelector('#c');
  const offscreen = canvas.transferControlToOffscreen();

  ...
```

그리고 `new Worker(워커 스크립트 경로, { type: 'module' })`로 워커를 생성한 뒤, 워커에 `offscreen` 객체를 넘깁니다.

```js
function main() {
  const canvas = document.querySelector('#c');
  const offscreen = canvas.transferControlToOffscreen();
  const worker = new Worker('offscreencanvas-cubes.js', { type: 'module' });
  worker.postMessage({ type: 'main', canvas: offscreen }, [ offscreen ]);
}
main();
```

스크립트를 따로 써야 하는 이유는 워커 안에서는 `DOM`에 접근할 수 없기 때문입니다. HTML 요소를 참조하거나 DOM 요소의 이벤트를 받을 수도 없죠. 일반적으로 메시지 이벤트를 통해서만 다른 스크립트와 통신할 수 있습니다.

워커에 메시지를 보내려면 [`worker.postMessage`](https://developer.mozilla.org/ko/docs/Web/API/Worker/postMessage)에 하나 또는 두 개의 인자를 넘겨주어 호출하면 됩니다. 첫 번째 인자는 워커에 전달할 객체로, 이 객체는 그대로 전달되지 않고 [복사됩니다](https://developer.mozilla.org/ko/docs/Web/API/Web_Workers_API/Structured_clone_algorithm). 두 번째 인자는 옵션으로 첫 번째 인자 중 그대로 *전달하기* 원하는 객체를 배열로 지정합니다. 여기에 지정한 객체는 복사되지 않죠. 그대로 워커에 *전달되지만* 객체를 보낸 스크립트에서는 더 이상 사용이 불가능해집니다. 이것도 모든 객체를 전달할 수 있는 게 아니라 특정 타입의 객체만을 전달할 수 있죠. 당연하게도 이 중에는 `OffscreenCanvas`도 있습니다. 정리하자면 `offscreen` 객체를 전달하고 나면 이 객체는 이 스크립트에서 더 이상 쓸모가 없어집니다.

워커의 `message` 이벤트를 이용하면 메시지를 받을 수 있습니다. `postMessage`에서 넘긴 객체는 `event.data`에 담겨 리스너에 전달되죠. 아까 위 코드에서는 `type: 'main'` 속성을 객체에 선언해 워커에 넘겨줬습니다. 이 `type` 속성은 브라우저의 메인 스레드에서는 쓸 일이 없는 값으로, 워커 내에 다른 함수를 호출하는 키값으로 사용할 겁니다. 이러면 메인 스크립트에서 워커 내의 함수를 호출하기가 훨씬 쉬워지겠죠.

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

`type` 값을 통해 호출할 함수를 찾고, 함수가 있다면 메인 스크립트에서 넘어온 `data`를 인자로 넘겨 호출하도록 했습니다.

이제 [반응형 디자인에 관한 글](threejs-responsive.html)에서 가져온 예제의 `main` 함수를 수정해야 합니다.

DOM에서 캔버스에 접근하는 대신 이벤트의 `data` 속성에서 캔버스 요소를 받도록 합니다.

```js
-function main() {
-  const canvas = document.querySelector('#c');
+function main(data) {
+  const { canvas } = data;
  const renderer = new THREE.WebGLRenderer({ canvas });

  ...

```

워커에서는 DOM에 접근할 수 없다고 했었죠. 마찬가지로 DOM 속성인 `canvas.clientWidth`나 `canvas.clientHeight`에도 접근할 수 없습니다. `resizeRendererToDisplaySize`를 그대로 사용할 수 없는 것이죠.

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

대신 캔버스 크기가 변경될 때마다 워커에 메시지를 보낼 겁니다. 워커에 전역 변수를 하나 생성해 여기에 width와 height 값을 지정하도록 하죠.

```js
const state = {
  width: 300,  // 캔버스 기본값
  height: 150,  // 캔버스 기본값
};
```

그리고 `size`라는 함수를 만들어 해당 값을 업데이트하도록 합니다.

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

`resizeRendererToDisplaySize`가 `state.width`와 `state.height`를 쓰도록 변경합니다.

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

마찬가지로 종횡비를 계산하는 코드도 DOM 속성 대신 `state`를 쓰도록 변경합니다.

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

메인 스크립트로 돌아와 페이지 크기가 바뀔 때마다 워커의 `size` 함수를 실행하도록 합니다.

```js
const worker = new Worker('offscreencanvas-picking.js', { type: 'module' });
worker.postMessage({ type: 'main', canvas: offscreen }, [ offscreen ]);

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

또한 직접 호출해 최초에 한 번 값을 보내도록 합니다.

여러분의 브라우저가 `OffscreenCanvas`를 완벽히 지원한다면 이제 문제 없이 작동할 겁니다. 그렇게 많이 바꾼 것이 없는데도 말이죠. 혹시 모르니 브라우저가 `OffscreenCanvas`를 지원하지 않을 경우 에러 메시지를 보여주도록 하겠습니다. 먼저 에러 메시지를 표시할 HTML을 작성합니다.

```html
<body>
  <canvas id="c"></canvas>
+  <div id="noOffscreenCanvas" style="display:none;">
+    <div>no OffscreenCanvas support</div>
+  </div>
</body>
```

간단한 스타일도 넣어주도록 하죠.

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

그리고 캔버스 요소에 `transferControlToOffscreen` 메서드가 있는지 확인해 `OffscreenCanvas`의 지원 여부를 확인합니다.

```js
function main() {
  const canvas = document.querySelector('#c');
+  if (!canvas.transferControlToOffscreen) {
+    canvas.style.display = 'none';
+    document.querySelector('#noOffscreenCanvas').style.display = '';
+    return;
+  }
  const offscreen = canvas.transferControlToOffscreen();
  const worker = new Worker('offscreencanvas-picking.js'. { type: 'module' });
  worker.postMessage({ type: 'main', canvas: offscreen }, [ offscreen ]);

  ...
```

브라우저가 `OffscreenCanvas`를 지원한다면 문제 없이 작동할 겁니다.

{{{example url="../threejs-offscreencanvas.html" }}}

하지만 현재 모든 브라우저가 `OffscreenCanvas`를 지원하는 것은 아닙니다. `OffscreenCanvas`를 지원할 경우에만 워커를 사용하도록 하고, 그렇지 않을 경우에는 기존처럼 메인 스크립트에서 렌더링을 처리하도록 하겠습니다.

> OffscreenCanvas를 단순히 페이지를 반응형으로 만드는 데 사용하는 건 의미없어 보일 수 있습니다. 메인 스크립트에서 반응형을 처리할 때보다 워커에서 처리할 때 오히려 작업이 더 많이 들 수 있거든요. 하지만 메인 스크립트만 사용할 때보다 워커를 사용할 때 자원을 더 넉넉하게 활용할 수 있다는 건 분명합니다. 전적으로 여러분이 상황에 따라 결정할 문제라는 것이죠.

먼저 Three.js 관련 코드를 분리해 워커 관련 코드와 그렇지 않은 코드로 나눠야 합니다. 같은 코드를 메인 스크립트와 워커에서 모두 쓸 수 있도록 말이죠. 아래와 같이 3개의 파일로 나뉠 겁니다.

1. html 파일.

   `threejs-offscreencanvas-w-fallback.html`

2. three.js 관련 자바스크립트 파일.

   `shared-cubes.js`

3. 워커용 스크립트

   `offscreencanvas-worker-cubes.js`

`shared-cubes.js`와 `offscreencanvas-worker-cubes.js`는 단순히 이전 `offscreencanvas-cubes.js` 파일을 쪼갠 것입니다. 먼저 `offscreencanvas-cube.js`를 `shared-cube.js`로 옮긴 뒤, 메인 HTML 파일에 이미 `main` 함수가 있어 `main` 함수의 이름만 `init`으로 바꿔야 하죠. 여기에 추가로 `init`과 `state` 함수를 export 시켜줘야 합니다.

```js
import * as THREE from './resources/threejs/r127/build/three.module.js';
 
-const state = {
+export const state = {
  width: 300,   // 캔버스 기본값
  height: 150,  // 캔버스 기본값
};
 
-function main(data) {
+export function init(data) {
  const { canvas } = data;
  const renderer = new THREE.WebGLRenderer({ canvas });
```

그리고 Three.js와 관련 없는 부분을 잘라냅니다.

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

방금 잘라낸 부분을 `offscreencanvas-worker-cubes.js`에 붙여넣고, `shared-cubes.js`를 import 합니다. 또한 `main` 대신 `init`을 호출하도록 합니다.

```js
import { init, state } from './shared-cubes.js';

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

메인 페이지에서도 마찬가지로 Three.js와 `shared-cubes.js`를 추가합니다.

```html
<script type="module"></script>
+import { init, state } from './shared-cubes.js';
```

이전에 추가했던 에러 메시지용 HTML과 CSS를 제거합니다.

```html
<body>
  <canvas id="c"></canvas>
-  <div id="noOffscreenCanvas" style="display:none;">
-    <div>no OffscreenCanvas support</div>
-  </div>
</body>
```

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

그리고 `OffscreenCanvas`의 지원 여부에 따라 다른 함수를 실행하도록 합니다.

```js
function main() {
  const canvas = document.querySelector('#c');
-  if (!canvas.transferControlToOffscreen) {
-    canvas.style.display = 'none';
-    document.querySelector('#noOffscreenCanvas').style.display = '';
-    return;
-  }
-  const offscreen = canvas.transferControlToOffscreen();
-  const worker = new Worker('offscreencanvas-picking.js', { type: 'module' });
-  worker.postMessage({ type: 'main', canvas: offscreen }, [ offscreen ]);
+  if (canvas.transferControlToOffscreen) {
+    startWorker(canvas);
+  } else {
+    startMainPage(canvas);
+  }
  ...
```

워커를 만들기 위해 사용했던 코드를 전부 `startWorker` 함수로 옮깁니다.

```js
function startWorker(canvas) {
  const offscreen = canvas.transferControlToOffscreen();
  const worker = new Worker('offscreencanvas-worker-cubes.js', { type: 'module' });
  worker.postMessage({ type: 'main', canvas: offscreen }, [ offscreen ]);

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

메시지에 `'main'` 대신 `'init'`을 보냅니다.

```js
-  worker.postMessage({ type: 'main', canvas: offscreen }, [ offscreen ]);
+  worker.postMessage({ type: 'init', canvas: offscreen }, [ offscreen ]);
```

워커를 사용할 수 없는 경우 다음과 같이 실행합니다.

```js
function startMainPage(canvas) {
  init({ canvas });

  function sendSize() {
    state.width = canvas.clientWidth;
    state.height = canvas.clientHeight;
  }
  window.addEventListener('resize', sendSize);
  sendSize();

  console.log('using regular canvas');
}
```

이제 `OffscreenCanvas를` 지원하는 경우에만 `OffscreenCanvas`를 사용하고, 지원하지 않는 경우에는 메인 스레드에서 직접 렌더링합니다.

{{{example url="../threejs-offscreencanvas-w-fallback.html" }}}

어떤가요? 생각했던 것보다 쉽지 않나요? 여기에 피킹(picking)을 추가해봅시다. [피킹에 관한 글](threejs-picking.html)의 `RayCaster` 예제에서 코드 일부를 가져오도록 하겠습니다.

먼저 `shared-cube.js`의 코드를 `shared-picking.js`로 복사한 뒤, 피킹 예제에서 `PickHelper`를 가져옵니다.

```js
class PickHelper {
  constructor() {
    this.raycaster = new THREE.Raycaster();
    this.pickedObject = null;
    this.pickedObjectSavedColor = 0;
  }
  pick(normalizedPosition, scene, camera, time) {
    // 이미 다른 물체를 피킹했다면 색을 복원합니다
    if (this.pickedObject) {
      this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
      this.pickedObject = undefined;
    }

    // 절두체 안에 광선을 쏩니다
    this.raycaster.setFromCamera(normalizedPosition, camera);
    // 광선과 교차하는 물체들을 배열로 만듭니다
    const intersectedObjects = this.raycaster.intersectObjects(scene.children);
    if (intersectedObjects.length) {
      // 첫 번째 물체가 제일 가까우므로 해당 물체를 고릅니다
      this.pickedObject = intersectedObjects[0].object;
      // 기존 색을 저장해둡니다
      this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
      // emissive 색을 빨강/노랑으로 빛나게 만듭니다
      this.pickedObject.material.emissive.setHex((time * 8) % 2 > 1 ? 0xFFFF00 : 0xFF0000);
    }
  }
}

const pickPosition = { x: 0, y: 0 };
const pickHelper = new PickHelper();
```

`pickPosition`은 마우스 포인터의 좌표를 기록하는 역할입니다. 이벤트를 통해 해당 속성을 업데이트하도록 했었죠.

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
  pickPosition.y = (pos.y / canvas.height) * -2 + 1;  // Y축을 뒤집었음
}
window.addEventListener('mousemove', setPickPosition);
```

워커는 포인터 좌표에 직접 접근할 수 없기에, 반응형 처리에 사용했던 코드처럼 포인터 좌표를 메시지로 보내야 합니다. 먼저 `size` 함수와 마찬가지로 `mouse` 함수를 만들어 `pickPosition`을 업데이트하도록 합니다.

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

그리고 메인 페이지에 분기 함수를 만들어 워커 또는 메인 페이지로 좌표 데이터를 보내도록 합니다.

```js
+let sendMouse;

function startWorker(canvas) {
  const offscreen = canvas.transferControlToOffscreen();
  const worker = new Worker('offscreencanvas-worker-picking.js', { type: 'module' });
  worker.postMessage({ type: 'init', canvas: offscreen }, [ offscreen ]);

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
  init({ canvas });

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

다음으로 마우스 이벤트 관련 코드를 메인 페이지로 옮긴 뒤 `sendMouse` 함수를 쓰도록 수정합니다.

```js
function setPickPosition(event) {
  const pos = getCanvasRelativePosition(event);
-  pickPosition.x = (pos.x / canvas.clientWidth ) *  2 - 1;
-  pickPosition.y = (pos.y / canvas.clientHeight) * -2 + 1;  // Y축을 뒤집었음
+  sendMouse(
+      (pos.x / canvas.clientWidth ) *  2 - 1,
+      (pos.y / canvas.clientHeight) * -2 + 1);  // Y축을 뒤집었음
}

function clearPickPosition() {
  /**
   * 마우스의 경우는 항상 위치가 있어 그다지 큰
   * 상관이 없지만, 터치 같은 경우 사용자가 손가락을
   * 떼면 피킹을 멈춰야 합니다. 지금은 일단 어떤 것도
   * 선택할 수 없는 값으로 지정해두었습니다
   **/
-  pickPosition.x = -100000;
-  pickPosition.y = -100000;
+  sendMouse(-100000, -100000);
}
window.addEventListener('mousemove', setPickPosition);
window.addEventListener('mouseout', clearPickPosition);
window.addEventListener('mouseleave', clearPickPosition);

window.addEventListener('touchstart', (event) => {
  event.preventDefault(); // 스크롤 이벤트 방지
  setPickPosition(event.touches[0]);
}, { passive: false });

window.addEventListener('touchmove', (event) => {
  setPickPosition(event.touches[0]);
});

window.addEventListener('touchend', clearPickPosition);
```

이제 `OffscreenCanvas`에서도 피킹이 정상적으로 작동할 겁니다.

{{{example url="../threejs-offscreencanvas-w-picking.html" }}}

좀 더 욕심을 내 `OrbitControls`까지 추가해봅시다. `OrbitControls`는 DOM에 꽤 다양하게 접근하기에 처리해줘야 할 것이 좀 많습니다. 제대로 작동하려면 마우스 이벤트, 터치 이벤트, 키보드 이벤트를 모두 처리해줘야 하죠.

여태까지는 전역 `state` 객체를 사용했지만, `OrbitControls`의 경우는 객체 속성이 너무 많아 그걸 전부 다 하드 코딩하는 건 너무 번거롭습니다. `OrbitControls`는 필요한 DOM 이벤트의 대부분을 인자로 받는 `HTMLElement`에 바인딩합니다. 이를 이용해 DOM 요소와 같은 구조의 객체를 넘겨준다면 어떨까요? `OrbitControls`에 필요한 기능만 살려서 말이죠.

[`OrbitControls`의 소스 코드](https://github.com/gfxfundamentals/threejsfundamentals/blob/master/threejs/resources/threejs/r127/examples/js/controls/OrbitControls.js)를 분석해보니 아래의 이벤트만 지원하면 될 듯합니다.

* contextmenu
* pointerdown
* pointermove
* pointerup
* touchstart
* touchmove
* touchend
* wheel
* keydown

마우스 이벤트 중 `OrbitControls`가 사용하는 속성은 `ctrlKey`, `metaKey`, `shiftKey`, `button`, `pointerType`, `clientX`, `clientY`, `pageX`, `pageY`이고,

keydown 이벤트의 경우는 `ctrlKey`, `metaKey`, `shiftKey`, `keyCode` 속성,

wheel 이벤트는 `deltaY` 속성만,

터치 이벤트의 경우는 `touches` 속성의 `pageX`, `pageY` 속성이 필요하네요.

이를 처리할 경유(proxy) 객체를 한 쌍 만들어봅시다. 한쪽은 메인 페이지에서 위 이벤트를 받아 필요한 속성을 워커에 넘겨주는 역할을 할 겁니다. 그리고 다른 한쪽은 워커 안에서 이 이벤트를 받아 `OrbitControls`에 넘겨줄 겁니다. 이벤트 객체가 DOM 이벤트와 같은 구조이기에 `OrbitControls`는 이 이벤트가 DOM 이벤트가 아니란 걸 눈치채지 못하겠죠.

아래는 워커 안의 코드입니다.

```js
import { EventDispatcher } from './resources/threejs/r127/build/three.module.js';

class ElementProxyReceiver extends EventDispatcher {
  constructor() {
    super();
  }
  handleEvent(data) {
    this.dispatchEvent(data);
  }
}
```

위 코드는 단순히 메시지를 받았을 때 그걸 다시 내보내는(dispatch) 역할을 합니다. 부모 클래스인 `EventDispatcher`는 DOM 요소처럼 `addEventListener`나 `removeEventListener` 메서드를 제공하기에 HTML 요소 대신 이 클래스의 인스턴스를 넘겨줘도 문제없이 작동할 겁니다.

`ElementProxyReceiver`는 하나의 요소만 대신할 수 있습니다. 예제의 경우 하나만 필요하기는 하나 나중에 캔버스를 여러 개 사용할 수도 있으니 여러 `ElementProxyReceiver`를 관리하는 클래스를 만들겠습니다.

```js
class ProxyManager {
  constructor() {
    this.targets = {};
    this.handleEvent = this.handleEvent.bind(this);
  }
  makeProxy(data) {
    const { id } = data;
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

`ProxyManager`의 인스턴스를 만들고 id값과 함께 `makeProxy` 메서드를 호출하면 해당 id에만 응답하는 `ElementProxyReceiver`가 생성됩니다.

이제 이 클래스를 기존 워커 코드와 연동해봅시다.

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

Three.js의 공통 코드에 `OrbitControls` 모듈도 불러와 설정해야 합니다.

```js
import * as THREE from './resources/threejs/r127/build/three.module.js';
+import { OrbitControls } from './resources/threejs/r127/examples/jsm/controls/OrbitControls.js';

export function init(data) {
-  const { canvas } = data;
+  const { canvas, inputElement } = data;
  const renderer = new THREE.WebGLRenderer({ canvas });

+  const controls = new OrbitControls(camera, inputElement);
+  controls.target.set(0, 0, 0);
+  controls.update();
```

위 코드에서는 이전과 달리 `inputElement`로 경유 객체를 `OrbitControls`에 넘겨줬습니다.

하는 김에 피킹 이벤트도 경유 객체를 사용하도록 바꿉니다.

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
-      (pos.y / canvas.clientHeight) * -2 + 1);  // Y축을 뒤집었음
+  pickPosition.x = (pos.x / inputElement.clientWidth ) *  2 - 1;
+  pickPosition.y = (pos.y / inputElement.clientHeight) * -2 + 1;  // Y축을 뒤집었음
}

function clearPickPosition() {
  /**
   * 마우스의 경우는 항상 위치가 있어 그다지 큰
   * 상관이 없지만, 터치 같은 경우 사용자가 손가락을
   * 떼면 피킹을 멈춰야 합니다. 지금은 일단 어떤 것도
   * 선택할 수 없는 값으로 지정해두었습니다
   **/
-  sendMouse(-100000, -100000);
+  pickPosition.x = -100000;
+  pickPosition.y = -100000;
}

*inputElement.addEventListener('mousemove', setPickPosition);
*inputElement.addEventListener('mouseout', clearPickPosition);
*inputElement.addEventListener('mouseleave', clearPickPosition);

*inputElement.addEventListener('touchstart', (event) => {
  event.preventDefault(); // 스크롤 이벤트 방지
  setPickPosition(event.touches[0]);
}, { passive: false });

*inputElement.addEventListener('touchmove', (event) => {
  setPickPosition(event.touches[0]);
});

*inputElement.addEventListener('touchend', clearPickPosition);
```

메인 페이지에서 위에 열거한 모든 이벤트가 워커로 메시지를 보내도록 합니다.

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

    // id를 등록합니다.
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

`ElementProxy`는 이벤트를 우회할 요소(element)를 인자로 받습니다. 그리고 고유 id를 생성해 워커에 `makeProxy` 메시지로 id를 등록합니다. 그러면 아까 만들었듯 워커는 이 id에 새로운 `ElementProxyReceiver`를 생성하겠죠.

다음으로 이벤트를 처리할 핸들러 맵(`eventHandlers`)을 만듭니다. 이러면 해당 이벤트가 발생했을 때만 워커에 메시지를 보낼 수 있죠.

워커를 생성할 때 `ElementProxy`에 이 핸들러 맵을 넘겨 새 우회 요소를 생성합니다.

```js
function startWorker(canvas) {
  const offscreen = canvas.transferControlToOffscreen();
  const worker = new Worker('offscreencanvas-worker-orbitcontrols.js', { type: 'module' });

+  const eventHandlers = {
+    contextmenu: preventDefaultHandler,
+    mousedown: mouseEventHandler,
+    mousemove: mouseEventHandler,
+    mouseup: mouseEventHandler,
+    pointerdown: mouseEventHandler,
+    pointermove: mouseEventHandler,
+    pointerup: mouseEventHandler,
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
  }, [ offscreen ]);
  console.log('using OffscreenCanvas');  /* eslint-disable-line no-console */
}
```

핸들러 맵의 핸들러는 넘겨 받은 이벤트의 속성 중 넘겨 받은 키 배열에 해당하는 속성만 복사합니다. 그리고 `ElementProxy`에서 넘겨 받은 `sendEvent` 함수를 복사한 데이터와 함께 호출하죠. 그러면 `sendEvent` 함수는 해당하는 id와 데이터를 워커에 보냅니다.

```js
const mouseEventHandler = makeSendPropertiesHandler([
  'ctrlKey',
  'metaKey',
  'shiftKey',
  'button',
  'pointerType',
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
    const data = { type: event.type };
    copyProperties(event, properties, data);
    sendFn(data);
  };
}

function touchEventHandler(event, sendFn) {
  const touches = [];
  const data = { type: event.type, touches };
  for (let i = 0; i < event.touches.length; ++i) {
    const touch = event.touches[i];
    touches.push({
      pageX: touch.pageX,
      pageY: touch.pageY,
    });
  }
  sendFn(data);
}

// 키보드의 화살표 키
const orbitKeys = {
  '37': true,  // 왼쪽
  '38': true,  // 위쪽
  '39': true,  // 오른쪽
  '40': true,  // 아래쪽
};
function filteredKeydownEventHandler(event, sendFn) {
  const { keyCode } = event;
  if (orbitKeys[keyCode]) {
    event.preventDefault();
    keydownEventHandler(event, sendFn);
  }
}
```

거의 다 된 듯합니다. 하지만 실제로 예제를 실행해보니 아직 처리해줘야 할 것들이 몇 개 더 있네요.

`OrbitControls`는 `element.focus` 메서드를 호출합니다. 이는 워커에서 그다지 쓸모가 없으니 빈 함수로 대체하겠습니다.

```js
class ElementProxyReceiver extends THREE.EventDispatcher {
  constructor() {
    super();
  }
  handleEvent(data) {
    this.dispatchEvent(data);
  }
+  focus() {
+    // 빈 함수(no-operation)
+  }
}
```

`event.preventDefault`와 `event.stopPropagation`도 사용합니다. 이는 이미 메인 페이지에서 처리했으니 이 역시 빈 함수로 대체합니다.

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
    // 빈 함수(no-operation)
  }
}
```

또 `clientWidth`와 `clientHeight`도 사용합니다. 이전에는 캔버스의 크기값을 따로 넘겨줬었는데, 경유 객체들이 이 값도 주고받도록 수정하겠습니다.

워커의 경우 다음처럼 코드를 추가합니다.

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
    // 빈 함수(no-operation)
  }
}
```

이제 메인 페이지에서 캔버스의 크기와 위치 좌표를 넘겨줘야 합니다. 하나 언급하고 싶은 건 예제에서는 캔버스의 크기가 바뀌는 경우만 가정했지, 캔버스가 움직이는 경우는 가정하지 않았다는 점입니다. 캔버스가 움직이는 경우를 처리하려면 캔버스가 움직였을 때 `sendSize`를 호출하면 됩니다.

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

    // id를 등록합니다.
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

이제 공통 Three.js 코드에서 `state` 전역 변수를 쓰지 않으니 삭제합니다.

```js
-export const state = {
-  width: 300,   // 캔버스 기본값
-  height: 150,  // 캔버스 기본값
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

`OrbitControls`는 마우스 이벤트를 감지하기 위해 해당 요소의 `ownerDocument`에 `pointermove`와 `pointerup` 리스너를 추가합니다(마우스가 창 밖으로 나갔을 경우를 위해).

또한 코드는 전역 `document` 객체를 참조하지만 워커에는 전역 `document` 객체가 없습니다.

이 문제는 간단한 편법(hack)을 써 해결할 수 있습니다. 다시 한 번 워커의 경유 객체를 이용하도록 하죠.

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

이러면 `OrbitControls`가 에러를 던지지 않을 겁니다.

예제가 복잡해 이해하기 어려웠을 수 있습니다. 동작을 요약하자면 `ElementProxy`가 메인 페이지의 DOM 이벤트를 워커의 `ElementProxyReceiver`에 넘기고, `ElementProxyReceiver`는 `HTMLElement`를 가장해 `OrbitControls`와 공통 코드에서 쓸 수 있는 대체 DOM 요소로 기능합니다.

마지막으로 `OffscreenCanvas`를 지원하지 않는 경우의 예외 코드만 수정해주면 끝입니다. 간단히 `inputElement`에 캔버스 요소자체를 넘겨주기만 하면 되죠.

```js
function startMainPage(canvas) {
-  init({ canvas });
+  init({ canvas, inputElement: canvas });
  console.log('using regular canvas');
}
```

이제 `OffscreenCanvas`에서도 `OrbitControls`가 잘 작동합니다.

{{{example url="../threejs-offscreencanvas-w-orbitcontrols.html" }}}

아마 이 예제가 이 시리즈를 통틀어 가장 복잡한 예제일 겁니다. 각 예제마다 HTML 파일, 워커 파일, 공통 Three.js 코드 파일, 이렇게 파일 3개가 서로 연동되니 그럴만 하죠.

이 글이 너무 어렵게 느껴지지 않았다면 좋겠습니다. 또한 Three.js에서 OffscreenCanvas와 웹 워커를 활용하는 좋은 예가 되었길 바랍니다.
