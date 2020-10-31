Title: Three.jsの透過
Description: Three.jsで透過の問題に対処する方法
TOC: 透明なオブジェクトの描画方法

Three.jsでの透過は簡単な方法と難しい方法があります。

まずは簡単な方法を見ていきましょう。
2 x 2 x 2のグリッドに8個のキューブを配置したシーンを作ってみましょう。

[要求されたレンダリングの記事](threejs-rendering-on-demand.html)の例から始めて、3個から8個のキューブになるように修正します。
まず `makeInstance` 関数の引数に x, y, z を追加しましょう。

```js
-function makeInstance(geometry, color) {
+function makeInstance(geometry, color, x, y, z) {
  const material = new THREE.MeshPhongMaterial({color});

  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

-  cube.position.x = x;
+  cube.position.set(x, y, z);

  return cube;
}
```

これで8個のキューブを作れます。

```js
+function hsl(h, s, l) {
+  return (new THREE.Color()).setHSL(h, s, l);
+}

-makeInstance(geometry, 0x44aa88,  0);
-makeInstance(geometry, 0x8844aa, -2);
-makeInstance(geometry, 0xaa8844,  2);

+{
+  const d = 0.8;
+  makeInstance(geometry, hsl(0 / 8, 1, .5), -d, -d, -d);
+  makeInstance(geometry, hsl(1 / 8, 1, .5),  d, -d, -d);
+  makeInstance(geometry, hsl(2 / 8, 1, .5), -d,  d, -d);
+  makeInstance(geometry, hsl(3 / 8, 1, .5),  d,  d, -d);
+  makeInstance(geometry, hsl(4 / 8, 1, .5), -d, -d,  d);
+  makeInstance(geometry, hsl(5 / 8, 1, .5),  d, -d,  d);
+  makeInstance(geometry, hsl(6 / 8, 1, .5), -d,  d,  d);
+  makeInstance(geometry, hsl(7 / 8, 1, .5),  d,  d,  d);
+}
```

カメラの調整もしました。

```js
const fov = 75;
const aspect = 2;  // the canvas default
const near = 0.1;
-const far = 5;
+const far = 25;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
-camera.position.z = 4;
+camera.position.z = 2;
```

背景を白に設定します。

```js
const scene = new THREE.Scene();
+scene.background = new THREE.Color('white');
```

そして2つ目のライトを追加したので、キューブの全ての側面が照らされるようになりました。

```js
-{
+function addLight(...pos) {
  const color = 0xFFFFFF;
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
-  light.position.set(-1, 2, 4);
+  light.position.set(...pos);
  scene.add(light);
}
+addLight(-1, 2, 4);
+addLight( 1, -1, -2);
```

キューブを透過するには [`transparent`](Material.transparent)フラグを設定し、[`opacity`](Material.opacity)を設定する必要があります。opacityは1は完全な不透明、0は完全な透明です。

```js
function makeInstance(geometry, color, x, y, z) {
-  const material = new THREE.MeshPhongMaterial({color});
+  const material = new THREE.MeshPhongMaterial({
+    color,
+    opacity: 0.5,
+    transparent: true,
+  });

  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  cube.position.set(x, y, z);

  return cube;
}
```

8個の透明なキューブになりました。

{{{example url="../threejs-transparency.html"}}}

上記の動作サンプルの上でドラッグしてビューを回転してみて下さい。

簡単に修正できたようですが...よく見て下さい。キューブの裏面がないです。

<div class="threejs_center"><img src="resources/images/transparency-cubes-no-backs.png" style="width: 416px;"></div>
<div class="threejs_center">no backs</div>

[マテリアルの記事](threejs-materials.html)でマテリアルのプロパティ[`side`](Material.side)について学びました。
`THREE.DoubleSide` に設定し、各キューブの両面が描画されるようにします。

```js
const material = new THREE.MeshPhongMaterial({
  color,
  map: loader.load(url),
  opacity: 0.5,
  transparent: true,
+  side: THREE.DoubleSide,
});
```

これが結果です。

{{{example url="../threejs-transparency-doubleside.html" }}}

回転させてみて下さい。
裏面を見ると上手く動作してるように見えますが、時々できない事があります。

<div class="threejs_center"><img src="resources/images/transparency-cubes-some-backs.png" style="width: 368px;"></div>
<div class="threejs_center">the left back face of each cube is missing</div>

これは3Dオブジェクトの一般的な描画で発生します。
各ジオメトリの各三角形は一度に1つずつ描画します。
三角形の各ピクセルが描画されると2つの事が記録されます。
1つはそのピクセルの色、もう1つはそのピクセルの深さです。
次の三角形が描画される時、以前に記録された深さよりも各ピクセルの深さが深い場合は描画されません。

