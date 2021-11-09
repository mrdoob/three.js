Title: Three.jsの3DLUTポストプロセス
Description: Three.jsで3DLUTポストプロセスを実装する方法
TOC: エフェクトにLUTファイルを適用する

前回の記事では[ポストプロセス](threejs-post-processing.html)の説明をしました。
ポストプロセスの一般的な方法の1つにLUT（ラット）や3DLUT（3次元ラット）と呼ばれるものがあります。
LUTはルックアップテーブル（参照対応表）の略です。したがって、3DLUTは3次元のルックアップテーブルです。

3DLUTがどのように機能するかというとカラーのキューブを作ります。
元となる画像のカラーを使い、キューブにインデックスを作成します。
元画像の各ピクセルに対して、赤、緑、青のカラーに基づいてキューブの位置を調べます。
キューブの位置が3DLUTから引き出した新しいカラーとなります。

Javascriptでは次のようにします。
カラーは0〜255までの整数で指定されており、サイズが256 x 256 x 256の大きな3次元配列があると想像して下さい。
ルックアップテーブルを通してカラーを変換します。

    const newColor = lut[origColor.red][origColor.green][origColor.bue]

もちろん、256 x 256 x 256の配列はかなり大きいですが、[テクスチャの記事](threejs-textures.html)で指摘したようにテクスチャの寸法に関係なく0.0～1.0の値を参照します。

8 × 8 × 8のキューブを想像してみましょう。

<div class="threejs_center"><img src="resources/images/3dlut-rgb.svg" class="noinvertdark" style="width: 500px"></div>

最初に0, 0, 0の位置の角は黒にし、反対の1, 1, 1の角は白にします。
1, 0, 0は<span style="color:red;">赤</span>です。
0, 1, 0は<span style="color:green;">緑</span>で0, 0, 1は<span style="color:blue;">青</span>にします。

<div class="threejs_center"><img src="resources/images/3dlut-axis.svg" class="noinvertdark" style="width: 500px"></div>

各軸線にカラーを追加していきます。

<div class="threejs_center"><img src="resources/images/3dlut-edges.svg" class="noinvertdark" style="width: 500px"></div>

2チャンネル以上を使用するエッジのカラーです。

<div class="threejs_center"><img src="resources/images/3dlut-standard.svg" class="noinvertdark" style="width: 500px"></div>

最後に中間にあるカラーも全て埋めます。
これは"同一性"の3DLUTです。入力と全く同じ出力を生成します。
もし色を入力して調べれば、入力と同じカラーが出力されます。

<div class="threejs_center"><object type="image/svg+xml" data="resources/images/3dlut-standard-lookup.svg" class="noinvertdark" data-diagram="lookup" style="width: 600px"></object></div>

キューブをシェーダーで琥珀色に変更し3Dルックアップテーブルの同じ場所を調べると、異なる出力が得られます。

<div class="threejs_center"><object type="image/svg+xml" data="resources/images/3dlut-amber-lookup.svg" class="noinvertdark" data-diagram="lookup" style="width: 600px"></object></div>

別のルックアップテーブルを提供してこの技術を使用すると、全種類の効果を適用できます。
基本的には単一のカラー入力のみを計算できる効果です。
これらの効果には色相、コントラスト、彩度、カラーキャスト、色合い、明るさ、露出、レベル、カーブ、ポスタライズ、シャドウ、ハイライト、その他多くの調整が含まれます。
これが優れている点は全て1つのルックアップテーブルにまとめられてます。

