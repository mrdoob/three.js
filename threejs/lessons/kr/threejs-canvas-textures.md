Title: Three.js 캔버스 텍스처
Description: 캔버스를 Three.js 텍스처로 쓰는 방법을 알아봅니다
TOC: 캔버스로 동적 텍스처 만들기

※ 이 글은 [텍스처에 관한 글](threejs-textures.html)에서 이어집니다. 이전 글을 읽지 않았다면 먼저 읽고 오기 바랍니다.

[이전 글](threejs-textures.html)에서 텍스처를 다룰 때는 주로 이미지 파일로 텍스처를 만들었습니다. 하지만 경우에 따라서는 런타임에 텍스처를 만들어야 할 수도 있죠. `CanvasTexture`를 사용하면 캔버스를 텍스처로 활용할 수 있습니다.

캔버스 텍스처는 `<canvas>` 요소를 인자로 받습니다. 2D 캔버스 API에 대해 잘 모른다면 [MDN의 튜토리얼](https://developer.mozilla.org/ko/docs/Web/API/Canvas_API/Tutorial)을 참고하세요.

간단한 2D 캔버스 앱을 만들어봅시다. 아래는 크기, 색, 위치 모두 무작위인 점을 반복해서 렌더링하는 예제입니다.

```js
const ctx = document.createElement('canvas').getContext('2d');
document.body.appendChild(ctx.canvas);
ctx.canvas.width = 256;
ctx.canvas.height = 256;
ctx.fillStyle = '#FFF';
ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

function randInt(min, max) {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return Math.random() * (max - min) + min | 0;
}

function drawRandomDot() {
  ctx.fillStyle = `#${ randInt(0x1000000).toString(16).padStart(6, '0') }`;
  ctx.beginPath();

  const x = randInt(256);
  const y = randInt(256);
  const radius = randInt(10, 64);
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function render() {
  drawRandomDot();
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
```

{{{example url="../canvas-random-dots.html" }}}

이제 위 캔버스를 텍스처로 만들어봅시다. [이전 글](threejs-textures.html)에서 정육면체에 텍스처를 입혔던 예제를 가져오겠습니다. 이미지를 불러오는 코드를 제거하고 대신 `CanvasTexture`에 방금 만든 캔버스를 넘겨 인스턴스를 생성합니다.

```js
const cubes = [];  // 정육면체를 회전시키기 위한 배열입니다.
-const loader = new THREE.TextureLoader();
-
+const ctx = document.createElement('canvas').getContext('2d');
+ctx.canvas.width = 256;
+ctx.canvas.height = 256;
+ctx.fillStyle = '#FFF';
+ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
+const texture = new THREE.CanvasTexture(ctx.canvas);

const material = new THREE.MeshBasicMaterial({
-  map: loader.load('resources/images/wall.jpg'),
+  map: texture,
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
cubes.push(cube);  // 정육면체 배열에 추가해 애니메이션이 적용되도록 합니다.
```

그리고 렌더링 루프에서 무작위 점을 찍도록 합니다.

```js
function render(time) {
  time *= 0.001;

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

+  drawRandomDot();
+  texture.needsUpdate = true;

  cubes.forEach((cube, ndx) => {
    const speed = .2 + ndx * .1;
    const rot = time * speed;
    cube.rotation.x = rot;
    cube.rotation.y = rot;
  });

  renderer.render(scene, camera);

  requestAnimationFrame(render);
}
```

추가로 `CanvasTexture`가 변경되었을 때 Three.js가 텍스처를 업데이트하도록 `needsUpdate` 속성을 `true`로 설정합니다.

이제 정육면체에 캔버스 텍스처가 적용되었을 겁니다.

{{{example url="../threejs-canvas-textured-cube.html" }}}

Three.js가 캔버스 텍스처를 렌더링할 때는 이전에 [별도의 글](threejs-rendertargets.html)에서 설명했던 `RenderTarget`을 쓰는 게 더 좋습니다.

캔버스 텍스처는 주로 장면에 텍스트를 삽입할 때 사용합니다. 예를 들어 캐릭터의 명찰에 이름을 표기하는 경우 캔버스 텍스처를 명찰의 텍스처로 사용할 수 있겠죠.

한 번 3명의 사람이 있는 장면을 만들어 각 사람에게 명찰을 달아봅시다.

위 예제를 그대로 가져와 정육면체 관련 코드를 지웁니다. 배경은 하얀색으로 바꾸고 두 개의 [조명](threejs-lights.html)을 넣습니다.

```js
const scene = new THREE.Scene();
+scene.background = new THREE.Color('white');
+
+function addLight(position) {
+  const color = 0xFFFFFF;
+  const intensity = 1;
+  const light = new THREE.DirectionalLight(color, intensity);
+  light.position.set(...position);
+  scene.add(light);
+  scene.add(light.target);
+}
+addLight([-3, 1, 1]);
+addLight([ 2, 1, .5]);
```

2D 캔버스를 이용해 명찰을 만드는 함수를 작성합니다.

```js
+function makeLabelCanvas(size, name) {
+  const borderSize = 2;
+  const ctx = document.createElement('canvas').getContext('2d');
+  const font =  `${ size }px bold sans-serif`;
+  ctx.font = font;
+  // 이름의 길이를 예측합니다.
+  const doubleBorderSize = borderSize * 2;
+  const width = ctx.measureText(name).width + doubleBorderSize;
+  const height = size + doubleBorderSize;
+  ctx.canvas.width = width;
+  ctx.canvas.height = height;
+
+  // 캔버스 크기를 바꿨을 때 폰트를 다시 설정해줘야 합니다.
+  ctx.font = font;
+  ctx.textBaseline = 'top';
+
+  ctx.fillStyle = 'blue';
+  ctx.fillRect(0, 0, width, height);
+  ctx.fillStyle = 'white';
+  ctx.fillText(name, borderSize, borderSize);
+
+  return ctx.canvas;
+}
```

다음으로 원통이 몸, 구체가 머리, 평면이 명찰인 간단한 사람을 만들어야 합니다.

먼저 공통으로 사용할 geometry를 만듭니다.

```js
+const bodyRadiusTop = .4;
+const bodyRadiusBottom = .2;
+const bodyHeight = 2;
+const bodyRadialSegments = 6;
+const bodyGeometry = new THREE.CylinderGeometry(
+    bodyRadiusTop, bodyRadiusBottom, bodyHeight, bodyRadialSegments);
+
+const headRadius = bodyRadiusTop * 0.8;
+const headLonSegments = 12;
+const headLatSegments = 5;
+const headGeometry = new THREE.SphereGeometry(
+    headRadius, headLonSegments, headLatSegments);
+
+const labelGeometry = new THREE.PlaneGeometry(1, 1);
```

다음으로 이 geometry들을 이용해 사람을 만드는 함수를 만듭니다.

```js
+function makePerson(x, size, name, color) {
+  const canvas = makeLabelCanvas(size, name);
+  const texture = new THREE.CanvasTexture(canvas);
+  // 텍스처용 캔버스는 2D이므로 픽셀이 모자랑 경우 대략적으로
+  // 필터링하게끔 설정합니다.
+  texture.minFilter = THREE.LinearFilter;
+  texture.wrapS = THREE.ClampToEdgeWrapping;
+  texture.wrapT = THREE.ClampToEdgeWrapping;
+
+  const labelMaterial = new THREE.MeshBasicMaterial({
+    map: texture,
+    side: THREE.DoubleSide,
+    transparent: true,
+  });
+  const bodyMaterial = new THREE.MeshPhongMaterial({
+    color,
+    flatShading: true,
+  });
+
+  const root = new THREE.Object3D();
+  root.position.x = x;
+
+  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
+  root.add(body);
+  body.position.y = bodyHeight / 2;
+
+  const head = new THREE.Mesh(headGeometry, bodyMaterial);
+  root.add(head);
+  head.position.y = bodyHeight + headRadius * 1.1;
+
+  const label = new THREE.Mesh(labelGeometry, labelMaterial);
+  root.add(label);
+  label.position.y = bodyHeight * 4 / 5;
+  label.position.z = bodyRadiusTop * 1.01;
+
+  // 명찰의 크기를 조정합니다.
+  const labelBaseScale = 0.01;
+  label.scale.x = canvas.width  * labelBaseScale;
+  label.scale.y = canvas.height * labelBaseScale;
+
+  scene.add(root);
+  return root;
+}
```

위 코드에서는 몸, 머리, 명찰을 하나의 `Object3D`에 넣고 위치를 조정했습니다. 이러면 `Object3D`만 움직여 해당 사람을 움직일 수 있겠죠. 몸은 2칸으로, 캔버스 사이즈가 픽셀 단위이고 거의 수십 픽셀이기에 여기에 0.01을 곱해 사이즈를 적당한 크기로 조정했습니다.

이제 사람과 명찰을 만듭니다.

```js
+makePerson(-3, 32, 'Purple People Eater', 'purple');
+makePerson(-0, 32, 'Green Machine', 'green');
+makePerson(+3, 32, 'Red Menace', 'red');
```

마지막으로 `OrbitControls`를 넣어 카메라를 움직일 수 있도록 합니다.

```js
import * as THREE from './resources/three/r125/build/three.module.js';
+import { OrbitControls } from './resources/threejs/r125/examples/jsm/controls/OrbitControls.js';
```

```js
const fov = 75;
const aspect = 2;  // 캔버스 기본값
const near = 0.1;
-const far = 5;
+const far = 50;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
-camera.position.z = 2;
+camera.position.set(0, 2, 5);

+const controls = new OrbitControls(camera, canvas);
+controls.target.set(0, 2, 0);
+controls.update();
```

사람 위에 간단한 명찰이 붙었습니다.

{{{example url="../threejs-canvas-textured-labels.html" }}}

나쁘지 않은 예제이지만 몇 가지 짚고 넘어가야 할 것들이 있습니다.

* 명찰을 확대했을 때 해상도가 낮아 보인다.

이 문제를 해결하는 건 생각보다 까다롭습니다. 고급 폰트 렌더링 기법이 있긴 하나 제가 아는 한 플러그인으로 구현되어 있진 않습니다. 거기다 폰트 데이터를 다운 받아야 하니 상대적으로 느리겠죠.

다른 방법은 명찰의 해상도를 높이는 겁니다. 텍스처용 캔버스의 사이즈를 두 배로 설정하고 `labelBaseScale`을 반으로 낮추면 지금과 같은 크기에 해상도만 높일 수 있겠죠.

* 이름의 길이가 길수록 명찰도 길어진다.

이 문제를 해결하려면 명찰 크기를 고정하고 텍스트를 우겨넣으면 됩니다.

이건 상대적으로 구현하기 쉽습니다. 명찰의 넓이를 넘겨주고 텍스트의 스케일을 해당 넓이에 맞춰 조정하면 되죠.

```js
-function makeLabelCanvas(size, name) {
+function makeLabelCanvas(baseWidth, size, name) {
  const borderSize = 2;
  const ctx = document.createElement('canvas').getContext('2d');
  const font =  `${ size }px bold sans-serif`;
  ctx.font = font;
  // 이름의 길이를 예측합니다.
+  const textWidth = ctx.measureText(name).width;

  const doubleBorderSize = borderSize * 2;
-  const width = ctx.measureText(name).width + doubleBorderSize;
+  const width = baseWidth + doubleBorderSize;
  const height = size + doubleBorderSize;
  ctx.canvas.width = width;
  ctx.canvas.height = height;

  // 캔버스 크기를 바꿨을 때 폰트를 다시 설정해줘야 합니다.
  ctx.font = font;
-  ctx.textBaseline = 'top';
+  ctx.textBaseline = 'middle';
+  ctx.textAlign = 'center';

  ctx.fillStyle = 'blue';
  ctx.fillRect(0, 0, width, height);

+  // 명찰의 크기에 맞춰 조정하되 늘어나지 않도록 합니다.
+  const scaleFactor = Math.min(1, baseWidth / textWidth);
+  ctx.translate(width / 2, height / 2);
+  ctx.scale(scaleFactor, 1);
  ctx.fillStyle = 'white';
  ctx.fillText(name, borderSize, borderSize);

  return ctx.canvas;
}
```

사람을 만들 때 명찰의 넓이도 같이 받도록 바꿉니다.

```js
-function makePerson(x, size, name, color) {
-  const canvas = makeLabelCanvas(size, name);
+function makePerson(x, labelWidth, size, name, color) {
+  const canvas = makeLabelCanvas(labelWidth, size, name);

...

}

-makePerson(-3, 32, 'Purple People Eater', 'purple');
-makePerson(-0, 32, 'Green Machine', 'green');
-makePerson(+3, 32, 'Red Menace', 'red');
+makePerson(-3, 150, 32, 'Purple People Eater', 'purple');
+makePerson(-0, 150, 32, 'Green Machine', 'green');
+makePerson(+3, 150, 32, 'Red Menace', 'red');
```

이제 명찰의 텍스트가 크기에 맞춰지고 가운데 정렬됩니다.

{{{example url="../threejs-canvas-textured-labels-scale-to-fit.html" }}}

위 예제에서는 텍스처마다 캔버스를 따로 썼습니다. 텍스처마다 캔버스를 따로 쓸지는 여러분의 선택에 달렸습니다. 만약 캔버스를 자주 업데이트해야 한다면 텍스처마다 캔버스를 따로 두는 게 좋겠죠. 반대로 아예, 또는 가끔 업데이트할 거라면 하나의 캔버스를 돌려 쓰는 게 더 나을 겁니다. 명찰은 업데이트할 일이 없으니 위 코드를 고쳐 하나의 캔버스를 쓰도록 해보죠.

```js
+const ctx = document.createElement('canvas').getContext('2d');

function makeLabelCanvas(baseWidth, size, name) {
  const borderSize = 2;
-  const ctx = document.createElement('canvas').getContext('2d');
  const font =  `${ size }px bold sans-serif`;

  ...

}

+const forceTextureInitialization = function() {
+  const material = new THREE.MeshBasicMaterial();
+  const geometry = new THREE.PlaneGeometry();
+  const scene = new THREE.Scene();
+  scene.add(new THREE.Mesh(geometry, material));
+  const camera = new THREE.Camera();
+
+  return function forceTextureInitialization(texture) {
+    material.map = texture;
+    renderer.render(scene, camera);
+  };
+}();

function makePerson(x, labelWidth, size, name, color) {
  const canvas = makeLabelCanvas(labelWidth, size, name);
  const texture = new THREE.CanvasTexture(canvas);
  // 텍스처용 캔버스는 2D이므로 픽셀이 모자랑 경우 대략적으로
  // 필터링하게끔 설정합니다.
  texture.minFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
+  forceTextureInitialization(texture);

  ...
```

{{{example url="../threejs-canvas-textured-labels-one-canvas.html" }}}

아직 언급하지 않은 다른 문제점이 있습니다. 카메라를 사람 뒤로 돌리면 명찰이 뒤집혀 보인다는 거죠. 만약 명찰을 배지 형태로 사용할 거라면 크게 문제될 일은 없습니다. 하지만 명찰을 3D 게임 캐릭터의 이름표로 사용할 거라면 이름표가 항상 카메라를 향해야 하겠죠. 이 방법에 대해서는 [빌보드와 파사드](threejs-billboards.html)에서 다루겠습니다.

단순히 이름표를 구현하는 경우라면 [HTML을 이용한 방법](threejs-align-html-elements-to-3d.html)을 사용할 수도 있습니다. 다만 [HTML 이름표](threejs-align-html-elements-to-3d.html)는 항상 3D 요소 위에 있죠. 예제의 명찰은 *3차원 세계 안*에 있기에 다른 물체에 의해 가려지길 원할 경우 유용합니다.
