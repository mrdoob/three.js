Title: Three.js 그림자
Description: Three.js의 그림자에 대해 알아봅니다
TOC: 그림자(Shadows)

※ 이 글은 Three.js의 튜토리얼 시리즈로서,
먼저 [Three.js의 기본 구조에 관한 글](threejs-fundamentals.html)을
읽고 오길 권장합니다.

※ 이전 글인 [카메라에 관한 글](threejs-cameras.html)과
[조명에 관한 글](threejs-lights.html)에서 이 장을 읽는 꼭 필요한 내용을
다루었으니 꼭 먼저 읽고 오시기 바랍니다.


3D 그래픽에서 그림자란 그리 간단한 주제가 아닙니다. 그림자를 구현하는 방법은
아주 많지만 모두 단점이 있기에 어떤 것이 가장 효율적이라고 말하기 어렵습니다.
이는 Three.js에서 제공하는 방법도 마찬가지이죠.

Three.js는 기본적으로 *그림자 맵(shadow maps)*을 사용합니다. 그림자 맵이란
*그림자를 만드는 빛의 영향을 받는, 그림자를 드리우는 모든 물체를 빛의 시점에서
렌더링*하는 기법을 말합니다. 중요하니 **한 번 더 읽어보세요!**

다시 말해, 공간 안에 20개의 물체와 5개의 조명이 있고, 20개의 물체 모두
그림자를 드리우며 5개의 조명 모두 그림자를 지게 한다면, 한 장면을 만들기
위해 총 6번 화면을 렌더링할 것이라는 이야기입니다. 먼저 조명 1번에 대해
20개의 물체를 전부 렌더링하고, 다음에는 2번 조명, 그 다음에는 3번...
이렇게 처음 5번 렌더링한 결과물을 합쳐 최종 결과물을 만드는 것이죠.

만약 여기에 포인트(point) 조명을 하나 추가하면 조명 하나 때문에 6번을 다시
렌더링해야 합니다.

이 때문에 그림자를 지게 하는 조명을 여러개 만들기보다 다른 방법을 찾는
경우가 보통입니다. 주로 사용하는 방법은 조명이 여러개 있어도 하나의 조명만
그림자를 지게끔 설정하는 것이죠.

물론 라이트맵(lightmaps)이나 앰비언트 오클루전(ambient occlusion)을 이용해
빛의 영향을 미리 계산할 수도 있습니다. 이러면 정적 조명이나 정적 빛 반사를
사용하는 것이기에 수정하기가 어렵지만, 적어도 성능은 빠릅니다. 이 두 가지
모두 나중에 별도로 다룰 것입니다.

가짜 그림자를 사용하는 방법도 있습니다. 평면을 만들고, 흑백 텍스처를 입혀
땅 위에 그림자가 있을 만한 위치에 가져다 놓는 것이죠.

예를 들어 아래 텍스처를 사용해 가짜 그림자를 만들어보겠습니다.

<div class="threejs_center"><img src="../resources/images/roundshadow.png"></div>

[이전 글](threejs-cameras.html)에서 작성했던 코드를 일부 활용하겠습니다.

먼저 배경을 흰색으로 칠합니다.

```js
const scene = new THREE.Scene();
+scene.background = new THREE.Color('white');
```

같은 체크판 무늬 땅을 사용하되, 땅이 조명의 영향을 받을 필요는 없으니
`MeshBasicMaterial`을 사용하겠습니다.

```js
+const loader = new THREE.TextureLoader();

{
  const planeSize = 40;

-  const loader = new THREE.TextureLoader();
  const texture = loader.load('resources/images/checker.png');
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.NearestFilter;
  const repeats = planeSize / 2;
  texture.repeat.set(repeats, repeats);

  const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
  const planeMat = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
+  planeMat.color.setRGB(1.5, 1.5, 1.5);
  const mesh = new THREE.Mesh(planeGeo, planeMat);
  mesh.rotation.x = Math.PI * -.5;
  scene.add(mesh);
}
```

평면의 색상을 `1.5, 1.5, 1.5`로 설정했습니다. 체크판 텍스처의 색상을 1.5, 1.5, 1.5 만큼
곱해준 것이죠. 체크판 원본 텍스처의 색상이 0x808080(회색), 0xC0C0C0(옅은 회색)이므로,
여기에 1.5를 곱해주면 흰색, 옅은 회색 체크판이 됩니다.

