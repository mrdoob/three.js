Title: Three.js 사용자 지정 BufferGeometry
Description: 사용자 지정 BufferGeometry를 만드는 법에 대해 알아봅니다
TOC: 사용자 지정 BufferGeometry

{{{warning msgId="updateNeeded" issue="https://github.com/gfxfundamentals/threejsfundamentals/issues/187"}}}

[이전 글](threejs-custom-geometry.html)에서는 `Geometry`의 사용법에 대해
알아보았습니다. 예고한 대로 이번에는 `BufferGeometry`에 대해 살펴보도록 하죠.
`BufferGeometry`는 비교적 쓰기가 어렵지만 *일반적으로* 초기화 속도가 빠르고
메모리 점유율이 낮습니다.

[이전 내용](threejs-custom-geometry.html)을 간단하게 환기하겠습니다. `Geometry`를
만들기 위해 우리는 먼저 꼭지점을 나타내는 `Vector3` 인스턴스(위치값)를 배열로 넘기고,
이 꼭지점 배열의 인덱스 값을 인자로 넘겨 삼각형, `Face3` 인스턴스를 만들었습니다. 또한
각 `Face3` 인스턴스에 삼각형 면 법선이나 꼭지점 법선을 지정할 수 있다는 것, 삼각형 면
또는 각 꼭지점 별로 색을 지정할 수 있다는 것도 배웠죠. 글의 마지막에서는 텍스처 좌표(UVs)
배열의 평행 배열로 UV 매핑을 구현하기도 했습니다(각 삼각형 면마다 배열로 된 UV 배열 하나,
각 꼭지점마다 UV 하나).

<div class="threejs_center"><img src="resources/threejs-geometry.svg" style="width: 700px"></div>

반면에 `BufferGeometry`는 `BufferAttribute`라는 것을 사용합니다. 각 `BufferAttribute`는
위치(positions), 법선(normals), 색(colors), uv 데이터의 배열이고, 이들을 모으면 각 꼭지점에
대한 *평행 배열* 형식의 데이터가 되죠.

<div class="threejs_center"><img src="resources/threejs-attributes.svg" style="width: 700px"></div>

그림을 보면 총 4개의 속성(attribute), `position`, `normal`, `color`, `uv`가 있습니다.
이들은 평행 배열로 각 속성의 N 번째 데이터 묶음이 한 꼭지점의 데이터를 나타냅니다. 표시한
index = 4 위치의 꼭지점 데이터를 보세요. 이 묶음이 하나의 꼭지점을 정의합니다.

이해를 돕기 위해 정육면체의 한 모서리를 강조해보겠습니다.

<div class="threejs_center"><img src="resources/cube-faces-vertex.svg" style="width: 500px"></div>

이 경우 맞닿은 면의 색이 다르기에, 이 모서리는 각 면에 다른 법선을 제공해야 합니다.
마찬가지로 UV도 달라야 하죠. 이는 `Geometry`와 `BufferGeometry`의 가장 큰 차이점입니다.
`BufferGeometry`는 `Geometry`와 달리 꼭지점은 물론 어떤 요소도 공유할 수 없습니다.
하나의 *꼭지점*은 위 4개 속성의 묶음이고, 때문에 속성이 달라진다면 그건 다른 꼭지점이
되는 것이죠.

사실 `Geometry`는 `BufferGeometry`와 근본적으로 다르지 않습니다. 사용자가 `Geometry`를
사용하면 Three.js가 알아서 이를 `BufferGeometry` 형식으로 변환해주는 것이죠. 메모리를 더
많이 사용하는 것도 `Vector3`나, `Vector2`, `Face3`, 그리고 기타 데이터를 위와 같은 `BufferAttribute`
형태로 변환하기 때문입니다. 반면에 `BufferGeometry`는 이런 변환 작업을 직접 해줘야 하죠.

이전과 마찬가지로 `BufferGeometry`로 정육면체를 만들어보겠습니다. 굳이 정육면체를 쓰는
이유는 모서리의 꼭지점을 공유하는 듯해도 사실 그렇지 않기 때문이죠. 필요한 꼭지점을
전부 생성한 후, 꼭지점 데이터를 평행 배열로 변환해 `BufferAttribute`를 만들고, 이를
`BufferGeometry`에 추가해야 합니다.

