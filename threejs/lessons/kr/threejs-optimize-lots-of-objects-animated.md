Title: 다중 애니메이션 요소 최적화하기
Description: Morphtargets으로 합쳐진 요소에 애니메이션을 넣는 법을 알아봅니다
TOC: 애니메이션 요소가 많을 때 최적화하는 방법

※ 이 글은 [다중 요소 최적화하기](threejs-optimize-lots-of-objects.html)에서 이어지는 글입니다. 이전 글을 읽지 않았다면 먼저 읽고 오기 바랍니다.


이전 글에서는 약 19000 육면체를 하나의 geometry로 만들었습니다. 이 방법을 적용해 렌더링 속도는 눈에 띄게 빨라졌지만, 각 육면체를 움직이기 어렵다는 게 단점이었죠.

구현하고자 하는 바에 따라 해결책은 천차만별입니다. 이 글에서는 여러 데이터 그룹(set)을 그래프로 만들어 각 그룹을 전환할 때 애니메이션을 넣는 경우를 살펴보겠습니다.

먼저 데이터를 그룹으로 묶어야 합니다. 프로그램 밖에서 데이터를 미리 가공하는 게 이상적이지만, 여기서는 데이터 2개를 따로 불러오겠습니다.

아래는 기존 코드입니다.

```js
loadFile('resources/data/gpw/gpw_v4_basic_demographic_characteristics_rev10_a000_014mt_2010_cntm_1_deg.asc')
  .then(parseData)
  .then(addBoxes)
  .then(render);
```

아래와 같은 식으로 바꿔줍니다.

```js
async function loadData(info) {
  const text = await loadFile(info.url);
  info.file = parseData(text);
}

async function loadAll() {
  const fileInfos = [
    { name: 'men',   hueRange: [0.7, 0.3], url: 'resources/data/gpw/gpw_v4_basic_demographic_characteristics_rev10_a000_014mt_2010_cntm_1_deg.asc' },
    { name: 'women', hueRange: [0.9, 1.1], url: 'resources/data/gpw/gpw_v4_basic_demographic_characteristics_rev10_a000_014ft_2010_cntm_1_deg.asc' },
  ];

  await Promise.all(fileInfos.map(loadData));

  ...
}
loadAll();
```

위 코드는 `fileInfos` 배열에 있는 파일을 불러오고, 각 파일의 로딩이 끝났을 때 해당 객체의 `file` 속성에 불러온 파일을 지정합니다. `name`과 `hueRange`는 나중에 사용할 속성으로, `name`은 UI에, `hueRange`는 색상 맵을 지정할 때 사용할 겁니다.

새로 불러온 파일은 각각 2010년도 지역별 남성 인구 밀도, 지역별 여성 인구 밀도를 나타냅니다. 믿을 만한 데이터인지는 모르겠지만 당장 크게 중요하진 않으니 넘어가죠. 중요한 건 값이 다른 데이터를 보여주는 것에 있으니까요.

여기에 2개의 데이터를 더 만듭니다. 하나는 남성 인구가 여성 인구보다 많은 곳, 나머지는 그 반대로 여성 인구가 남성 인구보다 많은 곳의 데이터입니다.

먼저 2차원 배열을 매개변수로 받아 배열 속 배열을 매핑하는 함수를 하나 작성합니다.

```js
function mapValues(data, fn) {
  return data.map((row, rowNdx) => {
    return row.map((value, colNdx) => {
      return fn(value, rowNdx, colNdx);
    });
  });
}
```

`Array.map` 메서드와 마찬가지로 `mapValues` 함수는 배열 속 배열의 요소에 매개변수로 받은 `fn` 함수를 실행합니다. 이 함수는 해당 배열값과 행 인덱스, 열 인덱스를 매개변수로 사용합니다.

다음으로 두 파일을 배교해 새로운 파일을 만드는 함수를 작성합니다.

