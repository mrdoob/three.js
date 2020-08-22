Title: Three.jsの要求されたレンダリング
Description: 少ないエネルギーの使い方
TOC: 要求されたレンダリング

多くの人にとっては当たり前の事かもしれませんが、ほとんどのThree.js Exampleでは連続したレンダリングをします。
言い換えると `requestAnimationFrame`ループ、または "*rAF loop*"ループは以下のようになります。

```js
function render() {
  ...
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
```

アニメーションするものには意味がありますがしないものにはどうでしょう？
連続してレンダリングする事はデバイスの電力浪費しますし、ポータブルデバイスを使用している場合はバッテリーを浪費します。

これを解決する最も明確な方法は、最初に一度レンダリングして何かが変更された時だけレンダリングする事です。
テクスチャやモデルの最終的な読込、外部ソースからのデータ受取、ユーザーによる設定やカメラ調整などその他の関連する入力などが含まれます。

[レスポンシブデザインの記事](threejs-responsive.html)を例に要求に応じてレンダリングするように修正してみましょう。

最初に `OrbitControls` を追加します。

```js
import * as THREE from './resources/three/r119/build/three.module.js';
+import {OrbitControls} from './resources/threejs/r119/examples/jsm/controls/OrbitControls.js';
```

次に以下のようにセットアップします。

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

キューブはアニメーションの必要がないのでトラッキングは必要はありません。

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

つまり、キューブをアニメーションさせるコードと `requestAnimationFrame` の呼出を削除する事ができます。

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
幸いな事に`OrbitControls` は何かが変更された時は `change` イベントをdispatchします。

```js
controls.addEventListener('change', render);
```

ウィンドウのサイズを変更した時の対応も必要です。
前は連続してレンダリングしていたので自動的に処理をしてたのですが、ウィンドウのサイズが変わった時にレンダリングする必要があります。

```js
window.addEventListener('resize', render);
```

これで要求されたらレンダリングする事ができます。

{{{example url="../threejs-render-on-demand.html" }}}

`OrbitControls`には柔軟な慣性を加えるオプションがあります。
これを有効にするには `enableDamping` プロパティをtrueに設定します。

```js
controls.enableDamping = true;
```

render関数で `controls.update` を呼び出す必要があるので `OrbitControls` が動きを滑らかにするために新しいカメラ設定を反映する事ができます。
この設定は動きを滑らかにしてくれます。ただ、無限ループになってしまうので `change` イベントから直接 `render` を呼び出す事はできません。
コントロールは `change` イベントを送信して `render` を呼び出し `render` は `controls.update` を呼び出します。
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

違いがわかりにくいかもしれませんが、以下の例をクリックして矢印キーを使って移動したりドラッグして回転させてみて下さい。
次に上記の例をクリックして同じ事をしてみて下さい。
上記の例は矢印キーを押したりドラッグしたりするとスナップし以下の例はスライドします。

{{{example url="../threejs-render-on-demand-w-damping.html" }}}

シンプルなdat.GUIのGUIを追加し、変更を要求に応じてレンダリングできるようにしてみましょう。

```js
import * as THREE from './resources/three/r119/build/three.module.js';
import {OrbitControls} from './resources/threejs/r119/examples/jsm/controls/OrbitControls.js';
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

dat.GUIコントロールには`onChange`メソッドがあり、GUIが値を変更した時に呼び出されるコールバックを渡す事ができます。今回は `requestRenderIfNotRequested`を呼び出すだけです。
`folder.open` を呼び出すとフォルダが展開できます。

{{{example url="../threejs-render-on-demand-w-gui.html" }}}

three.jsを連続ではなく、要求に応じてレンダリングさせる方法のヒントになれば幸いです。
three.jsを要求に応じてレンダリングするアプリ/ページはあまり一般的ではありませんが、three.jsを使用しているページの多くはゲームや3Dアニメーション、エディタ、3Dグラフ生成、商品カタログなどのアートです。
