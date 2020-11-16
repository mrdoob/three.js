Title: Three.jsのポストプロセス
Description: Three.jsでのポストプロセスのやり方
TOC: ポストプロセス

*ポストプロセス*とは、一般的には2D画像に何らかのエフェクトやフィルターを適用する事です。
Three.jsの場合、たくさんのメッシュが入ったシーンがあり、そのシーンを2D画像にレンダリングします。
通常はその2D画像はキャンバスに直接レンダリングしブラウザに表示されますが、
代わりに[レンダーターゲットにレンダリング](threejs-rendertargets.html)し、キャンバス描画前に*ポストプロセス*エフェクトを適用できます。
メインシーンのレンダリング後に行われるため、ポストプロセスと呼ばれています。

ポストプロセスの例としては、InstagramやPhotoshopのフィルターなどがあります。

Three.jsには、ポストプロセスのパイプラインを設定するサンプルクラスがいくつかあります。
今回は最初に `EffectComposer` を作成し、複数の `Pass` オブジェクトを追加します。
次に `EffectComposer.render` を呼び出し、シーンを [レンダーターゲット](threejs-rendertargets.html)にレンダリングしてそれぞれの `Pass` を適用します。

それぞれの `Pass` には、ビネットの追加、ブラーやブルームの適用、フィルムグレインの適用、色相、彩度、コントラストの調整などのポストプロセスを適用できます。
最後のレンダリングでポストプロセス結果をキャンバスにレンダリングします。

`EffectComposer` 関数がどのようなものか理解するのは少し重要です。
ここでは2つの[レンダーターゲット](threejs-rendertargets.html)を作成します。
これを**rtA**と**rtB**と呼ぶ事にしましょう。

次に `EffectComposer.addPass` を呼び出し、それぞれのPassに適用したい順番で追加します。
Passは*次の図のように*適用されます。

<div class="threejs_center"><img src="resources/images/threejs-postprocessing.svg" style="width: 600px"></div>

`RenderPass`に渡されたシーンは、まず**rtA**にレンダリングされ**rtA**は次のPassに渡されます。
このPassは**rtA**を入力として使用し、**rtB**に結果を書き込みます。
その後に**rtB**は次のPassに渡され、**rtB**を入力として使用し**rtA**に書き戻します。
これは全てのPassを通ります。

それぞれの `Pass` には4つの基本的なオプションがあります。

## `enabled`

このPassを使用するかどうか

## `needsSwap`

このPass終了後に `rtA` と `rtB` を入れ替えるかどうか

## `clear`

このPassをレンダリングする前にクリアするかどうか

## `renderToScreen`

現在の出力先のレンダーターゲットではなく、キャンバスにレンダリングするかどうか。
通常は `EffectComposer` に追加する最後のPassでtrueに設定する必要があります。

基本的な例をまとめてみましょう。
まずは[レスポンシブデザインの記事](threejs-responsive.html)から例を挙げてみます。

そのためにまず `EffectComposer` を作成します。

```js
const composer = new EffectComposer(renderer);
```

次に最初のPassとして `RenderPass` を追加し、最初のレンダーターゲットにカメラを使ってシーンをレンダリングします。

```js
composer.addPass(new RenderPass(scene, camera));
```

次に `BloomPass` を追加します。
`BloomPass` は一般的には入力を小さなレンダーターゲットにレンダリングし、結果にブラーをかけます。
そして、元の入力の上にブラーされた結果を追加します。
これでシーンに *ブルーム* をかけます。

```js
const bloomPass = new BloomPass(
    1,    // strength
    25,   // kernel size
    4,    // sigma ?
    256,  // blur render target resolution
);
composer.addPass(bloomPass);
```

最終的には、元の入力の上にノイズとスキャンラインを描画する `FilmPass` ができました。

```js
const filmPass = new FilmPass(
    0.35,   // noise intensity
    0.025,  // scanline intensity
    648,    // scanline count
    false,  // grayscale
);
filmPass.renderToScreen = true;
composer.addPass(filmPass);
```

