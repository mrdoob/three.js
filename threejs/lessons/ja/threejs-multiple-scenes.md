Title: Three.jsの複数キャンバスと複数シーン
Description: THREE.jsでページ全体にものを描画する方法
TOC: 複数キャンバスと複数シーン

よくある質問として、どうやってThree.jsで複数キャンバスを使用するのかがあります。
ECサイトを作りたい、3Dダイアグラムをたくさん使ったページを作りたいとしましょう。
一見簡単そうに見えます。
ダイアグラムが欲しい所にキャンバスを作るだけです。
それぞれのキャンバスで `Renderer` を作成します。

以下の問題にすぐに気づくでしょう。

1. ブラウザはWebGLコンテキスト数を制限している

    一般的にはコンテキスト数の制限は約8個です。
    9個目のコンテキストを作成すると、すぐに古いコンテキストが失われます。

2. WebGLリソースはコンテキスト間で共有できない

    10MBの3Dモデルを2つのキャンバスにロードしたいとします。
    20MBのテクスチャを持ち、10MBの3Dモデルも20MBのテクステャも2回ロードしなければなりません。
    コンテキスト間で共有はできません。
    つまり、初期化もシェーダーコンパイルも2回する必要があります。
    キャンバスが増えると回数が増えさらに悪化します。

何か解決策はないでしょうか？

解決策としては、背景のViewPortを埋める1つのキャンバスと、キャンバス以外のHTML要素で"仮想"のキャンバスを持つ事です。
仮想キャンバスごとに `Renderer` と `Scene` を1つずつ作成します。
次に仮想キャンバス要素の位置を確認し、その要素が画面上にある場合はシーンの正しい場所に描画するようにします。

この解決策はキャンバスが1つしかないため、上記の1と2の問題を解決します。
1つのコンテキストだけなので、WebGLコンテキストの制限は問題ありません。
同じ理由で共有の問題もありません。

2つのシーンだけの簡単な例から始めましょう。まずはHTMLを作成します。

```html
<canvas id="c"></canvas>
<p>
  <span id="box" class="diagram left"></span>
  I love boxes. Presents come in boxes.
  When I find a new box I'm always excited to find out what's inside.
</p>
<p>
  <span id="pyramid" class="diagram right"></span>
  When I was a kid I dreamed of going on an expedition inside a pyramid
  and finding a undiscovered tomb full of mummies and treasure.
</p>
```

次にCSSを次のように設定します。

```css
#c {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: block;
  z-index: -1;
}
.diagram {
  display: inline-block;
  width: 5em;
  height: 3em;
  border: 1px solid black;
}
.left {
  float: left;
  margin-right: .25em;
}
.right {
  float: right;
  margin-left: .25em;
}
```

キャンバスを画面一杯にし、`z-index` を-1に設定し他のDOM要素よりも後に表示されるようにします。
仮想キャンバスにはサイズ指定がないため、幅と高さを指定する必要があります。

次にライトとカメラをそれぞれ2つのシーンに作成します。
1つ目のシーンにキューブを追加し、もう1つのシーンにはひし形を追加します。

```js
function makeScene(elem) {
  const scene = new THREE.Scene();

  const fov = 45;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  const far = 5;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 2;
  camera.position.set(0, 1, 2);
  camera.lookAt(0, 0, 0);

  {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
  }

  return {scene, camera, elem};
}

function setupScene1() {
  const sceneInfo = makeScene(document.querySelector('#box'));
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshPhongMaterial({color: 'red'});
  const mesh = new THREE.Mesh(geometry, material);
  sceneInfo.scene.add(mesh);
  sceneInfo.mesh = mesh;
  return sceneInfo;
}

function setupScene2() {
  const sceneInfo = makeScene(document.querySelector('#pyramid'));
  const radius = .8;
  const widthSegments = 4;
  const heightSegments = 2;
  const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
  const material = new THREE.MeshPhongMaterial({
    color: 'blue',
    flatShading: true,
  });
  const mesh = new THREE.Mesh(geometry, material);
  sceneInfo.scene.add(mesh);
  sceneInfo.mesh = mesh;
  return sceneInfo;
}

const sceneInfo1 = setupScene1();
const sceneInfo2 = setupScene2();
```

