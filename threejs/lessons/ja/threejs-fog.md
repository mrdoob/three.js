Title: Three.jsのフォグ
Description: Three.jsでのフォグ
TOC: フォグ

この記事はThree.jsの連載記事の1つです。
最初の記事は[Three.jsの基礎知識](threejs-fundamentals.html)です。
まだ読んでいない場合、そこから始めると良いかもしれません。
カメラの記事を読んでない方は、まずは[この記事](threejs-cameras.html)を読んでみて下さい。

一般的には3Dエンジンでのフォグ（霧）は、カメラからの距離によって特定の色にフェードアウトする方法です。
three.jsでは `Fog` または `FogExp2` オブジェクトを作成し、シーンに[`fog`](Scene.fog) プロパティを設定してフォグを追加します。

`Fog` はカメラからの距離を表す `near` と `far` があります。
`near` よりも近いものはフォグの影響を受けません。
`far` より遠いものはフォグの影響を受けます。
`near` と `far` の中間部分では、マテリアルの色からフォグの色にグラデーションします。

また、カメラからの距離で急激にグラデーションする `FogExp2` もあります。

どちらのタイプのフォグも使用するにはフォグを作成してシーンに割り当てます。

```js
const scene = new THREE.Scene();
{
  const color = 0xFFFFFF;  // white
  const near = 10;
  const far = 100;
  scene.fog = new THREE.Fog(color, near, far);
}
```

`FogExp2` の場合は次のようなコードになります。

```js
const scene = new THREE.Scene();
{
  const color = 0xFFFFFF;
  const density = 0.1;
  scene.fog = new THREE.FogExp2(color, density);
}
```

`FogExp2` は現実表現に近いですが、`Fog` の方が一般的によく使われています。
Fogは適用する場所を選択できるので、ある距離まではクリアなシーンを表示し、その距離を過ぎるとフェードアウトした色にできます。

<div class="spread">
  <div>
    <div data-diagram="fog" style="height: 300px;"></div>
    <div class="code">THREE.Fog</div>
  </div>
  <div>
    <div data-diagram="fogExp2" style="height: 300px;"></div>
    <div class="code">THREE.FogExp2</div>
  </div>
</div>

ここで注意すべき点は、フォグは *レンダリングされる* ものに適用される事です。
以下はオブジェクトの色の各ピクセルの計算の一部です。
つまり、シーンを特定の色にフェードさせたい場合、フォグ **と** 背景色を同じ色に設定します。
背景色は [`scene.background`](Scene.background) プロパティで設定します。
背景色は `THREE.Color` で指定します。例えば

```js
scene.background = new THREE.Color('#F00');  // red
```

<div class="spread">
  <div>
    <div data-diagram="fogBlueBackgroundRed" style="height: 300px;" class="border"></div>
    <div class="code">fog blue, background red</div>
  </div>
  <div>
    <div data-diagram="fogBlueBackgroundBlue" style="height: 300px;" class="border"></div>
    <div class="code">fog blue, background blue</div>
  </div>
</div>

以下はフォグを追加した例です。
シーンにフォグを追加し背景色を設定します。

```js
const scene = new THREE.Scene();

+{
+  const near = 1;
+  const far = 2;
+  const color = 'lightblue';
+  scene.fog = new THREE.Fog(color, near, far);
+  scene.background = new THREE.Color(color);
+}
```

以下の例ではカメラの `near` は 0.1、`far` は 5です。
カメラは `z = 2` にあります。
立方体は1の大きさで z = 0 です。
つまり、フォグを `near = 1` と `far = 2` と設定し、立方体の中心付近でフェードアウトしています。

{{{example url="../threejs-fog.html" }}}