```js
function makeDiffFile(baseFile, otherFile, compareFn) {
  let min;
  let max;
  const baseData = baseFile.data;
  const otherData = otherFile.data;
  const data = mapValues(baseData, (base, rowNdx, colNdx) => {
    const other = otherData[rowNdx][colNdx];
      if (base === undefined || other === undefined) {
        return undefined;
      }
      const value = compareFn(base, other);
      min = Math.min(min === undefined ? value : min, value);
      max = Math.max(max === undefined ? value : max, value);
      return value;
  });
  // baseFile을 복사한 뒤 min, max, data를 새 값으로 교체합니다.
  return {...baseFile, min, max, data};
}
```

위 함수는 `mapValues` 안에서 넘겨받은 `compareFn`으로 값을 비교해 새로운 데이터 그룹을 만듭니다. 또한 값의 `min`, `max`를 계속 추적해 `baseFile`을 기반으로 `min`, `max`, `data` 속성을 교체한 새로운 파일을 만듭니다.

이제 이 함수들로 새로운 데이터를 만들어봅시다.

```js
{
  const menInfo = fileInfos[0];
  const womenInfo = fileInfos[1];
  const menFile = menInfo.file;
  const womenFile = womenInfo.file;

  function amountGreaterThan(a, b) {
    return Math.max(a - b, 0);
  }
  fileInfos.push({
    name: '>50%men',
    hueRange: [0.6, 1.1],
    file: makeDiffFile(menFile, womenFile, (men, women) => {
      return amountGreaterThan(men, women);
    }),
  });
  fileInfos.push({
    name: '>50% women', 
    hueRange: [0.0, 0.4],
    file: makeDiffFile(womenFile, menFile, (women, men) => {
      return amountGreaterThan(women, men);
    }),
  });
}
```

이제 간단한 UI를 만들어 각 데이터를 선택할 수 있게 합니다. 먼저 UI용 HTML 요소를 추가합니다.

```html
<body>
  <canvas id="c"></canvas>
+  <div id="ui"></div>
</body>
```

추가한 요소를 CSS로 상단 왼쪽에 위치하게 합니다.

```css
#ui {
  position: absolute;
  left: 1em;
  top: 1em;
}
#ui > div {
  font-size: 20pt;
  padding: 1em;
  display: inline-block;
}
#ui > div.selected {
  color: red;
}
```

그리고 각 파일의 육면체 그래프를 만들어 하나로 합친 뒤, 이벤트용 요소를 하나 만듭니다. 이 요소에 마우스를 올리면 대응하는 데이터를 제외한 나머지는 숨기고 해당 데이터만 보이도록 할 겁니다.

```js
// 선택한 데이터만 보이게 하고, 나머지는 숨깁니다.
function showFileInfo(fileInfos, fileInfo) {
  fileInfos.forEach((info) => {
    const visible = fileInfo === info;
    info.root.visible = visible;
    info.elem.className = visible ? 'selected' : '';
  });
  requestRenderIfNotRequested();
}

const uiElem = document.querySelector('#ui');
fileInfos.forEach((info) => {
  const boxes = addBoxes(info.file, info.hueRange);
  info.root = boxes;
  const div = document.createElement('div');
  info.elem = div;
  div.textContent = info.name;
  uiElem.appendChild(div);
  div.addEventListener('mouseover', () => {
    showFileInfo(fileInfos, info);
  });
});
// 첫 번째 데이터를 먼저 렌더링합니다.
showFileInfo(fileInfos, fileInfos[0]);
```

추가로 이전 예제에서 하드 코딩했던 색상값을 `hueRange`로 쓰도록 바꿉니다.

```js
-function addBoxes(file) {
+function addBoxes(file, hueRange) {

  ...

    // 색상값을 구합니다
-    const hue = THREE.MathUtils.lerp(0.7, 0.3, amount);
+    const hue = THREE.MathUtils.lerp(...hueRange, amount);

  ...
```

이제 4가지 데이터를 볼 수 있을 겁니다. 각 이름에 마우스를 올리거나 터치하면 해당 데이터로 바뀝니다.

{{{example url="../threejs-lots-of-objects-multiple-data-sets.html" }}}

뭔가 앞뒤가 맞지 않는 데이터가 몇 개 보입니다. 대체 무슨 영문인지 모르겠네요. 어쨌든 일단은 이 4가지 데이터가 자연스럽게 바뀌도록 애니메이션을 넣는 데 집중합시다.