DOM要素が画面上にある場合のみ、各シーンをレンダリングする関数を作成します。
`Renderer.setScissorTest` で *シザー* テストを有効にし、キャンバスの一部だけをレンダリングするように指定できます。
`Renderer.setViewport` と `Renderer.setScissor` でシザーとビューポートの両方を設定します。

```js
function renderSceneInfo(sceneInfo) {
  const {scene, camera, elem} = sceneInfo;

  // get the viewport relative position of this element
  const {left, right, top, bottom, width, height} =
      elem.getBoundingClientRect();

  const isOffscreen =
      bottom < 0 ||
      top > renderer.domElement.clientHeight ||
      right < 0 ||
      left > renderer.domElement.clientWidth;

  if (isOffscreen) {
    return;
  }

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  const positiveYUpBottom = canvasRect.height - bottom;
  renderer.setScissor(left, positiveYUpBottom, width, height);
  renderer.setViewport(left, positiveYUpBottom, width, height);

  renderer.render(scene, camera);
}
```

render関数で最初に画面をクリア後、各シーンをレンダリングします。

```js
function render(time) {
  time *= 0.001;

  resizeRendererToDisplaySize(renderer);

  renderer.setScissorTest(false);
  renderer.clear(true, true);
  renderer.setScissorTest(true);

  sceneInfo1.mesh.rotation.y = time * .1;
  sceneInfo2.mesh.rotation.y = time * .1;

  renderSceneInfo(sceneInfo1);
  renderSceneInfo(sceneInfo2);

  requestAnimationFrame(render);
}
```

その結果がこれです。

{{{example url="../threejs-multiple-scenes-v1.html" }}}

最初の `<span>` が赤いキューブ、2つ目の `span` が青いひし形です。

## 同期する

上記のコードは動作していますが、1つだけ小さな問題があります。
シーンが複雑だったり、何らかの理由でレンダリングに時間がかかり過ぎる場合、
キャンバスに描画したシーンの位置が他のページよりも遅れてしまいます。

各エリアにborderを与えて

```css
.diagram {
  display: inline-block;
  width: 5em;
  height: 3em;
+  border: 1px solid black;
}
```

各シーンに背景色を設定します。

```js
const scene = new THREE.Scene();
+scene.background = new THREE.Color('red');
```

そして、<a href="../threejs-multiple-scenes-v2.html" target="_blank">素早く上下にスクロール</a>すると問題が分かります。以下はスクロールが10倍に遅くなった動画です。

<div class="threejs_center"><img class="border" src="resources/images/multi-view-skew.gif"></div>

別のトレードオフになる別の方法に切り替える事もできます。
キャンバスのCSSを `position: fixed` から `position: absolute` に切り替えます。

```css
#c {
-  position: fixed;
+  position: absolute;
```

キャンバスの変形を設定し、キャンバス上部が現在のページスクロールしている部分の上部にくるように移動させます。

```js
function render(time) {
  ...

  const transform = `translateY(${window.scrollY}px)`;
  renderer.domElement.style.transform = transform;

```

`position: fixed` はページの残りの部分がスクロールしている間、キャンバスがスクロールしないようにしていました。
`position: absolute` は、キャンバスをページの残りの部分と一緒にスクロールさせます。
これはレンダリングに時間がかかりすぎても、描画したものがスクロールしてもページに密着します。
ページがスクロールされた位置に合わせてキャンバスを移動し再レンダリングします。
ウィンドウの端だけが一瞬レンダリングされていないビットが表示されますが、<a href="../threejs-multiple-scenes-v2.html" target="_blank">ページの真ん中にあるものは一致している</a>のでスライドしません。新しい方法で10倍に遅くなった結果を見てみましょう。

<div class="threejs_center"><img class="border" src="resources/images/multi-view-fixed.gif"></div>

## もっと汎用的なコードにする

