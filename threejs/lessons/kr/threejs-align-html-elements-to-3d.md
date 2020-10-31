Title: HTML 요소를 3D로 정렬하기
Description: HTML 요소를 3차원 요소에 맞춰 정렬합니다
TOC: HTML 요소를 3D로 정렬하기

※ 이 글은 Three.js의 튜토리얼 시리즈로서, 먼저 [Three.js의 기본 구조에 관한 글](threejs-fundamentals.html)을 읽고 오길 권장합니다.


때로 3D 장면에 텍스트를 넣어야 하는 경우가 있을 겁니다. 방법이야 다양하지만 각기 장단점이 있죠.

* 3D 텍스트를 쓴다.

    [원시 모델에 관한 글](threejs-primitives.html)을 보면 `TextBufferGeometry`로 3D 텍스트를 만든 예제를 찾을 수 있을 겁니다. 로고에 애니메이션을 준다던가 하는 경우에는 유용하지만 상태, 정보, 이름 등을 붙이는 경우라면 오히려 불편하겠죠.

* 2D 텍스트로 텍스처를 만들어 렌더링한다.

    [캔버스를 텍스처로 활용하기](threejs-canvas-textures.html)를 보면 캔버스를 텍스처로 활용하는 방법이 나옵니다. 캔버스에 텍스처를 렌더링하고 이 [캔버스를 광고판처럼 렌더링](threejs-billboards.html)하는 거죠. 이 방법의 장점은 텍스트가 3D 장면 안에 포함된다는 겁니다. 컴퓨터 화면에 나타난 텍스트 등을 렌더링하려면 이 방법이 가장 적당하겠죠.

* HTML 요소의 위치를 3D에 맞춘다.

    이 방법의 장점은 HTML의 모든 기능을 사용할 수 있다는 겁니다. HTML에 자식 요소를 얼마든지 추가할 수도 있고, CSS로 스타일을 지정할 수도 있고, 실제 텍스트이니 사용자가 직접 선택할 수도 있죠.

이 글에서는 맨 마지막 방법에 대해 다룰 겁니다.

간단한 것부터 시작해보죠. 원시 모델 위에 이름표를 붙인 3D 장면을 구현할 겁니다. 예제는 [반응형 디자인에 관한 글](threejs-responsive.html)의 예제를 수정해 쓰도록 하죠.

여기에 `OrbitControls`를 넣습니다. [조명에 관한 글](threejs-lights.html)에서 다뤘었죠.

```js
import * as THREE from './resources/three/r122/build/three.module.js';
+import { OrbitControls } from './resources/threejs/r122/examples/jsm/controls/OrbitControls.js';
```

```js
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0, 0);
controls.update();
```

이름표를 담을 HTML 요소도 추가합니다.

```html
<body>
-  <canvas id="c"></canvas>
+  <div id="container">
+    <canvas id="c"></canvas>
+    <div id="labels"></div>
+  </div>
</body>
```

캔버스 요소와 `<div id="labels">`를 `<div id="container">`의 자식으로 둔 뒤 CSS로 서로 겹치게 합니다.

```css
#c {
-    width: 100%;
-    height: 100%;
+    width: 100%;  /* id=container가 사이즈를 결정하도록 합니다. */
+    height: 100%;
    display: block;
}
+#container {
+  position: relative;  /* 자식이 이 요소를 기준 삼도록 합니다. */
+  width: 100%;
+  height: 100%;
+  overflow: hidden;
+}
+#labels {
+  position: absolute;  /* 캔버스 위에 자리잡도록 합니다. */
+  left: 0;             /* id=container 위 왼쪽에 기준하도록 합니다. */
+  top: 0;
+  color: white;
+}
```

이름표의 CSS도 작성합니다.

