Title: 피킹과 색상에 인덱스 텍스처 사용하기
Description: 인덱스 텍스처를 사용해 피킹을 구현하고, 색상을 정하는 법을 알아봅니다
TOC: 피킹과 색상에 인덱스 텍스처 사용하기

※ 이 글은 [HTML 요소를 3D로 정렬하기](threejs-align-html-elements-to-3d.html)에서 이어집니다. 이전 글을 읽지 않았다면 먼저 읽고 오기 바랍니다.


Three.js를 쓰다보면 창의적인 해결법이 필요할 때가 있습니다. 저도 나름 시리즈를 진행하며 나름 많은 해결법을 찾고, 적어 놓았죠. 혹 필요한 게 있다면 확인해보기 바랍니다. 물론 그게 최적의 해결법이라고 단언할 수는 없지만요.

[이전 글](threejs-align-html-elements-to-3d.html)에서는 3D 지구본 주위에 나라 이름을 표기했습니다. 여기서 더 나아가 사용자가 나라를 선택하고 자기가 선택한 나라를 보게 한다면 어떨까요? 또 어떻게 구현할 수 있을까요?

가장 쉽게 떠오르는 방법은 각 나라마다 geometry를 만드는 겁니다. 이전에 했던 것처럼 [피킹(picking)](threejs-picking.html)을 써서 구현할 수 있겠죠. 이미 각 나라의 3D geometry는 만들었으니 사용자가 mesh를 클릭했을 때 어떤 나라를 클릭했는지 알 수 있을 겁니다.

시험삼아 [이전 글](threejs-align-html-elements-to-3d.html)에서 윤곽선을 만들기 위해 사용했던 데이터로 각 나라마다 3D mesh를 만들어봤습니다. 결과로 15.5MB짜리 GLTF(.glb) 파일이 나왔죠. 사용자가 간단한 지구본을 보려고 15.5MB나 다운 받아야 한다니, 개인적인 의견이지만 너무 과한 듯합니다.

데이터를 압축할 수 있는 방법이야 많습니다. 예를 들어 특정 알고리즘을 도입해 윤곽선의 해상도를 낮출 수 있죠. 이 글에서는 시도하지 않을 텐데, 이유는 미국의 경우 데이터를 많이 줄일 수 있겠지만 캐나다나 섬이 많은 나라는 그렇지 않을 것이기 때문입니다.

다른 방법은 실제 데이터를 전부 압축하는 겁니다. 압축 프로그램을 돌려 압축하니 용량이 11MB까지 줄더군요. 30% 정도 줄긴 했지만 여전히 큰 파일입니다.

