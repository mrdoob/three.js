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
  안 3D 장면의 일부를 평면(2차원) 이미지로 렌더링합니다.

* [씬 그래프(Scene graph)](threejs-scenegraph.html)는 `Scene` 객체 또는
  다수의 `Mesh`, `Light`, `Group`, `Object3D`, `Camera` 객체로 이루어진
  트리 구조와 유사합니다. `Scene` 객체는 씬 그래프의 최상위 노드로서 배경색(background color),
  안개(fog) 등의 요소를 포함합니다. `Scene` 객체에 포함된 객체들 또한 부모/자식의
  트리 구조로 이루어지며, 이는 각 객체의 유래와 방향성을 나타냅니다. 쉽게 말해 자식 객체의
  위치(position)와 방향(orientation)은 부모를 기준으로 한다는 거죠. 예를 들어 자동차의 바퀴가
  자동차 객체의 자식 객체라면, 자동차 객체의 방향을 움직일 때, 바퀴 객체의 방향 또한 같이
  움직입니다(더 자세한 내용은 [씬 그래프에 관한 글](threejs-scenegraph.html)에서 확인할 수 있습니다)

  `Camera` 객체가 도표에서 반쯤 나간 것이 보이나요? 이는 의도된 것으로, 다른 객체와 달리
  `Camera` 객체는 굳이 씬 그래프에 포함될 필요가 없음을 보여주기 위함입니다. 물론 다른
  객체와 마찬가지로 `Camera` 객체 또한 다른 객체의 자식 객체가 될 수 있습니다. 이러면
  부모 객체에 따라 `Camera` 객체 또한 움직이겠죠. [씬 그래프에 관한 글](threejs-scenegraph.html)
  마지막에 여러개의 `Camera` 객체를 넣는 예제가 있으니 참고하시기 바랍니다.

* `Mesh`는 어떤 `Material` 객체로 하나의 `Geometry` 객체를 그리는 객체입니다.
  `Material`, `Geometry` 객체는 재사용이 가능하여 여러개의 `Mesh` 객체가 하나의
  `Material` 또는 `Geometry` 객체를 동시에 참조할 수 있습니다. 파란색 정육면체 2개를
  그린다고 해보죠. 일단 두 정육면체의 위치가 달라야 하니, 2개의 `Mesh` 객체가
  필요합니다. 그리고 정점(vertext, 꼭지점) 데이터를 가진 한 개의 `Geometry` 객체와
  채색을 위한 하나의 `Material` 객체가 필요하겠죠. 각 `Mesh` 객체는 객체를 복사할 필요
  없이, 같은 `Geometry` 그리고 `Material`를 참조할 수 있습니다.

* `Geometry` 객체는 기하학 객체의 정점 데이터입니다. 구(sphere), 정육면체(cube),
  면(plane), 개, 고양이, 사람, 나무, 건물 등 아주 다양한 것이 될 수 있죠. Three.js는
  기본적으로 몇 가지의 내장(built-in) [기하학 객체](threejs-primitives.html)를 제공합니다.
  물론 [직접 기하학 객체를 만들](threejs-custom-geometry.html) 수도 있고,
  [파일에서 기하학 객체를 불러올](threejs-load-obj.html) 수도 있죠.

* `Material` 객체는 기하학 객체를 그리는 데 사용하는 [표면 속성](threejs-materials.html)입니다.
  색이나 밝기 등을 지정할 수 있죠. 하나의 `Material` 객체는 여러개의 `Texture` 객체를 사용할 수
  있습니다. 기하학 객체의 표면을 이미지로 덮어씌울 때 주로 사용하죠.

* `Texture` 객체는 이미지나 [파일에서 로드한 이미지](threejs-textures.html),
  [canvas로 생성한 이미지](threejs-canvas-textures.html)
  또는 [다른 `Scene` 객체에서 렌더링한 결과물](threejs-rendertargets.html)에 해당합니다.

* `Light` 객체는 [여러 종류의 광원에 해당](threejs-lights.html)합니다.

이제 기본적인 구조에 대해 배웠으니 아래와 같은 구조의 *"Hello Cube"*를 만들어 봅시다.

<div class="threejs_center"><img src="resources/images/threejs-1cube-no-light-scene.svg" style="width: 500px;"></div>

먼저, Three.js를 로드합니다.

