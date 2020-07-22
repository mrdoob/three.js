Title: Three.js 투명도
Description: Three.js에서 투명도를 설정하는 법을 알아봅니다
TOC: 물체의 투명도 설정하기

Three.js에서 투명도는 간단하지만 동시에 까다로운 주제입니다.

먼저 쉬운 것부터 알아보죠. 예제로 정육면체 8개를 2x2x2 그리드에 맞춘 장면을
만들어보겠습니다.

[불필요한 렌더링 제거하기](threejs-rendering-on-demand.html)에서 썼던
예제를 가져와 정육면체 3개를 8개로 수정합니다. 먼저 `makeInstance` 함수가
x, y, z 값을 받도록 수정하겠습니다.

```js
-function makeInstance(geometry, color) {
+function makeInstance(geometry, color, x, y, z) {
  const material = new THREE.MeshPhongMaterial({color});

  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

-  cube.position.x = x;
+  cube.position.set(x, y, z);

  return cube;
}
```

그리고 정육면체 8개를 만듭니다.

```js
+function hsl(h, s, l) {
+  return (new THREE.Color()).setHSL(h, s, l);
+}

-makeInstance(geometry, 0x44aa88,  0);
-makeInstance(geometry, 0x8844aa, -2);
-makeInstance(geometry, 0xaa8844,  2);

+{
+  const d = 0.8;
+  makeInstance(geometry, hsl(0 / 8, 1, .5), -d, -d, -d);
+  makeInstance(geometry, hsl(1 / 8, 1, .5),  d, -d, -d);
+  makeInstance(geometry, hsl(2 / 8, 1, .5), -d,  d, -d);
+  makeInstance(geometry, hsl(3 / 8, 1, .5),  d,  d, -d);
+  makeInstance(geometry, hsl(4 / 8, 1, .5), -d, -d,  d);
+  makeInstance(geometry, hsl(5 / 8, 1, .5),  d, -d,  d);
+  makeInstance(geometry, hsl(6 / 8, 1, .5), -d,  d,  d);
+  makeInstance(geometry, hsl(7 / 8, 1, .5),  d,  d,  d);
+}
```

카메라도 조정합니다.

```js
const fov = 75;
const aspect = 2;  // canvas 기본값
const near = 0.1;
-const far = 5;
+const far = 25;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
-camera.position.z = 4;
+camera.position.z = 2;
```

배경색은 하얀색으로 바꿔주고

```js
const scene = new THREE.Scene();
+scene.background = new THREE.Color('white');
```

정육면체의 옆면도 빛을 받도록 조명을 하나 더 추가합니다.

```js
-{
+function addLight(...pos) {
  const color = 0xFFFFFF;
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
-  light.position.set(-1, 2, 4);
+  light.position.set(...pos);
  scene.add(light);
}
+addLight(-1, 2, 4);
+addLight( 1, -1, -2);
```

정육면체를 투명하게 만들려면 [`transparent`](Material.transparent) 속성을
켜고 [`opacity`](Material.opacity) 속성을 설정해줘야 합니다(CSS와 마찬가지로
0은 완전히 투명함, 1은 완전히 불투명함을 의미).

```js
function makeInstance(geometry, color, x, y, z) {
-  const material = new THREE.MeshPhongMaterial({color});
+  const material = new THREE.MeshPhongMaterial({
+    color,
+    opacity: 0.5,
+    transparent: true,
+  });

  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  cube.position.set(x, y, z);

  return cube;
}
```

이제 8개의 반투명한 정육면체가 생겼습니다.

{{{example url="../threejs-transparency.html"}}}

예제를 드래그하면 화면을 회전시킬 수 있습니다.

완벽한데요, 라고 생각했다면 좀 더 자세히 보세요. 정육면체의 뒷면이 하나도
보이지 않습니다.

<div class="threejs_center"><img src="resources/images/transparency-cubes-no-backs.png" style="width: 416px;"></div>
<div class="threejs_center">뒷면이 보이지 않는다</div>