32비트 부동 소수 대신 16비트 방식으로 데이터를 저장할 수도 있습니다. 또는 [드레이코 압축기](https://google.github.io/draco/) 같은 프로그램을 사용하는 것만으로 충분히 데이터를 줄일 수 있을지도 모르죠. 전 따로 드레이코 압축기를 사용해보진 않았으니 여러분이 한 번 써보시고 알려주신다면 감사하겠습니다 😅.

이 글에서는 [피킹에 관한 글](threejs-picking.html) 마지막에서 다뤘던 [GPU 피킹](threejs-picking.html)을 사용해보겠습니다. 각 mesh에 id 역할을 할 고유한 색을 부여하고 해당 mesh를 클릭했을 때 해당 픽셀의 색상값으로 사용자가 어떤 mesh를 클릭했는지 알아내는 방법이죠.

일단 각 나라에 고유한 색상을 부여한 뒤, 이 색상값을 인덱스로 나라 배열을 만듭니다. 그리고 피킹용 텍스처를 만든 뒤 이걸로 지구본을 렌더링합니다. 이러면 사용자가 클릭한 픽셀을 확인해 어떤 나라를 클릭했는지 알 수 있겠죠.

먼저 [약간의 코드](https://github.com/gfxfundamentals/threejsfundamentals/blob/master/threejs/lessons/tools/geo-picking/)를 작성해 아래의 텍스처를 만들었습니다.

<div class="threejs_center"><img src="../resources/data/world/country-index-texture.png" style="width: 700px;"></div>

> 참고: 이 텍스트를 만드는 데 사용한 데이터는 이 [웹사이트](http://thematicmapping.org/downloads/world_borders.php)이며, 라이선스는 [CC-BY-SA](http://creativecommons.org/licenses/by-sa/3.0/)입니다.

이 이미지는 271KB 정도밖에 되지 않습니다. 나라들의 mesh가 14MB가 넘었던 것에 비하면 훨씬 낫네요. 물론 해상도를 더 낮출 수도 있지만 이 정도면 충분한 것 같네요.

이제 나라에 피킹을 적용해 봅시다.

[GPU 피킹 예제](threejs-picking.html)의 코드를 가져와 피킹용 장면(scene)을 따로 만듭니다.

```js
const pickingScene = new THREE.Scene();
pickingScene.background = new THREE.Color(0);
```

피킹용 장면에 피킹용 텍스처를 입힌 지구본을 추가합니다.

```js
{
  const loader = new THREE.TextureLoader();
  const geometry = new THREE.SphereBufferGeometry(1, 64, 32);

+  const indexTexture = loader.load('resources/data/world/country-index-texture.png', render);
+  indexTexture.minFilter = THREE.NearestFilter;
+  indexTexture.magFilter = THREE.NearestFilter;
+
+  const pickingMaterial = new THREE.MeshBasicMaterial({ map: indexTexture });
+  pickingScene.add(new THREE.Mesh(geometry, pickingMaterial));

  const texture = loader.load('resources/data/world/country-outlines-4k.png', render);
  const material = new THREE.MeshBasicMaterial({ map: texture });
  scene.add(new THREE.Mesh(geometry, material));
}
```

다음으로 `GPUPickHelper`를 통째로 가져와 몇 가지 수정합니다.

```js
class GPUPickHelper {
  constructor() {
    // 1x1 픽셀 크기의 렌더 타겟을 생성합니다
    this.pickingTexture = new THREE.WebGLRenderTarget(1, 1);
    this.pixelBuffer = new Uint8Array(4);
-    this.pickedObject = null;
-    this.pickedObjectSavedColor = 0;
  }
  pick(cssPosition, scene, camera) {
    const { pickingTexture, pixelBuffer } = this;

    // view offset을 마우스 포인터 아래 1픽셀로 설정합니다
    const pixelRatio = renderer.getPixelRatio();
    camera.setViewOffset(
      renderer.getContext().drawingBufferWidth,   // 전체 너비
      renderer.getContext().drawingBufferHeight,  // 전체 높이
      cssPosition.x * pixelRatio | 0,             // 사각 x 좌표
      cssPosition.y * pixelRatio | 0,             // 사각 y 좌표
      1,                                          // 사각 좌표 width
      1,                                          // 사각 좌표 height
    );
    // 장면을 렌더링합니다
    renderer.setRenderTarget(pickingTexture);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    // view offset을 정상으로 돌려 원래의 화면을 렌더링하도록 합니다
    camera.clearViewOffset();
    // 픽셀을 감지합니다
    renderer.readRenderTargetPixels(
        pickingTexture,
        0,   // x
        0,   // y
        1,   // width
        1,   // height
        pixelBuffer);

+    const id =
+        (pixelBuffer[0] << 16) |
+        (pixelBuffer[1] <<  8) |
+        (pixelBuffer[2] <<  0);
+
+    return id;
-    const id =
-        (pixelBuffer[0] << 16) |
-        (pixelBuffer[1] <<  8) |
-        (pixelBuffer[2]      );
-    const intersectedObject = idToObject[id];
-    if (intersectedObject) {
-      // 첫 번째 물체가 제일 가까우므로 해당 물체를 고릅니다
-      this.pickedObject = intersectedObject;
-      // 기존 색을 저장해둡니다
-      this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
-      // emissive 색을 빨강/노랑으로 빛나게 만듭니다
-      this.pickedObject.material.emissive.setHex((time * 8) % 2 > 1 ? 0xFFFF00 : 0xFF0000);
-    }
  }
}
```

`GPUPickHelper`를 이용해 나라를 선택하도록 합니다.

```js
const pickHelper = new GPUPickHelper();

function getCanvasRelativePosition(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * canvas.width  / rect.width,
    y: (event.clientY - rect.top ) * canvas.height / rect.height,
  };
}

function pickCountry(event) {
  // 아직 데이터를 불러오지 않았을 경우
  if (!countryInfos) {
    return;
  }

  const position = getCanvasRelativePosition(event);
  const id = pickHelper.pick(position, pickingScene, camera);
  if (id > 0) {
    // 나라를 선택했을 때 해당 나라의 'selected' 속성을 바꿉니다.
    const countryInfo = countryInfos[id - 1];
    const selected = !countryInfo.selected;
    // 나라를 클릭했을 때 특수키를 누르지 않았다면 다른 나라의 'selected'
    // 속성을 전부 끕니다.
    if (selected && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
      unselectAllCountries();
    }
    numCountriesSelected += selected ? 1 : -1;
    countryInfo.selected = selected;
  } else if (numCountriesSelected) {
    // 바다나 하늘을 클릭했을 경우
    unselectAllCountries();
  }
  requestRenderIfNotRequested();
}

function unselectAllCountries() {
  numCountriesSelected = 0;
  countryInfos.forEach((countryInfo) => {
    countryInfo.selected = false;
  });
}

canvas.addEventListener('mouseup', pickCountry);

let lastTouch;
canvas.addEventListener('touchstart', (event) => {
  // 스크롤 이벤트를 방지합니다.
  event.preventDefault();
  lastTouch = event.touches[0];
}, { passive: false });
canvas.addEventListener('touchmove', (event) => {
  lastTouch = event.touches[0];
});
canvas.addEventListener('touchend', () => {
  pickCountry(lastTouch);
});
```

위 코드는 나라 배열에 속한 나라의 `selected` 속성을 켜고 끕니다. `shift`, `ctrl`, `cmd` 중 하나를 누르면 하나 이상의 나라를 선택할 수 있죠.

이제 선택한 나라를 보여줄 일만 남았습니다. 지금은 일단 해당 나라의 이름표를 보여주기로 하죠.

```js
function updateLabels() {
  // 아직 데이터를 불러오지 않았을 경우
  if (!countryInfos) {
    return;
  }

  const large = settings.minArea * settings.minArea;
  // 카메라의 상대 방향을 나타내는 행렬 좌표를 가져옵니다.
  normalMatrix.getNormalMatrix(camera.matrixWorldInverse);
  // 카메라의 위치를 가져옵니다.
  camera.getWorldPosition(cameraPosition);
  for (const countryInfo of countryInfos) {
-    const { position, elem, area } = countryInfo;
-    // 영역이 특정 값보다 작다면 이름표를 표시하지 않습니다.
-    if (area < large) {
+    const { position, elem, area, selected } = countryInfo;
+    const largeEnough = area >= large;
+    const show = selected || (numCountriesSelected === 0 && largeEnough);
+    if (!show) {
      elem.style.display = 'none';
      continue;
    }

    ...
```

이제 나라를 선택해 볼 수 있습니다.

{{{example url="../threejs-indexed-textures-picking.html" }}}

위 예제는 여전히 영역 크기에 따라 나라 이름을 보여주긴 하나, 특정 나라를 클릭하면 해당 나라의 이름만 보여줄 겁니다.

이만하면 각 나라를 피킹하는 예제로 충분해 보이지만... 선택한 나라의 색을 바꾸려면 어떻게 해야 할까요?

*컬러 팔레트(color palette)*를 사용하면 이 문제를 해결할 수 있습니다.

[컬러 팔레트](https://ko.wikipedia.org/wiki/%ED%8C%94%EB%A0%88%ED%8A%B8_(%EC%BB%B4%ED%93%A8%ED%8C%85)) 혹은 [인덱스 팔레트](https://en.wikipedia.org/wiki/Indexed_color)는 아타리 800, Amiga, NES, 슈퍼 닌텐도, 구형 IBM PC 등 구형 시스템에서 사용하던 기법입니다. 비트맵을 색상당 8비트 혹은 24바이트 이상의 RGB 색상으로 적용하는 대신 비트맵을 8비트 이하의 값으로 저장하는 기법이죠. 각 픽셀의 색상값은 팔레트의 인덱스 값으로, 픽셀의 색상값이 3이라면 특정 "팔레트"의 3번 색상을 사용한다는 의미입니다.

자바스크립트로 설명하자면 아래와 같은 형식을 생각할 수 있습니다.

```js
const face7x7PixelImageData = [
  0, 1, 1, 1, 1, 1, 0,
  1, 0, 0, 0, 0, 0, 1, 
  1, 0, 2, 0, 2, 0, 1,
  1, 0, 0, 0, 0, 0, 1,
  1, 0, 3, 3, 3, 0, 1,
  1, 0, 0, 0, 0, 0, 1,
  0, 1, 1, 1, 1, 1, 1,
];

const palette = [
  [255, 255, 255],  // white
  [  0,   0,   0],  // black
  [  0, 255, 255],  // cyan
  [255,   0,   0],  // red
];
```

이미지 데이터의 각 픽셀은 팔레트의 인덱스를 가리킵니다. 위 데이터를 위 팔레트로 해석하면 다음과 같은 이미지가 나오겠죠.

<div class="threejs_center"><img src="resources/images/7x7-indexed-face.png"></div>

예제의 경우 이미 각 나라별로 고유 색을 부여한 텍스처가 있습니다. 이 텍스처에 팔레트를 적용하면 각 나라에 다른 색을 부여할 수 있겠죠. 또 이 팔레트의 색을 바꾸면 각 나라의 색도 바뀔 겁니다. 그러니 팔레트의 색을 전부 검정으로 바꾼 뒤, 선택한 나라만 다른 색으로 바꾸면 해당 나라를 선택했다는 것을 시각적으로 나타낼 수 있을 겁니다.

컬러 팔레트 기법을 사용하려면 쉐이더를 직접 만들어야 합니다. Three.js의 내장 쉐이더를 수정해서 사용하면 조명이나 다른 기능도 나중에 사용할 수 있으니 이 방법을 사용하도록 하죠.

[다중 애니메이션 요소 최적화하기](threejs-optimize-lots-of-objects-animated.html)에서 다뤘듯 재질의 `onBeforeCompile` 속성에 함수를 지정하면 내장 쉐이더를 수정할 수 있습니다.

아래는 내장 fragment 쉐이더를 수정하기 전입니다.

```glsl
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		reflectedLight.indirectDiffuse += texture2D( lightMap, vUv2 ).xyz * lightMapIntensity;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	gl_FragColor = vec4( outgoingLight, diffuseColor.a );
	#include <premultiplied_alpha_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
}
```

[위 코드의 쉐이더 조각](https://github.com/mrdoob/three.js/tree/dev/src/renderers/shaders/ShaderChunk)을 일일이 뒤져 보니 Three.js는 `diffuseColor`라는 변수로 재질(material)의 색상값을 제어합니다. 이 변수는 `<color_fragment>`라는 [쉐이더 조각](https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/color_fragment.glsl.js)에서 선언하니 변수 선언 후에 색상값을 수정하면 되겠네요.

저 때 `diffuseColor`는 아까 만들었던 윤곽선 텍스처에서 색상을 가져온 상태일 테니, 이 색상값으로 팔레트 텍스처에서 새로운 색상값을 가져 올 수 있을 겁니다.

[이전에 했던 것](threejs-optimize-lots-of-objects-animated.html)처럼 바꿀 문자열 정보를 배열로 만들어 `Material.onBeforeCompile`에서 쉐이더를 수정하겠습니다.

```js
{
  const loader = new THREE.TextureLoader();
  const geometry = new THREE.SphereBufferGeometry(1, 64, 32);

  const indexTexture = loader.load('resources/data/world/country-index-texture.png', render);
  indexTexture.minFilter = THREE.NearestFilter;
  indexTexture.magFilter = THREE.NearestFilter;

  const pickingMaterial = new THREE.MeshBasicMaterial({ map: indexTexture });
  pickingScene.add(new THREE.Mesh(geometry, pickingMaterial));

+  const fragmentShaderReplacements = [
+    {
+      from: '#include <common>',
+      to: `
+        #include <common>
+        uniform sampler2D indexTexture;
+        uniform sampler2D paletteTexture;
+        uniform float paletteTextureWidth;
+      `,
+    },
+    {
+      from: '#include <color_fragment>',
+      to: `
+        #include <color_fragment>
+        {
+          vec4 indexColor = texture2D(indexTexture, vUv);
+          float index = indexColor.r * 255.0 + indexColor.g * 255.0 * 256.0;
+          vec2 paletteUV = vec2((index + 0.5) / paletteTextureWidth, 0.5);
+          vec4 paletteColor = texture2D(paletteTexture, paletteUV);
+          // diffuseColor.rgb += paletteColor.rgb;   // 하얀 윤곽선
+          diffuseColor.rgb = paletteColor.rgb - diffuseColor.rgb;  // 검은 윤곽선
+        }
+      `,
+    },
+  ];

  const texture = loader.load('resources/data/world/country-outlines-4k.png', render);
  const material = new THREE.MeshBasicMaterial({ map: texture });
+  material.onBeforeCompile = function(shader) {
+    fragmentShaderReplacements.forEach((rep) => {
+      shader.fragmentShader = shader.fragmentShader.replace(rep.from, rep.to);
+    });
+  };
  scene.add(new THREE.Mesh(geometry, material));
}
```

위 코드에서는 `indexTexture`, `paletteTexture`, `paletteTextureWidth`, 총 3개의 균등 변수(uniform)를 사용했습니다. `indexTexture`는 색상값을 불러와 인덱스로 변환하기 위한 것으로, 이때 사용한 `vUv`는 Three.js가 넘겨주는 텍스처 좌표이죠. 그리고 이 인덱스 값으로 컬러 팔레트에서 새로운 색상값을 가져 와 `diffuseColor`와 섞었습니다. 이때 `diffuseColor`는 검은바탕에 하얀색 윤곽선 텍스처이니 두 색을 더해도 하얀 윤곽선이 나올 겁니다. 대신 새로운 색에서 `diffuseColor`를 뺀다면 검은 윤곽선이 나오겠죠.

다음으로 렌더링 전에 팔레트 텍스처와 3개의 균등 변수를 지정해야 합니다.

팔레트 텍스처에는 나라당 하나의 색상과 바다의 색상(id = 0) 하나만 필요합니다. 전 세계적으로 약 240여 개의 나라가 있죠. 나라 배열을 불러올 때까지 기다렸다가 정확한 개수를 받아올 수도 있을 겁니다. 하지만 당장 숫자가 크다고 문제가 될 것 같지는 않으니 512 정도의 큰 숫자를 고르기로 합시다.

아래는 팔레트 텍스처를 만드는 코드입니다.

```js
const maxNumCountries = 512;
const paletteTextureWidth = maxNumCountries;
const paletteTextureHeight = 1;
const palette = new Uint8Array(paletteTextureWidth * 3);
const paletteTexture = new THREE.DataTexture(
    palette, paletteTextureWidth, paletteTextureHeight, THREE.RGBFormat);
paletteTexture.minFilter = THREE.NearestFilter;
paletteTexture.magFilter = THREE.NearestFilter;
```

`DataTexture`를 쓰면 텍스처를 로우-데이터(raw data) 형식으로 넘길 수 있습니다. 예제의 경우에는 512 RGB 색상을 넘겨주면 되겠죠. 각 값은 3바이트로, 이 바이트는 각각 red, green, blue을 0부터 255까지의 숫자로 나타냅니다.

일단은 무작위로 색을 지정해 잘 작동하는지 테스트해봅시다.

```js
for (let i = 1; i < palette.length; ++i) {
  palette[i] = Math.random() * 256;
}
// 바다의 색을 지정합니다. (index #0)
palette.set([100, 200, 255], 0);
paletteTexture.needsUpdate = true;
```

`palette` 배열로 팔레트 텍스처를 업데이트할 때마다 장면을 업데이트해야 하니 `paletteTexture.needsUpdate`를 `true`로 설정합니다.

다음으로 재질에 균등 변수를 설정해줍니다.

```js
const geometry = new THREE.SphereBufferGeometry(1, 64, 32);
const material = new THREE.MeshBasicMaterial({ map: texture });
material.onBeforeCompile = function(shader) {
  fragmentShaderReplacements.forEach((rep) => {
    shader.fragmentShader = shader.fragmentShader.replace(rep.from, rep.to);
  });
+  shader.uniforms.paletteTexture = { value: paletteTexture };
+  shader.uniforms.indexTexture = { value: indexTexture };
+  shader.uniforms.paletteTextureWidth = { value: paletteTextureWidth };
};
scene.add(new THREE.Mesh(geometry, material));
```

이제 예제를 실행하면 각 나라의 색상이 무작위로 지정된 것이 보일 겁니다.

{{{example url="../threejs-indexed-textures-random-colors.html" }}}

인덱싱과 팔레트 텍스처가 잘 작동하는 것을 확인했으니, 이제 팔레트를 조작해 선택한 나라의 색상만 바꾸도록 해봅시다.

먼저 함수를 하나 만듭니다. 이 함수는 Three.js의 `Color`를 매개변수로 받아 팔레트 텍스처에 지정할 수 있는 값을 반환할 겁니다.

```js
const tempColor = new THREE.Color();
function get255BasedColor(color) {
  tempColor.set(color);
  return tempColor.toArray().map(v => v * 255);
}
```

위 함수를 `color = get255BasedColor('red')`와 같은 식으로 호출하면 `[255, 0, 0]` 이런 식의 배열을 반환합니다.

다음으로 위 함수를 이용해 몇 가지 색을 만들어 팔레트를 채웁니다.

```js
const selectedColor = get255BasedColor('red');
const unselectedColor = get255BasedColor('#444');
const oceanColor = get255BasedColor('rgb(100,200,255)');
resetPalette();

function setPaletteColor(index, color) {
  palette.set(color, index * 3);
}

function resetPalette() {
  // 모든 팔레트의 색상을 unselectedColor로 바꿉니다.
  for (let i = 1; i < maxNumCountries; ++i) {
    setPaletteColor(i, unselectedColor);
  }

  // 바다의 색을 지정합니다. (index #0)
  setPaletteColor(0, oceanColor);
  paletteTexture.needsUpdate = true;
}
```

이제 `resetPalette` 함수를 이용해 나라를 선택했을 때 팔레트를 업데이트합니다.

```js
function getCanvasRelativePosition(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * canvas.width  / rect.width,
    y: (event.clientY - rect.top ) * canvas.height / rect.height,
  };
}

function pickCountry(event) {
  // 아직 데이터를 불러오지 않았을 경우
  if (!countryInfos) {
    return;
  }

  const position = getCanvasRelativePosition(event);
  const id = pickHelper.pick(position, pickingScene, camera);
  if (id > 0) {
    const countryInfo = countryInfos[id - 1];
    const selected = !countryInfo.selected;
    if (selected && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
      unselectAllCountries();
    }
    numCountriesSelected += selected ? 1 : -1;
    countryInfo.selected = selected;
+    setPaletteColor(id, selected ? selectedColor : unselectedColor);
+    paletteTexture.needsUpdate = true;
  } else if (numCountriesSelected) {
    unselectAllCountries();
  }
  requestRenderIfNotRequested();
}

function unselectAllCountries() {
  numCountriesSelected = 0;
  countryInfos.forEach((countryInfo) => {
    countryInfo.selected = false;
  });
+  resetPalette();
}
```

이제 선택한 나라가 강조되어 보일 겁니다.

{{{example url="../threejs-indexed-textures-picking-and-highlighting.html" }}}

잘 작동하는 것 같네요!

다만 지구본을 돌릴 때도 나라가 선택된다는 게 거슬립니다. 또 나라를 선택하고 지구본을 돌리면 해당 선택이 풀려버리네요.

마지막으로 이것까지 고쳐봅시다. 2가지 정도를 확인하면 충분할 것 같네요. 하나는 포인터를 누른 후 떼기까지 얼마나 시간이 흘렀는지를 확이하는 것이고, 다른 하나는 포인터가 움직였는지 확인하는 겁니다. 마우스를 떼는 데 시간이 얼마 안 걸렸고 포인터가 움직이지 않았다면 클릭으로 간주하는 것이죠.

```js
+const maxClickTimeMs = 200;
+const maxMoveDeltaSq = 5 * 5;
+const startPosition = {};
+let startTimeMs;
+
+function recordStartTimeAndPosition(event) {
+  startTimeMs = performance.now();
+  const pos = getCanvasRelativePosition(event);
+  startPosition.x = pos.x;
+  startPosition.y = pos.y;
+}

function getCanvasRelativePosition(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * canvas.width  / rect.width,
    y: (event.clientY - rect.top ) * canvas.height / rect.height,
  };
}

function pickCountry(event) {
  // 아직 데이터를 불러오지 않았을 경우
  if (!countryInfos) {
    return;
  }

+  // 포인터를 누른 후 떼기까지 일정 시간 이상 걸렸다면
+  // 선택 액션이 아닌 드래그 액션으로 간주합니다.
+  const clickTimeMs = performance.now() - startTimeMs;
+  if (clickTimeMs > maxClickTimeMs) {
+    return;
+  }
+
+  // 포인터가 움직였다면 드래그로 간주합니다.
+  const position = getCanvasRelativePosition(event);
+  const moveDeltaSq = (startPosition.x - position.x) ** 2 +
+                      (startPosition.y - position.y) ** 2;
+  if (moveDeltaSq > maxMoveDeltaSq) {
+    return;
+  }

-  const position = { x: event.clientX, y: event.clientY };
  const id = pickHelper.pick(position, pickingScene, camera);
  if (id > 0) {
    const countryInfo = countryInfos[id - 1];
    const selected = !countryInfo.selected;
    if (selected && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
      unselectAllCountries();
    }
    numCountriesSelected += selected ? 1 : -1;
    countryInfo.selected = selected;
    setPaletteColor(id, selected ? selectedColor : unselectedColor);
    paletteTexture.needsUpdate = true;
  } else if (numCountriesSelected) {
    unselectAllCountries();
  }
  requestRenderIfNotRequested();
}

function unselectAllCountries() {
  numCountriesSelected = 0;
  countryInfos.forEach((countryInfo) => {
    countryInfo.selected = false;
  });
  resetPalette();
}

+canvas.addEventListener('mousedown', recordStartTimeAndPosition);
canvas.addEventListener('mouseup', pickCountry);

let lastTouch;
canvas.addEventListener('touchstart', (event) => {
  // 스크롤 이벤트를 방지합니다.
  event.preventDefault();
  lastTouch = event.touches[0];
+  recordStartTimeAndPosition(event.touches[0]);
}, { passive: false });
canvas.addEventListener('touchmove', (event) => {
  lastTouch = event.touches[0];
});
```

제 기준에서는 이 정도면 충분한 *듯하네요*.

{{{example url="../threejs-indexed-textures-picking-debounced.html" }}}

저는 UX 전문가가 아니니 더 나은 방법이 있을 경우 알려주시면 감사하겠습니다.

이 글이 인덱스(indexed) 그래픽을 활용하고, Three.js의 쉐이더를 수정해 간단한 효과를 구현하는 데 도움이 되었다면 좋겠네요. 쉐이더를 작성할 때 쓴 GLSL에 대해 다루기에는 너무 내용이 방대하니 [후처리에 관한 글](threejs-post-processing.html)에 있는 링크를 참고하기 바랍니다.
