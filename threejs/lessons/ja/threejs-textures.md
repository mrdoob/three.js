Title: Three.jsのテクスチャ
Description: Three.jsのテクスチャの使い方
TOC: テクスチャ

この記事はthree.jsについてのシリーズ記事の一つです。
最初の記事は[Three.jsの基礎知識](threejs-fundamentals.html)です。
まだ読んでない人は、そちらから先に読んでみるといいかもしれません。

テクスチャはThree.jsの大きなトピックの一つです。
どのレベルで説明するといいか100%承知してはいませんが、やってみようと思います。 
Three.jsにはたくさんのトピックがあり、互いに関係しているので、一度に説明するのが難しいのです。
これがこの記事の内容の早見表です。

<ul>
<li><a href="#hello">ハロー・テクスチャ</a></li>
<li><a href="#six">立方体の各面に異なる6つのテクスチャを貼り付ける</a></li>
<li><a href="#loading">テクスチャの読み込み</a></li>
<ul>
  <li><a href="#easy">簡単な方法</a></li>
  <li><a href="#wait1">テクスチャの読み込みを待つ</a></li>
  <li><a href="#waitmany">複数テクスチャの読み込みを待つ</a></li>
  <li><a href="#cors">異なるオリジンからのテクスチャの読み込み</a></li>
</ul>
<li><a href="#memory">メモリ使用</a></li>
<li><a href="#format">JPG vs PNG</a></li>
<li><a href="#filtering-and-mips">フィルタリングとMIP</a></li>
<li><a href="#uvmanipulation">テクスチャの繰り返し、オフセット、回転、ラッピング</a></li>
</ul>

## <a name="hello"></a> ハロー・テクスチャ

テクスチャは*一般的に*PhotoshopやGIMPのような3rdパーティーのプログラムで最もよく作られる画像です。
例えば、この画像を立方体に乗せてみましょう。

<div class="threejs_center">
  <img src="../resources/images/wall.jpg" style="width: 600px;" class="border" >
</div>

最初の例を修正してみましょう。`TextureLoader`を作ることで、必要なことはすべてできます。
[`load`](TextureLoader.load)を画像のURLを引数にして呼び、`color`を設定する代わりに、
マテリアルの`map`属性にその結果を渡してください。

```js
+const loader = new THREE.TextureLoader();

const material = new THREE.MeshBasicMaterial({
-  color: 0xFF8844,
+  map: loader.load('resources/images/wall.jpg'),
});
```

`MeshBasicMaterial`を使っているので、光源が必要ないことに注意してください。

{{{example url="../threejs-textured-cube.html" }}}

## <a name="six"></a> 立方体の各面に異なる6つのテクスチャを貼り付ける

立方体の各面に貼り付ける、6つのテクスチャはどのようなものでしょうか。

<div class="threejs_center">
  <div>
    <img src="../resources/images/flower-1.jpg" style="width: 100px;" class="border" >
    <img src="../resources/images/flower-2.jpg" style="width: 100px;" class="border" >
    <img src="../resources/images/flower-3.jpg" style="width: 100px;" class="border" >
  </div>
  <div>
    <img src="../resources/images/flower-4.jpg" style="width: 100px;" class="border" >
    <img src="../resources/images/flower-5.jpg" style="width: 100px;" class="border" >
    <img src="../resources/images/flower-6.jpg" style="width: 100px;" class="border" >
  </div>
</div>

`Mesh`を作るときに、単に6つのマテリアルを作り、配列として渡します。

```js
const loader = new THREE.TextureLoader();

-const material = new THREE.MeshBasicMaterial({
-  map: loader.load('resources/images/wall.jpg'),
-});
+const materials = [
+  new THREE.MeshBasicMaterial({map: loader.load('resources/images/flower-1.jpg')}),
+  new THREE.MeshBasicMaterial({map: loader.load('resources/images/flower-2.jpg')}),
+  new THREE.MeshBasicMaterial({map: loader.load('resources/images/flower-3.jpg')}),
+  new THREE.MeshBasicMaterial({map: loader.load('resources/images/flower-4.jpg')}),
+  new THREE.MeshBasicMaterial({map: loader.load('resources/images/flower-5.jpg')}),
+  new THREE.MeshBasicMaterial({map: loader.load('resources/images/flower-6.jpg')}),
+];
-const cube = new THREE.Mesh(geometry, material);
+const cube = new THREE.Mesh(geometry, materials);
```

