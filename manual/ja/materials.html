Title: Three.js マテリアル
Description: Three.jsのマテリアル
TOC: マテリアル

この記事はthree.jsについてのシリーズ記事の一つです。
最初の記事は[Three.jsの基礎知識](threejs-fundamentals.html)です。
まだ読んでない人は、そちらから先に読んでみるといいかもしれません。

Three.jsはいくつかの種類のマテリアルを提供しています。
これらは、オブジェクトがどのようにシーンに表示されるかを定義します。
どのマテリアルを使うべきかは、皆さんが何をしたいかによります。

マテリアルの属性の設定方法は、だいたい2つです。
一つは、表示される前の作成時です。


```js
const material = new THREE.MeshPhongMaterial({
  color: 0xFF0000,    // red (can also use a CSS color string here)
  flatShading: true,
});
```

もう一つは作成後です。

```js
const material = new THREE.MeshPhongMaterial();
material.color.setHSL(0, 1, .5);  // red
material.flatShading = true;
```

`THREE.Color`型の属性は設定方法が複数あることに注意してください。

```js
material.color.set(0x00FFFF);    // same as CSS's #RRGGBB style
material.color.set(cssString);   // any CSS color, eg 'purple', '#F32',
                                 // 'rgb(255, 127, 64)',
                                 // 'hsl(180, 50%, 25%)'
material.color.set(someColor)    // some other THREE.Color
material.color.setHSL(h, s, l)   // where h, s, and l are 0 to 1
material.color.setRGB(r, g, b)   // where r, g, and b are 0 to 1
```

作成時に、16進数かCSS文字列を渡すことができます。

```js
const m1 = new THREE.MeshBasicMaterial({color: 0xFF0000});         // red
const m2 = new THREE.MeshBasicMaterial({color: 'red'});            // red
const m3 = new THREE.MeshBasicMaterial({color: '#F00'});           // red
const m4 = new THREE.MeshBasicMaterial({color: 'rgb(255,0,0)'});   // red
const m5 = new THREE.MeshBasicMaterial({color: 'hsl(0,100%,50%)'); // red
```

では、three.jsのマテリアルの設定の説明をしましょう。

`MeshBasicMaterial`は光源の影響を受けません。
`MeshLambertMaterial`は頂点でのみ光を計算します。
一方で、`MeshPhongMaterial`は全てのピクセルで光を計算します。
`MeshPhongMaterial`は、specularによるハイライトもサポートします。

<div class="spread">
  <div>
    <div data-diagram="MeshBasicMaterial" ></div>
    <div class="code">Basic</div>
  </div>
  <div>
    <div data-diagram="MeshLambertMaterial" ></div>
    <div class="code">Lambert</div>
  </div>
  <div>
    <div data-diagram="MeshPhongMaterial" ></div>
    <div class="code">Phong</div>
  </div>
</div>
<div class="spread">
  <div>
    <div data-diagram="MeshBasicMaterialLowPoly" ></div>
  </div>
  <div>
    <div data-diagram="MeshLambertMaterialLowPoly" ></div>
  </div>
  <div>
    <div data-diagram="MeshPhongMaterialLowPoly" ></div>
  </div>
</div>
<div class="threejs_center code">同じマテリアルでポリゴン数を変えたモデル</div>

`MeshPhongMaterial`の`shininess`設定は特定のハイライトの*輝き*を決めます。デフォルトは30です。

<div class="spread">
  <div>
    <div data-diagram="MeshPhongMaterialShininess0" ></div>
    <div class="code">shininess: 0</div>
  </div>
  <div>
    <div data-diagram="MeshPhongMaterialShininess30" ></div>
    <div class="code">shininess: 30</div>
  </div>
  <div>
    <div data-diagram="MeshPhongMaterialShininess150" ></div>
    <div class="code">shininess: 150</div>
  </div>
</div>

`MeshLambertMaterial`か`MeshPhongMaterial`のどちらかで、colorに対して`emissive`属性を設定し、
色を黒（phongなら`shininess`を0）に設定すると、ちょうど`MeshBasicMaterial`のように見えることに注意してください。

<div class="spread">
  <div>
    <div data-diagram="MeshBasicMaterialCompare" ></div>
    <div class="code">
      <div>Basic</div>
      <div>color: 'purple'</div>
    </div>
  </div>
  <div>
    <div data-diagram="MeshLambertMaterialCompare" ></div>
    <div class="code">
      <div>Lambert</div>
      <div>color: 'black'</div>
      <div>emissive: 'purple'</div>
    </div>
  </div>
  <div>
    <div data-diagram="MeshPhongMaterialCompare" ></div>
    <div class="code">
      <div>Phong</div>
      <div>color: 'black'</div>
      <div>emissive: 'purple'</div>
      <div>shininess: 0</div>
    </div>
  </div>
