Title: 3DLUT로 후처리하기
Description: Three.js에서 3DLUT로 후처리하는 법을 알아봅니다
TOC: LUT 파일로 후처리 효과 적용하기

이전 글에서는 [후처리(Post processing)](threejs-post-processing.html)에 관해 알아보았습니다. 보통 후처리는 LUT 또는 3DLUT라고 부르기도 합니다. LUT는 룩업 테이블(Look-Up Table, 순람표)의 줄임말이고, 3DLUT는 3차원 룩업 테이블의 줄임말입니다.

3DLUT는 2D 이미지를 특정한 색상 정육면체를 매핑한다고 생각하면 쉽습니다. 먼저 원본 이미지의 색상을 정육면체의 인덱스 값과 매칭시킵니다. 원본 이미지의 픽셀 하나당 해당 픽셀 색상의 빨강(red), 초록(green), 파랑(blue) 값을 이용해 정육면체의 특정 지점을 가리키는(look-up) 3D 벡터 인덱스를 만드는 것이죠. 이 인덱스를 통해 3DLUT에서 뽑아낸 값을 새로운 색으로 사용하는 겁니다.

자바스크립트의 경우 아래처럼 구현할 수 있습니다. RGB 각 색상값을 0부터 255의 정수로 표현한 3차원 256x256x256 배열로 룩업 테이블을 구현하고, 이 룩업 테이블에서 RGB 색상값을 이용해 새로운 색상값을 선택하는 거죠.

```js
const newColor = lut[origColor.red][origColor.green][origColor.blue]
```

물론 256x256x256 배열은 큰 배열입니다. [텍스처에 관한 글](threejs-textures.html)에서 배웠듯 텍스처는 크기에 상관 없이 0.0에서 1.0로 값을 지정합니다.

8x8x8 정육면체를 예로 들어보죠.

<div class="threejs_center"><img src="resources/images/3dlut-rgb.svg" class="noinvertdark" style="width: 500px"></div>

먼저 0,0,0 부분을 검정색으로 채웁니다. 맞은편의 1,1,1 부분은 하얀색, 1,0,0 부분은 <span style="color:red;">빨강</span>, 0,1,0은 <span style="color:green;">초록</span>, 0,0,1은 <span style="color:blue;">파랑</span>으로 채웁니다.

<div class="threejs_center"><img src="resources/images/3dlut-axis.svg" class="noinvertdark" style="width: 500px"></div>

그리고 각 축을 따라 색을 채워넣습니다.

<div class="threejs_center"><img src="resources/images/3dlut-edges.svg" class="noinvertdark" style="width: 500px"></div>

빈 모서리를 2개 이상의 색상 채널을 사용하는 색으로 채웁니다(초록 + 빨강, 파랑 + 빨강 등).

<div class="threejs_center"><img src="resources/images/3dlut-standard.svg" class="noinvertdark" style="width: 500px"></div>

마지막으로 빈 공간을 채웁니다. 이 형태가 3DLUT 기본 구조입니다. 지금은 효과를 주기 전과 후의 차이가 없습니다. 색상값을 인덱스로 사용해 새로운 색상값을 선택하면, 정확히 같은 색상값이 나오기 때문이죠.

<div class="threejs_center"><object type="image/svg+xml" data="resources/images/3dlut-standard-lookup.svg" class="noinvertdark" data-diagram="lookup" style="width: 600px"></object></div>

이 정육면체를 호박색 쉐이드로 바꾸면 같은 인덱스를 참조하지만 전혀 다른 결과가 나옵니다.

<div class="threejs_center"><object type="image/svg+xml" data="resources/images/3dlut-amber-lookup.svg" class="noinvertdark" data-diagram="lookup" style="width: 600px"></object></div>

이 기법을 사용하면 룩업 테이블을 교체하는 것으로 많은 효과를 구현할 수 있습니다. 색상 계산 기반의 효과는 대부분 하나의 색상값만을 사용합니다. 색상, 대비, 채도, 컬러 캐스트(color cast), 틴트(tint), 밝기, 노출도, 레벨, 커브, 포스터화, 그림자, 강조, 등 거의 모든 효과를 색상값 계산을 기반으로 구현하죠. 또 이 모든 효과를 하나의 룩업 테이블로 합칠 수도 있습니다.