これを使用するには適用するシーンが必要です。
ちょっとしたシーンにこれを適用してみましょう。
まずは[glTFを読み込む記事](threejs-load-gltf.html)で取り上げたようにglTFファイルを表示する所から始めてみます。
載せているモデルは[氷の狼](https://sketchfab.com/sarath.irn.kat005)の[このモデル](https://sketchfab.com/models/a1d315908e9f45e5a3bc618bdfd2e7ee)です。
ライトは使わないので削除しました。

[背景とスカイボックス](threejs-backgrounds.html)で説明したような背景画像も追加します。

{{{example url="../threejs-postprocessing-3dlut-prep.html" }}}

シーンがあるので3DLUTが必要です。
最も単純な3DLUTは2 x 2 x 2の同一性LUTです。*同一性*とは何も起こらない事を意味します。
1を掛けるようなもので、LUTでカラーを調べているにも関わらず、入力カラーと同じ出力カラーがマップされてます。

<div class="threejs_center"><img src="resources/images/3dlut-standard-2x2.svg" class="noinvertdark" style="width: 200px"></div>

WebGL1は3Dテクスチャは非サポートのため、4 x 2の2Dテクスチャを使用しカスタムシェーダーの中で3Dテクスチャとして扱います。
カスタムシェーダーではキューブの各切片がテクスチャ全体に水平に広がっています。

以下はidentityLUTに必要なカラーで4 x 2の2Dテクスチャを作るコードです。

```js
const makeIdentityLutTexture = function() {
  const identityLUT = new Uint8Array([
      0,   0,   0, 255,  // black
    255,   0,   0, 255,  // red
      0,   0, 255, 255,  // blue
    255,   0, 255, 255,  // magenta
      0, 255,   0, 255,  // green
    255, 255,   0, 255,  // yellow
      0, 255, 255, 255,  // cyan
    255, 255, 255, 255,  // white
  ]);

  return function(filter) {
    const texture = new THREE.DataTexture(identityLUT, 4, 2, THREE.RGBAFormat);
    texture.minFilter = filter;
    texture.magFilter = filter;
    texture.needsUpdate = true;
    texture.flipY = false;
    return texture;
  };
}();
```

フィルターをかけたテクステャ、かけていないテクステャの2つを作ります。

```js
const lutTextures = [
  { name: 'identity', size: 2, texture: makeIdentityLutTexture(THREE.LinearFilter) },
  { name: 'identity not filtered', size: 2, texture: makeIdentityLutTexture(THREE.NearestFilter) },
];
```

[ポストプロセスの記事](threejs-post-processing.html)のカスタムシェーダーを使った例を参考に、2つのカスタムシェーダーを使ってみましょう。

```js
const lutShader = {
  uniforms: {
    tDiffuse: { value: null },
    lutMap:  { value: null },
    lutMapSize: { value: 1, },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  `,
  fragmentShader: `
    #include <common>

    #define FILTER_LUT true

    uniform sampler2D tDiffuse;
    uniform sampler2D lutMap;
    uniform float lutMapSize;

    varying vec2 vUv;

    vec4 sampleAs3DTexture(sampler2D tex, vec3 texCoord, float size) {
      float sliceSize = 1.0 / size;                  // space of 1 slice
      float slicePixelSize = sliceSize / size;       // space of 1 pixel
      float width = size - 1.0;
      float sliceInnerSize = slicePixelSize * width; // space of size pixels
      float zSlice0 = floor( texCoord.z * width);
      float zSlice1 = min( zSlice0 + 1.0, width);
      float xOffset = slicePixelSize * 0.5 + texCoord.x * sliceInnerSize;
      float yRange = (texCoord.y * width + 0.5) / size;
      float s0 = xOffset + (zSlice0 * sliceSize);

      #ifdef FILTER_LUT

        float s1 = xOffset + (zSlice1 * sliceSize);
        vec4 slice0Color = texture2D(tex, vec2(s0, yRange));
        vec4 slice1Color = texture2D(tex, vec2(s1, yRange));
        float zOffset = mod(texCoord.z * width, 1.0);
        return mix(slice0Color, slice1Color, zOffset);

      #else

        return texture2D(tex, vec2( s0, yRange));

      #endif
    }

    void main() {
      vec4 originalColor = texture2D(tDiffuse, vUv);
      gl_FragColor = sampleAs3DTexture(lutMap, originalColor.xyz, lutMapSize);
    }
  `,
};

