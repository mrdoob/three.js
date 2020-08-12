Title: Three.js 자바스크립트 디버깅
Description: Three.js에서 자바스크립트 디버깅하는 법을 알아봅니다
TOC: 자바스크립트 디버깅

이 글은 Three.js에 한정된 글이 아닙니다. 보다는 자바스크립트를 디버깅하는 일반적인 방법이라고 하는 편이 적당하죠. Three.js를 배우려는 분들 중에는 자바스크립트도 처음 접하는 분들이 더러 있는데, 이 글이 그런 분들에게 도움이 되었으면 좋겠네요.

디버깅은 방대한 주제라 여기서 모든 부분을 다루기는 어렵습니다. 이 글에서는 자바스크립트 입문자의 경우를 가정해 몇 가지 중요한 부분을 짚고 넘어갈 겁니다. 디버깅은 나중에 무엇을 배우든 도움이 되니 시간을 들여 꼭 살펴보기 바랍니다.

## 브라우저 개발자 도구

[크롬](https://developers.google.com/web/tools/chrome-devtools/), [파이어폭스](https://developer.mozilla.org/ko/docs/Tools), [사파리](https://developer.apple.com/safari/tools/), [엣지](https://docs.microsoft.com/en-us/microsoft-edge/devtools-guide) 등 모든 브라우저에는 개발자 도구가 있습니다.

크롬에서는 `⋮` 아이콘을 클릭해 "도구 더보기 -> 개발자 도구"를 선택하면 개발자 도구를 열 수 있습니다. 기본 단축키도 거기에 같이 표시되죠.

<div class="threejs_center"><img class="border" src="resources/images/devtools-chrome.jpg" style="width: 789px;"></div>

파이어폭스에서는 `☰` 아이콘을 클린한 뒤 "웹 개발자 -> 도구 표시/숨기기"를 선택하면 됩니다.

<div class="threejs_center"><img class="border" src="resources/images/devtools-firefox.jpg" style="width: 786px;"></div>

사파리는 먼저 고급 설정에서 개발자 메뉴를 활성화해야 합니다.

<div class="threejs_center"><img class="border" src="resources/images/devtools-enable-safari.jpg" style="width: 775px;"></div>

그리고 개발자 메뉴에서 "Show/Connect Web Inspector"를 선택하면 되죠.

<div class="threejs_center"><img class="border" src="resources/images/devtools-safari.jpg" style="width: 777px;"></div>

크롬의 경우는 [PC 버젼 크롬을 이용해 안드로이드 기기의 크롬을 디버깅](https://developers.google.com/web/tools/chrome-devtools/remote-debugging/)할 수 있습니다. 사파리에서도 [macOS 컴퓨터에서 아이폰이나 아이패드의 사파리를 디버깅](https://www.google.com/search?q=safari+remote+debugging+ios)할 수 있죠.

저는 크롬이 더 익숙하기에 크롬을 기준으로 설명하겠습니다. 다른 브라우저들도 다 비슷한 기능이 있으니 그다지 어렵지 않게 배운 걸 써먹을 수 있을 거예요.

## 캐시 끄기

브라우저는 내려 받은 데이터를 재사용합니다. 사용자 입장에서는 사이트를 두 번 이상 방문했을 때 파일을 다시 다운 받지 않아도 되니 환영할 일이죠.

하지만 개발자의 입장에서는 이 기능이 불편할 수 있습니다. 파일을 수정한 뒤 페이지를 새로고침해도 브라우저가 캐시로 저장된 파일을 사용해 수정된 내용이 반영되지 않기 때문이죠.

웹 개발을 하는 동안 캐싱을 비활성화 하면 이 문제를 해결할 수 있습니다. 이러면 브라우저가 항상 파일의 최신 버젼을 받아 사용하죠.

먼저 개발자 도구의 메뉴에서 설정을 선택한 뒤

<div class="threejs_center"><img class="border" src="resources/images/devtools-chrome-settings.jpg" style="width: 778px"></div>

"Disable Cache (while DevTools is open)"을 선택합니다(개발자 도구가 열렸을 때 캐시 비활성화).

<div class="threejs_center"><img class="border" src="resources/images/devtools-chrome-disable-cache.jpg" style="width: 779px"></div>

## 자바스크립트 콘솔

개발자 도구에는 **console**이라는 탭이 있습니다. 여기에 각종 경고나 오류 메시지가 출력되죠.

Three.js를 사용하는 경우 1개 내지 2개의 메시지가 보이는 게 정상입니다.

<div class="threejs_center"><img class="border" src="resources/images/devtools-no-errors.jpg" style="width: 779px"></div>

다른 메시지가 보인다면 이를 확인해봐야 합니다. 예를 들어 아래와 같은 경우

<div class="threejs_center"><img class="border" src="resources/images/devtools-errors.jpg" style="width: 779px"></div>

오타가 났습니다. "three"를 "threee"로 잘못 썼죠.

뿐만 아니라 `console.log`로 직접 메시지를 출력할 수도 있습니다.

```js
console.log(someObject.position.x, someObject.position.y, someObject.position.z);
```

살펴보고 싶은 객체를 출력할 수도 있습니다. 예를 들어 [glTF 불러오기](threejs-load-gltf.html)의 예제에서 root 장면(scene) 요소를 출력해보죠.

```js
  {
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('resources/models/cartoon_lowpoly_small_city_free_pack/scene.gltf', (gltf) => {
      const root = gltf.scene;
      scene.add(root);
+      console.log(root);
```

이제 자바스크립트 콘솔에서 해당 객체를 펼쳐 볼 수 있습니다.

<div class="threejs_center"><img class="border" src="resources/images/devtools-console-object.gif"></div>

이외에도 `console.error`를 이용해 빨간 에러 메시지, `console.warn`을 이용해 노란 경고 메시지 등을 띄울 수 있습니다.

## 화면에 데이터 띄우기

이는 아주 간단하지만 사람들이 쉽게 떠올리지 못하는 방법입니다. `<div>`와 `<pre>` 태그를 이용해 데이터를 화면에 출력하는 것이죠.

가장 쉬운 방법은 HTML 요소를 몇 개 만들고

```html
<canvas id="c"></canvas>
+<div id="debug">
+  <div>x:<span id="x"></span></div>
+  <div>y:<span id="y"></span></div>
+  <div>z:<span id="z"></span></div>
+</div>
```

캔버스 위에 올라가도록 스타일을 지정하는 겁니다(캔버스가 화면을 꽉 채웠다고 가정합니다).

```html
<style>
#debug {
  position: absolute;
  left: 1em;
  top: 1em;
  padding: 1em;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  font-family: monospace;
}
</style>
```

그런 다음 요소들을 참조해 각 요소에 텍스트를 지정합니다.

```js
// 초기화 시
const xElem = document.querySelector('#x');
const yElem = document.querySelector('#y');
const zElem = document.querySelector('#z');

// 렌더링 루프나 업데이트 시
xElem.textContent = someObject.position.x.toFixed(3);
yElem.textContent = someObject.position.y.toFixed(3);
zElem.textContent = someObject.position.z.toFixed(3);
```

런타임에 값을 체크할 때 유용합니다.

{{{example url="../threejs-debug-js-html-elements.html" }}}

일회용 로그 버퍼(one-time log buffer)\*를 만드는 것도 한 방법입니다. 일회용 로그 버퍼라는 이름은 제가 대충 지은 것이지만, 많은 게임들이 이 방법을 사용합니다. 일회용이라는 말처럼 이 방법은 지정한 메시지를 한 프레임 동안만 보여줍니다. 데이터를 출력할 부분에서 직접 매 프레임마다 메시지를 버퍼에 추가해야 하죠. 메시지마다 HTML 요소를 따로 만들었던 위 방법에 비하면 훨씬 경제적입니다.

※ 일회용 로그 버퍼: 원문에서는 clearing logger라고 썼습니다. 역주.

먼저 위 HTML 예제를 아래처럼 수정합니다.

```html
<canvas id="c"></canvas>
<div id="debug">
  <pre></pre>
</div>
```

그리고 버퍼의 *추가/초기화*를 관리하는 간단한 클래스를 만듭니다.

```js
class ClearingLogger {
  constructor(elem) {
    this.elem = elem;
    this.lines = [];
  }
  log(...args) {
    this.lines.push([...args].join(' '));
  }
  render() {
    this.elem.textContent = this.lines.join('\n');
    this.lines = [];
  }
}
```

간단한 예제를 하나 만들어봅시다. 화면을 클릭했을 때 포인터 위치에 mesh를 만들고 2초 동안 무작위 방향으로 움직인 후 사라지도록 하겠습니다. 먼저 [반응형 디자인](threejs-responsive.html)에서 썼던 예제를 가져옵니다.

아래는 화면을 클릭할 때마다 `Mesh`를 추가하는 코드입니다.

```js
const geometry = new THREE.SphereBufferGeometry();
const material = new THREE.MeshBasicMaterial({ color: 'red' });

const things = [];

function rand(min, max) {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return Math.random() * (max - min) + min;
}

function createThing() {
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  things.push({
    mesh,
    timer: 2,
    velocity: new THREE.Vector3(rand(-5, 5), rand(-5, 5), rand(-5, 5)),
  });
}

canvas.addEventListener('click', createThing);
```

아래는 생성한 mesh를 움직이고, 메시지를 출력한 뒤 일정 시간이 지났을 때 해당 요소를 제거하는 코드입니다.

```js
const logger = new ClearingLogger(document.querySelector('#debug pre'));

let then = 0;
function render(now) {
  now *= 0.001;  // 초 단위로 변환
  const deltaTime = now - then;
  then = now;

  ...

  logger.log('fps:', (1 / deltaTime).toFixed(1));
  logger.log('num things:', things.length);
  for (let i = 0; i < things.length;) {
    const thing = things[i];
    const mesh = thing.mesh;
    const pos = mesh.position;
    logger.log(
        'timer:', thing.timer.toFixed(3), 
        'pos:', pos.x.toFixed(3), pos.y.toFixed(3), pos.z.toFixed(3));
    thing.timer -= deltaTime;
    if (thing.timer <= 0) {
      // 해당 요소를 제거합니다. i를 증가시키지 않았다는 점에 유의하세요.
      things.splice(i, 1);
      scene.remove(mesh);
    } else {
      mesh.position.addScaledVector(thing.velocity, deltaTime);
      ++i;
    }
  }

  renderer.render(scene, camera);
  logger.render();

  requestAnimationFrame(render);
}
```

예제를 빠르게 클릭하면 많은 데이터가 한 번에 나타날 겁니다.

{{{example url="../threejs-debug-js-clearing-logger.html" }}}

## 쿼리 파라미터(Query Parameters)

웹에서는 쿼리 파라미터(?, &)나 앵커(#)로 데이터를 넘겨줄 수 있습니다. 이들은 search, 해시(hash)라고 불리기도 하죠.

```text
    https://domain/path/?query#anchor
```

예를 들어 이전 예제를 URL에 `?debug=true`가 있을 때만 디버깅 요소가 보이도록 해보겠습니다.

먼저 쿼리를 파싱하는 코드를 만듭니다.

```js
/**
  * 쿼리 파라미터를 키/값 객체로 반환합니다.
  * 예를 들어 쿼리 파라미터가 다음과 같다면
  *
  *    abc=123&def=456&name=gman
  *
  * `getQuery()`는 다음과 같은 객체를 반환합니다.
  *
  *    {
  *      abc: '123',
  *      def: '456',
  *      name: 'gman',
  *    }
  */
function getQuery() {
  return Object.fromEntries(new URLSearchParams(window.location.search).entries());
}
```

다음으로 디버깅 요소가 미리 보이지 않도록 합니다.

```html
<canvas id="c"></canvas>
+<div id="debug" style="display: none;">
  <pre></pre>
</div>
```

앞서 작성했던 예제에서 쿼리 파라미터를 읽어 `?debug=true`일 때만 디버깅 요소가 보이도록 합니다.

```js
const query = getQuery();
const debug = query.debug === 'true';
const logger = debug
   ? new ClearingLogger(document.querySelector('#debug pre'))
   : new DummyLogger();
if (debug) {
  document.querySelector('#debug').style.display = '';
}
```

`?debug=true`가 아닐 때 사용할 `DummyLogger`도 만듭니다.

```js
class DummyLogger {
  log() {}
  render() {}
}
```

아래와 같은 url로 접근하면 아무것도 보이지 않습니다.

<a target="_blank" href="../threejs-debug-js-params.html">threejs-debug-js-params.html</a>

대신 아래 url을 쓰면

<a target="_blank" href="../threejs-debug-js-params.html?debug=true">threejs-debug-js-params.html?debug=true</a>

디버깅 요소가 제대로 보입니다.

파라미터를 여러 개 전달할 때는 `아무페이지.html?키=값&다른키=다른값`처럼 각 항목을 '&'로 구분하면 됩니다. 파라미터를 사용하면 다양한 값을 지정할 수 있습니다. `speed=0.01`을 넘겨 받아 앱의 속도를 느리게 할 수도 있고 `showHelpers=true` 같은 값을 넘겨 받아 다른 글에서 다뤘던 조명, 그림자, 카메라의 절두체 등의 헬퍼 객체를 보이게 할 수도 있죠.

## 디버거 사용법을 익혀라

브라우저에는 전부 디버거가 있어 프로그램을 줄 단위로 실행하며 모든 변수를 검사할 수 있습니다.

디버거의 사용법은 너무 큰 주제이기에 이 글에서 전부 설명하기 어려우니 아래 링크를 참고하시기 바랍니다.

* [크롬 개발자도구에서 자바스크립트 디버깅하기](https://developers.google.com/web/tools/chrome-devtools/javascript/)
* [Debugging in Chrome](https://javascript.info/debugging-chrome)
* [Tips and Tricks for Debugging in Chrome Developer Tools](https://hackernoon.com/tips-and-tricks-for-debugging-in-chrome-developer-tools-458ade27c7ab)

## 디버거 등에서 `NaN`을 확인해라

`NaN`은 Not a Number(숫자가 아님)의 줄임말입니다. 자바스크립트가 수학적으로 연산할 수 없는 식이 주어졌을 때 반환하는 값이죠.

아래는 간단한 예입니다.

<div class="threejs_center"><img class="border" src="resources/images/nan-banana.png" style="width: 180px;"></div>

저도 무언가를 만들다 화면에 아무것도 보이는 게 없으면 `NaN`이 있는지 확인합니다. 만약 `NaN`이 있다면 해당 부분부터 다시 살펴 보기 시작하죠.

[glTF 파일 불러오기](threejs-load-gltf.html)에서 처음 패스를 그렸을 때 `SplineCurve` 클래스로 2D 곡선을 만들었던 것, 기억하나요?

처음에 이 곡선을 이용해 자동차를 움직였었죠.

```js
curve.getPointAt(zeroToOnePointOnCurve, car.position);
```

이때 `curve.getPointAt`은 내부적으로 두 번째 인자로 넘겨준 객체의 `set` 메서드를 호출합니다. 이 경우 인자로 넘겨준 객체는 `car.position`, `Vector3`이죠. `Vector3`의 `set` 메서드에는 x, y, z 세 가지 인자를 넘겨줘야 합니다. 하지만 `SplineCurve`는 2D이기에 `car.position.set` 메서드에 x와 y 값만 넘겨줍니다.

이러면 x, y의 값은 넘겨 받은 값으로 지정되나, z는 `undefined`로 지정될 겁니다.

디버거에서 자동차의 `matrixWorld`를 살펴 보니 `NaN`으로 지정된 값이 많이 보입니다.

<div class="threejs_center"><img class="border" src="resources/images/debugging-nan.gif" style="width: 476px;"></div>

행렬 좌표(matrix)에 `NaN`이 있다는 것은 `position`, `rotation`, `scale` 등의 속성이나 행렬 좌표에 영향을 미치는 함수에 잘못된 데이터가 지정되었다는 것을 의미합니다. 여기서부터 추적해 올라가면 어디가 문제인지 쉽게 찾을 수 있겠죠.

자바스크립트 숫자에는 `NaN`뿐만 아니라 `Infinity`라는 값도 있습니다. 이 역시 많은 버그의 주범이 될 수 있죠.

## 코드를 까봐라!

Three.js는 오픈 소스입니다. 두려워 말고 코드를 한 번 까보세요! [깃허브](https://github.com/mrdoob/three.js)에서 소스 코드를 살펴 보거나, 디버거에서 함수를 차례대로 추적해 볼 수도 있습니다. 이때 개발 단계에서는 `three.min.js`가 아닌 `three.js`를 쓰는 것을 추천합니다. 왜냐하면 `three.min.js`는 용량을 줄이기 위해 난독화와 압축이 적용된 형태거든요. `three.js`가 용량이 더 크긴 하지만 디버깅에는 훨씬 유리합니다. 저도 문제가 있을 때는 대부분 `three.js`를 사용해 코드를 단계별로 살펴보는 편입니다.

## `requestAnimationFrame`을 렌더링 가장 마지막에 넣어라

다른 사람의 코드를 보다보면 아래와 같은 형식을 자주 봅니다.

```js
function render() {
   requestAnimationFrame(render);

   // -- 주절주절 --

   renderer.render(scene, camera);
}
requestAnimationFrame(render);
```

하지만 저는 이 시리즈의 처음에서부터 `requestAnimationFrame`을 아래에 배치했습니다.

```js
function render() {
   // -- 주절주절 --

   renderer.render(scene, camera);

   requestAnimationFrame(render);
}
requestAnimationFrame(render);
```

이런 방식을 사용한 가장 중요한 이유는, 이래야 에러가 났을 때 코드를 멈출 수 있기 때문입니다. `requestAnimationFrame`을 상단에서 실행하면 에러가 나기 전에 이미 다른 프레임을 요청한 것이므로, 에러가 반복해 나타날 수 있습니다. 개인적인 생각이긴 하지만, 에러를 단순히 무시해버리는 것보다 문제를 찾아 고치는 게 훨씬 나을 겁니다. 에러 때문에 뭔가 제대로 실행되지 않는데 프로그램이 멈추지 않는다면 문제가 있는지조차 모를 수 있으니까요.

## 단위를 확인하라!

이는 예를 들어 언제 도(degree)를 사용해야 하는지, 언제 라디안(호도, radian)을 사용해야 하는지 알아야 한다는 의미입니다. 아쉽게도 Three.js는 모든 부분에서 같은 단위를 사용하지 않습니다. 당장 생각나기로는 카메라의 시야각(fov, field of view)이 도를 사용하는군요. 나머지 각도는 전부 라디안을 사용합니다.

길이 단위도 중요한 요소입니다. 최근까지도 3D 앱은 길이 단위를 자유롭게 선택할 수 있었습니다. 어떤 앱은 1칸 = 1cm를 썼고 어떤 앱은 1칸 = 1피트를 썼죠. 물론 지금도 길이 단위를 얼마든지 자유롭게 설정할 수 있습니다. Three.js는 기본적으로 1칸 = 1미터로 가정하는데, 물리 기반 렌더링 같은 경우는 조명의 세기를 미터로 설정하니 특히 더 신경을 써야 합니다. 증강현실(AR)이나 가상현실(VR) 같은 경우에도 사용자와 컨트롤러 사이의 거리를 알아야 하니 실제 세계의 단위를 잘 적용해야 하죠.

## 질문할 때 *최소한으로, 완성된, 테스트할 수 있는 예제*를 만들어라

Three.js에 관해 질문할 때는 MCVE에 맞춰 최소한으로(Minimal), 완성된(Complete), 테스트할 수 있는(Verifiable) 예제(Example)를 포함해야 합니다.

**최소한으로** 만드는 게 가장 중요합니다. 예를 들어 여러분이 [glTF 파일 불러오기](threejs-load-gltf.html)에서 경로를 자동차를 따라가게 하는 데 어려움을 겪는다고 해보죠. 이 예제에는 아주 많은 요소가 있습니다. 대충 목록을 만들어보죠.

1. HTML 한 묶음
2. CSS 약간
3. 조명
4. 그림자
5. 그림자를 조작하는 dat.GUI
6. .gltf 파일을 불러오는 코드
7. 캔버스를 리사이징하는 코드
8. 자동차가 경로를 따라 움직이도록 하는 코드

꽤 많은 양의 코드네요. 만약 오로지 경로를 따라가는 부분에 대해서만 질문할 거라면 `<canvas>`와 `<script>`를 제외한 나머지 HTML은 없어도 될 겁니다. .gltf 파일도 마찬가지로 불필요하죠. 조명과 그림자를 없애고 `MeshBasicMaterial`을 사용할 수도, dat.GUI를 제거할 수도 있습니다. 차라리 `GridHelper`를 쓰는 게 훨씬 간단하겠네요. 마지막으로 물체가 경로를 따라 움직이는 부분만 질문하니 자동차 대신 육면체를 써도 될 겁니다.

아래는 위 요소를 모두 고려한 예제입니다. 원래 271줄이었던 코드를 135줄로 줄였죠. 21개 점으로 이루어진 복잡한 경로 대신 3개 혹은 4개의 점만 사용하는 간단한 경로를 사용해 코드를 더 줄일 수도 있을 겁니다.

{{{example url="../threejs-debugging-mcve.html" }}}

`OrbitController`를 그대로 둔 건 카메라를 움직이는 등 단순히 다른 사람의 편의를 위해서지만, 경우에 따라서는 저것도 제거할 수 있을 겁니다.

MCVE의 장점은 이렇게 예제를 만들다 문제가 해결되기도 한다는 겁니다. 불필요한 요소를 제거하고 에러를 재현할 수 있는 가장 작은 코드를 짜다 보면 문제의 원인이 밝혀지는 경우가 꽤 많거든요.

거기다 MCVE는 답변자에 대한 예의이기도 합니다. 최소한의 예제를 만들어 다른 사람이 여러분의 문제 해결을 돕기 쉽도록 배려하는 것이죠. 이 과정에서 배우는 것도 많고요.

또한 스택 오버플로우에서 질문글을 올릴 때 **[코드의 일부분(snippet)](https://stackoverflow.blog/2014/09/16/introducing-runnable-javascript-css-and-html-code-snippets/)을 올리는 것**도 굉장히 중요합니다. 물론 JSFiddle이나 Codepen 또는 비슷한 사이트를 써 여러분이 만든 MVCE를 테스트하게끔 할 수도 있죠. 하지만 스택 오버플로우에서 글 쓰기를 눌러보면 **질문 자체**에 코드 일부를 붙여넣는 게 필수 조건라는 것을 알 수 있습니다. 코드의 일부분을 집어 넣어야만 해당 조건이 만족되죠.

혹시나 해서 말해두지만, 이 사이트의 예제들로 질문할 때는 코드의 모든 부분을 확인해야 합니다. HTML, CSS, 자바스크립트를 전부 [스니펫(snippet) 에디터](https://stackoverflow.blog/2014/09/16/introducing-runnable-javascript-css-and-html-code-snippets/)에 넣으면 되죠. 추가로 궁금한 부분과 관련된 코드만 남기고 나머지는 없애 코드를 최소한으로 만드는 것만 기억하기 바랍니다.

이 정도만 따르면 질문에 대한 답변을 받는 게 그다지 어렵지 않을 겁니다.

## `MeshBasicMaterial`을 사용하라

`MeshBasicMaterial`은 조명의 영향을 받지 않습니다. 때문에 재질(material)을 이걸로 바꾸면 보이지 않았던 물체가 보이는 경우가 있죠. 만약 어떤 물체가 `MeshBasicMaterial`을 적용했을 때는 잘 나타나는데 다른 재질로 바꾸면 나타나지 않는다면, 해당 문제는 재질이나 조명 또는 다른 외부 요소 때문일 겁니다.

## 카메라의 `near`와 `far` 설정을 확인하라

[카메라에 관한 글](threejs-cameras.html)에서 다뤘듯, `PerspectiveCamera`에는 `near`와 `far` 설정이 있습니다. 다른 것보다 먼저 장면 요소를 전부 담을 수 있도록 이 값들을 설정하세요. **임시로라도** `near`를 0.001, `far`를 1000000 등 임의의 큰 값으로 설정한다면 깊이에 따른 해상도 문제가 나타날 겁니다. 오직 카메라에 가까운 물체만 제대로 보이겠죠.

## 장면이 카메라 앞에 있는지 확인하라

장면이 화면에 나타나지 않는 경우, 장면이 카메라 앞에 없는 게 원인일 때도 있습니다. 만약 카메라를 조작할 수 없다면 `OrbitController` 같은 액션을 추가해 카메라를 돌려 보기 바랍니다. 또는 제가 [이 글](threejs-load-obj.html)에서 다뤘던 것처럼 카메라가 장면 전체를 담도록 해보세요. 제가 저 글에서 쓴 코드는 장면의 요소를 찾아 해당 요소를 전부 담도록 카메라의 위치와 `near`, `far` 값을 조정합니다. 저 코드에서 디버거를 사용하거나, `console.log`를 추가해 요소의 크기나 장면의 중점을 출력해 볼 수도 있죠.

## 뭐든 카메라 앞에 배치해봐라

이건 문제가 생겼는데 어떤 점이 문제일지 모를 때, 하나씩 천천히 요소를 추가해보라는 말입니다. 만약 코드를 실행했는데 장면에 아무것도 보이지 않는다면 카메라 바로 앞에 간단한 요소를 배치해보세요. 구체나 육면체를 만들어 `MeshBasicMaterial` 같이 단순한 재질을 지정해 화면에 제대로 뜨는지 확인하는 겁니다. 그런 다음 시간을 들여 다른 요소들을 하나하나 추가해 나가는 거죠. 이러다보면 버그가 다시 나타나거나 어떤 게 문제인지 알 수 있을 겁니다.

---

여기까지 자바스크립트를 디버깅하는 몇 가지 팁을 살펴봤습니다. 다음 글에서는 [GLSL을 디버깅하는 몇 가지 팁](threejs-debugging-glsl.html)에 대해 알아보겠습니다.
