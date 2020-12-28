Title: Three.jsとShadertoy
Description: Three.jsでShadertoyシェーダーを使う方法
TOC: Shadertoyのシェーダーを使う

[Shadertoy](https://shadertoy.com)は凄いシェーダーの実験場で有名なサイトです。よく聞かれるのがThree.jsでShadertoyのシェーダーを使う方法です。

シェーダーの**おもちゃ**と呼ばれている理由を認識する事が大切です。
一般的にshadertoyのシェーダーはベストプラクティスではありません。
むしろ、[dwitter](https://dwitter.net) (140文字でコードを書く)や[js13kGames](https://js13kgames.com) (13k以下でゲームを作る)のような楽しいチャレンジです。

Shadertoyの場合のパズルは、*ピクセルに何か面白いものを描画する関数を書く事です*。
それは楽しいチャレンジで、多くの投稿は凄いシェーダーです。
しかし、それはベストプラクティスではありません。

[街全体を描く凄いshadertoyシェーダー](https://www.shadertoy.com/view/XtsSWs)で比較してみましょう。

<div class="threejs_center"><img src="resources/images/shadertoy-skyline.png"></div>

上記のシェーダーは私のPCではフルスクリーンだと1秒間に約5フレームで動作します。
[Citiesのようなゲーム: スカイライン](https://store.steampowered.com/app/255710/Cities_Skylines/)とは対照的です。

<div class="threejs_center"><img src="resources/images/cities-skylines.jpg" style="width: 600px;"></div>

このゲームはテクスチャと三角形の建物を描画する伝統的な技術を使用しており、同じマシンで1秒間に30～60フレーム動作します。

それでもthree.jsでShadertoyのシェーダーを使ってみましょう。

以下は2019年1月現在で[shadertoy.comで"New"を選ぶ](https://www.shadertoy.com/new)した時のデフォルトのshadertoyシェーダーです。

```glsl
// By iq: https://www.shadertoy.com/user/iq  
// license: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;

    // Time varying pixel color
    vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));

    // Output to screen
    fragColor = vec4(col,1.0);
}
```

シェーダーを理解する上で重要な事の1つは、特殊な型を含む3D数学用に設計されたGLSL (Graphics Library Shading Language)と呼ばれる言語で書かれている事です。
上記コードでは `vec4`、`vec2`、`vec3` のような特殊な型があります。
`vec2` は2つの値を持ち `vec3` は3つ、`vec4` は4つの値を持ちます。
たくさんの方法で引数を指定できます。
例えば以下のように `x`、`y`、`z`、`w` を使うのが最も一般的です。

```glsl
vec4 v1 = vec4(1.0, 2.0, 3.0, 4.0);
float v2 = v1.x + v1.y;  // adds 1.0 + 2.0
```

JavaScriptとは異なり、GLSLはC/C++のように変数の型を宣言しなければなりません。
`var v = 1.2;` ではなく `float v = 1.2;` となり `v` は浮動小数点数です。

GLSLを詳しく解説するとこの記事で紹介している以上の事ができます。
GLSLの簡単な概要は[この記事](https://webglfundamentals.org/webgl/lessons/webgl-shaders-and-glsl.html)を参照して下さい。
[The Book of Shaders](https://thebookofshaders.com/)の連載記事の後に続くかもしれません。

2019年1月現在では[shadertoy.com](https://shadertoy.com)は *フラグメントシェーダー* のみ使えます。
フラグメントシェーダーの役割は、ピクセルの位置が与えられた時にそのピクセルの色を出力します。

上記の関数ではシェーダーに `fragColor` という `out` パラメーターがあります。
`out` は `output` の略です。
outは関数が値を提供する事を意味するパラメーターです。
これを何か他の色に設定します。

また、`in` (入力用) パラメーターとして `fragCoord` があります。
これは描画しようとしているピクセル座標です。座標によって色を決めます。
描画先のキャンバスが400 x 300ピクセルの場合、この関数は400 x 300回つまり12万回呼ばれます。
毎回 `fragCoord` は別のピクセル座標になります。

コードに未定義の変数が2つ使用されています。
1つは `iResolution` です。これはキャンバスの解像度です。
キャンバスが400 x 300の場合、`iResolution` は400, 300になります。
ピクセル座標が変化すると `uv` はテクスチャ全体で0.0 〜 1.0の間で変化します。
*正規化された*値を使い動作させると物事が単純になる事が多く、shadertoyのシェーダーの大部分は正規化したものから始まります。

コードに定義されていないもう1つの変数は `iTime` です。
これはページが読み込まれてからの時間を秒単位で表します。

シェーダの専門用語では、これらのグローバル変数は *ユニフォーム（uniform）* 変数と呼ばれています。
この変数は変更されないため *ユニフォーム* と呼ばれ、シェーダーの1回のイテレーションから次のイテレーションまで同じ状態を保ちます。
ここで注意したいのはそれらは全てshadertoy特有のものです。
これらは *オフィシャルな* GLSL変数ではありません。
それらはshadertoy側で作った変数です。

[Shadertoyのドキュメントを見ると、さらにいくつか特有の定義があります](https://www.shadertoy.com/howto)。
とりあえず、上記のシェーダーで使われている2つを処理するコードを書いてみましょう。

まずはキャンバスを塗りつぶす1枚の平面を作ってみましょう。
まだ読んでいない方は[背景とスカイボックスの記事](threejs-backgrounds.html)でこのようにしましたので、その例を参考に立方体を削除してみましょう。
かなり短いコードなので全体を紹介します。

```js
function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas});
  renderer.autoClearColor = false;

  const camera = new THREE.OrthographicCamera(
    -1, // left
     1, // right
     1, // top
    -1, // bottom
    -1, // near,
     1, // far
  );
  const scene = new THREE.Scene();
  const plane = new THREE.PlaneBufferGeometry(2, 2);
  const material = new THREE.MeshBasicMaterial({
      color: 'red',
  });
  scene.add(new THREE.Mesh(plane, material));

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

  function render() {
    resizeRendererToDisplaySize(renderer);

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
```

[背景とスカイボックスの記事で説明したように](threejs-backgrounds.html)、これらのパラメーターを持つ `OrthographicCamera` と2の長さの平面がキャンバスを塗り潰します。
平面は赤の `MeshBasicMaterial` を使用しているため、赤いキャンバスが表示されます。

{{{example url="../threejs-shadertoy-prep.html" }}}

これで動作するようになったので、shadertoyシェーダーを追加してみましょう。

```js
const fragmentShader = `
#include <common>

uniform vec3 iResolution;
uniform float iTime;

// By iq: https://www.shadertoy.com/user/iq  
// license: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;

    // Time varying pixel color
    vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));

    // Output to screen
    fragColor = vec4(col,1.0);
}

void main() {
  mainImage(gl_FragColor, gl_FragCoord.xy);
}
`;
```

上記では2つのユニフォーム変数を宣言しました。
そして、shadertoyからGLSLのシェーダーコードを追加しました。
最後に `mainImage` を呼び出し、`gl_FragColor` と `gl_FragCoord.xy` を渡します。
`gl_FragColor` はオフィシャルのグローバル変数でシェーダーが現在のピクセルに設定する色を指定します。
`gl_FragCoord` は現在の色を選択しているピクセルの座標を教えてくれる、もう1つのオフィシャルなグローバル変数です。

次にシェーダーに値を設定できるようにThree.jsのユニフォームを設定します。

```js
const uniforms = {
  iTime: { value: 0 },
  iResolution:  { value: new THREE.Vector3() },
};
```

Three.jsの各ユニフォームには `value` パラメータがあります。
この値はユニフォームの型と一致してなければなりません。

フラグメントシェーダーとユニフォームの両方を `ShaderMaterial` に渡します。

```js
-const material = new THREE.MeshBasicMaterial({
-    color: 'red',
-});
+const material = new THREE.ShaderMaterial({
+  fragmentShader,
+  uniforms,
+});
```

レンダリングする前にユニフォームの値を設定します。

```js
-function render() {
+function render(time) {
+  time *= 0.001;  // convert to seconds

  resizeRendererToDisplaySize(renderer);

+  const canvas = renderer.domElement;
+  uniforms.iResolution.value.set(canvas.width, canvas.height, 1);
+  uniforms.iTime.value = time;

  renderer.render(scene, camera);

  requestAnimationFrame(render);
}
```

> 注意点： なぜ `iResolution` が `vec3` なのか、 3番目の値に何が入っているのか 
> [shadertoy.comには文書化されてない](https://www.shadertoy.com/howto) のでさっぱりわかりません。
> 上記では使わないのでとりあえず1にしておきます。 ¯\\\_(ツ)\_/¯

{{{example url="../threejs-shadertoy-basic.html" }}}

これは[新しいシェーダーでShadertoyで見たものと一致します](https://www.shadertoy.com/new)。
少なくとも2019年1月の時点では😉。上記のシェーダーは何をしているのでしょうか？

* `uv` は0 〜 1です。
* `cos(uv.xyx)` は3つのコサイン値を `vec3` としてます。
* 3つとは `uv.x`、`uv.y`、`uv.z` です。
* 時間を加えて、`cos(iTime+uv.xyx)` でアニメーションさせます。
* `cos(iTime+uv.xyx+vec3(0,2,4))` のように `vec3(0,2,4)` を加えると、コサイン波の `cos` が-1 〜 1にオフセットされます。
* そのため `0.5 * 0.5 + cos(....)` は -1 <-> 1 〜 0.0 <-> 1.0 に変換され、その結果が現在のピクセルのRGB色として利用されます。

わずかな変更でコサイン波が見やすくなります。
`uv` は0 〜 1までの間だけです。
コサインは2πで繰り返すので、0 〜 40.0を掛けて40にしてみましょう。
これで6.3回くらいリピートするはずです。

```glsl
-vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));
+vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx*40.0+vec3(0,2,4));
```

以下を数えてみると6.3回くらいリピートしています。
`+vec3(0,2,4)` で4だけオフセットされているので赤の間に青が見えます。
それがないと青と赤が完全に重なり、紫になってしまいます。

{{{example url="../threejs-shadertoy-basic-x40.html" }}}

シンプルな入力でshadertoyにある
[a city canal](https://www.shadertoy.com/view/MdXGW2)や
[a forest](https://www.shadertoy.com/view/4ttSWf)、
[a snail](https://www.shadertoy.com/view/ld3Gz2)や
[a mushroom](https://www.shadertoy.com/view/4tBXR1)
をより印象的なものにして見る事ができます。
上手くいけば三角形からシーンを作る伝統的な方法と比較して、一般的に正しいアプローチではない理由も明確になるでしょう。
全てのピクセルの色を計算するために多くの計算をしなければならないので、これらの例は非常に遅く実行されます。

いくつかのshadertoyシェーダーは、[これ](https://www.shadertoy.com/view/MsXSzM)のようにテクスチャを入力として受け取るものがあります。

```glsl
// By Daedelus: https://www.shadertoy.com/user/Daedelus
// license: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
#define TIMESCALE 0.25 
#define TILES 8
#define COLOR 0.7, 1.6, 2.8

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 uv = fragCoord.xy / iResolution.xy;
	uv.x *= iResolution.x / iResolution.y;
	
	vec4 noise = texture2D(iChannel0, floor(uv * float(TILES)) / float(TILES));
	float p = 1.0 - mod(noise.r + noise.g + noise.b + iTime * float(TIMESCALE), 1.0);
	p = min(max(p * 3.0 - 1.8, 0.1), 2.0);
	
	vec2 r = mod(uv * float(TILES), 1.0);
	r = vec2(pow(r.x - 0.5, 2.0), pow(r.y - 0.5, 2.0));
	p *= 1.0 - pow(min(1.0, 12.0 * dot(r, r)), 2.0);
	
	fragColor = vec4(COLOR, 1.0) * p;
}
```

シェーダーにテクスチャを渡すのは[通常のマテリアルにテクスチャを渡す](threejs-textures.html)のと似ていますが、ユニフォームにテクスチャを設定する必要があります。

まず、シェーダーにテクスチャのユニフォームを追加します。
GLSLでは `sampler2D` と呼ばれています。

```js
const fragmentShader = `
#include <common>

uniform vec3 iResolution;
uniform float iTime;
+uniform sampler2D iChannel0;

...
```

ここで取り上げた[これ](threejs-textures.html)のようなテクスチャをロードし、ユニフォームの値を設定します。

```js
+const loader = new THREE.TextureLoader();
+const texture = loader.load('resources/images/bayer.png');
+texture.minFilter = THREE.NearestFilter;
+texture.magFilter = THREE.NearestFilter;
+texture.wrapS = THREE.RepeatWrapping;
+texture.wrapT = THREE.RepeatWrapping;
const uniforms = {
  iTime: { value: 0 },
  iResolution:  { value: new THREE.Vector3() },
+  iChannel0: { value: texture },
};
```

{{{example url="../threejs-shadertoy-bleepy-blocks.html" }}}

これまでは[Shadertoy.com](https://shadertoy.com)で使われているShadertoyシェーダーをそのまま使っていましたが、キャンバスを塗りつぶすように描画しています。
しかし、そのユースケースだけに限定する必要はありません。
覚えておくべき重要な事は、shadertoy上で書かれている関数は `fragCoord` の入力と `iResolution` を受け取るだけです。
代わりにテクスチャ座標のような他のものを使えば、他のテクスチャと同じように使えます。
関数を使ってテクスチャを生成するこの手法は、[*プロシージャルテクスチャ*](https://www.google.com/search?q=procedural+texture)と呼ばれています。

上記のシェーダーを変更してみましょう。
最も簡単なのはthree.jsが通常提供しているテクスチャ座標を取得し、それに `iResolution` を掛けて `fragCoords` に渡す事かもしれません。

そのためには *ヴァリイング(varying)* を追加します。
ヴァリイングとは頂点シェーダーからフラグメントシェーダーに渡される値で、頂点間で補間される値（または変化する値）の事です。
フラグメントシェーダーで使用するために宣言します。
Three.jsのテクスチャ座標は `uv` で前にある `v` は *ヴァリイング* を意味します。

```glsl
...

+varying vec2 vUv;

void main() {
-  mainImage(gl_FragColor, gl_FragCoord.xy);
+  mainImage(gl_FragColor, vUv * iResolution.xy);
}
```

次に独自の頂点シェーダーも用意する必要があります。
ここでは最小限のthree.jsの頂点シェーダーを紹介します。
Three.jsは `uv`、`projectionMatrix`、`modelViewMatrix`、`position` を宣言し、その値を提供します。

```js
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
`;
```

頂点シェーダーを `ShaderMaterial` に渡します。

```js
const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms,
});
```

`iResolution` の値は初期化時には変化しないので、`iResolution` の値をユニフォームに設定できます。

```js
const uniforms = {
  iTime: { value: 0 },
-  iResolution:  { value: new THREE.Vector3() },
+  iResolution:  { value: new THREE.Vector3(1, 1, 1) },
  iChannel0: { value: texture },
};
```

レンダリング時に設定する必要がなくなりました。

```js
-const canvas = renderer.domElement;
-uniforms.iResolution.value.set(canvas.width, canvas.height, 1);
uniforms.iTime.value = time;
```

元のカメラと[レスポンシブデザインの記事](threejs-responsive.html)から3つの回転する立方体を設定するコードでコピーバックしました。
その結果です。

{{{example url="../threejs-shadertoy-as-texture.html" }}}

これで少しでもthree.jsを使ったshadertoyシェーダーの使い方を知ってもらえればと思います。
繰り返しになりますが、ほとんどのshadertoyシェーダーは実際にパフォーマンスの高い方法で描画する推奨された方法ではなく、
面白いチャレンジ（単一の機能で全てを描画する）と覚えておく事が重要です。
それでもshadertoyのシェーダー達は素晴らしく、印象的で、美しく、どのように機能するかコードを見て学ぶ事ができます。
