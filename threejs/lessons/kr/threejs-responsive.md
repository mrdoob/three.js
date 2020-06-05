Title: Three.js 반응형 디자인
Description: Three.js 프로젝트를 반응형으로 만들기
TOC: 반응형 디자인

Three.js 두 번째 튜토리얼에 오신 것을 환영합니다!
첫 번째 튜토리얼은 [Three.js의 기초](threejs-fundamentals.html)에 관한 내용이었죠.
아직 이전 장을 보지 않았다면 이전 글을 먼저 읽어보길 추천합니다.

이 장에서는 Three.js 앱을 어떤 환경에서든 구동할 수 있도록
반응형으로 만드는 법에 대해 알아볼 것입니다. 웹에서 반응형이란
웹 페이지를 PC, 타블렛, 스마트폰 등 다양한 환경에서 이용하기
용이하도록 사이즈에 맞춰 콘텐츠를 최적화하는 것을 의미하죠.

Three.js의 경우 일반 웹보다 고려해야할 요소가 많습니다.
예를 들어 상하좌우에 컨트롤 패널이 있는 3D 에디터라든가,
문서 사이에 들어가는 동적 그래프를 상상해볼 수 있죠.

이전 글에서는 사이즈나 CSS 스타일을 정의하지 않은 canvas를 썼었죠.

```html
<canvas id="c"></canvas>
```

canvas 요소는 기본적으로 300x150 픽셀입니다.

웹에서 어떤 요소의 크기를 지정할 때는 보통 CSS를 권장하죠.

canvas가 페이지 전체를 차지하도록 CSS를 작성해봅시다.

```html
<style>
html, body {
   margin: 0;
   height: 100%;
}
#c {
   width: 100%;
   height: 100%;
   display: block;
}
</style>
```

body 요소는 기본적으로 5픽셀의 margin이 지정되어 있으니 `margin: 0`으로
설정해 여백을 모두 없애줍니다. html과 body 요소의 높이를 지정하지 않으면
컨텐츠의 높이만큼만 커지니, 높이를 100%로 맞춰 창 전체를 채우도록 합니다.

그리고 `id=c`인 요소의 크기를 100%로 지정해 컨테이너, 이 예제에서는 body
요소의 크기와 동일하게 맞춥니다.

canvas 요소의 기본 `display` 속성은 `inline`입니다. `inline` 속성은 글자
처럼 취급되어 흰 공백을 남길 수 있으니 `display` 속성을 `block`으로 지정합니다.

아래는 이전 장에서 만든 예제에 방금 작성한 CSS 스타일을 덧붙인 것입니다.

{{{example url="../threejs-responsive-no-resize.html" }}}

canvas가 창 전체를 채우긴 했지만 문제가 좀 있네요. 정육면체가 창 크기에
따라 늘어나 정육면체라기보다 너무 길거나 넓은 육면체처럼 보입니다. 예제를
새 창에서 열어 창 크기를 조절해보세요. 정육면체가 어떻게 변하는지 확인할
수 있을 겁니다.

<img src="resources/images/resize-incorrect-aspect.png" width="407" class="threejs_center nobg">

또 다른 문제는 저화질, 그러니까 깨지고 흐릿하게 보인다는 점입니다.
창을 아주 크게 조절하면 문제를 바로 알 수 있을 거에요.

<img src="resources/images/resize-low-res.png" class="threejs_center nobg">

창 크기에 따라 늘어나는 문제부터 해결해봅시다. 먼저 카메라의 aspect(비율)
속성을 canvas의 화면 크기에 맞춰야 합니다. 이는 canvas의 `clientWidth`와
`clientHeight` 속성을 이용해 간단히 해결할 수 있죠.

그리고 렌더링 함수를 다음처럼 수정합니다.

```js
function render(time) {
  time *= 0.001;

+  const canvas = renderer.domElement;
+  camera.aspect = canvas.clientWidth / canvas.clientHeight;
+  camera.updateProjectionMatrix();

  ...
```

이제 정육면체는 더이상 늘어나거나 찌그러들지 않을 겁니다.

{{{example url="../threejs-responsive-update-camera.html" }}}

예제를 새 창에서 열어 창 크기를 조절해보면, 정육면체의 비율이
창 크기와 상관없이 그대로 유지되는 것을 확인할 수 있을 겁니다.

<img src="resources/images/resize-correct-aspect.png" width="407" class="threejs_center nobg">