const lutNearestShader = {
  uniforms: {...lutShader.uniforms},
  vertexShader: lutShader.vertexShader,
  fragmentShader: lutShader.fragmentShader.replace('#define FILTER_LUT', '//'),
};
```

フラグメントシェーダーの中に次のような行があるのが分かります。

```glsl
#define FILTER_LUT true
```

2番目のシェーダーを生成するためにその行をコメントアウトします。

これらを使用して2つのカスタムエフェクトを作成します。

```js
const effectLUT = new THREE.ShaderPass(lutShader);
effectLUT.renderToScreen = true;
const effectLUTNearest = new THREE.ShaderPass(lutNearestShader);
effectLUTNearest.renderToScreen = true;
```

背景を別のシーンに描画する既存コードを変更し、glTFと背景を描画するシーンの両方に `RenderPass` を適用します。

```js
const renderModel = new THREE.RenderPass(scene, camera);
renderModel.clear = false;  // so we don't clear out the background
const renderBG = new THREE.RenderPass(sceneBG, cameraBG);
```

全てのパスを使用するように `EffectComposer` を設定できます。

```js
const rtParameters = {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  format: THREE.RGBFormat,
};
const composer = new THREE.EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, rtParameters));

composer.addPass(renderBG);
composer.addPass(renderModel);
composer.addPass(effectLUT);
composer.addPass(effectLUTNearest);
```

LUTを選択するためのGUIコードを作ってみましょう。

```js
const lutNameIndexMap = {};
lutTextures.forEach((info, ndx) => {
  lutNameIndexMap[info.name] = ndx;
});

const lutSettings = {
  lut: lutNameIndexMap.identity,
};
const gui = new GUI({ width: 300 });
gui.add(lutSettings, 'lut', lutNameIndexMap);
```

最後にfilterするかに応じてeffectをオンにし、選択したテクスチャを使用するようにeffectを設定して、`EffectComposer` を通してレンダリングします。

```js
const lutInfo = lutTextures[lutSettings.lut];

const effect = lutInfo.filter ? effectLUT : effectLUTNearest;
effectLUT.enabled = lutInfo.filter;
effectLUTNearest.enabled = !lutInfo.filter;

const lutTexture = lutInfo.texture;
effect.uniforms.lutMap.value = lutTexture;
effect.uniforms.lutMapSize.value = lutInfo.size;

composer.render(delta);
```

同一性の3DLUTである事を考えると何も変わりません。

{{{example url="../threejs-postprocessing-3dlut-identity.html" }}}

しかし、GUIでidentity not filteredを選択すると興味深い結果になります。

<div class="threejs_center"><img src="resources/images/unfiltered-3dlut.jpg" style="width: 500px"></div>

なぜこのようなことが起こるのでしょうか？
filterをオンにするとGPUはカラーの中間を線形補間します。
filterをオフにすると補間は行わなわれず、3DLUT内のカラーを探しても3DLUT内の正確なカラーの1つしか得られません。

もっと面白い3DLUTを作るにはどうすれば良いでしょうか？

まず必要なテーブルの解像度を決定し、簡単なスクリプトを使用しルックアップキューブの切片を生成します。

```js
const ctx = document.querySelector('canvas').getContext('2d');

function drawColorCubeImage(ctx, size) {
  const canvas = ctx.canvas;
  canvas.width = size * size;
  canvas.height = size;

  for (let zz = 0; zz < size; ++zz) {
    for (let yy = 0; yy < size; ++yy) {
      for (let xx = 0; xx < size; ++xx) {
        const r = Math.floor(xx / (size - 1) * 255);
        const g = Math.floor(yy / (size - 1) * 255);
        const b = Math.floor(zz / (size - 1) * 255);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(zz * size + xx, yy, 1, 1);
      }
    }
  }
  document.querySelector('#width').textContent = canvas.width;
  document.querySelector('#height').textContent = canvas.height;
}