複数のシーンが機能したので、もう少し汎用的なコードにしてみましょう。

キャンバスを管理するメインのrender関数にDOM要素のリストと関連するrender関数だけ持たせる事ができます。
各要素に対して画面上に表示されているかチェックし、表示されている場合は対応するrender関数を呼び出します。
この方法は個々のシーンが小さな空間でレンダリングされている事を意識せず、汎用的なシステムになります。

これがメインのrender関数です。

```js
const sceneElements = [];
function addScene(elem, fn) {
  sceneElements.push({elem, fn});
}

function render(time) {
  time *= 0.001;

  resizeRendererToDisplaySize(renderer);

  renderer.setScissorTest(false);
  renderer.setClearColor(clearColor, 0);
  renderer.clear(true, true);
  renderer.setScissorTest(true);

  const transform = `translateY(${window.scrollY}px)`;
  renderer.domElement.style.transform = transform;

  for (const {elem, fn} of sceneElements) {
    // get the viewport relative position of this element
    const rect = elem.getBoundingClientRect();
    const {left, right, top, bottom, width, height} = rect;

    const isOffscreen =
        bottom < 0 ||
        top > renderer.domElement.clientHeight ||
        right < 0 ||
        left > renderer.domElement.clientWidth;

    if (!isOffscreen) {
      const positiveYUpBottom = renderer.domElement.clientHeight - bottom;
      renderer.setScissor(left, positiveYUpBottom, width, height);
      renderer.setViewport(left, positiveYUpBottom, width, height);

      fn(time, rect);
    }
  }

  requestAnimationFrame(render);
}
```

`elem` と`fn` プロパティを持つオブジェクトの配列があり、`sceneElements` でループしているのが分かります。

要素が画面上にあるかどうかをチェックします。
画面上にある場合は `fn` を呼び出し、引数に現在の時刻と矩形を渡します。

これで各シーン設定のコードがシーンのリストに追加されます。

```js
{
  const elem = document.querySelector('#box');
  const {scene, camera} = makeScene();
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshPhongMaterial({color: 'red'});
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  addScene(elem, (time, rect) => {
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
    mesh.rotation.y = time * .1;
    renderer.render(scene, camera);
  });
}

{
  const elem = document.querySelector('#pyramid');
  const {scene, camera} = makeScene();
  const radius = .8;
  const widthSegments = 4;
  const heightSegments = 2;
  const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
  const material = new THREE.MeshPhongMaterial({
    color: 'blue',
    flatShading: true,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  addScene(elem, (time, rect) => {
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
    mesh.rotation.y = time * .1;
    renderer.render(scene, camera);
  });
}
```

`sceneInfo1` と `sceneInfo2` が不要になり、メッシュを回転させていたコードがシーンごとに固有になりました。

{{{example url="../threejs-multiple-scenes-generic.html" }}}

## HTML Datasetを使う

最後にもっと汎用的にするためにHTML [dataset](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset)を使います。
これはHTML要素に独自のデータを追加する方法です。
`id="...."` の代わりに `data-diagram="...."` を使います。

```html
<canvas id="c"></canvas>
<p>
-  <span id="box" class="diagram left"></span>
+  <span data-diagram="box" class="left"></span>
  I love boxes. Presents come in boxes.
  When I find a new box I'm always excited to find out what's inside.
</p>
<p>
-  <span id="pyramid" class="diagram left"></span>
+  <span data-diagram="pyramid" class="right"></span>
  When I was a kid I dreamed of going on an expedition inside a pyramid
  and finding a undiscovered tomb full of mummies and treasure.
</p>
```

CSSのセレクタを変更し、それを選択するようにします。

```css
-.diagram
+*[data-diagram] {
  display: inline-block;
  width: 5em;
  height: 3em;
}
```

シーン設定のコードを変更して *シーン初期化関数* への名前のマップにします。
そして、*シーンのレンダリング関数* を返すようにします。

