Title: Three.jsでアニメーションする多くのオブジェクトを最適化
Description: モーフターゲットでアニメーションするオブジェクトをマージする
TOC: アニメーションする多くのオブジェクトを最適化

この記事は[多くのオブジェクトを最適化](threejs-optimize-lots-of-objects.html)の続きです。まだ読んでいない場合は先に読んでみて下さい。

前回の記事では約19000個のキューブを単体のジオメトリにマージしました。
19000個のキューブの描画を最適化する利点がありましたが、個々のキューブを動かすのが難しくなる欠点がありました。

何を達成するかによって様々な解決策があります。
今回は複数のデータセットをグラフ化し、そのデータセットでクロスフェードアニメーションさせてみましょう。

まず、複数のデータセットを取得する必要があります。
オフラインでデータの前処理をするのが理想的ですが、今回は2つのデータセットをロードしてさらに2つのデータを生成してみましょう。

以下は古いデータロードのコードです。

```js
loadFile('resources/data/gpw/gpw_v4_basic_demographic_characteristics_rev10_a000_014mt_2010_cntm_1_deg.asc')
  .then(parseData)
  .then(addBoxes)
  .then(render);
```

このような感じに変更してみましょう。

```js
async function loadData(info) {
  const text = await loadFile(info.url);
  info.file = parseData(text);
}

async function loadAll() {
  const fileInfos = [
    {name: 'men',   hueRange: [0.7, 0.3], url: 'resources/data/gpw/gpw_v4_basic_demographic_characteristics_rev10_a000_014mt_2010_cntm_1_deg.asc' },
    {name: 'women', hueRange: [0.9, 1.1], url: 'resources/data/gpw/gpw_v4_basic_demographic_characteristics_rev10_a000_014ft_2010_cntm_1_deg.asc' },
  ];

  await Promise.all(fileInfos.map(loadData));

  ...
}
loadAll();
```

上記のコードでは `fileInfos` 内の各オブジェクトがローティングされたファイルを `file` プロパティに持ち、Promise.allで全てのファイルをロードします。
`name` と `hueRange` プロパティはあとで使います。`name` はUIフィールドです。`hueRange` は色相の範囲をマップし選択するために使います。

上記2ファイルは2010年時点でのエリア別の男性数と女性数を示しています。

注：このデータが正しいかわかりませんが、それは重要ではありません。
重要なのは異なるデータセットを示す事です。

さらに2つのデータセットを生成してみましょう。
1つは女性数よりも男性数が多い場所、逆にもう1つは男性数より女性数が多い場所です。

まず先ほどのデータで新しい2次元配列をマップする前に、2次元配列を生成する関数を書いてみましょう。

```js
function mapValues(data, fn) {
  return data.map((row, rowNdx) => {
    return row.map((value, colNdx) => {
      return fn(value, rowNdx, colNdx);
    });
  });
}
```

通常の `Array.map` 関数と同様に `mapValues` 関数は配列の各値に対して関数 `fn` を呼び出します。
fnには値と行と列のインデックスを渡します。

2つのファイルを比較した新しいファイルを生成するコードを作成します。

```js
function makeDiffFile(baseFile, otherFile, compareFn) {
  let min;
  let max;
  const baseData = baseFile.data;
  const otherData = otherFile.data;
  const data = mapValues(baseData, (base, rowNdx, colNdx) => {
    const other = otherData[rowNdx][colNdx];
      if (base === undefined || other === undefined) {
        return undefined;
      }
      const value = compareFn(base, other);
      min = Math.min(min === undefined ? value : min, value);
      max = Math.max(max === undefined ? value : max, value);
      return value;
  });
  // make a copy of baseFile and replace min, max, and data
  // with the new data
  return {...baseFile, min, max, data};
}
```

上記のコードは `compareFn` 関数で比較された値を元に `mapValues` 関数で新しいデータセットを生成しています。また `min` と `max` の比較結果も持っています。
最後のreturnで新しく `min`、`max`、`data` を追加した以外は `baseFile` と同じプロパティを持つ新しいファイルを作成します。