이전에 [재질(material)에 관해](threejs-materials.html) 배울 때 [`side`](Material.side)
속성에 대해 배웠었죠. 이 속성을 `THREE.DoubleSide`로 설정해 정육면체의
양면이 모두 보이도록 해봅시다.

```js
const material = new THREE.MeshPhongMaterial({
  color,
  map: loader.load(url),
  opacity: 0.5,
  transparent: true,
+  side: THREE.DoubleSide,
});
```

{{{example url="../threejs-transparency-doubleside.html" }}}

예제를 돌려보세요. 뭔가 해결된 듯 하지만 자세히 보면 가끔 뒷면 또는 뒷면의
일부가 보이지 않습니다.

<div class="threejs_center"><img src="resources/images/transparency-cubes-some-backs.png" style="width: 368px;"></div>
<div class="threejs_center">정육면체의 왼쪽 뒷면이 보이지 않는다</div>

이는 3D 요소를 렌더링하는 방식 때문입니다. WebGL은 각 geometry의 삼각형을
한 번에 하나씩 렌더링합니다. 그리고 삼각형의 픽셀 하나를 렌더링할 때마다
2개의 정보를 기록하는데, 하나는 해당 픽셀의 색이고 다른 하나는 픽셀의
깊이(depth)입니다. 다음 삼각형을 그릴 때 해당 픽셀이 이미 그려진 픽셀보다
깊이가 깊다면 해당 픽셀을 렌더링하지 않죠.

이는 불투명한 물체에서는 문제가 되지 않았지만 투명한 물체에서는 문제가 됩니다.

이 문제를 해결하려면 투명한 물체를 분류해 뒤에 있는 물체를 앞에 있는 물체보다
먼저 렌더링해야 합니다. `Mesh` 같은 경우는 Three.js가 자동으로 이를 처리해주죠.
만약 그러지 않았다면 제일 첫 번째 예제에서 뒤에 있는 정육면체를 아예 볼 수
없었을 겁니다.

정육면체에는 한 면에 2개, 총 12개의 삼각형이 있습니다. 각 삼각형의 렌더링 순서는
[geometry에 관한 글에서 봤던 것](threejs-custom-buffergeometry.html)과 같죠.
시선에 따라 카메라에서 가까운 삼각형을 먼저 렌더링할 겁니다. 앞면을 뒷면보다 먼저
렌더링하니, 때때로 뒷면이 보이지 않을 수밖에 없죠.

구체나 정육면체 등 볼록 물체(convex object)의 경우, 모든 물체를 한 번씩 더 렌더링해
문제를 해결할 수 있습니다. 하나는 안쪽면 삼각형만 렌더링하고, 다른 하나는 바깥쪽
삼각형만 렌더링하도록 만드는 것이죠.

```js
function makeInstance(geometry, color, x, y, z) {
+  [THREE.BackSide, THREE.FrontSide].forEach((side) => {
    const material = new THREE.MeshPhongMaterial({
      color,
      opacity: 0.5,
      transparent: true,
+      side,
    });

    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    cube.position.set(x, y, z);
+  });
}
```

어찌어찌 해결된 *것처럼* 보입니다.

{{{example url="../threejs-transparency-doubleside-hack.html" }}}

Three.js의 분류 기준은 고정적인 듯합니다. `side: THREE.BackSide` mesh를 먼저
넣고, 그 다음 정확히 같은 위치에 `side: THREE.FrontSide` mesh를 넣었으니까요.

이번에는 평면 2개를 교차로 배치해봅시다(정육면체 관련 코드를 전부 지운 뒤).
각 평면에는 다른 텍스처를 넣을 겁니다.

