Title: Three.js 후처리
Description: Three.js로 후처리하는 법을 알아봅니다
TOC: 후처리

*후처리(post processing)*란 보통 2D 이미지에 어떤 효과나 필터를 넣는 것을 의미합니다. Three.js는 다양한 mesh로 이루어진 장면을 2D 이미지로 렌더링하죠. 일반적으로 이 이미지는 바로 캔버스를 통해 브라우저 화면에 렌더링됩니다. 하지만 대신 이 이미지를 [렌더 타겟에 렌더링하고](threejs-rendertargets.html) 캔버스에 보내기 전 임의의 *후처리* 효과를 줄 수 있습니다.

인스타그램 필터, 포토샵 필터 등이 후처리의 좋은 예이죠.

Three.js에는 후처리를 순차적으로 처리해주는 모범 클래스가 있습니다. 일단 `EffectComposer`의 인스턴스를 만들고 여기에 `Pass` 객체(효과, 필터)들을 추가합니다. 그리고 `EffectComposer.render` 메서드를 호출하면 현재 장면을 [렌더 타겟](threejs-rendertargets.html)에 렌더링한 뒤 각 pass*를 순서대로 적용합니다.

※ 편의상 `Pass` 인스턴스를 pass로 번역합니다.

이 pass는 비넷(vignette), 흐림(blur), 블룸(bloom), 필름 그레인(film grain) 효과 또는 hue, 채도(saturation), 대비(contrast) 조정 등의 후처리 효과로, 이 효과를 모두 적용한 결과물을 최종적으로 캔버스에 렌더링합니다.

여기서 어느 정도 `EffectComposer`의 원리를 이해할 필요가 있습니다. `EffectComposer`는 두 개의 [렌더 타겟](threejs-rendertargets.html)을 사용합니다. 편의상 이 둘을 **rtA**, **rtB**라고 부르도록 하죠.

`EffectComposer.addPass`를 각 pass를 적용할 순서대로 호출하고 `EffectComposer.render`를 호출하면 pass*는 아래 그림과 같은 순서로 적용됩니다.

<div class="threejs_center"><img src="resources/images/threejs-postprocessing.svg" style="width: 600px"></div>

먼저 `RenderPass`에 넘긴 장면을 **rtA**에 렌더링합니다. 그리고 **rtA**를 다음 pass에 넘겨주면 해당 pass는 **rtA**에 pass를 적용한 결과를 **rtB**에 렌더링합니다. 그런 다음 **rtB**를 다음 pass로 넘겨 적용한 결과를 **rtA**에, **rtA**에 pass를 적용한 결과를 다시 **rtB**에, 이런 식으로 모든 pass가 끝날 때까지 계속 반복합니다.

`Pass`에는 공통적으로 4가지 옵션이 있습니다.

## `enabled`

이 pass를 사용할지의 여부입니다.

## `needsSwap`

이 pass를 적용한 후 `rtA`와 `rtB`를 바꿀지의 여부입니다.

## `clear`

이 pass를 적용하기 전에 화면을 초기화할지의 여부입니다.

## `renderToScreen`

지정한 렌더 타겟이 아닌 캔버스에 렌더링할지의 여부입니다. 보통 `EffectComposer`에 추가하는 마지막 pass에 이 옵션을 true로 설정합니다.

간단한 예제를 만들어봅시다. [반응형 디자인에 관한 글](threejs-responsive.html)에서 썼던 예제를 가져오겠습니다.

추가로 먼저 `EffectComposer` 인스턴스를 생성합니다.

```js
const composer = new EffectComposer(renderer);
```

다음으로 `RenderPass`를 첫 pass로 추가합니다. 이 pass는 넘겨 받은 장면을 첫 렌더 타겟에 렌더링할 겁니다.

```js
composer.addPass(new RenderPass(scene, camera));
```

다음으로 `BloomPass`를 추가합니다. `BloomPass`는 장면을 원래의 장면보다 작게 렌더링해 흐림(blur) 효과를 줍니다. 그리고 효과가 적용된 장면을 원래 장면에 덮어 씌우는 식으로 *블룸* 효과를 구현합니다.

```js
const bloomPass = new BloomPass(
    1,    // 강도
    25,   // 커널(kernel) 크기
    4,    // 시그마 ?
    256,  // 렌더 타겟의 해상도를 낮춤
);
composer.addPass(bloomPass);
```

마지막으로 원본 장면에 노이즈와 스캔라인(scanline)을 추가하는 `FilmPass`를 추가합니다.

```js
const filmPass = new FilmPass(
    0.35,   // 노이즈 강도
    0.025,  // 스캔라인 강도
    648,    // 스캔라인 개수
    false,  // 흑백
);
filmPass.renderToScreen = true;
composer.addPass(filmPass);
```