```html
<script type="module">
import * as THREE from './resources/threejs/r115/build/three.module.js';
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
import * as THREE from './resources/threejs/r115/build/three.module.js';

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

`aspect` canvas의 가로 세로 비율입니다. 이는 [다른 글](threejs-responsive.html)
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

우리가 원하는 결과물은 다음과 같습니다.

<img src="resources/scene-down.svg" width="500" class="threejs_center"/>

In the diagram above we can see our camera is at `z = 2`. It's looking
down the -Z axis. Our frustum starts 0.1 units from the front of the camera
and goes to 5 units in front of the camera. Because in this diagram we are looking down,
the field of view is affected by the aspect. Our canvas is twice as wide
as it is tall so across view the field of view will be much wider than
our specified 75 degrees which is the vertical field of view.

Next we make a `Scene`. A `Scene` in three.js is the root of a form of scene graph.
Anything you want three.js to draw needs to be added to the scene. We'll
cover more details of [how scenes work in a future article](threejs-scenegraph.html).

```js
const scene = new THREE.Scene();
```

Next up we create a `BoxGeometry` which contains the data for a box.
Almost anything we want to display in Three.js needs geometry which defines
the vertices that make up our 3D object.

```js
const boxWidth = 1;
const boxHeight = 1;
const boxDepth = 1;
const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
```

We then create a basic material and set its color. Colors can
be specified using standard CSS style 6 digit hex color values.

```js
const material = new THREE.MeshBasicMaterial({color: 0x44aa88});
```

We then create a `Mesh`. A `Mesh` in three represents the combination
of a `Geometry` (the shape of the object) and a `Material` (how to draw
the object, shiny or flat, what color, what texture(s) to apply. Etc.)
as well as the position, orientation, and scale of that
object in the scene.

```js
const cube = new THREE.Mesh(geometry, material);
```

And finally we add that mesh to the scene

```js
scene.add(cube);
```

We can then render the scene by calling the renderer's render function
and passing it the scene and the camera

```js
renderer.render(scene, camera);
```

Here's a working example

{{{example url="../threejs-fundamentals.html" }}}

It's kind of hard to tell that is a 3D cube since we're viewing
it directly down the -Z axis and the cube itself is axis aligned
so we're only seeing a single face.

Let's animate it spinning and hopefully that will make
it clear it's being drawn in 3D. To animate it we'll render inside a render loop using
[`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame).

Here's our loop

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

`requestAnimationFrame` is a request to the browser that you want to animate something.
You pass it a function to be called. In our case that function is `render`. The browser
will call your function and if you update anything related to the display of the
page the browser will re-render the page. In our case we are calling three's
`renderer.render` function which will draw our scene.

`requestAnimationFrame` passes the time since the page loaded to
our function. That time is passed in milliseconds. I find it's much
easier to work with seconds so here we're converting that to seconds.

