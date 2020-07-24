Title: 쉐이더토이(Shadertoy) 활용하기
Description: Three.js에서 쉐이더토이의 쉐이더를 사용하는 법을 알아봅니다
TOC: 쉐이더토이 쉐이더 활용하기

[쉐이더토이(Shadertoy)](https://shadertoy.com)는 다양한 쉐이더를 제공하는 유명한 사이트입니다. 시리즈를 진행하다보니 쉐이더토이에서 받은 쉐이더를 Three.js에 적용하는 법을 물어보시는 분들이 꽤 있더군요.

하지만 쉐이더**토이**라고 불리는 데는 이유가 있습니다. 쉐이더토이에 올라온 쉐이더는 정석대로 만들어진 쉐이더가 아닙니다. [드위터(dwitter)](https://dwitter.net)(140자 내로 코드를 작성하는 사이트)나 [js13kGames](https://js13kgames.com)(13kb 이하의 게임을 만드는 사이트)처럼 여러 사람이 쉐이더-챌린지를 진행하는 곳이죠.

쉐이더토이의 미션은 *주어진 픽셀 위치값으로 무언가 재밌는 것을 렌더링하는 함수를 만드는 것*입니다. 재밌는 미션이고 많은 결과물을 보면 대단하다는 소리가 절로 나옵니다. 하지만 초보자가 보고 배우기에 좋은 예제들은 아니죠.

아래의 [쉐이더로 도시 전체를 렌더링한 쉐이더토이 예제](https://www.shadertoy.com/view/XtsSWs)를 한 번 봅시다.

<div class="threejs_center"><img src="resources/images/shadertoy-skyline.png"></div>

제 컴퓨터에서 FHD 해상도를 기준으로 약 5 프레임 내외가 나옵니다. 이를 [시티즈: 스카이라인(Cities: Skylines)](https://store.steampowered.com/app/255710/Cities_Skylines/) 같은 게임과 비교해보면

<div class="threejs_center"><img src="resources/images/cities-skylines.jpg" style="width: 600px;"></div>

같은 컴퓨터에서 30-60 프레임이 나옵니다. 이 게임이 텍스처를 입힌 삼각형을 렌더링하는 등 좀 더 일반적인 기법을 사용했기 때문이죠.

뭐 그렇다고 해도 쉐이더토이의 쉐이더를 Three.js에 한 번 불러와보는 건 나쁘지 않을 겁니다.

아래는 쉐이더토이에서 ["New"를 클릭했을 때](https://www.shadertoy.com/new) 나오는 기본 쉐이더입니다(2019년 1월 기준).

```glsl
// By iq: https://www.shadertoy.com/user/iq  
// license: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;

    // Time varying pixel color
    vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));

    // Output to screen
    fragColor = vec4(col,1.0);
}
```

여기서 중요한 건 쉐이더는 GLSL(Graphic Library Shading Language)로 작성한다는 겁니다. GLSL은 3D 수학을 위해 C 언어 기반으로 고안된 상위 언어로, GLSL만의 고유한 타입이 있습니다. 위 코드의 `vec4`, `vec2`, `vec3`이 그런 고유 타입들이죠. `vec2`는 값이 2개, `vec3`는 3개, `vec4`는 4개인데, 이들은 각각 다양한 값으로 사용되지만 `x`, `y`, `z` 그리고 `w`로 사용하는 게 보통입니다.

```glsl
vec4 v1 = vec4(1.0, 2.0, 3.0, 4.0);
float v2 = v1.x + v1.y;  // adds 1.0 + 2.0
```

GLSL은 자바스크립트와 달리 C나 C++처럼 변수를 선언할 때 해당 타입을 사용해야 합니다. 예를 들어 실수(float)를 변수에 담을 때 자바스크립트는 `var v = 1.2;`와 같이 쓰지만, GLSL에서는 `float v = 1.2;`와 같이 씁니다.

이 글에서 GLSL을 자세히 설명하는 건 주제에 벗어나니 [이 글](https://webglfundamentals.org/webgl/lessons/ko/webgl-shaders-and-glsl.html)을 읽어보거나 [이 시리즈](https://thebookofshaders.com/?lan=kr)를 정주행해보기 바랍니다.

또한 2019년 1월 기준으로 [쉐이더토이](https://shadertoy.com)는 *fragment shaders*만 지원합니다. fragment shader는 아까 말한 미션처럼 픽셀의 좌표를 받아 해당 픽셀에 특정 색을 지정하는 역할을 하죠.

위 코드를 보면 `mainImage` 함수에 `fragColor`라는 이름의 `out` 매개변수가 보일 겁니다. `out`은 `output`의 줄임말로, 바로 이 매개변수가 색상값을 지정할 변수 합니다.

`fragCoord`, `in`(`input`의 줄임말) 매개변수는 `out`의 색상값을 사용할 픽셀의 좌표입니다. 이 픽셀 좌표로 새로운 색상값을 만들 수 있죠. 만약 400x300짜리 캔버스에 이 쉐이더를 적용한다면 이 함수는 400x300번, 그러니까 총 120,000번 호출되는 셈입니다.

코드에 선언부가 없긴 하지만 사용할 수 있는 변수가 2개 더 있습니다. 하나는 캔버스의 해상도를 설정하는 `iResolution`으로, 캔버스를 400x300으로 만들려면 `iResolution`을 `400, 300`으로 설정해야 합니다. 그리고 `iResolution`에 의해 픽셀 좌표가 바뀌면 `uv` 변수는 텍스처 크기의 0.0에서 1.0만큼 위, 옆으로 갑니다. 이렇듯 어떤 값을 *정규화(normalize)*하는 것이 작업을 간단히 하는 데 도움이 되기에 쉐이더토이의 주 함수는 대개 저런 식으로 시작합니다.

다른 하나는 `iTime`으로, 이는 페이지가 로드된 이후의 초 단위 시간값입니다.

쉐이더의 세계에서 이 전역 변수들은 *균등(uniform)* 변수라고 불립니다. *균등*이라고 불리는 이유는 쉐이더 한 루프 안에서는 전혀 변하지 않는 변수이기 때문이죠. 다만 위에서 언급한 변수들은 GLSL의 *표준* 변수가 아니라 쉐이더토이에서 자체적으로 제공하는 변수입니다.

[쉐이더토이 공식 문서에는 몇 가지 변수를 더 언급](https://www.shadertoy.com/howto)해 놓았지만, 일단은 위 두 변수를 활용해 예제를 하나 만들어보겠습니다.

먼저 캔버스 전체를 채울 평면을 하나 만듭니다. [배경과 하늘상자 추가하기](threejs-backgrounds.html)에서 정육면체를 뺀 예제를 가져오겠습니다. 코드가 길지 않으니 아래에 전부 적도록 하죠.

```js
function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.autoClearColor = false;

  const camera = new THREE.OrthographicCamera(
    -1, // left
     1, // right
     1, // top
    -1, // bottom
    -1, // near,
     1, // far
  );
  const scene = new THREE.Scene();
  const plane = new THREE.PlaneBufferGeometry(2, 2);
  const material = new THREE.MeshBasicMaterial({
      color: 'red',
  });
  scene.add(new THREE.Mesh(plane, material));

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function render() {
    resizeRendererToDisplaySize(renderer);

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
```

[배경과 하늘상자 추가하기](threejs-backgrounds.html)에서도 설명했지만 위와 같이 `OrthographicCamera`를 설정하면 2칸짜리 평면이 캔버스 전체를 채우게 됩니다. 당장은 평면이 빨간 `MeshBasicMaterial`을 사용했기에 캔버스 전체가 빨갛게 보입니다.

{{{example url="../threejs-shadertoy-prep.html" }}}

이제 쉐이더토이에서 쉐이더를 가져와 적용해봅시다.

```js
const fragmentShader = `
#include <common>

uniform vec3 iResolution;
uniform float iTime;

// By iq: https://www.shadertoy.com/user/iq  
// license: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;

    // Time varying pixel color
    vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));

    // Output to screen
    fragColor = vec4(col,1.0);
}

void main() {
  mainImage(gl_FragColor, gl_FragCoord.xy);
}
`;
```

위 코드에서는 아까 설명했던 균등 변수 2개를 선언했습니다. 그런 다음 쉐이더토이에서 만든 GLSL 코드를 복사해 넣었죠. 그리고 하단에서 `mainImage`에 `gl_FragColor`와 `gl_FragCoord.xy`를 넘겨 호출했습니다. 여기서 사용한 `gl_FragColor`는 WebGL의 공식 전역 변수로, 쉐이더는 여기에 해당 픽셀의 색상값을 지정해야 합니다. `gl_FragCoord` 또한 WebGL 공식 전역 변수로, 현재 색상을 적용해야 하는 픽셀의 좌표값을 나타내죠.

다음으로 쉐이더에 데이터를 전달할 전달해야 하니 Three.js 균등 변수를 생성합니다.

```js
const uniforms = {
  iTime: { value: 0 },
  iResolution:  { value: new THREE.Vector3() },
};
```

Three.js의 균등 변수에는 `value` 속성을 넣어야 합니다. 물론 값으로 들어가는 데이터도 균등 변수의 타입과 맞아야 하죠.

fragment 쉐이더와 균등 변수를 `ShaderMaterial`에 넘겨줍니다.

```js
-const material = new THREE.MeshBasicMaterial({
-    color: 'red',
-});
+const material = new THREE.ShaderMaterial({
+  fragmentShader,
+  uniforms,
+});
```

또한 매 프레임마다 균등 변수의 값을 변경하도록 합니다.

```js
-function render() {
+function render(time) {
+  time *= 0.001;  // 초 단위로 변환

  resizeRendererToDisplaySize(renderer);

+  const canvas = renderer.domElement;
+  uniforms.iResolution.value.set(canvas.width, canvas.height, 1);
+  uniforms.iTime.value = time;

  renderer.render(scene, camera);

  requestAnimationFrame(render);
}
```

> 참고: [쉐이더토이 공식 문서](https://www.shadertoy.com/howto)를 뒤져봤지만 `iResolution`가 왜 `vec3`여야 하는지, 3번째 값은 어디에 쓰이는 건지 알아내지 못했습니다. 일단 예제에서는 쓰지 않는 값이니 1로 설정하고 넘어가야겠네요. ¯＼\_(ツ)\_/¯

{{{example url="../threejs-shadertoy-basic.html" }}}

[쉐이더토이에서 "New"를 클릭했을 때 나왔던 결과](https://www.shadertoy.com/new)와 똑같네요. 물론 2019년 1월 기준으로 말이죠😉. 이 쉐이더는 어떻게 이런 결과를 만들어낸 걸까요?

* `uv`가 시간에 따라 서서히 0에서 1로 바뀝니다.
* `cos(uv.xyx)`는 입력한 값에 코사인 함수를 적용해 `vec3` 형식으로 반환합니다. 하나는 `uv.x`에, 다른 하나는 `uv.y`에, 마지막은 다시 `uv.x`에 코사인 함수를 실행한 결과값이죠.
* 이전에 `cos(iTime+uv.xyx)` 이렇게 시간값을 더해 애니메이션을 구현합니다.
* 이전에 `vec3(0,2,4)`를 더해 `cos(iTime+uv.xyx+vec3(0,2,4))`와 같이 하면 코사인 파도가 생깁니다.
* `cos`의 결과값은 -1부터 1까지이므로, `0.5 * 0.5 + cos(...)`을 적용하면 -1 <-> 1, 0.0 <-> 1.0 이런 식으로 바뀝니다.
* 이 결과값을 현재 픽셀에 대한 RGB 값으로 씁니다.

코드를 조금 수정하면 코사인 파도가 더 잘 보일 겁니다. 지금은 `uv`의 값이 0부터 1까지죠. 코사인의 주기는 2π이니 `uv`에 40.0을 곱해 `uv`값이 0부터 40까지 되도록 해보겠습니다. 이러면 화면에 파도가 약 6.3번 반복될 거예요.

```glsl
-vec3 col = 0.5 + 0.5 * cos(iTime + uv.xyx + vec3(0,2,4));
+vec3 col = 0.5 + 0.5 * cos(iTime + uv.xyx * 40.0 + vec3(0,2,4));
```

아래 예제를 보니 파도가 약 6개 하고 1/3 정도 보입니다. 파란선 사이에 빨간선이 보이는 건 파란색의 위치를 `+ vec3(0,2,4)`로 4만큼 옮겼기 때문이죠. 이렇게 하지 않았다면 빨강과 파랑이 완전히 겹쳐 자주색으로 보였을 겁니다.

{{{example url="../threejs-shadertoy-basic-x40.html" }}}

주어지는 값이 이렇게 단순한데 이걸로 [도심 운하](https://www.shadertoy.com/view/MdXGW2), [숲](https://www.shadertoy.com/view/4ttSWf), [달팽이](https://www.shadertoy.com/view/ld3Gz2), [버섯](https://www.shadertoy.com/view/4tBXR1) 등을 구현하다니 정말 놀랍네요. 다만 삼각형으로 장면을 구성하는 일반적인 방법에 비해 왜 이 방법이 안 좋은지 분명히 하지 않은 게 아쉽습니다. 한 픽셀 한 픽셀 정성들여 픽셀의 색상을 연산하니 그만큼 한 프레임을 만드는 데 시간이 많이 걸릴 수밖에 없죠.

쉐이더토이 쉐이더 중에는 [텍스처를 받아서 사용하는 경우](https://www.shadertoy.com/view/MsXSzM)도 있습니다.

```glsl
// By Daedelus: https://www.shadertoy.com/user/Daedelus
// license: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
#define TIMESCALE 0.25 
#define TILES 8
#define COLOR 0.7, 1.6, 2.8

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 uv = fragCoord.xy / iResolution.xy;
	uv.x *= iResolution.x / iResolution.y;
	
	vec4 noise = texture2D(iChannel0, floor(uv * float(TILES)) / float(TILES));
	float p = 1.0 - mod(noise.r + noise.g + noise.b + iTime * float(TIMESCALE), 1.0);
	p = min(max(p * 3.0 - 1.8, 0.1), 2.0);
	
	vec2 r = mod(uv * float(TILES), 1.0);
	r = vec2(pow(r.x - 0.5, 2.0), pow(r.y - 0.5, 2.0));
	p *= 1.0 - pow(min(1.0, 12.0 * dot(r, r)), 2.0);
	
	fragColor = vec4(COLOR, 1.0) * p;
}
```

쉐이더에 텍스처를 넘겨주는 건 [재질(material)에 텍스처를 넘겨주는 것](threejs-textures.html)과 비슷하나, 대신 텍스처를 균등 변수에 지정해야 합니다.

먼저 쉐이더에 균등 변수를 추가합니다. 텍스처는 GLSL에서 `sampler2D`라고 불립니다.

```js
const fragmentShader = `
#include <common>

uniform vec3 iResolution;
uniform float iTime;
+uniform sampler2D iChannel0;

...
```

다음으로 [이 글](threejs-textures.html)에서 했던 것처럼 텍스처를 불러와 균등 변수에 지정합니다.

```js
+const loader = new THREE.TextureLoader();
+const texture = loader.load('resources/images/bayer.png');
+texture.minFilter = THREE.NearestFilter;
+texture.magFilter = THREE.NearestFilter;
+texture.wrapS = THREE.RepeatWrapping;
+texture.wrapT = THREE.RepeatWrapping;
const uniforms = {
  iTime: { value: 0 },
  iResolution:  { value: new THREE.Vector3() },
+  iChannel0: { value: texture },
};
```

{{{example url="../threejs-shadertoy-bleepy-blocks.html" }}}

여태까지는 [쉐이더토이 사이트](https://shadertoy.com)에 나와있는 대로 캔버스 전체에 쉐이더를 구현했습니다. 하지만 쉐이더를 사용할 때 꼭 예제 형식에 얽매일 필요는 없겠죠. 쉐이더토이의 작가들은 대부분 `fragCoord`와 `iResolution`을 사용한다는 것만 기억하면 됩니다. `fragCoord`가 꼭 픽셀의 좌표여야할 이유는 없다는 말입니다. 이를 텍스처 좌표로 바꿔 쉐이더를 텍스처처럼 사용할 수도 있죠. 이렇게 쉐이더 함수로 텍스처를 만드는 기법을 [*절차적 텍스처(procedural texture)*](https://www.google.com/search?q=procedural+texture)라고 합니다.

예제에 이 기법을 적용해봅시다. Three.js에서 텍스처 좌표를 받아 여기에 `iResolution`을 곱해 `fragCoord`에 넘기는 게 제일 간단할 듯하네요.

먼저 fragment 쉐이더에서 쓸 *varying*을 추가합니다. varying은 vertex(정점) 쉐이더에서 fragment 쉐이더에 넘겨주는 값으로, 각 정점 사이를 보간한(점진적으로 채운(varied)) 값입니다. Three.js가 텍스처 좌표를 `uv` 앞에 *varying*을 이니셜인 `v`를 붙여 표시하니 그 이름을 그대로 사용하겠습니다.

```glsl
...

+varying vec2 vUv;

void main() {
-  mainImage(gl_FragColor, gl_FragCoord.xy);
+  mainImage(gl_FragColor, vUv * iResolution.xy);
}
```

추가로 vertex 쉐이더를 만들어야 합니다. 아래는 가장 간단한 형태의 Three.js vertex 쉐이더로, `uv`, `projectionMatrix`, `modelViewMatrix`, `position` 등의 변수는 Three.js가 선언해줄 겁니다.

```js
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
`;
```

vertex 쉐이더도 같이 `ShaderMaterial`에 넘겨줍니다.

```js
const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms,
});
```

텍스처의 크기는 바뀔 일이 없으니 `iResolution` 균등 변수의 초기값을 미리 설정합니다.

```js
const uniforms = {
  iTime: { value: 0 },
-  iResolution:  { value: new THREE.Vector3() },
+  iResolution:  { value: new THREE.Vector3(1, 1, 1) },
  iChannel0: { value: texture },
};
```

`render` 함수 안에 있던 코드도 삭제합니다.

```js
-const canvas = renderer.domElement;
-uniforms.iResolution.value.set(canvas.width, canvas.height, 1);
uniforms.iTime.value = time;
```

여기에 [반응형 디자인에 관한 글](threejs-responsive.html)에서 카메라와 회전하는 정육면체 3개를 가져왔습니다. 이제 한 번 실행해보죠.

{{{example url="../threejs-shadertoy-as-texture.html" }}}

이 글이 Three.js에서 쉐이더토이의 쉐이더를 활용하는 데 도움이 되었으면 합니다. 누차 말하지만 쉐이더토이의 쉐이더는 실제 사용하기 위해 제작되었다기보다-함수 하나로 모든 요소를 만드는-연습용 챌린지에 가깝습니다. 하지만 그래도 쉐이더토이에 올라온 쉐이더들은 여전히 인상 깊고, 놀랍습니다. 배울 점도 굉장히 많죠.
