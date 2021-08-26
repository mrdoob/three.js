Title: Three.jsのキャンバステクスチャ
Description: Three.jsでキャンバスをテクスチャとして使う方法
TOC: 動的なテクスチャのキャンバスを使用する

この記事は[Three.jsのテクスチャ](threejs-textures.html)からの続きです。
まだ読んでない人はそちらから先に読んでみるといいかもしれません。

[前回のテクスチャの記事](threejs-textures.html)ではテクスチャは画像ファイルを使っていました。
実行時にテクスチャを生成したい場合もあります。
これを行う方法の1つは `CanvasTexture` を使用する事です。

キャンバステクスチャは `<canvas>` を入力として受け取ります。
2D canvas APIでキャンバスに描画する方法を知らない場合、[MDNに良いチュートリアルがあります](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial)。

簡単なキャンバスのプログラムを作ってみましょう。
ランダムな場所にランダムな色で点を描画します。

```js
const ctx = document.createElement('canvas').getContext('2d');
document.body.appendChild(ctx.canvas);
ctx.canvas.width = 256;
ctx.canvas.height = 256;
ctx.fillStyle = '#FFF';
ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

function randInt(min, max) {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return Math.random() * (max - min) + min | 0;
}

function drawRandomDot() {
  ctx.fillStyle = `#${randInt(0x1000000).toString(16).padStart(6, '0')}`;
  ctx.beginPath();

  const x = randInt(256);
  const y = randInt(256);
  const radius = randInt(10, 64);
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function render() {
  drawRandomDot();
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
```

結構簡単ですね。

{{{example url="../canvas-random-dots.html" }}}

これをテクスチャとして使ってみましょう。
まずは[前回の記事](threejs-textures.html)の立方体のテクスチャにしてみます。
画像を読込するコードを削除します。
代わりにキャンバスを作成し `CanvasTexture` を作成してキャンバスに渡します。

```js
const cubes = [];  // just an array we can use to rotate the cubes
-const loader = new THREE.TextureLoader();
-
+const ctx = document.createElement('canvas').getContext('2d');
+ctx.canvas.width = 256;
+ctx.canvas.height = 256;
+ctx.fillStyle = '#FFF';
+ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
+const texture = new THREE.CanvasTexture(ctx.canvas);

const material = new THREE.MeshBasicMaterial({
-  map: loader.load('resources/images/wall.jpg'),
+  map: texture,
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
cubes.push(cube);  // add to our list of cubes to rotate
```

描画のループ処理でランダムな点を描画するコードを呼び出します。

```js
function render(time) {
  time *= 0.001;

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

+  drawRandomDot();
+  texture.needsUpdate = true;

  cubes.forEach((cube, ndx) => {
    const speed = .2 + ndx * .1;
    const rot = time * speed;
    cube.rotation.x = rot;
    cube.rotation.y = rot;
  });

  renderer.render(scene, camera);

  requestAnimationFrame(render);
}
```

唯一の余計な事は `CanvasTexture` の `needsUpdate` プロパティを設定し、Three.jsにキャンバスの最新のコンテンツでテクスチャを更新する事です。

これでキャンバスのテクスチャキューブができました。

{{{example url="../threejs-canvas-textured-cube.html" }}}

注意点としてThree.jsを使ってキャンバスに描画する場合、
[この記事](threejs-rendertargets.html) で説明している `RenderTarget` を使った方が良いでしょう。

キャンバステクスチャの一般的な使用例は、シーンにテキストを提供する事です。
例えばキャラクターのバッジに名前を入れたい場合、キャンバステクスチャを使いバッジのテクスチャを作成します。

3人のキャラクターがいるシーンを作り、それぞれにバッジやラベルを付けてみましょう。

上記の例から立方体に関連する全てのコードを削除してみましょう。
背景を白にして、[ライト](threejs-lights.html)を2つ追加してみましょう。

```js
const scene = new THREE.Scene();
+scene.background = new THREE.Color('white');
+
+function addLight(position) {
+  const color = 0xFFFFFF;
+  const intensity = 1;
+  const light = new THREE.DirectionalLight(color, intensity);
+  light.position.set(...position);
+  scene.add(light);
+  scene.add(light.target);
+}
+addLight([-3, 1, 1]);
+addLight([ 2, 1, .5]);
```

2Dキャンバスを使い、ラベルを作るコードを作ってみましょう。

```js
+function makeLabelCanvas(size, name) {
+  const borderSize = 2;
+  const ctx = document.createElement('canvas').getContext('2d');
+  const font =  `${size}px bold sans-serif`;
+  ctx.font = font;
+  // measure how long the name will be
+  const doubleBorderSize = borderSize * 2;
+  const width = ctx.measureText(name).width + doubleBorderSize;
+  const height = size + doubleBorderSize;
+  ctx.canvas.width = width;
+  ctx.canvas.height = height;
+
+  // need to set font again after resizing canvas
+  ctx.font = font;
+  ctx.textBaseline = 'top';
+
+  ctx.fillStyle = 'blue';
+  ctx.fillRect(0, 0, width, height);
+  ctx.fillStyle = 'white';
+  ctx.fillText(name, borderSize, borderSize);
+
+  return ctx.canvas;
+}
```

続いて体はシリンダー、頭はスフィア、ラベルはプレーンを使い簡単なキャラクターを作ります。

まずは共有のジオメトリを作ってみましょう。

```js
+const bodyRadiusTop = .4;
+const bodyRadiusBottom = .2;
+const bodyHeight = 2;
+const bodyRadialSegments = 6;
+const bodyGeometry = new THREE.CylinderGeometry(
+    bodyRadiusTop, bodyRadiusBottom, bodyHeight, bodyRadialSegments);
+
+const headRadius = bodyRadiusTop * 0.8;
+const headLonSegments = 12;
+const headLatSegments = 5;
+const headGeometry = new THREE.SphereGeometry(
+    headRadius, headLonSegments, headLatSegments);
+
+const labelGeometry = new THREE.PlaneGeometry(1, 1);
```

では、これらのパーツからキャラクターを作る機能を作ってみましょう。

```js
+function makePerson(x, size, name, color) {
+  const canvas = makeLabelCanvas(size, name);
+  const texture = new THREE.CanvasTexture(canvas);
+  // because our canvas is likely not a power of 2
+  // in both dimensions set the filtering appropriately.
+  texture.minFilter = THREE.LinearFilter;
+  texture.wrapS = THREE.ClampToEdgeWrapping;
+  texture.wrapT = THREE.ClampToEdgeWrapping;
+
+  const labelMaterial = new THREE.MeshBasicMaterial({
+    map: texture,
+    side: THREE.DoubleSide,
+    transparent: true,
+  });
+  const bodyMaterial = new THREE.MeshPhongMaterial({
+    color,
+    flatShading: true,
+  });
+
+  const root = new THREE.Object3D();
+  root.position.x = x;
+
+  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
+  root.add(body);
+  body.position.y = bodyHeight / 2;
+
+  const head = new THREE.Mesh(headGeometry, bodyMaterial);
+  root.add(head);
+  head.position.y = bodyHeight + headRadius * 1.1;
+
+  const label = new THREE.Mesh(labelGeometry, labelMaterial);
+  root.add(label);
+  label.position.y = bodyHeight * 4 / 5;
+  label.position.z = bodyRadiusTop * 1.01;
+
+  // if units are meters then 0.01 here makes size
+  // of the label into centimeters.
+  const labelBaseScale = 0.01;
+  label.scale.x = canvas.width  * labelBaseScale;
+  label.scale.y = canvas.height * labelBaseScale;
+
+  scene.add(root);
+  return root;
+}
```

上記のようにルートの `Object3D` に体、頭、ラベルを配置して位置を調整しています。
これでキャラクターを移動させたい場合、ルートオブジェクトを移動します。
体の高さは2です。
1が1メートルに等しい場合、上記のコードはラベルをcm単位で作成してます。
背の高さがcmのサイズなのでテキストに合うような幅が必要です。

あとはラベルでキャラクターを作ればいいです。

```js
+makePerson(-3, 32, 'Purple People Eater', 'purple');
+makePerson(-0, 32, 'Green Machine', 'green');
+makePerson(+3, 32, 'Red Menace', 'red');
```

残作業はカメラを動かせるように `OrbitControls` を追加します。

```js
import * as THREE from './resources/three/r131/build/three.module.js';
+import {OrbitControls} from './resources/threejs/r131/examples/jsm/controls/OrbitControls.js';
```

```js
const fov = 75;
const aspect = 2;  // the canvas default
const near = 0.1;
-const far = 5;
+const far = 50;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
-camera.position.z = 2;
+camera.position.set(0, 2, 5);

+const controls = new OrbitControls(camera, canvas);
+controls.target.set(0, 2, 0);
+controls.update();
```

そして、簡単なラベルを取得します。

{{{example url="../threejs-canvas-textured-labels.html" }}}

気になる点がいくつかあります。

* 拡大するとラベルがかなり低解像度になる

簡単な解決策はありません。
もっと複雑なフォントの描画テクニックがありますが、私は解決策を知りません。
また、フォントデータをダウンロードするので時間がかかります。

解決策の1つはラベルの解像度を上げる事です。
渡されたサイズを現在の2倍に設定し、`labelBaseScale` を現在の半分に設定してみて下さい。

* 名前が長いほどラベルが長くなります

これを修正したければ代わりに固定サイズのラベルを貼り、テキストを押しつぶします。

これはとても簡単です。基本となる幅を渡し、幅に合わせてテキストを拡大縮小します。

```js
-function makeLabelCanvas(size, name) {
+function makeLabelCanvas(baseWidth, size, name) {
  const borderSize = 2;
  const ctx = document.createElement('canvas').getContext('2d');
  const font =  `${size}px bold sans-serif`;
  ctx.font = font;
  // measure how long the name will be
+  const textWidth = ctx.measureText(name).width;

  const doubleBorderSize = borderSize * 2;
-  const width = ctx.measureText(name).width + doubleBorderSize;
+  const width = baseWidth + doubleBorderSize;
  const height = size + doubleBorderSize;
  ctx.canvas.width = width;
  ctx.canvas.height = height;

  // need to set font again after resizing canvas
  ctx.font = font;
-  ctx.textBaseline = 'top';
+  ctx.textBaseline = 'middle';
+  ctx.textAlign = 'center';

  ctx.fillStyle = 'blue';
  ctx.fillRect(0, 0, width, height);

+  // scale to fit but don't stretch
+  const scaleFactor = Math.min(1, baseWidth / textWidth);
+  ctx.translate(width / 2, height / 2);
+  ctx.scale(scaleFactor, 1);
  ctx.fillStyle = 'white';
  ctx.fillText(name, borderSize, borderSize);

  return ctx.canvas;
}
```

次にラベルの幅を渡します。

```js
-function makePerson(x, size, name, color) {
-  const canvas = makeLabelCanvas(size, name);
+function makePerson(x, labelWidth, size, name, color) {
+  const canvas = makeLabelCanvas(labelWidth, size, name);

...

}

-makePerson(-3, 32, 'Purple People Eater', 'purple');
-makePerson(-0, 32, 'Green Machine', 'green');
-makePerson(+3, 32, 'Red Menace', 'red');
+makePerson(-3, 150, 32, 'Purple People Eater', 'purple');
+makePerson(-0, 150, 32, 'Green Machine', 'green');
+makePerson(+3, 150, 32, 'Red Menace', 'red');
```

テキストが中央揃えのラベルを取得し、それに合わせて拡大縮小されています。

{{{example url="../threejs-canvas-textured-labels-scale-to-fit.html" }}}

上記ではそれぞれのテクスチャに新しいキャンバスを使用しました。
テクスチャごとにキャンバスを使うかはあなた次第です。
頻繁に更新する必要がある場合は、テクスチャごとに1つのキャンバスを使用するのがベストな選択かもしれません。

めったに更新されない場合は、Three.jsで強制的にテクスチャを使用し、1つのキャンバスを複数のテクスチャに使用できます。

```js
+const ctx = document.createElement('canvas').getContext('2d');

function makeLabelCanvas(baseWidth, size, name) {
  const borderSize = 2;
-  const ctx = document.createElement('canvas').getContext('2d');
  const font =  `${size}px bold sans-serif`;

  ...

}

+const forceTextureInitialization = function() {
+  const material = new THREE.MeshBasicMaterial();
+  const geometry = new THREE.PlaneGeometry();
+  const scene = new THREE.Scene();
+  scene.add(new THREE.Mesh(geometry, material));
+  const camera = new THREE.Camera();
+
+  return function forceTextureInitialization(texture) {
+    material.map = texture;
+    renderer.render(scene, camera);
+  };
+}();

function makePerson(x, labelWidth, size, name, color) {
  const canvas = makeLabelCanvas(labelWidth, size, name);
  const texture = new THREE.CanvasTexture(canvas);
  // because our canvas is likely not a power of 2
  // in both dimensions set the filtering appropriately.
  texture.minFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
+  forceTextureInitialization(texture);

  ...
```

{{{example url="../threejs-canvas-textured-labels-one-canvas.html" }}}

もう1つの問題はラベルが常にカメラに向いているとは限らない事です。
ラベルをバッジにしているなら、それは良い事なのかもしれません。
3Dゲームでプレイヤーの上に名前を置くためにラベルを使用している場合は、ラベルが常にカメラの方を向くようにしたいかもしれません。
その方法は[ビルボードの記事](threejs-billboards.html)で取り上げます。

特にラベルの場合は[もう1つの解決策はHTMLを使う事です](threejs-align-html-elements-to-3d.html)。
この記事のラベルは他のオブジェクトで隠したい場合には良いですが、[HTMLラベル](threejs-align-html-elements-to-3d.html)は常に上にあります。