```js
const sceneInitFunctionsByName = {
  'box': () => {
    const {scene, camera} = makeScene();
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({color: 'red'});
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    return (time, rect) => {
      mesh.rotation.y = time * .1;
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };
  },
  'pyramid': () => {
    const {scene, camera} = makeScene();
    const radius = .8;
    const widthSegments = 4;
    const heightSegments = 2;
    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    const material = new THREE.MeshPhongMaterial({
      color: 'blue',
      flatShading: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    return (time, rect) => {
      mesh.rotation.y = time * .1;
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };
  },
};
```

次に `querySelectorAll` で全てのdiagramを見つけ、対応するinit関数を呼び出します。

```js
document.querySelectorAll('[data-diagram]').forEach((elem) => {
  const sceneName = elem.dataset.diagram;
  const sceneInitFunction = sceneInitFunctionsByName[sceneName];
  const sceneRenderFunction = sceneInitFunction(elem);
  addScene(elem, sceneRenderFunction);
});
```

見た目の変更はありませんが、コードはさらに汎用的になっています。

{{{examples url="../threejs-multiple-scenes-selector.html" }}}

## 各要素にコントロールを追加する

`TrackballControls` のようなインタラクティブな要素を追加するのは簡単です。
最初にコントロール用のスクリプトを追加します。

```js
import {TrackballControls} from './resources/threejs/r122/examples/jsm/controls/TrackballControls.js';
```

そして `TrackballControls` を各シーンに追加し、シーンに関連付けられた要素を渡します。

```js
-function makeScene() {
+function makeScene(elem) {
  const scene = new THREE.Scene();

  const fov = 45;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  const far = 5;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 1, 2);
  camera.lookAt(0, 0, 0);
+  scene.add(camera);

+  const controls = new TrackballControls(camera, elem);
+  controls.noZoom = true;
+  controls.noPan = true;

  {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
-    scene.add(light);
+    camera.add(light);
  }

-  return {scene, camera};
+ return {scene, camera, controls};
}
```

シーンにカメラを追加し、カメラにライティングを追加しました。
これにより、カメラに対する相対的な光を受けます。
`TrackballControls` がカメラを動かしているので、これが望んだ形です。
見ている対象物の側に光を当て続けます。

render関数でこれらのコントロールを更新する必要があります。

```js
const sceneInitFunctionsByName = {
- 'box': () => {
-    const {scene, camera} = makeScene();
+ 'box': (elem) => {
+    const {scene, camera, controls} = makeScene(elem);
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({color: 'red'});
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    return (time, rect) => {
      mesh.rotation.y = time * .1;
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
+      controls.handleResize();
+      controls.update();
      renderer.render(scene, camera);
    };
  },
-  'pyramid': () => {
-    const {scene, camera} = makeScene();
+  'pyramid': (elem) => {
+    const {scene, camera, controls} = makeScene(elem);
    const radius = .8;
    const widthSegments = 4;
    const heightSegments = 2;
    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    const material = new THREE.MeshPhongMaterial({
      color: 'blue',
      flatShading: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    return (time, rect) => {
      mesh.rotation.y = time * .1;
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
+      controls.handleResize();
+      controls.update();
      renderer.render(scene, camera);
    };
  },
};
```

オブジェクトをドラッグすると回転するようになりました。

{{{example url="../threejs-multiple-scenes-controls.html" }}}

これらのテクニックはこのサイト自体にも使われています。
特に[プリミティブの記事](threejs-primitives.html)と[マテリアルの記事](threejs-materials.html)では、このテクニックを使ってページ全体に様々なサンプルを追加しています。

もう1つの解決策はオフスクリーンのキャンバスにレンダリングし、各要素で結果を2Dキャンバスにコピーする事です。
この解決策の利点は、分離した各領域を合成する方法に制限がないです。
以前の解決策では、背景に単一のキャンバスを使用していました。
この解決策では通常のHTML要素を使用しています。

欠点は、領域ごとにコピーが発生するため遅いという事です。
どのくらい遅くなるかはブラウザとGPUに依存します。

必要な変更は非常に小さいです。

まず、ページ内にキャンバスが不要になったのでHTMLを変更します。