```css
#labels > div {
  position: absolute;  /* 캔버스 위에 자리잡도록 합니다.  */
  left: 0;             /* 부모의 위 왼쪽에 기준하도록 합니다. */
  top: 0;
  cursor: pointer;     /* 포인터가 위에 올라갔을 때 포인터 스타일을 바꿉니다. */
  font-size: large;
  user-select: none;   /* 텍스트를 선택할 수 없도록 합니다. */
  text-shadow:         /* 글자에 검은 테두리를 두릅니다. */
    -1px -1px 0 #000,
     0   -1px 0 #000,
     1px -1px 0 #000,
     1px  0   0 #000,
     1px  1px 0 #000,
     0    1px 0 #000,
    -1px  1px 0 #000,
    -1px  0   0 #000;
}
#labels > div:hover {
  color: red;
}

```

자바스크립트 쪽은 수정사항이 많지 않습니다. `makeInstance`라는 함수에서 정육면체를 만들 때 이름표 요소(element)를 같이 만들도록 바꿉니다.

```js
+const labelContainerElem = document.querySelector('#labels');

-function makeInstance(geometry, color, x) {
+function makeInstance(geometry, color, x, name) {
  const material = new THREE.MeshPhongMaterial({ color });

  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  cube.position.x = x;

+  const elem = document.createElement('div');
+  elem.textContent = name;
+  labelContainerElem.appendChild(elem);

-  return cube;
+  return { cube, elem };
}
```

이제 각 정육면체를 만들 때 새로운 `<div>` 요소를 `<div id="labels">`에 추가할 겁니다. 또한 정육면체(`cube`)만 반환하는 게 아니라 이름표 요소(`label`)를 같이 반환합니다.

함수를 호출할 때 이름을 같이 넘겨주도록 바꿉니다.

```js
const cubes = [
-  makeInstance(geometry, 0x44aa88,  0),
-  makeInstance(geometry, 0x8844aa, -2),
-  makeInstance(geometry, 0xaa8844,  2),
+  makeInstance(geometry, 0x44aa88,  0, 'Aqua'),
+  makeInstance(geometry, 0x8844aa, -2, 'Purple'),
+  makeInstance(geometry, 0xaa8844,  2, 'Gold'),
];
```

이제 렌더링 시 이름표의 위치만 정해주면 끝입니다.

```js
const tempV = new THREE.Vector3();

...

-cubes.forEach((cube, ndx) => {
+cubes.forEach((cubeInfo, ndx) => {
+  const { cube, elem } = cubeInfo;
  const speed = 1 + ndx * .1;
  const rot = time * speed;
  cube.rotation.x = rot;
  cube.rotation.y = rot;

+  // 정육면체의 중심 좌표를 가져옵니다.
+  cube.updateWorldMatrix(true, false);
+  cube.getWorldPosition(tempV);
+
+  /**
+   * 정규화(normalize)된 화면 상의 현재 좌표값을 가져옵니다.
+   * x와 y의 범위는 -1에서 +1까지로, x = -1은 왼쪽, y = -1은 아래쪽입니다.
+   **/
+  tempV.project(camera);
+
+  // 정규화된 위치값을 CSS 좌표로 바꿉니다.
+  const x = (tempV.x *  .5 + .5) * canvas.clientWidth;
+  const y = (tempV.y * -.5 + .5) * canvas.clientHeight;
+
+  // 이름표 요소를 해당 좌표로 옮깁니다.
+  elem.style.transform = `translate(-50%, -50%) translate(${ x }px,${ y }px)`;
});
```

{{{example url="../threejs-align-html-to-3d.html" }}}

하지만 좀 어색합니다. 몇 가지 개선해야 할 점들이 보이네요.

먼저 정육면체들을 돌려 정육면체가 겹치도록 하니 이름표도 겹쳐 보입니다.

<div class="threejs_center"><img src="resources/images/overlapping-labels.png" style="width: 307px;"></div>

또 화면을 축소해 정육면체가 절두체(frustum) 밖으로 벗어나게 해도 이름표가 여전히 보입니다.

이름표가 겹쳐 보이는 건 [피킹에 관한 글](threejs-picking.html)에서 썼던 기법을 이용해 해결할 수 있습니다. 이름표 위치에서 `RayCaster`로 광선을 쏴 처음으로 걸리는 물체가 이름표와 짝이 아니라면 이름표를 보이지 않게 하는 것이죠.

