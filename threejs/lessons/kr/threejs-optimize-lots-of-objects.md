Title: 다중 요소 렌더링 최적화하기
Description: 요소를 합쳐 최적화하는 법을 알아봅니다
TOC: 요소가 많을 때 최적화하는 방법

※ 이 글은 Three.js의 튜토리얼 시리즈로서,
먼저 [Three.js의 기본 구조에 관한 글](threejs-fundamentals.html)을
읽고 오길 권장합니다.


Three.js에서 요소를 최적화하는 방법은 아주 다양합니다. 가장 많이 언급되는 방법은 *geometry를 합치는 것*이죠. Three.js는 사용자가 `Mesh`를 하나 만들 때마다 매번 시스템에 하나 이상의 렌더링 요청을 보냅니다. 결과물이 완벽히 같더라도 mesh를 1개를 렌더링할 때보다 2개를 렌더링할 때 [오버헤드(overhead)](https://ko.wikipedia.org/wiki/%EC%98%A4%EB%B2%84%ED%97%A4%EB%93%9C)가 더 많이 발생한다는 이야기죠. 그러니 이 mesh를 하나로 합친다면 오버헤드를 줄일 수 있습니다.

간단한 예제를 통해 이 방법이 어떤 경우 적합한지 알아보도록 하겠습니다. [WebGL 지구본](https://globe.chromeexperiments.com/)을 베껴 직접 구현해보겠습니다.

먼저 데이터를 작성합니다. WebGL 지구본 개발진은 [SEDAC](http://sedac.ciesin.columbia.edu/gpw/)에서 데이터를 가져왔다고 합니다. 사이트를 뒤져보니 [그리드 형태의 인구 통계 데이터](https://beta.sedac.ciesin.columbia.edu/data/set/gpw-v4-basic-demographic-characteristics-rev10)가 있네요. resolution 값을 60 minute으로 설정해 데이터를 다운로드합니다.

받은 데이터는 아래와 같습니다.

```txt
 ncols         360
 nrows         145
 xllcorner     -180
 yllcorner     -60
 cellsize      0.99999999999994
 NODATA_value  -9999
 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 ...
 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 ...
 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 ...
 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 ...
 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 ...
 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 ...
 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 ...
 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 ...
 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 ...
 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 ...
 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 ...
 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 ...
 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 ...
 9.241768 8.790958 2.095345 -9999 0.05114867 -9999 -9999 -9999 -9999 -999...
 1.287993 0.4395509 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999...
 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 ...
```

키/값 쌍 데이터가 몇 줄 있고 나머지는 격자점(grid point) 데이터네요. 데이터의 한 줄은 각 좌표에 대한 데이터입니다.

이해를 돕기 위해 데이터를 2D로 구현해보겠습니다.

먼저 텍스트 파일을 불러옵니다.

```js
async function loadFile(url) {
  const req = await fetch(url);
  return req.text();
}
```

위 함수는 `url`의 파일 내용을 반환하는 `Promise`를 반환합니다.

※참고: [fetch API](https://developer.mozilla.org/ko/docs/Web/API/Fetch_API). 역주.

다음으로 텍스트 데이터를 파싱하는 함수를 작성합니다.

```js
function parseData(text) {
  const data = [];
  const settings = { data };
  let max;
  let min;
  // 각 줄을 쪼갭니다.
  text.split('\n').forEach((line) => {
    // 해당 줄을 공백을 기준으로 쪼갭니다.
    const parts = line.trim().split(/\s+/);
    if (parts.length === 2) {
      // 2개로 나눠졌다면 키/값 쌍 데이터입니다.
      settings[parts[0]] = parseFloat(parts[1]);
    } else if (parts.length > 2) {
      // 2개보다 많다면 좌표 데이터입니다.
      const values = parts.map((v) => {
        const value = parseFloat(v);
        if (value === settings.NODATA_value) {
          return undefined;
        }
        max = Math.max(max === undefined ? value : max, value);
        min = Math.min(min === undefined ? value : min, value);
        return value;
      });
      data.push(values);
    }
  });
  return Object.assign(settings, { min, max });
}
```

위 함수는 데이터 파일의 키/값 쌍, 좌표 데이터를 하나의 배열 만든 `data` 속성, 그리고 좌표 데이터를 기반으로 한 `min`, `max` 속성을 가진 객체를 반환합니다.

그리고 데이터를 렌더링하는 코드를 작성합니다.

```js
function drawData(file) {
  const { min, max, data } = file;
  const range = max - min;
  const ctx = document.querySelector('canvas').getContext('2d');
  // 데이터와 같은 크기로 캔버스 해상도를 맞춥니다.
  ctx.canvas.width = ncols;
  ctx.canvas.height = nrows;
  // 캔버스 요소의 크기를 두 배로 지정해 너무 작게 보이지 않도록 합니다.
  ctx.canvas.style.width = px(ncols * 2);
  ctx.canvas.style.height = px(nrows * 2);
  // 배경을 짙은 회색으로 채웁니다.
  ctx.fillStyle = '#444';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  // 각 좌표에 점을 그립니다.
  data.forEach((row, latNdx) => {
    row.forEach((value, lonNdx) => {
      if (value === undefined) {
        return;
      }
      const amount = (value - min) / range;
      const hue = 1;
      const saturation = 1;
      const lightness = amount;
      ctx.fillStyle = hsl(hue, saturation, lightness);
      ctx.fillRect(lonNdx, latNdx, 1, 1);
    });
  });
}

function px(v) {
  return `${ v | 0 }px`;
}

function hsl(h, s, l) {
  return `hsl(${ h * 360 | 0 },${ s * 100 | 0 }%,${ l * 100 | 0 }%)`;
}
```

작성한 함수를 순서대로 실행하면 끝입니다.

```js
loadFile('resources/data/gpw/gpw_v4_basic_demographic_characteristics_rev10_a000_014mt_2010_cntm_1_deg.asc')
  .then(parseData)
  .then(drawData);
```

결과를 볼까요?

{{{example url="../gpw-data-viewer.html" }}}

데이터가 잘 렌더링된 것 같네요.

이제 이걸 3D로 만들어봅시다. [불필요한 렌더링 제거하기](threejs-rendering-on-demand.html)에서 썼던 예제를 가져와 각 데이터마다 육면체를 하나씩 만들 겁니다.

먼저 아래 텍스처로 간단한 지구본 모형을 만들겠습니다.

<div class="threejs_center"><img src="../resources/images/world.jpg" style="width: 600px"></div>

아래는 지구본을 만드는 코드입니다.

```js
{
  const loader = new THREE.TextureLoader();
  const texture = loader.load('resources/images/world.jpg', render);
  const geometry = new THREE.SphereBufferGeometry(1, 64, 32);
  const material = new THREE.MeshBasicMaterial({ map: texture });
  scene.add(new THREE.Mesh(geometry, material));
}
```

위 코드에서는 텍스처를 불러온 후 `render` 함수를 호출하게 했습니다. 화면을 반복해서 렌더링하지 않고 [필요할 때만 렌더링](threejs-rendering-on-demand.html)하므로, 텍스처를 불러온 뒤 다시 한 번 렌더링해야 합니다.

다음으로 데이터를 하나의 점으로 표시하는 대신 좌표 데이터마다 육면체를 하나씩 생성합니다.

```js
function addBoxes(file) {
  const { min, max, data } = file;
  const range = max - min;

  // 육면체 geometry를 만듭니다.
  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 1;
  const geometry = new THREE.BoxBufferGeometry(boxWidth, boxHeight, boxDepth);
  // 중심이 아닌 양의 z축 방향으로 커지게끔 만듭니다.
  geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, 0.5));

  // 아래 헬퍼 Object3D는 육면체들의 위치 변화를 간단하게 만들어줍니다.
  // lonHelper를 Y축으로 돌려 경도(longitude)를 맞출 수 있습니다.
  const lonHelper = new THREE.Object3D();
  scene.add(lonHelper);
  // latHelper를 X축으로 돌려 위도(latitude)를 맞출 수 있습니다.
  const latHelper = new THREE.Object3D();
  lonHelper.add(latHelper);
  // positionHelper는 다른 요소의 기준축을 구체의 끝에 맞추는 역할을 합니다.
  const positionHelper = new THREE.Object3D();
  positionHelper.position.z = 1;
  latHelper.add(positionHelper);

  const lonFudge = Math.PI * .5;
  const latFudge = Math.PI * -0.135;
  data.forEach((row, latNdx) => {
    row.forEach((value, lonNdx) => {
      if (value === undefined) {
        return;
      }
      const amount = (value - min) / range;
      const material = new THREE.MeshBasicMaterial();
      const hue = THREE.MathUtils.lerp(0.7, 0.3, amount);
      const saturation = 1;
      const lightness = THREE.MathUtils.lerp(0.1, 1.0, amount);
      material.color.setHSL(hue, saturation, lightness);
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      // 헬퍼들을 특정 위도와 경도로 이동시킵니다.
      lonHelper.rotation.y = THREE.MathUtils.degToRad(lonNdx + file.xllcorner) + lonFudge;
      latHelper.rotation.x = THREE.MathUtils.degToRad(latNdx + file.yllcorner) + latFudge;

      // positionHelper의 위치를 해당 mesh의 위치로 지정합니다.
      positionHelper.updateWorldMatrix(true, false);
      mesh.applyMatrix4(positionHelper.matrixWorld);

      mesh.scale.set(0.005, 0.005, THREE.MathUtils.lerp(0.01, 0.5, amount));
    });
  });
}
```

위 코드는 아까 만들었던 테스트 코드의 구조를 그대로 사용한 것입니다.

각 육면체를 양의 Z축으로 커지게 만든 건 지구본 위에 그래프가 올라와야 하기 때문입니다. 이 설정이 없다면 그래프가 지구본 안쪽으로 파고들어 가겠죠.

<div class="spread">
  <div>
    <div data-diagram="scaleCenter" style="height: 250px"></div>
    <div class="code">기본값</div>
  </div>
  <div>
    <div data-diagram="scalePositiveZ" style="height: 250px"></div>
    <div class="code">Z축을 조정한 결과</div>
  </div>
</div>

[씬 그래프에 관한 글](threejs-scenegraph.html)에서 배웠듯 육면체를 다른 `THREE.Object3D`의 자식으로 두는 것도 한 가지 해결 방법이지만, 씬 그래프 요소가 많아지만 그만큼 성능이 떨어집니다.

`lonHelper`, `latHelper`, `positionHelper`를 계층 구조로 만든 건 구체 주위에 육면체를 배치할 좌표를 찾기 위해서입니다.

<div class="spread">
  <div data-diagram="lonLatPos" style="width: 600px; height: 400px;"></div>
</div>

위 예제의 <span style="color:green;">초록색 막대</span>는 `lonHelper`를 상징합니다. 자전축을 중심으로 경도(longitude)를 찾는 역할을 하죠. <span style="color:blue">파란색 막대</span>는 `latHelper`입니다. `latHelper`는 적도 위 아래로 위도(latitude)를 찾는 역할을 합니다. <span style="color:red;">빨간 구체</span>는 `positionHelper`로, 육면체의 좌표값을 나타냅니다.

물론 좌표를 계산할 때 수학적으로 접근할 수도 있지만, 이렇게 라이브러리가 대신 계산하도록 하면 복잡하게 머리를 쥐어짜야할 필요가 없습니다.

위 코드에서는 각 데이터 좌표마다 `MeshBasicMaterial`와 `Mesh`를 생성했습니다. 그리고 `positionHelper`의 전역 좌표를 구해 `Mesh`에 적용하고, 데이터의 양만큼 이 mesh를 키웠죠.

아까와 마찬가지로 각 데이터마다 `lonHelper`, `latHelper`, `positionHelper`를 따로 생성할 수도 있지만, 그렇게 하면 성능이 훨씬 느려질 겁니다.

이러면 육면체를 최대 360x145개, 거의 최대 52000개를 만드는 셈입니다. "NO_DATA"라고 표시된 곳도 있기에 그걸 제외하면 육면체의 개수는 대략 19000개가 될 겁니다. 그런데 여기에 각 육면체에 따로 3개씩 헬퍼를 생성한다면 Three.js는 거의 80000개의 씬 그래프 요소를 계산하게 되죠. 대신 헬퍼를 공통으로 사용하면 연산 요청을 약 60000번 정도 줄일 수 있습니다.

`lonFudge`와 `latFudge`에 대해 짧게 언급하겠습니다. `lonFudge`는 π/2, 90도입니다. 이건 크게 신경쓸 게 없네요. 그냥 텍스처나 텍스처 좌표가 다른 각도에서 시작한다는 소리니까요. 하지만 `latFudge`의 경우는 왜 π * -0.135가 필요한지 모르겠습니다. 그냥 좌표가 저 축을 기준으로 정렬되어 있습니다.

이제 만든 함수를 호출합니다.

```
loadFile('resources/data/gpw/gpw_v4_basic_demographic_characteristics_rev10_a000_014mt_2010_cntm_1_deg.asc')
  .then(parseData)
-  .then(drawData)
+  .then(addBoxes)
+  .then(render);
```

[필요할 때만 렌더링 함수를 호출](threejs-rendering-on-demand.html)하게 해놨으므로 지구본과 육면체들을 추가한 뒤 `render` 함수를 직접 호출해야 합니다.

{{{example url="../threejs-lots-of-objects-slow.html" }}}

위 예제를 드래그해 지구본을 돌려보면 뭔가 버벅임을 느낄 수 있을 겁니다.

[개발자 도구를 열어](threejs-debugging-javascript.html) 브라우저의 FPS 미터를 켜면 프레임율을 확인할 수 있습니다.

<div class="threejs_center"><img src="resources/images/bring-up-fps-meter.gif"></div>

제 환경에서는 평균 프레임이 20fps보다 낮네요.

<div class="threejs_center"><img src="resources/images/fps-meter.gif"></div>

아마 더 안 좋은 컴퓨터에서는 이보다 더 심할 겁니다. 최적화할 방법을 찾아봐야겠네요.

예제의 경우 모든 정육면체를 하나의 geometry로 합치는 방법을 적용할 수 있습니다. 현재 거의 육면체를 거의 19000개 정도 렌더링했는데, 이를 하나로 합치면 연산 요청을 18999회 정도 줄일 수 있습니다.

```js
function addBoxes(file) {
  const {min, max, data} = file;
  const range = max - min;

-  // 육면체 geometry를 만듭니다.
-  const boxWidth = 1;
-  const boxHeight = 1;
-  const boxDepth = 1;
-  const geometry = new THREE.BoxBufferGeometry(boxWidth, boxHeight, boxDepth);
-  // 중심이 아닌 양의 z축 방향으로 커지게끔 만듭니다.
-  geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, 0.5));

  // 아래 헬퍼 Object3D는 육면체들의 위치 변화를 간단하게 만들어줍니다.
  // lonHelper를 Y축으로 돌려 경도(longitude)를 맞출 수 있습니다.
  const lonHelper = new THREE.Object3D();
  scene.add(lonHelper);
  // latHelper를 X축으로 돌려 위도(latitude)를 맞출 수 있습니다.
  const latHelper = new THREE.Object3D();
  lonHelper.add(latHelper);
  // positionHelper는 다른 요소의 기준축을 구체의 끝에 맞추는 역할을 합니다.
  const positionHelper = new THREE.Object3D();
  positionHelper.position.z = 1;
  latHelper.add(positionHelper);
+  // 육면체의 중심을 옮겨 양의 Z축 방향으로 커지게 합니다.
+  const originHelper = new THREE.Object3D();
+  originHelper.position.z = 0.5;
+  positionHelper.add(originHelper);

  const lonFudge = Math.PI * .5;
  const latFudge = Math.PI * -0.135;
+  const geometries = [];
  data.forEach((row, latNdx) => {
    row.forEach((value, lonNdx) => {
      if (value === undefined) {
        return;
      }
      const amount = (value - min) / range;

-      const material = new THREE.MeshBasicMaterial();
-      const hue = THREE.MathUtils.lerp(0.7, 0.3, amount);
-      const saturation = 1;
-      const lightness = THREE.MathUtils.lerp(0.1, 1.0, amount);
-      material.color.setHSL(hue, saturation, lightness);
-      const mesh = new THREE.Mesh(geometry, material);
-      scene.add(mesh);

+      const boxWidth = 1;
+      const boxHeight = 1;
+      const boxDepth = 1;
+      const geometry = new THREE.BoxBufferGeometry(boxWidth, boxHeight, boxDepth);

      // 헬퍼들을 특정 위도와 경도로 이동시킵니다.
      lonHelper.rotation.y = THREE.MathUtils.degToRad(lonNdx + file.xllcorner) + lonFudge;
      latHelper.rotation.x = THREE.MathUtils.degToRad(latNdx + file.yllcorner) + latFudge;

-      // positionHelper의 위치를 해당 mesh의 위치로 지정합니다.
-      positionHelper.updateWorldMatrix(true, false);
-      mesh.applyMatrix4(positionHelper.matrixWorld);
-
-      mesh.scale.set(0.005, 0.005, THREE.MathUtils.lerp(0.01, 0.5, amount));

+      // originHelper의 위치를 해당 geometry의 위치로 지정합니다.
+      positionHelper.scale.set(0.005, 0.005, THREE.MathUtils.lerp(0.01, 0.5, amount));
+      originHelper.updateWorldMatrix(true, false);
+      geometry.applyMatrix4(originHelper.matrixWorld);
+
+      geometries.push(geometry);
    });
  });

+  // 생성한 geometry를 전부 합칩니다.
+  const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(
+      geometries, false);
+  const material = new THREE.MeshBasicMaterial({ color:'red' });
+  const mesh = new THREE.Mesh(mergedGeometry, material);
+  scene.add(mesh);

}
```

위 코드에서는 육면체의 중심을 옮기는 대신 `originHelper`를 새로 만들어 중심축을 옮겼습니다. 이전에는 같은 geometry를 19000번 재활용했지만, 이번에는 데이터마다 geometry를 새로 생성했죠. 또한 `applyMatrix`를 이용해 육면체 자체의 정점을 이동시키므로 메서드를 두 번 쓰는 대신 한 번만 썼습니다.

그리고 생성한 육면체를 전부 배열에 저장한 뒤 이 배열을 `BufferGeometryUtils.mergeBufferGeometries`에 넘겨 하나의 geometry로 합쳤습니다.

물론 `BufferGeometryUtils`을 불러와야죠.

```js
import { BufferGeometryUtils } from './resources/threejs/r122/examples/jsm/utils/BufferGeometryUtils.js';
```

이제 제 컴퓨터에서는 적어도 60 프레임 이상이 나오네요.

{{{example url="../threejs-lots-of-objects-merged.html" }}}

성능 문제는 해결했지만 육면체가 하나의 mesh이기에 이전과 달리 육면체의 색이 전부 같습니다. 여기서 색을 따로 지정하려면? 여러 방법이 있겠지만 정점 색(vertex color)을 쓰는 방법이 제일 간단할 겁니다.

정점 색은 정점마다 색을 지정합니다. 각 육면체의 각 정점을 다른 색으로 지정하면 육면체의 색을 다르게 지정할 수 있겠죠.

```js
+const color = new THREE.Color();

const lonFudge = Math.PI * .5;
const latFudge = Math.PI * -0.135;
const geometries = [];
data.forEach((row, latNdx) => {
  row.forEach((value, lonNdx) => {
    if (value === undefined) {
      return;
    }
    const amount = (value - min) / range;

    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxBufferGeometry(boxWidth, boxHeight, boxDepth);

    // 헬퍼들을 특정 위도와 경도로 이동시킵니다.
    lonHelper.rotation.y = THREE.MathUtils.degToRad(lonNdx + file.xllcorner) + lonFudge;
    latHelper.rotation.x = THREE.MathUtils.degToRad(latNdx + file.yllcorner) + latFudge;

    // originHelper의 위치를 해당 geometry의 위치로 지정합니다.
    positionHelper.scale.set(0.005, 0.005, THREE.MathUtils.lerp(0.01, 0.5, amount));
    originHelper.updateWorldMatrix(true, false);
    geometry.applyMatrix4(originHelper.matrixWorld);

+    // 색상값을 계산합니다.
+    const hue = THREE.MathUtils.lerp(0.7, 0.3, amount);
+    const saturation = 1;
+    const lightness = THREE.MathUtils.lerp(0.4, 1.0, amount);
+    color.setHSL(hue, saturation, lightness);
+    // RGB 색상값을 0부터 255까지의 배열로 변환합니다.
+    const rgb = color.toArray().map(v => v * 255);
+
+    // 각 정점의 색을 배열로 저장합니다.
+    const numVerts = geometry.getAttribute('position').count;
+    const itemSize = 3;  // r, g, b
+    const colors = new Uint8Array(itemSize * numVerts);
+
+    // 색상값을 각 정점에 지정할 색상으로 변환합니다.
+    colors.forEach((v, ndx) => {
+      colors[ndx] = rgb[ndx % 3];
+    });
+
+    const normalized = true;
+    const colorAttrib = new THREE.BufferAttribute(colors, itemSize, normalized);
+    geometry.setAttribute('color', colorAttrib);

    geometries.push(geometry);
  });
});
```

추가한 코드에서는 먼저 geometry의 `position` 속성을 가져와 정점의 개수를 파악했습니다. 그런 다음 색상을 지정하기 위해 `Uint8Array`로 변환한 뒤, 이를 `geometry.setAttribute` 메서드로 geometry의 `color` 속성에 지정했죠.

마지막으로 재질(material)이 정점 색상을 사용하도록 설정합니다.

```js
const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(
    geometries, false);
-const material = new THREE.MeshBasicMaterial({color:'red'});
+const material = new THREE.MeshBasicMaterial({
+  vertexColors: THREE.VertexColors,
+});
const mesh = new THREE.Mesh(mergedGeometry, material);
scene.add(mesh);
```

이제 색이 다시 정상적으로 보입니다.

{{{example url="../threejs-lots-of-objects-merged-vertexcolors.html" }}}

geometry를 합치는 건 꽤 자주 사용하는 최적화 기법입니다. 예를 들어 나무 100개를 하나의 geometry로 합치거나, 돌무더기를 하나의 돌 geometry로 합치거나, 울타리의 각 기둥을 하나의 mesh로 합치는 경우가 해당되죠. 마인크래프트의 경우도 모든 타일을 하나하나 다 렌더링하기보다 타일을 하나로 합쳐 보이지 않는 면은 제거하는 기법을 사용할 확률이 높습니다.

하지만 요소를 하나의 mesh로 합쳐버리면 별도의 요소였던 특정 부분을 조작하기가 어렵습니다. 상황에 따라 좋은 방법도 다 다를 테죠. [다음 글](threejs-optimize-lots-of-objects-animated.html)에서는 그 방법 중 하나를 살펴보겠습니다.

<canvas id="c"></canvas>
<script type="module" src="resources/threejs-lots-of-objects.js"></script>