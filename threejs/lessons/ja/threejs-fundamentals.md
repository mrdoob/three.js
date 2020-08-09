Title: Three.jsの基礎
Description: fundamentalsで初めてのThree.jsレッスンを始めましょう
TOC: Fundamentals

これはthree.jsシリーズの最初の記事です。
[Three.js](https://threejs.org) は、できるだけ簡単にWebページ上に3Dコンテンツを表示する3Dライブラリです。

Three.jsはWebGLと混同される事がよくあります。
常にではないですが、ほとんどの場合three.jsはWebGLを使用して3Dを描画するためです。
[WebGLはポイントやライン、三角形のみを描画する非常に低レベルのシステムです](https://webglfundamentals.org)。
three.jsを使わない場合、WebGLで何か便利な事を行うには通常かなりのコードが必要です。
もしWebGLを直接書く場合、シーンやライト、シャドウやマテリアル、テクスチャや3D数学をあなた自身で制御する必要があります。

これらのチュートリアルはJavaScriptを知っている事を前提としており、ほとんどの部分でES6スタイルを使用します。
[あなたがすでに知っている事が期待される簡潔なリストはこちらをご覧下さい](threejs-prerequisites.html)。
three.jsがサポートするほとんどのブラウザは自動更新されるため、ほとんどのユーザーはこのコードを実行できます。
古いブラウザーで実行したい場合は、[Babel](https://babel.io) のようなトランスパイラーを調べて下さい。
もちろん、本当に古いブラウザを実行しているユーザーはthree.jsを実行できないマシンを持っている可能性があります。

ほとんどのプログラミング言語を学ぶ時、最初にする事は `"Hello World!"` を表示する事です。
3Dで最初に行う最も一般的な事の1つは、3Dキューブを作成する事です。
それでは "Hello Cube!" から始めましょう。

最初に必要なのは `<canvas>` タグです。

```html
<body>
  <canvas id="c"></canvas>
</body>
```

Three.jsはcanvasに描画するため、canvasをthree.jsに渡す必要があります。

```html
<script type="module">
import * as THREE from './resources/threejs/r119/build/three.module.js';

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas});
  ...
</script>
```

scriptタグに `type="module"` を含めることが重要です。
これにより `import` キーワードを使用してthree.jsを読み込む事ができます。
three.jsを読み込む方法は他にもありますが、r106の時点ではモジュールを使用する事をお勧めします。
モジュールには、必要な他のモジュールを簡単にインポートできるという利点があります。
これにより、依存している追加のスクリプトを手動で読み込む必要がなくなります。

ここにいくつかの難解な事があります。
もしcanvasをthree.jsに渡さない場合、canvasをdocumentに追加する必要があります。
canvasを追加する場所は、ユースケースに応じて変わる可能性があります。
また、コードを変更する必要があるため、canvasをthree.jsに渡す事は少し柔軟性があると感じます。
canvasをどこにでも配置でき、コードを見つける事ができます。
canvasをdocumentに挿入するコードがあるかのように、ユースケースが変更された場合、そのコードを変更する必要があります。

canvasを検索した後、`WebGLRenderer` を作成します。
rendererは提供された全てのデータを取得し、canvasにレンダリングします。
過去に `CSSRenderer` や `CanvasRenderer` のような他のレンダラーがありましたが、将来的には `WebGL2Renderer` または `WebGPURenderer` があるかもしれません。

今はWebGLを使用して3Dをcanvasにレンダリングする `WebGLRenderer` があります。

次はカメラが必要です。

```js
const fov = 75;
const aspect = 2;  // the canvas default
const near = 0.1;
const far = 5;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
```

`fov` は `field of view` の略です。この場合、垂直方向に75度を表します。
three.jsのほとんどの角度はラジアン単位ですが、いくつかの理由でパースペクティブカメラは角度を設定します。

`aspect` はcanvasの表示アスペクトです。
別の記事で詳細を説明しますが、デフォルト値はcanvasは300x150ピクセルで、アスペクトは300/150、または2になります。
`near` と `far` は、レンダリングされるカメラの前のスペースを表します。
その範囲の前またはその範囲の後はクリップされます（描画されません）。

これらの4つの設定は *"錐台"* を定義します。
*錐台* は、先端が切り取られたピラミッドのような3D形状の名前です。
つまり、"錐台" という言葉は、球、立方体、角柱、錐台のような別の3D形状と考えて下さい。

<img src="resources/frustum-3d.svg" width="500" class="threejs_center"/>

近距離および遠距離の平面の高さは、視野によって決まります。
両方の平面の幅は、視野とアスペクトによって決まります。

定義された錐台内のすべてが描画されます。錐台外は何も描画しません。

カメラはデフォルトで、Yを上にして-Z軸を見下ろします。
立方体を原点に配置するので、カメラを原点から少し後ろに動かし、何かを見えるようにする必要があります。

```js
camera.position.z = 2;
```

以下が私たちが目指しているものです。

<img src="resources/scene-down.svg" width="500" class="threejs_center"/>

上の図では、カメラが `z = 2` にある事がわかります。
-Z軸を見下ろしています。
錐台は、カメラの正面から0.1単位で開始し、カメラの正面の5単位に移動します。
この図では見下ろしているため、視野はアスペクトの影響を受けます。
canvasは高さの2倍の幅であるため、ビュー全体で視野は垂直方向の視野である指定された75度よりもはるかに広くなります。

次は `Scene` を作成します。
three.jsの `Scene` は、シーングラフのフォームのルートです。
three.jsで描画するものはすべてシーンに追加する必要があります。
[Sceneの仕組みの詳細](threejs-scenegraph.html)は、今後の記事で説明します。

```js
const scene = new THREE.Scene();
```

次はボックスのデータが含まれている `BoxGeometry` を作成します。
Three.jsで表示するほとんど全てのものには、3Dオブジェクトを構成する頂点を定義するジオメトリが必要です。

```js
const boxWidth = 1;
const boxHeight = 1;
const boxDepth = 1;
const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
```

基本的なマテリアルを作成し、色を設定します。
色は標準のCSSスタイルの6桁の16進数の色値を使用して指定できます。

```js
const material = new THREE.MeshBasicMaterial({color: 0x44aa88});
```

次に `Mesh` を作成します。 `Mesh` は `Geometry` (オブジェクトの形状)と `Material` （オブジェクトの描画方法、光沢または平坦、適用する色、適用するテクステャなど）を組み合わせます。
シーン内のオブジェクトの位置、方向、スケールと同様です。

```js
const cube = new THREE.Mesh(geometry, material);
```

最後にメッシュをシーンに追加します。

```js
scene.add(cube);
```

次にレンダラーの描画関数にシーンとカメラに渡し、シーンをレンダリングします。

```js
renderer.render(scene, camera);
```

これが実際の例です。

{{{example url="../threejs-fundamentals.html" }}}

私たちの視点からは、これを3Dキューブと言うのは少し難しいです。Z軸がマイナス値で奥にあり、1つの面しか見ていません。

回転アニメーションさせて、3Dキューブで描画されている事を明らかにします。アニメーションさせるには [`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) を使用しループ処理内で描画します。

これがループです。

```js
function render(time) {
  time *= 0.001;  // convert time to seconds

  cube.rotation.x = time;
  cube.rotation.y = time;

  renderer.render(scene, camera);

  requestAnimationFrame(render);
}
requestAnimationFrame(render);
```

`requestAnimationFrame` は、何かをアニメーションさせたい時に使います。
これに呼び出される関数を渡します。今回渡す関数は `render` です。
関数を呼び出し、表示に関連する何かを更新するとブラウザがページを再描画します。
私たちの場合、three.jsの `renderer.render` 関数を呼び出しシーンを描画します。
`requestAnimationFrame` は、ページがロードされて渡した関数が呼ばれるまで少し時間がかかります。その時間はミリ秒単位です。
秒に変換する方が簡単に扱えるため、ここではミリ秒を秒に変換します。

次にキューブのXとY回転に現在の時間を設定します。
回転は [ラジアン](https://en.wikipedia.org/wiki/Radian) 単位です。
円の中に2πのラジアンがあります。キューブは1秒間に約6.28ごと各軸で1回転します。

シーンをレンダリングし、別のアニメーションフレームをループし続けます。
ループの外側で `requestAnimationFrame` を1回呼び出してループを開始します。

{{{example url="../threejs-fundamentals-with-animation.html" }}}

少し良くなりましたが、まだ3Dには見えません。3Dに見えるようにいくつか光源を追加します。つまり、ライトを追加しましょう。
three.jsには [今後の記事](threejs-lights.html) で紹介する多くの種類のライトがあります。
とりあえずディレクショナルライトを作成しましょう。

```js
{
  const color = 0xFFFFFF;
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(-1, 2, 4);
  scene.add(light);
}
```

ディレクショナルライトは位置とターゲットを持っています。どちらもデフォルト値は 0, 0, 0 です。
今回はライトの位置を -1、2、4 に設定しているため、カメラの後ろの少し左上側にあります。
ターゲットはまだ 0, 0, 0 なので原点に向かって輝きます。

また、マテリアルを変更する必要があります。`MeshBasicMaterial` はライトの影響を受けません。ライトの影響をうける `MeshPhongMaterial` に変更してみましょう。

```js
-const material = new THREE.MeshBasicMaterial({color: 0x44aa88});  // greenish blue
+const material = new THREE.MeshPhongMaterial({color: 0x44aa88});  // greenish blue
```

そして、ここで動作しています。

{{{example url="../threejs-fundamentals-with-light.html" }}}

これでかなり3Dに見えるようになりました。

楽しんでみるために、さらに2つのキューブを追加しましょう。

各キューブに同じジオメトリを使用しますが、キューブごとに異なるカラーが適用できるため、異なるマテリアルを作成します。

最初に、指定した色で新しいマテリアルを作成する関数を作ります。
次に、指定したジオメトリをシーンに追加し、X位置を設定したメッシュを作成します。

```js
function makeInstance(geometry, color, x) {
  const material = new THREE.MeshPhongMaterial({color});

  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  cube.position.x = x;

  return cube;
}
```

次に、異なる色とX位置を指定した `Mesh` インスタンスを配列に保存する関数を3回呼び出します。

```js
const cubes = [
  makeInstance(geometry, 0x44aa88,  0),
  makeInstance(geometry, 0x8844aa, -2),
  makeInstance(geometry, 0xaa8844,  2),
];
```

最後に、描画関数の中でで3つのキューブすべてを回転します。
それぞれにわずかに異なる回転を計算し適用します。

```js
function render(time) {
  time *= 0.001;  // convert time to seconds

  cubes.forEach((cube, ndx) => {
    const speed = 1 + ndx * .1;
    const rot = time * speed;
    cube.rotation.x = rot;
    cube.rotation.y = rot;
  });

  ...
```

それがここにあります。

{{{example url="../threejs-fundamentals-3-cubes.html" }}}

上記のトップダウン図と比較すると、期待通りである事がわかります。
X = -2 および X = +2の場合、キューブは部分的に錐台の外側にあります。
錐台の外側は何だか誇張して歪んでおり、キャンバスの向こう側はとても極端です。

この短いイントロが学習を始めるのに役立つ事を願っています。
[次は複数の状況に適応できるようにレスポンシブサイトでのコードもカバーします](threejs-responsive.html)。

<div class="threejs_bottombar">
<h3>es6モジュール、three.js、およびフォルダー構造</h3>
<p>バージョンr106以降でthree.jsを使用する好ましい方法は
<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import">es6モジュール</a>です。</p>
<p>
es6モジュールはスクリプトのロードに <code>import</code> を使う事ができます。
また、HTMLのインラインに <code>&lt;script type="module"&gt;</code> タグが使えます。
両方とも以下に例を示します。
</p>
<pre class=prettyprint>
&lt;script type="module"&gt;
import * as THREE from './resources/threejs/r119/build/three.module.js';

...

&lt;/script&gt;
</pre>
<p>
パスは絶対パス、または相対パスでなければなりません。
相対パスは常に <code>./</code> または <code>../</code> から始まり、
<code>&lt;img&gt;</code> や <code>&lt;a&gt;</code> など他のタグと異なります。
</p>
<p>
同じスクリプトへの参照は、絶対パスである限り一度だけロードされます。
three.jsの場合、すべてのexamplesを正しいフォルダ階層に入れる必要があります。
</p>
<pre class="dos">
someFolder
 |
 ├-build
 | |
 | +-three.module.js
 |
 +-examples
   |
   +-jsm
     |
     +-controls
     | |
     | +-OrbitControls.js
     | +-TrackballControls.js
     | +-...
     |
     +-loaders
     | |
     | +-GLTFLoader.js
     | +-...
     |
     ...
</pre>
<p>
このフォルダー構造が必要な理由は、 <a href="https://github.com/mrdoob/three.js/blob/master/examples/jsm/controls/OrbitControls.js"><code>OrbitControls.js</code></a> のようなexamplesのスクリプトには相対パスがハードコーディングされてるからです。
</p>
<pre class="prettyprint">
import * as THREE from '../../../build/three.module.js';
</pre>
<p>
同じフォルダ構造を使用すると、importしたthreeとexampleライブラリは両方とも同じthree.module.jsを参照します。
</p>
<pre class="prettyprint">
import * as THREE from './someFolder/build/three.module.js';
import {OrbitControls} from './someFolder/examples/jsm/controls/OrbitControls.js';
</pre>
<p>これにはCDNを使用する場合も含まれます。 <code>three.modules.js</code> のパスが <code>/build/three.modules.js</code> のようになってる事を確認して下さい。例えば</p>
<pre class="prettyprint">
import * as THREE from 'https://unpkg.com/three@0.108.0/<b>build/three.module.js</b>';
import {OrbitControls} from 'https://unpkg.com/three@0.108.0/examples/jsm/controls/OrbitControls.js';
</pre>
<p>古い書き方を好む場合は <code>&lt;script src="path/to/three.js"&gt;&lt;/script&gt;</code> 
<a href="https://r105.threejsfundamentals.org">このサイトの古いバージョン</a> このサイトの古いバージョンをチェックアウトできます。
Three.jsには、下位互換性を心配しないというポリシーがあります。
あなたが特定のバージョンを使い、コードをダウンロードしてプロジェクトに入れる事を期待しています。
新しいバージョンにアップグレードする時、 <a href="https://github.com/mrdoob/three.js/wiki/Migration-Guide">移行ガイド</a> を読み変更する必要があるものを見る事ができます。
es6モジュールとクラススクリプトの両方をメンテナンスするのは面倒のため、このサイトではes6モジュールのみ扱います。
他の場所でも述べたように古いブラウザをサポートするには <a href="https://babeljs.io">トランスパイラー</a> を調べて下さい。
</p>
</div>
