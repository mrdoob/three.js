Title: Three.jsのカメラ
Description: Three.jsでのカメラの使い方
TOC: カメラ

この記事はThree.jsの連載記事の1つです。
最初の記事は[Three.jsの基礎知識](threejs-fundamentals.html)です。
まだ読んでいない場合、そこから始めると良いかもしれません。

three.jsでのカメラの話をしましょう。
[最初の記事](threejs-fundamentals.html)でいくつか取り上げましたが、ここではもっと詳しく取り上げます。

`PerspectiveCamera（透視投影カメラ）` はthree.jsで最も一般的なカメラで、今までの記事で使ってきました。
遠くのものが近くのものよりも小さく見える3Dビューを提供します。

`PerspectiveCamera` は *錐台* を定義します。
[錐台とは先端が切り取られたピラミッドのような3D形状の事です](https://en.wikipedia.org/wiki/Frustum)。
つまり、cube(立方体)、cone(円錐体)、sphere(球体)、cylinder(円柱)、frustum(錐台)は全て異なる種類の固体名です。

<div class="spread">
  <div><div data-diagram="shapeCube"></div><div>cube</div></div>
  <div><div data-diagram="shapeCone"></div><div>cone</div></div>
  <div><div data-diagram="shapeSphere"></div><div>sphere</div></div>
  <div><div data-diagram="shapeCylinder"></div><div>cylinder</div></div>
  <div><div data-diagram="shapeFrustum"></div><div>frustum</div></div>
</div>

私はこの事を何年も知らなかったです。
どこかの本やページで *錐台* について書かれていると目が点になります。
錐台が固体名と理解すると、それらの記述を急に理解できるようになりました &#128517;

`PerspectiveCamera` には4つのプロパティをもとに錐台が定義されています。
`near` は錐台の正面がどこから始まるかを定義します。
`far` は錐台が終了する場所です。
`fov` は視野角で、カメラから `near` 単位で指定された視野角を得るために正しい高さが計算され、錐台の前面と背面の高さを定義します。
`aspect` は錐台の前面と背面の幅です。
錐台の幅は高さにaspectを掛けたものです。

<img src="resources/frustum-3d.svg" width="500" class="threejs_center"/>

[前回の記事](threejs-lights.html)から地面となる平面、球体、立方体のあるシーンを利用し、カメラの設定を調整してみましょう。

`near` と `far` の設定用に `MinMaxGUIHelper` を作成します。
`far` が常に `near` よりも大きい値になるようにします。
MinMaxGUIHelperは `min` と `max` のプロパティがあり、dat.GUIで調整します。
GUIで値を調整すると2つのプロパティに設定されます。

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
    this.min = this.min;  // this will call the min setter
  }
}
```

これでGUIを以下のように設定できます。

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

カメラ設定の変更時、カメラの [`updateProjectionMatrix`](PerspectiveCamera.updateProjectionMatrix) 関数を呼び出す必要があります。
`updateCamera` という関数を作り、それをdat.GUI変更時に呼び出すようにします。

{{{example url="../threejs-cameras-perspective.html" }}}

値を調整すると動作が確認できます。
`aspect` を調整したい場合は、新しいウィンドウでサンプルを開いてからウィンドウサイズを変更して下さい。

それでもまだ少し見づらいので、2つのカメラを持つサンプルに変えます。
1つ目のカメラは上記で見たシーンを表示し、2つ目のカメラは1つ目のカメラが描画してるシーンを見ている別のカメラとし、そのカメラの錐台を表示します。

そのためにthree.jsのシザー関数を利用します。
シザー機能を使い、カメラを2台並べて2つのシーンを描画するように変更してみましょう。

まず、HTMLとCSSを使って2つの並んでるDOM要素を定義してみましょう。
両方のカメラが簡単に独自の `OrbitControls` を持てるようにします。

```html
<body>
  <canvas id="c"></canvas>
+  <div class="split">
+     <div id="view1" tabindex="1"></div>
+     <div id="view2" tabindex="2"></div>
+  </div>
</body>
```

このview1とview2をキャンバスの上に重ねて表示させます。

```css
.split {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
}
.split>div {
  width: 100%;
  height: 100%;
}
```

次に `CameraHelper` を追加します。
`CameraHelper` は `Camera` の錐台を描画します。

```js
const cameraHelper = new THREE.CameraHelper(camera);