drawColorCubeImage(ctx, 8);
```

キャンバスが必要です。

```html
<canvas></canvas>
```

これで任意のサイズで同一性の3Dルックアップテーブルを生成できます。

{{{example url="../3dlut-base-cube-maker.html" }}}

解像度が大きいほど微調整が可能ですが、キューブのデータであるため必要なサイズはすぐに大きくなります。
サイズ8のキューブでは2KBしか必要ありませんが、サイズ64のキューブでは1MB必要です。
したがって、望む効果を再現する最小のものを使用して下さい。

サイズを16に設定しSaveをクリックすると以下のようなファイルができます。

<div class="threejs_center"><img src="resources/images/identity-lut-s16.png"></div>

また、LUTを適用したい部分の画像キャプチャをする必要があります。
通常は上記のシーンを右クリックして "名前を付けて保存... "を選択できますが、`OrbitControls` がOSによっては右クリック防止してるかもしれない事に注意して下さい。
私の場合は、スクリーンショットを取得するためにOSのスクリーンキャプチャ機能を使用しました。

<div class="threejs_center"><img src="resources/images/3dlut-screen-capture.jpg" style="width: 600px"></div>

次に画像エディタ（私の場合はPhotoshop）で上記の画像を読み込み、左上に3DLUTの画像を貼り付けます。

> 備考: 最初にPhotoshop上でLUTファイルをドラッグ＆ドロップしてみましたが、上手くいきませんでした。
> Photoshopで2倍の大きさにしてみました。
> DPIか何かに合わせようとしているのかもしれません。
> LUTファイルを個別に読み込み、コピーして画面キャプチャに貼り付けると上手くいきました。

<div class="threejs_center"><img src="resources/images/3dlut-photoshop-before.jpg" style="width: 600px"></div>

カラーベースのフルイメージ調整を使い画像調整します。
Photoshopの場合、使用できる調整のほとんどは画像 → 調整メニューにあります。

<div class="threejs_center"><img src="resources/images/3dlut-photoshop-after.jpg" style="width: 600px"></div>

好みに合わせて画像を調整して、左上に配置した3DLUTスライスにも同じ調整が適用されているのが分かります。

分かりましたがどうやって使うのでしょうか？

最初にpngを`3dlut-red-only-s16.png`で保存しました。
メモリを節約するために左上にLUTテーブルを16 x 256でトリミングしましたが、もっと楽しむためにロード後にトリミングしておきます。
これの良い点はpngファイルを見ると、LUTの効果をある程度把握できます。
悪い点はもちろん帯域の無駄遣いです。

以下はそれをロードするためのコードです。
このコードはテクスチャをすぐに使用できるように、同一性のLUTから始まります。
次に画像をロードし3D LUT部分だけをキャンバスにコピーします。
キャンバスからデータを取得してテクスチャに設定し、`needsUpdate` をtrueに設定して新しいデータを取得させます。

```js
const makeLUTTexture = function() {
  const imgLoader = new THREE.ImageLoader();
  const ctx = document.createElement('canvas').getContext('2d');

  return function(info) {
    const texture = makeIdentityLutTexture(
        info.filter ? THREE.LinearFilter : THREE.NearestFilter);

    if (info.url) {
      const lutSize = info.size;

      // set the size to 2 (the identity size). We'll restore it when the
      // image has loaded. This way the code using the lut doesn't have to
      // care if the image has loaded or not
      info.size = 2;

      imgLoader.load(info.url, function(image) {
        const width = lutSize * lutSize;
        const height = lutSize;
        info.size = lutSize;
        ctx.canvas.width = width;
        ctx.canvas.height = height;
        ctx.drawImage(image, 0, 0);
        const imageData = ctx.getImageData(0, 0, width, height);

        texture.image.data = new Uint8Array(imageData.data.buffer);
        texture.image.width = width;
        texture.image.height = height;
        texture.needsUpdate = true;
      });
    }

    return texture;
  };
}();
```

先ほど作成したLUTのpngを読み込むのに使ってみましょう。

```js
const lutTextures = [
  { name: 'identity',           size: 2, filter: true , },
  { name: 'identity no filter', size: 2, filter: false, },
+  { name: 'custom',          url: 'resources/images/lut/3dlut-red-only-s16.png' },
];