フォグを調整するインターフェースを追加してみましょう。
ここでも[dat.GUI](https://github.com/dataarts/dat.gui)を使用します。
dat.GUIはオブジェクトとプロパティを受け取り、インタフェースを自動生成します。
これでフォグの `near` と `far` プロパティを簡単に操作できます。
しかし、 `near` が `far` より大きい場合は無効になります。
dat.GUIで `near` と `far` を操作するヘルパーを作ってみましょう。

```js
// We use this class to pass to dat.gui
// so when it manipulates near or far
// near is never > far and far is never < near
class FogGUIHelper {
  constructor(fog) {
    this.fog = fog;
  }
  get near() {
    return this.fog.near;
  }
  set near(v) {
    this.fog.near = v;
    this.fog.far = Math.max(this.fog.far, v);
  }
  get far() {
    return this.fog.far;
  }
  set far(v) {
    this.fog.far = v;
    this.fog.near = Math.min(this.fog.near, v);
  }
}
```

次のコードを追加します。

```js
{
  const near = 1;
  const far = 2;
  const color = 'lightblue';
  scene.fog = new THREE.Fog(color, near, far);
  scene.background = new THREE.Color(color);
+
+  const fogGUIHelper = new FogGUIHelper(scene.fog);
+  gui.add(fogGUIHelper, 'near', near, far).listen();
+  gui.add(fogGUIHelper, 'far', near, far).listen();
}
```

`near` と `far` のパラメーターは、フォグを調整する最小値と最大値を設定します。
これはカメラ設定時にセットします。

最後の2行の `.listen()` をdat.GUIに変更し  *listen* するようにします。
これで `near` や `far` の変更時、dat.GUIが他のプロパティのUIを更新してくれます。

フォグの色を変更できますが、上記で述べたようにフォグの色と背景色を同期させる必要があります。
dat.GUI操作時に両方の色を変更する *virtual* プロパティをヘルパーに追加してみましょう。

dat.GUIでは4つの方法で色を操作できます。

1. CSSの6桁の16進数(例: `#112233`)

2. 色相、彩度、値、オブジェクト (例: `{h: 60, s: 1, v: }`)

3. RGB (例: `[255, 128, 64]`)

4. RGBA（例：`[127, 200, 75, 0.3]`）

dat.GUIが単一の値を操作するので、16進数を使うのが一番簡単です。
幸運な事に `THREE.Color` で [`getHexString`](Color.getHexString) を使用でき、文字列を簡単に取得できます。

```js
// We use this class to pass to dat.gui
// so when it manipulates near or far
// near is never > far and far is never < near
+// Also when dat.gui manipulates color we'll
+// update both the fog and background colors.
class FogGUIHelper {
*  constructor(fog, backgroundColor) {
    this.fog = fog;
+    this.backgroundColor = backgroundColor;
  }
  get near() {
    return this.fog.near;
  }
  set near(v) {
    this.fog.near = v;
    this.fog.far = Math.max(this.fog.far, v);
  }
  get far() {
    return this.fog.far;
  }
  set far(v) {
    this.fog.far = v;
    this.fog.near = Math.min(this.fog.near, v);
  }
+  get color() {
+    return `#${this.fog.color.getHexString()}`;
+  }
+  set color(hexString) {
+    this.fog.color.set(hexString);
+    this.backgroundColor.set(hexString);
+  }
}
```

`gui.addColor` を呼び出し、ヘルパーのvirtualプロパティにcolorのdat.GUIを追加します。

```js
{
  const near = 1;
  const far = 2;
  const color = 'lightblue';
  scene.fog = new THREE.Fog(color, near, far);
  scene.background = new THREE.Color(color);

*  const fogGUIHelper = new FogGUIHelper(scene.fog, scene.background);
  gui.add(fogGUIHelper, 'near', near, far).listen();
  gui.add(fogGUIHelper, 'far', near, far).listen();
+  gui.addColor(fogGUIHelper, 'color');
}
```

{{{example url="../threejs-fog-gui.html" }}}

`near` を1.9、`far` を2.0にすると以下のようになりました。
曇っていない状態と完全に曇っている状態との中間では、シャープなグラデーションします。
`near` = 1.1、`far` = 2.9 とすると、カメラから 2 離れて回転する立方体で最も滑らかになります。

最後に、マテリアルでレンダリングされたオブジェクトがフォグの影響を受けるか判断するために、マテリアルにはboolean型の[`fog`](Material.fog)プロパティがあります。
そのマテリアルを使用してる場合は、フォグの影響を受けます。
ほとんどのマテリアルのデフォルトは `true` です。
フォグを消去する理由は、運転席やコックピットからの視点で3Dの車のシミュレーターを作っている時を想像して下さい。
車内から見ると、車内の全てのものはフォグを外しておきたいと思うでしょう。

フォグの良い例としては、家の外に濃いフォグが出ている場合が挙げられます。
例えば、フォグが2m先（near = 2）から始まり、4m先（far = 4）でフォグがあるとします。
部屋の長さは2メートル以上、家の長さは4メートル以上で、家の中にフォグがかからないように設定が必要です。
設定しない場合に家の中に立っている時に部屋の奥の壁の外を見ると、フォグの中にいるように見えてしまいます。

<div class="spread">
  <div>
    <div data-diagram="fogHouseAll" style="height: 300px;" class="border"></div>
    <div class="code">fog: true, all</div>
  </div>
</div>

部屋の奥の壁と天井にフォグがかかっています。
家のマテリアルのフォグをオフにすると、この問題が解決できます。

<div class="spread">
  <div>
    <div data-diagram="fogHouseInsideNoFog" style="height: 300px;" class="border"></div>
    <div class="code">fog: true, only outside materials</div>
  </div>
</div>

<canvas id="c"></canvas>
<script type="module" src="resources/threejs-fog.js"></script>