`filmPass` は最後のPassなので、`renderToScreen` プロパティをtrueに設定し、キャンバスにレンダリングするようにします。
この設定がないと次のレンダーターゲットにレンダリングされます。

これらのクラスを使用するには、以下をインポートする必要があります。

```js
import {EffectComposer} from './resources/threejs/r122/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from './resources/threejs/r122/examples/jsm/postprocessing/RenderPass.js';
import {BloomPass} from './resources/threejs/r122/examples/jsm/postprocessing/BloomPass.js';
import {FilmPass} from './resources/threejs/r122/examples/jsm/postprocessing/FilmPass.js';
```

ほとんどのポストプロセスには `EffectComposer.js` と `RenderPass.js` が必須です。

最後に `WebGLRenderer.render` の代わりに `EffectComposer.render` を使用し、`EffectComposer` にキャンバスのサイズを合わせます。

```js
-function render(now) {
-  time *= 0.001;
+let then = 0;
+function render(now) {
+  now *= 0.001;  // convert to seconds
+  const deltaTime = now - then;
+  then = now;

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
+    composer.setSize(canvas.width, canvas.height);
  }

  cubes.forEach((cube, ndx) => {
    const speed = 1 + ndx * .1;
-    const rot = time * speed;
+    const rot = now * speed;
    cube.rotation.x = rot;
    cube.rotation.y = rot;
  });

-  renderer.render(scene, camera);
+  composer.render(deltaTime);

  requestAnimationFrame(render);
}
```

`EffectComposer.render` は `deltaTime` で最後のフレームのレンダリング後からの時間を秒単位で受け取ります。
deltaTimeをアニメーションしてる様々なエフェクトに渡します。
今回は `FilmPass` がアニメーションしています。

{{{example url="../threejs-postprocessing.html" }}}

実行時にエフェクトパラメーターを変更するには、uniformの値を設定する必要があります。
パラメータを調整するためのGUIを追加してみましょう。
どの値を調整できるか把握するには、以下のコードを調べる必要があります。