We then set the cube's X and Y rotation to the current time. These rotations
are in [radians](https://en.wikipedia.org/wiki/Radian). There are 2 pi radians
in a circle so our cube should turn around once on each axis in about 6.28
seconds.

We then render the scene and request another animation frame to continue
our loop.

Outside the loop we call `requestAnimationFrame` one time to start the loop.

{{{example url="../threejs-fundamentals-with-animation.html" }}}

It's a little better but it's still hard to see the 3d. What would help is to
add some lighting so let's add a light. There are many kinds of lights in
three.js which we'll go over in [a future article](threejs-lights.html). For now let's create a directional light.

```js
{
  const color = 0xFFFFFF;
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(-1, 2, 4);
  scene.add(light);
}
```

Directional lights have a position and a target. Both default to 0, 0, 0. In our
case we're setting the light's position to -1, 2, 4 so it's slightly on the left,
above, and behind our camera. The target is still 0, 0, 0 so it will shine
toward the origin.

We also need to change the material. The `MeshBasicMaterial` is not affected by
lights. Let's change it to a `MeshPhongMaterial` which is affected by lights.

```js
-const material = new THREE.MeshBasicMaterial({color: 0x44aa88});  // greenish blue
+const material = new THREE.MeshPhongMaterial({color: 0x44aa88});  // greenish blue
```

Here is our new program structure

<div class="threejs_center"><img src="resources/images/threejs-1cube-with-directionallight.svg" style="width: 500px;"></div>

And here it is working.

{{{example url="../threejs-fundamentals-with-light.html" }}}

It should now be pretty clearly 3D.

Just for the fun of it let's add 2 more cubes.

We'll use the same geometry for each cube but make a different
material so each cube can be a different color.

First we'll make a function that creates a new material
with the specified color. Then it creates a mesh using
the specified geometry and adds it to the scene and
sets its X position.

```js
function makeInstance(geometry, color, x) {
  const material = new THREE.MeshPhongMaterial({color});

  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  cube.position.x = x;

  return cube;
}
```

Then we'll call it 3 times with 3 different colors and X positions
saving the `Mesh` instances in an array.

```js
const cubes = [
  makeInstance(geometry, 0x44aa88,  0),
  makeInstance(geometry, 0x8844aa, -2),
  makeInstance(geometry, 0xaa8844,  2),
];
```

Finally we'll spin all 3 cubes in our render function. We
compute a slightly different rotation for each one.

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

and here's that.

{{{example url="../threejs-fundamentals-3-cubes.html" }}}

If you compare it to the top down diagram above you can see
it matches our expectations. With cubes at X = -2 and X = +2
they are partially outside our frustum. They are also
somewhat exaggeratedly warped since the field of view
across the canvas is so extreme.

Our program now has this structure

<div class="threejs_center"><img src="resources/images/threejs-3cubes-scene.svg" style="width: 610px;"></div>

As you can see we have 3 `Mesh` objects each referencing the same `BoxGeometry`.
Each `Mesh` references a unique `MeshPhongMaterial` so that each cube can have
a different color.

I hope this short intro helps to get things started. [Next up we'll cover
making our code responsive so it is adaptable to multiple situations](threejs-responsive.html).

<div id="es6" class="threejs_bottombar">
<h3>es6 modules, three.js, and folder structure</h3>
<p>As of version r106 the preferred way to use three.js is via <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import">es6 modules</a>.</p>
<p>
es6 modules can be loaded via the <code>import</code> keyword in a script
or inline via a <code>&lt;script type="module"&gt;</code> tag. Here's an example of
both
</p>
<pre class=prettyprint>
&lt;script type="module"&gt;
import * as THREE from './resources/threejs/r115/build/three.module.js';

...

&lt;/script&gt;
</pre>
<p>
Paths must be absolute or relative. Relative paths always start with <code>./</code> or <code>../</code>
which is different than other tags like <code>&lt;img&gt;</code> and <code>&lt;a&gt;</code>.
</p>
<p>
References to the same script will only be loaded once as long as their absolute paths
are exactly the same. For three.js this means it's required that you put all the examples
libraries in the correct folder structure
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
The reason this folder structure is required is because the scripts in the
examples like <a href="https://github.com/mrdoob/three.js/blob/master/examples/jsm/controls/OrbitControls.js"><code>OrbitControls.js</code></a>
have hard coded relative paths like
</p>
<pre class="prettyprint">
import * as THREE from '../../../build/three.module.js';
</pre>
<p>
Using the same structure assures then when you import both three and one of the example
libraries they'll both reference the same three.module.js file.
</p>
<pre class="prettyprint">
import * as THREE from './someFolder/build/three.module.js';
import {OrbitControls} from './someFolder/examples/jsm/controls/OrbitControls.js';
</pre>
<p>This includes when using a CDN. Be sure your path to <code>three.modules.js</code> ends with
<code>/build/three.modules.js</code>. For example</p>
<pre class="prettyprint">
import * as THREE from 'https://unpkg.com/three@0.108.0/<b>build/three.module.js</b>';
import {OrbitControls} from 'https://unpkg.com/three@0.108.0/examples/jsm/controls/OrbitControls.js';
</pre>
<p>If you'd prefer the old <code>&lt;script src="path/to/three.js"&gt;&lt;/script&gt;</code> style
you can check out <a href="https://r105.threejsfundamentals.org">an older version of this site</a>.
Three.js has a policy of not worrying about backward compatibility. They expect you to use a specific
version, as in you're expected to download the code and put it in your project. When upgrading to a newer version
you can read the <a href="https://github.com/mrdoob/three.js/wiki/Migration-Guide">migration guide</a> to
see what you need to change. It would be too much work to maintain both an es6 module and a class script
version of this site so going forward this site will only show es6 module style. As stated elsewhere,
to support legacy browsers look into a <a href="https://babeljs.io">transpiler</a>.</p>
</div>