```js
const planeWidth = 1;
const planeHeight = 1;
const geometry = new THREE.PlaneBufferGeometry(planeWidth, planeHeight);

const loader = new THREE.TextureLoader();

function makeInstance(geometry, color, rotY, url) {
  const texture = loader.load(url, render);
  const material = new THREE.MeshPhongMaterial({
    color,
    map: texture,
    opacity: 0.5,
    transparent: true,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  mesh.rotation.y = rotY;
}

makeInstance(geometry, 'pink',       0,             'resources/images/happyface.png');
makeInstance(geometry, 'lightblue',  Math.PI * 0.5, 'resources/images/hmmmface.png');
```

평면은 한 번에 한 면밖에 보지 못하니, `side: THREE.DoubleSide`로 설정했습니다. 또한
텍스처를 전부 불러왔을 때 장면을 다시 렌더링하도록 `render` 함수를 `loader.load`
메서드에 넘겨줬습니다. 이는 [필요에 따른 렌더링](threejs-rendering-on-demand.html)을
구현하기 위한 것이죠.

{{{example url="../threejs-transparency-intersecting-planes.html"}}}

아까와 비슷한 문제가 보입니다.

<div class="threejs_center"><img src="resources/images/transparency-planes.png" style="width: 408px;"></div>
<div class="threejs_center">면의 반쪽이 사라졌다</div>

평면을 둘로 쪼개 실제로는 교차하지 않게끔 만들면 문제를 해결할 수 있습니다.

```js
function makeInstance(geometry, color, rotY, url) {
+  const base = new THREE.Object3D();
+  scene.add(base);
+  base.rotation.y = rotY;

+  [-1, 1].forEach((x) => {
    const texture = loader.load(url, render);
+    texture.offset.x = x < 0 ? 0 : 0.5;
+    texture.repeat.x = .5;
    const material = new THREE.MeshPhongMaterial({
      color,
      map: texture,
      opacity: 0.5,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
-    scene.add(mesh);
+    base.add(mesh);

-    mesh.rotation.y = rotY;
+    mesh.position.x = x * .25;
  });
}
```

