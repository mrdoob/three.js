Title: Three.jsのTips
Description: three.jsで躓くかもしれない小さな問題
TOC: #

この記事では個別の記事を持つには小さすぎるため、three.jsで遭遇するかもしれないいくつかの小さな問題をまとめています。

---

<a id="screenshot" data-toc="スクリーンショットを撮る"></a>

# キャンバスのスクリーンショットを撮る

ブラウザではスクリーンショットを撮れる機能が2つあります。
古いやり方は [`canvas.toDataURL`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL)、新しいやり方は [`canvas.toBlob`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob) です。

以下のようなコードを追加するだけで簡単にスクリーンショットを撮れると思うはずです。

```html
<canvas id="c"></canvas>
+<button id="screenshot" type="button">Save...</button>
```

```js
const elem = document.querySelector('#screenshot');
elem.addEventListener('click', () => {
  canvas.toBlob((blob) => {
    saveBlob(blob, `screencapture-${canvas.width}x${canvas.height}.png`);
  });
});

const saveBlob = (function() {
  const a = document.createElement('a');
  document.body.appendChild(a);
  a.style.display = 'none';
  return function saveData(blob, fileName) {
     const url = window.URL.createObjectURL(blob);
     a.href = url;
     a.download = fileName;
     a.click();
  };
}());
```

以下は[レスポンシブデザインの記事](threejs-responsive.html)の例で、上記のコードにボタンを配置するためのCSSを追加したものです。

{{{example url="../threejs-tips-screenshot-bad.html"}}}

試してみるとこのようなスクリーンショットが出てきました。

<div class="threejs_center"><img src="resources/images/screencapture-413x313.png"></div>

はい、ただの黒い画像です。

お使いのブラウザやOSによっては上手く撮れる事もありますが、一般的には上手く撮れない可能性が高いです。

この問題はパフォーマンスと互換性の理由から、デフォルトではブラウザがWebGLキャンバスに描画後に描画バッファをクリアしてしまいます。

解決策としてはキャプチャの直前にレンダリングのコードを呼び出す事です。

このコードはいくつか調整する必要があります。最初にレンダリングのコードを分離してみましょう。

```js
+const state = {
+  time: 0,
+};

-function render(time) {
-  time *= 0.001;
+function render() {
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  cubes.forEach((cube, ndx) => {
    const speed = 1 + ndx * .1;
-    const rot = time * speed;
+    const rot = state.time * speed;
    cube.rotation.x = rot;
    cube.rotation.y = rot;
  });

  renderer.render(scene, camera);

-  requestAnimationFrame(render);
}

+function animate(time) {
+  state.time = time * 0.001;
+
+  render();
+
+  requestAnimationFrame(animate);
+}
+requestAnimationFrame(animate);
```

`render` は実際にレンダリングする事だけに関係しており、キャンバスをキャプチャする直前に呼び出す事ができます。

```js
const elem = document.querySelector('#screenshot');
elem.addEventListener('click', () => {
+  render();
  canvas.toBlob((blob) => {
    saveBlob(blob, `screencapture-${canvas.width}x${canvas.height}.png`);
  });
});
```

そして上手く機能するはずです。

{{{example url="../threejs-tips-screenshot-good.html" }}}

別の解決策については次の項目を参照して下さい。

---

<a id="preservedrawingbuffer" data-toc="キャンバスがクリアされるのを防ぐ"></a>

# キャンバスのクリアを防ぐ

アニメーションオブジェクトを使って、ユーザーにお絵かきさせたいとしましょう。
`WebGLRenderer` 作成時に `preserveDrawingBuffer: true` を渡す必要があります。
これによりブラウザがキャンバスをクリアできなくなります。また、three.jsでもキャンバスをクリアしないようにする必要があります。

```js
const canvas = document.querySelector('#c');
-const renderer = new THREE.WebGLRenderer({canvas});
+const renderer = new THREE.WebGLRenderer({
+  canvas,
+  preserveDrawingBuffer: true,
+  alpha: true,
+});
+renderer.autoClearColor = false;
```

{{{example url="../threejs-tips-preservedrawingbuffer.html" }}}

もしお絵かきプログラムを作ろうとしているのであれば、解像度を変更するとブラウザはキャンバスをクリアしてしまうのでこれは解決策にはなりません。
ディスプレイのサイズに応じて解像度を変えています。ウィンドウのサイズが変わると表示サイズも変わります。
これにはユーザーが別のタブでファイルをダウンロードし、ブラウザがステータスバーを追加した場合も含まれます。
また、ユーザーがスマートフォンを回転しブラウザが縦から横に切り替わった時も含まれます。

お絵かきプログラムを作りたいのであれば、[レンダーターゲットを使用してテクスチャにレンダリング](threejs-rendertargets.html)して下さい。

---

<a id="tabindex" data-toc="キャンバスからキーボード入力を取得する"></a>

# キーボード入力を取得する

このチュートリアルではイベントリスナーを `canvas` にアタッチする事がよくあります。
多くのイベントが動作しますが、デフォルトでは動作しないキーボードイベントもあります。

例えばキーボードイベントを取得するには、キャンバスの[`tabindex`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/tabIndex)を0以上にします。

```html
<canvas tabindex="0"></canvas>
```

