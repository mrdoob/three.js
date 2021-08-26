Title: Three.jsで要求されたレンダリング
Description: 少ないエネルギーの使い方
TOC: 要求されたレンダリング

多くの人にとって当然かもしれませんが、ほとんどのThree.js exampleでは連続したレンダリングをします。
言い換えると `requestAnimationFrame` ループ、または"*rAF loop*"ループは以下のようになります。

```js
function render() {
  ...
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
```

アニメーションする時は意味がありますがしない時はどうでしょう？
連続したレンダリングはデバイスの電力浪費になり、ポータブルデバイスを使用している場合はバッテリーを浪費します。

これを解決する最も明確な方法は、最初に一度レンダリングして何か変更された時だけレンダリングする事です。
変更にはテクスチャやモデルの読込完了、外部ソースからのデータ受取、ユーザーによる設定やカメラ調整などその他の関連する入力などが含まれます。

[レスポンシブデザインの記事](threejs-responsive.html)を例に要求に応じてレンダリングするように修正してみましょう。

最初に `OrbitControls` を追加します。これで何かの変更を反映してレンダリングする事ができます。

```js
import * as THREE from './resources/three/r132/build/three.module.js';
+import {OrbitControls} from './resources/threejs/r132/examples/jsm/controls/OrbitControls.js';
```

次に以下のように設定します。

```js
const fov = 75;
const aspect = 2;  // the canvas default
const near = 0.1;
const far = 5;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 2;

+const controls = new OrbitControls(camera, canvas);
+controls.target.set(0, 0, 0);
+controls.update();
```

cubesのアニメーションは必要がないのでトラッキングは必要はありません。

```js
-const cubes = [
-  makeInstance(geometry, 0x44aa88,  0),
-  makeInstance(geometry, 0x8844aa, -2),
-  makeInstance(geometry, 0xaa8844,  2),
-];
+makeInstance(geometry, 0x44aa88,  0);
+makeInstance(geometry, 0x8844aa, -2);
+makeInstance(geometry, 0xaa8844,  2);
```

cubesをアニメーションさせるコードと `requestAnimationFrame` の呼出を削除する事ができます。

```js
-function render(time) {
-  time *= 0.001;
+function render() {

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

-  cubes.forEach((cube, ndx) => {
-    const speed = 1 + ndx * .1;
-    const rot = time * speed;
-    cube.rotation.x = rot;
-    cube.rotation.y = rot;
-  });

  renderer.render(scene, camera);

-  requestAnimationFrame(render);
}

-requestAnimationFrame(render);
```

そして、もう一度レンダリングする必要があります。

```js
render();
```

`OrbitControls` がカメラ設定を変更する時はレンダリングする必要があります。
幸いな事に `OrbitControls` は何か変更された時に `change` イベントをdispatchします。

```js
controls.addEventListener('change', render);
```

ウィンドウのリサイズ時の対応も必要です。
前は連続したレンダリングで自動的な処理でしたが、ウィンドウのリサイズ時にレンダリングする必要があります。

```js
window.addEventListener('resize', render);
```

これで要求されたらレンダリングする事ができます。

{{{example url="../threejs-render-on-demand.html" }}}

`OrbitControls` には慣性のようなものを追加して動きを滑らかにするオプションがあります。
これを有効にするには `enableDamping` プロパティをtrueに設定します。

```js
controls.enableDamping = true;
```

`enableDamping` をオンにした状態で、render関数内で `controls.update` を呼び出す必要があります。
これで動きを滑らかにする新しいカメラ設定を `OrbitControls` に与えてくれます。
この設定は動きを滑らかにしてくれますが、無限ループになってしまうので `change` イベントから直接 `render` を呼び出す事はできません。
controlsは `change` イベントを送信し `render` を呼び出します。 `render` は `controls.update` を呼び出します。
`controltrols.update` は別の `change` イベントを送信します。

この問題は `requestAnimationFrame` を使い `render` を呼び出す事で解決できます。
まだ新しいフレームが要求されていない場合、新しいフレームを要求するようにしなければなりません。

```js
+let renderRequested = false;

function render() {
+  renderRequested = false;

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  renderer.render(scene, camera);
}
render();

+function requestRenderIfNotRequested() {
+  if (!renderRequested) {
+    renderRequested = true;
+    requestAnimationFrame(render);
+  }
+}

-controls.addEventListener('change', render);
+controls.addEventListener('change', requestRenderIfNotRequested);
```

リサイズにも `requestRenderIfNotRequested` を使うべきでしょう。

```js
-window.addEventListener('resize', render);
+window.addEventListener('resize', requestRenderIfNotRequested);
```

違いがわかりにくいかもしれません。以下のサンプルで矢印キーを使って移動したりドラッグして回転させてみて下さい。
次にこのページの一番上のサンプルで同じ事をしてみて下さい。
一番上のサンプルでは矢印キーを押したりドラッグしたりするとスナップし、以下のサンプルではスライドします。

{{{example url="../threejs-render-on-demand-w-damping.html" }}}

シンプルなdat.GUIを追加し、GUIで値の変更時にレンダリングを要求してみましょう。

```js
import * as THREE from './resources/three/r132/build/three.module.js';
import {OrbitControls} from './resources/threejs/r132/examples/jsm/controls/OrbitControls.js';
+import {GUI} from '../3rdparty/dat.gui.module.js';
```

各キューブの色と×スケールを設定できるようにしましょう。
色を設定するには[照明の記事](threejs-lights.html)で作成した `ColorGUIHelper` を使います。

まずはGUIを作成する必要があります。

```js
const gui = new GUI();
```

次に各キューブに対してフォルダを作成し、2つのコントロールを追加します。
1つは `material.color`、もう1つは `cube.scale.x`です。

```js
function makeInstance(geometry, color, x) {
  const material = new THREE.MeshPhongMaterial({color});

  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  cube.position.x = x;

+  const folder = gui.addFolder(`Cube${x}`);
+  folder.addColor(new ColorGUIHelper(material, 'color'), 'value')
+      .name('color')
+      .onChange(requestRenderIfNotRequested);
+  folder.add(cube.scale, 'x', .1, 1.5)
+      .name('scale x')
+      .onChange(requestRenderIfNotRequested);
+  folder.open();

  return cube;
}
```

dat.GUIには `onChange` メソッドがあり、GUIで値を変更時にコールバックを渡す事ができます。今回は `requestRenderIfNotRequested` をコールバックするだけです。
`folder.open` でフォルダ展開できます。

{{{example url="../threejs-render-on-demand-w-gui.html" }}}

three.jsを連続したレンダリングでなく、要求に応じてレンダリングさせる方法のヒントになれば幸いです。
three.jsを要求に応じてレンダリングするアプリ/ページはあまり一般的ではありませんが、three.jsを使用しているページの多くはゲームや3Dアニメーション、エディタ、3Dグラフ生成、商品カタログなどのアートです。
