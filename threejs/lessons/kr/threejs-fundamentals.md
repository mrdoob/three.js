Title: Three.js란?
Description: Three.js의 기본 구조와 사용법을 익힙니다
TOC: Three.js란?

Three.js 입문하신 것을 환영합니다!
[Three.js](https://threejs.org)는 웹페이지에 3D 객체를 쉽게
렌더링하도록 도와주는 자바스크립트 3D 라이브러리입니다.

대부분의 경우 Three.js는 3D 객체를 렌더링하는 데 WebGL을 사용합니다.
때문에 Three.js = WebGL이라고 착각하기 쉽죠.
하지만 [WebGL은 점, 선, 삼각형만을 그리는 아주 단순한 시스템입니다](https://webglfundamentals.org).
WebGL로 직접 무언가를 만들려면 상당히 많은 양의 코드를 짜야 하죠.
만약 씬(scenes), 광원, 그림자, 물체, 텍스처 등 3차원 세계를 구현한다면 머리도 꽤 복잡하겠거니와
코드 자체도 굉장히 복잡할 겁니다.
Three.js는 이런 3D 요소들의 처리를 도와 직관적인 코드를 짤 수 있도록 해줍니다.

본 튜토리얼은 ES2015 문법을 적극적으로 사용할 것이므로,
여러분이 이미 최신 자바스크립트에 능숙하다는 가정 아래에 진행합니다.
자세한 내용에 대해서는 [먼저 알아야 할 것](threejs-prerequisites.html)을 참고하세요.
대부분의 모던 브라우저가 자동 업데이트 기능을 사용하므로,
특이한 환경이 아니라면 예시에 나온 코드를 실행하는 데 문제가 없을 것입니다.
만약 구형 브라우저에서도 코드가 실행되길 원한다면, [바벨(Babel)](https://babeljs.io)
같은 트랜스파일러를 찾아보세요. 물론 너무 오래된 엔진을 사용하는 브라우저에서는
Three.js를 아예 구동하지 못할 수 있습니다.

새로운 프로그래밍 언어를 배울 때, `"Hello World!"`를 출력하며 시작했던 것을 기억하나요?
Three.js는 3차원 세계를 다루므로, 우리는 정육면체(cube)를 3차원으로 구현하는 것으로 튜토리얼을
시작하고자 합니다. 이른바 "Hello Cube"라는 것이죠!

하지만 먼저 Three.js 앱의 구조부터 간략히 살펴보죠. Three.js 앱을 만들려면
다양한 객체를 생성해 연결해야 합니다. 아래는 Three.js 앱의 구조를 도식화한 것입니다.

<div class="threejs_center"><img src="resources/images/threejs-structure.svg" style="width: 768px;"></div>

위 도표에서 중요한 것들을 추려보죠.

* 먼저 `Renderer`가 있습니다. Three.js의 핵심 객체이죠. `Renderer`는
  `Scene`과 `Camera` 객체를 넘겨 받아 카메라의 [*절두체(frustum)*](https://ko.wikipedia.org/wiki/%EC%A0%88%EB%91%90%EC%B2%B4)
  안 3D 씬의 일부를 평면(2차원) 이미지로 렌더링합니다.

* [씬 그래프(Scene graph)](threejs-scenegraph.html)는 `Scene` 또는
  다수의 `Mesh`, `Light`, `Group`, `Object3D`, `Camera`로 이루어진
  트리 구조와 유사합니다. `Scene`은 씬 그래프의 최상위 노드로서 배경색(background color),
  안개(fog) 등의 요소를 포함합니다. `Scene`에 포함된 객체들 또한 부모/자식의
  트리 구조로 이루어지며, 이는 각 객체의 유래와 방향성을 나타냅니다. 쉽게 말해 자식 객체의
  위치(position)와 방향(orientation)이 부모 기준이라는 거죠. 예를 들어 자동차의 바퀴가
  자동차 객체의 자식 객체라면, 자동차 객체의 방향을 움직일 때, 바퀴 객체의 방향 또한 같이
  움직입니다(더 자세한 내용은 [씬 그래프에 관한 글](threejs-scenegraph.html)에서 확인할 수 있습니다)

  `Camera`가 도표에서 반쯤 나간 것이 보이나요? 이는 의도된 것으로, 다른 객체와 달리
  `Camera`는 굳이 씬 그래프에 포함될 필요가 없음을 보여주기 위함입니다. 물론 다른
  객체와 마찬가지로 `Camera` 또한 다른 객체의 자식 객체가 될 수 있습니다. 이러면
  부모 객체에 따라 `Camera` 또한 움직이겠죠. [씬 그래프에 관한 글](threejs-scenegraph.html)
  마지막에 여러개의 `Camera`를 넣는 예제가 있으니 참고하시기 바랍니다.

* `Mesh`는 어떤 `Material`로 하나의 `Geometry`를 그리는 객체입니다.
  `Material`, `Geometry`는 재사용이 가능하여 여러개의 `Mesh`가 하나의
  `Material` 또는 `Geometry`를 동시에 참조할 수 있습니다. 파란색 정육면체 2개를
  그린다고 해보죠. 일단 두 정육면체의 위치가 달라야 하니, 2개의 `Mesh`가
  필요합니다. 그리고 정점(vertext, 꼭지점) 데이터를 가진 한 개의 `Geometry`와
  채색을 위한 하나의 `Material`이 필요하겠죠. 이때 각 `Mesh`는 객체를 복사할
  필요 없이, 같은 `Geometry` 그리고 `Material`을 참조할 수 있습니다.

* `Geometry`는 기하학 객체의 정점 데이터입니다. 구(sphere), 정육면체(cube),
  면(plane), 개, 고양이, 사람, 나무, 건물 등 아주 다양한 것이 될 수 있죠. Three.js는
  기본적으로 몇 가지의 내장(built-in) [기하학 객체](threejs-primitives.html)를 제공합니다.
  물론 [직접 기하학 객체를 만들](threejs-custom-buffergeometry.html) 수도 있고,
  [파일에서 기하학 객체를 불러올](threejs-load-obj.html) 수도 있죠.

* `Material`은 기하학 객체를 그리는 데 사용하는 [표면 속성](threejs-materials.html)입니다.
  색이나 밝기 등을 지정할 수 있죠. 하나의 `Material`는 여러개의 `Texture`를 사용할 수
  있습니다. 기하학 객체의 표면을 이미지로 덮어씌울 때 주로 사용하죠.

* `Texture`는 이미지나 [파일에서 로드한 이미지](threejs-textures.html),
  [canvas로 생성한 이미지](threejs-canvas-textures.html)
  또는 [다른 `Scene` 객체에서 렌더링한 결과물](threejs-rendertargets.html)에 해당합니다.

* `Light`는 [여러 종류의 광원에 해당](threejs-lights.html)합니다.

이제 기본적인 구조에 대해 배웠으니 아래와 같은 구조의 *"Hello Cube"*를 만들어 봅시다.

<div class="threejs_center"><img src="resources/images/threejs-1cube-no-light-scene.svg" style="width: 500px;"></div>

먼저, Three.js를 로드합니다.

```html
<script type="module">
import * as THREE from './resources/threejs/r125/build/three.module.js';
</script>
```

`type="module"` 속성을 지정하는 것을 잊지 마세요. 이러면 `import` 키워드를
통해 Three.js 모듈을 불러올 수 있습니다. 다른 방법으로 로드할 수도 있지만
모듈 로드가 r106 이후 빌드에서 추천하는 방식입니다. 모듈로 로드하면 다른 의존성
스크립트를 알아서 로드하기 때문에 `<script>` 태그를 일일이 작성하는 수고를 덜
수 있습니다.

그리고 `<canvas>` 태그를 작성합니다.

```html
<body>
  <canvas id="c"></canvas>
</body>
```

이제 Three.js에게 렌더링을 맡겨보죠.

```html
<script type="module">
import * as THREE from './resources/threejs/r125/build/three.module.js';

+function main() {
+  const canvas = document.querySelector('#c');
+  const renderer = new THREE.WebGLRenderer({canvas});
+  ...
</script>
```

canvas 요소(element)를 참조한 이후 `WebGLRenderer`를 생성했습니다.
이 렌더러(renderer)는 여러분이 입력한 데이터를 실제로 canvas에 그려주는
역할을 맡습니다. 렌더러의 종류로 과거 `CSSRenderer`, `CanvasRenderer`가
있었고, 나중에는 아마 `WebGL2Renderer`, `WebGPURenderer`가 이 자리를
대신할 겁니다. 지금은 3차원 세상을 canvas에 그려줄 WebGL, `WebGLRenderer`를
사용하도록 하죠.

만약 Three.js에 canvas 요소를 넘겨주지 않으면, Three.js는 canvas 요소를
자동으로 생성합니다. 그리고 여러분이 직접 이 canvas 요소를 문서(document)
에 삽입해야 하죠. 어디에 canvas 요소를 넣을지는 경우에 따라 다를 테니,
예제에서는 자바스크립트에서 요소를 참조하도록 하는 편이 호환성 면에서
더 낫다고 판단했습니다. 만약 canvas 요소를 동적으로 삽입한다면 여러분이
직접 코드를 고쳐야 할 테니까요.

다음으로 카메라가 필요하니 `PerspectiveCamera(원근 카메라)` 객체를 생성해봅시다.

```js
const fov = 75;
const aspect = 2;  // the canvas default
const near = 0.1;
const far = 5;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
```

`fov`는 `field of view(시야각)`의 줄임말입니다. 예제의 경우 수직면 75도로
설정했습니다. 알아둬야 할 건 Three.js의 대부분이 각도 단위로 호도(radians)를
사용하는데, 원근 카메라만 특이하게 도(degrees)를 인자로 받는다는 점입니다.

`aspect`는 canvas의 가로 세로 비율입니다. 이는 [다른 글](threejs-responsive.html)
에서 자세히 다루겠지만, 기본 설정으로 canvas의 크기는 300x150이니 비율도
300/150, 2로 설정했습니다.

`near`와 `far`는 카메라 앞에 렌더링되는 공간 범위를 지정하는 요소입니다.
이 공간 바깥에 있는 요소는 화면에서 잘려나가며, 렌더링되지 않을 것입니다.

위에서 살펴본 4가지 속성은 하나의 *"절두체"*를 만듭니다. *"절두체"*는
끝부분이 잘려나간 피라미드처럼 생긴 3차원 모양인데, 구, 정육면체,
각기둥(prism)처럼 3차원 모양의 하나로 생각하면 됩니다.

<img src="resources/frustum-3d.svg" width="500" class="threejs_center"/>

`near`와 `far` 평면의 높이는 시야각(fov), 너비는 시야각과 `aspect`에 의해
결정됩니다.

그리고 앞서 말했듯 절두체 안에 있는 요소만 렌더링되며, 바깥에 있는 요소는
렌더링되지 않습니다.

기본 설정으로 카메라는 -Z 축 +Y 축, 즉 아래를 바라봅니다. 정육면체를 원점에
놓을 예정이니 카메라를 조금 뒤로 움직여 화면 안에 들어오도록 해보죠.

```js
camera.position.z = 2;
```

우리가 원하는 결과물을 다음처럼 그려볼 수 있습니다.

<img src="resources/scene-down.svg" width="500" class="threejs_center"/>

카메라는 `z = 2` 위치에서 -Z 방향을 바라봅니다. 절두체는 카메라 앞 0.1 칸에서
5칸까지를 차지하죠. 또한 아래를 바라보는 형태이기 때문에, 시야각은 canvas
크기의 영향을 받습니다. 앞서 만든 canvas는 두 배 더 크기 때문에 실제로는 시야각이
위에서 정의한 75도 보다는 훨씬 넓을 것입니다.

이제 `Scene`을 만듭니다. Three.js에서 `Scene`이란 씬 그래프에서 가장 상단에
위치한 요소입니다. 뭔가를 화면에 렌더링하고 싶다면 먼저 `Scene`에 추가해야 하죠.
여기서는 간단하게 다룰 것이므로 자세한 내용은 [이 글](threejs-scenegraph.html)을
참고하세요.

```js
const scene = new THREE.Scene();
```

다음으로 간단한 정육면체를 만들어보죠. Three.js에서 렌더링되는 대부분의 3D 요소는
정점 데이터가 정의된 기하학 객체를 필요로 합니다. 지금은 정육면체를 만들어야 하니
`BoxGeometry` 생성자를 호출하겠습니다.

```js
const boxWidth = 1;
const boxHeight = 1;
const boxDepth = 1;
const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
```

다음으로 `Material`을 만들고 색을 지정합니다. 색을 지정할 때는 CSS처럼
숫자 형태의 hex 코드를 이용합니다(`#` 대신 `0x`. 역주).

```js
const material = new THREE.MeshBasicMaterial({color: 0x44aa88});
```

그리고 앞서 만든 `Geometry`(물체의 형태)와 `Material`(물체의 색, 밝기, 질감 등)을
이용해 `Mesh`를 만듭니다. `Mesh`는 `Geometry`, `Material` 외에도 물체의 위치, 방향,
크기 등을 담은 객체입니다.

```js
const cube = new THREE.Mesh(geometry, material);
```

마지막으로 완성된 정육면체 `Mesh`를 `Scene`에 넣어줍니다.

```js
scene.add(cube);
```

`renderer`의 `render` 메서드에 `Scene`과 `Camera`를 넘겨주면 화면을 렌더링할
수 있습니다.

```js
renderer.render(scene, camera);
```

아래는 전체 코드입니다.

{{{example url="../threejs-fundamentals.html" }}}

물론 위 예제는 3D 정육면체라고 하긴 어렵습니다. 코드 상으로 Three.js는
분명 3D 정육면체를 그렸지만, 카메라가 -Z 방향을 바라보고, 정육면체도
Z 축에 맞추어 정렬되어 있기 때문에 한 면만 보입니다.

한 번 이 물체에 애니메이션을 주고 3D처럼 보이는지 확인해보죠.
애니메이션을 구현하기 위해 [`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) 루프 안에서 렌더링 함수를 호출합니다.

```js
function render(time) {
  time *= 0.001;  // convert time to seconds

  cube.rotation.x = time;
  cube.rotation.y = time;

  renderer.render(scene, camera);

  requestAnimationFrame(render);
}
requestAnimationFrame(render);
```

`requestAnimationFrame`은 브라우저에 애니메이션 프레임을 요청하는 함수입니다.
인자로 실행할 함수를 전달하면 되죠(이 경우는 `render` 함수). 브라우저는 넘겨받은
함수를 실행하고, 페이지에 변화가 있다면 페이지를 다시 렌더링합니다. 위 예제에서는
Three.js의 `renderer.render` 메서드를 호출해 씬을 렌더링하도록 했죠.

`requestAnimationFrame`은 매개변수로 넘겨받은 함수에 페이지가 로드된 이후의 시간값을
밀리초 단위로 넘겨줍니다. 전 초 단위가 더 익숙하기 때문에, 밀리초 단위를 초 단위로
변경하였습니다.

그리고 정육면체의 X, Y축 회전값을 현재 시간값으로 설정합니다(이 회전값은 [라디안(radians)](https://ko.wikipedia.org/wiki/%EB%9D%BC%EB%94%94%EC%95%88)
단위를 사용합니다). 360˚도는 2π 라디안이니 큐브는 각 축마다
약 6.28초에 한 바퀴를 돌게 됩니다.

그리고 씬을 렌더링 한 후, 브라우저에 재귀적으로 애니메이션 프레임을 요청해 이
애니메이션이 반복되도록 합니다.

마지막으로 루프 바깥에서 `requestAnimationFrame`을 한 번 호출해 루프를
시작합니다.

{{{example url="../threejs-fundamentals-with-animation.html" }}}

아까보단 낫지만 아직 3D 물체라고 부르기엔 뭔가 부족합니다. 광원을 추가해 그림자가
지도록 하면 어떨까요? 나중에 [이 글](threejs-lights.html)에서 자세히 다루겠지만,
Three.js에는 다양한 종류의 광원이 있습니다. 다 살펴보기 힘드니 지금은 예시로
`DirectionalLight`를 사용해보도록 하죠.

```js
{
  const color = 0xFFFFFF;
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(-1, 2, 4);
  scene.add(light);
}
```

`DirectionnalLight`에는 `위치(position)`와 `목표(target)` 속성이 있습니다.
기본값은 `0, 0, 0` 이죠. 먼저 `position`을 `-1, 2, 4`로 설정해 카메라보다
약간 동서쪽, Z축으로는 약간 위로 보냅니다. `target`은 기본값 `0, 0, 0` 그대로
두어 공간의 중앙을 비추도록 합니다.

그리고 `material`도 바꿔야 합니다. `MeshBasicMaterial`은 광원에 반응하지 않으니,
광원에 반응하는 `MeshPhongMaterial`로 바꿉니다(`phong`은 광원 반사 모델을 처음 개발한 사람 이름. 역주).

```js
-const material = new THREE.MeshBasicMaterial({color: 0x44aa88});  // greenish blue
+const material = new THREE.MeshPhongMaterial({color: 0x44aa88});  // greenish blue
```

다음은 현재까지의 프로그램 구조를 도식화 한 것이고,

<div class="threejs_center"><img src="resources/images/threejs-1cube-with-directionallight.svg" style="width: 500px;"></div>

아래는 결과물입니다.

{{{example url="../threejs-fundamentals-with-light.html" }}}

이제 3D라고 불러도 어색하지 않네요.

재미를 위해서 한 번 정육면체를 2개만 더 만들어 봅시다.

미리 만들어 놨던 `Geometry`를 사용하고, `Material`만 바꿔 다른 색을
가진 큐브 2개를 만들겠습니다.

먼저 함수를 하나 만들어보겠습니다. 이 함수는 넘겨받은 색상값으로
새로운 `Material`을 만들고, 넘겨받은 `Geometry`와 조합해 새로운
`Mesh`를 만듭니다. 그리고 씬에 추가한 후 넘겨받은 X축 값을 통해 물체를 이동시키죠.

```js
function makeInstance(geometry, color, x) {
  const material = new THREE.MeshPhongMaterial({color});

  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  cube.position.x = x;

  return cube;
}
```

다음으로 3가지 다른 색상과 X축 값으로 이 함수를 호출해 결과물을 배열로
저장합니다.

```js
const cubes = [
  makeInstance(geometry, 0x44aa88,  0),
  makeInstance(geometry, 0x8844aa, -2),
  makeInstance(geometry, 0xaa8844,  2),
];
```

마지막으로 `render` 함수에서 3개의 정육면체를 회전시킵니다. 동적인
효과를 위해 각 큐브마다 약간 다른 값을 주도록 해보죠.

```js
function render(time) {
  time *= 0.001;  // convert time to seconds

  cubes.forEach((cube, ndx) => {
    const speed = 1 + ndx * .1;
    const rot = time * speed;
    cube.rotation.x = rot;
    cube.rotation.y = rot;
  });

  ...
```

결과물은 다음과 같습니다.

{{{example url="../threejs-fundamentals-3-cubes.html" }}}

아까 위에서 좌표로 도식한 그림과 위 결과물을 비교해보면, 예상대로
X축으로 -2, +2만큼 이동한 정육면체들의 일부가 절두체에서 약간 벗어났습니다.
또한 가운데 정육면체에 비해 굉장히 굴절되어 보이는데, 이는 우리가 설정한 시야각이
너무 좁은 탓입니다.

위 프로그램은 구조는 다음과 같습니다.

<div class="threejs_center"><img src="resources/images/threejs-3cubes-scene.svg" style="width: 610px;"></div>

그림을 보면 각 `Mesh` 객체는 같은 `BoxGeometry`를 참조합니다. 그러나
각 `Mesh`는 다른 `MeshPhongMaterial`을 참조하므로 다른 색을 띄죠.

이 인트로가 Three.js를 시작하는 데 도움이 되었으면 합니다.
[다음 장에서는 코드를 반응형으로 만들어 다양한 상황에 적용할 수 있도록 해 볼 것입니다](threejs-responsive.html).

<div id="es6" class="threejs_bottombar">
<h3>es6 모듈, Three.js, 프로젝트 구조</h3>
<p>Three.js r106 릴리즈 이후에서는 three.js를 <a href="https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Statements/import">es6 모듈</a>로 사용하길 권장합니다.</p>
<p>
es6 모듈은 js 파일이나 인라인 <code>&lt;script type="module"&gt;</code> 태그 안에서
<code>import</code> 키워드를 사용해 로드할 수 있습니다.
</p>
<pre class=prettyprint>
&lt;script type="module"&gt;
import * as THREE from './resources/threejs/r125/build/three.module.js';

...

&lt;/script&gt;
</pre>
<p>
경로는 절대경로나 상대경로를 사용해야 하며, 상대경로는 <code>&lt;img&gt;</code>, <code>&lt;a&gt;</code> 태그와
달리 <code>./</code> 또는 <code>../</code>로 시작해야 합니다.
</p>
<p>
만약 절대경로가 같다면 같은 script는 한 번만 로드됩니다. Three.js 기반 프로젝트의 폴더 구조를
잘 구성해야 하는 가장 큰 이유이죠.
</p>
<pre class="dos">
someFolder
 |
 ├-build
 | |
 | +-three.module.js
 |
 +-examples
   |
   +-jsm
     |
     +-controls
     | |
     | +-OrbitControls.js
     | +-TrackballControls.js
     | +-...
     |
     +-loaders
     | |
     | +-GLTFLoader.js
     | +-...
     |
     ...
</pre>
<p>
이유인 즉 <a href="https://github.com/mrdoob/three.js/blob/master/examples/jsm/controls/OrbitControls.js"><code>OrbitControls.js</code></a>
같은 코드는 다음처럼 상대경로로 모듈을 로드하기 때문에
</p>
<pre class="prettyprint">
import * as THREE from '../../../build/three.module.js';
</pre>
<p>
같은 폴더 구조를 사용함으로써 모든 예제 스크립트가 같은 three.module.js 파일을
참조하도록 할 수 있죠.
</p>
<pre class="prettyprint">
import * as THREE from './someFolder/build/three.module.js';
import {OrbitControls} from './someFolder/examples/jsm/controls/OrbitControls.js';
</pre>
<p>아래는 CDN을 사용하는 예시입니다. <code>three.modules.js</code>의 경로가 <code>/build/three.modules.js</code>
로 끝나야 한다는 것을 명심하세요.</p>
<pre class="prettyprint">
import * as THREE from 'https://unpkg.com/three@0.108.0/<b>build/three.module.js</b>';
import {OrbitControls} from 'https://unpkg.com/three@0.108.0/examples/jsm/controls/OrbitControls.js';
</pre>
<p>만약 여러분이 <code>&lt;script src="path/to/three.js"&gt;&lt;/script&gt;</code> 같은 스타일을 선호한다면,
<a href="https://r105.threejsfundamentals.org">이 사이트의 이전 버젼을 확인해보시기 바랍니다</a>.
Three.js에는 하위 호환성을 보장하는 정책이 있습니다. Three.js의 개발자들은 여러분이 특정 버젼을 골라서 쓸
거라고 가정 하에 라이브러리를 개발하죠. 새 버젼으로 업그레이드할 때는 <a href="https://github.com/mrdoob/three.js/wiki/Migration-Guide">마이그레이션 가이드</a>를 참조해 바뀐 사항을 업데이트 하면 됩니다. es6 모듈과 스크립트
버젼을 모두 다루기는 너무 버거우니 이 사이트에서는 es6 모듈 스타일만 사용할 것입니다. 개발자들이 늘상 추천하듯
구형 브라우저를 지원하려면 바벨 등의 <a href="https://babeljs.io">트랜스파일러</a>를 찾아보기 바랍니다.</p>
</div>