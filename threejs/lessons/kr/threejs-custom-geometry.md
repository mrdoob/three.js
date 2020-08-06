Title: Three.js 사용자 지정 Geometry
Description: 사용자 지정 geometry를 만드는 법에 대해 알아봅니다
TOC: 사용자 지정 Geometry

[이전 글](threejs-primitives.html)에서는 Three.js의 내장 원시 모델에
대해 살펴보았죠. 이 글에서는 이런 모델, geometry를 직접 만들어 볼 것입니다.

거듭 이야기하지만, 정말 진지하게 3D 컨텐츠를 만들 생각이라면
[블렌더(Blender)](https://blender.org),
[마야(Maya)](https://www.autodesk.com/products/maya/overview),
[3D Studio Max](https://www.autodesk.com/products/3ds-max/overview),
[시네마4D(Cinema4D)](https://www.maxon.net/en-us/) 등의 3D 모델링
프로그램을 사용하는 것이 좋습니다. 모델을 만들고 [gLTF](threejs-load-gltf.html)나
[.obj](threejs-load-obj.html) 포멧으로 저장하여 프로젝트에서 불러오는
것이죠. 어떤 프로그램을 선택하든 튜토리얼에는 유용한 내용이 많으니, 2주에서
3주 정도는 해당 프로그램의 튜토리얼을 익히는 데 투자하기 바랍니다.

하지만 때로는 모델링 프로그램을 쓰는 것보다 직접 3D geometry를
만드는 게 유리할 수 있을 겁니다.

먼저 정육면체를 하나 만들어보겠습니다. 이미 원시 모델에 `BoxGeometry`와
`BoxBufferGeometry`가 있긴 하지만, 기본 개념을 이해하는 데는 간단한 게
훨씬 효과적일 테니까요.

Three.js에서 사용자 지정 geometry는 `Geometry` 또는 `BufferGeometry`,
2가지 클래스를 이용해 만들 수 있습니다. `Geometry`는 분명 사용하기에는
편하지만 느리고 메모리도 많이 차지합니다. 삼각형 천 개 정도까지야 그냥
써도 나쁠 것이 없지만, 만 개가 넘어간다면 `BufferGeometry`를 고려하는
것이 좋죠.

당연하게도 `BufferGeometry`는 훨씬 쓰기 어렵지만, 비교적 메모리도 덜 차지하고
훨씬 빠릅니다. 대략 구상하기에 삼각형을 10000개 이상 쓰겠다 싶으면 `BufferGeometry`를
고려하기 바랍니다.

아까 `Geometry`가 느리다고 했는데, 이는 처음 로드할 때와 수정할 때 느리다는
것이지, 렌더링 속도가 느리다는 말이 아닙니다. geometry를 수정하지 않고 geometry가
무지막지하게 크지 않은 한, `Geometry`는 `BufferGeometry`에 비해 프로그램 초기화
단계에서만 약간 더 느릴 뿐입니다. 결국에는 둘 다 살펴보겠지만, 일단-제 생각에-훨씬
간단하고 이해하기 쉬운 `Geometry`를 먼저 써봅시다.

먼저 정육면체를 만들겠습니다. [반응형 디자인에 관한 글](threejs-responsive.html)에서
썼던 예제를 일부 가져오도록 하죠.

먼저 `BoxGeometry`를 `Geometry`로 교체합니다.

```js
-const boxWidth = 1;
-const boxHeight = 1;
-const boxDepth = 1;
-const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
+const geometry = new THREE.Geometry();
```

이제 정육면체의 꼭지점를 추가합니다. 정육면체의 모서리는 총 8개이죠.

<div class="threejs_center"><img src="resources/cube-vertex-positions.svg" style="width: 500px"></div>

중점을 중심으로 각 꼭지점을 추가합니다.

```js
const geometry = new THREE.Geometry();
+geometry.vertices.push(
+  new THREE.Vector3(-1, -1,  1),  // 0
+  new THREE.Vector3( 1, -1,  1),  // 1
+  new THREE.Vector3(-1,  1,  1),  // 2
+  new THREE.Vector3( 1,  1,  1),  // 3
+  new THREE.Vector3(-1, -1, -1),  // 4
+  new THREE.Vector3( 1, -1, -1),  // 5
+  new THREE.Vector3(-1,  1, -1),  // 6
+  new THREE.Vector3( 1,  1, -1),  // 7
+);
```

다음으로 정육면체 한 면에 2개씩, 총 삼각형 12개를 추가해야 합니다.

<div class="threejs_center"><img src="resources/cube-triangles.svg" style="width: 500px"></div>

`Face3` 인스턴스를 만들어 3 꼭지점의 인덱스(index)를 넘겨주면 삼각형
면(face)을 만들 수 있습니다.

꼭지점의 인덱스를 넘겨줄 때는 순서에 유의해야 합니다. 삼각형이 카메라를
바라볼 때, 면이 정육면체의 바깥쪽을 향하려면 시계 반대 방향 순으로 인덱스를
넘겨줘야 합니다.

<div class="threejs_center"><img src="resources/cube-vertex-winding-order.svg" style="width: 500px"></div>

이 패턴대로 정육면체를 구성할 삼각형 12개를 만들어봅시다.

```js
geometry.faces.push(
  // 앞쪽
  new THREE.Face3(0, 3, 2),
  new THREE.Face3(0, 1, 3),
  // 오른쪽
  new THREE.Face3(1, 7, 3),
  new THREE.Face3(1, 5, 7),
  // 뒷쪽
  new THREE.Face3(5, 6, 7),
  new THREE.Face3(5, 4, 6),
  // 왼쪽
  new THREE.Face3(4, 2, 6),
  new THREE.Face3(4, 0, 2),
  // 상단
  new THREE.Face3(2, 7, 6),
  new THREE.Face3(2, 3, 7),
  // 하단
  new THREE.Face3(4, 1, 0),
  new THREE.Face3(4, 5, 1),
);
```

이제 몇 가지만 더 고치면 됩니다.

이 정육면체들은 `BoxGeometry`보다 두 배 더 크므로, 카메라를 약간
더 뒤로 옮겨줍니다.

```js
const fov = 75;
const aspect = 2;  // canvas 기본값
const near = 0.1;
-const far = 5;
+const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
-camera.position.z = 2;
+camera.position.z = 5;
```

커진 만큼 간격을 띄우고, 바꾸는 김에 색상도 바꿔주겠습니다.

```js
const cubes = [
-  makeInstance(geometry, 0x44aa88,  0),
-  makeInstance(geometry, 0x8844aa, -2),
-  makeInstance(geometry, 0xaa8844,  2),
+  makeInstance(geometry, 0x44FF44,  0),
+  makeInstance(geometry, 0x4444FF, -4),
+  makeInstance(geometry, 0xFF4444,  4),
];
```

아직 법선(normal)을 넣지 않았는데, 법선이 없으면 빛은 소용이 없으니 마지막으로
재질(material)을 `MeshBasicMaterial`로 바꿔줍니다.

```js
function makeInstance(geometry, color, x) {
-  const material = new THREE.MeshPhongMaterial({ color });
+  const material = new THREE.MeshBasicMaterial({ color });

  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  ...
```

자, 이제 실행해보죠.

{{{example url="../threejs-custom-geometry-cube.html" }}}

각 삼각형 면의 `color` 속성을 바꿔 색을 따로 지정할 수 있습니다.

```js
geometry.faces[ 0].color = geometry.faces[ 1].color = new THREE.Color('red');
geometry.faces[ 2].color = geometry.faces[ 3].color = new THREE.Color('yellow');
geometry.faces[ 4].color = geometry.faces[ 5].color = new THREE.Color('green');
geometry.faces[ 6].color = geometry.faces[ 7].color = new THREE.Color('cyan');
geometry.faces[ 8].color = geometry.faces[ 9].color = new THREE.Color('blue');
geometry.faces[10].color = geometry.faces[11].color = new THREE.Color('magenta');
```

추가로 재질을 생성할 때 `FaceColors`를 사용한다고 명시해야 하죠.

```js
-const material = new THREE.MeshBasicMaterial({ color });
+const material = new THREE.MeshBasicMaterial({ vertexColors: THREE.FaceColors });
```

{{{example url="../threejs-custom-geometry-cube-face-colors.html" }}}

또는 삼각형 면의 `vertextColors` 속성에 각 꼭지점의 색상을 지정할 수도 있습니다.

```js
geometry.faces.forEach((face, ndx) => {
  face.vertexColors = [
    (new THREE.Color()).setHSL(ndx / 12      , 1, 0.5),
    (new THREE.Color()).setHSL(ndx / 12 + 0.1, 1, 0.5),
    (new THREE.Color()).setHSL(ndx / 12 + 0.2, 1, 0.5),
  ];
});
```

이 또한 꼭지점 색을 사용한다고 명시해야 하죠.

```js
-const material = new THREE.MeshBasicMaterial({vertexColors: THREE.FaceColors});
+const material = new THREE.MeshBasicMaterial({vertexColors: THREE.VertexColors});
```

{{{example url="../threejs-custom-geometry-cube-vertex-colors.html" }}}

빛을 사용하려면 법선을 추가해야 합니다. 법선이란 특정 방향을 나타내는 벡터값으로,
색과 마찬가지로 법선도 각 삼각형 면의 `normal` 속성을 지정해 추가할 수 있습니다.

```js
face.normal = new THREE.Vector3(...)
```

또는 `vertexNormals` 속성에 각 꼭지점의 법선을 배열로 지정할 수도 있죠.

```js
face.vertexNormals = [
  new THREE.Vector3(...),
  new THREE.Vector3(...),
  new THREE.Vector3(...),
]
```

하지만 대게 우리가 지정한 좌표에 따라 알아서 법선을 계산해달라고 하는 게
훨씬 편합니다.

삼각형 면 법선의 경우 `Geometry.computeFaceNormals`를 호출하면 되죠.

```js
geometry.computeFaceNormals();
```

꼭지점 색을 제거하고 다시 재질을 `MeshPhongMaterial`로 바꾸겠습니다.

```js
-const material = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors });
+const material = new THREE.MeshPhongMaterial({ color });
```

이제 정육면체들이 빛의 영향을 받습니다.

{{{example url="../threejs-custom-geometry-cube-face-normals.html" }}}

삼각형 면 법선을 사용하면 물체가 각진 느낌을 줍니다. 꼭지점 법선을 사용하면
훨씬 부드러워 보일 수 있죠. 꼭지점 법선은 `Geometry.computeVertexNormals`를
호출해 사용합니다.

```js
-geometry.computeFaceNormals();
+geometry.computeVertexNormals();
```

아쉽게도 정육면체는 꼭지점 법선의 예제로 적당하지 않습니다. 각 꼭지점이 같은
꼭지점을 쓰는 모든 삼각형 면에서 법선을 가져오기 때문이죠.

{{{example url="../threejs-custom-geometry-cube-vertex-normals.html" }}}

UV라고도 불리는, 텍스처 좌표는 `Geometry.faceVertexUvs` 속성에 삼각형 면들의
층(layer)을 배열로 지정해 추가할 수 있습니다. 정육면체의 경우 다음처럼 지정할
수 있죠.

(※ 참고: [UV 매핑](https://ko.wikipedia.org/wiki/UV_%EB%A7%A4%ED%95%91). 역주)

```js
geometry.faceVertexUvs[0].push(
  // 앞쪽
  [ new THREE.Vector2(0, 0), new THREE.Vector2(1, 1), new THREE.Vector2(0, 1) ],
  [ new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(1, 1) ],
  // 오른쪽
  [ new THREE.Vector2(0, 0), new THREE.Vector2(1, 1), new THREE.Vector2(0, 1) ],
  [ new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(1, 1) ],
  // 뒤쪽
  [ new THREE.Vector2(0, 0), new THREE.Vector2(1, 1), new THREE.Vector2(0, 1) ],
  [ new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(1, 1) ],
  // 왼쪽
  [ new THREE.Vector2(0, 0), new THREE.Vector2(1, 1), new THREE.Vector2(0, 1) ],
  [ new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(1, 1) ],
  // 상단
  [ new THREE.Vector2(0, 0), new THREE.Vector2(1, 1), new THREE.Vector2(0, 1) ],
  [ new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(1, 1) ],
  // 하단
  [ new THREE.Vector2(0, 0), new THREE.Vector2(1, 1), new THREE.Vector2(0, 1) ],
  [ new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(1, 1) ],
);
```

중요한 건 `faceVertexUvs`는 층의 배열이라는 점입니다. 하나의 층은 별도의 UV 좌표이죠.
기본적으로 하나의 UV 층, 층 0이 있어, 예제에서는 그냥 그 층에 UV를 추가했습니다.

다시 삼각형 면 법선을 계산하도록 코드를 바꾸고, 이번에는 재질에 [텍스처를 추가](threejs-textures.html)하겠습니다.

```js
-geometry.computeVertexNormals();
+geometry.computeFaceNormals();

+const loader = new THREE.TextureLoader();
+const texture = loader.load('resources/images/star.png');

function makeInstance(geometry, color, x) {
-  const material = new THREE.MeshPhongMaterial({color});
+  const material = new THREE.MeshPhongMaterial({color, map: texture});

  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  ...
```

{{{example url="../threejs-custom-geometry-cube-texcoords.html" }}}

다음으로는 이 글에서 배운 것을 총 동원해 지형 mesh를 기반으로 높이 맵(heightmap)을
만들어보겠습니다.

높이 맵을 기반으로 한 지형이란, 이차원 높이 배열을 격자 형태로 만든 것을
말합니다. 이차원 높이 배열을 만드는 가장 쉬운 방법은 이미지 편집 프로그램을
사용하는 것이죠. 아래는 제가 만든 96x64 픽셀의 이미지입니다.

<div class="threejs_center"><img src="../resources/images/heightmap-96x64.png" style="width: 512px; image-rendering: pixelated;"></div>

이 이미지의 데이터를 불러와 높이 맵 mesh를 만들겠습니다. 이미지 데이터를
불러올 때는 `ImageLoader`를 활용합니다.

```js
const imgLoader = new THREE.ImageLoader();
imgLoader.load('resources/images/heightmap-96x64.png', createHeightmap);

function createHeightmap(image) {
  // canvas에 이미지를 렌더링한 후, getImageData 메서드를 호출해 픽셀 데이터를 추출합니다
  const ctx = document.createElement('canvas').getContext('2d');
  const { width, height } = image;
  ctx.canvas.width = width;
  ctx.canvas.height = height;
  ctx.drawImage(image, 0, 0);
  const { data } = ctx.getImageData(0, 0, width, height);

  const geometry = new THREE.Geometry();
```

이미지에서 데이터를 추출했으니, 이제 격자를 만들어야 합니다. 이미지의 픽셀
하나당 정사각형 격자 한 칸을 만듭니다.

<div class="threejs_center"><img src="resources/heightmap-points.svg" style="width: 500px"></div>

격자 한 칸당 꼭지점 5개를 만듭니다. 정사각형의 각 꼭지점 당 하나씩 총 4개를 두고,
네 꼭지점의 높이를 평균내 중앙에 하나를 둡니다.

```js
const cellsAcross = width - 1;
const cellsDeep = height - 1;
for (let z = 0; z < cellsDeep; ++z) {
  for (let x = 0; x < cellsAcross; ++x) {
    /**
     * 열의 위치를 높이 데이터로 계산합니다
     * 데이터가 RGBA이므로 4를 곱하지만, R 값만 사용합니다
     **/
    const base0 = (z * width + x) * 4;
    const base1 = base0 + (width * 4);

    // 격자 칸 각 꼭지점의 높이를 참조합니다
    const h00 = data[base0] / 32;
    const h01 = data[base0 + 4] / 32;
    const h10 = data[base1] / 32;
    const h11 = data[base1 + 4] / 32;
    // 높이의 평균값을 구합니다
    const hm = (h00 + h01 + h10 + h11) / 4;

    // 꼭지점의 위치
    const x0 = x;
    const x1 = x + 1;
    const z0 = z;
    const z1 = z + 1;

    // 각 꼭지점의 첫 번째 인덱스를 기록합니다
    const ndx = geometry.vertices.length;

    // 격자에 모퉁이 꼭지점 4개와 중앙 꼭지점 하나를 배치합니다
    geometry.vertices.push(
      new THREE.Vector3(x0, h00, z0),
      new THREE.Vector3(x1, h01, z0),
      new THREE.Vector3(x0, h10, z1),
      new THREE.Vector3(x1, h11, z1),
      new THREE.Vector3((x0 + x1) / 2, hm, (z0 + z1) / 2),
    );
```

다음으로 방금 만든 5개의 정점을 모아 4개의 삼각형을 만들어야 합니다.

<div class="threejs_center"><img src="resources/heightmap-triangles.svg" style="width: 500px"></div>

```js
    // 삼각형 4개를 만듭니다
    geometry.faces.push(
      new THREE.Face3(ndx + 0, ndx + 4, ndx + 1),
      new THREE.Face3(ndx + 1, ndx + 4, ndx + 3),
      new THREE.Face3(ndx + 3, ndx + 4, ndx + 2),
      new THREE.Face3(ndx + 2, ndx + 4, ndx + 0),
    );

    // 각 삼각형 면의 각 꼭지점에 텍스처 좌표를 추가합니다
    const u0 = x / cellsAcross;
    const v0 = z / cellsDeep;
    const u1 = (x + 1) / cellsAcross;
    const v1 = (z + 1) / cellsDeep;
    const um = (u0 + u1) / 2;
    const vm = (v0 + v1) / 2;
    geometry.faceVertexUvs[0].push(
      [ new THREE.Vector2(u0, v0), new THREE.Vector2(um, vm), new THREE.Vector2(u1, v0) ],
      [ new THREE.Vector2(u1, v0), new THREE.Vector2(um, vm), new THREE.Vector2(u1, v1) ],
      [ new THREE.Vector2(u1, v1), new THREE.Vector2(um, vm), new THREE.Vector2(u0, v1) ],
      [ new THREE.Vector2(u0, v1), new THREE.Vector2(um, vm), new THREE.Vector2(u0, v0) ],
    );
  }
}
```

이제 마무리 지어보죠.

```js
  geometry.computeFaceNormals();

  // geometry를 중점에 배치
  geometry.translate(width / -2, 0, height / -2);

  const loader = new THREE.TextureLoader();
  const texture = loader.load('resources/images/star.png');

  const material = new THREE.MeshPhongMaterial({ color: 'green', map: texture });

  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
}
```

장면을 보기 쉽도록 몇 가지 요소를 추가하겠습니다.

`OrbitControls`를 추가하고,

```js
import * as THREE from './resources/three/r119/build/three.module.js';
+import { OrbitControls } from './resources/threejs/r119/examples/jsm/controls/OrbitControls.js';
```

```js
const fov = 75;
const aspect = 2;  // canvas 기본 비율
const near = 0.1;
-const far = 100;
+const far = 200;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
-camera.position.z = 5;
+camera.position.set(20, 20, 20);

+const controls = new OrbitControls(camera, canvas);
+controls.target.set(0, 0, 0);
+controls.update();
```

조명도 두 개 추가합니다.

```js
-{
+function addLight(...pos) {
  const color = 0xFFFFFF;
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
-  light.position.set(-1, 2, 4\);
+  light.position.set(...pos);
  scene.add(light);
}

+addLight(-1, 2, 4);
+addLight(1, 2, -2);
```

정육면체를 회전시키는 코드는 필요없으니 삭제하도록 하죠.

{{{example url="../threejs-custom-geometry-heightmap.html" }}}

이 글이 `Geometry`를 활용하는 데 도움이 되었으면 합니다.

글이 길어졌으니 `BufferGeometry`는 [다음 글](threejs-custom-buffergeometry.html)에서
살펴보도록 하겠습니다.