+lutTextures.forEach((info) => {
+  // if not size set get it from the filename
+  if (!info.size) {
+    // assumes filename ends in '-s<num>[n]'
+    // where <num> is the size of the 3DLUT cube
+    // and [n] means 'no filtering' or 'nearest'
+    //
+    // examples:
+    //    'foo-s16.png' = size:16, filter: true
+    //    'bar-s8n.png' = size:8, filter: false
+    const m = /-s(\d+)(n*)\.[^.]+$/.exec(info.url);
+    if (m) {
+      info.size = parseInt(m[1]);
+      info.filter = info.filter === undefined ? m[2] !== 'n' : info.filter;
+    }
+  }
+
+  info.texture = makeLUTTexture(info);
+});
```

上記ではLUTのサイズをファイル名の最後にエンコードしてます。
これでLUTをpngとして渡すのが簡単になります。

既存のLUTのpngファイルをたくさん追加しておきましょう。

```js
const lutTextures = [
  { name: 'identity',           size: 2, filter: true , },
  { name: 'identity no filter', size: 2, filter: false, },
  { name: 'custom',          url: 'resources/images/lut/3dlut-red-only-s16.png' },
+  { name: 'monochrome',      url: 'resources/images/lut/monochrome-s8.png' },
+  { name: 'sepia',           url: 'resources/images/lut/sepia-s8.png' },
+  { name: 'saturated',       url: 'resources/images/lut/saturated-s8.png', },
+  { name: 'posterize',       url: 'resources/images/lut/posterize-s8n.png', },
+  { name: 'posterize-3-rgb', url: 'resources/images/lut/posterize-3-rgb-s8n.png', },
+  { name: 'posterize-3-lab', url: 'resources/images/lut/posterize-3-lab-s8n.png', },
+  { name: 'posterize-4-lab', url: 'resources/images/lut/posterize-4-lab-s8n.png', },
+  { name: 'posterize-more',  url: 'resources/images/lut/posterize-more-s8n.png', },
+  { name: 'inverse',         url: 'resources/images/lut/inverse-s8.png', },
+  { name: 'color negative',  url: 'resources/images/lut/color-negative-s8.png', },
+  { name: 'high contrast',   url: 'resources/images/lut/high-contrast-bw-s8.png', },
+  { name: 'funky contrast',  url: 'resources/images/lut/funky-contrast-s8.png', },
+  { name: 'nightvision',     url: 'resources/images/lut/nightvision-s8.png', },
+  { name: 'thermal',         url: 'resources/images/lut/thermal-s8.png', },
+  { name: 'b/w',             url: 'resources/images/lut/black-white-s8n.png', },
+  { name: 'hue +60',         url: 'resources/images/lut/hue-plus-60-s8.png', },
+  { name: 'hue +180',        url: 'resources/images/lut/hue-plus-180-s8.png', },
+  { name: 'hue -60',         url: 'resources/images/lut/hue-minus-60-s8.png', },
+  { name: 'red to cyan',     url: 'resources/images/lut/red-to-cyan-s8.png' },
+  { name: 'blues',           url: 'resources/images/lut/blues-s8.png' },
+  { name: 'infrared',        url: 'resources/images/lut/infrared-s8.png' },
+  { name: 'radioactive',     url: 'resources/images/lut/radioactive-s8.png' },
+  { name: 'goolgey',         url: 'resources/images/lut/googley-s8.png' },
+  { name: 'bgy',             url: 'resources/images/lut/bgy-s8.png' },
];
```

そして、ここにはたくさんのLUTがあります。

{{{example url="../threejs-postprocessing-3dlut.html" }}}

最後にもう1つ、ただのお遊びですがAdobeが定義した標準LUTフォーマットがあります。
[ネットで検索するとたくさんのLUTファイル](https://www.google.com/search?q=lut+files)が見つかります。

クイックローダーを書いてみました。
フォーマットの種類は4つありますが、残念ながら私は1種類の例しか見つけられなかったので、全ての種類が動作するかを簡単にテストできませんでした。

ドラッグ＆ドロップライブラリも書いてみます。
両方を使いAdobe LUTファイルをドラッグ＆ドロップして効果を確認できるようにしてみましょう。

まず2つのライブラリが必要です。

```js
import * as lutParser from './resources/lut-reader.js';
import * as dragAndDrop from './resources/drag-and-drop.js';
```

そして次のように利用できます。

```js
dragAndDrop.setup({msg: 'Drop LUT File here'});
dragAndDrop.onDropFile(readLUTFile);

