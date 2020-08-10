Title: Three.js 배경과 하늘 상자
Description: THREE.js에서 배경을 넣는 법을 알아봅니다
TOC: 배경, 하늘 상자 추가하기

이 시리즈의 예제 대부분은 단색 배경을 사용했습니다.

Three.js에서 단순한 배경을 넣는 건 CSS만큼이나 쉽습니다. [반응형 디자인에 관한
글](threejs-responsive.html)의 예제에서 2가지만 바꿔주면 되죠.

먼저 CSS로 canvas에 배경을 추가합니다.

```html
<style>
body {
    margin: 0;
}
#c {
    width: 100vw;
    height: 100vh;
    display: block;
+    background: url(resources/images/daikanyama.jpg) no-repeat center center;
+    background-size: cover;
}
</style>
```

그리고 `WebGLRenderer`에 `alpha` 옵션을 켜 아무것도 없는 공간은 투명하게
보이도록 설정합니다.

```js
function main() {
  const canvas = document.querySelector('#c');
-  const renderer = new THREE.WebGLRenderer({canvas});
+  const renderer = new THREE.WebGLRenderer({
+    canvas,
+    alpha: true,
+  });
```

간단하지 않나요?

{{{example url="../threejs-background-css.html" }}}

배경이 [후처리 효과](threejs-post-processing.html)의 영향을 받게 하려면
Three.js로 배경을 렌더링해야 합니다.

간단히 장면의 배경에 텍스처를 입혀주기만 하면 되죠.

```js
const loader = new THREE.TextureLoader();
const bgTexture = loader.load('resources/images/daikanyama.jpg');
scene.background = bgTexture; 
```

{{{example url="../threejs-background-scene-background.html" }}}

배경이 지정되긴 했지만, 화면에 맞춰 늘어났네요.

이미지의 일부만 보이도록 `repeat`과 `offset` 속성을 조정해 문제를 해결해봅시다.

```js
function render(time) {

   ...
+  /**
+   * 배경 텍스처의 repeat과 offset 속성을 조정해 이미지의 비율이 깨지지
+   * 않도록 합니다.
+   * 이미지를 불러오는 데 시간이 걸릴 수 있으니 감안해야 합니다.
+   **/
+  const canvasAspect = canvas.clientWidth / canvas.clientHeight;
+  const imageAspect = bgTexture.image ? bgTexture.image.width / bgTexture.image.height : 1;
+  const aspect = imageAspect / canvasAspect;
+
+  bgTexture.offset.x = aspect > 1 ? (1 - 1 / aspect) / 2 : 0;
+  bgTexture.repeat.x = aspect > 1 ? 1 / aspect : 1;
+
+  bgTexture.offset.y = aspect > 1 ? 0 : (1 - aspect) / 2;
+  bgTexture.repeat.y = aspect > 1 ? 1 : aspect;

  ...

  renderer.render(scene, camera);

  requestAnimationFrame(render);
}
```

이제 Three.js가 배경을 렌더링합니다. 그냥 보기에 CSS와 큰 차이는 없지만,
[후처리 효과](threejs-post-processing.html)의 영향을 받는다는 점이 다릅니다.

{{{example url="../threejs-background-scene-background-fixed-aspect.html" }}}

물론 3D 장면을 만들 때 단순한 배경을 자주 사용하진 않습니다. 대신 주로 일종의
*하늘 상자(skybox)*를 사용하죠. 하늘 상자란 말 그대로 하늘을 그려놓은 상자로써,
상자 안에 카메라를 놓으면 마치 배경에 하늘이 있는 것처럼 보이는 효과를 줍니다.

일반적으로 육면체에 텍스처를 입히고 안쪽을 렌더링하도록 설정해 하늘 상자를
구현합니다. 각 면에 수평선처럼 보이는 이미지를 텍스처로 배치하는 거죠(텍스처
좌표를 이용해). 하늘 구체(sky sphere)나 하늘 돔(sky dom)도 자주 사용하는
방식입니다. 다시 말해 육면체나 구체를 만들고, [텍스처를 입힌](threejs-textures.html)
뒤, 바깥 면이 아닌 안쪽 면을 렌더링하도록 `THREE.BackSide` 값을 넣어주면
됩니다. 그리고 바로 장면(scene)에 추가하거나, 하늘 상자/구체/돔을 담당할
장면 하나, 다른 요소를 담당할 장면 하나 이렇게 총 2개를 만들 수도 있죠.
`OrthographicCamera`를 쓸 필요는 없으니 `PerspectiveCamera`를 그대로
사용하면 됩니다.

다른 방법 중 하나는 *큐브맵(Cubemap)*입니다. 큐브맵은 정육면체의 한 면 당
하나, 총 6개의 면을 가진 텍스처로, 텍스처 좌표 대신 중앙에서 바깥쪽을 가리키는
방향으로 색상값을 결정합니다.

아래 6개의 이미지는 캘리포니아 마운틴 뷰에 있는 컴퓨터 역사 박물관에서 찍은
사진입니다.

<div class="threejs_center">
  <img src="../resources/images/cubemaps/computer-history-museum/pos-x.jpg" style="width: 200px" class="border">
  <img src="../resources/images/cubemaps/computer-history-museum/neg-x.jpg" style="width: 200px" class="border">
  <img src="../resources/images/cubemaps/computer-history-museum/pos-y.jpg" style="width: 200px" class="border">