당장 떠오르는 방법은 3가지 정도입니다.

* `Material.opacity`를 이용해 페이드 효과를 준다

    이 방법의 문제점은 육면체들이 완전히 같은 위치에 있기에 z-파이팅이 발생할 수 있다는 겁니다. 물론 깊이(depth)와 블렌딩(blending) 옵션을 주면 어쩌어찌 해결할 수 있겠죠. 자세한 방법에 대해서는 해봐야 알겠지만요.

* 보여줄 데이터는 커지게, 사라질 데이터는 작게해 전환 효과를 준다

    육면체 그래프가 전부 중점이 지구본 중심이기에 1.0 이하로 크기(scale)을 줄이면 그래프가 지구본 안으로 파고들 겁니다. 얼핏 좋은 생각인 듯 싶었지만 높이가 낮은 그래프는 바로 사라져 다음 그래프의 크기가 1.0 이상이 될 때까지 한참을 빈 공간으로 남겠죠. 이러면 전환 효과가 굉장히 어색할 겁니다. 물론 복잡한 쉐이더를 써서 어느 정도 가릴 수는 있겠지만요.

* morphtargets 옵션을 쓴다

    morphtargets는 geometry 각 정점에 새로운 값을 부여해 *천천히 변형(morph)*시키거나 두 점 사이를 선형 보간(lerp, linear interpolate)하는 것을 말합니다. morphtargets는 주로 3D 캐릭터의 표정을 묘사할 때 쓰지만 꼭 그렇게만 쓰라는 법은 없죠.

그럼 morphtargets를 사용해봅시다.

이전처럼 각 데이터를 하나의 geometry로 만들되, 데이터를 만들 때 각 육면체의 `position` 속성을 추출해 morphtargets으로 사용할 겁니다.

먼저 `addBoxes` 함수가 합친 geometry를 반환하도록 수정합니다. 장면(scene)에 추가하는 대신 말이죠.

```js
-function addBoxes(file, hueRange) {
+function makeBoxes(file, hueRange) {
  const { min, max, data } = file;
  const range = max - min;
  
  ...

-  const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(
-      geometries, false);
-  const material = new THREE.MeshBasicMaterial({
-    vertexColors: THREE.VertexColors,
-  });
-  const mesh = new THREE.Mesh(mergedGeometry, material);
-  scene.add(mesh);
-  return mesh;
+  return BufferGeometryUtils.mergeBufferGeometries(
+     geometries, false);
}
```

여기에 한 가지 예외 방지 처리를 해줘야 합니다. morphtargets에는 정확히 같은 개수의 정점을 지정해야 하는데, 예를 들어 정점 #123에는 상응하는 정점 #123 morphtarget이 있어야 합니다. 예제의 경우는 빈 데이터가 있고, 데이터가 비었다는 건 상응하는 육면체, 정점 데이터가 없을 수 있다는 것을 의미하죠. 그러니 모든 데이터를 검사해 해당 위치에 데이터가 하나라도 있는 경우든, 그냥 데이터가 없는 경우든 임의의 데이터를 지정해야 합니다. 일단은 더 간단한 후자를 선택하도록 하죠.

```js
+function dataMissingInAnySet(fileInfos, latNdx, lonNdx) {
+  for (const fileInfo of fileInfos) {
+    if (fileInfo.file.data[latNdx][lonNdx] === undefined) {
+      return true;
+    }
+  }
+  return false;
+}

-function makeBoxes(file, hueRange) {
+function makeBoxes(file, hueRange, fileInfos) {
  const { min, max, data } = file;
  const range = max - min;

  ...

  const geometries = [];
  data.forEach((row, latNdx) => {
    row.forEach((value, lonNdx) => {
+      if (dataMissingInAnySet(fileInfos, latNdx, lonNdx)) {
+        return;
+      }
      const amount = (value - min) / range;

  ...
```

다음으로 `addBoxes`를 `makeBoxes`로 교체한 뒤, morphtargets를 설정합니다.

