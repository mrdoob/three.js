Title: Three.js의 원시 모델
Description: Three.js의 원시 모델을 살펴봅니다.
TOC: 원시 모델

※ 이 글은 Three.js의 튜토리얼 시리즈로서,
먼저 [Three.js의 기본 구조에 관한 글](threejs-fundamentals.html)을
읽고 오길 권장합니다.


Three.js에는 다양한 원시 모델이 있습니다. 먼저 Three.js의 원시 모델이란,
주로 런타임에서 다양한 인자들로 정의한 3D 모양을 의미합니다.

원시 모델은 주로 구체로 공 모양을 만든다거나, 수많은 육면체를 모아
3D 그래프를 만드는 데 사용합니다. 또한 3D에 입문한다거나, 모의
프로젝트를 만들 때 사용하기도 하죠. 물론 대부분의 3D 앱은 그래픽
전문가가 [블렌더(Blender)](https://blender.org), [마야(Maya)](https://www.autodesk.com/products/maya/),
[시네마 4D(Cinema 4D)](https://www.maxon.net/en-us/products/cinema-4d/) 등으로
만든 그래픽 모델을 사용합니다. Three.js도 이런 외부 모델을 불러올 수
있지만, 이건 나중에 알아보기로 하고 일단 이 글에서는 사용 가능한 원시
모델에 무엇이 있는지 살펴보도록 하죠.

앞으로 소개할 원시 모델들은 대부분 기본값이 있으므로 필요에 따라
인자를 넣어주면 됩니다.

<div id="Diagram-BoxBufferGeometry" data-primitive="BoxBufferGeometry">육면체(Box)</div>
<div id="Diagram-CircleBufferGeometry" data-primitive="CircleBufferGeometry">원(flat circle)</div>
<div id="Diagram-ConeBufferGeometry" data-primitive="ConeBufferGeometry">원뿔(Cone)</div>
<div id="Diagram-CylinderBufferGeometry" data-primitive="CylinderBufferGeometry">원통(Cylinder)</div>
<div id="Diagram-DodecahedronBufferGeometry" data-primitive="DodecahedronBufferGeometry">십이면체(Dodecahedron)</div>
<div id="Diagram-ExtrudeBufferGeometry" data-primitive="ExtrudeBufferGeometry">사각(bevel)을 주어 깍아낸(extruded) 2D 모양입니다.
아래에서는 하트 모양으로 깍아냈죠. <code>ExtrudedBufferGeometry</code>는 나중에 설명할
<code>TextBufferGeometry</code>과 <code>TextGeometry</code>의 기초 모델입니다.</div>
<div id="Diagram-IcosahedronBufferGeometry" data-primitive="IcosahedronBufferGeometry">이십면체(Icosahedron)</div>
<div id="Diagram-LatheBufferGeometry" data-primitive="LatheBufferGeometry">선(line)을 회전시켜 만든 모양입니다. 램프, 볼링핀, 초, 초 받침, 와인잔, 유리잔 등이 있죠(물레로 도자기를 만드는 것처럼. 역주). 2D 형태를 점(point, Vector2 클래스를 말함. 역주)을 사용해 지정하고, Three.js에게 축을 따라 세분값(아래 예제의 <code>segments</code> 값. 역주)과 회전값(아래 예제의 <code>phiLength</code> 값. 역주)을 지정해주면 됩니다.</div>
<div id="Diagram-OctahedronBufferGeometry" data-primitive="OctahedronBufferGeometry">팔면체(Octahedron)</div>
<div id="Diagram-ParametricBufferGeometry" data-primitive="ParametricBufferGeometry">2D 격자값(격자 하나의 벡터값)을 받아 3D 값을 반환하는 함수를 인자로 전달하여 면을 만듭니다.</div>
<div id="Diagram-PlaneBufferGeometry" data-primitive="PlaneBufferGeometry">2D 평면(2D plane)</div>
<div id="Diagram-PolyhedronBufferGeometry" data-primitive="PolyhedronBufferGeometry">다면체입니다. 주어진 3D 점들(아래 <code>verticesOfCube</code>. 역주)을 중심으로 삼각형(아래 <code>indicesOfFaces</code>. 역주)을 구 형태로 잇습니다.</div>
<div id="Diagram-RingBufferGeometry" data-primitive="RingBufferGeometry">중앙이 빈 2D 디스크(disc)입니다.</div>
<div id="Diagram-ShapeBufferGeometry" data-primitive="ShapeBufferGeometry">삼각형으로 이루어진 2D 윤곽선입니다.</div>
<div id="Diagram-SphereBufferGeometry" data-primitive="SphereBufferGeometry">구(Sphere)</div>
<div id="Diagram-TetrahedronBufferGeometry" data-primitive="TetrahedronBufferGeometry">사면체(tetrahedron)</div>
<div id="Diagram-TextBufferGeometry" data-primitive="TextBufferGeometry">3D 폰트와 문자열로 만든 3D 텍스트입니다.</div>
<div id="Diagram-TorusBufferGeometry" data-primitive="TorusBufferGeometry">원환체(torus), 도넛(donut)</div>
<div id="Diagram-TorusKnotBufferGeometry" data-primitive="TorusKnotBufferGeometry">원환체 매듭(torus knot)</div>
<div id="Diagram-TubeBufferGeometry" data-primitive="TubeBufferGeometry">패스를 따라 이어진 원입니다.</div>
<div id="Diagram-EdgesGeometry" data-primitive="EdgesGeometry">다른 <code>geometry</code>를 받는 헬퍼 객체로, 각 면 사이의 각이 일정 값 이상일 때만 모서리를 표시합니다. 상단의 육면체 예제를 보면 육면체를 만드는 삼각형이 표면에 전부 표시된 것을 확인할 수 있는데, <code>EdgesGeometry</code>를 사용할 경우 표면에 있던 선들이 전부 사라집니다. 아래 예제의 <code>thresholdAngle</code> 값을 조정해 해당 값 이하인 모서리가 전부 사라지는 것을 확인해보세요.</div>
<div id="Diagram-WireframeGeometry" data-primitive="WireframeGeometry">매개변수로 받은 <code>geometry</code>의 모서리 하나당 하나의 선분(2개의 점)을 가진 <code>geometry</code>를 생성합니다. WebGl은 보통 선분 하나당 2개의 점을 필요로 합니다. 때문에 이 모델을 사용하지 않는 경우, 모서리가 없어지거나 추가되는 현상이 발생할 수 있습니다. 예를 들어 2D 삼각형을 만드는 경우, 대부분 3개의 점을 이용해 삼각형을 만들려고 할 겁니다. <code>wireframe: true</code>라는 옵션이 있기는 하나, 이를 이용해 삼각형을 만들면 (WebGl은 삼각형을 만들 때 6개의 점을 요구하므로. 역주) 출력되는 건 선 하나 뿐일 겁니다. 삼각형 <code>geometry</code>를 <code>WireframeGeometry</code>에 넘겨주면 6개의 점과 3개의 선분을 가진 새 <code>geometry</code>를 생성합니다.</div>

눈치채셨겠지만 대부분의 원시 모델은 `Geometry`와 `BufferGeometry`가
짝을 이룹니다. 다른 차이점들도 있지만 둘의 가장 큰 차이점은 성능과
확장성입니다.

`BufferGeometry` 기반의 원시 모델은 성능에 최적화된 모델입니다.
`geometry`의 정점들은 바로 렌더링 시 GPU에서 불러오기 좋은 배열
형태로 최적화됩니다. 때문에 초기화 속도도 빠르고 메모리 점유율도
낮지만, 이 `geometry`의 데이터를 수정하려면 복잡한 프로그래밍 과정을
거쳐야 합니다.

이에 반해 `Geometry` 기반의 원시 모델은 훨씬 다루기 쉽습니다.
3D 정점을 만드는 데는 `Vector3` 클래스, 삼각형을 만드는 데는
`Face3` 클래스 등 자바스크립트 기반 클래스로 이루어져 있죠.
다만 `BufferGeometry`에 비해 약간 많은 메모리를 더 차지하고,
렌더링을 위해 Three.js가 이 모델과 유사한 `BufferGeometry`로
변형시키는 과정이 들어간다는 것이 단점입니다.

원시 모델을 사용하지 않을 계획이거나, 기하학 모델을 수학적으로
계산하는 데 익숙하다면, `BufferGeometry` 기반의 원시 모델을
사용하는 것이 좋습니다. 렌더링 전에 어떤 값을 수정해야 한다면
`Geometry`가 훨씬 다루기 쉽겠죠.

하나 예를 들면, `BufferGeometry`는 정점을 추가하는 것이 어렵습니다.
`BufferGeometry`는 생성 시에 정점의 수가 정해지며, 메모리에 할당되고,
그 다음 정점 데이터를 채워 넣습니다. 반면에 `Geometry`는 생성 후에도
얼마든지 정점을 추가할 수 있죠.

[커스텀 geometry를 만드는 법](threejs-custom-geometry.html)에 대해서는
나중에 자세히 다룰 것이므로, 지금은 각 원시 모델로 예제를 만들어 보겠습니다.
예제 코드는 [지난 글](threejs-responsive.html)에서 썼던 예제를 쓸 거에요.

먼저 배경색을 지정합니다.

```js
const scene = new THREE.Scene();
+scene.background = new THREE.Color(0xAAAAAA);
```

이는 옅은 회색으로 배경을 칠하라는 의미이죠.

모든 물체를 봐야 하므로 카메라도 수정합니다.

```js
-const fov = 75;
+const fov = 40;
const aspect = 2;  // the canvas default
const near = 0.1;
-const far = 5;
+const far = 1000;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
-camera.position.z = 2;
+camera.position.z = 120;
```

다음으로 x, y 좌표와 `Object3D`를 매개변수로 받아 씬에 추가하는 `addObject`
함수를 만듭니다.

```js
const objects = [];
const spread = 15;

function addObject(x, y, obj) {
  obj.position.x = x * spread;
  obj.position.y = y * spread;

  scene.add(obj);
  objects.push(obj);
}
```

물체를 무작위로 채색하는 함수도 하나 만듭니다. hue, 채도, 명도로
색을 지정하는 `Color`의 기능을 활용할 거에요.

`hue`는 0부터 1까지의 색상값을 고리 모양으로 배치한 것으로,
12시는 빨강, 4시는 녹색, 8시는 파랑입니다. `채도(saturation)`
또한 마찬가지로 0부터 1까지이며, 0은 색이 가장 옅은 것, 1은
색이 가장 진한 것을 의미합니다. `명도(luminance)`에서 0.0은
검정, 1.0은 하양으로, 0.5가 가장 색이 가장 풍부합니다. 쉽게
말해 명도가 0.0에서 0.5로 갈수록 검정에서 `hue`에 가까워지고,
0.5에서 1.0으로 갈수록 `hue`에서 하양에 가까워지는 것이죠.

```js
function createMaterial() {
  const material = new THREE.MeshPhongMaterial({
    side: THREE.DoubleSide,
  });

  const hue = Math.random();
  const saturation = 1;
  const luminance = .5;
  material.color.setHSL(hue, saturation, luminance);

  return material;
}
```

위 예제에서는 `material`에 `side: THREE.DoubleSide` 옵션을
지정했습니다. 이는 Three.js에게 삼각형의 양면 모두를 렌더링하라고
알려주는 것이죠. 구나 정육면체 같은 물체는 보이지 않는 안쪽 면을
굳이 렌더링할 이유가 없지만, 예제의 경우 `PlaneBufferGeometry`나
`ShapeBufferGeometry` 등 안쪽 면이 없는 물체를 만들 것이므로
`side: THREE.DoubleSide` 옵션을 설정하지 않으면 반대편에서 봤을 때
물체가 사라진 것처럼 보일 겁니다.

중요한 건 `side: THREE.DoubleSide` 옵션은 **렌더링 속도에 영향을 줍니다**.
실제로 사용할 때는 필요한 물체에만 지정하는 게 좋겠지만, 지금은
물체의 수가 많지 않으므로 일단 넘어가겠습니다.

다음으로 `addSolidGeometry` 함수를 만듭니다. 이 함수는 매개변수로
받은 `geometry`와 앞서 만든 `createMaterial` 함수를 사용해
무작위로 색칠한 물체를 만들고, `addObject` 함수로 씬에 추가합니다.

```js
function addSolidGeometry(x, y, geometry) {
  const mesh = new THREE.Mesh(geometry, createMaterial());
  addObject(x, y, mesh);
}
```

이제 이를 활용해 주요 원시 모델을 생성할 수 있습니다.
예를 들어 정육면체를 만든다고 해보죠.

```js
{
  const width = 8;
  const height = 8;
  const depth = 8;
  addSolidGeometry(-2, -2, new THREE.BoxBufferGeometry(width, height, depth));
}
```

아래 코드를 보면 각 `geometry`마다 비슷한 단락으로 이루어진 것을 확인할 수 있습니다.

{{{example url="../threejs-primitives.html" }}}

몇몇 예외가 보일 텐데, 가장 크게 두드러진 것은 아마 `TextBufferGeometry`일 겁니다.
`TextBufferGeometry`는 텍스트의 `mesh`를 생성하기 위해 3D 폰트 데이터를 필요로 합니다.
이 데이터는 비동기로 로드되므로, 객체를 생성하기 전에 3D 폰트 데이터가 로드되기를 기다려야
하죠. 폰트 로드 과정을 프로미스화 하면 이 과정를 더 쉽게 만들 수 있습니다. 먼저 `FontLoader`를
생성하고, Promise를 반환하는 `loadFont` 함수를 만들어 요청을 Promise로 감쌉니다.
그리고 `doit`이라는 비동기 함수를 만들어 `await` 키워드로 폰트를 로드한 후, `geometry`를
만들고 `addObject` 함수로 씬에 추가하죠.

```js
{
  const loader = new THREE.FontLoader();
  // promisify font loading
  function loadFont(url) {
    return new Promise((resolve, reject) => {
      loader.load(url, resolve, undefined, reject);
    });
  }

  async function doit() {
    const font = await loadFont('resources/threejs/fonts/helvetiker_regular.typeface.json');  /* threejsfundamentals: url */
    const geometry = new THREE.TextBufferGeometry('three.js', {
      font: font,
      size: 3.0,
      height: .2,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.15,
      bevelSize: .3,
      bevelSegments: 5,
    });
    const mesh = new THREE.Mesh(geometry, createMaterial());
    geometry.computeBoundingBox();
    geometry.boundingBox.getCenter(mesh.position).multiplyScalar(-1);

    const parent = new THREE.Object3D();
    parent.add(mesh);

    addObject(-1, -1, parent);
  }
  doit();
}
```

또 다른 차이점은 Three.js의 텍스트는 기본적으로 중앙을 중심으로 돌지
않는다는 것입니다. 기본 회전축은 왼쪽 모서리로, 중앙을 중심으로 돌게
하려면 Three.js에게 `geometry`의 bounding box(경계 좌표)를 계산해
달라고 요청한 뒤, bounding box의 `getCenter` 메서드에 해당 `mesh`의
위치값 객체를 넘겨주어야 합니다. 이러면 `getCenter` 메서드는 넘겨받은
위치값의 중앙 좌표값을 자신의 위치값으로 복사합니다. 그리고 변경된 위치값
객체를 반환하는데, 이 객체의 `multiplyScalar(-1)` 메서드로 전체 텍스트의
회전 중심이 텍스트의 중앙에 오도록 조정할 수 있습니다.

만약 이대로 다른 예제처럼 `addSolidGeometry` 함수를 호출한다면 위치값을
재할당해버릴 겁니다. 그러니 대신 Three.js의 씬 그래프의 기본 요소(node)인
`Object3D`를 하나 만듭니다(`Mesh` 또한 `Object3D`의 자식 요소임).
씬 그래프가 어떻게 작동하는가에 대해서는 [다른 글](threejs-scenegraph.html)에서 자세히 다룰 것이므로,
당장은 DOM 요소처럼 자식 요소가 부모 요소를 기반으로 생성된다는
것만 알아둡시다. `Object3D`를 생성해 텍스트를 감싸면 텍스트의 회전 중심은
유지한 채로 위치값을 얼마든지 조정할 수 있습니다.

만약 `addSolidGeometry`를 그냥 사용한다면 아래 왼쪽의 예제처럼
회전축이 아예 빗나가겠죠.

{{{example url="../threejs-primitives-text.html" }}}

예제의 왼쪽 텍스트는 회전축이 중앙에서 벗어났지만, 오른쪽 텍스트는
중앙을 중심으로 회전합니다.

다른 예외는 2개의 선을 기반으로 한 `EdgesGeometry`와 `WireframeGeometry`입니다.
`addSolidGeometry` 함수 대신 아래와 같은 `addLineGeometry` 함수를 호출했죠.

```js
function addLineGeometry(x, y, geometry) {
  const material = new THREE.LineBasicMaterial({color: 0x000000});
  const mesh = new THREE.LineSegments(geometry, material);
  addObject(x, y, mesh);
}
```

이 함수는 검은 `LineBasicMaterial`을 만들고 이를 기반으로 `LineSegments`를
만듭니다. `LineSegments`는 `Mesh`의 자식 객체로, Three.js의 선분(line segments, 선분 하나당 점 2개)
렌더링을 도와주는 객체입니다.

원시 모델을 생성할 때 인자는 차이가 있으니 [공식 문서](https://threejs.org/docs/)를 참고하시거나,
각 원시 모델 예시 위에 공식 문서 링크가 있으니 해당 링크를 참고하시기 바랍니다.

소개하지 않은 클래스 중에 위 패턴으로는 사용하기 어려운 클래스가 있습니다.
`PointsMaterial`과 `Points` 클래스인데요. `Points`는 `Geometry`나 `BufferGeometry`를
매개변수로 받는다는 점에서 위 예제의 `LineSegments`와 비슷하나, 선 대신 각 정점에
점(point)을 그린다는 점이 다릅니다. 또 점의 크기를 지정하는 [`size`](PointsMaterial.size)도
`PointsMaterial`에 함께 넘겨주어야 하죠.

```js
const radius = 7;
const widthSegments = 12;
const heightSegments = 8;
const geometry = new THREE.SphereBufferGeometry(radius, widthSegments, heightSegments);
const material = new THREE.PointsMaterial({
    color: 'red',
    size: 0.2,     // 글로벌 단위
});
const points = new THREE.Points(geometry, material);
scene.add(points);
```

<div class="spread">
<div data-diagram="Points"></div>
</div>

[`sizeAttenuation`](PointsMaterial.sizeAttenuation)을 `false`로 지정하면
카메라로부터의 거리에 상관없이 점의 크기가 일정하게 보입니다.

```js
const material = new THREE.PointsMaterial({
    color: 'red',
+    sizeAttenuation: false,
+    size: 3,       // 픽셀
-    size: 0.2,     // 글로벌 단위
});
...
```

<div class="spread">
<div data-diagram="PointsUniformSize"></div>
</div>

또 하나 집고 넘어가야 하는 것은 Three.js의 물체 대부분이
세분값에 대한 설정이 다양하다는 겁니다. 좋은 예로 구체가
있죠. 구체는 얼마나 물체를 세분할지에 대한 값을 매개변수로
받습니다.

<div class="spread">
<div data-diagram="SphereBufferGeometryLow"></div>
<div data-diagram="SphereBufferGeometryMedium"></div>
<div data-diagram="SphereBufferGeometryHigh"></div>
</div>

위 그림에서 첫 번째 구체는 둘레로 5개, 높이로 3개의 면으로 분할되었습니다.
이는 15개의 면 또는 30개의 삼각형이죠. 두 번째 구체는 24 x 10, 240면 또는
480개의 삼각형입니다. 마지막 구체는 50 x 50으로 무려 2500면 또는 5000개의
삼각형에 해당하죠.

얼마나 많이 세분할지는 필요에 따라 다르게 설정하면 됩니다. 위 예제만 보면
많이 분할할수록 좋아보이나, 선과 플랫 쉐이딩(flat shading)만 제거해도
아래와 같은 결과가 나옵니다.

<div class="spread">
<div data-diagram="SphereBufferGeometryLowSmooth"></div>
<div data-diagram="SphereBufferGeometryMediumSmooth"></div>
<div data-diagram="SphereBufferGeometryHighSmooth"></div>
</div>

5000 삼각형인 오른쪽 구체가 480 삼각형인 중간 구체보다 훨씬 좋다고
이야기하기 모호합니다. 만약 지구본을 만들기 위한 구체 하나를 만든다고
하면, 10000개의 삼각형으로 구체를 만드는 것이 나쁜 선택은 아닙니다.
하지만 1000개의 삼각형으로 만든 구체 1000개를 렌더링할 경우, 이는 총
천만개의 삼각형이 됩니다. 이를 부드럽게 움직이려면 브라우저가 1초에
60프레임을 렌더링해야 하니, 결과적으로 이는 1초에 6억개의 삼각형을
렌더링하라고 하는 것과 같죠. 절대 간단한 연산이 아닙니다.

물론 선택이 쉬운 경우도 있습니다. 예를 들어 평면을 분할한다고 해보죠.

<div class="spread">
<div data-diagram="PlaneBufferGeometryLow"></div>
<div data-diagram="PlaneBufferGeometryHigh"></div>
</div>

왼쪽의 평면은 2 삼각형입니다. 오른쪽 평면은 200 삼각형이죠.
구체와 다르게 평면은 대부분의 경우 퀄리티 저하가 아예 없습니다.
평면을 변형해 다른 것을 만드는 경우가 아니면, 평면을 분할해야할
이유는 없죠.

그러니 상황에 따라 적절한 값을 선택하기 바랍니다. 물체를 덜 분할할수록
성능도 올라가고 메모리 점유율도 낮아질 테니까요. 상황에 따라 어떤 것을
포기할지 결정하는 것은 순전히 여러분의 몫입니다.

원시 모델 중 어떤 것도 실제 프로젝트에 적용하기가 어렵다면,
[.obj 파일](threejs-load-obj.html) 또는 [.gltf 파일](threejs-load-gltf.html)을
로드하여 사용할 수 있습니다. 또는 [커스텀 Geometry](threejs-custom-geometry.html)나
[커스텀 BufferGeometry](threejs-custom-buffergeometry.html)를 생성할 수도 있죠.

다음 장에서는 [씬 그래프와 그 사용법](threejs-scenegraph.html)에 대해
알아보겠습니다.

<link rel="stylesheet" href="resources/threejs-primitives.css">
<script type="module" src="resources/threejs-primitives.js"></script>