일단 [이전 글](threejs-custom-geometry.html)의 텍스처 좌표 설정 예제를 가져옵니다.
`Geometry`를 만드는 코드를 전부 삭제한 뒤, 정육면체를 만드는 데 필요한 데이터를 정렬합니다.
아까 말했듯 꼭지점의 속성 중 하나라도 다르다면 별도의 꼭지점으로 분리해야 합니다. 정육면체의
경우는 총 꼭지점 36개가 필요하죠. 면 6개, 면 하나당 삼각형 2개, 삼각형 하나 당 꼭지점 3개,
총 36개입니다.

```js
const vertices = [
  // 앞쪽
  { pos: [-1, -1,  1], norm: [ 0,  0,  1], uv: [0, 0], },
  { pos: [ 1, -1,  1], norm: [ 0,  0,  1], uv: [1, 0], },
  { pos: [-1,  1,  1], norm: [ 0,  0,  1], uv: [0, 1], },

  { pos: [-1,  1,  1], norm: [ 0,  0,  1], uv: [0, 1], },
  { pos: [ 1, -1,  1], norm: [ 0,  0,  1], uv: [1, 0], },
  { pos: [ 1,  1,  1], norm: [ 0,  0,  1], uv: [1, 1], },
  // 오른쪽
  { pos: [ 1, -1,  1], norm: [ 1,  0,  0], uv: [0, 0], },
  { pos: [ 1, -1, -1], norm: [ 1,  0,  0], uv: [1, 0], },
  { pos: [ 1,  1,  1], norm: [ 1,  0,  0], uv: [0, 1], },

  { pos: [ 1,  1,  1], norm: [ 1,  0,  0], uv: [0, 1], },
  { pos: [ 1, -1, -1], norm: [ 1,  0,  0], uv: [1, 0], },
  { pos: [ 1,  1, -1], norm: [ 1,  0,  0], uv: [1, 1], },
  // 뒤쪽
  { pos: [ 1, -1, -1], norm: [ 0,  0, -1], uv: [0, 0], },
  { pos: [-1, -1, -1], norm: [ 0,  0, -1], uv: [1, 0], },
  { pos: [ 1,  1, -1], norm: [ 0,  0, -1], uv: [0, 1], },

  { pos: [ 1,  1, -1], norm: [ 0,  0, -1], uv: [0, 1], },
  { pos: [-1, -1, -1], norm: [ 0,  0, -1], uv: [1, 0], },
  { pos: [-1,  1, -1], norm: [ 0,  0, -1], uv: [1, 1], },
  // 왼쪽
  { pos: [-1, -1, -1], norm: [-1,  0,  0], uv: [0, 0], },
  { pos: [-1, -1,  1], norm: [-1,  0,  0], uv: [1, 0], },
  { pos: [-1,  1, -1], norm: [-1,  0,  0], uv: [0, 1], },

  { pos: [-1,  1, -1], norm: [-1,  0,  0], uv: [0, 1], },
  { pos: [-1, -1,  1], norm: [-1,  0,  0], uv: [1, 0], },
  { pos: [-1,  1,  1], norm: [-1,  0,  0], uv: [1, 1], },
  // 상단
  { pos: [ 1,  1, -1], norm: [ 0,  1,  0], uv: [0, 0], },
  { pos: [-1,  1, -1], norm: [ 0,  1,  0], uv: [1, 0], },
  { pos: [ 1,  1,  1], norm: [ 0,  1,  0], uv: [0, 1], },

  { pos: [ 1,  1,  1], norm: [ 0,  1,  0], uv: [0, 1], },
  { pos: [-1,  1, -1], norm: [ 0,  1,  0], uv: [1, 0], },
  { pos: [-1,  1,  1], norm: [ 0,  1,  0], uv: [1, 1], },
  // 하단
  { pos: [ 1, -1,  1], norm: [ 0, -1,  0], uv: [0, 0], },
  { pos: [-1, -1,  1], norm: [ 0, -1,  0], uv: [1, 0], },
  { pos: [ 1, -1, -1], norm: [ 0, -1,  0], uv: [0, 1], },

  { pos: [ 1, -1, -1], norm: [ 0, -1,  0], uv: [0, 1], },
  { pos: [-1, -1,  1], norm: [ 0, -1,  0], uv: [1, 0], },
  { pos: [-1, -1, -1], norm: [ 0, -1,  0], uv: [1, 1], },
];
```