```html
<body>
-  <canvas id="c"></canvas>
  ...
</body>
```

CSSも変更します。

```
-#c {
-  position: absolute;
-  left: 0;
-  top: 0;
-  width: 100%;
-  height: 100%;
-  display: block;
-  z-index: -1;
-}
canvas {
  width: 100%;
  height: 100%;
  display: block;
}
*[data-diagram] {
  display: inline-block;
  width: 5em;
  height: 3em;
}
```

全てのキャンバスは作成し、コンテナとなる変数に格納する形にします。

では、JavaScriptを変更してみましょう。
もはやキャンバスを探す事は不要になりました。
代わりに私たちは1つのキャンバスを作ります。
また、最初にシザーテストをONにします。

```js
function main() {
-  const canvas = document.querySelector('#c');
+  const canvas = document.createElement('canvas');
  const renderer = new THREE.WebGLRenderer({canvas, alpha: true});
+  renderer.setScissorTest(true);

  ...
```

次に各シーンに対して2Dレンダリングのコンテキストを作成し、そのシーンの要素にキャンバスを追加します。

```js
const sceneElements = [];
function addScene(elem, fn) {
+  const ctx = document.createElement('canvas').getContext('2d');
+  elem.appendChild(ctx.canvas);
-  sceneElements.push({elem, fn});
+  sceneElements.push({elem, ctx, fn});
}
```

レンダリング時に、レンダラーのキャンバスがレンダリングするのに十分な大きさでない場合はサイズを大きくします。
また、キャンバスのサイズが間違っている場合はそのサイズを変更します。
最後にシザーとビューポートを設定し、シーンをレンダリングしその結果をキャンバスにコピーします。

```js
function render(time) {
  time *= 0.001;

-  resizeRendererToDisplaySize(renderer);
-
-  renderer.setScissorTest(false);
-  renderer.setClearColor(clearColor, 0);
-  renderer.clear(true, true);
-  renderer.setScissorTest(true);
-
-  const transform = `translateY(${window.scrollY}px)`;
-  renderer.domElement.style.transform = transform;

-  for (const {elem, fn} of sceneElements) {
+  for (const {elem, fn, ctx} of sceneElements) {
    // get the viewport relative position of this element
    const rect = elem.getBoundingClientRect();
    const {left, right, top, bottom, width, height} = rect;
+    const rendererCanvas = renderer.domElement;

    const isOffscreen =
        bottom < 0 ||
-        top > renderer.domElement.clientHeight ||
+        top > window.innerHeight ||
        right < 0 ||
-        left > renderer.domElement.clientWidth;
+        left > window.innerWidth;

    if (!isOffscreen) {
-      const positiveYUpBottom = renderer.domElement.clientHeight - bottom;
-      renderer.setScissor(left, positiveYUpBottom, width, height);
-      renderer.setViewport(left, positiveYUpBottom, width, height);

+      // make sure the renderer's canvas is big enough
+      if (rendererCanvas.width < width || rendererCanvas.height < height) {
+        renderer.setSize(width, height, false);
+      }
+
+      // make sure the canvas for this area is the same size as the area
+      if (ctx.canvas.width !== width || ctx.canvas.height !== height) {
+        ctx.canvas.width = width;
+        ctx.canvas.height = height;
+      }
+
+      renderer.setScissor(0, 0, width, height);
+      renderer.setViewport(0, 0, width, height);

      fn(time, rect);

+      // copy the rendered scene to this element's canvas
+      ctx.globalCompositeOperation = 'copy';
+      ctx.drawImage(
+          rendererCanvas,
+          0, rendererCanvas.height - height, width, height,  // src rect
+          0, 0, width, height);                              // dst rect
    }
  }

  requestAnimationFrame(render);
}
```

結果は同じように見えます。

{{{example url="../threejs-multiple-scenes-copy-canvas.html" }}}

この解決策のもう1つの利点は、Web workerでレンダリングするために[`OffscreenCanvas`](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)のテクニックも使用しています。
残念ながら2020年7月現在、`OffscreenCanvas` はChromeのみの対応となっています。