룩업 테이블을 사용하려면 먼저 적용할 장면이 필요하니 간단한 장면을 하나 만들어보겠습니다. [glTF 불러오기](threejs-load-gltf.html)에서 배웠듯 glTF 파일을 불러와 사용하겠습니다. 예제에 사용할 모델은 [The Ice Wolves](https://sketchfab.com/sarath.irn.kat005)의 [작품](https://sketchfab.com/models/a1d315908e9f45e5a3bc618bdfd2e7ee)입니다.

[배경과 하늘 상자](threejs-backgrounds.html)에서 배웠던 대로 배경도 추가하겠습니다.

{{{example url="../threejs-postprocessing-3dlut-prep.html" }}}

이제 장면을 구현했으니 3DLUT를 만들어야 합니다. 가장 간단한 3DLUT는 2x2x2 identity LUT로, 여기서 *identity(동일한)*은 아무런 변화도 없음을 의미합니다. 1을 곱하거나 아무것도 안 하는 경우와 같죠. LUT 안의 색상값을 사용한다고 해도 입력된 값과 정확히 같은 값을 반환할 테니까요.

<div class="threejs_center"><img src="resources/images/3dlut-standard-2x2.svg" class="noinvertdark" style="width: 200px"></div>

WebGL1은 3D 텍스쳐를 지원하지 않습니다. 따라서 3D 텍스처를 썰어 펼쳐 놓은 형태의 4x2짜리 2D 텍스처를 대신 사용하겠습니다.

아래는 4x2 2D 텍스처로 identity LUT를 구현한 것입니다.

```js
const makeIdentityLutTexture = function() {
  const identityLUT = new Uint8Array([
      0,   0,   0, 255,  // black
    255,   0,   0, 255,  // red
      0,   0, 255, 255,  // blue
    255,   0, 255, 255,  // magenta
      0, 255,   0, 255,  // green
    255, 255,   0, 255,  // yellow
      0, 255, 255, 255,  // cyan
    255, 255, 255, 255,  // white
  ]);

  return function(filter) {
    const texture = new THREE.DataTexture(identityLUT, 4, 2, THREE.RGBAFormat);
    texture.minFilter = filter;
    texture.magFilter = filter;
    texture.needsUpdate = true;
    texture.flipY = false;
    return texture;
  };
}();
```

필터가 들어간 것, 안 들어간 것 총 2개를 만들겠습니다.

```js
const lutTextures = [
  { name: 'identity', size: 2, texture: makeIdentityLutTexture(THREE.LinearFilter) },
  { name: 'identity not filtered', size: 2, texture: makeIdentityLutTexture(THREE.NearestFilter) },
];
```

[후처리에 관한 글](threejs-post-processing.html)에서 작성했던 코드를 가져와 이 쉐이더들을 대신 쓰도록 합니다.

```js
const lutShader = {
  uniforms: {
    tDiffuse: { value: null },
    lutMap:  { value: null },
    lutMapSize: { value: 1, },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  `,
  fragmentShader: `
    #include <common>

    #define FILTER_LUT true

    uniform sampler2D tDiffuse;
    uniform sampler2D lutMap;
    uniform float lutMapSize;

    varying vec2 vUv;

    vec4 sampleAs3DTexture(sampler2D tex, vec3 texCoord, float size) {
      float sliceSize = 1.0 / size;                  // space of 1 slice
      float slicePixelSize = sliceSize / size;       // space of 1 pixel
      float width = size - 1.0;
      float sliceInnerSize = slicePixelSize * width; // space of size pixels
      float zSlice0 = floor( texCoord.z * width);
      float zSlice1 = min( zSlice0 + 1.0, width);
      float xOffset = slicePixelSize * 0.5 + texCoord.x * sliceInnerSize;
      float yRange = (texCoord.y * width + 0.5) / size;
      float s0 = xOffset + (zSlice0 * sliceSize);

      #ifdef FILTER_LUT

        float s1 = xOffset + (zSlice1 * sliceSize);
        vec4 slice0Color = texture2D(tex, vec2(s0, yRange));
        vec4 slice1Color = texture2D(tex, vec2(s1, yRange));
        float zOffset = mod(texCoord.z * width, 1.0);
        return mix(slice0Color, slice1Color, zOffset);

      #else

        return texture2D(tex, vec2( s0, yRange));

      #endif
    }

    void main() {
      vec4 originalColor = texture2D(tDiffuse, vUv);
      gl_FragColor = sampleAs3DTexture(lutMap, originalColor.xyz, lutMapSize);
    }
  `,
};