이제 그림자 텍스처를 로드해보죠.

```js
const shadowTexture = loader.load('resources/images/roundshadow.png');
```

구체와 관련된 객체를 분류하기 위해 배열을 만들겠습니다.

```js
const sphereShadowBases = [];
```

다음으로 구체 geometry를 만듭니다.

```js
const sphereRadius = 1;
const sphereWidthDivisions = 32;
const sphereHeightDivisions = 16;
const sphereGeo = new THREE.SphereBufferGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
```

가짜 그림자를 위한 평면 `geometry`도 만듭니다.

```js
const planeSize = 1;
const shadowGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
```

이제 구체를 아주 많이 만들겠습니다. 각각 구체마다 `컨테이너` 역할을 할
`THREE.Object3D`를 만들고, 그림자 평면 mesh, 구체 mesh를 이
컨테이너의 자식으로 만듭니다. 이러면 구체와 그림자를 동시에 움직일 수
있죠. z-파이팅 현상을 막기 위해 그림자는 땅보다 약간 위에 둡니다.
또 `depthWrite` 속성을 false로 설정해 그림자끼리 충돌하는 현상을
막습니다. 이 충돌 현상은 [다른 글](threejs-transparency.html)에서
더 자세히 이야기할 거예요. 그림자는 빛을 반사하지 않으니 `MeshBasicMaterial`을
사용합니다.

구체의 색상을 각각 다르게 지정하고, 컨테이너, 구체 mesh, 그림자 mesh와
구체의 처음 y축 좌표를 배열에 기록합니다.

```js
const numSpheres = 15;
for (let i = 0; i < numSpheres; ++i) {
  // 구체와 그림자가 같이 움직이도록 컨테이너(base)를 만듭니다
  const base = new THREE.Object3D();
  scene.add(base);

  /**
   * 그림자를 컨테이너에 추가합니다
   * 주의: 여기서는 각 구체의 투명도를 따로 설정할 수 있도록
   * 재질을 각각 따로 만듬
   */
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,    // 땅이 보이도록
    depthWrite: false,    // 그림자를 따로 정렬하지 않도록
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.position.y = 0.001;  // 그림자를 땅에서 살짝 위에 배치
  shadowMesh.rotation.x = Math.PI * -.5;
  const shadowSize = sphereRadius * 4;
  shadowMesh.scale.set(shadowSize, shadowSize, shadowSize);
  base.add(shadowMesh);

  // 구체를 컨테이너에 추가
  const u = i / numSpheres;   // 반복문이 진행됨에 따라 0에서 1사이 값을 지정
  const sphereMat = new THREE.MeshPhongMaterial();
  sphereMat.color.setHSL(u, 1, .75);
  const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
  sphereMesh.position.set(0, sphereRadius + 2, 0);
  base.add(sphereMesh);

  // y축 좌표를 포함해 나머지 요소를 기록
  sphereShadowBases.push({ base, sphereMesh, shadowMesh, y: sphereMesh.position.y });
}
```

조명은 2개를 만들겠습니다. 하나는 `HemisphereLight`, 강도를 2로 설정해 화면을 아주
밝게 설정할 겁니다.

```js
{
  const skyColor = 0xB1E1FF;  // 하늘색
  const groundColor = 0xB97A20;  // 오렌지 브라운
  const intensity = 2;
  const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
  scene.add(light);
}
```

다른 하나는 구체의 윤곽을 좀 더 분명하게 해 줄 `DirectionalLight`입니다.

```js
{
  const color = 0xFFFFFF;
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(0, 10, 5);
  light.target.position.set(-5, 0, 0);
  scene.add(light);
  scene.add(light.target);
}
```

이대로도 렌더링해도 좋지만, 구체들에 애니메이션을 한 번 줘봅시다.
컨테이너를 움직여 구체, 그림자가 xz축 평면을 따라 움직이게 하고,
`Math.abs(Math.sin(time))`를 사용해 구체에 공처럼 통통 튀는
애니메이션을 넣어줍니다. 또 그림자 재질의 투명도를 조절해 구체가
높을수록 그림자가 옅어지도록 합니다.