不透明なものには効果的ですが、透明なものには失敗します。

解決策としては、透明なものを並べ替えて手前より奥のものから描画する事です。
Three.jsでは `Mesh` のようなオブジェクトに対してこれを行います。
そうでなければ、最初のサンプルではいくつかのキューブが他のキューブをブロックし、描画に失敗していたでしょう。
残念ながら、個々の三角形が破綻し非常に遅くなります。

キューブには12個の三角形が各面に2個ずつあり、描画される順番は[ジオメトリで作られた順番と同じ](threejs-custom-buffergeometry.html)です。
そのため、どちらの方向を見ているかによって、カメラに近い三角形が最初に描画されるかもしれません。
その場合、裏面の三角形は描画されません。これにより時々裏面が見えない事があります。

球体やキューブのような凸状のオブジェクトの場合は、全てのキューブをシーンに2個ずつ追加するのが1つの解決法です。
裏面の三角形だけを描画するマテリアルで1個、表面の三角形だけを描画するマテリアルで1個です。

```js
function makeInstance(geometry, color, x, y, z) {
+  [THREE.BackSide, THREE.FrontSide].forEach((side) => {
    const material = new THREE.MeshPhongMaterial({
      color,
      opacity: 0.5,
      transparent: true,
+      side,
    });

    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    cube.position.set(x, y, z);
+  });
}
```

それは *動作してるように見えます* 。

{{{example url="../threejs-transparency-doubleside-hack.html" }}}

この方法はThree.jsの並び順が安定している事が前提です。

つまり、最初に `side. THREE.BackSide` のメッシュを描画し、その後に `side.THREE.FrontSide` のメッシュを描画し、2つとも同じ位置にある場合です。

交差する平面を2つ作ってみましょう（キューブに関連するコードを全て削除後）。
各面に[テクスチャを追加](threejs-textures.html)します。

```js
const planeWidth = 1;
const planeHeight = 1;
const geometry = new THREE.PlaneBufferGeometry(planeWidth, planeHeight);

const loader = new THREE.TextureLoader();

function makeInstance(geometry, color, rotY, url) {
  const texture = loader.load(url, render);
  const material = new THREE.MeshPhongMaterial({
    color,
    map: texture,
    opacity: 0.5,
    transparent: true,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  mesh.rotation.y = rotY;
}

makeInstance(geometry, 'pink',       0,             'resources/images/happyface.png');
makeInstance(geometry, 'lightblue',  Math.PI * 0.5, 'resources/images/hmmmface.png');
```

平面は一度に片側しか見れないため、今回は `side: THREE.DoubleSide` を使えます。
また、`render` 関数にテクスチャ読み込み関数を渡し、読み込みの終了時に再レンダリングする事にも注意して下さい。
このサンプルが連続したレンダリングではなく、[要求されたレンダリング](threejs-rendering-on-demand.html)になっているためです。

{{{example url="../threejs-transparency-intersecting-planes.html"}}}

そしてまたしても同じような問題が発生しています。

<div class="threejs_center"><img src="resources/images/transparency-planes.png" style="width: 408px;"></div>
<div class="threejs_center">half a face is missing</div>

この解決策は各表面を手動で2つの表面に分割し、交差しないようにします。

```js
function makeInstance(geometry, color, rotY, url) {
+  const base = new THREE.Object3D();
+  scene.add(base);
+  base.rotation.y = rotY;

+  [-1, 1].forEach((x) => {
    const texture = loader.load(url, render);
+    texture.offset.x = x < 0 ? 0 : 0.5;
+    texture.repeat.x = .5;
    const material = new THREE.MeshPhongMaterial({
      color,
      map: texture,
      opacity: 0.5,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
-    scene.add(mesh);
+    base.add(mesh);

-    mesh.rotation.y = rotY;
+    mesh.position.x = x * .25;
  });
}
```