const lutNearestShader = {
  uniforms: {...lutShader.uniforms},
  vertexShader: lutShader.vertexShader,
  fragmentShader: lutShader.fragmentShader.replace('#define FILTER_LUT', '//'),
};
```

fragment 쉐이더의 다음 코드는

```glsl
#define FILTER_LUT true
```

주석 처리했던 두 번째 쉐이더를 생성하기 위한 것입니다.

그리고 각 쉐이더로 `Pass`를 만듭니다.

```js
const effectLUT = new THREE.ShaderPass(lutShader);
effectLUT.renderToScreen = true;
const effectLUTNearest = new THREE.ShaderPass(lutNearestShader);
effectLUTNearest.renderToScreen = true;
```

기존에 배경과 glTF를 별도 장면으로 분리했으므로 각 장면의 `RenderPass`를 따로 생성합니다.

```js
const renderModel = new THREE.RenderPass(scene, camera);
renderModel.clear = false;  // 배경을 지우지 않도록 합니다
const renderBG = new THREE.RenderPass(sceneBG, cameraBG);
```

다음으로 사용할 pass*를 `EffectComposer`에 추가합니다.

※ 편의상 `Pass` 인스턴스를 pass로 번역합니다.

```js
const rtParameters = {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  format: THREE.RGBFormat,
};
const composer = new THREE.EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, rtParameters));

composer.addPass(renderBG);
composer.addPass(renderModel);
composer.addPass(effectLUT);
composer.addPass(effectLUTNearest);
```

GUI를 만들어 LUT를 바꿀 수 있도록 합니다.

```js
const lutNameIndexMap = {};
lutTextures.forEach((info, ndx) => {
  lutNameIndexMap[info.name] = ndx;
});

const lutSettings = {
  lut: lutNameIndexMap.identity,
};
const gui = new GUI({ width: 300 });
gui.add(lutSettings, 'lut', lutNameIndexMap);
```

마지막으로 필터링 여부에 따라 효과가 바뀌도록 설정합니다. LUT가 선택한 텍스처를 사용하도록 하고, `EffectComposer`로 렌더링 합니다.

```js
const lutInfo = lutTextures[lutSettings.lut];

const effect = lutInfo.filter ? effectLUT : effectLUTNearest;
effectLUT.enabled = lutInfo.filter;
effectLUTNearest.enabled = !lutInfo.filter;

const lutTexture = lutInfo.texture;
effect.uniforms.lutMap.value = lutTexture;
effect.uniforms.lutMapSize.value = lutInfo.size;

composer.render(delta);
```

identity 3DLUT를 선택했을 때는 아무런 변화가 없습니다.

{{{example url="../threejs-postprocessing-3dlut-identity.html" }}}

하지만 필터가 identity not filtered LUT를 선택하면 재미있는 결과가 나옵니다.

<div class="threejs_center"><img src="resources/images/unfiltered-3dlut.jpg" style="width: 500px"></div>

왜 이런 결과가 나온 걸까요? 필터링을 사용할 경우(linear), GPU는 선형적으로 색상값을 채워넣습니다. 필터링을 사용하지 않을 경우(nearest), 알아서 색상값을 채워넣지 않기에 3DLUT에서(근처의) 색상값이 있는 곳을 찾아 사용하는 것이죠.

어느정도 이해했다면 더 다양한 3DLUT를 만들어봅시다.

먼저 룩업 테이블의 해상도를 정하고 간단한 코드를 만들어 룩업 테이블 정육면체의 각 면을 만들겠습니다.

```js
const ctx = document.querySelector('canvas').getContext('2d');

function drawColorCubeImage(ctx, size) {
  const canvas = ctx.canvas;
  canvas.width = size * size;
  canvas.height = size;

  for (let zz = 0; zz < size; ++zz) {
    for (let yy = 0; yy < size; ++yy) {
      for (let xx = 0; xx < size; ++xx) {
        const r = Math.floor(xx / (size - 1) * 255);
        const g = Math.floor(yy / (size - 1) * 255);
        const b = Math.floor(zz / (size - 1) * 255);
        ctx.fillStyle = `rgb(${ r },${ g },${ b })`;
        ctx.fillRect(zz * size + xx, yy, 1, 1);
      }
    }
  }
  document.querySelector('#width').textContent = canvas.width;
  document.querySelector('#height').textContent = canvas.height;
}