다음으로 이 배열을 3개의 평행 배열로 변환합니다.

```js
const positions = [];
const normals = [];
const uvs = [];
for (const vertex of vertices) {
  positions.push(...vertex.pos);
  normals.push(...vertex.norm);
  uvs.push(...vertex.uv);
}
```

이제 `BufferGeometry`를 만듭니다. 그리고 각 배열로 `BufferAttribute` 인스턴스를 생성한
뒤 `BufferGeometry`에 추가합니다.

```js
  const geometry = new THREE.BufferGeometry();
  const positionNumComponents = 3;
  const normalNumComponents = 3;
  const uvNumComponents = 2;
  geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents));
  geometry.setAttribute(
      'normal',
      new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents));
  geometry.setAttribute(
      'uv',
      new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents));
```

이때 정확히 Three.js가 원하는 속성 이름을 써야 합니다(사용자 지정 쉐이더를 만들 때와는
달리). 이 경우에는 `position`, `normal`, `uv`이죠. 꼭지점 색을 지정하려면 `color` 속성을
지정해야 합니다.

아까 `positions`, `normals`, `uvs`, 3개의 자바스크립트 순수 배열을 생성했습니다.
그리고 위에서 해당 배열을 [형식화 배열](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/TypedArray),
`Float32Array`로 변환했죠. `BufferAttribute`는 순수 배열이 아니라 형식화 배열을
인자로 받습니다. 또한 하나의 꼭지점에 몇 개의 요소를 사용할 지 지정해줘야 하죠.
위치(position)과 법선(normal)의 경우 x, y, z 총 3개이고, UV는 u, v 총 2개입니다.

{{{example url="../threejs-custom-buffergeometry-cube.html"}}}

데이터가 너무 많네요. 크게 구조를 바꾸긴 어렵지만, 꼭지점을 인덱스로 참조하게끔 바꾸면
조금 나을 듯합니다. 정육면체 데이터를 다시 봅시다. 각 면은 2개의 삼각형, 삼각형 하나에는
꼭지점이 3개 있으므로 면 하나에는 총 6개의 꼭지점이 있습니다. 하지만 이 중 꼭지점 2개는
완전히 같죠(같은 위치, 같은 법선, 같은 uv). 중복된 꼭지점을 제거하고 인덱스로 데이터를
불러오도록 바꿀 수 있겠네요. 먼저 중복된 꼭지점을 제거하겠습니다.

