Title: Three.js의 조명
Description: 조명에 대해 알아봅니다
TOC: 조명(Lights)

※ 이 글은 Three.js의 튜토리얼 시리즈로서,
먼저 [Three.js의 기본 구조에 관한 글](threejs-fundamentals.html)과
[개발 환경 설정하는 법](threejs-setup.html)을 읽고 오길 권장합니다.

이전 글은 [텍스처에 관한 글](threejs-textures.html)이었죠. 이번에는
Three.js의 다양한 조명을 어떻게 쓰는지 알아보겠습니다.

먼저 이전 예제에서 카메라를 수정하겠습니다. 시야각(fov, field of view)은
45도, `far`면은 100칸, 카메라의 위치는 중점에서 위로 10칸, 뒤로 20칸 옮깁니다.

```js
*const fov = 45;
const aspect = 2;  // canvas 요소의 기본 비율
const near = 0.1;
*const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
+camera.position.set(0, 10, 20);
```

다음으로 `OrbitControls`를 추가합니다. `OrbitControls`는 특정 좌표를
중심으로 카메라를 자전 또는 *공전(orbit)*하도록 해줍니다. `OrbitControls`는
별도 모듈이므로, 먼저 페이지에 로드해야 합니다.

```js
import * as THREE from './resources/three/r127/build/three.module.js';
+import { OrbitControls } from './resources/threejs/r127/examples/jsm/controls/OrbitControls.js';
```

이제 `OrbitControls`에 카메라와, DOM 이벤트를 감지할 수 있도록
canvas 요소를 넘겨줍니다.

```js
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 5, 0);
controls.update();
```

또한 시점을 중점에서 위로 5칸 올린 후 `controls.update` 메서드를
호출해 `OrbitControls`가 새로운 시점을 바라보게 합니다.

다음으로 빛을 받을 무언가를 만들어보겠습니다. 먼저 땅의 역할을 할
평면을 만들고, 평면에 2x2 픽셀의 체크판 텍스처를 씌우겠습니다.

<div class="threejs_center">
  <img src="../resources/images/checker.png" class="border" style="
    image-rendering: pixelated;
    width: 128px;
  ">
</div>

일단 텍스처를 불러온 뒤, 반복하도록 래핑(wrapping)을 설정해줍니다. 필터는
`NearestFilter`, 텍스처가 2x2 픽셀의 체크판이니 `repeat` 속성을 평면의
반으로 설정하면 체크판의 각 칸은 정확히 (장면의) 1칸이 될 겁니다.

```js
const planeSize = 40;

const loader = new THREE.TextureLoader();
const texture = loader.load('resources/images/checker.png');
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.magFilter = THREE.NearestFilter;
const repeats = planeSize / 2;
texture.repeat.set(repeats, repeats);
```

그리고 평면 `geometry`, 평면에 쓸 재질(material), 장면(scene)에 추가할
`mesh`를 만듭니다. 평면은 기본적으로 XY축을 기준으로 하니, XZ축을 기준으로
하려면 평면을 회전시켜야 합니다.

```js
const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
const planeMat = new THREE.MeshPhongMaterial({
  map: texture,
  side: THREE.DoubleSide,
});
const mesh = new THREE.Mesh(planeGeo, planeMat);
mesh.rotation.x = Math.PI * -.5;
scene.add(mesh);
```

정육면체와 구체도 추가해서 평면까지 총 3개의 물체를 추가하도록 하죠.

```js
{
  const cubeSize = 4;
  const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
  const cubeMat = new THREE.MeshPhongMaterial({color: '#8AC'});
  const mesh = new THREE.Mesh(cubeGeo, cubeMat);
  mesh.position.set(cubeSize + 1, cubeSize / 2, 0);
  scene.add(mesh);
}
{
  const sphereRadius = 3;
  const sphereWidthDivisions = 32;
  const sphereHeightDivisions = 16;
  const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
  const sphereMat = new THREE.MeshPhongMaterial({color: '#CA8'});
  const mesh = new THREE.Mesh(sphereGeo, sphereMat);
  mesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
  scene.add(mesh);
}
```

빛을 받을 물체를 만들었으니 이제 조명을 가지고 놀아봅시다!

## `AmbientLight`

먼저 `AmbientLight`(자연광)를 써보겠습니다.

```js
const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.AmbientLight(color, intensity);
scene.add(light);
```