```js
+// 데이터 그룹에 geometry를 각각 만듭니다.
+const geometries = fileInfos.map((info) => {
+  return makeBoxes(info.file, info.hueRange, fileInfos);
+});
+
+// 첫 번째 geometry를 기준으로 다른 geometry를 morphtargets로 지정합니다.
+const baseGeometry = geometries[0];
+baseGeometry.morphAttributes.position = geometries.map((geometry, ndx) => {
+  const attribute = geometry.getAttribute('position');
+  const name = `target${ ndx }`;
+  attribute.name = name;
+  return attribute;
+});
+const material = new THREE.MeshBasicMaterial({
+  vertexColors: THREE.VertexColors,
+  morphTargets: true,
+});
+const mesh = new THREE.Mesh(baseGeometry, material);
+scene.add(mesh);

const uiElem = document.querySelector('#ui');
fileInfos.forEach((info) => {
-  const boxes = addBoxes(info.file, info.hueRange);
-  info.root = boxes;
  const div = document.createElement('div');
  info.elem = div;
  div.textContent = info.name;
  uiElem.appendChild(div);
  function show() {
    showFileInfo(fileInfos, info);
  }
  div.addEventListener('mouseover', show);
  div.addEventListener('touchstart', show);
});
// 첫 데이터 그룹을 렌더링합니다.
showFileInfo(fileInfos, fileInfos[0]);
```

위 코드에서는 먼저 데이터 그룹에 각각 geometry를 만들었습니다. 그리고 처음으로 생성한 geometry를 기준으로 삼아 각 geometry의 `position` 속성을 배열로 매핑한 뒤, 기준 geometry의 morphtargets `position` 속성에 지정했습니다.

이제 각 데이터 그룹에 전환 효과를 줘야 합니다. mesh를 사라지고 나타나게 하는 대신 mesh의 `morphTargetInfluences` 속성을 바꿔 애니메이션을 구현할 겁니다. 화면에 렌더링할 데이터 그룹의 influence(영향)은 1, 렌더링하지 않을 그룹의 influence는 0으로 설정하는 것이죠.