```js
const vertices = [
  // 앞쪽
  { pos: [-1, -1,  1], norm: [ 0,  0,  1], uv: [0, 0], }, // 0
  { pos: [ 1, -1,  1], norm: [ 0,  0,  1], uv: [1, 0], }, // 1
  { pos: [-1,  1,  1], norm: [ 0,  0,  1], uv: [0, 1], }, // 2
-
-  { pos: [-1,  1,  1], norm: [ 0,  0,  1], uv: [0, 1], },
-  { pos: [ 1, -1,  1], norm: [ 0,  0,  1], uv: [1, 0], },
  { pos: [ 1,  1,  1], norm: [ 0,  0,  1], uv: [1, 1], }, // 3
  // 오른쪽
  { pos: [ 1, -1,  1], norm: [ 1,  0,  0], uv: [0, 0], }, // 4
  { pos: [ 1, -1, -1], norm: [ 1,  0,  0], uv: [1, 0], }, // 5
-
-  { pos: [ 1,  1,  1], norm: [ 1,  0,  0], uv: [0, 1], },
-  { pos: [ 1, -1, -1], norm: [ 1,  0,  0], uv: [1, 0], },
  { pos: [ 1,  1,  1], norm: [ 1,  0,  0], uv: [0, 1], }, // 6
  { pos: [ 1,  1, -1], norm: [ 1,  0,  0], uv: [1, 1], }, // 7
  // 뒤쪽
  { pos: [ 1, -1, -1], norm: [ 0,  0, -1], uv: [0, 0], }, // 8
  { pos: [-1, -1, -1], norm: [ 0,  0, -1], uv: [1, 0], }, // 9
-
-  { pos: [ 1,  1, -1], norm: [ 0,  0, -1], uv: [0, 1], },
-  { pos: [-1, -1, -1], norm: [ 0,  0, -1], uv: [1, 0], },
  { pos: [ 1,  1, -1], norm: [ 0,  0, -1], uv: [0, 1], }, // 10
  { pos: [-1,  1, -1], norm: [ 0,  0, -1], uv: [1, 1], }, // 11
  // 왼쪽
  { pos: [-1, -1, -1], norm: [-1,  0,  0], uv: [0, 0], }, // 12
  { pos: [-1, -1,  1], norm: [-1,  0,  0], uv: [1, 0], }, // 13
-
-  { pos: [-1,  1, -1], norm: [-1,  0,  0], uv: [0, 1], },
-  { pos: [-1, -1,  1], norm: [-1,  0,  0], uv: [1, 0], },
  { pos: [-1,  1, -1], norm: [-1,  0,  0], uv: [0, 1], }, // 14
  { pos: [-1,  1,  1], norm: [-1,  0,  0], uv: [1, 1], }, // 15
  // 상단
  { pos: [ 1,  1, -1], norm: [ 0,  1,  0], uv: [0, 0], }, // 16
  { pos: [-1,  1, -1], norm: [ 0,  1,  0], uv: [1, 0], }, // 17
-
-  { pos: [ 1,  1,  1], norm: [ 0,  1,  0], uv: [0, 1], },
-  { pos: [-1,  1, -1], norm: [ 0,  1,  0], uv: [1, 0], },
  { pos: [ 1,  1,  1], norm: [ 0,  1,  0], uv: [0, 1], }, // 18
  { pos: [-1,  1,  1], norm: [ 0,  1,  0], uv: [1, 1], }, // 19
  // 하단
  { pos: [ 1, -1,  1], norm: [ 0, -1,  0], uv: [0, 0], }, // 20
  { pos: [-1, -1,  1], norm: [ 0, -1,  0], uv: [1, 0], }, // 21
-
-  { pos: [ 1, -1, -1], norm: [ 0, -1,  0], uv: [0, 1], },
-  { pos: [-1, -1,  1], norm: [ 0, -1,  0], uv: [1, 0], },
  { pos: [ 1, -1, -1], norm: [ 0, -1,  0], uv: [0, 1], }, // 22
  { pos: [-1, -1, -1], norm: [ 0, -1,  0], uv: [1, 1], }, // 23
];
```

이제 꼭지점 24개만 남았습니다. 중복되는 꼭지점은 없죠. 이제 `BufferGeometry.setIndex`
메서드에 각 꼭지점 데이터의 인덱스값 36개-삼각형이 12개이므로-를 넘겨줍니다.

```js
geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, positionNumComponents));
geometry.setAttribute(
    'normal',
    new THREE.BufferAttribute(normals, normalNumComponents));
geometry.setAttribute(
    'uv',
    new THREE.BufferAttribute(uvs, uvNumComponents));

+geometry.setIndex([
+   0,  1,  2,   2,  1,  3,  // 앞쪽
+   4,  5,  6,   6,  5,  7,  // 오른쪽
+   8,  9, 10,  10,  9, 11,  // 뒤쪽
+  12, 13, 14,  14, 13, 15,  // 왼쪽
+  16, 17, 18,  18, 17, 19,  // 상단
+  20, 21, 22,  22, 21, 23,  // 하단
+]);
```

{{{example url="../threejs-custom-buffergeometry-cube-indexed.html"}}}

`Geometry`와 마찬가지로 `BufferGeometry`에 법선을 지정하지 않았다면 [`computeVertexNormals`](BufferGeometry.computeVertexNormals)
메서드를 호출해 자동으로 법선을 지정할 수 있습니다. 다만 데이터가 조금이라도 다르다면
꼭지점을 공유할 수 없기에 `Geometry`의 경우와는 조금 다른 결과를 보여줄 겁니다.

<div class="spread">
  <div>
    <div data-diagram="bufferGeometryCylinder"></div>
    <div class="code">BufferGeometry</div>
  </div>
  <div>
    <div data-diagram="geometryCylinder"></div>
    <div class="code">Geometry</div>
  </div>
</div>