それを使って2つの新しいデータセットを作りましょう。

```js
{
  const menInfo = fileInfos[0];
  const womenInfo = fileInfos[1];
  const menFile = menInfo.file;
  const womenFile = womenInfo.file;

  function amountGreaterThan(a, b) {
    return Math.max(a - b, 0);
  }
  fileInfos.push({
    name: '>50%men',
    hueRange: [0.6, 1.1],
    file: makeDiffFile(menFile, womenFile, (men, women) => {
      return amountGreaterThan(men, women);
    }),
  });
  fileInfos.push({
    name: '>50% women', 
    hueRange: [0.0, 0.4],
    file: makeDiffFile(womenFile, menFile, (women, men) => {
      return amountGreaterThan(women, men);
    }),
  });
}
```

これらのデータセットを選択するUIを生成しましょう。まず、いくつかのhtmlのUIが必要です。

```html
<body>
  <canvas id="c"></canvas>
+  <div id="ui"></div>
</body>
```

次に左上のエリアに表示するためにCSSを追加しました。

```css
#ui {
  position: absolute;
  left: 1em;
  top: 1em;
}
#ui>div {
  font-size: 20pt;
  padding: 1em;
  display: inline-block;
}
#ui>div.selected {
  color: red;
}
```

各ファイルを調べてデータセットごとにマージされたボックスのセットを生成します。
これでラベル上にマウスカーソルを置くとそのデータセットを表示し、他の全てのデータセットを非表示にするラベルUIを生成できます。

```js
// show the selected data, hide the rest
function showFileInfo(fileInfos, fileInfo) {
  fileInfos.forEach((info) => {
    const visible = fileInfo === info;
    info.root.visible = visible;
    info.elem.className = visible ? 'selected' : '';
  });
  requestRenderIfNotRequested();
}

const uiElem = document.querySelector('#ui');
fileInfos.forEach((info) => {
  const boxes = addBoxes(info.file, info.hueRange);
  info.root = boxes;
  const div = document.createElement('div');
  info.elem = div;
  div.textContent = info.name;
  uiElem.appendChild(div);
  div.addEventListener('mouseover', () => {
    showFileInfo(fileInfos, info);
  });
});
// show the first set of data
showFileInfo(fileInfos, fileInfos[0]);
```

もう1つ変更が必要で `addBoxes` の引数に `hueRange` があります。

```js
-function addBoxes(file) {
+function addBoxes(file, hueRange) {

  ...

    // compute a color
-    const hue = THREE.MathUtils.lerp(0.7, 0.3, amount);
+    const hue = THREE.MathUtils.lerp(...hueRange, amount);

  ...
```

これで4つのデータセットを表示できるようになるはずです。ラベルの上にマウスを置いたり、タッチしてデータセットを切り替える事ができます。

{{{example url="../threejs-lots-of-objects-multiple-data-sets.html" }}}

注意してほしいのは突出したいくつかの奇妙なデータポイントがあります。

これは何が起きてるのでしょう！？

いずれにしてもこの4つのデータセットをラベルから切り替えた際にクロスフェードアニメーションさせるにはどうすればいいのでしょうか。

たくさんのアイデアがあります。

*  `Material.opacity` でクロスフェードアニメーションする

   この解決策の問題点はキューブが完全に重なっているため、Z軸の戦いの問題を意味します。
   depth関数とブレンディングを使い修正できる可能性があります。調べてみた方が良さそうですね。

*  見たいデータセットをスケールアップして他のデータセットをスケールダウンする

   全てのボックスは惑星の中心に位置しているので、1.0以下に縮小すると惑星の中に沈んでしまいます。
   最初は良いアイデアのように聞こえますが、高さの低いボックスはほとんどすぐに消えてしまい、新しいデータセットが1.0までスケールアップするまで置き換えできません。
   このため、アニメーション遷移があまり気持ち良くありません。派手なカスタムシェーダーで修正できるかもしれません。

*  モーフターゲットを使用する

   モーフターゲットはジオメトリ内の各頂点に複数の値を与え、それらの中間を *モーフ* または lerp (線形補間) する方法です。
   モーフターゲットは3Dキャラクターの表情アニメーションに最も一般的に使用されていますがそれだけではありません。