```js
function render(time) {
  time *= 0.001;  // 초 단위로 변환

  ...

  sphereShadowBases.forEach((sphereShadowBase, ndx) => {
    const { base, sphereMesh, shadowMesh, y } = sphereShadowBase;

    // u는 구체의 반복문을 실행하면서 인덱스에 따라 0 이상, 1 이하로 지정됩니다
    const u = ndx / sphereShadowBases.length;

    /**
     * 컨테이너의 위치를 계산합니다. 구체와 그림자가
     * 컨테이너에 종속적이므로 위치가 같이 변합니다
     */
    const speed = time * .2;
    const angle = speed + u * Math.PI * 2 * (ndx % 1 ? 1 : -1);
    const radius = Math.sin(speed - ndx) * 10;
    base.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);

    // yOff 값은 0 이상 1 이하입니다
    const yOff = Math.abs(Math.sin(time * 2 + ndx));
    // 구체를 위아래로 튕김
    sphereMesh.position.y = y + THREE.MathUtils.lerp(-2, 2, yOff);
    // 구체가 위로 올라갈수록 그림자가 옅어짐
    shadowMesh.material.opacity = THREE.MathUtils.lerp(1, .25, yOff);
  });

  ...
```

15가지 색상의 탱탱볼을 완성했습니다.

{{{example url="../threejs-shadows-fake.html" }}}