[`BloomPass.js`](https://github.com/mrdoob/three.js/blob/master/examples/js/postprocessing/BloomPass.js)の中でこの行を見つけました。

```js
this.copyUniforms[ "opacity" ].value = strength;
```

strengthを設定できます。

```js
bloomPass.copyUniforms.opacity.value = someValue;
```

同様に[`FilmPass.js`](https://github.com/mrdoob/three.js/blob/master/examples/js/postprocessing/FilmPass.js)でこの行を見つけました。

```js
if ( grayscale !== undefined )	this.uniforms.grayscale.value = grayscale;
if ( noiseIntensity !== undefined ) this.uniforms.nIntensity.value = noiseIntensity;
if ( scanlinesIntensity !== undefined ) this.uniforms.sIntensity.value = scanlinesIntensity;
if ( scanlinesCount !== undefined ) this.uniforms.sCount.value = scanlinesCount;
```

これでどのように設定するか、かなり明確になりました。

これらの値を設定する簡単なGUIを作ってみましょう。

```js
import {GUI} from '../3rdparty/dat.gui.module.js';
```

そして

```js
const gui = new GUI();
{
  const folder = gui.addFolder('BloomPass');
  folder.add(bloomPass.copyUniforms.opacity, 'value', 0, 2).name('strength');
  folder.open();
}
{
  const folder = gui.addFolder('FilmPass');
  folder.add(filmPass.uniforms.grayscale, 'value').name('grayscale');
  folder.add(filmPass.uniforms.nIntensity, 'value', 0, 1).name('noise intensity');
  folder.add(filmPass.uniforms.sIntensity, 'value', 0, 1).name('scanline intensity');
  folder.add(filmPass.uniforms.sCount, 'value', 0, 1000).name('scanline count');
  folder.open();
}
```

これで設定を調整できるようになりました。

{{{example url="../threejs-postprocessing-gui.html" }}}

これはあなた自身のエフェクトを作る小さな1歩です。

ポストプロセスエフェクトではシェーダーを使用します。
シェーダーは[GLSL (Graphics Library Shading Language)](https://www.khronos.org/files/opengles_shading_language.pdf)と呼ばれる言語で書かれています。
この記事では、GLSL言語全体を解説するのはあまりにも大きなトピックです。
[この記事](https://webglfundamentals.org/webgl/lessons/webgl-shaders-and-glsl.html)と[このシェーダーの本](https://thebookofshaders.com/)を参考にしてみて下さい。

サンプルがあると便利だと思うので、簡単なGLSLのポストプロセスのシェーダーを作ってみましょう。
画像に色を乗算したものを作ります。

Three.jsではポストプロセス用に `ShaderPass` という便利なヘルパーを提供しています。
頂点シェーダー、フラグメントシェーダー、デフォルト入力を定義した情報を持つオブジェクトを取得します。
前のPassの結果を得るためにどのテクスチャから読み込むか、`EffectComposer` のどこにレンダリングするかを設定します。

前のPassの結果に色を乗算するシンプルなポストプロセスシェーダーです。

```js
const colorShader = {
  uniforms: {
    tDiffuse: { value: null },
    color:    { value: new THREE.Color(0x88CCFF) },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform sampler2D tDiffuse;
    uniform vec3 color;
    void main() {
      vec4 previousPassColor = texture2D(tDiffuse, vUv);
      gl_FragColor = vec4(
          previousPassColor.rgb * color,
          previousPassColor.a);
    }
  `,
};
```

上記の `tDiffuse` は `ShaderPass` が前のPassの結果テクスチャを渡す名前です。
`color` を Three.jsの `Color` として宣言します。

次に頂点シェーダーが必要です。
ポストプロセスでは上記コードの頂点シェーダーは標準的なものであり、ほとんど変更する必要はありません。
あまり詳しく説明しませんが（上記のリンク先の記事を参照してください）、
変数 `uv`, `projectionMatrix`, `modelViewMatrix`, `position` は全てThree.jsによって魔法のように追加されています。

最後にフラグメントシェーダーを作成します。この中で前のPassのピクセルカラーを次の行で取得します。

```glsl
vec4 previousPassColor = texture2D(tDiffuse, vUv);
```

これに色を掛けて `gl_FragColor` を設定します。

```glsl
gl_FragColor = vec4(
    previousPassColor.rgb * color,
    previousPassColor.a);
```

3つ色の設定用に簡単なGUIを追加します。

```js
const gui = new GUI();
gui.add(colorPass.uniforms.color.value, 'r', 0, 4).name('red');
gui.add(colorPass.uniforms.color.value, 'g', 0, 4).name('green');
gui.add(colorPass.uniforms.color.value, 'b', 0, 4).name('blue');
```

色で乗算するシンプルなポストプロセスエフェクトができました。

{{{example url="../threejs-postprocessing-custom.html" }}}

GLSLやカスタムシェーダーの詳細は、ネット上にたくさんの記事があります。
WebGL自体がどのように動作するかを知りたいならば、[これらの記事](https://webglfundamentals.org)をチェックしてみて下さい。
もう1つの素晴らしいリソースは、[THREE.jsレポートの既存ポストプロセスシェーダーを読み解く](https://github.com/mrdoob/three.js/tree/master/examples/js/shaders)事です。
複雑なものもいくつかありますが、小さいものから始めるとどのように動作するかのアイデアを得る事ができます。

残念ながらThree.jsレポートにあるほとんどのポストプロセスエフェクトは文書化されていないので、使用するには[この例](https://github.com/mrdoob/three.js/tree/master/examples)か
[エフェクト自体のコード](https://github.com/mrdoob/three.js/tree/master/examples/js/postprocessing)を読んで下さい。
これらのシンプルな例と[レンダーターゲット](threejs-rendertargets.html)の記事がポストプロセスを始めるのに十分な知識を提供してくれると思います。