위 두 원통은 `computeVertexNormals` 메서드를 호출해 법선을 생성했습니다. 자세히 보면
왼쪽 원통에 이음매가 있는 게 보일 텐데, 이는 원통의 끝과 시작점의 UV가 달라 꼭지점을
공유할 수 없기 때문입니다. 그다지 큰 문제는 아니지만, 알아두어 나쁠 건 없죠. 이를 해결하려면
법선을 직접 지정해야 합니다.

아까는 처음에 순수 배열을 썼지만, 처음부터 [형식화 배열](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)을
사용할 수도 있습니다. 다만 형식화 배열은 초기화할 때 미리 크기를 지정해줘야 합니다.
그렇게 어려운 일은 아니지만, 순수 배열은 `push` 메서드로 요소를 추가하고 바뀐
길이를 `length` 속성으로 확인할 수 있습니다. 하지만 형식화 배열을 사용하면 어디서
요소를 추가했는지 직접 일일이 기록해야 하죠.

예제의 경우는 사전에 정해진 데이터를 사용하기에 배열 길이를 미리 구하는 게 어렵지
않습니다.

```js
-const positions = [];
-const normals = [];
-const uvs = [];
+const numVertices = vertices.length;
+const positionNumComponents = 3;
+const normalNumComponents = 3;
+const uvNumComponents = 2;
+const positions = new Float32Array(numVertices * positionNumComponents);
+const normals = new Float32Array(numVertices * normalNumComponents);
+const uvs = new Float32Array(numVertices * uvNumComponents);
+let posNdx = 0;
+let nrmNdx = 0;
+let uvNdx = 0;
for (const vertex of vertices) {
-  positions.push(...vertex.pos);
-  normals.push(...vertex.norm);
-  uvs.push(...vertex.uv);
+  positions.set(vertex.pos, posNdx);
+  normals.set(vertex.norm, nrmNdx);
+  uvs.set(vertex.uv, uvNdx);
+  posNdx += positionNumComponents;
+  nrmNdx += normalNumComponents;
+  uvNdx += uvNumComponents;
}

geometry.setAttribute(
    'position',
-    new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents));
+    new THREE.BufferAttribute(positions, positionNumComponents));
geometry.setAttribute(
    'normal',
-    new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents));
+    new THREE.BufferAttribute(normals, normalNumComponents));
geometry.setAttribute(
    'uv',
-    new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents));
+    new THREE.BufferAttribute(uvs, uvNumComponents));

geometry.setIndex([
   0,  1,  2,   2,  1,  3,  // 앞쪽
   4,  5,  6,   6,  5,  7,  // 오른쪽
   8,  9, 10,  10,  9, 11,  // 뒤쪽
  12, 13, 14,  14, 13, 15,  // 왼쪽
  16, 17, 18,  18, 17, 19,  // 상단
  20, 21, 22,  22, 21, 23,  // 하단
]);
```

{{{example url="../threejs-custom-buffergeometry-cube-typedarrays.html"}}}

꼭지점의 일부를 수정하고 싶다면 형식화 배열을 사용하는 게 좋습니다.

뭔가 꼭지점을 동적으로 수정하는 예제를 찾아보려고 노력했는데, 찾기가 어렵네요.
그냥 구체를 만들고 구체의 각 사분면(quad)을 중심으로부터 안팎으로 움직여보겠습니다.

아래는 구체의 위치값과 인덱스를 생성하는 코드입니다. 사분면 내의 꼭지점은 서로
공유할 수 있지만, 사분면은 각각 움직여야 하므로 사분면끼리는 공유하지 않도록
합니다.

구체의 정점을 구하기 위해 좀 더 복잡한 방법을 쓸 수도 있지만, 귀찮으니 그냥
`Object3D` 3개를 계층 구조로 배열해 쓰겠습니다. 이 방식에 대해서는 [많은 물체를
최적화하는 방법](threejs-optimize-lots-of-objects.html)에서 더 자세히 다루겠습니다.