이 조명도 [dat.GUI](https://github.com/dataarts/dat.gui)를 사용해
속성을 조정할 수 있도록 만들겠습니다. dat.GUI로 색상을 조정하려면 간단한
헬퍼 클래스가 필요합니다. 이 클래스는 색상을 CSS hex(예: `#FF8844`) 값으로
변경해 dat.GUI에 넘겨주는 역할을 할 거예요. 그리고 dat.GUI가 클래스의
속성을 지정할 때, 이를 조명에 직접 지정하도록 합니다.

```js
class ColorGUIHelper {
  constructor(object, prop) {
    this.object = object;
    this.prop = prop;
  }
  get value() {
    return `#${this.object[this.prop].getHexString()}`;
  }
  set value(hexString) {
    this.object[this.prop].set(hexString);
  }
}
```

아래는 dat.GUI를 만드는 코드입니다.

```js
const gui = new GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'intensity', 0, 2, 0.01);
```

결과물은 다음과 같죠.

{{{example url="../threejs-lights-ambient.html" }}}

카메라를 *공전시키기(orbit)* 위해 화면을 드래그해보세요.

물체들이 평평하고, 윤곽이 뚜렷하지 않습니다. `AmbientLight`는 물체와
조명의 색, 그리고 조명의 밝기를 곱한 것과 같죠.

    color = materialColor * light.color * light.intensity;

이게 전부입니다. `AmbientLight`에는 방향이라는 개념이 없죠. 주변광은
완전히 고르게 적용되고 공간 안 물체의 색을 바꾸는 역할만 하기 때문에
실용적이지 않은데다 그다지 *조명*처럼 느껴지지도 않습니다. 어두운 장면을
덜 어둡게 만드는 정도에만 도움이 되죠.

## `HemisphereLight`

조명을 `HemisphereLight`(반구광)으로 바꾸겠습니다. `HemisphereLight`는
천장과 바닥의 색을 인자로 받아, 물체의 천장을 바라보는 면은 천장 색, 바닥을
바라보는 면은 바닥 색으로 혼합합니다.

```js
-const color = 0xFFFFFF;
+const skyColor = 0xB1E1FF;  // 하늘색
+const groundColor = 0xB97A20;  // 오렌지 브라운
const intensity = 1;
-const light = new THREE.AmbientLight(color, intensity);
+const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
scene.add(light);
```

마찬가지로 dat.GUI를 수정해 두 색상을 조정할 수 있도록 합니다.

```js
const gui = new GUI();
-gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
+gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('skyColor');
+gui.addColor(new ColorGUIHelper(light, 'groundColor'), 'value').name('groundColor');
gui.add(light, 'intensity', 0, 2, 0.01);
```

{{{example url="../threejs-lights-hemisphere.html" }}}

이 또한 그다지 입체적이지 않습니다. 아까보다는 낮지만 전체적으로 2D처럼
보이네요. `HemisphereLight`는 주로 풍경을 표현하거나 할 때 다른 조명과
함께 사용합니다. 다른 조명과 조합할 때 유용하고, 간단히는 `AmbientLight`
대신 사용할 수 있죠.

## `DirectionalLight`

이번에는 조명을 `DirectionalLight`(직사광)로 바꿔보죠. `DirectionalLight`는
주로 태양을 표현할 때 사용합니다.

```js
const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(0, 10, 0);
light.target.position.set(-5, 0, 0);
scene.add(light);
scene.add(light.target);
```

먼저 `light`와 `light.target`(목표)을 모두 장면에 추가해야 합니다.
그래야 Three.js의 `DirectionalLight`가 목표가 있는 방향으로 빛을
쬘 테니까요.

이 역시 GUI를 사용해 목표의 위치를 조정할 수 있도록 만들겠습니다.

```js
const gui = new GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'intensity', 0, 2, 0.01);
gui.add(light.target.position, 'x', -10, 10);
gui.add(light.target.position, 'z', -10, 10);
gui.add(light.target.position, 'y', 0, 10);
```

{{{example url="../threejs-lights-directional.html" }}}

조명의 위치가 보이지 않으니 정확한 동작을 확인하기가 좀 어렵네요.
다행히 Three.js에는 눈에 보이지 않는 요소의 시각화를 도와주는
다양한 헬퍼 객체가 있습니다. 이 경우 `DirectionalLightHelper`를
사용해 조명을 면으로, 조명의 방향을 선으로 나타낼 수 있습니다.
사용법도 간단해서 조명을 인자로 넘겨주고 생성한 인스턴스를 장면에
추가하면 됩니다.

```js
const helper = new THREE.DirectionalLightHelper(light);
scene.add(helper);
```

하는 김에 조명과 목표 둘 다 위치를 조정할 수 있도록 하겠습니다.
`Vector3` 객체를 인자로 받아, `dat.GUI`로 이 객체의 `x`, `y`,
`z` 속성을 조정하는 함수를 하나 만듭니다.

```js
function makeXYZGUI(gui, vector3, name, onChangeFn) {
  const folder = gui.addFolder(name);
  folder.add(vector3, 'x', -10, 10).onChange(onChangeFn);
  folder.add(vector3, 'y', 0, 10).onChange(onChangeFn);
  folder.add(vector3, 'z', -10, 10).onChange(onChangeFn);
  folder.open();
}
```

헬퍼 객체를 사용할 때는 헬퍼 객체의 `update` 메서드를 수동으로
호출해줘야 합니다. 한 예로 dat.GUI가 객체 속성을 변경할 때마다
인자로 넘겨준 `onChangeFn`에서 헬퍼 객체의 `update` 메서드를
호출할 수 있죠.

그리고 조명의 위치, 목표의 위치 객체에 방금 만든 함수를 각각 적용합니다.

```js
+function updateLight() {
+  light.target.updateMatrixWorld();
+  helper.update();
+}
+updateLight();