```js
const tempV = new THREE.Vector3();
+const raycaster = new THREE.Raycaster();

...

cubes.forEach((cubeInfo, ndx) => {
  const {cube, elem} = cubeInfo;
  const speed = 1 + ndx * .1;
  const rot = time * speed;
  cube.rotation.x = rot;
  cube.rotation.y = rot;

  // 정육면체의 중심 좌표를 가져옵니다.
  cube.updateWorldMatrix(true, false);
  cube.getWorldPosition(tempV);

  /**
   * 정규화(normalize)된 화면 상의 현재 좌표값을 가져옵니다.
   * x와 y의 범위는 -1에서 +1까지로, x = -1은 왼쪽, y = -1은 아래쪽입니다.
   **/
  tempV.project(camera);

+  // raycaster로 이름표의 시점과 만나는 물체를 구합니다.
+  raycaster.setFromCamera(tempV, camera);
+  const intersectedObjects = raycaster.intersectObjects(scene.children);
+  // 짝궁 정육면체가 제일 처음 보이는 물체와 같다면 이름표를 보이게 합니다.
+  const show = intersectedObjects.length && cube === intersectedObjects[0].object;
+
+  if (!show) {
+    // 이름표를 숨깁니다.
+    elem.style.display = 'none';
+  } else {
+    // 이름표를 보이게 합니다.
+    elem.style.display = '';

    // 정규화된 위치값을 CSS 좌표로 바꿉니다.
    const x = (tempV.x *  .5 + .5) * canvas.clientWidth;
    const y = (tempV.y * -.5 + .5) * canvas.clientHeight;

    // 이름표 요소를 해당 좌표로 옮깁니다.
    elem.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;
+  }
});
```

겹치는 문제를 해결했습니다.

절두체 밖으로 나갔을 경우의 문제를 해결해봅시다. `tempV.z` 값으로 정육면체의 중심이 절두체 밖으로 나갔는지를 확인해 해결할 수 있을 것 같네요.

```js
-  if (!show) {
+  if (!show || Math.abs(tempV.z) > 1) {
    // 이름표를 숨깁니다.
    elem.style.display = 'none';
```

잘 적용된 것 같지만 뭔가 *2% 부족*합니다. 이전에 계산했던 정규화된 좌표에는 `z`값이 있고, 이 값의 -1은 카메라의 `near`, +1은 `far`을 의미하거든요.

{{{example url="../threejs-align-html-to-3d-w-hiding.html" }}}

위 방법은 물체의 중점을 기준으로 이름표의 노출 여부를 계산하기에 실제로 사용하기 어렵습니다. 큰 물체의 경우 중점이 절두체의 바깥에 있더라도 나머지 반쪽은 절두체 안에 있을 수 있으니까요.

더 정확한 방법은 해당 물체가 절두체 안에 있는지 확인하는 겁니다. 물론 더 많은 연산이 필요하겠죠. 정육면체 3개 정도야 크게 부담이 되진 않을지 몰라도 물체가 많아지면 그만큼 연산 부담도 커질 겁니다.

Three.js에는 물체의 경계 구체(bounding sphere)가 절두체 안에 있는지 계산해주는 함수가 있습니다.

```js
// 초기화 단계
const frustum = new THREE.Frustum();
const viewProjection = new THREE.Matrix4();

...

// 좌표 확인 전
camera.updateMatrix();
camera.updateMatrixWorld();
camera.matrixWorldInverse.getInverse(camera.matrixWorld);

...

// 각 mesh마다 좌표를 업데이트합니다.
someMesh.updateMatrix();
someMesh.updateMatrixWorld();

viewProjection.multiplyMatrices(
    camera.projectionMatrix, camera.matrixWorldInverse);
frustum.setFromProjectionMatrix(viewProjection);
const inFrustum = frustum.contains(someMesh));
```

지금의 예제는 피킹을 사용하기에 성능이 다소 느립니다. [피킹에 관한 글](threejs-picking.html)에서 다뤘듯 GPU 기반 피킹을 쓸 수도 있지만 구현하기가 복잡하죠. 어떤 방법을 적용할지는 상황을 보고 판단해야 합니다.