しかし、これは新たな問題を引き起こします。`tabindex` が設定されているものはフォーカスがある時にハイライトされます。
これを修正するにはCSSの擬似クラスであるfocusでoutlineをnoneにします。

```css
canvas:focus {
  outline:none;
}
```

ここに3つのキャンバスがあります。

```html
<canvas id="c1"></canvas>
<canvas id="c2" tabindex="0"></canvas>
<canvas id="c3" tabindex="1"></canvas>
```

最後のキャンバスだけCSSを追加します。

```css
#c3:focus {
    outline: none;
}
```

全てのイベントリスナーに同じイベントリスナーをアタッチしてみましょう。

```js
document.querySelectorAll('canvas').forEach((canvas) => {
  const ctx = canvas.getContext('2d');

  function draw(str) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(str, canvas.width / 2, canvas.height / 2);
  }
  draw(canvas.id);

  canvas.addEventListener('focus', () => {
    draw('has focus press a key');
  });

  canvas.addEventListener('blur', () => {
    draw('lost focus');
  });

  canvas.addEventListener('keydown', (e) => {
    draw(`keyCode: ${e.keyCode}`);
  });
});
```

1つ目のキャンバスがキーボード入力を受け付けない事に注意して下さい。
2つ目はキーボード入力をうけつけますがハイライトされます。
3つ目は両方の問題を解決しています。

{{{example url="../threejs-tips-tabindex.html"}}}

---

<a id="transparent-canvas" data-toc="キャンバスを透明にする"></a>
 
# キャンバスを透明にする

デフォルトではthree.jsはキャンバスを不透明にします。
キャンバスを透明にしたい場合は `WebGLRenderer` 作成時に[`alpha:true`](WebGLRenderer.alpha)を指定します。

```js
const canvas = document.querySelector('#c');
-const renderer = new THREE.WebGLRenderer({canvas});
+const renderer = new THREE.WebGLRenderer({
+  canvas,
+  alpha: true,
+});
```

また、プリマルチプライドアルファを**使用しない**事を指定したいでしょう。

```js
const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
+  premultipliedAlpha: false,
});
```

Three.jsのデフォルトではキャンバスは[`premultipliedAlpha: true`](WebGLRenderer.premultipliedAlpha)で出力されますが、マテリアルは[`premultipliedAlpha: false`](Material.premultipliedAlpha)で出力されます。

プリマルチプライドアルファを利用するタイミングの理解を深めたいのであれば、この[良い記事](https://developer.nvidia.com/content/alpha-blending-pre-or-not-pre)を参照して下さい。

いずれにしても透明なキャンバスを使った簡単な例で設定してみましょう。

[レスポンシブデザインの記事](threejs-responsive.html)の例に上記の設定を適用してみました。
マテリアルも透明感のあるものにしてみました。

```js
function makeInstance(geometry, color, x) {
-  const material = new THREE.MeshPhongMaterial({color});
+  const material = new THREE.MeshPhongMaterial({
+    color,
+    opacity: 0.5,
+  });

...

```

次にHTMLを追加してみましょう。

```html
<body>
  <canvas id="c"></canvas>
+  <div id="content">
+    <div>
+      <h1>Cubes-R-Us!</h1>
+      <p>We make the best cubes!</p>
+    </div>
+  </div>
</body>
```

CSSで文字テキストをキャンバスの前に配置します。

```css
body {
    margin: 0;
}
#c {
    width: 100%;
    height: 100%;
    display: block;
+    position: fixed;
+    left: 0;
+    top: 0;
+    z-index: 2;
+    pointer-events: none;
}
+#content {
+  font-size: 7vw;
+  font-family: sans-serif;
+  text-align: center;
+  width: 100%;
+  height: 100%;
+  display: flex;
+  justify-content: center;
+  align-items: center;
+}
```

`pointer-events: none` はマウスやタッチイベントをキャンバスから見えなくするので、その下のテキストを選択できる事に注意して下さい。

{{{example url="../threejs-tips-transparent-canvas.html" }}}

---

<a id="html-background" data-toc="HTMLの背景にthree.jsを使う"></a>

# 背景をthree.jsでアニメーションする

よくある質問として、three.jsのアニメーションをWebページの背景にするにはどうしたら良いかという事です。

明確な2つの方法があります。

* 以下のようにCSSでキャンバスの `position` を `fixed` にします。

```css
#c {
 position: fixed;
 left: 0;
 top: 0;
 ...
}
```

先ほどの例でこの正解コードを見る事ができます。`z-index` を-1にするだけでキューブがテキストの後ろに表示されます。

この解決策の小さな欠点はJavaScriptをウェブページと統合する必要があります。
複雑なウェブページの場合、three.jsの描画部分がページの他の要素と競合しないようにする必要があります。

* `iframe` を使用する

この解決策は[このサイトのトップページ](/)で使用してます。

ウェブページへiframeを挿入したとします。例えば

```html
<iframe id="background" src="threejs-responsive.html">
<div>
  Your content goes here.
</div>
```

これは基本的には上記でキャンバスに使用したのと同じコードですが、iframeにはデフォルトでborderがあるので `border` を `none` にする必要があります。

```
#background {
    position: fixed;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    z-index: -1;
    border: none;
    pointer-events: none;
}
```

{{{example url="../threejs-tips-html-background.html"}}}