...

scene.add(cameraHelper);
```

view1とview2のDOM要素をquerySelectorしましょう。

```js
const view1Elem = document.querySelector('#view1');
const view2Elem = document.querySelector('#view2');
```

既存の `OrbitControls` をview1にのみ反応するようにします。

```js
-const controls = new OrbitControls(camera, canvas);
+const controls = new OrbitControls(camera, view1Elem);
```

2つ目の `PerspectiveCamera` と `OrbitControls` を作ってみましょう。
2つ目の `OrbitControls` は2つ目のカメラに関連付けし、view2から入力を取得します。

```js
const camera2 = new THREE.PerspectiveCamera(
  60,  // fov
  2,   // aspect
  0.1, // near
  500, // far
);
camera2.position.set(40, 10, 30);
camera2.lookAt(0, 5, 0);

const controls2 = new OrbitControls(camera2, view2Elem);
controls2.target.set(0, 5, 0);
controls2.update();
```

最後にキャンバスの一部だけをレンダリングするために、シザー機能を使い各カメラの視点からシーンをレンダリングします。

ここにDOM要素を渡すと、キャンバスに重なる矩形を計算する関数があります。
その矩形にシザーとビューポートを設定し、アスペクト比を返します。

```js
function setScissorForElement(elem) {
  const canvasRect = canvas.getBoundingClientRect();
  const elemRect = elem.getBoundingClientRect();

  // compute a canvas relative rectangle
  const right = Math.min(elemRect.right, canvasRect.right) - canvasRect.left;
  const left = Math.max(0, elemRect.left - canvasRect.left);
  const bottom = Math.min(elemRect.bottom, canvasRect.bottom) - canvasRect.top;
  const top = Math.max(0, elemRect.top - canvasRect.top);

  const width = Math.min(canvasRect.width, right - left);
  const height = Math.min(canvasRect.height, bottom - top);

  // setup the scissor to only render to that part of the canvas
  const positiveYUpBottom = canvasRect.height - bottom;
  renderer.setScissor(left, positiveYUpBottom, width, height);
  renderer.setViewport(left, positiveYUpBottom, width, height);

  // return the aspect
  return width / height;
}
```

この関数を使って `render` 関数でシーンを2回描画できます。

```js
  function render() {

-    if (resizeRendererToDisplaySize(renderer)) {
-      const canvas = renderer.domElement;
-      camera.aspect = canvas.clientWidth / canvas.clientHeight;
-      camera.updateProjectionMatrix();
-    }

+    resizeRendererToDisplaySize(renderer);
+
+    // turn on the scissor
+    renderer.setScissorTest(true);
+
+    // render the original view
+    {
+      const aspect = setScissorForElement(view1Elem);
+
+      // adjust the camera for this aspect
+      camera.aspect = aspect;
+      camera.updateProjectionMatrix();
+      cameraHelper.update();
+
+      // don't draw the camera helper in the original view
+      cameraHelper.visible = false;
+
+      scene.background.set(0x000000);
+
+      // render
+      renderer.render(scene, camera);
+    }
+
+    // render from the 2nd camera
+    {
+      const aspect = setScissorForElement(view2Elem);
+
+      // adjust the camera for this aspect
+      camera2.aspect = aspect;
+      camera2.updateProjectionMatrix();
+
+      // draw the camera helper in the 2nd view
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

上記のコードはview1とview2を区別するために、view2をレンダリング時のシーンの背景色を紺色にしています。

また、`render` 関数内で全て更新しているため、`updateCamera` のコードを削除できます。

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

片方のviewを使い、もう片方の錐台を見るれるようになりました。

{{{example url="../threejs-cameras-perspective-2-scenes.html" }}}

左側はオリジナルのビュー、右側はカメラの錐台を表示するビューがあります。
マウスで `near`、`far`、`fov` を調整してカメラを動かすと、右側に表示されている錐台の内側だけが左側のシーンに表示されています。

`near` を20くらいに調整すると、錐台に入らずオブジェクトの正面が消えます。
`far` を35以下に調整すると、錐台に入らず地上の平面が消えていきます。

ここで疑問が湧いてきました。
`near` を0.0000000001に `far` を10000000000000に設定し、全てを見えるようにできないでしょうか？
なぜなら、GPUは何かが前後にあるかを判断する精度が高いからです。
その精度は `near` と `far` の間に分散しています。
さらに悪い事にデフォルトではカメラの近くの精度は細かく、カメラから遠い精度は粗くなっています。
単位の値は `near` から始まり、`far` に近づくにつれて徐々に拡大していきます。

上記のサンプルから始めて、20個の球体を1列に挿入するコードに変更してみましょう。

```js
{
  const sphereRadius = 3;
  const sphereWidthDivisions = 32;
  const sphereHeightDivisions = 16;
  const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
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

`near` を0.00001に設定してみましょう。

```js
const fov = 45;
const aspect = 2;  // the canvas default
-const near = 0.1;
+const near = 0.00001;
const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
```

値の編集時に0.00001を許容するようにGUIコードを微調整します。

```js
-gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
+gui.add(minMaxGUIHelper, 'min', 0.00001, 50, 0.00001).name('near').onChange(updateCamera);
```

何が起こると思いますか？

{{{example url="../threejs-cameras-z-fighting.html" }}}

これはGPUがどのピクセルが前後にあるか判断する精度が不足してる時に *Zファイティング* が発生する例です。

あなたのマシンでは問題が表示されない可能性がありますが、私のマシンでは以下のように表示されます。

<div class="threejs_center"><img src="resources/images/z-fighting.png" style="width: 570px;"></div>

1つ目の解決策はどのピクセルが前後にあるかを計算するために、three.jsの別メソッドを使用します。
これは `WebGLRenderer` の作成時に `logarithmicDepthBuffer` を有効にします。

```js
-const renderer = new THREE.WebGLRenderer({canvas});
+const renderer = new THREE.WebGLRenderer({
+  canvas,
+  logarithmicDepthBuffer: true,
+});
```

これで上手く動くかもしれません。

{{{example url="../threejs-cameras-logarithmic-depth-buffer.html" }}}

これで問題が解決しない場合、この解決策が使えない理由の1つに遭遇した事になります。
その理由は、特定のGPUのみをサポートしているためです。
2018年9月現在、ほとんどのデスクトップがこの解決策をサポートしていますが、モバイルデバイスはほとんどサポートしていません。

この解決策を選択しないもう1つの理由は、標準的な解決策よりも大幅に遅くなる可能性があります。

この解決策は解像度に制限があります。
`near` をさらに小さくしたり `far` をさらに大きくしたりすると最終的に同じ問題にぶつかります。

`near` と `far` の設定は、常にユースケースに合った値を選択して下さい。
`near` はカメラからできるだけ離れた所に置き、オブジェクトが消えないようにしましょう。
`far` はカメラからできるだけ近い所に置き、オブジェクトが消えないようにしましょう。

もしまつげを見れるぐらい誰かの顔をクローズアップし、背景には50キロ離れた山までの道のりを見る巨大なシーンを描画したい場合、他の創造的な解決策を見つける必要があるでしょう。
この解決策は後にしましょう。
とりあえず自分のニーズに合わせて `near` と `far` は適切な値を選択しましょう。

2番目に一般的なカメラは `OrthographicCamera(平行投影カメラ)` です。
錐台を指定するのではなく、`left`、`right`、`top`、`bottom`、`near`、`far` の設定でボックスを指定します。
ボックスを投影しているので遠近感はありません。

上記のview1とview2のサンプルを変更し、最初のビューで `OrthographicCamera` を使うようにしましょう。

最初に `OrthographicCamera` を設定します。

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

`left` と `bottom` を-1、`right` と `top` を1にしました。
これで箱の幅が2、高さが2になりますが、描画している矩形のアスペクト比で `left` と `top` を調整します。
`zoom` プロパティでカメラで実際に表示される値を簡単に調整できます。

GUIに `zoom` の設定を追加してみましょう。

```js
const gui = new GUI();
+gui.add(camera, 'zoom', 0.01, 1, 0.01).listen();
```

`listen` 呼び出しはdat.GUIに変更を監視するようにします。
これは `OrbitControls` がズームも制御できるからです。
例えばマウスのスクロールホイールは `OrbitControls` でズームします。

最後に左側をレンダリングする部分を変更して `OrthographicCamera` を更新します。

```js
{
  const aspect = setScissorForElement(view1Elem);

  // update the camera for this aspect
-  camera.aspect = aspect;
+  camera.left   = -aspect;
+  camera.right  =  aspect;
  camera.updateProjectionMatrix();
  cameraHelper.update();

  // don't draw the camera helper in the original view
  cameraHelper.visible = false;

  scene.background.set(0x000000);
  renderer.render(scene, camera);
}
```

これで `OrthographicCamera` が動作しているのが見れるようになりました。

{{{example url="../threejs-cameras-orthographic-2-scenes.html" }}}

three.jsで2次元のものを描画する場合には、`OrthographicCamera` が最もよく使われます。
カメラの表示台数を決める必要があります。
例えば、1ピクセルのキャンバスをカメラの1単位と一致させたい場合、次のような事ができます。

原点を中心に置き、1ピクセル = three.jsの1単位とするには次のようにします。

```js
camera.left = -canvas.width / 2;
camera.right = canvas.width / 2;
camera.top = canvas.height / 2;
camera.bottom = -canvas.height / 2;
camera.near = -1;
camera.far = 1;
camera.zoom = 1;
```

原点を2Dキャンバスのように左上に配置したい場合は、次のようにします。

```js
camera.left = 0;
camera.right = canvas.width;
camera.top = 0;
camera.bottom = canvas.height;
camera.near = -1;
camera.far = 1;
camera.zoom = 1;
```

この場合、左上の角は2Dキャンバスのように0, 0になります。

やってみましょう！まずはカメラの設定をします。

```js
const left = 0;
const right = 300;  // default canvas size
const top = 0;
const bottom = 150;  // default canvas size
const near = -1;
const far = 1;
const camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
camera.zoom = 1;
```

続いて、6枚のテクスチャをロードし、6枚の平面を作ってみましょう。
各平面は `THREE.Object3D` を親にし、平面の中心を左上にして簡単にオフセットできるようにします。

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
const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
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
  // move plane so top left corner is origin
  mesh.position.set(planeSize / 2, planeSize / 2, 0);
  return planePivot;
});
```

キャンバスサイズの変更時、カメラを更新する必要があります。

```js
function render() {

  if (resizeRendererToDisplaySize(renderer)) {
    camera.right = canvas.width;
    camera.bottom = canvas.height;
    camera.updateProjectionMatrix();
  }

  ...
```

`planes` は `THREE.Mesh` の配列であり、各平面に1つずつあります。
これらを時間に応じて移動させてみましょう。

```js
function render(time) {
  time *= 0.001;  // convert to seconds;

  ...

  const distAcross = Math.max(20, canvas.width - planeSize);
  const distDown = Math.max(20, canvas.height - planeSize);

  // total distance to move across and back
  const xRange = distAcross * 2;
  const yRange = distDown * 2;
  const speed = 180;

  planes.forEach((plane, ndx) => {
    // compute a unique time for each plane
    const t = time * speed + ndx * 300;

    // get a value between 0 and range
    const xt = t % xRange;
    const yt = t % yRange;

    // set our position going forward if 0 to half of range
    // and backward if half of range to range
    const x = xt < distAcross ? xt : xRange - xt;
    const y = yt < distDown   ? yt : yRange - yt;

    plane.position.set(x, y, 0);
  });

  renderer.render(scene, camera);
```

2Dキャンバスのようにピクセル計算を使い、画像がキャンバスの縁からピクセルのように跳ね返っているのが分かります。

{{{example url="../threejs-cameras-orthographic-canvas-top-left-origin.html" }}}

`OrthographicCamera` のもう1つの一般的な用途は3Dモデリングツールやゲームエンジンで、上、下、左、右、正面、背面のビューを描画する場合です。

<div class="threejs_center"><img src="resources/images/quad-viewport.png" style="width: 574px;"></div>

上記のスクリーンショットでは右上のビューが透視投影図、左上のビューが平行投影図です。

それがカメラの基本です。
カメラを動かすための一般的な方法は別の記事で紹介します。
とりあえず[影](threejs-shadows.html)についてのページに移りましょう。

<canvas id="c"></canvas>
<script type="module" src="resources/threejs-cameras.js"></script>