또 이름표가 나타나는 순서에도 문제가 있습니다. 현재 예제의 이름표를 더 길게 바꿔보죠.

```js
const cubes = [
-  makeInstance(geometry, 0x44aa88,  0, 'Aqua'),
-  makeInstance(geometry, 0x8844aa, -2, 'Purple'),
-  makeInstance(geometry, 0xaa8844,  2, 'Gold'),
+  makeInstance(geometry, 0x44aa88,  0, 'Aqua Colored Box'),
+  makeInstance(geometry, 0x8844aa, -2, 'Purple Colored Box'),
+  makeInstance(geometry, 0xaa8844,  2, 'Gold Colored Box'),
];
```

CSS도 바꿔 줄바꿈이 일어나지 않도록 합니다.

```css
#labels > div {
+  white-space: nowrap;
```

이러면 아래와 같은 문제가 나타납니다.

<div class="threejs_center"><img src="resources/images/label-sorting-issue.png" style="width: 401px;"></div>

위 그림에서 보라색 정육면체는 청록색 정육면체의 뒤에 있지만, 보라색 정육면체의 이름표는 청록색 정육면체의 앞에 있습니다.

이름표 요소에 `z-index` 스타일을 지정해 이 문제를 해결할 수 있습니다. 계산된 위치값에는 -1이 앞, 1이 뒤를 의미하는 `z`값이 있죠. `z-index`값은 정수이고 값이 클수록 앞에 위치하니 다음과 같이 하면 제대로 정렬될 겁니다.

```js
// 정규화된 위치값을 CSS 좌표로 바꿉니다.
const x = (tempV.x *  .5 + .5) * canvas.clientWidth;
const y = (tempV.y * -.5 + .5) * canvas.clientHeight;

// 이름표 요소를 해당 좌표로 옮깁니다.
elem.style.transform = `translate(-50%, -50%) translate(${ x }px,${ y }px)`;

+// 정렬을 위해 z-index 값을 설정합니다.
+elem.style.zIndex = (-tempV.z * .5 + .5) * 100000 | 0;
```

