Title: Three.js 팁
Description: Three.js를 쓸 때 필요할 수도 있는 것들
TOC: #

이 글은 Three.js의 팁에 관한 글들 중 너무 짧아 별도의 글로 분리하기 애매한 글들을 묶은 것입니다.

---

<a id="screenshot" data-toc="스크린샷 찍기"></a>

# 캔버스의 스크린샷 찍기

브라우저에서 스크린샷을 찍을 수 있는 방법은 2가지 정도가 있습니다. 예전부터 사용하던 [`canvas.toDataURL`](https://developer.mozilla.org/ko/docs/Web/API/HTMLCanvasElement/toDataURL)과, 새로 등장한 [`canvas.toBlob`](https://developer.mozilla.org/ko/docs/Web/API/HTMLCanvasElement/toBlob)이 있죠.

그냥 메서만 호출하면 되는 거라니, 얼핏 쉬워 보입니다. 아래 정도의 코드면 손쉽게 스크린샷을 찍을 수 있을 것 같네요.

```html
<canvas id="c"></canvas>
+<button id="screenshot" type="button">Save...</button>
```

```js
const elem = document.querySelector('#screenshot');
elem.addEventListener('click', () => {
  canvas.toBlob((blob) => {
    saveBlob(blob, `screencapture-${ canvas.width }x${ canvas.height }.png`);
  });
});

const saveBlob = (function() {
  const a = document.createElement('a');
  document.body.appendChild(a);
  a.style.display = 'none';
  return function saveData(blob, fileName) {
     const url = window.URL.createObjectURL(blob);
     a.href = url;
     a.download = fileName;
     a.click();
  };
}());
```

아래는 [반응형 디자인](threejs-responsive.html)의 예제에 버튼과 버튼을 꾸밀 CSS를 추가한 예제입니다.

{{{example url="../threejs-tips-screenshot-bad.html"}}}

하지만 막상 스크린샷을 찍어보니 아래와 같은 결과가 나옵니다.

<div class="threejs_center"><img src="resources/images/screencapture-413x313.png"></div>

그냥 텅 빈 이미지네요.

물론 브라우저나/OS에 따라 잘 나오는 경우도 있을 수 있지만 대게의 경우 텅 빈 이미지가 나올 겁니다.

이건 성능 관련 문제입니다. 기본적으로 브라우저는 화면을 렌더링한 후 WebGL 캔버스의 드로잉 버퍼를 바로 비웁니다.

이 문제를 해결하려면 화면을 캡쳐하기 직전에 화면을 렌더링하는 함수를 호출해야 합니다.

예제에서 몇 가지를 수정해야 합니다. 먼저 렌더링 함수를 분리합시다.

```js
+const state = {
+  time: 0,
+};

-function render(time) {
-  time *= 0.001;
+function render() {
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  cubes.forEach((cube, ndx) => {
    const speed = 1 + ndx * .1;
-    const rot = time * speed;
+    const rot = state.time * speed;
    cube.rotation.x = rot;
    cube.rotation.y = rot;
  });

  renderer.render(scene, camera);

-  requestAnimationFrame(render);
}

+function animate(time) {
+  state.time = time * 0.001;
+
+  render();
+
+  requestAnimationFrame(animate);
+}
+requestAnimationFrame(animate);
```

이제 `render` 함수는 오직 화면을 렌더링하는 역할만 하기에, 화면을 캡쳐하기 직전에 `render` 함수를 호출하면 됩니다.

```js
const elem = document.querySelector('#screenshot');
elem.addEventListener('click', () => {
+  render();
  canvas.toBlob((blob) => {
    saveBlob(blob, `screencapture-${ canvas.width }x${ canvas.height }.png`);
  });
});
```

이제 문제 없이 잘 작동할 겁니다.

{{{example url="../threejs-tips-screenshot-good.html" }}}

다른 방법에 대해서는 다음 글을 보기 바랍니다.

---

<a id="preservedrawingbuffer" data-toc="캔버스 초기화 방지하기"></a>

# 캔버스 초기화 방지하기

움직이는 물체로 사용자가 그림을 그리게 한다고 해봅시다. 이걸 구현하려면 `WebGLRenderer`를 생성할 때 `preserveDrawingBuffer: true`를 설정해야 합니다. 또한 Three.js가 캔버스를 초기화하지 않도록 해주어야 하죠.

```js
const canvas = document.querySelector('#c');
-const renderer = new THREE.WebGLRenderer({ canvas });
+const renderer = new THREE.WebGLRenderer({
+  canvas,
+  preserveDrawingBuffer: true,
+  alpha: true,
+});
+renderer.autoClearColor = false;
```

{{{example url="../threejs-tips-preservedrawingbuffer.html" }}}

만약 진짜 드로잉 프로그램을 만들 계획이라면 이 방법은 쓰지 않는 게 좋습니다. 해상도가 변경될 때마다 브라우저가 캔버스를 초기화할 테니까요. 현재 예제에서는 해상도를 캔버스 크기에 맞춰 변경합니다. 그리고 캔버스 크기는 화면 크기에 맞춰 조정되죠. 파일을 다운받거나, 탭을 바꾸거나, 상태표시줄이 추가되는 등 화면 크기가 바뀌는 경우는 다양합니다. 모바일 환경이라면 화면을 회전시키는 경우도 포함되겠죠.

드로잉 프로그램을 만들려면 [렌더 타겟을 이용해 텍스처로 화면을 렌더링](threejs-rendertargets.html)하는 게 좋을 겁니다.

---

<a id="tabindex" data-toc="캔버스에서 키 입력 받기"></a>

# 키 입력 받기

이 시리즈에서는 대부분의 이벤트 리스너를 `canvas`에 추가했습니다. 다른 이벤트는 문제 없이 작동했지만, 딱 하나, 키보드 이벤트는 기본적으로 그냥 동작하지 않았습니다.

키보드 이벤트를 받으려면 해당 요소의 [`tabindex`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/tabIndex)를 0 이상의 값으로 설정해야 합니다.

```html
<canvas tabindex="0"></canvas>
```

하지만 이 속성을 적용하면 새로운 문제가 생깁니다. `tabindex`가 있는 요소는 focus 상태일 때 강조 표시가 적용되거든요. 이 문제를 해결하려면 CSS의 `outline` 속성을 `none`으로 설정해야 합니다.

```css
canvas:focus {
  outline: none;
}
```

간단한 테스트를 위해 캔버스 3개를 만들겠습니다.

```html
<canvas id="c1"></canvas>
<canvas id="c2" tabindex="0"></canvas>
<canvas id="c3" tabindex="1"></canvas>
```

마지막 캔버스에만 CSS를 추가합니다.

```css
#c3:focus {
    outline: none;
}
```

그리고 모든 캔버스에 이벤트 리스너를 추가합니다.

```js
document.querySelectorAll('canvas').forEach((canvas) => {
  const ctx = canvas.getContext('2d');

  function draw(str) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(str, canvas.width / 2, canvas.height / 2);
  }
  draw(canvas.id);

  canvas.addEventListener('focus', () => {
    draw('has focus press a key');
  });

  canvas.addEventListener('blur', () => {
    draw('lost focus');
  });

  canvas.addEventListener('keydown', (e) => {
    draw(`keyCode: ${e.keyCode}`);
  });
});
```

첫 번째 캔버스에는 아무리 해도 키보드 이벤트가 발생하지 않을 겁니다. 두 번째 캔버스는 키보드 이벤트를 받긴 하지만 강조 표시가 생기죠. 대신 세 번째 캔버스에서는 두 문제가 발생하지 않습니다.

{{{example url="../threejs-tips-tabindex.html"}}}

---

<a id="transparent-canvas" data-toc="캔버스를 투명하게 만들기"></a>
 
# 캔버스를 투명하게 만들기

아무런 설정을 하지 않는다면 Three.js는 기본적으로 캔버스를 불투명하게 렌더링합니다. 캔버스를 투명하게 만들려면 `WebGLRenderer`를 생성할 때 [`alpha: true`](WebGLRenderer.alpha)를 넘겨줘야 하죠.

```js
const canvas = document.querySelector('#c');
-const renderer = new THREE.WebGLRenderer({ canvas });
+const renderer = new THREE.WebGLRenderer({
+  canvas,
+  alpha: true,
+});
```

또한 캔버스가 premultiplied 알파(미리 계산된 alpha 값, straight alpha 또는 associated alpha라고도 불림)를 사용하지 **않도록** 하게끔 하려면 아래처럼 값을 설정해줘야 합니다.

```js
const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
+  premultipliedAlpha: false,
});
```

Three.js는 기본적으로 캔버스에는 [`premultipliedAlpha: true`](WebGLRenderer.premultipliedAlpha)를 사용하지만 재질(material)에는 [`premultipliedAlpha: false`](Material.premultipliedAlpha)를 사용합니다.

premultiplied alpha를 어떻게 사용해야 하는지 알고 싶다면 [여기 이 글](https://developer.nvidia.com/content/alpha-blending-pre-or-not-pre)\*을 참고하기 바랍니다.


※ 영어이니 읽기가 어렵다면 그냥 구글에 premultiplied alpha를 검색하는 것을 추천합니다. 역주.

어쨌든 이제 한 번 투명 캔버스 예제를 만들어보죠.

[반응형 디자인](threejs-responsive.html)에서 가져온 예제에 저 설정을 적용했습니다. 추가로 재질도 똑같이 투명하게 만들어보죠.

```js
function makeInstance(geometry, color, x) {
-  const material = new THREE.MeshPhongMaterial({ color });
+  const material = new THREE.MeshPhongMaterial({
+    color,
+    opacity: 0.5,
+  });

...

```

여기에 HTML로 텍스트를 추가합니다.

```html
<body>
  <canvas id="c"></canvas>
+  <div id="content">
+    <div>
+      <h1>Cubes-R-Us!</h1>
+      <p>We make the best cubes!</p>
+    </div>
+  </div>
</body>
```

캔버스를 앞에 둬야 하니 CSS도 추가합니다.

```css
body {
    margin: 0;
}
#c {
    width: 100vw;
    height: 100vh;
    display: block;
+    position: fixed;
+    left: 0;
+    top: 0;
+    z-index: 2;
+    pointer-events: none;
}
+#content {
+  font-size: 7vw;
+  font-family: sans-serif;
+  text-align: center;
+  width: 100vw;
+  height: 100vh;
+  display: flex;
+  justify-content: center;
+  align-items: center;
+}
```

`pointer-events: none`은 캔버스가 마우스나 터치 이벤트의 영향을 받지 않도록 해줍니다. 아래에 있는 텍스트를 바로 선택할 수 있도록 설정한 것이죠.

{{{example url="../threejs-tips-transparent-canvas.html" }}}

---

<a id="html-background" data-toc="Three.js를 HTML 요소의 배경으로 사용하기"></a>

# 배경에 Three.js 애니메이션 넣기

많이 받은 질문 중에 하나가 Three.js 애니메이션을 웹 페이지의 배경으로 사용하는 방법이었습니다.

가능한 방법은 2가지 정도겠네요.

* 캔버스 요소의 CSS `position`을 `fixed`로 설정한다.

```css
#c {
 position: fixed;
 left: 0;
 top: 0;
 ...
}
```

이전 예제에서 썼던 방법과 똑같은 방법을 적용할 수 있습니다. `z-index`를 -1 로 설정하면 정육면체들이 텍스트 뒤로 사라질 겁니다.

이 방법의 단점은 자바스크립트 코드가 반드시 페이지와 통합되야 한다는 겁니다. 특히 복잡한 페이지라면 Three.js를 렌더링하는 코드가 다른 코드와 충돌하지 않도록 특별히 신경을 써야 하겠죠.

* `iframe`을 쓴다.

이 방법은 이 사이트의 [메인 페이지](/threejs/lessons/kr/)에서 사용한 방법입니다.

해당 웹 페이지에 iframe만 추가하면 되죠.

```html
<iframe id="background" src="threejs-responsive.html">
<div>
  내용 내용 내용 내용
</div>
```

그런 다음 캔버스 요소를 활용했을 때와 마찬가지로 iframe이 창 전체를 채우도록 한 뒤, `z-index`를 이용해 배경으로 지정합니다. iframe에는 기본적으로 윤곽선이 있으니 추가로 `border`만 `none`으로 설정해주면 됩니다.

```css
#background {
    position: fixed;
    width: 100vw;
    height: 100vh;
    left: 0;
    top: 0;
    z-index: -1;
    border: none;
    pointer-events: none;
}
```

{{{example url="../threejs-tips-html-background.html"}}}