저걸 어떻게 구현할지는 여러분의 선택입니다. [블렌더(Blender)](https://blender.org)
같은 3D 에디터를 사용했다면 텍스처 좌표를 직접 수정했겠죠. 예제의 경우에는
`PlaneBufferGeometry`를 썼습니다. [이전에 다뤘듯](threejs-textures.html)
이 geometry는 기본적으로 텍스처를 크기에 맞춰 늘립니다. [`texture.repeat`](Texture.repeat)
속성과 [`texture.offset`](Texture.offset) 속성을 조정해 각 면에 적절한
텍스처를 입혀줄 수 있죠.

위 코드에서는 `Object3D`를 만들어 두 평면의 부모로 지정했습니다. 이렇게
하면 복잡한 계산 없이 간단하게 `Object3D`만 돌려서 두 평면 다 회전시킬
수 있죠.

{{{example url="../threejs-transparency-intersecting-planes-fixed.html"}}}

이 방법은 교차점이 변하지 않는 정말 간단한 경우에만 가능합니다.

텍스처가 들어간 요소는 알파 테스트(alpha test)를 활성화해 이를 해결할 수
있죠.

알파 테스트란 Three.js가 픽셀을 렌더링하지 않는 특정 *알파* 단계를 의미합니다.
만약 아무것도 그리지 않게 설정한다면 위와 같은 문제는 사라지겠죠. 상대적으로
경계가 분명한 텍스처, 나뭇잎, 잔디 등의 경우 이는 꽤 잘 작동합니다.

이번에도 2개의 면을 만들어 테스트해보도록 합시다. 아까는 텍스처가 전부 불투명했죠.
이번에는 각 면에는 각각 다른, 부분적으로 투명한 텍스처를 사용할 겁니다.

<div class="spread">
  <div><img class="checkerboard" src="../resources/images/tree-01.png"></div>
  <div><img class="checkerboard" src="../resources/images/tree-02.png"></div>
</div>

아까 평면 2개를 교차해놓았던(반으로 가르기 전) 예제를 가져와 이 텍스처에
[`alphaTest`](Material.alphaTest) 속성을 지정하겠습니다.

```js
function makeInstance(geometry, color, rotY, url) {
  const texture = loader.load(url, render);
  const material = new THREE.MeshPhongMaterial({
    color,
    map: texture,
-    opacity: 0.5,
    transparent: true,
+    alphaTest: 0.5,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  mesh.rotation.y = rotY;
}

-makeInstance(geometry, 'pink',       0,             'resources/images/happyface.png');
-makeInstance(geometry, 'lightblue',  Math.PI * 0.5, 'resources/images/hmmmface.png');
+makeInstance(geometry, 'white', 0,             'resources/images/tree-01.png');
+makeInstance(geometry, 'white', Math.PI * 0.5, 'resources/images/tree-02.png');
```

이대로 실행해도 되지만, 간단한 UI를 만들어 `alphaTest`와 `transparent` 속성을
갖고 놀 수 있게 해보겠습니다. [씬 그래프에 관한 글](threejs-scenegraph.html)에서
소개했던 dat.GUI를 써서요.

먼저 dat.GUI에 지정할 헬퍼 클래스를 만들겠습니다. 이 헬퍼 클래스는 장면 안 모든
재질을 해당 값으로 변경할 겁니다.

```js
class AllMaterialPropertyGUIHelper {
  constructor(prop, scene) {
    this.prop = prop;
    this.scene = scene;
  }
  get value() {
    const { scene, prop } = this;
    let v;
    scene.traverse((obj) => {
      if (obj.material && obj.material[prop] !== undefined) {
        v = obj.material[prop];
      }
    });
    return v;
  }
  set value(v) {
    const { scene, prop } = this;
    scene.traverse((obj) => {
      if (obj.material && obj.material[prop] !== undefined) {
        obj.material[prop] = v;
        obj.material.needsUpdate = true;
      }
    });
  }
}
```

다음으로 GUI를 추가합니다.

```js
const gui = new GUI();
gui.add(new AllMaterialPropertyGUIHelper('alphaTest', scene), 'value', 0, 1)
    .name('alphaTest')
    .onChange(requestRenderIfNotRequested);
gui.add(new AllMaterialPropertyGUIHelper('transparent', scene), 'value')
    .name('transparent')
    .onChange(requestRenderIfNotRequested);
```

물론 dat.GUI 모듈도 불러와야죠.

```js
import * as THREE from './resources/three/r115/build/three.module.js';
import { OrbitControls } from './resources/threejs/r115/examples/jsm/controls/OrbitControls.js';
+import { GUI } from '../3rdparty/dat.gui.module.js';
```

{{{example url="../threejs-transparency-intersecting-planes-alphatest.html"}}}

예제를 확대해보면 평면에 하얀 테두리가 보일 겁니다.

<div class="threejs_center"><img src="resources/images/transparency-alphatest-issues.png" style="width: 532px;"></div>

이는 앞서 봤던 예제와 같은 문제입니다. 하얀 테두리를 가진 요소가 먼저 그려져
뒤에 있는 요소가 일부 가려진 것이죠. 완벽한 해결책은 없습니다. 그때그때 상황에
따라 `alphaTest`나 `transparent` 옵션을 조정해서 상황에 맞는 해결책을 찾아야
하죠.

결국 이 글의 주제는 "완벽한 투명도는 구현하기 힘들다"가 되겠네요. 웬만한 방법에는
모두 문제와, 타협점, 편법 등이 존재합니다.

자동차의 경우를 예로 들어보죠. 자동차는 보통 4면에 유리창이 있습니다. 렌더링 순서를
제대로 적용하려면 각각의 창문을 별도의 요소로 만들어야 합니다. 만약 하나의 요소라면
Three.js가 렌더링 순서를 제대로 결정할 수 없겠죠.

식물이나 잔디 등을 구현할 때는 일반적으로 알파 테스트를 사용합니다.

어떤 방법을 사용할지는 전적으로 상황과 여러분의 판단에 달려 있죠.