`filmPass`가 마지막 pass이기에 캔버스에 결과를 바로 렌더링하도록 `renderToScreen` 옵션을 true로 설정했습니다. 이 옵션을 설정하지 않으면 캔버스가 아닌 다음 렌더 타겟에 장면을 렌더링할 거예요.

또 이 클래스들을 사용하기 위해 여러 스크립트를 불러와야 합니다.

```js
import { EffectComposer } from './resources/threejs/r132/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './resources/threejs/r132/examples/jsm/postprocessing/RenderPass.js';
import { BloomPass } from './resources/threejs/r132/examples/jsm/postprocessing/BloomPass.js';
import { FilmPass } from './resources/threejs/r132/examples/jsm/postprocessing/FilmPass.js';
```

대부분의 후처리에는 `EffectComposer.js`와 `RenderPass.js`가 필수입니다.

이제 `WebGLRenderer.render` 대신 `EffectComposer.render`를 사용*하고* `EffectComposer`가 결과물을 캔버스의 크기에 맞추도록 해야 합니다.

```js
-function render(now) {
-  time *= 0.001;
+let then = 0;
+function render(now) {
+  now *= 0.001;  // 초 단위로 변환
+  const deltaTime = now - then;
+  then = now;

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
+    composer.setSize(canvas.width, canvas.height);
  }

  cubes.forEach((cube, ndx) => {
    const speed = 1 + ndx * .1;
-    const rot = time * speed;
+    const rot = now * speed;
    cube.rotation.x = rot;
    cube.rotation.y = rot;
  });

-  renderer.render(scene, camera);
+  composer.render(deltaTime);

  requestAnimationFrame(render);
}
```

`EffectComposer.render` 메서드는 인자로 마지막 프레임을 렌더링한 이후의 시간값인 `deltaTime`을 인자로 받습니다. pass에 애니메이션이 필요할 경우를 대비해 이 값을 넘겨주기 위해서이죠. 예제의 경우에는 `FilmPass`에 애니메이션이 있습니다.

{{{example url="../threejs-postprocessing.html" }}}

런타임에 효과의 속성을 변경할 때는 보통 uniform의 value 값을 바꿉니다. GUI를 추가해 이 속성을 조정할 수 있게 만들어보죠. 어떤 속성을 어떻게 조작할 수 있는지는 해당 효과의 소스 코드를 열어봐야 알 수 있습니다.