단순히 숫자 0, 1을 바로 지정할 수도 있지만 그러면 애니메이션이 하나도 보이지 않을 겁니다. 아까 썼던 방법과 전혀 차이가 없는 결과가 나오겠죠. 물론 직접 애니메이션 코드를 작성할 수도 있지만 원본 WebGL 지구본이 [애니메이션 라이브러리](https://github.com/tweenjs/tween.js/)를 썼으므로 같은 라이브러리를 사용해보겠습니다.

먼저 라이브러리를 불러옵니다.

```js
import * as THREE from './resources/three/r119/build/three.module.js';
import { BufferGeometryUtils } from './resources/threejs/r119/examples/jsm/utils/BufferGeometryUtils.js';
import { OrbitControls } from './resources/threejs/r119/examples/jsm/controls/OrbitControls.js';
+import { TWEEN } from './resources/threejs/r119/examples/jsm/libs/tween.min.js';
```

그리고 `Tween`으로 influence 속성에 애니메이션을 줍니다.

```js
// 선택한 데이터를 보여주고 나머지는 숨깁니다.
function showFileInfo(fileInfos, fileInfo) {
  fileInfos.forEach((info) => {
    const visible = fileInfo === info;
-    info.root.visible = visible;
    info.elem.className = visible ? 'selected' : '';
+    const targets = {};
+    fileInfos.forEach((info, i) => {
+      targets[i] = info === fileInfo ? 1 : 0;
+    });
+    const durationInMs = 1000;
+    new TWEEN.Tween(mesh.morphTargetInfluences)
+      .to(targets, durationInMs)
+      .start();
  });
  requestRenderIfNotRequested();
}
```

또 매 렌더링 프레임에서 `TWEEN.update`를 호출해야 하지만 좀 문제가 있습니다. "tween.js"는 연속 렌더링을 사용하도록 디자인되었습니다. 하지만 예제에서는 [불필요한 렌더링 제거 기법](threejs-rendering-on-demand.html)을 사용했죠. 연속 렌더링을 사용하도록 코드를 바꿀 수도 있지만, 아무런 변화가 없을 때 렌더링을 하지 않음으로써 불필요한 자원 낭비를 줄인다는 장점을 버리고 싶진 않습니다. 여기에 불필요한 렌더링 제거 기법을 적용할 수 있을지 살펴보죠.

간단히 `TweenManager`라는 헬퍼 클래스를 만들겠습니다. 이 클래스를 통해 `Tween`을 만들고 애니메이션을 추적할 겁니다. 이 클래스의 `update` 메서드는 애니메이션이 진행 중이며 다음 프레임을 요청해야 할 때는 `true`, 애니메이션이 끝났다면 `false`를 반환할 겁니다.

```js
class TweenManger {
  constructor() {
    this.numTweensRunning = 0;
  }
  _handleComplete() {
    --this.numTweensRunning;
    console.assert(this.numTweensRunning >= 0);
  }
  createTween(targetObject) {
    const self = this;
    ++this.numTweensRunning;
    let userCompleteFn = () => {};
    // Tween 인스턴스를 만들고 onCompelete에 콜백 함수를 설치합니다.
    const tween = new TWEEN.Tween(targetObject).onComplete(function(...args) {
      self._handleComplete();
      userCompleteFn.call(this, ...args);
    });
    // Tween 인스턴스의 onComplete 함수를 바꿔 사용자가 콜백 함수를
    // 지정할 수 있도록 합니다.
    tween.onComplete = (fn) => {
      userCompleteFn = fn;
      return tween;
    };
    return tween;
  }
  update() {
    TWEEN.update();
    return this.numTweensRunning > 0;
  }
}
```

만든 클래스의 인스턴스를 생성합니다.

```js
function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas});
+  const tweenManager = new TweenManger();

  ...
```

생성한 인스턴스로 `Tween` 인스턴스를 생성합니다.

```js
// 선택한 데이터를 보여주고 나머지는 숨깁니다.
function showFileInfo(fileInfos, fileInfo) {
  fileInfos.forEach((info) => {
    const visible = fileInfo === info;
    info.elem.className = visible ? 'selected' : '';
    const targets = {};
    fileInfos.forEach((info, i) => {
      targets[i] = info === fileInfo ? 1 : 0;
    });
    const durationInMs = 1000;
-    new TWEEN.Tween(mesh.morphTargetInfluences)
+    tweenManager.createTween(mesh.morphTargetInfluences)
      .to(targets, durationInMs)
      .start();
  });
  requestRenderIfNotRequested();
}
```

그리고 tween 애니메이션이 남아있다면 계속 렌더링 루프를 반복하도록 `render` 함수를 수정합니다.

```js
function render() {
  renderRequested = false;

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

+  if (tweenManager.update()) {
+    requestRenderIfNotRequested();
+  }

  controls.update();
  renderer.render(scene, camera);
}
render();
```

이제 각 데이터 그룹을 전환할 때 애니메이션이 보일 겁니다.

{{{example url="../threejs-lots-of-objects-morphtargets.html" }}}

애니메이션은 잘 작동하지만 색이 바뀌지 않습니다.

Three.js의 morphtargets는 색상값을 지원하지 않습니다. 이건 원본 [WebGL 지구본](https://github.com/dataarts/webgl-globe)의 문제이기도 하죠. 기본적으로 WebGl 지구본은 그냥 첫 데이터 그룹에 색을 지정하고, 많은 차이가 나는 데이터라도 같은 색을 사용합니다.

어쨌든 색에 애니메이션을 줄 수 있는 방법을 알아봅시다. 이건 좀 어려울 수 있습니다. 직접 쉐이더를 만드는 게 그나마 덜 어렵긴 하지만, 이 기회에 내장 쉐이더를 어떻게 수정하는지 알아보는 것도 좋을 듯합니다.

제일 먼저 해야할 건 각 데이터 그룹 geometry의 `BufferAttribute`에서 색상값을 추출하는 겁니다.

```js
// 첫 번째 geometry를 기준으로 다른 geometry를 morphtargets로 지정합니다.
const baseGeometry = geometries[0];
baseGeometry.morphAttributes.position = geometries.map((geometry, ndx) => {
  const attribute = geometry.getAttribute('position');
  const name = `target${ndx}`;
  attribute.name = name;
  return attribute;
});
+const colorAttributes = geometries.map((geometry, ndx) => {
+  const attribute = geometry.getAttribute('color');
+  const name = `morphColor${ ndx }`;
+  attribute.name = `color${ ndx }`;  // 디버깅용
+  return { name, attribute };
+});
const material = new THREE.MeshBasicMaterial({
  vertexColors: THREE.VertexColors,
  morphTargets: true,
});
```

다음으로 Three.js의 내장 쉐이더를 수정해야 합니다. Three.js의 재질에는 함수를 지정할 수 있는 `Material.onBeforeCompile` 속성이 있고, 이 속성에 함수를 지정하면 WebGL에 쉐이더를 올리기 전에 재질의 쉐이더를 수정할 수 있습니다. 사실 Three.js에서 넘겨주는 이 쉐이더는 Three.js 전용 문법으로 된 쉐이더 *묶음(chunk)*으로, Three.js는 이 각 묶음을 실제 GLSL 코드로 바꿔 WebGL에 넘깁니다. 아래는 `onBeforeCompile` 함수에 매개변수로 넘어오는 쉐이더 코드의 한 예입니다.

```glsl
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <skinbase_vertex>
	#ifdef USE_ENVMAP
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}
```

소스 코드를 뒤져 예제에 적합한 쉐이더 묶음을 몇 개 찾았습니다.

* [`morphtarget_pars_vertex`](https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/morphtarget_pars_vertex.glsl.js)
* [`morphnormal_vertex`](https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/morphnormal_vertex.glsl.js)
* [`morphtarget_vertex`](https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/morphtarget_vertex.glsl.js)
* [`color_pars_vertex`](https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/color_pars_vertex.glsl.js)
* [`color_vertex`](https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/color_vertex.glsl.js)

이 쉐이더 묶음을 교체하기 위해 간단한 교체용 배열을 만들어 `Material.onBeforeCompile`에 적용합니다.

```js
const material = new THREE.MeshBasicMaterial({
  vertexColors: THREE.VertexColors,
  morphTargets: true,
});
+const vertexShaderReplacements = [
+  {
+    from: '#include <morphtarget_pars_vertex>',
+    to: `
+      uniform float morphTargetInfluences[8];
+    `,
+  },
+  {
+    from: '#include <morphnormal_vertex>',
+    to: `
+    `,
+  },
+  {
+    from: '#include <morphtarget_vertex>',
+    to: `
+      transformed += (morphTarget0 - position) * morphTargetInfluences[0];
+      transformed += (morphTarget1 - position) * morphTargetInfluences[1];
+      transformed += (morphTarget2 - position) * morphTargetInfluences[2];
+      transformed += (morphTarget3 - position) * morphTargetInfluences[3];
+    `,
+  },
+  {
+    from: '#include <color_pars_vertex>',
+    to: `
+      varying vec3 vColor;
+      attribute vec3 morphColor0;
+      attribute vec3 morphColor1;
+      attribute vec3 morphColor2;
+      attribute vec3 morphColor3;
+    `,
+  },
+  {
+    from: '#include <color_vertex>',
+    to: `
+      vColor.xyz = morphColor0 * morphTargetInfluences[0] +
+                   morphColor1 * morphTargetInfluences[1] +
+                   morphColor2 * morphTargetInfluences[2] +
+                   morphColor3 * morphTargetInfluences[3];
+    `,
+  },
+];
+material.onBeforeCompile = (shader) => {
+  vertexShaderReplacements.forEach((rep) => {
+    shader.vertexShader = shader.vertexShader.replace(rep.from, rep.to);
+  });
+};
```

Three.js는 morphtargets을 정렬해 그 중 가장 높은 influence 값을 가진 morphtarget만 적용합니다. 이러면 많은 morphtarget 후보를 지정할 수 있죠. 하지만 Three.js는 어떤 morphtarget을 사용하고 어떤 속성에 morphtarget을 지정할 건지 알려주지 않습니다. Three.js가 하는 일을 따라해보는 수밖에 없는데, 이 방법으로는 Three.js의 알고리즘이 바뀔 때마다 코드를 수정해야 합니다.

먼저 색 속성을 전부 제거합니다. 속성을 따로 지정하지 않더라도 에러는 뜨지 않으니 그냥 반복문으로 전부 제거하면 됩니다. 그리고 Three.js가 어떤 morphtarget을 쓸 건지 계산한 뒤 Three.js가 사용할 속성에 morphtarget을 지정합니다.

```js
const mesh = new THREE.Mesh(baseGeometry, material);
scene.add(mesh);

+function updateMorphTargets() {
+  // 색 속성을 전부 제거합니다.
+  for (const { name } of colorAttributes) {
+    baseGeometry.deleteAttribute(name);
+  }
+
+  // Three.js는 influence 값을 제공하지 않기에 추측하는 수밖에 없습니다. 물론 소스 코드가 바뀌면 이 값을 수정해야 하겠죠.
+  const maxInfluences = 8;
+
+  // Three.js는 어떤 morphtarget을 사용할 건지, 어떤 속성에 morphtarget을 지정할 건지 알려주지 않습니다.
+  // Three.js의 알고리즘이 바뀌면 이 코드를 수정해야 할 겁니다.
+  mesh.morphTargetInfluences
+    .map((influence, i) => [i, influence])            // 인덱스값과 influence 값을 매핑합니다.
+    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))  // influence 값을 내림차순으로 정렬합니다.
+    .slice(0, maxInfluences)                          // 상위 값들만 남겨둡니다.
+    .sort((a, b) => a[0] - b[0])                      // 인덱스값을 기준으로 정렬합니다.
+    .filter(a => !!a[1])                              // influence 값이 없는 요소를 제거합니다.
+    .forEach(([ndx], i) => {                          // 속성에 지정합니다.
+      const name = `morphColor${ i }`;
+      baseGeometry.setAttribute(name, colorAttributes[ndx].attribute);
+    });
+}
```

방금 만든 함수를 `loadAll` 함수에서 반환할 겁니다. 이러면 불필요한 변수를 줄일 수 있죠.

```js
async function loadAll() {
  ...

+  return updateMorphTargets;
}

+// 데이터를 불러오기 전까지 빈 함수를 실행합니다.
+let updateMorphTargets = () => {};
-loadAll();
+loadAll().then(fn => {
+  updateMorphTargets = fn;
+});
```

마지막으로 tweenManager로 값들을 업데이트한 뒤, 렌더링 메서드 호출 전에 `updateMorphTarget`을 호출해야 합니다.

```js
function render() {

  ...

  if (tweenManager.update()) {
    requestRenderIfNotRequested();
  }

+  updateMorphTargets();

  controls.update();
  renderer.render(scene, camera);
}
```

색과 육면체 그래프에 애니메이션을 모두 적용했습니다.

{{{example url="../threejs-lots-of-objects-morphtargets-w-colors.html" }}}

여기서 살펴본 내용이 유익했다면 좋겠습니다. Three.js가 제공하는 모듈을 만드는 것과, 직접 쉐이더를 만드는 것 둘 다 morphtargets를 이용해 애니메이션을 구현할 때 자주 사용하는 방법입니다. 예를 들어 각 육면체 그래프를 임의의 요소에 두고 해당 위치에서 지구본 위로 이동하는 애니메이션을 줄 수도 있죠. 그것도 그래프를 표현하는 멋진 방법 중 하나일 겁니다.

혹시 위 지구본에 각 나라의 이름을 띄워보고 싶진 않나요? 그렇다면 [HTML 요소를 3D로 정렬하기](threejs-align-html-elements-to-3d.html)를 참고해보세요.

> 참고: 예제에서 남성 인구 비율이나 여성 인구 비율 또는 두 데이터의 차이를 견본 데이터로 사용할 수도 있었지만, 에제에 적용한 애니메이션은 땅에서 그래프가 올라오는 형식입니다. 비율로 처리한다면 대게의 값이 비슷비슷할 테고, 그래프의 높이도 2/1 정도는 더 낮아 시각적 효과가 그다지 크지 않았겠죠. `amountGreaterThan`을 `Math.max(a - b, 0)`에서 `(a - b)` 등으로 바꿔 두 데이터의 차이를 보거나, `a / (a + b)`로 바꿔 성비를 볼 수 있습니다.