</div>
<div class="threejs_center">
  <img src="../resources/images/cubemaps/computer-history-museum/neg-y.jpg" style="width: 200px" class="border">
  <img src="../resources/images/cubemaps/computer-history-museum/pos-z.jpg" style="width: 200px" class="border">
  <img src="../resources/images/cubemaps/computer-history-museum/neg-z.jpg" style="width: 200px" class="border">
</div>

이들을 `CubeTextureLoader`로 불러와 장면의 배경으로 설정합니다.

```js
{
  const loader = new THREE.CubeTextureLoader();
  const texture = loader.load([
    'resources/images/cubemaps/computer-history-museum/pos-x.jpg',
    'resources/images/cubemaps/computer-history-museum/neg-x.jpg',
    'resources/images/cubemaps/computer-history-museum/pos-y.jpg',
    'resources/images/cubemaps/computer-history-museum/neg-y.jpg',
    'resources/images/cubemaps/computer-history-museum/pos-z.jpg',
    'resources/images/cubemaps/computer-history-museum/neg-z.jpg',
  ]);
  scene.background = texture;
}
```

이 텍스처는 별도 조정이 필요 없으니 위에서 작성했던 코드를 삭제합니다.

```js
function render(time) {

   ...

-  /**
-   * 배경 텍스처의 repeat과 offset 속성을 조정해 이미지의 비율이 깨지지
-   * 않도록 합니다.
-   * 이미지를 불러오는 데 시간이 걸릴 수 있으니 감안해야 합니다.
-   **/
-  const canvasAspect = canvas.clientWidth / canvas.clientHeight;
-  const imageAspect = bgTexture.image ? bgTexture.image.width / bgTexture.image.height : 1;
-  const aspect = imageAspect / canvasAspect;
-
-  bgTexture.offset.x = aspect > 1 ? (1 - 1 / aspect) / 2 : 0;
-  bgTexture.repeat.x = aspect > 1 ? 1 / aspect : 1;
-
-  bgTexture.offset.y = aspect > 1 ? 0 : (1 - aspect) / 2;
-  bgTexture.repeat.y = aspect > 1 ? 1 : aspect;

  ...

  renderer.render(scene, camera);

  requestAnimationFrame(render);
}
```

카메라도 조작이 가능하도록 만듭니다.

```js
import { OrbitControls } from './resources/threejs/r119/examples/jsm/controls/OrbitControls.js';
```

```js
const fov = 75;
const aspect = 2;  // canvas 기본값
const near = 0.1;
-const far = 5;
+const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
-camera.position.z = 2;
+camera.position.z = 3;

+const controls = new OrbitControls(camera, canvas);
+controls.target.set(0, 0, 0);
+controls.update();
```

예제를 드래그하면 큐브맵이 주위를 둘러싼 게 보일 겁니다.

{{{example url="../threejs-background-cubemap.html" }}}

다른 방법은 등장방형도법(Equirectangular map)을 이용하는 겁니다. 이런 사진은
주로 [360도 카메라](https://google.com/search?q=360+camera)로 촬영합니다.

[다음 사진](https://hdrihaven.com/hdri/?h=tears_of_steel_bridge)은 [이 사이트](https://hdrihaven.com)에서
가져온 사진입니다.

<div class="threejs_center"><img src="../resources/images/equirectangularmaps/tears_of_steel_bridge_2k.jpg" style="width: 600px"></div>

등장방형도법의 사용법은 별로 다르지 않습니다. 먼저 등장방형도법 이미지를 텍스처로 불러온 뒤, 콜백에서 불러온 이미지 텍스처를 `WebGLCubeRenderTarget.fromEquirectangularTexture`를 호출할 때 넘겨주면 큐브맵(정육면체를 펼친 모양의 텍스처)를 만들 수 있습니다. `WebGLCubeRenderTarget`을 생성할 때 큐브맵의 크기를 지정해주기만 하면 되죠. 예제의 경우 등장방형도법 이미지의 높이를 넘겨주면 될 겁니다.

```js
{
-  const loader = new THREE.CubeTextureLoader();
-  const texture = loader.load([
-    'resources/images/cubemaps/computer-history-museum/pos-x.jpg',
-    'resources/images/cubemaps/computer-history-museum/neg-x.jpg',
-    'resources/images/cubemaps/computer-history-museum/pos-y.jpg',
-    'resources/images/cubemaps/computer-history-museum/neg-y.jpg',
-    'resources/images/cubemaps/computer-history-museum/pos-z.jpg',
-    'resources/images/cubemaps/computer-history-museum/neg-z.jpg',
-  ]);
-  scene.background = texture;
+  const loader = new THREE.TextureLoader();
+  const texture = loader.load(
+    'resources/images/equirectangularmaps/tears_of_steel_bridge_2k.jpg',
+    () => {
+      const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
+      rt.fromEquirectangularTexture(renderer, texture);
+      scene.background = rt;
+    });
}
```

어렵지 않게 등장방형도법 텍스처를 구현했습니다.

{{{example url="../threejs-background-equirectangularmap.html" }}}

등장방형도법은 복잡한 쉐이더를 사용하기에 큐브맵보다 성능이 떨어집니다.
다행히 등장방형도법 이미지를 큐브맵으로 바꾸는 건 그다지 어려운 일이 아니죠.
[이 사이트를 이용](https://matheowis.github.io/HDRI-to-CubeMap/)하면 쉽게
이미지를 변경할 수 있을 겁니다.