z값은 소수점 단위의 값이기에 충분히 큰 숫자를 지정하지 않으면 비슷한 z-index가 지정될 수 있습니다. 또한 이름표가 페이지의 다른 요소를 가리지 않도록 이름표 컨테이너 요소의 `z-index`를 설정합니다. 이러면 브라우저가 새 [쌓임 컨텍스트(stacking context)](https://developer.mozilla.org/ko/docs/Web/CSS/CSS_Positioning/Understanding_z_index/The_stacking_context)를 만들어 이름표의 `z-index`가 아무리 커도 다른 페이지 요소의 위에 올라가지 않도록 할 수 있습니다.

```css
#labels {
  position: absolute;  /* 캔버스 위에 자리잡도록 합니다.  */
+  z-index: 0;          /* 새 쌓임 컨테스트를 만들어 자식 요소가 페이지의 다른 요소와 엉키지 않도록 합니다. */
  left: 0;             /* 부모의 위 왼쪽에 기준하도록 합니다. */
  top: 0;
  color: white;
  z-index: 0;
}
```

이제 이름표가 제대로 정렬되어 보일 겁니다.

{{{example url="../threejs-align-html-to-3d-w-sorting.html" }}}

여기서 끝낼 수도 있으나 예제를 하나 더 만들어 복잡한 상황에서 발생할 수 있는 문제를 알아보겠습니다. 구글 맵같은 지구본을 만들어 각 나라의 이름을 표시해보도록 하죠.

인터넷을 뒤져 [각 나라의 영역 데이터](http://thematicmapping.org/downloads/world_borders.php)를 찾았습니다. 라이선스는 [CC-BY-SA](http://creativecommons.org/licenses/by-sa/3.0/)네요.

개인적으로 [코드를 작성](https://github.com/gfxfundamentals/threejsfundamentals/blob/master/threejs/lessons/tools/geo-picking/)해 각 나라의 윤곽선을 만들고 나라의 이름과 위치를 JSON 데이터로 만들었습니다. 

<div class="threejs_center"><img src="../resources/data/world/country-outlines-4k.png" style="background: black; width: 700px"></div>

JSON 데이터는 아래와 같은 형태의 배열입니다.

```json
[
  {
    "name": "Algeria",
    "min": [
      -8.667223,
      18.976387
    ],
    "max": [
      11.986475,
      37.091385
    ],
    "area": 238174,
    "lat": 28.163,
    "lon": 2.632,
    "population": {
      "2005": 32854159
    }
  },
  ...
```

min, max, lat, lon은 나라의 위도(latitude)와 경도(longitude)를 나타냅니다.

데이터를 실제로 사용해봅시다. [다중 요소 렌더링 최적화하기](threejs-optimize-lots-of-objects.html)에서 썼던 예제를 기반으로 사용하겠습니다. 물론 많은 요소를 렌더링하는 건 아니지만, 기존 코드에 포함되어 있는 [불필요한 렌더링 제거 기법](threejs-rendering-on-demand.html)도 그대로 사용할 겁니다.

먼저 구체를 만들고 각 나라의 육곽선 텍스처를 입힙니다.

```js
{
  const loader = new THREE.TextureLoader();
  const texture = loader.load('resources/data/world/country-outlines-4k.png', render);
  const geometry = new THREE.SphereBufferGeometry(1, 64, 32);
  const material = new THREE.MeshBasicMaterial({ map: texture });
  scene.add(new THREE.Mesh(geometry, material));
}
```

다음으로 로더를 만들어 JSON 파일을 불러옵니다.

```js
async function loadJSON(url) {
  const req = await fetch(url);
  return req.json();
}

...

let countryInfos;
async function loadCountryData() {
  countryInfos = await loadJSON('resources/data/world/country-info.json');
     ...
  }
  requestRenderIfNotRequested();
}
loadCountryData();
```

불러온 데이터로 각 나라와 이름표를 생성합니다.

[다중 요소 렌더링 최적화하기](threejs-optimize-lots-of-objects.html)에서 씬 그래프를 활용해 지구본의 위도와 경도를 계산했었죠. 이번에도 계산을 단순화하기 위해 이 방법을 그대로 사용합니다. 아래 코드가 어떻게 작동하는가에 대해서는 원본 글을 참고하기 바랍니다.

```js
const lonFudge = Math.PI * 1.5;
const latFudge = Math.PI;
// 아래 헬퍼 Object3D는 육면체들의 위치 변화를 간단하게 만들어줍니다.
// lonHelper를 Y축으로 돌려 경도(longitude)를 맞출 수 있습니다.
const lonHelper = new THREE.Object3D();
// latHelper를 X축으로 돌려 위도(latitude)를 맞출 수 있습니다.
const latHelper = new THREE.Object3D();
lonHelper.add(latHelper);
// positionHelper는 다른 요소의 기준축을 구체의 끝에 맞추는 역할을 합니다.
const positionHelper = new THREE.Object3D();
positionHelper.position.z = 1;
latHelper.add(positionHelper);
```

각 이름표의 좌표를 계산합니다.

```js
const labelParentElem = document.querySelector('#labels');
for (const countryInfo of countryInfos) {
  const { lat, lon, name } = countryInfo;

  // 헬퍼가 위도와 경도를 가리키게 바꿉니다.
  lonHelper.rotation.y = THREE.MathUtils.degToRad(lon) + lonFudge;
  latHelper.rotation.x = THREE.MathUtils.degToRad(lat) + latFudge;

  // 위도와 경도를 구합니다.
  positionHelper.updateWorldMatrix(true, false);
  const position = new THREE.Vector3();
  positionHelper.getWorldPosition(position);
  countryInfo.position = position;

  // 각 나라마다 텍스트 요소를 추가합니다.
  const elem = document.createElement('div');
  elem.textContent = name;
  labelParentElem.appendChild(elem);
  countryInfo.elem = elem;
```

위 코드는 아까와 비슷하게 각 나라마다 텍스트 요소를 만들었습니다. 이전에는 따로 배열을 두었지만 이번에는 각 나라에 대한 정보가 있는 `contryInfos`가 있죠. 이 요소의 `elem` 속성에 이름표 요소를, 지구본 위의 위치값을 `position` 속성에 지정했습니다.

또한 정육면체 예제와 마찬가지로 이름표의 위치를 렌더링 시에 업데이트하도록 합니다.

```js
const tempV = new THREE.Vector3();

function updateLabels() {
  // JSON 파일을 아직 불러오지 않았을 경우
  if (!countryInfos) {
    return;
  }

  for (const countryInfo of countryInfos) {
    const {position, elem} = countryInfo;

    /**
     * 정규화(normalize)된 화면 상의 현재 좌표값을 가져옵니다.
     * x와 y의 범위는 -1에서 +1까지로, x = -1은 왼쪽, y = -1은 아래쪽입니다.
     **/
    tempV.copy(position);
    tempV.project(camera);

    // 정규화된 위치값을 CSS 좌표로 바꿉니다.
    const x = (tempV.x *  .5 + .5) * canvas.clientWidth;
    const y = (tempV.y * -.5 + .5) * canvas.clientHeight;

    // 이름표 요소를 해당 좌표로 옮깁니다.
    elem.style.transform = `translate(-50%, -50%) translate(${ x }px,${ y }px)`;

    // 정렬을 위해 z-index 값을 설정합니다.
    elem.style.zIndex = (-tempV.z * .5 + .5) * 100000 | 0;
  }
}
```

위 코드는 이전 예제와 대체로 비슷합니다. 이름표의 위치를 초기화할 때 미리 계산한다는 것만 다르죠. 지구본이 움직이는 게 아니라 카메라가 움직이기에 이렇게 구현할 수 있습니다.

다음으로 렌더링 루프에서 `updateLabels` 함수를 호출합니다.

```js
function render() {
  renderRequested = false;

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  controls.update();

+  updateLabels();

  renderer.render(scene, camera);
}
```

결과를 보죠.

{{{example url="../threejs-align-html-elements-to-3d-globe-too-many-labels.html" }}}

이름표가 넘쳐 나네요!

문제를 따져보자면 크게 2가지입니다.

1. 카메라 반대편을 바라보는 이름표도 나타난다.

2. 이름표가 너무 많아 읽기가 힘들다.

문제 #1번은 이전처럼 `RayCaster`를 사용할 수가 없습니다. 감지할 수 있는 게 구체밖에 없거든요. 대신 특정 나라가 카메라에 보이는지는 확인할 수 있을 겁니다. 지금 예제의 이름표들은 반지름이 1.0인 구체의 바깥면에 있습니다. 이미 구체 단위로 정렬이 된 것이니 계산이 그나마 쉽겠죠.

```js
const tempV = new THREE.Vector3();
+const cameraToPoint = new THREE.Vector3();
+const cameraPosition = new THREE.Vector3();
+const normalMatrix = new THREE.Matrix3();

function updateLabels() {
  // JSON 파일을 아직 불러오지 않았을 경우
  if (!countryInfos) {
    return;
  }

+  const minVisibleDot = 0.2;
+  // 카메라의 상대 방향을 나타내는 행렬 좌표를 가져옵니다.
+  normalMatrix.getNormalMatrix(camera.matrixWorldInverse);
+  // 카메라의 위치를 가져옵니다.
+  camera.getWorldPosition(cameraPosition);
  for (const countryInfo of countryInfos) {
    const { position, elem } = countryInfo;

+    /**
+     * 카메라의 방향에 기반해 위치를 조정합니다.
+     * 구체는 중점에 있고 구체의 반지름이 한 칸이기에 아래는
+     * 카메라에 상대적인 위치 벡터를 반환합니다.
+     **/
+    tempV.copy(position);
+    tempV.applyMatrix3(normalMatrix);
+
+    // 카메라로부터 이 위치까지의 거리를 계산합니다.
+    cameraToPoint.copy(position);
+    cameraToPoint.applyMatrix4(camera.matrixWorldInverse).normalize();
+
+    /**
+     * 카메라에서 현재 위치의 방향(벡터)값으로 카메라에서 지구본 위 위치값까지의
+     * 방향값을 구한 뒤, 이 값들로 스칼라곱을 구합니다.
+     * 1 = 카메라를 바라봄
+     * 0 = 카메라가 구체를 바라봤을 때 구체의 탄젠트(tangent) 지점에 있음
+     * < 0 = 다른 쪽을 바라봄
+     **/
+    const dot = tempV.dot(cameraToPoint);
+
+    // 카메라를 바라보지 않는다면 이름표를 숨깁니다.
+    if (dot < minVisibleDot) {
+      elem.style.display = 'none';
+      continue;
+    }
+
+    // 이름표 요소에 기존 display 스타일이 적용되도록 합니다.
+    elem.style.display = '';

    /**
     * 정규화(normalize)된 화면 상의 현재 좌표값을 가져옵니다.
     * x와 y의 범위는 -1에서 +1까지로, x = -1은 왼쪽, y = -1은 아래쪽입니다.
     **/
    tempV.copy(position);
    tempV.project(camera);

    // 정규화된 위치값을 CSS 좌표로 바꿉니다.
    const x = (tempV.x *  .5 + .5) * canvas.clientWidth;
    const y = (tempV.y * -.5 + .5) * canvas.clientHeight;

    // 이름표 요소를 해당 좌표로 옮깁니다.
    elem.style.transform = `translate(-50%, -50%) translate(${ x }px,${ y }px)`;

    // 정렬을 위해 z-index 값을 설정합니다.
    elem.style.zIndex = (-tempV.z * .5 + .5) * 100000 | 0;
  }
}
```

위 코드는 위치값을 방향(벡터)값으로 써 카메라에 상대적인 위치값을 구합니다. 그리고 카메라에서 지구본 위 해당 위치값까지의 방향값을 구해 이걸로 *스칼라곱(dot product)*을 구하죠. 이 스칼라곱은 각 벡터 사이의 각도의 코사인값입니다. 이 값이 -1이면 이름표가 카메라를 바라본다는 것이고, 0은 완벽하게 구체 가장자리에 있다는 것, 0보다 크면 구체의 뒤에 있다는 것을 의미하죠.

<div class="spread">
  <div>
    <div data-diagram="dotProduct" style="height: 400px"></div>
  </div>
</div>

위 그림에서 이름표(label)가 바라보는 방향과 카메라가 이름표를 바라보는 방향의 스칼라곱을 확인할 수 있습니다. GUI로 이름표를 돌리면 스칼라곱이 -1.0일 때는 이름표가 완벽히 카메라를 바라보고, 0.0일 때는 두 화살표가 서로 완전히 수직이 됩니다. 90도, 그러니까 스칼라곱이 0보다 클 때는 이름표가 구체 뒤로 가죠.

다음으로 #2번 문제, 이름표가 너무 많이 뭉쳐 있는 문제를 해결해봅시다. 일단 이름표의 노출 여부를 결정할 방법을 마련해야 합니다. 한 방법은 땅덩어리가 큰 나라만 우선 보여주는 겁니다. 아까 불러온 데이터에 나라가 차지하는 영역에 대한 min, max 값이 있었죠. 이를 이용해 각 나라의 영역 크기을 계산하면 어떤 나라를 우선적으로 보여줄지 결정할 수 있을 겁니다.

먼저 초기화 시에 미리 영역 크기를 계산합니다.

```js
const labelParentElem = document.querySelector('#labels');
for (const countryInfo of countryInfos) {
  const { lat, lon, min, max, name } = countryInfo;

  // 헬퍼가 위도와 경도를 가리키게 바꿉니다.
  lonHelper.rotation.y = THREE.MathUtils.degToRad(lon) + lonFudge;
  latHelper.rotation.x = THREE.MathUtils.degToRad(lat) + latFudge;

  // 위도와 경도를 구합니다.
  positionHelper.updateWorldMatrix(true, false);
  const position = new THREE.Vector3();
  positionHelper.getWorldPosition(position);
  countryInfo.position = position;

+  // 각 나라의 영영 크기를 계산합니다.
+  const width = max[0] - min[0];
+  const height = max[1] - min[1];
+  const area = width * height;
+  countryInfo.area = area;

  // 각 나라마다 텍스트 요소를 추가합니다.
  const elem = document.createElement('div');
  elem.textContent = name;
  labelParentElem.appendChild(elem);
  countryInfo.elem = elem;
}
```

그리고 렌더링 루프에서 영역 크기를 기반으로 이름표의 노출 여부를 결정합니다.

```js
+const large = 20 * 20;
const maxVisibleDot = 0.2;
// 카메라의 상대 방향을 나타내는 행렬 좌표를 가져옵니다.
normalMatrix.getNormalMatrix(camera.matrixWorldInverse);
// 카메라의 위치를 가져옵니다.
camera.getWorldPosition(cameraPosition);
for (const countryInfo of countryInfos) {
-  const { position, elem } = countryInfo;
+  const { position, elem, area } = countryInfo;
+  // 영역이 특정 값보다 작다면 이름표를 표시하지 않습니다.
+  if (area < large) {
+    elem.style.display = 'none';
+    continue;
+  }

  ...
```

마지막으로 어떤 값이 적당한지 알기 어려우니 이 값을 조정할 수 있도록 GUI를 추가합니다.

```js
import * as THREE from './resources/three/r122/build/three.module.js';
import { OrbitControls } from './resources/threejs/r122/examples/jsm/controls/OrbitControls.js';
+import { GUI } from '../3rdparty/dat.gui.module.js';
```

```js
+const settings = {
+  minArea: 20,
+  maxVisibleDot: -0.2,
+};
+const gui = new GUI({ width: 300 });
+gui.add(settings, 'minArea', 0, 50).onChange(requestRenderIfNotRequested);
+gui.add(settings, 'maxVisibleDot', -1, 1, 0.01).onChange(requestRenderIfNotRequested);

function updateLabels() {
  if (!countryInfos) {
    return;
  }

-  const large = 20 * 20;
-  const maxVisibleDot = -0.2;
+  const large = settings.minArea * settings.minArea;
  // 카메라의 상대 방향을 나타내는 행렬 좌표를 가져옵니다.
  normalMatrix.getNormalMatrix(camera.matrixWorldInverse);
  // 카메라의 위치를 가져옵니다.
  camera.getWorldPosition(cameraPosition);
  for (const countryInfo of countryInfos) {

    ...

    // 카메라를 바라보지 않는다면 이름표를 숨깁니다.
-   if (dot > maxVisibleDot) {
+   if (dot > settings.maxVisibleDot) {
      elem.style.display = 'none';
      continue;
    }
```

이제 결과를 보죠.

{{{example url="../threejs-align-html-elements-to-3d-globe.html" }}}

지구본을 돌려보면 뒤로 간 이름표가 사라지는 걸 확인할 수 있습니다. `minVisibleDot` 값을 조정하면 사라지는 지점이 변하고, `minArea` 값을 조정하면 영역이 더 작은/큰 나라를 볼 수 있죠.

작업을 진행할수록 구글 맵을 구현하는 데 굉장히 많은 노력이 들어갔겠구나 하는 생각이 들었습니다. 아마 구글 팀도 여러 기준을 사용했을 겁니다. 사용자의 현재 위치나 기본 언어 설정, 로그인되어 있다면 계정 설정, 또는 인기도나 임의의 우선 순위를 설정해서 보여주는 등 기준으로 삼을 수 있는 건 무궁무진하죠.

모든 상황을 다 가정할 수는 없지만, 이 글이 HTML 요소를 3D 요소에 맞춰 정렬하는 데 도움이 되었으면 합니다. 아마 몇 가지 내용은 나중에 바뀔 수도 있으니 참고해주세요.

다음 글에서는 더 나아가 [지구본 위의 나라를 선택하고 강조](threejs-indexed-textures.html)해보겠습니다.

<link rel="stylesheet" href="resources/threejs-align-html-elements-to-3d.css">
<script type="module" src="resources/threejs-align-html-elements-to-3d.js"></script>