drawColorCubeImage(ctx, 8);
```

캔버스 요소도 만듭니다.

```html
<canvas></canvas>
```

이제 어떤 identity 3D 룩업 테이블이든 만들 수 있습니다.

{{{example url="../3dlut-base-cube-maker.html" }}}

해상도가 높을수록 더 세밀한 효과를 줄 수 있지만 정육면체형 데이터의 크기는 기하급수적으로 늘어납니다. 크기 8x8 정육면체는 2kb 정도지만 64x64 정육면체는 약 1mb나 되죠. 그러니 충분히 효과를 구현할 수 있는 만큼만 사용하는 게 좋습니다.

사이즈를 16으로 설정하고 `Save...` 버튼을 클릭하면 아래와 같은 파일이 나옵니다.

<div class="threejs_center"><img src="resources/images/identity-lut-s16.png"></div>

그리고 LUT를 적용할 화면을 캡쳐해야 합니다. 이 경우에는 이전에 만든 장면에 아무런 효과를 주지 않은 화면이겠죠. 대게 위 예제를 오른쪽 클릭해 "다른 이름으로 저장..."을 클릭하면 되지만, OS에 따라 마우스 우클릭이 동작하지 않을 수 있습니다. 제 경우 OS에 내장된 스크린샷 기능을 이용해 화면을 캡쳐했습니다*.

※ Windows 10 RS5(레드스톤 5) 이상이라면 `Windows + Shift + S`를 눌러 화면을 캡쳐할 수 있습니다. 역주.

<div class="threejs_center"><img src="resources/images/3dlut-screen-capture.jpg" style="width: 600px"></div>

캡쳐본을 이미지 에디터에서 불러옵니다. 저는 포토샵을 사용해 샘플 이미지를 불러오고, 한쪽 귀퉁이에 3DLUT를 붙여 넣었습니다.

> 참고: 제 경우 포토샵에서 캡쳐본 위에 lut 파일을 불러오려고 했을 때 이미지가 두 배 더 커졌습니다. 아마 DPI를 맞추거나 하는 이유 때문에 그런 거겠죠. lut 파일을 별도 탭에 불러와 캡쳐본 위에 복사 붙여 넣기 하니 정상적으로 불러와지더군요.

<div class="threejs_center"><img src="resources/images/3dlut-photoshop-before.jpg" style="width: 600px"></div>

그리고 이미지에 부여하고 싶은 색상 효과를 부여합니다. 포토샵의 경우 대부분의 효과는 이미지(Image)->조정(Adjustments) 메뉴에 있습니다.

<div class="threejs_center"><img src="resources/images/3dlut-photoshop-after.jpg" style="width: 600px"></div>

색상을 조정하면 3DLUT 이미지에도 같은 효과가 적용될 겁니다.

자 그럼 이제 이걸 어떻게 쓸 수 있을까요?

먼저 저는 3DLUT 이미지를 `3dlut-red-only-s16.png`라는 이름으로 저장했습니다. 메모리를 아끼려면 이미지를 LUT 부분만 잘라 16x256로 맞추는 것이 좋지만, 그냥 재미삼아 이미지를 불러온 이후 자르겠습니다*. 이 방법의 장점은 귀찮게 이미지를 자르는 과정 없이 효과를 적용해보고 싶은 대로 바로바로 적용할 수 있다는 것이죠. 물론 대역폭을 낭비한다는 게 단점입니다.

※ 포토샵 CC 이후 버젼을 사용한다면 레이어를 오른쪽 클릭해 `PNG로 빠르게 내보내기` 메뉴로 해당 그룹 또는 레이어만 .png 파일로 내보낼 수 있습니다. 이미지를 귀찮게 자르는 과정 없이 .png 파일을 바로 생성할 수 있죠. 역주.

아래는 이미지를 불러오는 코드입니다. 실제 코드에서는 텍스처를 불러왔을 때 바로 사용할 수 있도록 identity lut를 먼저 만들었습니다. 그 다음 이미지를 불러와 3DLUT 부분만 캔버스에 복사하고, 캔버스에서 가져온 데이터를 텍스처에 지정합니다. 또한 텍스처가 바뀌었을 때 바로 적용하도록 `needsUpdate` 속성도 true로 설정합니다.

```js
const makeLUTTexture = function() {
  const imgLoader = new THREE.ImageLoader();
  const ctx = document.createElement('canvas').getContext('2d');

  return function(info) {
    const texture = makeIdentityLutTexture(
        info.filter ? THREE.LinearFilter : THREE.NearestFilter);

    if (info.url) {
      const lutSize = info.size;

      /**
       * 크기를 2(identity LUT의 크기)로 설정합니다. 이 크기는 나중에 이미지를
       * 불러온 뒤 복원합니다. 이러면 lut를 사용하는 코드는 이미지의 적용 여부를
       * 신경쓰지 않아도 됩니다.
       **/
      info.size = 2;

      imgLoader.load(info.url, function(image) {
        const width = lutSize * lutSize;
        const height = lutSize;
        info.size = lutSize;
        ctx.canvas.width = width;
        ctx.canvas.height = height;
        ctx.drawImage(image, 0, 0);
        const imageData = ctx.getImageData(0, 0, width, height);

        texture.image.data = new Uint8Array(imageData.data.buffer);
        texture.image.width = width;
        texture.image.height = height;
        texture.needsUpdate = true;
      });
    }

    return texture;
  };
}();
```

기존 코드가 LUT png 파일을 사용하도록 수정합니다.

```js
const lutTextures = [
  { name: 'identity',           size: 2, filter: true , },
  { name: 'identity no filter', size: 2, filter: false, },
+  { name: 'custom',          url: 'resources/images/lut/3dlut-red-only-s16.png' },
];

