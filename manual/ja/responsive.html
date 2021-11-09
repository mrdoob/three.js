Title: Three.jsのレスポンシブデザイン
Description: 異なるディスプレイサイズにThree.jsを適用させる方法
TOC: レスポンシブデザイン

これはthree.jsの2番目の連載記事です。
最初の記事は [Three.jsの基礎知識](threejs-fundamentals.html) でした。
まだ読んでいない場合はそこから始めて下さい。

この記事はthree.jsアプリをどんな状況にもレスポンシブにする方法を説明します。
一般的なレスポンシブ対応のWebページはデスクトップやタブレット、スマートフォンなど異なったディスプレイサイズに対応します。

three.jsの場合、さらに考慮すべき状況があります。例えば3Dエディターで左・右・上・下に何かを制御したい場合です。このドキュメントの真ん中にあるコードが一つの例です。
最後のサンプルコードはCSSでサイズ指定なしのcanvasを使ってます。

```html
<canvas id="c"></canvas>
```

このcanvasのデフォルトサイズは300 x 150です。
Web上ではCSSでサイズ指定する事が推奨されています。
CSSを追加しcanvasをWebページ一杯にしましょう。

```html
<style>
html, body {
   margin: 0;
   height: 100%;
}
#c {
   width: 100%;
   height: 100%;
   display: block;
}
</style>
```

bodyのmarginはデフォルトで5ピクセルのためマージンを0にします。
htmlとbodyの高さは100%にしウィンドウ一杯に設定します。
そうしないとhtmlとbodyはbody内のコンテンツと同じぐらいのサイズにしかなりません。

次にbodyのコンテナーである `id=c` のelementが100%のサイズになるようにします。

最後にそのコンテナーの `display` を `block` に設定します。canvasのdisplayのデフォルトは `inline` です。インライン要素は表示されているものに空白を追加してしまう事があります。このような場合はcanvasを `block` に設定するとこの問題は解消されます。

その結果がこちらにあります。

{{{example url="../threejs-responsive-no-resize.html" }}}

canvasがページを埋め尽くすようになりましたが、2つ問題があります。
1つはキューブが伸びています。キューブは立方体でなく箱のようなものです。高すぎて広がりすぎています。サンプルを開いてブラウザのウィンドウサイズをリサイズすると、キューブが伸びていて高すぎるのがわかります。

<img src="resources/images/resize-incorrect-aspect.png" width="407" class="threejs_center nobg">

2つ目の問題は解像度が低い、または濃淡にムラがありぼやけて見える事です。ウィンドウを大きく引き伸ばすとこの問題がわかります。

<img src="resources/images/resize-low-res.png" class="threejs_center nobg">

まず引き伸びている問題を解決しましょう。そのためにはカメラのアスペクトをcanvasの表示サイズのアスペクトに設定する必要があります。canvasの `clientWidth` と `clientHeight` を参照する事で設定を行う事ができます。

レンダーのループ処理を次のように更新します。

```js
function render(time) {
  time *= 0.001;

+  const canvas = renderer.domElement;
+  camera.aspect = canvas.clientWidth / canvas.clientHeight;
+  camera.updateProjectionMatrix();

  ...
```

これでキューブが歪むのを止められます。

{{{example url="../threejs-responsive-update-camera.html" }}}

サンプルを別ウィンドウで開きウィンドウのサイズを変更すると、キューブが縦にも横にも伸びていない事がわかるはずです。ウィンドウの大きさに関係なく、正しいアスペクトを保っています。

<img src="resources/images/resize-correct-aspect.png" width="407" class="threejs_center nobg">

次はブロックノイズを修正していきましょう。

キャンバス要素には2つのサイズがあります。1つ目のサイズは、キャンバスがページに表示されるサイズです。それはCSSで設定しています。2つ目のサイズはキャンバス自体のピクセル数です。これは画像と何ら変わりありません。
例えば、128 x 64ピクセルの画像を持っていて、CSSを使って400 x 200ピクセルで表示する事ができるかもしれません。

```html
<img src="some128x64image.jpg" style="width:400px; height:200px">
```

キャンバス内部のサイズ、その解像度は描画バッファサイズと呼ばれます。
three.jsでは `renderer.setSize` を呼び出す事でキャンバスの描画バッファサイズを設定する事ができます。
どのサイズを選ぶべきでしょうか？一番わかりやすい答えは"キャンバスが表示されているサイズと同じ"です。
もう一度キャンバスの `clientWidth` と `clientHeight` を見てみましょう。

レンダラーのキャンバスが表示されているサイズになっていないかどうかを確認し、表示されている場合はサイズを設定する関数を書いてみましょう。

```js
function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}
```

キャンバスのサイズを変更する必要があるかどうかをチェックしています。キャンバスのサイズを変更する事は、キャンバスの仕様の興味深い部分であり、すでに必要なサイズになっている場合は同じサイズを設定しない方が良いでしょう。

サイズを変更する必要があるかどうかわかったら、次に `renderer.setSize` を呼び出して新しい幅と高さを渡します。最後に `false` を渡す事が重要です。

デフォルトでは `render.setSize` はキャンバスのCSSサイズを設定しますが、これは私たちが望んでいるものではありません。ブラウザは他の全ての要素に対して、CSSを使用して要素の表示サイズを決定するという方法で動作し続けてほしいのです。3つの要素で使用されるキャンバスが他の要素と異なるのは避けたいのです。

