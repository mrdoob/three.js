Title: Three.jsでGLFTファイルを読み込む
Description: GLTFファイルの読み込み
TOC: GLTFファイルの読み込み

前回のレッスンは[OBJファイルの読み込み](threejs-load-obj.html)でした。
まだ読んでいない方は、まずそちらをチェックしてみて下さい。

前回の記事で指摘したように、OBJファイルフォーマットは非常に古くかなり単純です。
OBJから読み込まれたデータはシーングラフを提供しないため、全て1つの大きなメッシュになります。
OBJは3Dエディタ間でデータを渡す単純な方法として設計されました。

[gLTFフォーマット](https://github.com/KhronosGroup/glTF)はグラフィックを表示するために設計されたフォーマットです。
3Dフォーマットは基本的に3～4種類に分けられます。

* 3Dエディタのフォーマット

  これは1つのアプリ固有フォーマットです。.blend (Blender)、.max (3d Studio Max)、.mb、.ma (Maya) など。

* 交換フォーマット

  これはOBJ、DAE（Collada）、FBXのようなフォーマットです。
  3Dエディタ間の情報交換をサポートするように設計されています。
  このフォーマットは通常は3Dエディタの内部でのみ使用される追加情報を持ち、必要以上に大きくなります。

* アプリのフォーマット

  特定のアプリ、通常はゲームに特化したフォーマットです。

* 伝送フォーマット

  gLTFは初めての伝送フォーマットかもしれません。
  VRMLも伝送フォーマットかもしれませんが、VRMLはかなり貧弱なフォーマットでした。

  gLTFは他の全てのフォーマットではできない、以下の事ができるように設計されています。

  1. 伝送を小さくする

    頂点のような大きなデータの多くがバイナリで保存されています。
    gLTFファイルのダウンロード時、ゼロ処理でGPUにアップロードできます。
    その機能は用意されています。
    VRML、OBJ、またはDAEファイルのように頂点がテキストで保存され、解析が必要である事とは対照的です。テキストの頂点位置はバイナリよりも3倍から5倍の大きさです。

  2. レンダリングの準備ができている

    これもおそらく他のフォーマット（アプリのフォーマット以外）とは違います。
    glTFファイル内のデータはレンダリングされる事が目的で、編集される事は目的としていません。
    レンダリングに重要でないデータは削除されています。
    ポリゴンが三角形に変換されています。
    マテリアルにはどこでも動くようにサポートされた値を持っています。

最低限の手間でglTFファイルをダウンロードし表示できるように、特別に設計されています。
他のどのフォーマットもこれができなかったので、この設計は良い結果になると信じましょう。

私は何を見せれば良いのか迷っていました。
ある程度のレベルではgLTFファイルの読み込みと表示は、OBJファイルよりも簡単です。
OBJとは異なり、gLTFではマテリアルはフォーマットの直接的な部分です。
少なくともglTFファイルを読み込む例を見せるべきで、私が遭遇した問題をレビューすると皆さんが良い情報を得られるかもしれないと思いました。

ネットで検索したら[antonmoek](https://sketchfab.com/antonmoek)さんの[低ポリゴンのシティモデル](https://sketchfab.com/models/edd1c604e1e045a0a2a552ddd9a293e6)を見つけました。
運が良ければ良い例になるように思えました。

<div class="threejs_center"><img src="resources/images/cartoon_lowpoly_small_city_free_pack.jpg"></div>

[OBJファイルの読み込みのコード例](threejs-load-obj.html)から始めて、OBJを読み込むコードを削除し、GLTFを読み込むコードに置き換えました。

以前のOBJコードは

```js
const mtlLoader = new MTLLoader();
mtlLoader.loadMtl('resources/models/windmill/windmill-fixed.mtl', (mtl) => {
  mtl.preload();
  mtl.materials.Material.side = THREE.DoubleSide;
  objLoader.setMaterials(mtl);
  objLoader.load('resources/models/windmill/windmill.obj', (event) => {
    const root = event.detail.loaderRootNode;
    scene.add(root);
    ...
  });
});
```

新しいGLTFのコードは

```js
{
  const gltfLoader = new GLTFLoader();
  const url = 'resources/models/cartoon_lowpoly_small_city_free_pack/scene.gltf';
  gltfLoader.load(url, (gltf) => {
    const root = gltf.scene;
    scene.add(root);
    ...
  });
```

自動フレーミングのコードは以前のままです。

また `OBJLoader` を取り除き `GLTFLoader` を含める必要があります。

```html
-import {LoaderSupport} from './resources/threejs/r127/examples/jsm/loaders/LoaderSupport.js';
-import {OBJLoader} from './resources/threejs/r127/examples/jsm/loaders/OBJLoader.js';
-import {MTLLoader} from './resources/threejs/r127/examples/jsm/loaders/MTLLoader.js';
+import {GLTFLoader} from './resources/threejs/r127/examples/jsm/loaders/GLTFLoader.js';
```

実行すると以下になりました。

{{{example url="../threejs-load-gltf.html" }}}

魔法だ！テクスチャーも含めて上手くいっています。

次に走り回る車をアニメーションしたかったので、シーンに車が別のエンティティとして設定されているか、それが使用できるように設定されているか確認する必要があります。

[JavaScriptコンソール](threejs-debugging-javascript.html)にシーングラフをダンプするコードを書いてみました。

シーングラフを表示するコードです。

```js
function dumpObject(obj, lines = [], isLast = true, prefix = '') {
  const localPrefix = isLast ? '└─' : '├─';
  lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`);
  const newPrefix = prefix + (isLast ? '  ' : '│ ');
  const lastNdx = obj.children.length - 1;
  obj.children.forEach((child, ndx) => {
    const isLast = ndx === lastNdx;
    dumpObject(child, lines, isLast, newPrefix);
  });
  return lines;
}
```

そして、シーンを読み込み直後に呼び出します。

```js
const gltfLoader = new GLTFLoader();
gltfLoader.load('resources/models/cartoon_lowpoly_small_city_free_pack/scene.gltf', (gltf) => {
  const root = gltf.scene;
  scene.add(root);
  console.log(dumpObject(root).join('\n'));
```

[実行すると](../threejs-load-gltf-dump-scenegraph.html) このようなリストが得られました。

```text
OSG_Scene [Scene]
  └─RootNode_(gltf_orientation_matrix) [Object3D]
    └─RootNode_(model_correction_matrix) [Object3D]
      └─4d4100bcb1c640e69699a87140df79d7fbx [Object3D]
        └─RootNode [Object3D]
          │ ...
          ├─Cars [Object3D]
          │ ├─CAR_03_1 [Object3D]
          │ │ └─CAR_03_1_World_ap_0 [Mesh]
          │ ├─CAR_03 [Object3D]
          │ │ └─CAR_03_World_ap_0 [Mesh]
          │ ├─Car_04 [Object3D]
          │ │ └─Car_04_World_ap_0 [Mesh]
          │ ├─CAR_03_2 [Object3D]
          │ │ └─CAR_03_2_World_ap_0 [Mesh]
          │ ├─Car_04_1 [Object3D]
          │ │ └─Car_04_1_World_ap_0 [Mesh]
          │ ├─Car_04_2 [Object3D]
          │ │ └─Car_04_2_World_ap_0 [Mesh]
          │ ├─Car_04_3 [Object3D]
          │ │ └─Car_04_3_World_ap_0 [Mesh]
          │ ├─Car_04_4 [Object3D]
          │ │ └─Car_04_4_World_ap_0 [Mesh]
          │ ├─Car_08_4 [Object3D]
          │ │ └─Car_08_4_World_ap8_0 [Mesh]
          │ ├─Car_08_3 [Object3D]
          │ │ └─Car_08_3_World_ap9_0 [Mesh]
          │ ├─Car_04_1_2 [Object3D]
          │ │ └─Car_04_1_2_World_ap_0 [Mesh]
          │ ├─Car_08_2 [Object3D]
          │ │ └─Car_08_2_World_ap11_0 [Mesh]
          │ ├─CAR_03_1_2 [Object3D]
          │ │ └─CAR_03_1_2_World_ap_0 [Mesh]
          │ ├─CAR_03_2_2 [Object3D]
          │ │ └─CAR_03_2_2_World_ap_0 [Mesh]
          │ ├─Car_04_2_2 [Object3D]
          │ │ └─Car_04_2_2_World_ap_0 [Mesh]
          ...
```

この結果から全ての車が `"Cars"` という名前の親の下にある事がわかります。

```text
*          ├─Cars [Object3D]
          │ ├─CAR_03_1 [Object3D]
          │ │ └─CAR_03_1_World_ap_0 [Mesh]
          │ ├─CAR_03 [Object3D]
          │ │ └─CAR_03_World_ap_0 [Mesh]
          │ ├─Car_04 [Object3D]
          │ │ └─Car_04_World_ap_0 [Mesh]
```

そこで簡単なテストとして、"Cars"ノードの全ての子をY軸の周りに回転させようと思いました。

シーンを読み込み後に"Cars"ノードを調べて結果を保存しました。

```js
+let cars;
{
  const gltfLoader = new GLTFLoader();
  gltfLoader.load('resources/models/cartoon_lowpoly_small_city_free_pack/scene.gltf', (gltf) => {
    const root = gltf.scene;
    scene.add(root);
+    cars = root.getObjectByName('Cars');
```

`render` 関数で `cars` の全ての子の回転を設定します。

```js
+function render(time) {
+  time *= 0.001;  // convert to seconds

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

+  if (cars) {
+    for (const car of cars.children) {
+      car.rotation.y = time;
+    }
+  }

  renderer.render(scene, camera);

  requestAnimationFrame(render);
}
```

これが結果です。

{{{example url="../threejs-load-gltf-rotate-cars.html" }}}

うーん、残念ながら子のオリジンが回転目的のために設定されておらず、アニメーション用に設計されてないようです。トラックの回転方向が間違っています。

3Dで何かする場合の重要なポイントは、事前に計画を立ててアセットを設計する必要があります。アセットを正しい場所に配置し、正しいスケールになるようにデザインします。

私は3DCGアーティストではなくBlenderもよく知らないので、ハックしてみます。
それぞれの車で別の `Object3D` を親にします。
次に `Object3D` オブジェクトを移動させて車を移動させます。
個々に車のオリジンに `Object3D` を設定して向きを変えられるので、必要な位置に設定する事ができます。

シーングラフのリストを見返すと "Car_08", "CAR_03", "Car_04" の3種類しかないようです。上手くいけば3種類の調整で済みます。

コードを以下のように変更しました。
それぞれの車でインスタンス作成した `Object3D` を親にし、その `Object3D` をシーンに追加します。
*車種*ごとの設定で向きを固定し、車の親の `Object3D` の `cars` 配列を追加します。

```js
-let cars;
+const cars = [];
{
  const gltfLoader = new GLTFLoader();
  gltfLoader.load('resources/models/cartoon_lowpoly_small_city_free_pack/scene.gltf', (gltf) => {
    const root = gltf.scene;
    scene.add(root);

-    cars = root.getObjectByName('Cars');
+    const loadedCars = root.getObjectByName('Cars');
+    const fixes = [
+      { prefix: 'Car_08', rot: [Math.PI * .5, 0, Math.PI +* .5], },
+      { prefix: 'CAR_03', rot: [0, Math.PI, 0], },
+      { prefix: 'Car_04', rot: [0, Math.PI, 0], },
+    ];
+
+    root.updateMatrixWorld();
+    for (const car of loadedCars.children.slice()) {
+      const fix = fixes.find(fix => car.name.startsWith(fix.prefix));
+      const obj = new THREE.Object3D();
+      car.getWorldPosition(obj.position);
+      car.position.set(0, 0, 0);
+      car.rotation.set(...fix.rot);
+      obj.add(car);
+      scene.add(obj);
+      cars.push(obj);
+    }
     ...
```

これで車の向きを修正しました。

{{{example url="../threejs-load-gltf-rotate-cars-fixed.html" }}}

さあ、追い回してみましょう。

簡単なドライビングシステムを作るのはこの記事では無理がありますが、
その代わりに入り組んだパスを1本にし、そのパスに車を乗せる事ができそうです。
以下の画像はBlenderでパスを作っている途中です。

<div class="threejs_center"><img src="resources/images/making-path-for-cars.jpg" style="width: 1094px"></div>

Blenderからパスのデータを取り出す方法が必要でした。
幸運な事にパスだけを選択し、"write nurbs"をチェックしてobjをエクスポートできました。

<div class="threejs_center"><img src="resources/images/blender-export-obj-write-nurbs.jpg" style="width: 498px"></div>

OBJファイルを開くと頂点のリストを得る事ができました。

```js
const controlPoints = [
  [1.118281, 5.115846, -3.681386],
  [3.948875, 5.115846, -3.641834],
  [3.960072, 5.115846, -0.240352],
  [3.985447, 5.115846, 4.585005],
  [-3.793631, 5.115846, 4.585006],
  [-3.826839, 5.115846, -14.736200],
  [-14.542292, 5.115846, -14.765865],
  [-14.520929, 5.115846, -3.627002],
  [-5.452815, 5.115846, -3.634418],
  [-5.467251, 5.115846, 4.549161],
  [-13.266233, 5.115846, 4.567083],
  [-13.250067, 5.115846, -13.499271],
  [4.081842, 5.115846, -13.435463],
  [4.125436, 5.115846, -5.334928],
  [-14.521364, 5.115846, -5.239871],
  [-14.510466, 5.115846, 5.486727],
  [5.745666, 5.115846, 5.510492],
  [5.787942, 5.115846, -14.728308],
  [-5.423720, 5.115846, -14.761919],
  [-5.373599, 5.115846, -3.704133],
  [1.004861, 5.115846, -3.641834],
];
```

THREE.jsにはいくつかの曲線クラスがあります。
`CatmullRomCurve3` が使えそうな気がしたので `CatmullRomCurve3` を使ってみた。
この曲線は頂点を通る滑らかな曲線を作ります。

実際にはこれらの頂点を直接入力すると次のような曲線が生成されます。

<div class="threejs_center"><img src="resources/images/car-curves-before.png" style="width: 400px"></div>

しかし、もっと角をシャープにして欲しいです。
いくつかの頂点を追加し計算すれば、望んだ角度が得られる気がします。
各頂点のペアで2つのポイントの間の10%と90%の道を計算し、その結果を `CatmullRomCurve3` に渡します。

このような曲線が得られます。

<div class="threejs_center"><img src="resources/images/car-curves-after.png" style="width: 400px"></div>

曲線を作成するコードは以下の通りです。

```js
let curve;
let curveObject;
{
  const controlPoints = [
    [1.118281, 5.115846, -3.681386],
    [3.948875, 5.115846, -3.641834],
    [3.960072, 5.115846, -0.240352],
    [3.985447, 5.115846, 4.585005],
    [-3.793631, 5.115846, 4.585006],
    [-3.826839, 5.115846, -14.736200],
    [-14.542292, 5.115846, -14.765865],
    [-14.520929, 5.115846, -3.627002],
    [-5.452815, 5.115846, -3.634418],
    [-5.467251, 5.115846, 4.549161],
    [-13.266233, 5.115846, 4.567083],
    [-13.250067, 5.115846, -13.499271],
    [4.081842, 5.115846, -13.435463],
    [4.125436, 5.115846, -5.334928],
    [-14.521364, 5.115846, -5.239871],
    [-14.510466, 5.115846, 5.486727],
    [5.745666, 5.115846, 5.510492],
    [5.787942, 5.115846, -14.728308],
    [-5.423720, 5.115846, -14.761919],
    [-5.373599, 5.115846, -3.704133],
    [1.004861, 5.115846, -3.641834],
  ];
  const p0 = new THREE.Vector3();
  const p1 = new THREE.Vector3();
  curve = new THREE.CatmullRomCurve3(
    controlPoints.map((p, ndx) => {
      p0.set(...p);
      p1.set(...controlPoints[(ndx + 1) % controlPoints.length]);
      return [
        (new THREE.Vector3()).copy(p0),
        (new THREE.Vector3()).lerpVectors(p0, p1, 0.1),
        (new THREE.Vector3()).lerpVectors(p0, p1, 0.9),
      ];
    }).flat(),
    true,
  );
  {
    const points = curve.getPoints(250);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({color: 0xff0000});
    curveObject = new THREE.Line(geometry, material);
    scene.add(curveObject);
  }
}
```

このコードの最初の部分は曲線を作ります。
コードの2番目の部分は曲線から250頂点を生成し、その250頂点を結んで作られた線を表示するオブジェクトを作成します。

[このサンプル](../threejs-load-gltf-car-path.html)を実行してもカーブが見えませんでした。
見えるようにするために、深度テストを無視して最後にレンダリングするようにしました。

```js
    curveObject = new THREE.Line(geometry, material);
+    material.depthTest = false;
+    curveObject.renderOrder = 1;
```

そして、カーブがあまりにも小さすぎる事に気がつきました。

<div class="threejs_center"><img src="resources/images/car-curves-too-small.png" style="width: 498px"></div>

Blenderで階層を確認してみると、3DCGアーティストが全ての親となるノードをスケーリングしていました。

<div class="threejs_center"><img src="resources/images/cars-scale-0.01.png" style="width: 342px;"></div>

リアルタイムの3Dアプリではスケーリングが悪です。
リアルタイム3Dを行う際には、様々な問題が発生し不満が尽きません。
3Dアプリ開発ではシーン全体を拡大縮小するのはとても簡単ですが、3DCGアーティストはこれを知らない事が多いです。
もしあなたがリアルタイムの3Dアプリを作ろうと決めたら、3DCGアーティストには絶対に何もスケールしないようにお願いする事をお勧めします。
スケールを変更する場合は、そのスケールを頂点に適用する方法を見つける必要があります。

スケールだけでなく、その親である `Cars` ノードによって回転されオフセットされます。
これでは実行時にワールド座標での車の移動が困難になります。
はっきり言うと、この場合はワールド座標で車を走らせたいのでこの問題が出てきます。
月が地球を中心に回転しているようなローカル座標で操作される場合、これはあまり問題ではありません。

上記で書いたシーングラフをダンプする関数に戻り、各ノードの位置、回転、スケールをダンプしてみましょう。

```js
+function dumpVec3(v3, precision = 3) {
+  return `${v3.x.toFixed(precision)}, ${v3.y.toFixed(precision)}, ${v3.z.toFixed(precision)}`;
+}

function dumpObject(obj, lines, isLast = true, prefix = '') {
  const localPrefix = isLast ? '└─' : '├─';
  lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`);
+  const dataPrefix = obj.children.length
+     ? (isLast ? '  │ ' : '│ │ ')
+     : (isLast ? '    ' : '│   ');
+  lines.push(`${prefix}${dataPrefix}  pos: ${dumpVec3(obj.position)}`);
+  lines.push(`${prefix}${dataPrefix}  rot: ${dumpVec3(obj.rotation)}`);
+  lines.push(`${prefix}${dataPrefix}  scl: ${dumpVec3(obj.scale)}`);
  const newPrefix = prefix + (isLast ? '  ' : '│ ');
  const lastNdx = obj.children.length - 1;
  obj.children.forEach((child, ndx) => {
    const isLast = ndx === lastNdx;
    dumpObject(child, lines, isLast, newPrefix);
  });
  return lines;
}
```

[それを実行](../threejs-load-gltf-dump-scenegraph-extra.html)した結果です。

```text
OSG_Scene [Scene]
  │   pos: 0.000, 0.000, 0.000
  │   rot: 0.000, 0.000, 0.000
  │   scl: 1.000, 1.000, 1.000
  └─RootNode_(gltf_orientation_matrix) [Object3D]
    │   pos: 0.000, 0.000, 0.000
    │   rot: -1.571, 0.000, 0.000
    │   scl: 1.000, 1.000, 1.000
    └─RootNode_(model_correction_matrix) [Object3D]
      │   pos: 0.000, 0.000, 0.000
      │   rot: 0.000, 0.000, 0.000
      │   scl: 1.000, 1.000, 1.000
      └─4d4100bcb1c640e69699a87140df79d7fbx [Object3D]
        │   pos: 0.000, 0.000, 0.000
        │   rot: 1.571, 0.000, 0.000
        │   scl: 1.000, 1.000, 1.000
        └─RootNode [Object3D]
          │   pos: 0.000, 0.000, 0.000
          │   rot: 0.000, 0.000, 0.000
          │   scl: 1.000, 1.000, 1.000
          ├─Cars [Object3D]
*          │ │   pos: -369.069, -90.704, -920.159
*          │ │   rot: 0.000, 0.000, 0.000
*          │ │   scl: 1.000, 1.000, 1.000
          │ ├─CAR_03_1 [Object3D]
          │ │ │   pos: 22.131, 14.663, -475.071
          │ │ │   rot: -3.142, 0.732, 3.142
          │ │ │   scl: 1.500, 1.500, 1.500
          │ │ └─CAR_03_1_World_ap_0 [Mesh]
          │ │       pos: 0.000, 0.000, 0.000
          │ │       rot: 0.000, 0.000, 0.000
          │ │       scl: 1.000, 1.000, 1.000
```

これは元のシーンの `Cars` の回転とスケールが削除され、子に適用されています。
この原因は、GLTFファイルを作成するために使用されたエクスポータが何か特別な作業をしたか、または3DCGアーティストが対応するblendファイルとは異なるバージョンのファイルをエクスポートした可能性が高いです。

この事から学ぶ教訓は、blendファイルをダウンロードして自分でエクスポートするべきという事です。
エクスポートする前に主要なノードを全て検査し、変換を削除しておくべきでした。

Topにあるこれら全てのノードは以下の通りです。

```text
OSG_Scene [Scene]
  │   pos: 0.000, 0.000, 0.000
  │   rot: 0.000, 0.000, 0.000
  │   scl: 1.000, 1.000, 1.000
  └─RootNode_(gltf_orientation_matrix) [Object3D]
    │   pos: 0.000, 0.000, 0.000
    │   rot: -1.571, 0.000, 0.000
    │   scl: 1.000, 1.000, 1.000
    └─RootNode_(model_correction_matrix) [Object3D]
      │   pos: 0.000, 0.000, 0.000
      │   rot: 0.000, 0.000, 0.000
      │   scl: 1.000, 1.000, 1.000
      └─4d4100bcb1c640e69699a87140df79d7fbx [Object3D]
        │   pos: 0.000, 0.000, 0.000
        │   rot: 1.571, 0.000, 0.000
        │   scl: 1.000, 1.000, 1.000
```

この階層構造はもったいないですね。

理想的にはシーンは位置、回転、スケールのない単一の"ルート"ノードで構成される事です。
実行時にはそのルートから全ての子を取り出し、シーン自体を親にする事ができます。
"Cars"のようなルートの子があるかもしれませんが、全ての車を見つけるのに役立ちます。理想的には平行移動、回転、スケールがないので、最小限の作業でシーンを車の親にする事ができます。

いずれにしても、カーブを表示するために使用しているオブジェクトを調整するのが一番手っ取り早いのですが、最善の方法ではないかもしれません。

結局はこんな感じですね。

最初にカーブの位置を調整し、上手くいきそうな値を見つけました。そして隠しました。

```js
{
  const points = curve.getPoints(250);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({color: 0xff0000});
  curveObject = new THREE.Line(geometry, material);
+  curveObject.scale.set(100, 100, 100);
+  curveObject.position.y = -621;
+  curveObject.visible = false;
  material.depthTest = false;
  curveObject.renderOrder = 1;
  scene.add(curveObject);
}
```

それからカーブに沿って移動させるコードを書きました。
それぞれの車で曲線に沿って0から1までの位置を選び `curveObject` を用いてワールド座標上の頂点を計算して変換します。
次にカーブの少し下の方にある別の頂点を選びます。
車の向きを `lookAt` で設定し、2点間の中間点に車を配置します。

```js
// create 2 Vector3s we can use for path calculations
const carPosition = new THREE.Vector3();
const carTarget = new THREE.Vector3();

function render(time) {
  ...

-  for (const car of cars) {
-    car.rotation.y = time;
-  }

+  {
+    const pathTime = time * .01;
+    const targetOffset = 0.01;
+    cars.forEach((car, ndx) => {
+      // a number between 0 and 1 to evenly space the cars
+      const u = pathTime + ndx / cars.length;
+
+      // get the first point
+      curve.getPointAt(u % 1, carPosition);
+      carPosition.applyMatrix4(curveObject.matrixWorld);
+
+      // get a second point slightly further down the curve
+      curve.getPointAt((u + targetOffset) % 1, carTarget);
+      carTarget.applyMatrix4(curveObject.matrixWorld);
+
+      // put the car at the first point (temporarily)
+      car.position.copy(carPosition);
+      // point the car the second point
+      car.lookAt(carTarget);
+
+      // put the car between the 2 points
+      car.position.lerpVectors(carPosition, carTarget, 0.5);
+    });
+  }
```

そしてそれを実行すると、それぞれの車のオリジンの上に高さが一貫して設定されていなかったので、少しオフセットする必要がありました。

```js
const loadedCars = root.getObjectByName('Cars');
const fixes = [
-  { prefix: 'Car_08', rot: [Math.PI * .5, 0, Math.PI * .5], },
-  { prefix: 'CAR_03', rot: [0, Math.PI, 0], },
-  { prefix: 'Car_04', rot: [0, Math.PI, 0], },
+  { prefix: 'Car_08', y: 0,  rot: [Math.PI * .5, 0, Math.PI * .5], },
+  { prefix: 'CAR_03', y: 33, rot: [0, Math.PI, 0], },
+  { prefix: 'Car_04', y: 40, rot: [0, Math.PI, 0], },
];

root.updateMatrixWorld();
for (const car of loadedCars.children.slice()) {
  const fix = fixes.find(fix => car.name.startsWith(fix.prefix));
  const obj = new THREE.Object3D();
  car.getWorldPosition(obj.position);
-  car.position.set(0, 0, 0);
+  car.position.set(0, fix.y, 0);
  car.rotation.set(...fix.rot);
  obj.add(car);
  scene.add(obj);
  cars.push(obj);
}
```

その結果です。

{{{example url="../threejs-load-gltf-animated-cars.html" }}}

数分間の作業にしては悪くない結果です。

最後にやりたいのはシャドウをつける事です。

これを行うために[シャドウの記事](threejs-shadows.html)にある `DirectionalLight` の例から全てのGUIコードを取得し、最新のコードに貼り付けました。

読み込み後に全てのオブジェクトにシャドウをオンにする必要があります。

```js
{
  const gltfLoader = new GLTFLoader();
  gltfLoader.load('resources/models/cartoon_lowpoly_small_city_free_pack/scene.gltf', (gltf) => {
    const root = gltf.scene;
    scene.add(root);

+    root.traverse((obj) => {
+      if (obj.castShadow !== undefined) {
+        obj.castShadow = true;
+        obj.receiveShadow = true;
+      }
+    });
```

シャドウヘルパーが機能していない理由を探るのに4時間近くを費やしました。
シャドウを有効にするのを忘れていたのが原因でした。

```js
renderer.shadowMap.enabled = true;
```

😭

そのあと、`DirectionLight` のシャドウカメラがシーン全体を覆うようになるまで値を調整しました。
これらの設定は私が最終的にたどり着いたものです。

```js
{
  const color = 0xFFFFFF;
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
+  light.castShadow = true;
*  light.position.set(-250, 800, -850);
*  light.target.position.set(-550, 40, -450);

+  light.shadow.bias = -0.004;
+  light.shadow.mapSize.width = 2048;
+  light.shadow.mapSize.height = 2048;

  scene.add(light);
  scene.add(light.target);
+  const cam = light.shadow.camera;
+  cam.near = 1;
+  cam.far = 2000;
+  cam.left = -1500;
+  cam.right = 1500;
+  cam.top = 1500;
+  cam.bottom = -1500;
...
```

また、背景色を水色に設定してみました。

```js
const scene = new THREE.Scene();
-scene.background = new THREE.Color('black');
+scene.background = new THREE.Color('#DEFEFF');
```

そして、シャドウをつけた結果です。

{{{example url="../threejs-load-gltf-shadows.html" }}}

このプロジェクトを説明する事で、シーングラフを使ってファイルを読込する際の問題点・解決事例をいくつか示せたと思います。

興味深いのはblendファイルとgltfファイルの場合、blendファイルにはいくつかのライトがありますが、シーンに読み込み後はライトがありません。
GLTFファイルはただのJSONファイルなので簡単に中身を見れます。
これは複数の配列から成り、配列内の各項目は他の場所にインデックスを付けて参照されます。
拡張機能がありますが、ほとんど全ての3Dフォーマットの問題を指摘しています。**全てのケースをカバーする事はできません。**

もっとデータが欲しいというニーズは常にあります。
例えば今回は手動で車のパスをエクスポートしました。
理想的にはGLTFファイルに情報を格納する事ができますが、独自のエクスポーターを作成しエクスポートしたい方法でノードをマークするか、命名スキームなどを使用してデータを作成するために使用しているツールからアプリにデータを取得する必要があります。

その全ては読者の皆様の演習としてお任せします。
