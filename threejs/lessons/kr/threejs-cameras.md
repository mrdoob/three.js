Title: Three.js 카메라
Description: Three.js의 카메라에 대해 알아봅니다
TOC: 카메라(Cameras)

※ 이 글은 Three.js의 튜토리얼 시리즈로서,
먼저 [Three.js의 기본 구조에 관한 글](threejs-fundamentals.html)을
읽고 오길 권장합니다.


이번 장에서는 카메라(cameras)에 대해 알아보겠습니다. [첫 번째 장](threejs-fundamentals.html)에서
일부 다루긴 했지만, 중요 요소인 만큼 더 자세히 살펴볼 필요가 있습니다.

Three.js에서 가장 자주 사용하는 카메라는 여태까지 썼던 `PerspectiveCamera`(원근 카메라)입니다.
이 카메라는 멀리 있는 물체를 가까이 있는 것보다 상대적으로 작게 보이도록 해주죠.

`PerspectiveCamera`는 *절두체(frustum)*를 만듭니다. [절두체(frustum)는 입체(보통 원뿔이나 각뿔)를
절단하는 하나나 두 평행면 사이의 부분](https://ko.wikipedia.org/wiki/%EC%A0%88%EB%91%90%EC%B2%B4)을
의미하죠. 여기서 입체란 정육면체, 원뿔, 구, 원통, 절두체 등의 3D 요소입니다.

<div class="spread">
  <div><div data-diagram="shapeCube"></div><div>정육면체(cube)</div></div>
  <div><div data-diagram="shapeCone"></div><div>원뿔(cone)</div></div>
  <div><div data-diagram="shapeSphere"></div><div>구(sphere)</div></div>
  <div><div data-diagram="shapeCylinder"></div><div>원통(cylinder)</div></div>
  <div><div data-diagram="shapeFrustum"></div><div>절두체(frustum)</div></div>
</div>

이걸 굳이 언급하는 이유는 글을 쓰는 저도 몇 년 동안 이를 몰랐기 때문입니다. 책이든 인터넷 글이든,
*절두체*라는 단어를 봤다면 눈이 뒤집어졌을 겁니다. 입체의 이름을 알면 이해하기도, 기억하기도 훨씬
쉽죠 &#128517;.

`PerspectiveCamera`는 4가지 속성을 바탕으로 절두체를 만듭니다. `near`는 절두체가 어디서 시작할지
결정하는 속성이고, `far`는 절두체의 끝입니다. `fov`는 시아갹(field of view)으로, `near`와 카메라의
거리에 따라 절두체의 높이를 계산해 적용합니다. `aspect`는 절두체의 너비에 관여하는 비율으로, 절두체의
너비는 절두체의 높이에 이 비율을 곱한 값입니다.

<img src="resources/frustum-3d.svg" width="500" class="threejs_center"/>

[이전 장](threejs-lights.html)에서 썼던 바닥면, 구체, 정육면체로 이루어진 예제를 다시 사용해
카메라의 속성을 조정할 수 있도록 만들겠습니다.

`near` 속성은 항상 `far` 속성보다 커야 하니, 이를 제어할 `MinMaxGUIHelper` 헬퍼 클래스를
만들겠습니다. 이 클래스는 dat.GUI가 제어할 `min`과 `max` 속성이 있고, dat.GUI가 이를 조정할
때 지정한 두 가지 속성을 동시에 변경합니다.

```js
class MinMaxGUIHelper {
  constructor(obj, minProp, maxProp, minDif) {
    this.obj = obj;
    this.minProp = minProp;
    this.maxProp = maxProp;
    this.minDif = minDif;
  }
  get min() {
    return this.obj[this.minProp];
  }
  set min(v) {
    this.obj[this.minProp] = v;
    this.obj[this.maxProp] = Math.max(this.obj[this.maxProp], v + this.minDif);
  }
  get max() {
    return this.obj[this.maxProp];
  }
  set max(v) {
    this.obj[this.maxProp] = v;
    this.min = this.min;  // min setter로 작동
  }
}
```

이제 GUI를 만들어보죠.

```js
function updateCamera() {
  camera.updateProjectionMatrix();
}

const gui = new GUI();
gui.add(camera, 'fov', 1, 180).onChange(updateCamera);
const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
gui.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far').onChange(updateCamera);
```

카메라의 속성을 변경할 때마다 카메라의 [`updateProjectionMatrix`](PerspectiveCamera.updateProjectionMatrix)
메서드를 호출해야 하므로, `updateCamera`라는 함수를 만들어 값이 변경될 때마다 함수를 호출하도록
합니다.

{{{example url="../threejs-cameras-perspective.html" }}}

값을 조정하며 카메라가 어떤 식으로 작동하는지 확인해보세요. `aspect`는 창의 비율을 그대로 사용하도록
설정되어 있으므로, 이를 바꾸고 싶다면 예제를 새 창에서 열어 코드를 직접 수정해야 합니다.

아직도 카메라가 어떤 식으로 작동하는지 보기 어려운가요? 까짓것 그럼 카메라를 하나 더 만들어보죠.
하나는 위의 예제와 같은 방식의 카메라이고, 다른 하나는 이 카메라의 시야와 절두체를 렌더링해
카메라가 어떻게 움직이는지 관찰할 수 있도록 만들겠습니다.

Three.js의 가위 함수(scissor function)을 이용하면 쉽습니다. 가위 함수를 사용해 양쪽에
장면 두 개, 카메라 두 개를 렌더링하겠습니다.

먼저 HTML과 CSS로 양쪽에 div 요소를 배치합니다. 이러면 각각의 카메라에 `OrbitControls`를
두어 이벤트 처리하기도 훨씬 간단합니다.

```html
<body>
  <canvas id="c"></canvas>
+  <div class="split">
+     <div id="view1" tabindex="1"></div>
+     <div id="view2" tabindex="2"></div>
+  </div>
</body>
```

CSS로 두 div 요소가 canvas 위 양쪽에 자리하게 합니다.

```css
.split {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
}
.split > div {
  width: 100%;
  height: 100%;
}
```

카메라의 절두체를 시각화할 `CameraHelper`를 추가합니다.

```js
const cameraHelper = new THREE.CameraHelper(camera);

...

scene.add(cameraHelper);
```

다음으로 두 div 요소를 참조합니다.

```js
const view1Elem = document.querySelector('#view1');
const view2Elem = document.querySelector('#view2');
```

그리고 기존 `OrbitControls`가 왼쪽 div 요소의 이벤트에만 반응하도록 설정합니다.

```js
-const controls = new OrbitControls(camera, canvas);
+const controls = new OrbitControls(camera, view1Elem);
```

다음으로 `PerspectiveCamera`와 두 번째 `OrbitControls`를 추가합니다. 이 `OrbitControls`를
두 번째 카메라에 종속시키고, 오른쪽 div 요소의 이벤트에만 반응하도록 합니다.

```js
const camera2 = new THREE.PerspectiveCamera(
  60,  // 시야각(fov)
  2,   // 비율(aspect)
  0.1, // near
  500, // far
);
camera2.position.set(40, 10, 30);
camera2.lookAt(0, 5, 0);

const controls2 = new OrbitControls(camera2, view2Elem);
controls2.target.set(0, 5, 0);
controls2.update();
```

끝으로 가위 함수를 사용해 화면을 분할하겠습니다. 카메라 각각의 시점에 따라
장면을 canvas의 양쪽에 나눠 렌더링하게끔 할 것입니다.

아래의 함수는 canvas 위에 덮어 씌운 요소의 사각 좌표(rectangle)를 구합니다.
그리고 해당 사각 좌표로 `renderer`의 화면(viewport)과 가위(scissor)의 값을
정의한 뒤, 사각 좌표의 가로세로 비율을 반환합니다.

```js
function setScissorForElement(elem) {
  const canvasRect = canvas.getBoundingClientRect();
  const elemRect = elem.getBoundingClientRect();

  // canvas에 대응하는 사각형을 구하기
  const right = Math.min(elemRect.right, canvasRect.right) - canvasRect.left;
  const left = Math.max(0, elemRect.left - canvasRect.left);
  const bottom = Math.min(elemRect.bottom, canvasRect.bottom) - canvasRect.top;
  const top = Math.max(0, elemRect.top - canvasRect.top);

  const width = Math.min(canvasRect.width, right - left);
  const height = Math.min(canvasRect.height, bottom - top);

  // canvas의 일부분만 렌더링하도록 scissor 적용
  const positiveYUpBottom = canvasRect.height - bottom;
  renderer.setScissor(left, positiveYUpBottom, width, height);
  renderer.setViewport(left, positiveYUpBottom, width, height);

  // 비율 반환
  return width / height;
}
```

이제 이 함수를 사용해 `render` 함수에서 장면을 두 번 렌더링할 수 있습니다.

```js
  function render() {

-    if (resizeRendererToDisplaySize(renderer)) {
-      const canvas = renderer.domElement;
-      camera.aspect = canvas.clientWidth / canvas.clientHeight;
-      camera.updateProjectionMatrix();
-    }

+    resizeRendererToDisplaySize(renderer);
+
+    // 가위 활성화
+    renderer.setScissorTest(true);
+
+    // 기존 화면 렌더링
+    {
+      const aspect = setScissorForElement(view1Elem);
+
+      // 비율에 따라 카메라 조정
+      camera.aspect = aspect;
+      camera.updateProjectionMatrix();
+      cameraHelper.update();
+
+      // 기존 화면에서 가이드라인(CameraHelper)이 노출되지 않도록 설정
+      cameraHelper.visible = false;
+
+      scene.background.set(0x000000);
+
+      // 렌더링
+      renderer.render(scene, camera);
+    }
+
+    // 두 번째 카메라 렌더링
+    {
+      const aspect = setScissorForElement(view2Elem);
+
+      // 비율에 따라 카메라 조정
+      camera2.aspect = aspect;
+      camera2.updateProjectionMatrix();
+
+      // 가이드라인 활성화
+      cameraHelper.visible = true;
+
+      scene.background.set(0x000040);
+
+      renderer.render(scene, camera2);
+    }

-    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}
```

위 예제에서는 분할된 두 화면을 구별하기 쉽두록 두 번째 화면의 배경을 진한
파란색으로 칠했습니다.

또한 `render` 함수 안에서 모든 것을 처리하기에, `updateCamera` 함수도
제거하였습니다.

```js
-function updateCamera() {
-  camera.updateProjectionMatrix();
-}

const gui = new GUI();
-gui.add(camera, 'fov', 1, 180).onChange(updateCamera);
+gui.add(camera, 'fov', 1, 180);
const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
-gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
-gui.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far').onChange(updateCamera);
+gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near');
+gui.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far');
```

이제 두 번째 화면에서 첫 번째 카메라의 절두체를 확인할 수 있습니다.

{{{example url="../threejs-cameras-perspective-2-scenes.html" }}}

왼쪽은 기존의 화면과 같고 오른쪽에 왼쪽 카메라의 절두체가 보입니다.
패널에서 `near`, `far`, `fov` 값을 조정하거나 마우스로 화면을 움직여보면,
오른쪽 화면의 절두체 안에 있는 물체만 왼쪽 화면에 노출됨을 확인할 수
있을 겁니다.

누군가 이렇게 물을지도 모르겠네요. 그냥 `near`를 0.0000000001로 설정하고 `far`를
10000000000000로 설정해버리면요? 이러면 모든 게 항상 다 보이지 않나요? 이유를
설명하자면, GPU는 어떤 물체가 앞에 있거나 다른 물체의 뒤에 있을 때만 정밀도가
높기 때문입니다. 정밀도는 일정량이 `near`와 `far` 사이에 퍼져 있는데, 기본적으로
카메라에 가까울 수록 정밀도가 높고 멀수록 정밀도가 낮아집니다.

현상을 직접 확인해보죠. 위의 예제를 수정해 20개의 구체를 한 줄로 세우겠습니다.

```js
{
  const sphereRadius = 3;
  const sphereWidthDivisions = 32;
  const sphereHeightDivisions = 16;
  const sphereGeo = new THREE.SphereBufferGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
  const numSpheres = 20;
  for (let i = 0; i < numSpheres; ++i) {
    const sphereMat = new THREE.MeshPhongMaterial();
    sphereMat.color.setHSL(i * .73, 1, 0.5);
    const mesh = new THREE.Mesh(sphereGeo, sphereMat);
    mesh.position.set(-sphereRadius - 1, sphereRadius + 2, i * sphereRadius * -2.2);
    scene.add(mesh);
  }
}
```

`near` 속성을 0.00001로 설정합니다.

```js
const fov = 45;
const aspect = 2;  // canvas 기본값
-const near = 0.1;
+const near = 0.00001;
const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
```

그리고 기존의 GUI 코드를 수정해 0.00001의 작은 단위도 설정할 수 있도록 합니다.

```js
-gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
+gui.add(minMaxGUIHelper, 'min', 0.00001, 50, 0.00001).name('near').onChange(updateCamera);
```

어떤 결과가 나올 것 같나요?

{{{example url="../threejs-cameras-z-fighting.html" }}}

이는 *z-파이팅(z-fighting, Stitching)*의 한 예입니다. 컴퓨터의 GPU가 어떤 픽셀이
앞이고 어떤 픽셀을 뒤로 보내야할지 결정할 정밀도가 모자를 때 발생하는 현상이죠.

위 예제가 어떻게 해도 정상적으로 보인다면, 아래 이미지를 보기 바랍니다.

<div class="threejs_center"><img src="resources/images/z-fighting.png" style="width: 570px;"></div>

한 가지 해결책은 Three.js에게 픽셀의 앞 뒤를 결정할 때 다른 방법을 쓰도록 설정하는
것입니다. `WebGLRenderer`를 생성할 때 `logarithmicDepthBuffer` 속성을 활성화해주면
되죠.

```js
-const renderer = new THREE.WebGLRenderer({canvas});
+const renderer = new THREE.WebGLRenderer({
+  canvas,
+  logarithmicDepthBuffer: true,
+});
```

대게의 경우 정상적으로 보일 겁니다.

{{{example url="../threejs-cameras-logarithmic-depth-buffer.html" }}}

문제가 그대로라면 *이 해결책을 쓸 수 없는 건가?*라는 의문에 빠질 수 있습니다.
이 해결책이 먹히지 않은 이유는 일부 GPU만 이 기능을 지원하기 때문이죠. 2018년
9월 기준으로 거의 모든 데스크탑 GPU가 이 기능을 지원하나, 모바일 기기는 대부분
이 기능을 지원하지 않습니다.

이 기능을 쓰지 말아야 하는 또 다른 이유는, 이 기능이 일반적인 해결책보다 훨씬
성능이 나쁘기 때문입니다.

게다가 이 기능을 활성화해도, `near`를 더 작게, `far`를 더 멀게 설정하다보면
결국 같은 현상을 만나게 될 겁니다.

이는 항상 `near`와 `far`를 설정하는데 많은 공을 들여야 한다는 의미입니다.
`near`는 대상이 보이는 한 가장 멀게, `far`도 대상이 보이는 한 카메라와 가장
가깝게 설정하는 것이 좋죠. 만약 거대한 공간을 렌더링하는 경우, 예를 들어 사람의
속눈썹과 50km 떨어진 산을 동시에 보이게 하려면 다른 해결책-나중에 다룰지도 모르는-을
찾아야 합니다. 당장은 `near`와 `far`를 적절하게 설정하는 게 중요하다는 것만
알아둡시다.

두 번째로 자주 사용하는 카메라는 `OrthographicCamera`(정사영 카메라)입니다.
절두체 대신 `left`, `right`, `top`, `bottom`, `near`, `far`로 육면체를
정의해 사용하죠. 육면체로 화면을 투사하기에 원근 효과가 없습니다.

2분할 화면 예제를 수정해 첫 번째 화면을 `OrthographicCamera`로 바꾸겠습니다.

먼저 `OrthographicCamera`를 만들어보죠.

```js
const left = -1;
const right = 1;
const top = 1;
const bottom = -1;
const near = 5;
const far = 50;
const camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
camera.zoom = 0.2;
```

먼저 `left`와 `bottom`을 -1로, `right`와 `top`을 1로 설정했습니다. 이러면 육면체는
기본적으로 너비 2칸, 높이 2칸이 되겠죠. 그리고 육면체의 비율을 조정해 `left`와 `top`의
값을 조정할 수 있도록, `zoom` 속성을 이용해 카메라에 보이는 범위를 조정할 수 있도록
했습니다.

다음으로 `zoom` 속성을 조정할 GUI를 추가합니다.

```js
const gui = new GUI();
+gui.add(camera, 'zoom', 0.01, 1, 0.01).listen();
```

`listen` 메서드를 호출하면 dat.GUI가 변화를 감지합니다. 이렇게 한 이유는 `OrbitControls`이
마우스 휠 스크롤을 감지해 `zoom` 속성을 변경하기 때문이죠.

끝으로 왼쪽 화면을 렌더링할 때 `OrthographicCamera`를 업데이트하도록 설정합니다.

```js
{
  const aspect = setScissorForElement(view1Elem);

  // 요소의 비율에 맞춰 카메라 업데이트
-  camera.aspect = aspect;
+  camera.left   = -aspect;
+  camera.right  =  aspect;
  camera.updateProjectionMatrix();
  cameraHelper.update();

  // 기존 화면에서 가이드라인(CameraHelper)이 노출되지 않도록 설정
  cameraHelper.visible = false;

  scene.background.set(0x000000);
  renderer.render(scene, camera);
}
```

이제 `OrthographicCamera`가 어떻게 작동하는지 확인할 차례입니다.

{{{example url="../threejs-cameras-orthographic-2-scenes.html" }}}

Three.js에서 `OrthographicCamera`는 주로 2D 요소를 표현하기 위해 사용합니다.
카메라에 얼마나 많은 요소를 보여줄지만 결정하면 되죠. 만약 canvas의 1픽셀을
카메라의 한 칸과 같은 크기로 지정하고 싶다면...

중점을 장면의 중심에 두고 1 픽셀을 Three.js의 한 칸으로 만들 수 있습니다.

```js
camera.left = -canvas.width / 2;
camera.right = canvas.width / 2;
camera.top = canvas.height / 2;
camera.bottom = -canvas.height / 2;
camera.near = -1;
camera.far = 1;
camera.zoom = 1;
```

2D canvas처럼 중점을 상단 왼쪽에 두려면 다음과 같이 설정할 수 있죠.

```js
camera.left = 0;
camera.right = canvas.width;
camera.top = 0;
camera.bottom = canvas.height;
camera.near = -1;
camera.far = 1;
camera.zoom = 1;
```

중점이 상단 왼쪽에 있을 경우의 좌표는 2D canvas처럼 0, 0입니다.

한 번 만들어보죠! 먼저 카메라를 설정합니다.

```js
const left = 0;
const right = 300;  // canvas 기본 크기
const top = 0;
const bottom = 150;  // canvas 기본 크기
const near = -1;
const far = 1;
const camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
camera.zoom = 1;
```

다음으로 평면(plane) 6개를 만들어 각각 다른 텍스처를 적용하겠습니다.
각 평면마다 `THREE.Object3D` 인스턴스를 만들어 평면의 부모로 설정합니다.
이러면 중점을 0, 0, 상단 좌측으로 지정해 좌표를 지정하기가 쉽습니다.

```js
const loader = new THREE.TextureLoader();
const textures = [
  loader.load('resources/images/flower-1.jpg'),
  loader.load('resources/images/flower-2.jpg'),
  loader.load('resources/images/flower-3.jpg'),
  loader.load('resources/images/flower-4.jpg'),
  loader.load('resources/images/flower-5.jpg'),
  loader.load('resources/images/flower-6.jpg'),
];
const planeSize = 256;
const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
const planes = textures.map((texture) => {
  const planePivot = new THREE.Object3D();
  scene.add(planePivot);
  texture.magFilter = THREE.NearestFilter;
  const planeMat = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(planeGeo, planeMat);
  planePivot.add(mesh);
  // 평면을 움직여 상단 좌측이 중점이 되도록 설정
  mesh.position.set(planeSize / 2, planeSize / 2, 0);
  return planePivot;
});
```

그리고 `render` 함수 안에 canvas의 사이즈가 변경되었을 때 카메라를 업데이트하는
코드를 추가합니다.

```js
function render() {

  if (resizeRendererToDisplaySize(renderer)) {
    camera.right = canvas.width;
    camera.bottom = canvas.height;
    camera.updateProjectionMatrix();
  }

  ...
```

`planes`는 `THREE.Mesh`, 평면의 배열입니다. 시간값을 기반으로 이 평면이 따로
움직이도록 하겠습니다.

```js
function render(time) {
  time *= 0.001;  // 초 단위로 변경

  ...

  const xRange = Math.max(20, canvas.width - planeSize) * 2;
  const yRange = Math.max(20, canvas.height - planeSize) * 2;

  planes.forEach((plane, ndx) => {
    const speed = 180;
    const t = time * speed + ndx * 300;
    const xt = t % xRange;
    const yt = t % yRange;

    const x = xt < xRange / 2 ? xt : xRange - xt;
    const y = yt < yRange / 2 ? yt : yRange - yt;

    plane.position.set(x, y, 0);
  });

  renderer.render(scene, camera);
```

이미지가 완벽하게 가장자리에서 튕기는 것을 확인할 수 있을 겁니다. 2D canvas에서
픽셀값을 이용해 구현할 때와 같은 방식이죠.

{{{example url="../threejs-cameras-orthographic-canvas-top-left-origin.html" }}}

`OrthographicCamera`는 게임 엔진 에디터 등에서처럼 3D 모델링 결과물의 상, 하, 좌, 우,
앞, 뒤를 렌더링할 때도 사용합니다.

<div class="threejs_center"><img src="resources/images/quad-viewport.png" style="width: 574px;"></div>

위 스크린샷의 1개의 화면만 원근(perspective) 카메라이고 나머지 3개는 정사영(orthographic)
카메라입니다.

여기까지 카메라의 기초에 대해 살펴보았습니다. 카메라를 움직이는 방법에 대해서는 다른
글에서 좀 더 상세히 설명할 거예요. 다음은 장에서는 [그림자(shadows)](threejs-shadows.html)에
대해 먼저 살펴보겠습니다.

<canvas id="c"></canvas>
<script type="module" src="../resources/threejs-cameras.js"></script>