</div>

`MeshPhongMaterial`は`MeshBasicMaterial`や`MeshLambertMaterial`と同じようにできるのに、なぜ3種もあるのでしょうか。
理由は、より洗練されたマテリアルは、描写するのにGPUパワーを必要とするためです。
携帯電話といった、遅いGPCでは、より簡単なマテリアルを使うことで、描画に必要なGPUパワーを削減できるかもしれません。
また、余計な機能を必要としないなら、一番シンプルなマテリアルを使用するとよいです。
光源やspecularによるハイライトが不要なら、`MeshBasicMaterial`を使うこともできます。


`MeshToonMaterial`は`MeshPhongMaterial`に似ていますが、一点大きな違いがあります。
連続的にシェーディングするのではなく、グラデーションマップ（X×1のテクスチャ）を使ってシェーディングの方法を決めます。
デフォルトは明るさの始まりが70%、終わりが100%のグラデーションマップを適用しますが、自分で決めたグラデーションマップを適用することもできます。
これにより、まるでアニメのようなツートーンになります。

<div class="spread">
  <div data-diagram="MeshToonMaterial"></div>
</div>

続いて２つの*物理ベースレンダリング*のマテリアルがあります。
物理ベースレンダリングはよくPBRと略します。

上記のマテリアルは、3Dに見えるマテリアルを簡単な数学で作っていますが、
これは現実世界で本当に起きている現象にのっとっていません。
2つのPBRマテリアルはもっと複雑な数学を使い、現実世界に近づいています。

一つ目は`MeshStandardMaterial`です。`MeshPhongMaterial`と`MeshStandardMaterial`の
最大の違いは、異なるパラメータを使っていることです。
`MeshPhongMaterial`は`shininess`設定があります。
`MeshStandardMaterial`は`roughness`と`metalness`の2つの設定があります。

基本的に、[`roughness`](MeshStandardMaterial.roughness)は`shininess`の逆です。
野球ボールがほとんど反射しないように、とても粗いのものがある一方で、
とても光沢があるビリヤード玉のように、粗くないものもあります。
roughnessは0から1の間をとります。

もう一つの設定で、[`metalness`](MeshStandardMaterial.metalness)は、マテリアルの金属っぽさです。
金属は非金属と異なった振る舞いをします。
0は非金属で、1は金属です。

ここに、`MeshStandardMaterial`のサンプルがあります。
右に行くにつれて、`roughness`は0から1に変わります。
下に行くにつれて、`metalness`は0から1に変わります。

<div data-diagram="MeshStandardMaterial" style="min-height: 400px"></div>

`MeshPhysicalMaterial`は、`MeshStandardMaterial`と同様ですが、
`clearcoat`パラメータが追加されています。このパラメータは、0から1につれて、
clearcoat光沢層が適用されます。
また、`clearCoatRoughness`パラメータも追加されていて、これは光沢層の粗さを決定します。

ここに、上と同じ`metalness`と`roughness`のグリッドがあります。
ただし、`clearcoat`と`clearCoatRoughness`の設定が付いています。

<div data-diagram="MeshPhysicalMaterial" style="min-height: 400px"></div>

様々な標準のマテリアルのうち、高速なものから低速なものを並べると、
`MeshBasicMaterial` ➡ `MeshLambertMaterial` ➡ `MeshPhongMaterial` ➡
`MeshStandardMaterial` ➡ `MeshPhysicalMaterial`になります。
低速なマテリアルは、より現実味のある見た目のシーンを作ることができますが、
パワーが低いデバイスやモバイル端末では、より高速なマテリアルを使うようにコードを設計する必要があります。

続いて、特別な用途に使う3つのマテリアルがあります。
`ShadowMaterial`は影から作られたデータを得るのに使われます。
まだ影については説明していませんでしたね。
その際には、このマテリアルを使って、シーンの裏で何が起きているのか、のぞいてみたいと思います。

`MeshDepthMaterial`は各ピクセルの深度を描写します。
カメラの負の[`near`](PerspectiveCamera.near)にあるピクセルは0、負の[`far`](PerspectiveCamera.far)にあるピクセルは1です。
また別の機会に、特定の特殊効果がこのデータを使うかもしれません。

<div class="spread">
  <div>
    <div data-diagram="MeshDepthMaterial"></div>
  </div>
</div>