+lutTextures.forEach((info) => {
+  // 사이즈값이 없다면 사이즈 정보를 파일 이름에서 가져옵니다.
+  if (!info.size) {
+    /**    
+     * 파일 이름이 '-s<숫자>[n]' 이렇게 끝난다고 가정합니다.
+     * <숫자>는 3DLUT 정육면체의 크기입니다.
+     * [n]은 '필터링 없음' 또는 'nearest'를 의미합니다.
+     *
+     * 예시:
+     *    'foo-s16.png' = 크기:16, 필터: true
+     *    'bar-s8n.png' = 크기:8, 필터: false
+     **/
+    const m = /-s(\d+)(n*)\.[^.]+$/.exec(info.url);
+    if (m) {
+      info.size = parseInt(m[1]);
+      info.filter = info.filter === undefined ? m[2] !== 'n' : info.filter;
+    }
+  }
+
+  info.texture = makeLUTTexture(info);
+});
```

위 코드가 LUT의 사이즈를 파일 이름에 인코딩한 예입니다. 이러면 png로 LUT를 바꾸기가 훨씬 쉽죠.

그냥은 좀 심심하니 lut png 파일을 더 많이 만들어봅시다.

```js
const lutTextures = [
  { name: 'identity',           size: 2, filter: true , },
  { name: 'identity no filter', size: 2, filter: false, },
  { name: 'custom',          url: 'resources/images/lut/3dlut-red-only-s16.png' },
+  { name: 'monochrome',      url: 'resources/images/lut/monochrome-s8.png' },
+  { name: 'sepia',           url: 'resources/images/lut/sepia-s8.png' },
+  { name: 'saturated',       url: 'resources/images/lut/saturated-s8.png', },
+  { name: 'posterize',       url: 'resources/images/lut/posterize-s8n.png', },
+  { name: 'posterize-3-rgb', url: 'resources/images/lut/posterize-3-rgb-s8n.png', },
+  { name: 'posterize-3-lab', url: 'resources/images/lut/posterize-3-lab-s8n.png', },
+  { name: 'posterize-4-lab', url: 'resources/images/lut/posterize-4-lab-s8n.png', },
+  { name: 'posterize-more',  url: 'resources/images/lut/posterize-more-s8n.png', },
+  { name: 'inverse',         url: 'resources/images/lut/inverse-s8.png', },
+  { name: 'color negative',  url: 'resources/images/lut/color-negative-s8.png', },
+  { name: 'high contrast',   url: 'resources/images/lut/high-contrast-bw-s8.png', },
+  { name: 'funky contrast',  url: 'resources/images/lut/funky-contrast-s8.png', },
+  { name: 'nightvision',     url: 'resources/images/lut/nightvision-s8.png', },
+  { name: 'thermal',         url: 'resources/images/lut/thermal-s8.png', },
+  { name: 'b/w',             url: 'resources/images/lut/black-white-s8n.png', },
+  { name: 'hue +60',         url: 'resources/images/lut/hue-plus-60-s8.png', },
+  { name: 'hue +180',        url: 'resources/images/lut/hue-plus-180-s8.png', },
+  { name: 'hue -60',         url: 'resources/images/lut/hue-minus-60-s8.png', },
+  { name: 'red to cyan',     url: 'resources/images/lut/red-to-cyan-s8.png' },
+  { name: 'blues',           url: 'resources/images/lut/blues-s8.png' },
+  { name: 'infrared',        url: 'resources/images/lut/infrared-s8.png' },
+  { name: 'radioactive',     url: 'resources/images/lut/radioactive-s8.png' },
+  { name: 'goolgey',         url: 'resources/images/lut/googley-s8.png' },
+  { name: 'bgy',             url: 'resources/images/lut/bgy-s8.png' },
];
```

아래 예제에서 여러 lut를 시험해볼 수 있습니다.

{{{example url="../threejs-postprocessing-3dlut.html" }}}

추가로 한 가지 덧붙이겠습니다. 인터넷을 뒤져보니 Adobe에서 만든 표준 LUT 형식이 있더군요. [인터넷에서 검색](https://www.google.com/search?q=lut+files)해보면 이런 LUT 형식의 파일을 쉽게 찾을 수 있을 겁니다.

이를 기반으로 간단하게 로더를 작성했습니다. 총 4가지 형식이 있다고는 하나, 제가 찾은 형식은 하나뿐이라 모든 형식에서 테스트하진 못했습니다.

여기에 간단한 드래그-앤-드롭 라이브러리도 만들었습니다. 이 두 라이브러리를 이용해 여러분이 직접 LUT 파일을 적용할 수 있도록 말이죠.

먼저 앞서 만든 두 라이브러리를 불러온 뒤

```js
import * as lutParser from './resources/lut-reader.js';
import * as dragAndDrop from './resources/drag-and-drop.js';
```

아래처럼 사용합니다.

```js
dragAndDrop.setup({ msg: 'Drop LUT File here' });
dragAndDrop.onDropFile(readLUTFile);

