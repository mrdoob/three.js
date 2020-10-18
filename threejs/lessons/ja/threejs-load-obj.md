Title: Three.jsで.OBJファイルを読み込む
Description: OBJファイルの読み込み
TOC: OBJファイルの読み込み

みんながthree.jsでやりたい事の1つに、3Dモデルをロードして表示があります。
一般的な3DフォーマットであるOBJファイルを読み込んでみましょう。

ネットで検索し[ahedov](https://www.blendswap.com/user/ahedov)さんの[CC-BY-NC 3.0 風車3Dモデル](https://www.blendswap.com/blends/view/69174)を見つけました。

<div class="threejs_center"><img src="resources/images/windmill-obj.jpg"></div>

blendファイルをダウンロードし[Blender](https://blender.org)で読み込んでOBJファイルを書き出してみました。

<div class="threejs_center"><img style="width: 827px;" src="resources/images/windmill-export-as-obj.jpg"></div>

> 注意：Blenderを使った事がない人は、Blenderは今まで使ってきた他のプログラムとは異なり驚くかもしれません。また、Blenderの基本的なUI操作を理解する時間が必要かもしれません。

> 一般的な3Dプログラムは、1000以上の機能を持つ巨大なモンスターである事も付け加えておきましょう。Blenderもその中の最も複雑なソフトウェアの1つです。
私が1996年に3D Studio Maxを初めて知った時、600ページのマニュアルの70%を3週間ほど1日数時間かけて読み通しました。
数年後にMayaを学んだ時には、3d Studio Maxで学んだ経験がMayaでも生かせました。
もし本当に3Dソフトウェアを使って3Dアセットを構築したり、既存のものを修正したりできるようになりたいなら、自分のスケジュールと時間を確保していくつかのレッスンを受ける事をお勧めします。

いずれにしても、私は以下のExportオプションを使用しました。

<div class="threejs_center"><img style="width: 239px;" src="resources/images/windmill-export-options.jpg"></div>

それでは表示してみましょう！

[ライティングの記事](threejs-lights.html) にあるディレクショナルライティングの例から始めて、半球ライティングの例と組み合わせて `HemisphereLight` と `DirectionalLight` を1つ作る事にしました。その結果として `HemisphereLight` は1つ、`DirectionalLight` は1つになりました。
また、ライトの調整に関連する全てのGUIを削除しました。シーンに追加していたキューブとスフィアも削除しました。

まず最初に `OBJLoader2` のローダーをコードに含める必要があります。

```js
import {OBJLoader2} from './resources/threejs/r119/examples/jsm/loaders/OBJLoader2.js';
```

次にOBJファイルをロードするために `OBJLoader2` のインスタンスを作成し、OBJファイルのURLを渡し、ロードされたモデルをシーンに追加するコールバックを渡します。

```js
{
  const objLoader = new OBJLoader2();
  objLoader.load('resources/models/windmill/windmill.obj', (root) => {
    scene.add(root);
  });
}
```

それを実行したらどうなりますか？

{{{example url="../threejs-load-obj-no-materials.html" }}}

これはやりたい事に近いですが、シーンにマテリアルとOBJファイルにマテリアルのパラメーターがなく、マテリアルのエラーが発生しています。

OBJローダーには名前とマテリアルのペアのオブジェクトを渡す事ができます。
OBJファイルをロードした時に見つけたマテリアル名で、ローダーに設定されたマテリアルのマップ内で対応するマテリアルを探します。
マテリアル名で一致するものが見つかった場合はそのマテリアルを使用します。
見つからない場合はローダーのデフォルトマテリアルを使用します。

OBJファイルにはマテリアルを定義するMTLファイルが付属している事があります。
今回はエクスポーターでMTLファイルも作成しました。
MTL形式はプレーンなASCIIコードなので見やすいです。MTLファイルの中身を見てみると

```mtl
# Blender MTL File: 'windmill_001.blend'
# Material Count: 2

newmtl Material
Ns 0.000000
Ka 1.000000 1.000000 1.000000
Kd 0.800000 0.800000 0.800000
Ks 0.000000 0.000000 0.000000
Ke 0.000000 0.000000 0.000000
Ni 1.000000
d 1.000000
illum 1
map_Kd windmill_001_lopatky_COL.jpg
map_Bump windmill_001_lopatky_NOR.jpg

newmtl windmill
Ns 0.000000
Ka 1.000000 1.000000 1.000000
Kd 0.800000 0.800000 0.800000
Ks 0.000000 0.000000 0.000000
Ke 0.000000 0.000000 0.000000
Ni 1.000000
d 1.000000
illum 1
map_Kd windmill_001_base_COL.jpg
map_Bump windmill_001_base_NOR.jpg
map_Ns windmill_001_base_SPEC.jpg
```

5つのjpgテクスチャを参照しているマテリアルが2つありますが、テクスチャのファイルはどこにあるのでしょうか？

<div class="threejs_center"><img style="width: 757px;" src="resources/images/windmill-exported-files.png"></div>

存在するのはOBJファイルとMTLファイルだけです。

このモデルではテクスチャはダウンロードしたblendファイルに埋め込まれている事が判明しました。
blenderで **File->External Data->Unpack All Into Files** を選択し、これらのファイルをエクスポートする事ができます。

<div class="threejs_center"><img style="width: 828px;" src="resources/images/windmill-export-textures.jpg"></div>

そして **Write Files to Current Directory** を選択します。

<div class="threejs_center"><img style="width: 828px;" src="resources/images/windmill-overwrite.jpg"></div>

これでテクスチャのファイルはblendファイルと同じフォルダ内の **textures** というサブフォルダに出力されます。

<div class="threejs_center"><img style="width: 758px;" src="resources/images/windmill-exported-texture-files.png"></div>

これらのテクスチャをOBJファイルと同じフォルダにコピーしました。

<div class="threejs_center"><img style="width: 757px;" src="resources/images/windmill-exported-files-with-textures.png"></div>

テクスチャを利用できるようになったのでMTLファイルをロードします。
`MTLLoader` と `MtlObjBridge` をimportする必要があります。

```js
import * as THREE from './resources/three/r119/build/three.module.js';
import {OrbitControls} from './resources/threejs/r119/examples/jsm/controls/OrbitControls.js';
import {OBJLoader2} from './resources/threejs/r119/examples/jsm/loaders/OBJLoader2.js';
+import {MTLLoader} from './resources/threejs/r119/examples/jsm/loaders/MTLLoader.js';
+import {MtlObjBridge} from './resources/threejs/r119/examples/jsm/loaders/obj2/bridge/MtlObjBridge.js';
```

まず、MTLファイルをロードします。
読込後にロードしたマテリアルを `MtlObjBridge` を通して `OBJLoader2` をロードしOBJファイルをロードします。

```js
{
+  const mtlLoader = new MTLLoader();
+  mtlLoader.load('resources/models/windmill/windmill.mtl', (mtlParseResult) => {
+    const materials =  MtlObjBridge.addMaterialsFromMtlLoader(mtlParseResult);
+    objLoader.addMaterials(materials);
    objLoader.load('resources/models/windmill/windmill.obj', (root) => {
      scene.add(root);
    });
+  });
}
```

それを試してみると...

{{{example url="../threejs-load-obj-materials.html" }}}

モデルを回転させると風車の布が消える事に注意して下さい。

<div class="threejs_center"><img style="width: 528px;" src="resources/images/windmill-missing-cloth.jpg"></div>

風車の羽根のマテリアルは両面に適用する必要があり、これは[マテリアルの記事](threejs-materials.html)で説明しました。
MTLファイルを簡単に修正する方法はありません。
私の思いつきではこの問題を修正する3つの方法があります。

1. マテリアルの読込後、全てのマテリアルをループさせて両面を適用する

        const mtlLoader = new MTLLoader();
        mtlLoader.load('resources/models/windmill/windmill.mtl', (mtlParseResult) => {
          const materials =  MtlObjBridge.addMaterialsFromMtlLoader(mtlParseResult);
          for (const material of Object.values(materials)) {
            material.side = THREE.DoubleSide;
          }
          ...

  この解決策は動作しますが、理想的には両面描画は片面描画よりも遅く、両面描画が必要なマテリアルだけを両面にしたいです。

2. 特定のマテリアルを手動で設定する

  MTLファイルを見ると2つのマテリアルがあります。
  1つは `"winddmill"` と呼び、もう1つは `"Material"` と呼びます。
  試行錯誤の結果、風車の羽根は `"Material"` というマテリアル名を使う事が分かりました。

        const mtlLoader = new MTLLoader();
        mtlLoader.load('resources/models/windmill/windmill.mtl', (mtlParseResult) => {
          const materials =  MtlObjBridge.addMaterialsFromMtlLoader(mtlParseResult);
          materials.Material.side = THREE.DoubleSide;
          ...

3. MTLファイルには制限がある事に気付き、MTLファイルを使わず自前でマテリアルを作成する

        const materials = {
          Material: new THREE.MeshPhongMaterial({...}),
          windmill: new THREE.MeshPhongMaterial({...}),
        };
        objLoader.setMaterials(materials);

どれを選ぶかはあなた次第です。
1が1番簡単です。3が最も柔軟です。2はその中間で今回は2を選びます。

この変更で背面から見た時にはまだ風車の羽根に布が見えるはずですが、もう1つ問題があります。
近くで拡大すると濃淡のむらがある事がわかります。

<div class="threejs_center"><img style="width: 700px;" src="resources/images/windmill-blocky.jpg"></div>

これはどうしたんでしょう？

テクスチャを見てみると、ノーマルマップにはNORと書かれた2つのテクスチャがあります。
これはノーマルマップのように見えます。
ノーマルマップは一般的に紫色ですが、バンプマップは黒と白になっています。
ノーマルマップはサーフェスの方向を表し、バンプマップはサーフェスの高さを表します。

<div class="threejs_center"><img style="width: 256px;" src="../resources/models/windmill/windmill_001_base_NOR.jpg"></div>

[MTLLoaderのソースを見ると](https://github.com/mrdoob/three.js/blob/1a560a3426e24bbfc9ca1f5fb0dfb4c727d59046/examples/js/loaders/MTLLoader.js#L432)ノーマルマップのキーワード `norm` を期待しているのでMTLファイルを編集してみましょう。

```mtl
# Blender MTL File: 'windmill_001.blend'
# Material Count: 2

newmtl Material
Ns 0.000000
Ka 1.000000 1.000000 1.000000
Kd 0.800000 0.800000 0.800000
Ks 0.000000 0.000000 0.000000
Ke 0.000000 0.000000 0.000000
Ni 1.000000
d 1.000000
illum 1
map_Kd windmill_001_lopatky_COL.jpg
-map_Bump windmill_001_lopatky_NOR.jpg
+norm windmill_001_lopatky_NOR.jpg

newmtl windmill
Ns 0.000000
Ka 1.000000 1.000000 1.000000
Kd 0.800000 0.800000 0.800000
Ks 0.000000 0.000000 0.000000
Ke 0.000000 0.000000 0.000000
Ni 1.000000
d 1.000000
illum 1
map_Kd windmill_001_base_COL.jpg
-map_Bump windmill_001_base_NOR.jpg
+norm windmill_001_base_NOR.jpg
map_Ns windmill_001_base_SPEC.jpg
```

これでロードするとノーマルマップとして扱うようになり、風車の羽根の裏が描画されるようになりました。

{{{example url="../threejs-load-obj-materials-fixed.html" }}}

別のファイルを読み込んでみましょう。

ネットで検索すると[Roger Gerzner / GERIZ.3D Art](http://www.gerzi.ch/)で作られた[CC-BY-NC](https://creativecommons.org/licenses/by-nc/4.0/)の風車の3Dモデルを見つけました。

<div class="threejs_center"><img src="resources/images/windmill-obj-2.jpg"></div>

これにはOBJファイルが既にありました。
それをロードしてみましょう（ここでMTLローダーを削除した事に注意して下さい）

```js
-  objLoader.load('resources/models/windmill/windmill.obj', ...
+  objLoader.load('resources/models/windmill-2/windmill.obj', ...
```

{{{example url="../threejs-load-obj-wat.html" }}}

うーん、何も出てこない...。何が問題でしょうか？
モデルのサイズはどれくらいなんだろう？

Three.jsにモデルのサイズを確認してカメラを自動設定してみます。

まず最初にThree.jsに先ほど読み込んだシーンを含むボックスを計算し、そのサイズと中心座標を確認してみましょう。

```js
objLoader.load('resources/models/windmill_2/windmill.obj', (root) => {
  scene.add(root);

+  const box = new THREE.Box3().setFromObject(root);
+  const boxSize = box.getSize(new THREE.Vector3()).length();
+  const boxCenter = box.getCenter(new THREE.Vector3());
+  console.log(boxSize);
+  console.log(boxCenter);
```

[JavaScriptコンソール](threejs-debugging-javascript.html)を見ると

```js
size 2123.6499788469982
center p {x: -0.00006103515625, y: 770.0909731090069, z: -3.313507080078125}
```

現在カメラは `near` が0.1、`far` が100で約100ユニットしか表示されていません。
地上は40ユニットしかなく、この風車のモデルは2000ユニットと非常に大きく、カメラとその全ての部分が錐台の外にあります。

<div class="threejs_center"><img style="width: 280px;" src="resources/images/camera-inside-windmill.svg"></div>

手動で修正することもできますが、シーンを自動でフレーム化する事もできます。

それを試してみましょう。
先ほど計算したボックスを使いシーン全体を表示するためにカメラの設定を調整する事ができます。カメラをどこに置くかは *正解はない* 事に注意して下さい。
どの方向から見てもどの高さでも向き合う事ができるので何かを選ぶしかないですね。

[カメラの記事](threejs-cameras.html)で説明したようにカメラは錐台を定義します。
視野 (`fov`) と `near` と `far` の設定によって錐台が定義されます。
カメラが現在持っている視野がどのようなものであっても、シーンが入っているボックスが画面外が永遠に伸びていると仮定して画面外の中に収まるように、カメラはどのくらい離れている必要があるのかを知りたいです。
つまり `near` は0.00000001、`far` は無限大であるとすると `near` は0.00000001、`far` は無限大です。

ボックスの大きさと視野が分かっているので次のような三角形ができます。

<div class="threejs_center"><img style="width: 600px;" src="resources/images/camera-fit-scene.svg"></div>

左側にカメラがあり、青い錐台が突き出しているのが分かります。
風車が入っているボックスを計算してみました。
ボックスが錐台の中に現れるように、カメラがボックスからどのくらい離れているかを計算する必要があります。

基本的な *直角三角形* の三角法と[SOHCAHTOA](https://www.google.com/search?q=SOHCAHTOA)を使用します。
視野とボックスの大きさが分かっていれば *距離* を計算できます。

<div class="threejs_center"><img style="width: 600px;" src="resources/images/field-of-view-camera.svg"></div>

この図に基づいて距離を計算する式は次のようになります。


```js
distance = halfSizeToFitOnScreen / tangent(halfFovY)
```

コードに変換してみましょう。
まずは `距離` を計算する関数を作り、ボックスの中心から `距離` 単位でカメラを移動させてみましょう。
次にカメラをボックスの `中心` に向けます。

```js
function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
  const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
  const halfFovY = THREE.MathUtils.degToRad(camera.fov * .5);
  const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);

  // compute a unit vector that points in the direction the camera is now
  // from the center of the box
  const direction = (new THREE.Vector3()).subVectors(camera.position, boxCenter).normalize();

  // move the camera to a position distance units way from the center
  // in whatever direction the camera was from the center already
  camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));

  // pick some near and far values for the frustum that
  // will contain the box.
  camera.near = boxSize / 100;
  camera.far = boxSize * 100;

  camera.updateProjectionMatrix();

  // point the camera to look at the center of the box
  camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
}
```

2つのサイズを引数に渡しています。
`boxSize` と `sizeToFitOnScreen` の事です。
`boxSize` を渡し `sizeToFitOnScreen` として使用すれば、計算でボックスが錐台の中に完全に収まるようになります。
上下に少し余分なスペースが欲しいので少し大きめのサイズにします。

```js
{
  const objLoader = new OBJLoader2();
  objLoader.load('resources/models/windmill_2/windmill.obj', (root) => {
    scene.add(root);
+    // compute the box that contains all the stuff
+    // from root and below
+    const box = new THREE.Box3().setFromObject(root);
+
+    const boxSize = box.getSize(new THREE.Vector3()).length();
+    const boxCenter = box.getCenter(new THREE.Vector3());
+
+    // set the camera to frame the box
+    frameArea(boxSize * 1.2, boxSize, boxCenter, camera);
+
+    // update the Trackball controls to handle the new size
+    controls.maxDistance = boxSize * 10;
+    controls.target.copy(boxCenter);
+    controls.update();
  });
}
```

上記の図のように `boxSize * 1.2` を渡しボックスを錐台内に収める際にボックスの上下に20%のスペースを確保する事ができます。
また `OrbitControls` を更新し、カメラがシーンの中心を周回するようにしました。

それを試してみると...

{{{example url="../threejs-load-obj-auto-camera.html" }}}

これはほぼ動作してますね。
カメラを回転させるためにマウスを使用し、風車が表示されるはずです。
問題は風車が大きく、箱の中心が(0,770,0)くらいにあります。
つまり、カメラをスタート地点(0, 10, 20)から中心から `距離` 単位で移動させると、カメラは中心に対して相対的に風車の下をほぼ真下に移動しています。

<div class="threejs_center"><img style="width: 360px;" src="resources/images/computed-camera-position.svg"></div>

ボックスの中心からカメラのある方向に横に移動するように変更してみましょう。
そのために必要なのはボックスからカメラまでのベクトルの `y` をゼロにする事です。
ベクトルを正規化するとXZ平面に平行なベクトルになります。
言い換えれば地面と平行になります。

```js
-// compute a unit vector that points in the direction the camera is now
-// from the center of the box
-const direction = (new THREE.Vector3()).subVectors(camera.position, boxCenter).normalize();
+// compute a unit vector that points in the direction the camera is now
+// in the xz plane from the center of the box
+const direction = (new THREE.Vector3())
+    .subVectors(camera.position, boxCenter)
+    .multiply(new THREE.Vector3(1, 0, 1))
+    .normalize();
```

風車の底を見ると小さな四角いものが見えます。それが地上面です。

<div class="threejs_center"><img style="width: 365px;" src="resources/images/tiny-ground-plane.jpg"></div>

40 × 40ユニットしかないので風車に比べて小さすぎます。
風車の大きさが2000ユニットを超えているので、地上面の大きさをもっとピッタリしたものに変えてみましょう。
また、テクスチャのrepeatを調整する必要があります。
チェッカーボードはズームインしない限り、見る事さえできないような細かいものになります。

```js
-const planeSize = 40;
+const planeSize = 4000;

const loader = new THREE.TextureLoader();
const texture = loader.load('resources/images/checker.png');
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.magFilter = THREE.NearestFilter;
-const repeats = planeSize / 2;
+const repeats = planeSize / 200;
texture.repeat.set(repeats, repeats);
```

これで風車を見る事ができます。

{{{example url="../threejs-load-obj-auto-camera-xz.html" }}}

マテリアルを元に戻してみましょう。
先ほどと同じようにテクスチャを参照しているMTLファイルがありますが、ファイルを見てみるとすぐに問題点が浮き上がります。

```shell
 $ ls -l windmill
 -rw-r--r--@ 1 gregg  staff       299 May 20  2009 windmill.mtl
 -rw-r--r--@ 1 gregg  staff    142989 May 20  2009 windmill.obj
 -rw-r--r--@ 1 gregg  staff  12582956 Apr 19  2009 windmill_diffuse.tga
 -rw-r--r--@ 1 gregg  staff  12582956 Apr 20  2009 windmill_normal.tga
 -rw-r--r--@ 1 gregg  staff  12582956 Apr 19  2009 windmill_spec.tga
```

TARGA(.tga)ファイルが巨大です！

Three.jsにはTGAローダーがありますが、ほとんどのユースケースでそれを使うのは間違いです。
ネット上で見つけたランダムな3Dファイルを閲覧できるようなビューアを作っているのであれば、TGAファイルを読み込んだ方がいいかもしれません。([*](#loading-scenes))

TGAファイルの問題点は、全てを上手く圧縮できない事です。
TGAは非常に単純な圧縮しかサポートしておらず、上記を見てみると全てのファイルが同じサイズになる確率が非常に低いため、圧縮されていない事がわかります。

さらにそれぞれが12MB!

もしTGAのファイルを使った場合、風車を見るために36MBのファイルをダウンロードしなければならないでしょう。

TGAのもう1つの問題はブラウザ自体がTGAをサポートしていない事です。
TGAの読み込みはJPGやPNGのようなサポートされているフォーマットの読込よりも遅くなる可能性が高いです。

私はthree.jsで3Dモデルを表示するためには、TGAをJPGに変換する事が最善の選択肢であると確信しています。
中身を見るとそれぞれ3チャンネル、RGBでアルファチャンネルはありません。
JPGはダウンロードするためにファイルをロス有り圧縮を行い、少ないサイズのファイルダウンロードを提供します。

ファイルを読み込むと2048 x 2048サイズになっていました。
私には無駄に大きいサイズに思えましたが、もちろん使用ケースによります。
1024 x 1024にしPhotoshopで50%の画質設定で保存してみました。
ファイルリストを取得すると

```shell
 $ ls -l ../threejsfundamentals.org/threejs/resources/models/windmill
 -rw-r--r--@ 1 gregg  staff     299 May 20  2009 windmill.mtl
 -rw-r--r--@ 1 gregg  staff  142989 May 20  2009 windmill.obj
 -rw-r--r--@ 1 gregg  staff  259927 Nov  7 18:37 windmill_diffuse.jpg
 -rw-r--r--@ 1 gregg  staff   98013 Nov  7 18:38 windmill_normal.jpg
 -rw-r--r--@ 1 gregg  staff  191864 Nov  7 18:39 windmill_spec.jpg
```

36MEGから0.55MEGまで圧縮できました！
3DCGデザイナーなどのアーティストはこの圧縮に満足していないかもしれませんので、トレードオフについて相談するようにして下さい。

さてMTLファイルを使用するには、JPGファイルを参照するように編集する必要があります。
TGAファイルの代わりにJPGファイルを使用します。
幸いな事にこれは単純なテキストファイル編集のみで簡単です。

```mtl
newmtl blinn1SG
Ka 0.10 0.10 0.10

Kd 0.00 0.00 0.00
Ks 0.00 0.00 0.00
Ke 0.00 0.00 0.00
Ns 0.060000
Ni 1.500000
d 1.000000
Tr 0.000000
Tf 1.000000 1.000000 1.000000 
illum 2
-map_Kd windmill_diffuse.tga
+map_Kd windmill_diffuse.jpg

-map_Ks windmill_spec.tga
+map_Ks windmill_spec.jpg

-map_bump windmill_normal.tga 
-bump windmill_normal.tga 
+map_bump windmill_normal.jpg 
+bump windmill_normal.jpg 
```

MTLファイルが適度なサイズのテクスチャを指しているので、それをロードする必要があります。
上記で行ったようにまずマテリアルをロードしてから `OBJLoader2` に設定します。

```js
{
+  const mtlLoader = new MTLLoader();
+  mtlLoader.load('resources/models/windmill_2/windmill-fixed.mtl', (mtlParseResult) => {
+    const objLoader = new OBJLoader2();
+    const materials =  MtlObjBridge.addMaterialsFromMtlLoader(mtlParseResult);
+    objLoader.addMaterials(materials);
    objLoader.load('resources/models/windmill/windmill.obj', (root) => {
      root.updateMatrixWorld();
      scene.add(root);
      // compute the box that contains all the stuff
      // from root and below
      const box = new THREE.Box3().setFromObject(root);

      const boxSize = box.getSize(new THREE.Vector3()).length();
      const boxCenter = box.getCenter(new THREE.Vector3());

      // set the camera to frame the box
      frameArea(boxSize * 1.2, boxSize, boxCenter, camera);

      // update the Trackball controls to handle the new size
      controls.maxDistance = boxSize * 10;
      controls.target.copy(boxCenter);
      controls.update();
    });
+  });
}
```

実際にやってみる前にいくつかの問題にぶつかりました。

問題1: 3つの `MTLLoader` は、マテリアルのディフューズカラーにディフューズテクスチャマップを乗算したマテリアルを作成します。

これは便利な機能ですがMTLファイルの上記の行を見ると

```mtl
Kd 0.00 0.00 0.00
```

ディフューズ色を0に設定します。
テクスチャマップ * 0 = 黒です!
風車を作るのに使われたモデリングツールがディフューズテクスチャマップにディフューズカラーを掛けていなかった可能性があります。
だからこそ、この風車を作った3DCGデザイナーなどのアーティストの3DCG Tool上では動作してました。

これを修正するには、次の行を修正する必要があります。

```mtl
Kd 1.00 1.00 1.00
```

テクスチャ マップ * 1 = テクスチャマップです。

問題点その2：スペキュラカラーも黒である

`Ks` で始まる行はスペキュラカラーを指定します。
風車を作るのに使われたモデリングソフトはスペキュラマップの色をスペキュラハイライトに使うという点でディフューズマップと似たような事をしていたのでしょう。
Three.jsではスペキュラカラーをどの程度反射させるかの入力値は、スペキュラマップの赤チャンネルのみを使用しています。
つまり、スペキュラカラーセットが必要です。

上記のようにMTLファイルを以下のように修正する事ができます。

```mtl
-Ks 0.00 0.00 0.00
+Ks 1.00 1.00 1.00
```

問題 #3: `windmill_normal.jpg` はバンプマップではなくノーマルマップです

上記のようにMTLファイルを編集する必要があります。

```mtl
-map_bump windmill_normal.jpg 
-bump windmill_normal.jpg 
+norm windmill_normal.jpg 
```

それを考慮し試してみるとマテリアルが一杯になるはずです。

{{{example url="../threejs-load-obj-materials-windmill2.html" }}}

モデルをロードするとこのような問題が発生することがよくあります。
よくある問題には以下のようなものがあります。

* サイズを把握する必要がある

  上記のようにカメラにシーンをフレーミングしようとさせましたが、それは必ずしも適切な事ではありません。
  一般的に最も適切なのは自分でモデルを作るか、モデルをダウンロードし、3Dソフトでロードしてそのスケールを見て必要に応じて調整する事です。

* 方向性の違い

  three.jsは一般的にはy = upです。モデリングツールによってはZ = upにデフォルトで設定されているものもあれば、Y = upに設定されているものもあります。
  設定可能なものもあります。
  モデルをロードして横になっているようなケースに遭遇した場合、モデルを回転させるコードをハックすることもできます（推奨されません）。
  また、お気に入りのモデリングツールにモデルを読み込むか、コマンドラインツールを使い、ウェブサイト用の画像をダウンロードしてコードを適用するのではなく、ウェブサイト用の画像を編集するように必要な方向にオブジェクトを回転させる事もできます。

* MTLファイルや間違ったマテリアル、互換性のないパラメータがない場合

  上記ではMTLファイルを使用していましたが、マテリアルの読込には問題がありました。
  OBJファイルの中身を見てどんなマテリアルがあるのかを確認したり、three.jsでOBJファイルを読み込んでシーンを歩いて全てのマテリアルをプリントアウトしたりするのも一般的です。

* テクスチャが大きすぎる

  3Dモデルの多くは建築用、映画やCM用、ゲーム用のどちらかに作られています。
  建築や映画の場合は誰もがテクスチャのサイズを気にしていません。
  ゲームはメモリが限られていますが、ほとんどのゲームはローカルで実行されているので、ゲーム開発者は気にしています。
  Webページはできるだけ速く読みたいので、テクスチャをできるだけ小さく、かつ見栄えの良いものにする必要があります。
  実際に最初の風車では、間違いなくテクスチャについて何かをするべきでした。現在のサイズ合計は10MBです!

   [テクスチャの記事](threejs-textures.html)で述べたようにテクスチャはメモリを取ります。
   4096 x 4096に展開された50kのJPGは高速にダウンロードされますが、大量のメモリを消費する事を覚えておいて下さい。

最後に見せたかったのは風車を回している所です。残念ながらOBJファイルには階層がありません。
つまり、各風車のパーツは基本的に1つのメッシュとして考えられています。
ミルの羽根は分離されていないので回転させる事はできません。

これがOBJファイルは良いフォーマットではない主な理由の1つです。
推測するならば、他のフォーマットよりも一般的な理由はシンプルで多くの機能をサポートしていないため、より多くの場合に動作します。
特に建築物のイメージのような静止したものを作っていて、何かをアニメーション化する必要がない場合はシーンに静的な小道具を入れるのには悪くない方法です。

次はgLTFシーンをロードしてみます。gLTFフォーマットは他にも多くの機能をサポートしています。