const gui = new GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'intensity', 0, 2, 0.01);

+makeXYZGUI(gui, light.position, 'position', updateLight);
+makeXYZGUI(gui, light.target.position, 'target', updateLight);
```

이제 조명, 목표의 위치를 각각 조정할 수 있습니다.

{{{example url="../threejs-lights-directional-w-helper.html" }}}

카메라를 돌려보면 아까보다 훨씬 동작이 명확하게 보일 겁니다.
평면은 `DirectionalLight`를 나타내는데, 이는 직사광이 어느
*한 점*에서 뻗어나오는 조명이 아니기 때문입니다. 무한한 광원이
목표를 향해 평행하게 빛을 내리쬐는 것이죠.

## `PointLight`

`PointLight`는 한 점에서 무한히 뻗어나가는 광원입니다. 코드를
다시 한 번 수정해보죠.

```js
const color = 0xFFFFFF;
const intensity = 1;
-const light = new THREE.DirectionalLight(color, intensity);
+const light = new THREE.PointLight(color, intensity);
light.position.set(0, 10, 0);
-light.target.position.set(-5, 0, 0);
scene.add(light);
-scene.add(light.target);
```

헬퍼 객체도 `PointLightHelper`로 바꾸겠습니다.

```js
-const helper = new THREE.DirectionalLightHelper(light);
+const helper = new THREE.PointLightHelper(light);
scene.add(helper);
```

`PointLight`에는 목표가 없으므로 `onChange` 함수도 훨씬 간단하게
짤 수 있습니다.

```js
function updateLight() {
-  light.target.updateMatrixWorld();
  helper.update();
}
-updateLight();
```

`PointLightHelper`는 점의 표상을 그립니다. 점의 표상이란 점으로는 확인이 어려우니,
기본값으로 다이아몬드 형태의 와이어프레임(wireframe)을 대신 그려놓은 것이죠. 점의
형태는 조명에 `mesh` 객체를 하나 넘겨 얼마든지 바꿀 수 있습니다.

`PointLight`에는 추가로 [`distance`](PointLight.distance) 속성이 있습니다.
`distance`가이 0이면 `PointLight`의 밝기가 무한대임을 의미하고,  0보다 크면
`distance`에 지정된 거리만큼만 영향을 미칩니다.

거리도 조정할 수 있도록 GUI에 추가하겠습니다.

```js
const gui = new GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'intensity', 0, 2, 0.01);
+gui.add(light, 'distance', 0, 40).onChange(updateLight);