動きました！

{{{example url="../threejs-textured-cube-6-textures.html" }}}

ただし、全ての種類のジオメトリが複数のマテリアルに対応しているわけではないことに注意してください。
`BoxGeometry`と`BoxBufferGeometry`は、それぞれの面に6つのマテリアルを使えます。
`ConeGeometry`と`ConeBufferGeometry`は2つのマテリアルを使うことができ、一つは底面、一つは円錐面に適用されます。
`CylinderGeometry`と`CylinderBufferGeometry`は3つのマテリアルを使うことができ、一つは底面、一つは上面、一つは側面に適用されます。
その他のケースでは、カスタムジオメトリのビルドや読み込み、テクスチャの座標の修正が必要になります。


1つのジオメトリに複数の画像を適用したいなら、
[テクスチャアトラス](https://en.wikipedia.org/wiki/Texture_atlas)を使うのが、ほかの3Dエンジンでははるかに一般的で、はるかに高性能です。
テクスチャアトラスは、一つのテクスチャに複数の画像を配置し、ジオメトリの頂点の座標を使って
テクスチャのどの部分がジオメトリのおのおのの三角形に使われるか、選択するものです。

テクスチャの座標とはなんでしょうか？ジオメトリ頂点に与えられたデータのことで、
テクスチャのどの部分がその頂点に対応するか指定するものです。
[カスタムジオメトリの構築](threejs-custom-geometry.html)を始めるときに説明します。

## <a name="loading"></a> テクスチャの読み込み

### <a name="easy"></a> 簡単な方法

このサイトのコードのほとんどは、もっとも簡単なテクスチャの読み込み方を使っています。
`TextureLoader`を作り、その[`load`](TextureLoader.load)メソッドを呼びます。
これは`Texture`オブジェクトを返します。


```js
const texture = loader.load('resources/images/flower-1.jpg');
```

このメソッドを使うと、画像がthree.jsによって非同期的に読み込まれるまで、テクスチャが透明になります。読み込まれた時点で、テクスチャをダウンロードした画像に更新します。


この方法では、テクスチャの読み込みを待つ必要がなく、ページをすぐにレンダリングし始めることができるという、大きな利点があります。
多くのケースでこの方法で問題ありませんが、テクスチャをダウンロードし終えたときにthree.jsに通知してもらうこともできます。

### <a name="wait1"></a> テクスチャの読み込みを待つ

テクスチャの読み込みを待つために、テクスチャローダーの`load`メソッドは、テクスチャの読み込みが終了したときに呼ばれるコールバックを取ります。
冒頭の例に戻り、このように、`Mesh`を作りシーンに追加する前に、テクスチャの読み込みを待つことができます。


```js
const loader = new THREE.TextureLoader();
loader.load('resources/images/wall.jpg', (texture) => {
  const material = new THREE.MeshBasicMaterial({
    map: texture,
  });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  cubes.push(cube);  // add to our list of cubes to rotate
});
```

ブラウザのキャッシュをクリアし、接続が遅くならない限り、違いが分かることはないと思いますが、
ちゃんとテクスチャが読み込まれるのを待っているので、安心してください。

{{{example url="../threejs-textured-cube-wait-for-texture.html" }}}

### <a name="waitmany"></a> 複数テクスチャの読み込みを待つ


全てのテクスチャが読み込まれたことを待つために、`LoadingManager`を使うことができます。
`TextureLoader`を渡すと、[`onLoad`](LoadingManager.onLoad)属性がコールバックに設定されます。

```js
+const loadManager = new THREE.LoadingManager();
*const loader = new THREE.TextureLoader(loadManager);

const materials = [
  new THREE.MeshBasicMaterial({map: loader.load('resources/images/flower-1.jpg')}),
  new THREE.MeshBasicMaterial({map: loader.load('resources/images/flower-2.jpg')}),
  new THREE.MeshBasicMaterial({map: loader.load('resources/images/flower-3.jpg')}),
  new THREE.MeshBasicMaterial({map: loader.load('resources/images/flower-4.jpg')}),
  new THREE.MeshBasicMaterial({map: loader.load('resources/images/flower-5.jpg')}),
  new THREE.MeshBasicMaterial({map: loader.load('resources/images/flower-6.jpg')}),
];

+loadManager.onLoad = () => {
+  const cube = new THREE.Mesh(geometry, materials);
+  scene.add(cube);
+  cubes.push(cube);  // add to our list of cubes to rotate
+};
```

`LoadingManager`は[`onProgress`](LoadingManager.onProgress)属性もあり、
プログレスインジケーターを表示するためのコールバックを設定できます。

まず、HTMLにプログレスバーを追加しましょう。

```html
<body>
  <canvas id="c"></canvas>
+  <div id="loading">
+    <div class="progress"><div class="progressbar"></div></div>
+  </div>
</body>
```

そしてCSSにも追加します。

```css
#loading {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}
#loading .progress {
    margin: 1.5em;
    border: 1px solid white;
    width: 50vw;
}
#loading .progressbar {
    margin: 2px;
    background: white;
    height: 1em;
    transform-origin: top left;
    transform: scaleX(0);
}
```

そうすると、コード内で`onProgress`コールバックの`progressbar`のスケールが更新できます。
これは、最後のアイテムが読み込まれるURL、いま読み込まれているアイテムの数、アイテムの合計数を渡して呼ばれます。

```js
+const loadingElem = document.querySelector('#loading');
+const progressBarElem = loadingElem.querySelector('.progressbar');

loadManager.onLoad = () => {
+  loadingElem.style.display = 'none';
  const cube = new THREE.Mesh(geometry, materials);
  scene.add(cube);
  cubes.push(cube);  // add to our list of cubes to rotate
};

+loadManager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {
+  const progress = itemsLoaded / itemsTotal;
+  progressBarElem.style.transform = `scaleX(${progress})`;
+};
```

キャッシュを削除して低速なコネクションを作らない限りは、プログレスバーを見ることできないかもしれません。

{{{example url="../threejs-textured-cube-wait-for-all-textures.html" }}}

## <a name="cors"></a> 異なるオリジンからのテクスチャの読み込み

異なるサーバーの画像を使うため、そのサーバーは正しいヘッダーを送る必要があります。
そうしないと、three.jsでその画像を使うことができず、エラーを受け取るでしょう。
もし皆さんが画像を提供するサーバーを運用しているなら、
[正しいヘッダーを送る](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)を確認してください。
画像をホスティングしているサーバーに手を入れられず、権限用のヘッダーを送ることができないなら、
そのサーバーからの画像を使うことはできません。


例えば、[imgur](https://imgur.com)、[flickr](https://flickr.com)、そして
[github](https://github.com)は全て、ホストしている画像を
three.jsで使うことができるようなヘッダーを送っています。

## <a name="memory"></a>メモリ使用

多くの場合、テクスチャはthree.jsアプリの中で最もメモリを使っています。
*一般的に*テクスチャは`幅 * 高さ * 4 * 1.33`バイトのメモリを消費していることを理解するのは重要です。

圧縮については言及していないことに注意してください。.jpgイメージを作り、超高圧縮することもできます。
例えば、家のシーンを作っているとしましょう。家の中には、テーブルがあり、上面に木目のテクスチャを置くことに決めました。

<div class="threejs_center"><img class="border" src="resources/images/compressed-but-large-wood-texture.jpg" align="center" style="width: 300px"></div>


このイメージはたった157kなので、比較的速くダウンロードすることができます。しかし、
[ピクセルだと3024 x 3761の大きさ](resources/images/compressed-but-large-wood-texture.jpg)です。
前述した式によると、

    3024 * 3761 * 4 * 1.33 = 60505764.5


となり、three.jsの**60メガのメモリ！**を消費するでしょう。
このようなテクスチャがいくつかあるだけで、メモリリークしてしまうでしょう。


この例を持ち出したのは、テクスチャを使用することの隠れたコストを知っているのが重要だからです。
three.jsでテクスチャを使うためには、テクスチャのデータをGPUに渡し、*一般的に*非圧縮にしておく必要があります。

この話の教訓は、テクスチャをファイルサイズだけでなく、次元も小さくすることです。
ファイルサイズの小ささ = 高速なダウンロードです。次元の小ささ = 省メモリです。
では、どのように小さくできるのでしょうか？
できるだけ小さく、そして十分見えるくらいです。

## <a name="format"></a> JPG vs PNG

これは通常のHTMLとほぼ同じで、PNGはロスレス圧縮なので、lossy圧縮のJPGよりも
一般的にダウンロードが遅くなります。
しかし、PNGは透過性があります。PNGは法線マップや後ほど説明する非画像マップのような非画像データにも適したフォーマットです。

WebGLにおいて、JPGがPNGよりも省メモリではないことを覚えておいてください。上記を参照してください。

## <a name="filtering-and-mips"></a> フィルタリングとMIP

この16x16のテクスチャを

<div class="threejs_center"><img src="resources/images/mip-low-res-enlarged.png" class="nobg" align="center"></div>

立方体に適用してみます。

<div class="spread"><div data-diagram="filterCube"></div></div>

この立方体をとても小さく描画してみましょう。

<div class="spread"><div data-diagram="filterCubeSmall"></div></div>

ふーむ、見えにくいです。小さな立方体を拡大してみましょう。

<div class="spread"><div data-diagram="filterCubeSmallLowRes"></div></div>

GPUは小さな立方体のどのピクセルにどの色を使うか、どうやって知るのでしょうか？
立方体が小さすぎて1、2ピクセルしかないとしたらどうでしょうか？

フィルタリングとはこういうものです。

もしフォトショップなら近くの全てのピクセルを平均して、1、2ピクセルの色を見つけます。
これはとても遅い操作です。GPUはミップマップを使ってこの問題を解決します。

MIPはテクスチャのコピーで、ピクセルがブレンドされて次の小さいMIPを作られます。そのため、前のMIPの半分の幅と半分の高さになっています。
MIPは1x1ピクセルのMIPが得られるまで作られます。
全てのMIP上の画像はこのようになります。

<div class="threejs_center"><img src="resources/images/mipmap-low-res-enlarged.png" class="nobg" align="center"></div>

さて、立方体が1、2ピクセルの小ささに描かれたとき、どんな色にするか決めるため、GPUは最も小さなMIPレベルか次に小さいMIPか選ぶことができます。


three.jsでは、テクスチャが元の大きさより大きく描かれたときと、小さく描かれたときの両方で、処理の設定を選ぶことができます。


テクスチャが元の大きさより大きく描かれたときのフィルタ設定として、[`texture.magFilter`](Texture.magFilter)属性に`THREE.NearestFilter`か`THREE.LinearFilter`を設定することができます。
`NearestFilter`は元のテクスチャから最も近い1ピクセルを使用するということです。
低解像度のテクスチャでは、マインクラフトのようにピクセル化された見た目になります。

`LinearFilter`はテクスチャから、色を決めたいピクセルに最も近い4ピクセルを選び、
実際の点が4つのピクセルからどれだけ離れているかに応じて適切な比率で混ぜ合わせます。

<div class="spread">
  <div>
    <div data-diagram="filterCubeMagNearest" style="height: 250px;"></div>
    <div class="code">Nearest</div>
  </div>
  <div>
    <div data-diagram="filterCubeMagLinear" style="height: 250px;"></div>
    <div class="code">Linear</div>
  </div>
</div>

元の大きさよりもテクスチャが小さく描画された時のフィルタ設定では、
[`texture.minFilter`](Texture.minFilter)属性を6つの値から一つ設定できます。

* `THREE.NearestFilter`

   上と同様に、テクスチャの最も近いピクセルを選ぶ。

* `THREE.LinearFilter`

   上と同様に、テクスチャから4ピクセルを選んで混ぜ合わせる。

* `THREE.NearestMipmapNearestFilter`

   適切なMIPを選び、ピクセルを一つ選ぶ。

* `THREE.NearestMipmapLinearFilter`

   2つMIPを選び、それぞれからピクセルを選んで、その2つを混ぜる。

* `THREE.LinearMipmapNearestFilter`

   適切なMIPを選び、4ピクセルを選んで混ぜ合わせる。

*  `THREE.LinearMipmapLinearFilter`

   2つMIPを選び、それぞれから4ピクセルを選んで、8つ全部を混ぜ合わせて1ピクセルにする。

ここで6つ全ての設定の例を見せましょう。

<div class="spread">
  <div data-diagram="filterModes" style="
    height: 450px;
    position: relative;
  ">
    <div style="
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-start;
    ">
      <div style="
        background: rgba(255,0,0,.8);
        color: white;
        padding: .5em;
        margin: 1em;
        font-size: small;
        border-radius: .5em;
        line-height: 1.2;
        user-select: none;"
      >click to<br/>change<br/>texture</div>
    </div>
    <div class="filter-caption" style="left: 0.5em; top: 0.5em;">nearest</div>
    <div class="filter-caption" style="width: 100%; text-align: center; top: 0.5em;">linear</div>
    <div class="filter-caption" style="right: 0.5em; text-align: right; top: 0.5em;">nearest<br/>mipmap<br/>nearest</div>
    <div class="filter-caption" style="left: 0.5em; text-align: left; bottom: 0.5em;">nearest<br/>mipmap<br/>linear</div>
    <div class="filter-caption" style="width: 100%; text-align: center; bottom: 0.5em;">linear<br/>mipmap<br/>nearest</div>
    <div class="filter-caption" style="right: 0.5em; text-align: right; bottom: 0.5em;">linear<br/>mipmap<br/>linear</div>
  </div>
</div>

注意することは、左上と中央上は`NearestFilter`を使っていて、`LinearFilter`はMIPを使っていないことです。GPUが元のテクスチャからピクセルを選ぶので、遠くはちらついて見えます。
左側はたった一つのピクセルが選ばれ、中央は4つのピクセルが選ばれて混ぜ合わされます。しかし、
良い色の表現には至っていません。
ほかの4つの中では、右下の`LinearMipmapLinearFilter`が一番良いです。

上の画像をクリックすると、上で使用しているテクスチャと、MIPレベルごとに色が異なるテクスチャが切り替わります。

<div class="threejs_center">
  <div data-texture-diagram="differentColoredMips"></div>
</div>

これで、起きていることが分かりやすいでしょう。
左上と中央上は、最初のMIPがずっと遠くまで使われているのが分かります。
右上と中央下は、別のMIPが使われているのがよく分かります。


元のテクスチャに切り替えると、右下が滑らか、つまり高品質であることが分かります。
なぜ常にこのモードにしないのか聞きたいかもしれません。
最も明らかな理由は、レトロ感を出すために、ピクセル化してほしいとかです。
次の理由は、8ピクセルを読み込んで混ぜ合わせることは、1ピクセルを読んで混ぜ合わせるよりも遅いことです。
1つのテクスチャの速度では違いが出るように思えないかもしれませんが、
記事が進むにつれて、最終的に4、5のテクスチャを一度に持つマテリアルが出てくるでしょう。
4テクスチャ * 8ピクセル（テクスチャごと）は、どのピクセルを描画するにも32ピクセル探すことになります。
これはモバイルデバイスで考えるときに特に重要になります。

## <a name="uvmanipulation"></a> テクスチャの繰り返し、オフセット、回転、ラッピング

テクスチャは、繰り返し、オフセット、回転の設定があります。

three.jsのデフォルトのテクスチャは繰り返されません。
テクスチャが繰り返されるかどうかの設定には、2つの属性があります。
水平方向のラッピングに[`wrapS`](Texture.wrapS)と、垂直方向のラッピングに[`wrapT`](Texture.wrapT)です。

以下のどれかが設定されます：

* `THREE.ClampToEdgeWrapping`

   それぞれの角の最後のピクセルが永遠に繰り返されます。

* `THREE.RepeatWrapping`

   テクスチャが繰り返されます。

* `THREE.MirroredRepeatWrapping`

   テクスチャの鏡像が取られ、繰り返されます。

例えば、両方向にラッピングすると、

```js
someTexture.wrapS = THREE.RepeatWrapping;
someTexture.wrapT = THREE.RepeatWrapping;
```

繰り返しは`repeat`属性で設定されます。

```js
const timesToRepeatHorizontally = 4;
const timesToRepeatVertically = 2;
someTexture.repeat.set(timesToRepeatHorizontally, timesToRepeatVertically);
```

テクスチャのオフセットは`offset`属性でできます。
テクスチャは1単位 = 1テクスチャの大きさにオフセットされます。
言い換えると、0 = オフセットなし、1 = テクスチャ全体の大きさということです。

```js
const xOffset = .5;   // offset by half the texture
const yOffset = .25;  // offset by 1/4 the texture
someTexture.offset.set(xOffset, yOffset);
```

テクスチャの回転は、`rotation`属性で、ラジアンで指定します。
同様に `center`属性で回転の中心を指定します。
デフォルトは0,0で、左下の角で回転します。
オフセットと同じように、単位はテクスチャの大きさなので、`.5, .5`に設定すると、
テクスチャの中心での回転になります。

```js
someTexture.center.set(.5, .5);
someTexture.rotation = THREE.MathUtils.degToRad(45);
```

最初に取り上げたサンプルでこれらの値を試してみましょう。

最初に、テクスチャを操作できるように参照を保持しておきます。

```js
+const texture = loader.load('resources/images/wall.jpg');
const material = new THREE.MeshBasicMaterial({
-  map: loader.load('resources/images/wall.jpg');
+  map: texture,
});
```

ここでも、簡単なインターフェースを提供するために[dat.GUI](https://github.com/dataarts/dat.gui)を使います。

```js
import {GUI} from '../3rdparty/dat.gui.module.js';
```

以前のdat.GUIの例でしたように、dat.GUIに度数で操作できるオブジェクトを与え、
ラジアン単位でプロパティを設定する簡単なクラスを使います。

```js
class DegRadHelper {
  constructor(obj, prop) {
    this.obj = obj;
    this.prop = prop;
  }
  get value() {
    return THREE.MathUtils.radToDeg(this.obj[this.prop]);
  }
  set value(v) {
    this.obj[this.prop] = THREE.MathUtils.degToRad(v);
  }
}
```

`"123"`といった文字列から`123`といった数値に変換するクラスも必要です。
これは、three.jsは`wrapS`や`wrapT`のようなenumの設定として数値が必要ですが、
dat.GUIはenumに文字列のみを使うためです。

```js
class StringToNumberHelper {
  constructor(obj, prop) {
    this.obj = obj;
    this.prop = prop;
  }
  get value() {
    return this.obj[this.prop];
  }
  set value(v) {
    this.obj[this.prop] = parseFloat(v);
  }
}
```

このクラスを使って、上記設定のための簡単なGUIをセットアップできます。

```js
const wrapModes = {
  'ClampToEdgeWrapping': THREE.ClampToEdgeWrapping,
  'RepeatWrapping': THREE.RepeatWrapping,
  'MirroredRepeatWrapping': THREE.MirroredRepeatWrapping,
};

function updateTexture() {
  texture.needsUpdate = true;
}

const gui = new GUI();
gui.add(new StringToNumberHelper(texture, 'wrapS'), 'value', wrapModes)
  .name('texture.wrapS')
  .onChange(updateTexture);
gui.add(new StringToNumberHelper(texture, 'wrapT'), 'value', wrapModes)
  .name('texture.wrapT')
  .onChange(updateTexture);
gui.add(texture.repeat, 'x', 0, 5, .01).name('texture.repeat.x');
gui.add(texture.repeat, 'y', 0, 5, .01).name('texture.repeat.y');
gui.add(texture.offset, 'x', -2, 2, .01).name('texture.offset.x');
gui.add(texture.offset, 'y', -2, 2, .01).name('texture.offset.y');
gui.add(texture.center, 'x', -.5, 1.5, .01).name('texture.center.x');
gui.add(texture.center, 'y', -.5, 1.5, .01).name('texture.center.y');
gui.add(new DegRadHelper(texture, 'rotation'), 'value', -360, 360)
  .name('texture.rotation');
```

最後に特記することは、もしテクスチャの`wrapS`や`wrapT`を変えるなら、
three.jsが設定の適用を知るために、[`texture.needsUpdate`](Texture.needsUpdate)も設定しなければならないことです。ほかの設定は自動的に適用されます。


{{{example url="../threejs-textured-cube-adjust.html" }}}

これはテクスチャのトピックへの第一歩にすぎません。
ある時点で、テクスチャの座標や、マテリアルが適用できる別の9種のテクスチャについても説明します。

今のところは、[光源](threejs-lights.html)に進みましょう。

<!--
alpha
ao
env
light
specular
bumpmap ?
normalmap ?
metalness
roughness
-->

<link rel="stylesheet" href="resources/threejs-textures.css">
<script type="module" src="resources/threejs-textures.js"></script>