この関数はキャンバスのサイズが変更された場合、trueを返す事に注意して下さい。この関数を使って他にも更新すべき事があるかどうかをチェックする事ができます。この関数を使ってレンダーのループ処理を修正してみましょう。

```js
function render(time) {
  time *= 0.001;

+  if (resizeRendererToDisplaySize(renderer)) {
+    const canvas = renderer.domElement;
+    camera.aspect = canvas.clientWidth / canvas.clientHeight;
+    camera.updateProjectionMatrix();
+  }

  ...
```

キャンバスの表示サイズが変更されて `resizeRendererToDisplaySize` が `true` を返した場合のみ、カメラのアスペクトを設定します。

{{{example url="../threejs-responsive.html" }}}

これでキャンバスの表示サイズに合った解像度でレンダリングされるようになりました。

CSSにリサイズ処理を任せた場合のポイントを明確にするために、このコードを [分離した `.js` ファイル](../threejs-responsive.js) に入れてみましょう。
ここではCSSがサイズを選択するいくつかのサンプルがあります。
それらが動作するようにゼロからコードを変更しなければならなかった事に気づくでしょう。

文章の段落の真ん中にキューブを置いてみましょう。

{{{example url="../threejs-responsive-paragraph.html" startPane="html" }}}

エディタスタイルのレイアウトで右側のコントロールエリアのサイズを変更できるようにしたのと同じコードです。

{{{example url="../threejs-responsive-editor.html" startPane="html" }}}

注目すべき重要な部分はコードが変更されていない事です。HTMLとCSSだけが変更されました。

## HD-DPIディスプレイの取り扱い

HD-DPIとは高解像度ディスプレイの略です。
最近ではほとんどのスマートフォンと同じくらい、Macや多くのWindowsマシンで採用されています。

ブラウザでの動作方法は、CSSを使用してディスプレイの高解像度に関係なく同じサイズを設定する事です。ブラウザはテキストをさらに詳細にレンダリングしますが、物理的なサイズは同じです。

three.jsでHD-DPIを扱う方法は色々あります。

1つ目の方法は特に何もしない事です。これは間違いなく最も一般的な方法です。3DグラフィックのレンダリングにはたくさんのGPUの処理パワーが必要です。モバイルのGPUは少なくとも2018年時点ではデスクトップよりも電力が少ないが、それでも携帯電話は非常に高解像度のディスプレイを搭載している事が多いです。現在の上位機種はHD-DPI比が3倍という事は、非HD-DPIディスプレイの1ピクセルごとに9ピクセルを持っている事を意味します。つまり、9倍のレンダリングをしなければならないという事です。

9倍のピクセルを計算するのは大変な作業なので、コードをそのままにしておくと1倍のピクセルを計算して、ブラウザは3倍のサイズ(3x x 3x = 9xピクセル)で描画します。

重いthree.jsアプリの場合はこれが必要でしょう。そうしないとフレームレートが遅くなる可能性があります。

デバイスの解像度でレンダリングしたい場合、three.jsにはいくつかのデバイスを変更する方法があります。

1つは `renderer.setPixelRatio` でthree.jsに解像度の乗数を伝える事です。
CSSピクセルからデバイスピクセルへの乗数をブラウザに伝え、それをthree.jsに渡します。

     renderer.setPixelRatio(window.devicePixelRatio);

`renderer.setSize` を呼び出し後、要求されたサイズに渡されたピクセル比を乗算したものが使用されます。**これは強く非推奨です**。以下を参照して下さい。

もう1つの方法は、キャンバスのサイズを変更する時に自分で設定する事です。

```js
    function resizeRendererToDisplaySize(renderer) {
      const canvas = renderer.domElement;
      const pixelRatio = window.devicePixelRatio;
      const width  = canvas.clientWidth  * pixelRatio | 0;
      const height = canvas.clientHeight * pixelRatio | 0;
      const needResize = canvas.width !== width || canvas.height !== height;
      if (needResize) {
        renderer.setSize(width, height, false);
      }
      return needResize;
    }
```

この2つ目の方法の方が客観的には優れています。なぜかと言うと私が求めるものを手に入れる事ができるからです。

three.jsを使っていると実際のキャンバスの描画バッファのサイズを指定します。例えば、後処理フィルタを作成する場合などです。
または `gl_FragCoord` にアクセスするシェーダを作成している場合、あるいは2Dキャンバスに描画するためのスクリーンショット、またはGPUピッキング用のピクセルを読み込んだ場合などに使用する事ができます。

`setPixelRatio` を使うと要求したサイズよりも実際のサイズが違ってしまう事が多々あります。いつ要求したサイズが使えるか、いつThree.jsの実際のサイズが使えるか推測しなければなりません。
これを自分で行う事で使用されているサイズが要求したサイズである事を常に知る事ができます。
裏で魔法がかかっているという特殊ケースではありません。

上のコードを使った例です。

{{{example url="../threejs-responsive-hd-dpi.html" }}}

違いがわかりにくいかもしれませんが、HD-DPIディスプレイをお持ちの方はこのサンプルを上のサンプルと比較してみて下さい。エッジがより鮮明になっている事がわかると思います。

基礎な内容ですがこの記事ではとても基本的な所を取り上げました。次は[three.jsが提供する基本的なプリミティブについて簡単に説明します。](threejs-primitives.html)