makeXYZGUI(gui, light.position, 'position', updateLight);
-makeXYZGUI(gui, light.target.position, 'target', updateLight);
```

이제 한 번 테스트해보죠.

{{{example url="../threejs-lights-point.html" }}}

`distance`가 0보다 클 때 조명의 밝기를 잘 관찰해보세요.

## `SpotLight`

스포트라이트는 비유하자면 원뿔 안의 `PointLight`입니다.
차이점은 원뿔 안에서만 빛난다는 점이죠. `SpotLight`의
원뿔은 종류는 외부 원뿔과 내부 원뿔 두 가지입니다.
빛의 밝기는 내부 원뿔에서 가장 세고, 외부 원뿔에 가까워질수록
0까지 낮아집니다.

`DirectionalLight`와 마찬가지로 `SpotLight`도 목표의 위치를
정해줘야 합니다. 원뿔의 밑면이 해당 목표물을 바라보게 되죠.

위 예제의 `DirectionalLight`와 헬퍼 객체를 수정하겠습니다.

```js
const color = 0xFFFFFF;
const intensity = 1;
-const light = new THREE.DirectionalLight(color, intensity);
+const light = new THREE.SpotLight(color, intensity);
scene.add(light);
scene.add(light.target);

-const helper = new THREE.DirectionalLightHelper(light);
+const helper = new THREE.SpotLightHelper(light);
scene.add(helper);
```

원뿔의 내각은 [`angle`](SpotLight.angle)에 호도(radians)값을 지정해
설정합니다. [텍스처 예제](threejs-textures.html)에서 사용했던 `DegRadHelper`
객체를 사용해 UI에는 도(degrees)로 표시하도록 하겠습니다.

```js
gui.add(new DegRadHelper(light, 'angle'), 'value', 0, 90).name('angle').onChange(updateLight);
```

내부 원뿔의 크기는 [`penumbra(반음영)`](SpotLight.penumbra) 속성을 외부
원뿔에 대한 비율(퍼센트)로 지정해 사용합니다. 다시 말해 `penumbra` 속성이
0이면 외부 원뿔과 크기가 동일하다는 것이고, 1이면 빛이 중앙에서부터 외부
원뿔까지 점점 희미해짐을 의미하죠. `penumbra` 속성이 0.5이라면? 중앙과 외부
원뿔의 사이 50% 지점부터 빛이 희미해짐을 의미합니다.

```js
gui.add(light, 'penumbra', 0, 1, 0.01);
```

{{{example url="../threejs-lights-spot-w-helper.html" }}}

`penumbra` 속성이 0일 때는 빛의 경계가 굉장히 분명한 것이 보일 겁니다.
`penumbra` 속성을 1에 가깝게 조정하면 경계가 점점 흐릿해지죠.

`SpotLight`가 *원뿔 모양*처럼 보이지 않을지도 모릅니다. 이는 바닥이 원뿔의
거리보다 가까이 있기 때문으로, `distance`를 약 5 정도로 조정하면 원뿔의 밑면을
확인할 수 있을 겁니다.

## `RectAreaLight`

마지막으로 살펴볼 조명은 `RectAreaLight`입니다. 이름 그대로 사각 형태의
조명으로, 형광등이나 천장의 유리를 통과하는 태양빛을 표현하기에 적합합니다.

`RectAreaLight`는 `MeshStandardMaterial`과 `MeshPhysicalMaterial`만
지원합니다. 예전 코드에서 재질(material)을 `MeshStandardMaterial`로 바꾸겠습니다.

```js
  ...

  const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
-  const planeMat = new THREE.MeshPhongMaterial({
+  const planeMat = new THREE.MeshStandardMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(planeGeo, planeMat);
  mesh.rotation.x = Math.PI * -.5;
  scene.add(mesh);
}
{
  const cubeSize = 4;
  const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
- const cubeMat = new THREE.MeshPhongMaterial({color: '#8AC'});
+ const cubeMat = new THREE.MeshStandardMaterial({color: '#8AC'});
  const mesh = new THREE.Mesh(cubeGeo, cubeMat);
  mesh.position.set(cubeSize + 1, cubeSize / 2, 0);
  scene.add(mesh);
}
{
  const sphereRadius = 3;
  const sphereWidthDivisions = 32;
  const sphereHeightDivisions = 16;
  const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
-  const sphereMat = new THREE.MeshPhongMaterial({color: '#CA8'});
+ const sphereMat = new THREE.MeshStandardMaterial({color: '#CA8'});
  const mesh = new THREE.Mesh(sphereGeo, sphereMat);
  mesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
  scene.add(mesh);
}
```

`RectAreaLight`를 사용하려면 별도의 데이터를 불러와야 합니다. 또한
`RectAreaLightHelper`도 같이 불러와 조명을 시각화하겠습니다.

```js
import * as THREE from './resources/three/r127/build/three.module.js';
+import { RectAreaLightUniformsLib } from './resources/threejs/r127/examples/jsm/lights/RectAreaLightUniformsLib.js';
+import { RectAreaLightHelper } from './resources/threejs/r127/examples/jsm/helpers/RectAreaLightHelper.js';
```

모듈을 불러온 후 `RectAreaLightUniformsLib.init` 메서드를 호출합니다.

```js
function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas});
+  RectAreaLightUniformsLib.init();
```

데이터를 불러오지 않아도 에러는 발생하지 않지만, 이상하게 보일 것이므로
데이터를 불러와야 한다는 것을 꼭 기억하기 바랍니다.

이제 조명을 추가합니다.

```js
const color = 0xFFFFFF;
*const intensity = 5;
+const width = 12;
+const height = 4;
*const light = new THREE.RectAreaLight(color, intensity, width, height);
light.position.set(0, 10, 0);
+light.rotation.x = THREE.MathUtils.degToRad(-90);
scene.add(light);

