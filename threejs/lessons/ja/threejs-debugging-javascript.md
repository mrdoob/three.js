Title: Three.jsでのJavaScriptデバッグ
Description: THREE.jsでJavaScriptをデバッグする方法
TOC: JavaScriptのデバッグ

この記事のほとんどはTHREE.jsのデバッグと言うより、一般的なJavaScriptのデバッグの内容です。THREE.js初心者にはJavaScript初心者も多いので、この記事を読んで困った時に簡単に解決できるようになると良いと思います。

デバッグは大きなトピックであり、この記事で全てをカバーできませんが、JavaScriptに慣れていない場合はいくつかのヒントを得られると思います。デバッグに関しては、時間をかけて学ぶ事を強くお勧めします。デバッグはあなたの学習を大いに助けてくれます。

## ブラウザの開発者ツールを学ぶ

全てのブラウザには開発者ツールがあります。
[Chrome](https://developers.google.com/web/tools/chrome-devtools/),
[Firefox](https://developer.mozilla.org/en-US/docs/Tools), 
[Safari](https://developer.apple.com/safari/tools/), 
[Edge](https://docs.microsoft.com/en-us/microsoft-edge/devtools-guide).

Chromeでは `⋮` アイコンをクリックし、その他のツール -> デベロッパーツールを選択すると開発者ツールが表示されます。そこにはキーボードのショートカットも表示されています。

<div class="threejs_center"><img class="border" src="resources/images/devtools-chrome.jpg" style="width: 789px;"></div>

Firefoxでは `☰` アイコンをクリックし、"ウェブ開発"から"開発者ツール"を選択します。

<div class="threejs_center"><img class="border" src="resources/images/devtools-firefox.jpg" style="width: 786px;"></div>

Safariでは詳細設定メニューから開発メニューを有効にする必要があります。

<div class="threejs_center"><img class="border" src="resources/images/devtools-enable-safari.jpg" style="width: 775px;"></div>

次に開発メニューで"Webインスペクタの表示/接続"を選択します。

<div class="threejs_center"><img class="border" src="resources/images/devtools-safari.jpg" style="width: 777px;"></div>

[Chromeを使ってAndroidやタブレットでChrome上で実行されているウェブページをデバッグする事もできます](https://developers.google.com/web/tools/chrome-devtools/remote-debugging/)。
同様にSafariでは[iPhoneやiPadでSafari上で実行されているウェブページをPCでデバッグする事ができます](https://www.google.com/search?q=safari+remote+debugging+ios)。

私はChromeを一番よく知ってるのでChromeを例にしますが、ほとんどのブラウザは似たような機能を持っているため、全てのブラウザで簡単に同じ機能を適用できるはずです。

## キャッシュをオフにする

ブラウザはダウンロードしたデータを再利用します。これはウェブサイトを2回目に訪れた際、サイトを表示するために必要な多くのファイルは再びダウンロードされず、ユーザーにとって素晴らしい事です。

一方でこれはウェブ開発に悪い影響を与える可能性があります。PC上でファイルを変更しリロードしても、前回ダウンロードしたバージョンを使用しているため変更内容が表示されません。

ウェブ開発中の解決策の1つは、キャッシュをオフにする事です。これによりブラウザは常に最新バージョンのファイルを取得する事ができます。

最初にデベロッパーツールのSettingsメニューを選択します。

<div class="threejs_center"><img class="border" src="resources/images/devtools-chrome-settings.jpg" style="width: 778px"></div>

次に "Disable Cache (while DevTools is open)" を選択します。

<div class="threejs_center"><img class="border" src="resources/images/devtools-chrome-disable-cache.jpg" style="width: 779px"></div>

## JavaScriptコンソールを使用する

全てのdevtoolsの中には *console* があります。ここには警告やエラーメッセージが表示されます。

**メッセージを読みましょう!!**

一般的にはメッセージは1つか2つしかありません。

<div class="threejs_center"><img class="border" src="resources/images/devtools-no-errors.jpg" style="width: 779px"></div>

もし他のメッセージがあれば**メッセージを読みましょう**。例えば

<div class="threejs_center"><img class="border" src="resources/images/devtools-errors.jpg" style="width: 779px"></div>

"three"を"threee"とスペルミスしました。

以下のように `console.log` であなた自身がconsoleに情報を表示する事もできます。

```js
console.log(someObject.position.x, someObject.position.y, someObject.position.z);
```

さらにクールな事にオブジェクトのログを記録したり検査する事ができます。例えば[gLTFの記事](threejs-load-gltf.html)からルートシーンのオブジェクトをログに表示できます。

```js
  {
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('resources/models/cartoon_lowpoly_small_city_free_pack/scene.gltf', (gltf) => {
      const root = gltf.scene;
      scene.add(root);
+      console.log(root);
```

そしてそのオブジェクトをJavaScriptコンソールで展開できます。

<div class="threejs_center"><img class="border" src="resources/images/devtools-console-object.gif"></div>

スタックトレースを含む赤色メッセージを表示する場合は `console.error` を使う事ができます。

## データを画面に表示させる

もう1つの分かりやすい方法は `<div>` や `<pre>` を追加しデータを入れる事です。

最も分かりやすい方法はいくつかのHTML要素を作成する事です。

```html
<canvas id="c"></canvas>
+<div id="debug">
+  <div>x:<span id="x"></span></div>
+  <div>y:<span id="y"></span></div>
+  <div>z:<span id="z"></span></div>
+</div>
```

キャンバスの上に残るようにスタイルを整えます（キャンバスがページを埋めていると仮定します）。

```html
<style>
#debug {
  position: absolute;
  left: 1em;
  top: 1em;
  padding: 1em;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  font-family: monospace;
}
</style>
```

そして要素を探して内容を設定します。

```js
// at init time
const xElem = document.querySelector('#x');
const yElem = document.querySelector('#y');
const zElem = document.querySelector('#z');

// at render or update time
xElem.textContent = someObject.position.x.toFixed(3);
yElem.textContent = someObject.position.y.toFixed(3);
zElem.textContent = someObject.position.z.toFixed(3);
```

これはリアルタイムな値を見る時はとても便利です。

{{{example url="../threejs-debug-js-html-elements.html" }}}

または画面にデータを貼り付けるのにクリアロガーを作成する方法もあります。私はその言葉を作っただけですが、私が手がけたゲームの多くはこの解決法を使っています。
このアイデアは1フレーム分だけメッセージを表示するバッファを持つ事です。
データを表示したいコードのどの部分でも、フレームごとにバッファにデータを追加する関数を呼び出します。これは上記のデータのピースごとに要素を作成するよりもはるかに少ない作業です。

例えば上記のHTMLを以下のように変更してみましょう。

```html
<canvas id="c"></canvas>
<div id="debug">
  <pre></pre>
</div>
```

この*クリアバックバッファ*を管理するための簡単なクラスを作ってみましょう。

```js
class ClearingLogger {
  constructor(elem) {
    this.elem = elem;
    this.lines = [];
  }
  log(...args) {
    this.lines.push([...args].join(' '));
  }
  render() {
    this.elem.textContent = this.lines.join('\n');
    this.lines = [];
  }
}
```

次にマウスをクリックするたびに2秒間のランダムな方向に移動するメッシュを作成する簡単な例を作ってみましょう。[レスポンシブデザイン](threejs-responsive.html)の記事から例を紹介します。

マウスをクリックするたびに新しい `Mesh` を追加するコードは以下の通りです。

```js
const geometry = new THREE.SphereGeometry();
const material = new THREE.MeshBasicMaterial({color: 'red'});

const things = [];

function rand(min, max) {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return Math.random() * (max - min) + min;
}

function createThing() {
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  things.push({
    mesh,
    timer: 2,
    velocity: new THREE.Vector3(rand(-5, 5), rand(-5, 5), rand(-5, 5)),
  });
}

canvas.addEventListener('click', createThing);
```

このコードは作成したメッシュを移動させログに記録し、タイマーが切れたら削除します。

```js
const logger = new ClearingLogger(document.querySelector('#debug pre'));

let then = 0;
function render(now) {
  now *= 0.001;  // convert to seconds
  const deltaTime = now - then;
  then = now;

  ...

  logger.log('fps:', (1 / deltaTime).toFixed(1));
  logger.log('num things:', things.length);
  for (let i = 0; i < things.length;) {
    const thing = things[i];
    const mesh = thing.mesh;
    const pos = mesh.position;
    logger.log(
        'timer:', thing.timer.toFixed(3), 
        'pos:', pos.x.toFixed(3), pos.y.toFixed(3), pos.z.toFixed(3));
    thing.timer -= deltaTime;
    if (thing.timer <= 0) {
      // remove this thing. Note we don't advance `i`
      things.splice(i, 1);
      scene.remove(mesh);
    } else {
      mesh.position.addScaledVector(thing.velocity, deltaTime);
      ++i;
    }
  }

  renderer.render(scene, camera);
  logger.render();

  requestAnimationFrame(render);
}
```

以下のサンプルでマウスをクリックして下さい。

{{{example url="../threejs-debug-js-clearing-logger.html" }}}

## クエリパラメーター

もう1つ覚えておきたいのは、ウェブページにはクエリパラメーターやアンカーを介してデータを渡す事ができます。検索とハッシュと呼ばれる事があります。

    https://domain/path/?query#anchor

これを使用しオプション機能やパラメーターを渡す事ができます。

先ほどの例では次のようにしています。デバッグ機能はURLに `?debug=true` を指定した場合にのみ表示されます。

まず、クエリストリングを解析するコードが必要です。

```js
/**
  * Returns the query parameters as a key/value object. 
  * Example: If the query parameters are
  *
  *    abc=123&def=456&name=gman
  *
  * Then `getQuery()` will return an object like
  *
  *    {
  *      abc: '123',
  *      def: '456',
  *      name: 'gman',
  *    }
  */
function getQuery() {
  return Object.fromEntries(new URLSearchParams(window.location.search).entries());
}
```

そうすると、debug要素をデフォルトでは表示しないようにする事ができるかもしれません。

```html
<canvas id="c"></canvas>
+<div id="debug" style="display: none;">
  <pre></pre>
</div>
```

このコードをみると `?debug=true` が渡された場合のみデバッグ情報を表示するのが分かります。

```js
const query = getQuery();
const debug = query.debug === 'true';
const logger = debug
   ? new ClearingLogger(document.querySelector('#debug pre'))
   : new DummyLogger();
if (debug) {
  document.querySelector('#debug').style.display = '';
}
```

`?debug=true` の場合は何も渡さないように `DummyLogger` を作りました。

```js
class DummyLogger {
  log() {}
  render() {}
}
```

以下のURLを使用して確認する事ができます。

<a target="_blank" href="../threejs-debug-js-params.html">threejs-debug-js-params.html</a>

上記にはデバッグ情報はありません。

<a target="_blank" href="../threejs-debug-js-params.html?debug=true">threejs-debug-js-params.html?debug=true</a>

こちらにはデバッグ情報があります。

複数のパラメーターは `somepage.html?someparam=somevalue&someotherparam=someothervalue` のように'&'で区切る事で渡せます。
このようなパラメータを使用するとあらゆる種類のオプションを渡す事ができます。
`speed=0.01` のようにアプリの速度を遅くしてわかりやすくしたり、`showHelpers=true` のように他のレッスンで見られる照明や影、カメラの錐台を表示するヘルパーを追加してもいいかもしれません。

## デバッガの使い方を学ぶ

どのブラウザにもデバッガがあり、プログラムを1行ごとに一時停止し全ての変数を検査する事ができます。

デバッガの使い方を教えるのはあまりにも大きなトピックなので、ここではいくつかのリンクを紹介します。

* [Chrome DevTools で JavaScript をデバッグする](https://developers.google.com/web/tools/chrome-devtools/javascript/)
* [Debugging in Chrome](https://javascript.info/debugging-chrome)
* [Tips and Tricks for Debugging in Chrome Developer Tools](https://hackernoon.com/tips-and-tricks-for-debugging-in-chrome-developer-tools-458ade27c7ab)

## デバッガなどで `NaN` がないかチェックする

`NaN` は Not A Numberの略です。これは数学的に意味のない事をした場合、JavaScript が値として代入するものです。

簡単な例としては

<div class="threejs_center"><img class="border" src="resources/images/nan-banana.png" style="width: 180px;"></div>

何か開発中に画面に何も表示されない事がよくあるので、私は `NaN` が表示されたらその場所からすぐにいくつかの値を確認します。

例として最初に[gLTFファイルの読込](threejs-load-gltf.html)の記事でパスを作り始めた時に2次元曲線を作るSplineCurveクラスを使って曲線を作ってみました。

そのカーブを利用してこのように車を動かしました。

```js
curve.getPointAt(zeroToOnePointOnCurve, car.position);
```

内部的には `curve.getPointAt` は第2引数に渡されたオブジェクトに対して `set` 関数を呼び出します。この場合、第2引数は `car.position` であり、これは `Vector3` です。`Vector3` の `set` 関数はx, y, zの3つの引数を必要としますが、`SplineCurve` は2次元曲線なので、xとyだけを指定して `car.position.set` を呼び出します。

その結果、`car.position.set` はxにx、yにy、zに `undefined` をセットします。

デバッガで `matrixWorld` を見てみると `NaN` 値が表示されています。

<div class="threejs_center"><img class="border" src="resources/images/debugging-nan.gif" style="width: 476px;"></div>

行列を見ると `NaN` が含まれており、`position`、 `rotation`、 `scale` または他の関数に悪い影響を与えるデータがあるのが見えます。これらの悪いデータから逆算すると問題を追跡するのは簡単です。

`NaN` の上には `Infinity` もありますが、これはどこかに数学のバグがあるような気がします。

## コードの中を見て！

THREE.jsはオープンソースです。コードの中を見る事を恐れないで下さい！
[github](https://github.com/mrdoob/three.js)で内部コードを見れます。
また、デバッガの関数を踏み込んで内部を見る事もできます。その際には `three.min.js` でなく `three.js` を見るようにして下さい。`three.min.js` は最小化・圧縮されたバージョンなので、ダウンロードする際のサイズが小さくなっています。`three.js` はサイズは大きいですが、デバッグしやすいバージョンです。私はよく `three.js` に切り替えて、コードのステップスルーを行い、何が起こっているのかを確認しています。

## `requestAnimationFrame` はrender関数の一番下へ

以下のパターンはよく見かけます。

```js
function render() {
   requestAnimationFrame(render);

   // -- do stuff --

   renderer.render(scene, camera);
}
requestAnimationFrame(render);
```

以下のように `requestAnimationFrame` を一番下に置く事をお勧めします。

```js
function render() {
   // -- do stuff --

   renderer.render(scene, camera);

   requestAnimationFrame(render);
}
requestAnimationFrame(render);
```

最大の理由はエラーが発生した場合にコードが停止する事です。
`requestAnimationFrame` を先頭に置くと、既に別のフレームを要求しているためにエラーが発生してもコードを実行し続けます。
IMOを無視するよりも、それらのエラーを見つける方が良いでしょう。これらのエラーは何かが期待したように表示されない原因になりやすいのですが、コードが停止しない限り、気がつかないかもしれません。

## 単位をチェックして下さい！

角度やラジアンを使う時の例を知っておく必要があります。
残念ながらTHREE.jsではどこでも同じ単位を使用している訳ではありません。
すぐに思いつくのだとカメラの視野は度単位です。それ以外の角度は全てラジアン単位です。

もう1つ注目したいのは、世界単位のサイズです。最近の3Dアプリでは好きな単位を選べるようになっています。あるアプリでは1単位＝1cmを選択する事があります。もう1つのアプリでは1台＝1フィートを選ぶかもしれません。特定のアプリケーションでは必要なユニットを選択する事ができます。three.jsでは1単位＝1メートルを想定しています。
これは測定器を使用して照明効果を計算する物理ベースのレンダリングなどで重要です。
スマホがどこにあるか、VRコントローラーがどこにあるかなど、現実世界の単位を扱う必要があるARやVRにとっても重要です。

## スタックオーバーフローのための *最小で完全で検証可能なサンプルコード* の作成

THREE.jsの質問をする場合、MCVE（Minimal<最小>、Complete<完全>、Verifiable<検証可能>、Example<サンプル>の略）のコードを提供する事が求められます。

**最小**の部分が重要です。[gLTF読込の記事](threejs-load-gltf.html)の最後のサンプルコードでパスの動きに問題があったとしましょう。そのサンプルには多くのパーツがあり、リストアップすると

1. HTMLの集まり
2. いくつかのCSS
3. ライティング
4. 影
5. 影を操作するためのDAT.guiコード
6. GLTFファイルの読込コード
7. キャンバスのリサイズコード
8. パスに沿って車を移動させるコード

このコードはかなり大きいです。もし質問がパスの後に続く部分だけであれば、THREE.jsの `<canvas>` と `<script>` タグだけで済むので、ほとんどのHTMLを削除する事ができます。また、CSSとリサイズのコードを削除する事ができます。GLTFのコードもパスだけを気にしているので削除できます。`MeshBasicMaterial` を使用するとライトとシャドウも削除する事ができます。DAT.guiのコードも確実に削除できます。
このコードはテクスチャ付きの地面を作ります。`GridHelper` を使った方が簡単です。
最終的にもし質問したい事がパス上での移動についてなら、ロードされた車モデルの代わりにパス上にキューブを使用する事ができます。

以上の事を考慮したミニマムなサンプルコードを紹介します。271行から135行に縮小しました。パスを単純化する事でさらに縮小する事も考られます。3,4点のパスは、21点のパスと同じように動作するかもしれません。

{{{example url="../threejs-debugging-mcve.html" }}}

`OrbitController` を残してるのはカメラを動かして何が起こっているのかを把握するのに便利だからですが、問題によってはこれも削除できるかもしれません。

MCVEを作る上で一番良い点は、自分自身で解決する事が多いという事です。不要なものを取り除いて可能な限り小さなサンプルコードを作って問題を再現する事で、バグにたどり着く事が多いからです。

その上でStack Overflowで自分のコードを見てもらうのは、回答者の時間を尊重する事になります。最小限のサンプルを作る事で、誰かがあなたを助ける事がはるかに簡単になります。また、その過程で以下を学ぶ事ができます。

Stack Overflowに質問を投稿する際、**コードを[スニペット](https://stackoverflow.blog/2014/09/16/introducing-runnable-javascript-css-and-html-code-snippets/)**にする事が重要です。
もちろん、MCVEを試すためにJSFiddleやCodepen、または同様のサイトを使用する事は歓迎しますが、実際にStack Overflowに質問を投稿するようになったら、**質問自体に**問題を再現するためのコードを記述する必要があります。
スニペットを作る事でその条件を満たしています。

また、このサイト上の全てのライブサンプルはスニペットとして実行されるべきである事に注意して下さい。HTML、CSS、JavaScriptの部分を[スニペットエディタ](https://stackoverflow.blog/2014/09/16/introducing-runnable-javascript-css-and-html-code-snippets/)のそれぞれの部分にコピーするだけです。ただし、自分の問題に関係のない部分を削除し、必要最低限のコードにするのを忘れないようにして下さい。

これらに従えば、あなたの問題は助けを得る可能性がはるかに高くなります。

## `MeshBasicMaterial` を使用する

`MeshBasicMaterial` はライトを使用しないので、何かが表示されない理由を取り除く1つの方法です。もしオブジェクトが `MeshBasicMaterial` を使用して表示されない場合は、コードの他の部分ではなくマテリアルやライトに問題がある可能性が高い事がわかります。

## カメラの `near` と `far` の設定を確認する

`PerspectiveCamera` には `near` と `far` の設定があり、それは[カメラの記事](threejs-cameras.html) で説明しています。
オブジェクトを含む空間に合わせて設定されている事を確認して下さい。
例えば `near` = 0.001、`far` = 1000000のような大きな値に**一時的に**設定する事もできます。
奥行き解像度の問題が発生する可能性がありますが、少なくともカメラの前にあるオブジェクトを見る事ができるようになります。

## カメラの前にシーンがある事を確認する

時にはカメラの前になく何も出てこない事もあります。カメラを制御できない場合は `OrbitController` のようなカメラコントロールを追加してみて下さい。
あるいは[この記事](threejs-load-obj.html)で紹介されているコードを使ってシーンをフレーミングしてみて下さい。
このコードはシーンの一部のサイズを見つけ、カメラを移動して `near` と `far` の設定を調整し、それが見えるようにします。

## カメラの前に何かを置く

これは全てに失敗した場合は、動作するものから始めてゆっくりと何かを追加していくという方法です。何もない画面が表示された場合は、直接カメラの前に何かを置いてみて下さい。
球体や箱を作り `MeshBasicMaterial`のようなシンプルなマテリアルを与えて、それを画面上に表示できるようにします。
その後、少しずつ追加してテストを開始します。最終的にはバグを再現するか、途中で発見するかのどちらかになります。

---

以上、JavaScriptのデバッグのヒントでした。[GLSLをデバッグするためのいくつかのヒント](threejs-debugging-glsl.html)も見てみましょう。