どうやって達成するかはあなた次第です。
[Blender](https://blender.org)のようなモデリングツールを使用していた場合は、テクスチャ座標を手動で調整すると思います。
ここでは `PlaneBufferGeometry` を使用していますが、デフォルトではテクスチャを平面全体に引き伸ばします。
[テクステャの記事で説明](threejs-textures.html)したように [`texture.repeat`](Texture.repeat) と [`texture.offset`](Texture.offset) を設定し、
各平面上の表面のテクスチャから正しい半分が得られるようにテクスチャを拡大縮小したり移動させたりできます。

上記のコードでは `Object3D` を作成し、その親となる2つの平面を作成しています。
親の `Object3D` を回転させた方が必要な計算するよりも簡単そうです。

{{{example url="../threejs-transparency-intersecting-planes-fixed.html"}}}

この解決策は、交点の位置を変えない2つの平面のような単純なものにしか機能しません。

テクスチャのあるオブジェクトの場合は、アルファテストを設定するのがもう1つの解決法です。

アルファテストでは、指定した*アルファ*の値以下ではピクセルを描画しません。
ピクセルを全く描画しなければ、上記のような奥行きの問題はなくなります。
比較的シャープなエッジの効いたテクスチャの場合、これはかなり効果的です。
例としては、植物や木の葉のテクスチャ、または草のパッチが含まれます。

2つの平面で試してみましょう。まずはテクスチャを使い分けてみましょう。
先ほどのテクスチャは不透明100％でした。この2つは透過を利用しています。

<div class="spread">
  <div><img class="checkerboard" src="../resources/images/tree-01.png"></div>
  <div><img class="checkerboard" src="../resources/images/tree-02.png"></div>
</div>

交差する2つの平面（分割する前）に戻り、これらのテクスチャを使用して [`alphaTest`](Material.alphaTest) を設定してみましょう。

```js
function makeInstance(geometry, color, rotY, url) {
  const texture = loader.load(url, render);
  const material = new THREE.MeshPhongMaterial({
    color,
    map: texture,
-    opacity: 0.5,
    transparent: true,
+    alphaTest: 0.5,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  mesh.rotation.y = rotY;
}

-makeInstance(geometry, 'pink',       0,             'resources/images/happyface.png');
-makeInstance(geometry, 'lightblue',  Math.PI * 0.5, 'resources/images/hmmmface.png');
+makeInstance(geometry, 'white', 0,             'resources/images/tree-01.png');
+makeInstance(geometry, 'white', Math.PI * 0.5, 'resources/images/tree-02.png');
```

これを実行する前に小さなUIを追加し、`alphaTest` と `transparent` の設定をもっと簡単に操作できるようにしましょう。
今回は[シーングラフの記事](threejs-scenegraph.html)で紹介したようにdat.guiを使います。

まず、シーン内の全てのマテリアルに値を設定するdat.guiのヘルパーを作ります。

```js
class AllMaterialPropertyGUIHelper {
  constructor(prop, scene) {
    this.prop = prop;
    this.scene = scene;
  }
  get value() {
    const {scene, prop} = this;
    let v;
    scene.traverse((obj) => {
      if (obj.material && obj.material[prop] !== undefined) {
        v = obj.material[prop];
      }
    });
    return v;
  }
  set value(v) {
    const {scene, prop} = this;
    scene.traverse((obj) => {
      if (obj.material && obj.material[prop] !== undefined) {
        obj.material[prop] = v;
        obj.material.needsUpdate = true;
      }
    });
  }
}
```

そして、guiを追加します。

```js
const gui = new GUI();
gui.add(new AllMaterialPropertyGUIHelper('alphaTest', scene), 'value', 0, 1)
    .name('alphaTest')
    .onChange(requestRenderIfNotRequested);
gui.add(new AllMaterialPropertyGUIHelper('transparent', scene), 'value')
    .name('transparent')
    .onChange(requestRenderIfNotRequested);
```

もちろん、dat.guiを含める必要があります。

```js
import * as THREE from './resources/three/r119/build/three.module.js';
import {OrbitControls} from './resources/threejs/r119/examples/jsm/controls/OrbitControls.js';
+import {GUI} from '../3rdparty/dat.gui.module.js';
```

その結果がこちらです。

{{{example url="../threejs-transparency-intersecting-planes-alphatest.html"}}}

動作していますが、ズームしてみると1つの平面に白い線が入っているのがわかります。

<div class="threejs_center"><img src="resources/images/transparency-alphatest-issues.png" style="width: 532px;"></div>

これは前と同じ、深さの問題です。
その平面が先に描画されていたので、後ろの平面は描画されません。
これに完全な解決策はありません。
使用例に合った解決策を見つけるために、`alphaTest` を調整したり `transparent` をオフにしたりして下さい。

この記事から完璧な透過を目指すのは難しいです。
問題とトレードオフと回避策があります。

例えば、あなたが車を持っていると言います。
車は通常、四方がフロントガラスになっています。
上記の並び順の問題を回避したいのであれば、各ウィンドウを独自のオブジェクトにして、three.jsがウィンドウを並び替えて正しい順序で描画できるようにする必要があります。

一部の植物や草を作っている場合は、アルファテストでの解決が一般的です。

どの解決策を選択するかは、あなたのニーズによります。