이제 계단현상을 없애 봅시다.

canvas 요소에는 두 종류의 크기값이 있습니다. 하나는 아까 CSS로
설정한 canvas 요소의 크기이고, 다른 하나는 canvas 원본 픽셀 수에
대한 값입니다. 예를 들어 128x64 픽셀인 이미지가 있다고 합시다.
우리는 CSS를 이용해 이 이미지 요소를 400x200 픽셀로 보이도록 할 수
있죠. canvas도 마찬가지입니다. 편의상 CSS로 지정한 크기를 디스플레이
크기라고 부르겠습니다.

```html
<img src="128x64이미지.jpg" style="width:400px; height:200px">
```

canvas의 원본 크기, 해상도는 드로잉버퍼(drawingbuffer)라고 불립니다.
Three.js에서는 `renderer.setSize` 메서드를 호출해 canvas의 드로잉버퍼
크기를 지정할 수 있죠. 어떤 크기를 골라야 하냐구요? 당연히 "canvas의
디스플레이 크기"죠! 다시 canvas의 `clientWidth`와 `clientHeight`를
이용합시다.

canvas의 원본 크기와 디스플레이 크기를 비교해 원본 크기를 변경할지 결정하는
함수를 하나 만들어줍니다.

```js
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
```

canvas를 리사이징할 필요가 있는지 검사했다는 점에 주의하세요.
canvas 스펙상 리사이징은 화면을 다시 렌더링해야만 하므로, 같은
사이즈일 때는 리사이징을 하지 않으므로써 불필요한 자원 낭비를
막는 것이 좋습니다.

canvas의 크기가 다르다면, `renderer.setSize` 메서드를 호출해
새로운 width와 height를 넘겨줍니다. `renderer.setSize` 메서드는
기본적으로 CSS의 크기를 설정하니 마지막 인자로 `false`를 넘겨주는
것을 잊지 마세요. canvas가 다른 요소와 어울리려면 Three.js에서
CSS를 제어하는 것 보다 다른 요소들처럼 CSS로 제어하는 것이 일관성
있는 프로그래밍일 테니까요.

위 함수는 canvas를 리사이징했으면 `true`를 반환합니다. 이 값을
이용해 다른 요소들이 업데이트 해야 할지도 결정할 수 있겠네요.
새로 만든 함수를 이용해 `render` 함수를 수정합시다.

```js
function render(time) {
  time *= 0.001;

+  if (resizeRendererToDisplaySize(renderer)) {
+    const canvas = renderer.domElement;
+    camera.aspect = canvas.clientWidth / canvas.clientHeight;
+    camera.updateProjectionMatrix();
+  }

  ...
```

canvas의 비율이 변하려면 canvas의 사이즈가 변해야 하므로,
`resizeRendererToDisplaySize` 함수가 `true`를 반환했을 때만
카메라의 비율을 변경합니다.

{{{example url="../threejs-responsive.html" }}}

이제 디스플레이 크기에 맞는 해상도로 렌더링될 겁니다.

CSS가 디스플레이 크기를 제어하도록 해야 한다는 주장을 보충해보겠습니다.
일단 이 코드를 [별도의 js 파일](../threejs-responsive.js)로 저장해주세요.
아래의 예시들은 CSS가 디스플레이 크기를 제어하도록 한 예시입니다.
잘 살펴보면 추가로 다른 코드를 써야할 필요가 없다는 걸 알 수 있죠.

먼저 canvas를 텍스트 사이에 끼워 넣어보죠.

{{{example url="../threejs-responsive-paragraph.html" startPane="html" }}}

다음은 우측 컨트롤 패널 크기를 조정할 수 있는 에디터 형태의
레이아웃에서 활용한 예시입니다.

{{{example url="../threejs-responsive-editor.html" startPane="html" }}}

HTML, CSS만 바뀌고 자바스크립트 코드는 한 줄도 바뀌지 않았습니다.

## HD-DPI 디스플레이 다루기

HD-DPI는 고해상도(high-density dot per inch)의 줄임말입니다.
많은 Windows 기기나 맥, 스마트폰이 이 디스플레이를 사용하죠(스마트폰의
실제 화면 크기가 데스크탑에 비해 훨씬 작지만, 해상도는 비슷한 경우를
생각하면 됩니다. 한 픽셀을 선명하게 표현하기 위해 다수의 작은 픽셀을
넣는 것. 역주).

