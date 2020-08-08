Title: Three.jsでレスポンシブデザイン
Description: 異なるディスプレイサイズにThree.jsを適用させる方法
TOC: Responsive Design

これはthree.jsシリーズの2番目の記事です。
最初の記事は [Three.jsの基礎](threejs-fundamentals.html) でした。
まだ読んでいない場合はそこから始めて下さい。

この記事はthree.jsアプリでどんな状況でもレスポンシブにする方法について説明します。
一般的にはWebページのレスポンシブ対応はデスクトップやタブレット、電話など様々な異なったディスプレイサイズに対応します。

three.jsの場合、さらに考慮すべき状況があります。例えば3Dエディターで左・右・上・下に何かを制御したい場合です。このドキュメントの真ん中にあるコードが一つの例です。

最後のサンプルコードはCSSでサイズ指定なしのcanvasを使ってます。

```html
<canvas id="c"></canvas>
```

このcanvasのデフォルトサイズは300x150です。

Web上では、CSSでサイズ指定する事が推奨されています。

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

bodyのmarginは、デフォルトで5ピクセルのためマージンを0にします。
htmlとbodyの高さは100%にし、ウィンドウ一杯に設定します。
そうしないとhtmlとbodyは、body内のコンテンツと同じぐらいのサイズにしかなりません。

次にbodyのコンテナーである `id=c` のelementが100%のサイズになるようにします。

最後にそのコンテナーの `display` を `block` に設定します。canvasのdisplayのデフォルトは `inline` です。インライン要素は表示されているものに空白を追加してしまう事があります。このような場合はcanvasを `block` に設定すると、この問題は解消されます。

その結果がこちらにあります。

{{{example url="../threejs-responsive-no-resize.html" }}}

canvasがページを埋め尽くすようになりましたが、2つ問題があります。
1つはキューブが伸びています。キューブは立方体でなく箱のようなものです。高すぎて広がりすぎています。サンプルを開いてブラウザのウィンドウサイズをリサイズします。キューブが伸びていて高すぎるのがわかります。

<img src="resources/images/resize-incorrect-aspect.png" width="407" class="threejs_center nobg">

2つ目の問題は解像度が低い、または濃淡にムラがありぼやけて見える事です。ウィンドウを大きく引き伸ばすとこの問題がわかります。

<img src="resources/images/resize-low-res.png" class="threejs_center nobg">

まず引き伸びている問題を解決しましょう。そのためには、カメラのアスペクトをcanvasの表示サイズのアスペクトに設定する必要があります。canvasの `clientWidth` と `clientHeight` を参照する事で設定を行う事ができます。

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
例えば、128x64ピクセルの画像を持っていて、CSSを使って400x200ピクセルで表示する事ができるかもしれません。

```html
<img src="some128x64image.jpg" style="width:400px; height:200px">
```

キャンバス内部のサイズ、その解像度は描画バッファサイズと呼ばれます。
three.jsでは `renderer.setSize` を呼び出す事でキャンバスの描画バッファサイズを設定する事ができます。
どのサイズを選ぶべきでしょうか？一番わかりやすい答えは"キャンバスが表示されているサイズと同じ"です。
もう一度、キャンバスの `clientWidth` と `clientHeight` を見てみましょう。

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

Since the aspect is only going to change if the canvas's display size
changed we only set the camera's aspect if `resizeRendererToDisplaySize`
returns `true`.

{{{example url="../threejs-responsive.html" }}}

It should now render with a resolution that matches the display
size of the canvas.

To make the point about letting CSS handle the resizing let's take
our code and put it in a [separate `.js` file](../threejs-responsive.js).
Here then are a few more examples where we let CSS choose the size and notice we had
to change zero code for them to work.

Let's put our cubes in the middle of a paragraph of text.

{{{example url="../threejs-responsive-paragraph.html" startPane="html" }}}

and here's our same code used in an editor style layout
where the control area on the right can be resized.

{{{example url="../threejs-responsive-editor.html" startPane="html" }}}

The important part to notice is no code changed. Only our HTML and CSS
changed.

## Handling HD-DPI displays

HD-DPI stands for high-density dot per inch displays.
That's most Macs nowadays and many Windows machines
as well as pretty much all smartphones.

The way this works in the browser is they use
CSS pixels to set the sizes which are supposed to be the same
regardless of how high res the display is. The browser
will just render text with more detail but the
same physical size.

There are various ways to handle HD-DPI with three.js.

The first one is just not to do anything special. This
is arguably the most common. Rendering 3D graphics
takes a lot of GPU processing power. Mobile GPUs have
less power than desktops, at least as of 2018, and yet
mobile phones often have very high resolution displays.
The current top of the line phones have an HD-DPI ratio
of 3x meaning for every one pixel from a non-HD-DPI display
those phones have 9 pixels. That means they have to do 9x
the rendering.

Computing 9x the pixels is a lot of work so if we just
leave the code as it is we'll compute 1x the pixels and the
browser will just draw it at 3x the size (3x by 3x = 9x pixels).

For any heavy three.js app that's probably what you want
otherwise you're likely to get a slow framerate.

That said if you actually do want to render at the resolution
of the device there are a couple of ways to do this in three.js.

One is to tell three.js a resolution multiplier using `renderer.setPixelRatio`.
You ask the browser what the multiplier is from CSS pixels to device pixels
and pass that to three.js

     renderer.setPixelRatio(window.devicePixelRatio);

After that any calls to `renderer.setSize` will magically
use the size you request multiplied by whatever pixel ratio
you passed in. **This is strongly NOT RECOMMENDED**. See below

The other way is to do it yourself when you resize the canvas.

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

This second way is objectively better. Why? Because it means I get what I ask for.
There are many cases when using three.js where we need to know the actual
size of the canvas's drawingBuffer. For example when making a post processing filter,
or if we are making a shader that accesses `gl_FragCoord`, if we are making
a screenshot, or reading pixels for GPU picking, for drawing into a 2D canvas,
etc... There many many cases where if we use `setPixelRatio` then our actual size will be different
than the size we requested and we'll have to guess when to use the size
we asked for and when to use the size three.js is actually using.
By doing it ourselves we always know the size being used is the size we requested.
There is no special case where magic is happening behind the scenes.

Here's an example using the code above.

{{{example url="../threejs-responsive-hd-dpi.html" }}}

It might be hard to see the difference but if you have an HD-DPI
display and you compare this sample to those above you should
notice the edges are more crisp.

This article covered a very basic but fundamental topic. Next up lets quickly
[go over the basic primitives that three.js provides](threejs-primitives.html).