*const helper = new RectAreaLightHelper(light);
*light.add(helper);
```

`RectAreaLight`는 `DirectionalLight`, `SpotLight`와 달리 목표를 사용하지 않습니다.
빛의 방향은 `rotation`으로 설정할 수 있죠. 또 `RectAreaLightHelper`는 직접 조명을
자식으로 두는 다른 헬퍼 객체와 달리, 해당 조명의 자식이어야 합니다.

조명의 `rotation`, `width`, `height` 속성을 조정할 수 있도록 GUI도 수정해줍니다.

```js
const gui = new GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'intensity', 0, 10, 0.01);
gui.add(light, 'width', 0, 20);
gui.add(light, 'height', 0, 20);
gui.add(new DegRadHelper(light.rotation, 'x'), 'value', -180, 180).name('x rotation');
gui.add(new DegRadHelper(light.rotation, 'y'), 'value', -180, 180).name('y rotation');
gui.add(new DegRadHelper(light.rotation, 'z'), 'value', -180, 180).name('z rotation');

makeXYZGUI(gui, light.position, 'position');
```

{{{example url="../threejs-lights-rectarea.html" }}}

하나 설명하지 않은 것이 있습니다. 위 예제에는 `WebGLRenderer`의 `physicallyCorrectLights(물리 기반 조명)`
설정이 있습니다. 이는 거리에 따라 빛이 어떻게 떨어질지 결정하는 속성으로,
`PointLight`와 `SpotLight`가 이 설정의 영향을 받습니다. `RectAreaLight`는
마찬가지로 설정의 영향도 받고, 기본적으로 이 설정을 사용하죠.

이 설정을 사용하면 기본적으로 조명의 `distance`나 `intensity` 대신
[`power`](PointLight.power) 속성을 루멘(lumens) 단위로 설정해야 합니다.
그러면 Three.js는 물리적 계산을 통해 실제 광원을 흉내내죠. 예제의
거리 단위는 미터(meters)이니, 60w짜리 전구는 약 800루멘 정도일 겁니다.
그리고 조명의 부서짐(decay) 정도를 설정하는 [`decay`](PointLight.decay)
속성도 있습니다. 현실적인 조명을 위해서는 `2` 정도가 적당하죠.

한 번 예제를 만들어 테스트해봅시다.

먼저 `renderer`의 `physicallyCorrectLights` 속성을 켭니다.

```js
const renderer = new THREE.WebGLRenderer({canvas});
+renderer.physicallyCorrectLights = true;
```

그리고 `power`를 800루멘으로, `decay` 속성을 2로, `distance`
속성을 `Infinity`로 설정합니다.

```js
const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.PointLight(color, intensity);
light.power = 800;
light.decay = 2;
light.distance = Infinity;
```

마지막으로 GUI를 추가해 `power`와 `decay` 속성을 조정할 수 있도록
해줍니다.

```js
const gui = new GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'decay', 0, 4, 0.01);
gui.add(light, 'power', 0, 2000);
```

{{{example url="../threejs-lights-point-physically-correct.html" }}}

조명은 `renderer`가 장면을 렌더링하는 속도에 영향을 미칩니다. 그러니
가능한 적은 조명을 쓰는 게 좋죠.

다음 장에서는 [카메라 조작법](threejs-cameras.html)에 대해 알아보겠습니다.

<canvas id="c"></canvas>
<script type="module" src="resources/threejs-lights.js"></script>