브라우저에서는 이에 대응하기 위해 픽셀의 집적도에 상관 없이
CSS 픽셀을 이용해 요소의 크기를 지정합니다. 스마트폰이든,
데스크탑이든 브라우저는 요소를 같은 크기로 좀 더 촘촘하게
할 뿐이죠.

Three.js로 HD-DPI를 다루는 방법은 아주 다양합니다.

첫째는 아무것도 하지 않는 것입니다. 3D 렌더링은 많은 GPU 자원을
소모하기 때문에 아마 가장 흔한 경우일 겁니다. 2018년의 이야기이긴
하지만, 모바일 기기는 데스크탑에 비해 GPU 성능이 부족함에도 더 높은
해상도를 가진 경우가 대부분입니다. 현재 플래그쉽 스마트폰은 HD-DPI
약 3배의 해상도를 지녔습니다. 쉽게 말해 HD-DPI가 아닌 기기와 비교했을
때 한 픽셀 당 픽셀 수가 1:9라는 것이고 이는 9배나 더 많은 렌더링
작업을 처리해야 한다는 것을 의미하죠.

9배 많은 픽셀을 처리하는 건 굉장히 까다로운 작업이지만, 만약 코드를
저대로 내버려 둔다면 우리의 코드가 1픽셀을 계산할 때마다 브라우저는
해당 픽셀보다 3배 큰 픽셀을 렌더링해야 합니다(3배 곱하기 3배 = 9배 많은 픽셀).

이는 낮은 FPS, 즉 화면이 버벅거리게 만들 것이므로 무거운 Three.js
앱을 만들 때는 지양해야 하는 요소이죠.

물론 지양해야 한다는 건 기기의 해상도에 따라 화면을 렌더링할
다른 방법들이 더 있다는 의미입니다.

하나는 `rederer.setPixelRatio` 메서드를 이용해 해상도 배율을 알려주는
것입니다. 브라우저로부터 CSS 픽셀과 실제 기기 픽셀의 배율을 받아
Three.js에게 넘겨주는 것이죠.

```js
    renderer.setPixelRatio(window.devicePixelRatio);
```

그러면 `renderer.setSize`는 이제 알아서 사이즈에 배율을 곱해
리사이징할 것입니다....만 **이 방법은 추천하지 않습니다**.

다른 방법은 canvas를 리사이징할 때 직접 계산하는 것입니다.

```js
    function resizeRendererToDisplaySize(renderer) {
      const canvas = renderer.domElement;
      const pixelRatio = window.devicePixelRatio;
      const width  = canvas.clientWidth  * pixelRatio | 0;
      const height = canvas.clientHeight * pixelRatio | 0;
      const needResize = canvas.width !== width || canvas.height !== height;
      if (needResize) {
        renderer.setSize(width, height, false);
      }
      return needResize;
    }
```

객관적으로 따져봐도 이 방법이 훨씬 낫습니다. 이 방법으로는 개발자가
원하는 결과가 나오니까요. Three.js로 앱을 만들 때 언제 canvas의
드로잉버퍼 사이즈를 알아야 할지 특정하기란 어렵습니다. 예를 들어 전처리
필터를 만든다거나, `gl_FragCoord`에 접근하는 쉐이더를 만든다거나,
스크린샷을 찍는다거나, GPU가 관여하는 픽셀 수를 가져 온다거나, 


This second way is objectively better. Why? Because it means I get what I ask for.
There are many cases when using three.js where we need to know the actual
size of the canvas's drawingBuffer. For example when making a post processing filter,
or if we are making a shader that accesses `gl_FragCoord`, if we are making
a screenshot, or reading pixels for GPU picking, for drawing into a 2D canvas,
etc... There many many cases where if we use `setPixelRatio` then our actual size will be different
than the size we requested and we'll have to guess when to use the size
we asked for and when to use the size three.js is actually using.
By doing it ourselves we always know the size being used is the size we requested.
There is no special case where magic is happening behind the scenes.

Here's an example using the code above.

{{{example url="../threejs-responsive-hd-dpi.html" }}}

It might be hard to see the difference but if you have an HD-DPI
display and you compare this sample to those above you should
notice the edges are more crisp.

This article covered a very basic but fundamental topic. Next up lets quickly
[go over the basic primitives that three.js provides](threejs-primitives.html).