モーフターゲットを使ってみましょう。

これまで通りにデータセットごとにジオメトリを作成しますが、それぞれのデータから `position` を抜き出してモーフターゲットとして使用します。

まず `addBoxes` を変更してマージされたジオメトリを返すだけに変更してみましょう。

```js
-function addBoxes(file, hueRange) {
+function makeBoxes(file, hueRange) {
  const {min, max, data} = file;
  const range = max - min;
  
  ...

-  const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(
-      geometries, false);
-  const material = new THREE.MeshBasicMaterial({
-    vertexColors: true,
-  });
-  const mesh = new THREE.Mesh(mergedGeometry, material);
-  scene.add(mesh);
-  return mesh;
+  return BufferGeometryUtils.mergeBufferGeometries(
+     geometries, false);
}
```

ここでもう1つやるべき事があります。モーフターゲットは全ての頂点数が全く同じである必要があります。
あるターゲットの頂点#123は、他の全てのターゲットに対応する頂点#123を持つ必要があります。
しかし、異なるデータセットにはデータのないデータポイントがあるかもしれないので、
そのポイントに対してはボックスが生成されず、別のデータセットに対応する頂点も生成されません。

そこで全てのデータセットをチェックし、どのセットにもデータがある場合は常に何かを生成するか、
またはどのセットにもデータがない場合は何も生成しないかのどちらかを選択する必要があります。後者をやってみましょう。

```js
+function dataMissingInAnySet(fileInfos, latNdx, lonNdx) {
+  for (const fileInfo of fileInfos) {
+    if (fileInfo.file.data[latNdx][lonNdx] === undefined) {
+      return true;
+    }
+  }
+  return false;
+}

-function makeBoxes(file, hueRange) {
+function makeBoxes(file, hueRange, fileInfos) {
  const {min, max, data} = file;
  const range = max - min;

  ...

  const geometries = [];
  data.forEach((row, latNdx) => {
    row.forEach((value, lonNdx) => {
+      if (dataMissingInAnySet(fileInfos, latNdx, lonNdx)) {
+        return;
+      }
      const amount = (value - min) / range;

  ...
```

`addBoxes` を呼び出していたコードを `makeBoxes` に変更し、モーフターゲットを設定します。

```js
+// make geometry for each data set
+const geometries = fileInfos.map((info) => {
+  return makeBoxes(info.file, info.hueRange, fileInfos);
+});
+
+// use the first geometry as the base
+// and add all the geometries as morphtargets
+const baseGeometry = geometries[0];
+baseGeometry.morphAttributes.position = geometries.map((geometry, ndx) => {
+  const attribute = geometry.getAttribute('position');
+  const name = `target${ndx}`;
+  attribute.name = name;
+  return attribute;
+});
+const material = new THREE.MeshBasicMaterial({
+  vertexColors: true,
+});
+const mesh = new THREE.Mesh(baseGeometry, material);
+scene.add(mesh);

const uiElem = document.querySelector('#ui');
fileInfos.forEach((info) => {
-  const boxes = addBoxes(info.file, info.hueRange);
-  info.root = boxes;
  const div = document.createElement('div');
  info.elem = div;
  div.textContent = info.name;
  uiElem.appendChild(div);
  function show() {
    showFileInfo(fileInfos, info);
  }
  div.addEventListener('mouseover', show);
  div.addEventListener('touchstart', show);
});
// show the first set of data
showFileInfo(fileInfos, fileInfos[0]);
```

上記では最初のデータセットをベースとしたジオメトリを作成し、各ジオメトリから `position` を取得し、
それを `position` のベースジオメトリにモーフターゲットとして追加します。
あとはデータセットの表示・非表示の仕方を変える必要があります。
メッシュを表示・非表示するのではなく、モーフターゲットの影響を変える必要があります。
見たいデータセットは1の影響を持つ必要があり、見たくないデータセットは0の影響を持つ必要があります。