function ext(s) {
  const period = s.lastIndexOf('.');
  return s.substr(period + 1);
}

function readLUTFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const type = ext(file.name);
    const lut = lutParser.lutTo2D3Drgb8(lutParser.parse(e.target.result, type));
    const {size, data, name} = lut;
    const texture = new THREE.DataTexture(data, size * size, size, THREE.RGBFormat);
    texture.minFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    texture.flipY = false;
    const lutTexture = {
      name: (name && name.toLowerCase().trim() !== 'untitled')
          ? name
          : file.name,
      size: size,
      filter: true,
      texture,
    };
    lutTextures.push(lutTexture);
    lutSettings.lut = lutTextures.length - 1;
    updateGUI();
  };

  reader.readAsText(file);
}
```

新しいファイルを含むようにGUIを更新する必要があります。

```js
const lutSettings = {
  lut: lutNameIndexMap.thermal,
};
const gui = new GUI({ width: 300 });
gui.addFolder('Choose LUT or Drag&Drop LUT File(s)');

let lutGUI;
function updateGUI() {
  makeLutNameIndexMap();
  if (lutGUI) {
    gui.remove(lutGUI);
  }
  lutGUI = gui.add(lutSettings, 'lut', lutNameIndexMap);
}
updateGUI();
```

[Adobe LUTをダウンロード](https://www.google.com/search?q=lut+files)し、下の例にドラッグ＆ドロップできます。

{{{example url="../threejs-postprocessing-3dlut-w-loader.html" }}}

Adobe LUTはWeb上のオンライン利用を想定して設計されていません。
これらは大きなファイルです。
下のサンプルの上にドラッグ＆ドロップしてサイズを選択し、"Save... "をクリックし小さなファイルに変換し、PNG形式で保存できます。

以下のサンプルは上記のコードを変更したものです。
背景の絵を描くだけでglTFファイルはありません。
同一性のLUT画像です。

この画像は上記スクリプトから作成された同一性のLUT画像です。
次に読み込まれたLUTファイルを適用するための効果を使用しているので、結果はLUTファイルをPNGとして再現するために必要な画像になります。

{{{example url="../threejs-postprocessing-adobe-lut-to-png-converter.html" }}}

1つ解説を完全に飛ばしてるのは、シェーダー自体がどのように動作するかです。
将来的にはもう少しGLSLをカバーできると良いと思います。
今の所は興味があれば[ポストプロセスの記事](threejs-post-processing.html)のリンクを見たり[この動画を見て下さい](https://www.youtube.com/watch?v=rfQ8rKGTVlg#t=24m30s)。

<script type="module" src="resources/threejs-post-processing-3dlut.js"></script>