`MeshNormalMaterial`はジオメトリの*法線*を表示します。
*法線*は、特定の三角形かピクセル表面の方向です。
`MeshNormalMaterial`は見えている空間の法線を描画します（法線はカメラに依存します）。

<span style="background: red;" class="color">xは赤</span>、
<span style="background: green;" class="dark-color">yは緑</span>そして
<span style="background: blue;" class="dark-color">zは青</span>なので、
物体の右側は<span style="background: #FF7F7F;" class="color">pink</span>、
左側は<span style="background: #007F7F;" class="dark-color">aqua</span>、
上側は<span style="background: #7FFF7F;" class="color">light green</span>、
下側は<span style="background: #7F007F;" class="dark-color">purple</span>、
そして画面側は<span style="background: #7F7FFF;" class="color">lavender</span>になるでしょう。

<div class="spread">
  <div>
    <div data-diagram="MeshNormalMaterial"></div>
  </div>
</div>

`ShaderMaterial`は、three.jsのシェーダーシステムを使ったカスタムマテリアルを作るためのものです
`RawShaderMaterial`は、three.jsの補助なしで、完全に独自シェーダーを作るためのものです。
これらのトピックはどちらも大きいため、後ほど説明します。

全てのマテリアルは`Material`によって決められた設定を共有しています。
それらは[ドキュメントを見てください](Material)。けれども、最も一般的に使われる2つの属性について説明しましょう。

[`flatShading`](Material.flatShading)：物体の面が分割されて見えるか、滑らかに見えるか。デフォルトは`false`です。

<div class="spread">
  <div>
    <div data-diagram="smoothShading"></div>
    <div class="code">flatShading: false</div>
  </div>
  <div>
    <div data-diagram="flatShading"></div>
    <div class="code">flatShading: true</div>
  </div>
</div>

[`side`](Material.side)：三角形の両面を表示するか。デフォルトは`THREE.FrontSide`です。
ほかのオプションは `THREE.BackSide`と`THREE.DoubleSide`(両面)です。
threeで描写されるほとんどの3Dオブジェクトは、たぶん不透明な固体です。
そのため、裏面（固体の内側を向いている面）は描画する必要はありません。
`side`を設定する最も一般的な理由は、平面やほかの固体ではないオブジェクトのためです。
これらは、三角形の裏面を見ることが普通だからです。

ここに、`THREE.FrontSide`と`THREE.DoubleSide`で描画された6つの平面があります。

<div class="spread">
  <div>
    <div data-diagram="sideDefault" style="height: 250px;"></div>
    <div class="code">side: THREE.FrontSide</div>
  </div>
  <div>
    <div data-diagram="sideDouble" style="height: 250px;"></div>
    <div class="code">side: THREE.DoubleSide</div>
  </div>
</div>

マテリアルについては、本当にたくさん考えることがあり、実際にはもっとたくさんの説明したいパラメータがあります。
特に、私たちは多くのオプションの話につながる、テクスチャをほとんど無視していました。
テクスチャを説明する前に、休憩を取って、[開発環境のセットアップ](threejs-setup.html)を説明する必要があります。


<div class="threejs_bottombar">
<h3>material.needsUpdate</h3>

<p>
このトピックはめったにthree.jsアプリに影響しませんが、単にFYIのつもりで...。
Three.jsはマテリアルが"使われた"ときに設定を適用します。
"使われた"は"マテリアルを使って何かが描画される"ということです。
マテリアルの設定はたった一度だけ適用されます。変更するとthree.jsに多くの仕事が必要になります。
変更するケースでは、three.jsに変更を伝えるため、<code>material.needsUpdate = true</code>を設定する必要があります。
マテリアルを試用した後で、<code>needsUpdate</code>の設定を必要とする一般的な設定はこのようになります：

</p>
<ul>
  <li><code>flatShading</code></li>
  <li>テクスチャの追加や削除
    <p>
    テクスチャの変更はOKですが、テクスチャを使わない状態から使う状態に変更したり、
    テクスチャを使っている状態から使わない状態に変更したいとすると、
    <code>needsUpdate = true</code>を設定する必要があります。
    </p>
    <p>テクスチャありからテクスチャなしに変更するケースでは、
    1x1ピクセルのホワイトテクスチャを使うことがよいです。</p>
  </li>
</ul>
<p>この問題は、ほとんどのアプリには関係ありません。
ほとんどのアプリではフラットシェードありとフラットシェードなしを切り替えません。
また、ほとんどのアプリは、与えられたマテリアルにテクスチャか固定の色のどちらかを使い、
めったに一方からもう一方に切り替えたりしません。
</p>
</div>

<canvas id="c"></canvas>
<script type="module" src="resources/threejs-materials.js"></script>