直接0か1にすれば良いのですがそうするとクロスフェードアニメーションが見られなくなり、すでに持っている値に変更がなくスナップします。
または簡単にカスタムアニメーションのコードを書く事ができますが、
オリジナルのwebgl globeでは[アニメーションライブラリ](https://github.com/tweenjs/tween.js/)を使っているので合わせましょう。

アニメーションライブラリをimportする必要があります。

```js
import * as THREE from './resources/three/r131/build/three.module.js';
import * as BufferGeometryUtils from './resources/threejs/r131/examples/jsm/utils/BufferGeometryUtils.js';
import {OrbitControls} from './resources/threejs/r131/examples/jsm/controls/OrbitControls.js';
+import {TWEEN} from './resources/threejs/r131/examples/jsm/libs/tween.min.js';
```

そして、影響を与えるアニメーションの `Tween` を作成します。

```js
// show the selected data, hide the rest
function showFileInfo(fileInfos, fileInfo) {
  fileInfos.forEach((info) => {
    const visible = fileInfo === info;
-    info.root.visible = visible;
    info.elem.className = visible ? 'selected' : '';
+    const targets = {};
+    fileInfos.forEach((info, i) => {
+      targets[i] = info === fileInfo ? 1 : 0;
+    });
+    const durationInMs = 1000;
+    new TWEEN.Tween(mesh.morphTargetInfluences)
+      .to(targets, durationInMs)
+      .start();
  });
  requestRenderIfNotRequested();
}
```

レンダリングループ内でフレームごとに `TWEEN.update` を呼び出しますが問題があります。
"tween.js"は連続的なレンダリング用に設計されていますが、ここでは[要求されたレンダリング](threejs-rendering-on-demand.html)をしています。
連続的なレンダリングに切り替えれますが、何も起きていない時にはレンダリングコストを下げた方が良いため、要求されたレンダリングだけにするのもいいかもしれません。
これを助けるために `TweenManager` を作ります。
TweenManagerは `update` メソッドを持ち、再度呼び出す必要がある場合は `true` を返し、全てのアニメーションが終了した場合は `false` を返します。

```js
class TweenManger {
  constructor() {
    this.numTweensRunning = 0;
  }
  _handleComplete() {
    --this.numTweensRunning;
    console.assert(this.numTweensRunning >= 0);
  }
  createTween(targetObject) {
    const self = this;
    ++this.numTweensRunning;
    let userCompleteFn = () => {};
    // create a new tween and install our own onComplete callback
    const tween = new TWEEN.Tween(targetObject).onComplete(function(...args) {
      self._handleComplete();
      userCompleteFn.call(this, ...args);
    });
    // replace the tween's onComplete function with our own
    // so we can call the user's callback if they supply one.
    tween.onComplete = (fn) => {
      userCompleteFn = fn;
      return tween;
    };
    return tween;
  }
  update() {
    TWEEN.update();
    return this.numTweensRunning > 0;
  }
}
```

TweenMangerを使用するために次のようなコードにします。

```js
function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas});
+  const tweenManager = new TweenManger();

  ...
```

TweenMangerを使って `Tween` を作成します。

```js
// show the selected data, hide the rest
function showFileInfo(fileInfos, fileInfo) {
  fileInfos.forEach((info) => {
    const visible = fileInfo === info;
    info.elem.className = visible ? 'selected' : '';
    const targets = {};
    fileInfos.forEach((info, i) => {
      targets[i] = info === fileInfo ? 1 : 0;
    });
    const durationInMs = 1000;
-    new TWEEN.Tween(mesh.morphTargetInfluences)
+    tweenManager.createTween(mesh.morphTargetInfluences)
      .to(targets, durationInMs)
      .start();
  });
  requestRenderIfNotRequested();
}
```

次にtweenManagerを更新するためにレンダーループを修正し、アニメーションが実行されている場合はレンダリングを継続します。

```js
function render() {
  renderRequested = false;

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

+  if (tweenManager.update()) {
+    requestRenderIfNotRequested();
+  }

  controls.update();
  renderer.render(scene, camera);
}
render();
```

そして、データセットでクロスフェードアニメーションを行う必要があります。

{{{example url="../threejs-lots-of-objects-morphtargets.html" }}}

これでクロスフェードアニメーションが上手く動くようですが、残念ながら色を失ってしまいました。

Three.jsはモーフターゲットの色をサポートしておらず、これはオリジナルの[webgl globe](https://github.com/dataarts/webgl-globe)側の問題です。
基本的には最初のデータセットの色を作るだけです。他のデータセットは色が大きく異なっていても同じ色を使用しています。

色のモーフィングのサポートを追加できるかどうか見てみましょう。これは壊れやすいかもしれませんね。
最も壊れやすい方法はおそらく100%独自のシェーダを書く事でしょうが、内蔵シェーダーをどのように修正するかを見るのは有用だと思います。

まず最初に行う必要があるのは各データセットのジオメトリから色を `BufferAttribute` として抽出するコードを作成する事です。

```js
// use the first geometry as the base
// and add all the geometries as morphtargets
const baseGeometry = geometries[0];
baseGeometry.morphAttributes.position = geometries.map((geometry, ndx) => {
  const attribute = geometry.getAttribute('position');
  const name = `target${ndx}`;
  attribute.name = name;
  return attribute;
});
+const colorAttributes = geometries.map((geometry, ndx) => {
+  const attribute = geometry.getAttribute('color');
+  const name = `morphColor${ndx}`;
+  attribute.name = `color${ndx}`;  // just for debugging
+  return {name, attribute};
+});
const material = new THREE.MeshBasicMaterial({
  vertexColors: true,
});
```

次にthree.jsのシェーダーを修正する必要があります。
Three.jsのマテリアルには `Material.onBeforeCompile` プロパティがあり、関数を割り当てる事ができます。
これはWebGLに渡される前にマテリアルのシェーダーを修正する機会を与えてくれます。
実際に提供されているシェーダーはthree.js独自の特殊なシェーダー構文になっており、
シェーダーの*チャンク*の束をリストアップし、three.jsが各チャンクに対して実際のGLSLコードで置換します。
以下は変更されていない頂点シェーダーのコードで `onBeforeCompile` に渡されるように見えます。

```glsl
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <skinbase_vertex>
	#ifdef USE_ENVMAP
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}
```

上記のシェーダーチャンクから
[`morphtarget_pars_vertex` チャンク](https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/morphtarget_pars_vertex.glsl.js)、
[`morphnormal_vertex` チャンク](https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/morphnormal_vertex.glsl.js)、
[`morphtarget_vertex` チャンク](https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/morphtarget_vertex.glsl.js)、
[`color_pars_vertex` チャンク](https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/color_pars_vertex.glsl.js)、
[`color_vertex` チャンク](https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/color_vertex.glsl.js)
を置き換えたいと思います。

これを行うには単純な置換の配列を作成して `Material.onBeforeCompile` で適用します。

```js
const material = new THREE.MeshBasicMaterial({
  vertexColors: true,
});
+const vertexShaderReplacements = [
+  {
+    from: '#include <morphtarget_pars_vertex>',
+    to: `
+      uniform float morphTargetInfluences[8];
+    `,
+  },
+  {
+    from: '#include <morphnormal_vertex>',
+    to: `
+    `,
+  },
+  {
+    from: '#include <morphtarget_vertex>',
+    to: `
+      transformed += (morphTarget0 - position) * morphTargetInfluences[0];
+      transformed += (morphTarget1 - position) * morphTargetInfluences[1];
+      transformed += (morphTarget2 - position) * morphTargetInfluences[2];
+      transformed += (morphTarget3 - position) * morphTargetInfluences[3];
+    `,
+  },
+  {
+    from: '#include <color_pars_vertex>',
+    to: `
+      varying vec3 vColor;
+      attribute vec3 morphColor0;
+      attribute vec3 morphColor1;
+      attribute vec3 morphColor2;
+      attribute vec3 morphColor3;
+    `,
+  },
+  {
+    from: '#include <color_vertex>',
+    to: `
+      vColor.xyz = morphColor0 * morphTargetInfluences[0] +
+                   morphColor1 * morphTargetInfluences[1] +
+                   morphColor2 * morphTargetInfluences[2] +
+                   morphColor3 * morphTargetInfluences[3];
+    `,
+  },
+];
+material.onBeforeCompile = (shader) => {
+  vertexShaderReplacements.forEach((rep) => {
+    shader.vertexShader = shader.vertexShader.replace(rep.from, rep.to);
+  });
+};
```

また、Three.jsはモーフターゲットをソートし、最も影響の高いものだけを適用します。
これにより1度に数個しか使用されない限り、より多くのモーフターゲットを使用する事ができます。
残念ながらthree.jsではモーフターゲットが何個使われるのか、どの属性に割り当てられるのかを知る方法は提供されていません。
そこでコードを調べて、ここで何をしているのかを再現してみましょう。
もしそのアルゴリズムがthree.jsで変更されたら、このコードをリファクタリングする必要があります。

まず色の属性を全て削除します。今まで追加していなかった属性は削除しても大丈夫なので問題ありません。
次にthree.jsが使用すると思われるターゲットを計算し、最後にそのターゲットをthree.jsが割り当てる属性に割り当てます。

```js

const mesh = new THREE.Mesh(baseGeometry, material);
scene.add(mesh);

+function updateMorphTargets() {
+  // remove all the color attributes
+  for (const {name} of colorAttributes) {
+    baseGeometry.deleteAttribute(name);
+  }
+
+  // three.js provides no way to query this so we have to guess and hope it doesn't change.
+  const maxInfluences = 8;
+
+  // three provides no way to query which morph targets it will use
+  // nor which attributes it will assign them to so we'll guess.
+  // If the algorithm in three.js changes we'll need to refactor this.
+  mesh.morphTargetInfluences
+    .map((influence, i) => [i, influence])            // map indices to influence
+    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))  // sort by highest influence first
+    .slice(0, maxInfluences)                          // keep only top influences
+    .sort((a, b) => a[0] - b[0])                      // sort by index
+    .filter(a => !!a[1])                              // remove no influence entries
+    .forEach(([ndx], i) => {                          // assign the attributes
+      const name = `morphColor${i}`;
+      baseGeometry.setAttribute(name, colorAttributes[ndx].attribute);
+    });
+}
```

この関数は `loadAll` 関数から返します。この方法では変数をリークする必要はありません。

```js
async function loadAll() {
  ...

+  return updateMorphTargets;
}

+// use a no-op update function until the data is ready
+let updateMorphTargets = () => {};
-loadAll();
+loadAll().then(fn => {
+  updateMorphTargets = fn;
+});
```

最後にtweenManagerで値を更新した後、レンダリング前に `updateMorphTargets` を呼び出す必要があります。

```js
function render() {

  ...

  if (tweenManager.update()) {
    requestRenderIfNotRequested();
  }

+  updateMorphTargets();

  controls.update();
  renderer.render(scene, camera);
}
```

これで色をクロスフェードアニメーションさせる事ができます。

{{{example url="../threejs-lots-of-objects-morphtargets-w-colors.html" }}}

これがお役に立てれば幸いです。
three.jsが提供するサービスを利用するか、カスタムシェーダーを使ってモーフターゲットを使うのは多くのオブジェクトを移動させるための一般的なテクニックです。
例として全てのキューブに別の目標を設定し、そこから地球上での最初の位置へと変化します。
地球儀を紹介するにはかっこいいかもしれません。

次は[HTML要素を3Dに整列させる](threejs-align-html-elements-to-3d.html)で説明している地球儀にラベルを追加します。

注: 男性や女性の割合、または正の差をグラフ化する事もできますが、情報を表示する方法に基づいて地表から成長するキューブはほとんどのキューブが低い方が良いでしょう。
これらの他の比較を使用した場合、ほとんどのキューブは最大高さの約1/2の大きさになり可視化として良くありません。
`amountGreaterThan` を変えたように感じますが、このような場合は `Math.max(a - b, 0)` を `(a - b)` "正の差" や `a / (a +b)` "パーセント" のようなものに変えると何を言っているのかわかるでしょう。