```js
function makeSpherePositions(segmentsAround, segmentsDown) {
  const numVertices = segmentsAround * segmentsDown * 6;
  const numComponents = 3;
  const positions = new Float32Array(numVertices * numComponents);
  const indices = [];

  const longHelper = new THREE.Object3D();
  const latHelper = new THREE.Object3D();
  const pointHelper = new THREE.Object3D();
  longHelper.add(latHelper);
  latHelper.add(pointHelper);
  pointHelper.position.z = 1;
  const temp = new THREE.Vector3();

  function getPoint(lat, long) {
    latHelper.rotation.x = lat;
    longHelper.rotation.y = long;
    longHelper.updateMatrixWorld(true);
    return pointHelper.getWorldPosition(temp).toArray();
  }

  let posNdx = 0;
  let ndx = 0;
  for (let down = 0; down < segmentsDown; ++down) {
    const v0 = down / segmentsDown;
    const v1 = (down + 1) / segmentsDown;
    const lat0 = (v0 - 0.5) * Math.PI;
    const lat1 = (v1 - 0.5) * Math.PI;

    for (let across = 0; across < segmentsAround; ++across) {
      const u0 = across / segmentsAround;
      const u1 = (across + 1) / segmentsAround;
      const long0 = u0 * Math.PI * 2;
      const long1 = u1 * Math.PI * 2;

      positions.set(getPoint(lat0, long0), posNdx);  posNdx += numComponents;
      positions.set(getPoint(lat1, long0), posNdx);  posNdx += numComponents;
      positions.set(getPoint(lat0, long1), posNdx);  posNdx += numComponents;
      positions.set(getPoint(lat1, long1), posNdx);  posNdx += numComponents;

      indices.push(
        ndx, ndx + 1, ndx + 2,
        ndx + 2, ndx + 1, ndx + 3,
      );
      ndx += 4;
    }
  }
  return { positions, indices };
}
```

만든 함수를 다음처럼 호출합니다.

```js
const segmentsAround = 24;
const segmentsDown = 16;
const { positions, indices } = makeSpherePositions(segmentsAround, segmentsDown);
```

여기서 반환된 위치값(positions)은 구체의 위치값을 기반으로 합니다. 이는 법선의 값(normals)과
같으니 법선을 따로 구할 필요 없이 위치값을 복사해서 쓰면 됩니다.

```js
const normals = positions.slice();
```

다음으로 각 속성을 지정합니다.

```js
const geometry = new THREE.BufferGeometry();
const positionNumComponents = 3;
const normalNumComponents = 3;

+const positionAttribute = new THREE.BufferAttribute(positions, positionNumComponents);
+positionAttribute.setUsage(THREE.DynamicDrawUsage);
geometry.setAttribute(
    'position',
+    positionAttribute);
geometry.setAttribute(
    'normal',
    new THREE.BufferAttribute(normals, normalNumComponents));
geometry.setIndex(indices);
```

예제에서 차이점이 있는 부분을 표시해 두었습니다. 위치 속성에 참조값을 넘겨주었고, 이
속성이 동적이라고 명시했습니다. 이는 Three.js에게 해당 속성을 자주 변경될 수 있음을
알려주는 역할이죠.

이제 `render` 함수에서 매 프레임마다 법선을 기준으로 위치값을 변경해줍니다.

```js
const temp = new THREE.Vector3();

...

for (let i = 0; i < positions.length; i += 3) {
  const quad = (i / 12 | 0);
  const ringId = quad / segmentsAround | 0;
  const ringQuadId = quad % segmentsAround;
  const ringU = ringQuadId / segmentsAround;
  const angle = ringU * Math.PI * 2;
  temp.fromArray(normals, i);
  temp.multiplyScalar(THREE.MathUtils.lerp(1, 1.4, Math.sin(time + ringId + angle) * .5 + .5));
  temp.toArray(positions, i);
}
positionAttribute.needsUpdate = true;
```

마지막으로 `positionAttribute.needsUpdate` 속성을 활성화해 변화를 감지하도록 합니다.

{{{example url="../threejs-custom-buffergeometry-dynamic.html"}}}

`Geometry`와 `BufferGeometry` 중 어떤 것을 쓸 것인지는 전적으로 여러분의 선택입니다.
이 글이 `BufferGeometry`로 사용자 지정 geometry를 만들고, `BufferAttribute`를 다루는
데 도움이 되었으면 좋겠네요.

<canvas id="c"></canvas>
<script type="module" src="resources/threejs-custom-buffergeometry.js"></script>