물론 다른 모양의 그림자를 사용해야 하는 경우도 있습니다. 그림자의 경계를 분명하게
하고 싶을 수도 있죠. 하지만 모든 물체의 그림자를 둥글게 표현하는 것이 좋은 경우도
분명 있습니다. 모든 그림자를 둥글게 표현한 예 중 하나는 [동물의 숲 포켓 캠프](https://www.google.com/search?tbm=isch&q=animal+crossing+pocket+camp+screenshots)입니다.
자연스럽고 성능면에서도 이득이죠. [Monument Valley](https://www.google.com/search?q=monument+valley+screenshots&tbm=isch)도
메인 캐릭터에 이런 그림자를 사용한 것으로 보입니다.

이제 그림자 맵을 살펴보겠습니다. 그림자를 드리울 수 있는 조명은 3가지, `DirectionalLight`,
`PointLight`, `SpotLight`입니다.

[조명에 관한 글](threejs-lights.html)에서 썼던 예제로 먼저 `DirectionalLight`부터
살펴보죠.

먼저 renderer의 그림자 맵 옵션을 켜야 합니다.

```js
const renderer = new THREE.WebGLRenderer({canvas});
+renderer.shadowMap.enabled = true;
```

조명도 그림자를 드리우도록 옵션을 활성화합니다.

```js
const light = new THREE.DirectionalLight(color, intensity);
+light.castShadow = true;
```

또한 장면(scene) 안 각 mesh에 그림자를 드리울지, 그림자의 영향을 받을지 설정해줘야 합니다.

바닥 아래는 굳이 신경 쓸 필요가 없으니 평면(바닥)은 그림자의 영향만 받게 하겠습니다.

```js
const mesh = new THREE.Mesh(planeGeo, planeMat);
mesh.receiveShadow = true;
```

정육면체와 구체는 그림자도 드리우고, 영향도 받도록 설정합니다.

```js
const mesh = new THREE.Mesh(cubeGeo, cubeMat);
mesh.castShadow = true;
mesh.receiveShadow = true;

...

const mesh = new THREE.Mesh(sphereGeo, sphereMat);
mesh.castShadow = true;
mesh.receiveShadow = true;
```

이제 실행해보죠.

{{{example url="../threejs-shadows-directional-light.html" }}}

이런, 그림자 일부가 잘려나간 것이 보이나요?

이는 빛의 시점에서 장면을 렌더링해 그림자 맵을 만들기 때문입니다. 위 예제를 예로 들면
`DirectionalLight`의 위치에 카메라가 있고, 해당 조명의 목표를 바라보는 것이죠. 조명의
그림자에는 별도의 카메라가 있고, 이전에 [카메라에 관한 글](threejs-cameras.html)에서
설명한 것처럼 일정 공간 안의 그림자만 렌더링합니다. 위 예제에서는 그 공간이 너무 좁은
것이죠.

그림자용 카메라를 시각화하기 위해 조명의 그림자 속성에서 카메라를 가져와 `CameraHelper`를
생성한 뒤, 장면에 추가하겠습니다.

```js
const cameraHelper = new THREE.CameraHelper(light.shadow.camera);
scene.add(cameraHelper);
```

이제 그림자가 렌더링되는 공간을 확인할 수 있을 겁니다.

{{{example url="../threejs-shadows-directional-light-with-camera-helper.html" }}}

target의 x 값을 조정해보면 그림자용 카메라 범위 안에 있는 곳에만 그림자가 보이는
것을 확인할 수 있을 겁니다.

이 공간의 크기는 이 카메라의 속성을 수정해 바꿀 수 있습니다.

그림자용 카메라의 속성을 수정하는 GUI를 추가해보죠. `DirectionalLight`는 빛이 평행으로
나아가므로, `DirectionalLight`는  그림자용 카메라로 `OrthographicCamera`(정사영 카메라)를
사용합니다. `OrthographicCamera`가 뭔지 잘 기억나지 않는다면, [카메라에 관한 이전 글](threejs-cameras.html)을
참고하세요.

`OrthographicCamera`의 시야는 육면체나 *절두체(frustum)*로 정의한다고 했었죠. `left`,
`right`, `top`, `bottom`, `near`, `far`, `zoom` 속성을 지정해서요.

dat.GUI가 쓸 간단한 헬퍼 클래스를 하나 더 만들겠습니다. 이 `DimensionGUIHelper`는
객체와 속성 이름 2개를 인자로 받아, GUI가 하나의 값을 조정할 때 하나의 값은 양수로,
다른 값은 음수로 지정합니다. 이렇게 하면 `left`와 `right`값을 `width`로, `up`과
`down`값을 `height`로 바꾸어 조작할 수 있죠.

```js
class DimensionGUIHelper {
  constructor(obj, minProp, maxProp) {
    this.obj = obj;
    this.minProp = minProp;
    this.maxProp = maxProp;
  }
  get value() {
    return this.obj[this.maxProp] * 2;
  }
  set value(v) {
    this.obj[this.maxProp] = v /  2;
    this.obj[this.minProp] = v / -2;
  }
}
```

또한 [이전 글](threejs-cameras.html)에서 썼던 `MinMaxGUIHelper`를 가져와 `near`와
`far` 속성을 조작하는 데 사용하겠습니다.

```js
const gui = new GUI();
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'intensity', 0, 2, 0.01);
+{
+  const folder = gui.addFolder('Shadow Camera');
+  folder.open();
+  folder.add(new DimensionGUIHelper(light.shadow.camera, 'left', 'right'), 'value', 1, 100)
+    .name('width')
+    .onChange(updateCamera);
+  folder.add(new DimensionGUIHelper(light.shadow.camera, 'bottom', 'top'), 'value', 1, 100)
+    .name('height')
+    .onChange(updateCamera);
+  const minMaxGUIHelper = new MinMaxGUIHelper(light.shadow.camera, 'near', 'far', 0.1);
+  folder.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
+  folder.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far').onChange(updateCamera);
+  folder.add(light.shadow.camera, 'zoom', 0.01, 1.5, 0.01).onChange(updateCamera);
+}
```

그리고 값이 바뀔 때마다 `updateCamera` 함수를 호출하도록 합니다. 이 함수 안에서는
조명, 조명 헬퍼, 조명의 그림자용 카메라, 그림자용 카메라의 헬퍼를 업데이트할 거예요.

```js
function updateCamera() {
  // 헬퍼가 가이드라인을 그릴 때 필요한 조명 목표(target)의 matrixWorld를 업데이트 합니다
  light.target.updateMatrixWorld();
  helper.update();
  // 그림자용 카메라의 투영 행렬(projection matrix)를 업데이트합니다
  light.shadow.camera.updateProjectionMatrix();
  // 그림자용 카메라를 보기 위해 설치한 카메라의 헬퍼를 업데이트합니다
  cameraHelper.update();
}
updateCamera();
```

이제 그림자용 카메라에 GUI가 생겼으니, 값들을 조정하며 놀아봅시다.

{{{example url="../threejs-shadows-directional-light-with-camera-gui.html" }}}

`width`와 `height` 속성을 30 정도로 조정하면 그림자가 있어야 할만한 공간은
대부분 그림자용 카메라 안에 속할 겁니다.

하지만 여기서 의문이 하나 생깁니다. 어째서 `width`와 `height`를 완전 큰 값으로
설정해 모든 요소를 다 포함하도록 하지 않는 걸까요? `width`와 `height`를 100 정도로
설정해보세요. 아래와 같은 현상이 나타날 겁니다.

<div class="threejs_center"><img src="resources/images/low-res-shadow-map.png" style="width: 369px"></div>

왜 그림자의 해상도가 낮아졌을까요?

이는 그림자 관련 설정을 할 때 항상 주의해야하는 부분입니다. 사실 그림자 맵은 그림자가
포함된 하나의 텍스처입니다. 이 텍스처는 크기가 정해져 있죠. 위 예제에서 카메라의 공간을
늘리면, 이 텍스처 또한 늘어납니다. 다시 말해 공간을 크게 설정할수록 그림자가 더 각져
보일 거라는 얘기죠.

그림자 맵의 해상도는 `light.shadow.mapSize` 속성의 `width`와 `height` 속성으로 설정합니다(기본값은
512x512). 그림자 맵은 크게 설정할수록 메모리를 많이 차지하고, 연산이 더 복잡해지므로
가능한 작게 설정하는 것이 좋습니다. 이는 그림자용 카메라의 공간도 마찬가지죠. 작을 수록
그림자의 퀄리티가 좋아질 테니 가능한 공간을 작게 설정하는 것이 좋습니다. 또한 기기마다
렌더링할 수 있는 텍스처의 용량이 정해져 있으니 주의해야 합니다. Three.js에서 이 용량은
[`renderer.capabilities.maxTextureSize`](WebGLRenderer.capabilities)로 확인할 수 있습니다.

`SpotLight`는 그림자용 카메라로 `PerspectiveCamera`(원근 카메라)를 사용합니다. `DirectionalLight`의
그림자용 카메라는 거의 모든 속성을 직접 변경할 수 있었지만, `SpotLight`의 그림자용 카메라는
조명 속성의 영향을 받습니다. 카메라의 `fov` 속성은 `SpotLight`의 `angle` 속성과 직접 연결되어
있죠. `aspect`는 그림자 맵의 크기에 따라 자동으로 정해집니다.

```js
-const light = new THREE.DirectionalLight(color, intensity);
+const light = new THREE.SpotLight(color, intensity);
```

추가로 [이전 글](threejs-lights.html)에서 썼던 `penumbra(반음영)`, `angle` 설정을 가져오겠습니다.

{{{example url="../threejs-shadows-spot-light-with-camera-gui.html" }}}

마지막으로 `PointLight`를 살펴보죠. `PointLight`는 모든 방향으로 빛을 발산하기에
관련 설정은 `near`와 `far` 정도입니다. 그리고 사실 `PointLight`의 그림자는 정육면체의
각 면에 `SpotLight`를 하나씩, 총 6개의 그림자를 놓은 것과 같습니다. 한 방향에 한
번씩, 총 6번을 렌더링해야 하니 렌더링 속도가 훨씬 느리겠죠.

이번에는 장면 주위에 상자를 두어 벽과 천장에도 그림자가 생길 수 있도록 해보겠습니다.
먼저 재질의 `side` 속성을 `THREE.BackSide`로 설정해 외부 상자의 밖이 아닌 안을 렌더링
하도록 합니다. 바닥과 마찬가지로 그림자를 드리우지 않도록 설정하고, z-파이팅 현상을
피하기 위해 외부 상자를 바닥보다 살짝 아래에 둡니다.

```js
{
  const cubeSize = 30;
  const cubeGeo = new THREE.BoxBufferGeometry(cubeSize, cubeSize, cubeSize);
  const cubeMat = new THREE.MeshPhongMaterial({
    color: '#CCC',
    side: THREE.BackSide,
  });
  const mesh = new THREE.Mesh(cubeGeo, cubeMat);
  mesh.receiveShadow = true;
  mesh.position.set(0, cubeSize / 2 - 0.1, 0);
  scene.add(mesh);
}
```

물론 조명도 `PointLight`로 바꿔야죠.

```js
-const light = new THREE.SpotLight(color, intensity);
+const light = new THREE.PointLight(color, intensity);

....

// 조명이 위치를 확인하기 쉽도록 헬퍼 추가
+const helper = new THREE.PointLightHelper(light);
+scene.add(helper);
```

{{{example url="../threejs-shadows-point-light.html" }}}

GUI의 `position` 속성을 조정해 조명을 움직이면 벽에 그림자가 지는 걸
확인할 수 있을 겁니다. 다른 그림자와 마찬가지로 `near` 값보다 가까운
곳은 그림자가 지지 않고, `far` 값보다 먼 곳은 항상 그림자가 지죠.