[`BloomPass.js`](https://github.com/mrdoob/three.js/blob/master/examples/js/postprocessing/BloomPass.js)에서
아래 코드를 찾았습니다.

```js
this.copyUniforms[ "opacity" ].value = strength;
```

아래처럼 하면 강도를 런타임에 바꿀 수 있겠네요.

```js
bloomPass.copyUniforms.opacity.value = someValue;
```

마찬가지로 [`FilmPass.js`](https://github.com/mrdoob/three.js/blob/master/examples/js/postprocessing/FilmPass.js)에서
아래 코드를 찾았습니다.

```js
if ( grayscale !== undefined )	this.uniforms.grayscale.value = grayscale;
if ( noiseIntensity !== undefined ) this.uniforms.nIntensity.value = noiseIntensity;
if ( scanlinesIntensity !== undefined ) this.uniforms.sIntensity.value = scanlinesIntensity;
if ( scanlinesCount !== undefined ) this.uniforms.sCount.value = scanlinesCount;
```

이제 어떻게 값을 지정해야 하는지 알았으니 이 값을 조작하는 GUI를 만들어봅시다.

```js
import { GUI } from '../3rdparty/dat.gui.module.js';
```

일단 모듈을 로드합니다.

```js
const gui = new GUI();
{
  const folder = gui.addFolder('BloomPass');
  folder.add(bloomPass.copyUniforms.opacity, 'value', 0, 2).name('strength');
  folder.open();
}
{
  const folder = gui.addFolder('FilmPass');
  folder.add(filmPass.uniforms.grayscale, 'value').name('grayscale');
  folder.add(filmPass.uniforms.nIntensity, 'value', 0, 1).name('noise intensity');
  folder.add(filmPass.uniforms.sIntensity, 'value', 0, 1).name('scanline intensity');
  folder.add(filmPass.uniforms.sCount, 'value', 0, 1000).name('scanline count');
  folder.open();
}
```

이제 각 설정을 조작할 수 있습니다.

{{{example url="../threejs-postprocessing-gui.html" }}}

여기까지 잘 따라왔다면 이제 효과를 직접 만들어볼 수 있습니다.

후처리 효과는 쉐이더를 사용합니다. 쉐이더는 [GLSL (Graphics Library Shading Language)](https://www.khronos.org/files/opengles_shading_language.pdf)이라는 언어를 사용하죠. 언어가 방대해 이 글에서 전부 다루기는 어렵습니다. 기초부터 알아보고 싶다면 [이 글](https://webglfundamentals.org/webgl/lessons/ko/webgl-shaders-and-glsl.html)과 [쉐이더란 무엇인가(The Book of Shaders)](https://thebookofshaders.com/)를 읽어보기 바랍니다.

직접 예제를 만들어보는 게 도움이 될 테니 간단한 GLSL 후처리 쉐이더를 만들어봅시다. 이미지에 특정 색을 혼합하는 쉐이더를 만들 겁니다.

Three.js에는 후처리를 도와주는 `ShaderPass` 헬퍼 클래스가 있습니다. 인자로 vertex 쉐이더, fragment 쉐이더, 기본값으로 이루어진 객체를 받죠. 이 클래스는 이전 pass의 결과물에서 어떤 텍스처를 읽을지, 그리고 `EffectComposer`의 렌더 타겟과 캔버스 중 어디에 렌더링할지를 결정할 겁니다.

아래는 이전 pass의 결과물에 특정 색을 혼합하는 간단한 후처리 쉐이더입니다.

```js
const colorShader = {
  uniforms: {
    tDiffuse: { value: null },
    color:    { value: new THREE.Color(0x88CCFF) },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform sampler2D tDiffuse;
    uniform vec3 color;
    void main() {
      vec4 previousPassColor = texture2D(tDiffuse, vUv);
      gl_FragColor = vec4(
          previousPassColor.rgb * color,
          previousPassColor.a);
    }
  `,
};
```

위 코드에서 `tDiffuse`는 이전 pass의 결과물을 받아오기 위한 것으로 거의 모든 경우에 필수입니다. 그리고 그 바로 밑에 `color` 속성을 Three.js의 `Color`로 선언했습니다.

다음으로 vertex 쉐이더를 작성해야 합니다. 위 코드에서 작성한 vertex 쉐이더는 후처리에서 거의 표준처럼 사용하는 코드로, 대부분의 경우 바꿀 필요가 없습니다. 뭔가 많이 설정한 경우(아까 언급한 링크 참조)가 아니라면 `uv`, `projectionMatrix`, `modelViewMatrix`, `position` 변수는 Three.js가 알아서 넣어줍니다.

마지막으로 fragment 쉐이더를 생성합니다. 아래 코드로 이전 pass에서 넘겨준 결과물의 픽셀 색상값을 가져올 수 있습니다.

```glsl
vec4 previousPassColor = texture2D(tDiffuse, vUv);
```

여기에 지정한 색상을 곱해 `gl_FragColor`에 결과를 저장합니다.

```glsl
gl_FragColor = vec4(
    previousPassColor.rgb * color,
    previousPassColor.a);
```

추가로 간단한 GUI를 만들어 rgb의 각 색상값을 조정할 수 있도록 합니다.

```js
const gui = new GUI();
gui.add(colorPass.uniforms.color.value, 'r', 0, 4).name('red');
gui.add(colorPass.uniforms.color.value, 'g', 0, 4).name('green');
gui.add(colorPass.uniforms.color.value, 'b', 0, 4).name('blue');
```

색을 혼합하는 간단한 후처리 쉐이더를 완성했습니다.

{{{example url="../threejs-postprocessing-custom.html" }}}

언급했듯 이 글에서 GLSL의 작성법과 사용자 지정 쉐이더를 만드는 법을 모두 다루기는 무리입니다. WebGL이 어떻게 동작하는지 알고 싶다면 [이 시리즈](https://webglfundamentals.org)를 참고하세요. [Three.js의 후처리 쉐이더 소스 코드](https://github.com/mrdoob/three.js/tree/master/examples/js/shaders)를 분석하는 것도 좋은 방법입니다. 상대적으로 복잡한 쉐이더도 있지만 작은 것부터 차근차근 살펴본다면 언젠가 전체를 이해할 수 있을 거예요.

아쉽게도 Three.js의 후처리 효과 대부분은 공식 문서가 없어 [예제를 참고하거나](https://github.com/mrdoob/three.js/tree/master/examples) [후처리 효과의 소스 코드](https://github.com/mrdoob/three.js/tree/master/examples/js/postprocessing)를 직접 분석해야 합니다. 부디 이 글과 이 시리즈의 [렌더 타겟에 관한 글](threejs-rendertargets.html)이 좋은 출발점을 마련해주었으면 좋겠네요.