function ext(s) {
  const period = s.lastIndexOf('.');
  return s.substr(period + 1);
}

function readLUTFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const type = ext(file.name);
    const lut = lutParser.lutTo2D3Drgb8(lutParser.parse(e.target.result, type));
    const {size, data, name} = lut;
    const texture = new THREE.DataTexture(data, size * size, size, THREE.RGBFormat);
    texture.minFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    texture.flipY = false;
    const lutTexture = {
      name: (name && name.toLowerCase().trim() !== 'untitled')
          ? name
          : file.name,
      size: size,
      filter: true,
      texture,
    };
    lutTextures.push(lutTexture);
    lutSettings.lut = lutTextures.length - 1;
    updateGUI();
  };

  reader.readAsText(file);
}
```

GUI가 새로 불러온 파일을 반영하도록 코드를 추가합니다.

```js
const lutSettings = {
  lut: lutNameIndexMap.thermal,
};
const gui = new GUI({ width: 300 });
gui.addFolder('Choose LUT or Drag&Drop LUT File(s)');

let lutGUI;
function updateGUI() {
  makeLutNameIndexMap();
  if (lutGUI) {
    gui.remove(lutGUI);
  }
  lutGUI = gui.add(lutSettings, 'lut', lutNameIndexMap);
}
updateGUI();
```

이제 [Adobe LUT 파일](https://www.google.com/search?q=lut+files)을 다운해 아래 예제에 드래그-앤-드롭으로 불러올 수 있을 겁니다.

{{{example url="../threejs-postprocessing-3dlut-w-loader.html" }}}

다만 Adobe LUT는 온라인 환경에 최적화되지 않았습니다. 파일 용량이 꽤 큰 편이죠. 아래 예제를 사용하면 용량을 좀 더 줄일 수 있습니다. 드래그-앤-드롭으로 파일을 불러오고 크기를 선택한 뒤 "Save..." 버튼을 클릭하면 되죠.

아래 예제는 단순히 위에서 썼던 예제를 조금 수정한 것입니다. glFT 파일 없이 배경만 렌더링한 것이죠. 배경 이미지는 아까 본 스크립트로 만든 identity lut 이미지입니다. 여기에 LUT 파일을 불러와 해당 LUT 파일을 PNG로 만드는 데 사용하는 것이죠.

{{{example url="../threejs-postprocessing-adobe-lut-to-png-converter.html" }}}

이 글에서는 쉐이더가 어떻게 작동하는지에 대해서는 아예 설명하지 않았습니다. 나중에 GLSL에 대해 더 다룰 기회가 있었으면 좋겠네요. 쉐이더의 작동 방식을 알고 싶다면 [후처리에 관한 글](threejs-post-processing.html)에 있는 링크 또는 [이 유튜브 영상](https://www.youtube.com/watch?v=rfQ8rKGTVlg#t=24m30s)을 참고하기 바랍니다.

<script type="module" src="resources/threejs-post-processing-3dlut.js"></script>
