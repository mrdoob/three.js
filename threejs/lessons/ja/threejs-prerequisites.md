Title: Three.jsの前提条件
Description: このサイトを使用するために必要なスキル
TOC: 前提条件

これらの記事は、three.jsの使用方法を学習するためものです。
JavaScriptのプログラミング方法を把握してる事を前提とします。
DOMとは何か、HTMLの記述方法、JavaScriptでDOMの作成方法を把握してる事を前提とします。
[es6 modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) のimportや `<script type="module">` タグを把握してる事を前提とします。
CSSや [CSSセレクター](https://developer.mozilla.org/en-US/docs/Learn/CSS/Introduction_to_CSS/Selectors) が何か把握してる事を前提とします。
ES5、ES6、およびES7を把握してる事を前提とします。
イベントとコールバックでJavaScripが実行されるのを把握してる事を前提とします。
クロージャとは何かを知っている事を前提とします。

また、以下に簡単な復習と注意事項があります。

## es6モジュール

es6モジュールはスクリプトの中で `import` キーワード、または `<script type="module">` タグを使用してインラインでロードできます。
以下に両方の使用​​例があります。

```html
<script type="module">
import * as THREE from './resources/threejs/r119/build/three.module.js';

...

</script>
```

パスは絶対パス、または相対パスでなければなりません。相対パスは常に `./` または `../` で始まり `<img>` や `<a>` などの他のタグやcss参照とは異なります。

詳細は[この記事](threejs-fundamentals.html)の最後に記載しています。

## `document.querySelector` と `document.querySelectorAll`

`document.querySelector` を使用し、CSSセレクターに一致する最初の要素を選択できます。
`document.querySelectorAll` は、CSSセレクターに一致するすべての要素を返します。

## `onbody` は必要ありません

20年前の古いWebページでは、以下のようなHTMLが多く使われてました。

    <body onload="somefunction()">

このスタイルは非推奨です。スクリプトをページの下部に配置します。

```html
<html>
  <head>
    ...
  </head>
  <body>
     ...
  </body>
  <script>
    // inline javascript
  </script>
</html>
```

または、[deferプロパティを使用します](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script)。

## クロージャーの仕組みを知る

```js
function a(v) {
  const foo = v;
  return function() {
     return foo;
  };
}

const f = a(123);
const g = a(456);
console.log(f());  // prints 123
console.log(g());  // prints 456
```

上記のコードでは、新しい関数が作成される度に関数 `a` を呼び出します。
その関数は変数 `foo` を *閉じ込めます* 。
ここに[詳細な情報](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures) があります。

## `this` がどのように機能するか知る

`this` は魔法ではありません。
引数が関数に渡されるのと同じように、関数に自動的に渡される実質的な変数です。
簡単に説明すると、次のような関数を直接呼び出す場合です。

    somefunction(a, b, c);

`this` は `null`（strictモードまたはモジュールの場合）になりますが、ドット演算子を使用して関数を呼び出す場合と同様です。

    someobject.somefunction(a, b, c);

`this` は `someobject` がセットされます。

この部分はみなさんが混乱するコールバックです。

     const callback = someobject.somefunction;
     loader.load(callback);

これは経験の浅い人が期待するように動作しません。
なぜなら `loader.load` がコールバックを呼び出す時、`.` 演算子で `this` を呼び出していないため、デフォルトではnullになります（ローダーが明示的に何かを設定しない限り）
コールバックが発生した時に `this` を `someobject` したい場合は、関数をバインドする必要があります。

     const callback = someobject.somefunction.bind(someobject);
     loader.load(callback);

[この記事は `this` を理解するのに役立つかもしれません](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this).

## ES5/ES6/ES7 stuff

### `var` は非推奨です。 `const` か `let` を使って下さい

`var` は使用する理由がありません。varを使用するのは悪い習慣と見なされます。ほとんどの場合、変数の値を変えない場合は `const` を使用します。
値が変更される場合は `let` を使用します。これにより大量のバグを回避できます。

### `for of` を使用し `for in` は使用しない

`for of` は新しい書き方で、 `for in` は古い書き方です。 `for in` で解決できない問題を `for of` が解決しています。
解決した一例として、オブジェクトのすべてのkey/valueのペアを反復処理ができます。

```js
for (const [key, value] of Object.entries(someObject)) {
  console.log(key, value);
}
```

### `forEach` 、`map` 、 `filter` は役に立ちます

配列の関数である [`forEach`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach) や
[`map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) 、
[`filter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
 はモダンなJavaScriptで広く使われています。

### 分割代入を使う

`const dims = {width: 300, height: 150}` のObjectがあるとします。

古いコードの場合

     const width = dims.width;
     const height = dims.height;

新しいコードの場合

     const {width, height} = dims;

### オブジェクト宣言のショートカットを使う

古いコードの場合

```js
 const width = 300;
 const height = 150;
 const obj = {
   width: width,
   height: height,
   area: function() {
     return this.width * this.height
   },
 };
```

新しいコードの場合

```js
 const width = 300;
 const height = 150;
 const obj = {
   width,
   height,
   area() {
     return this.width * this.height;
   },
 };
```

### スプレット演算子 `...` を使う

スプレット演算子にはたくさんの使い方があります。例えば

```js
 function log(className, ...args) {
   const elem = document.createElement('div');
   elem.className = className;
   elem.textContent = [...args].join(' ');
   document.body.appendChild(elem);
 }
```

もう1つの例

```js
const position = [1, 2, 3];
somemesh.position.set(...position);
```

### `class` を使う

ES5より以前のオブジェクトのようなクラス構文は、ほとんどのプログラマーにはなじみがありませんでした。
ES5以降では、C ++やC＃、Javaのスタイルに近い[`class` キーワードを使用](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)
できるようになりました。

### gettersとsettersを理解する

[Getters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) と
[setters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set) は
ほとんどのモダンなプログラミン言語でよく使われます。
ES5のクラス構文により、ES5以前よりもはるかに簡単に使えます。

### 必要に応じてアロー関数を使います

アロー関数はcallbackとPromiseで特に役立ちます。

```js
loader.load((texture) => {
  // use texture
});
```

アロー関数は `this` をバインドします。

```js
const foo = (args) => {/* code */};
```

ショートカットで書くなら

```js
const foo = (function(args) {/* code */}).bind(this));
```

### Promiseはasync/awaitと同様です

Promisesは非同期な処理を助ます。Async/awaitはpromiseを助けます。

ここで扱うには大きな話題になるため、[promiseのドキュメントを読んで下さい](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)。
また、[async/awaitもドキュメントを読んで下さい](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await)。

### テンプレートリテラルを使用する

テンプレートリテラルは、引用符（"", ''）の代わりにバックティック文字（` `）を使います。

    const foo = `this is a template literal`;

テンプレートリテラルには基本的に2つの機能があります。1つは複数行にかけます。

```js
const foo = `this
is
a
template
literal`;
const bar = "this\nis\na\ntemplate\nliteral";
```

上記の `foo` と `bar` は同様の意味になります.

もう1つは、文字モードの中に `${javascript-expression}` のようにJavaScriptのスニペッドを挿入できます。
これはテンプレートの一部です。例えば

```js
const r = 192;
const g = 255;
const b = 64;
const rgbCSSColor = `rgb(${r},${g},${b})`;
```

または

```js
const color = [192, 255, 64];
const rgbCSSColor = `rgb(${color.join(',')})`;
```

または

```js
const aWidth = 10;
const bWidth = 20;
someElement.style.width = `${aWidth + bWidth}px`;
```

# JavaScriptのコーディング規則を学びましょう

自由にコードフォーマットする事ができますが、少なくとも1つの規則に注意する必要があります。
JavaScriptの変数名や関数名、メソッド名はすべてローワーキャメルケースです。
コンストラクターやクラスの名前はアッパーキャメルケースです。
このルールに従うなら、他のほとんどのJavaScriptコードと一致します。

多くの [リンター]](https://eslint.org) やコード内の明らかなエラーをチェックするプログラムは、間違ったケースを使用するとエラーを指摘します。
上記の規則に従うことで、エラーが間違っている事がわかるからです。

```js
const v = new vector(); // clearly an error if all classes start with a capital letter
const v = Vector();     // clearly an error if all functions start with a lowercase latter.
```

# Visual Studio Codeの使用を検討する

もちろんあなたが望むエディタが良いですが、もし望むエディタがなければ [Visual Studio Code](https://code.visualstudio.com/) を使う事を検討してみて下さい。
インストールし [eslintをセットアップ](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) します。
セットアップには数分かかる場合がありますが、バグを見つけるのに非常に役に立ちます。

いくつかの例

[`no-undef` ルール](https://eslint.org/docs/rules/no-undef) を有効にすると、VSCodeのEsLintで多くの未定義の変数について警告します。

<div class="threejs_center"><img style="width: 615px;" src="resources/images/vscode-eslint-not-defined.png"></div>

上記は `doTheThing` のスペルを  `doThing` と間違えている事がわかります。
`doThing` の下に赤い波線があり、その上をホバリングすると定義されていない事がわかります。
1つのエラーが回避されました。
`THREE` を使用して警告が表示された場合、eslintに `THREE` が存在する事を伝えるため、JavaScriptファイルの先頭に `/* global THREE */` を追加します。

<div class="threejs_center"><img style="width: 615px;" src="resources/images/vscode-eslint-not-a-constructor.png"></div>

上記では、eslintは `アッパーキャメルケース` がコンストラクターであるというルールを知っているため、 `new` を使用する必要があります。
他のエラーをキャッチして避けます。これは[`new-cap` ルール](https://eslint.org/docs/rules/new-cap) です。

[数百のEslintルールをオン・オフにカスタム](https://eslint.org/docs/rules/) できます。
上記の例では `var` でなく `const` と `let` を使用するルールを適用しました。
コードでは `var` を使用しましたが、`let` または `const` を使用する必要があると警告されました。

<div class="threejs_center"><img style="width: 615px;" src="resources/images/vscode-eslint-var.png"></div>

ここでは `let` を使用しましたが、値を変更しない事がわかったため、 `const` を使用することが提案されました。

<div class="threejs_center"><img style="width: 615px;" src="resources/images/vscode-eslint-let.png"></div>

もちろん、 `var` を使い続けたい場合は、そのルールをオフにすることができます。
上記で記述したように `var` よりも `const` と `let` を使用することを好みます。
それらはうまく機能し、バグを防ぎます。

ルールをオーバーライドする必要がある場合、1行のコードまたはコードセクションに[無効にするコメントを追加できます](https://eslint.org/docs/user-guide/configuring#disabling-rules-with-inline-comments)。

# レガシーブラウザをサポートする必要がある場合は、トランスパイラーを使用して下さい

ほとんどのモダンなブラウザは自動更新されるため、これらすべての機能を使用すると便利です。生産性を高め、バグを回避できます。
あなたのプロジェクトで古いブラウザをサポートする必要があれば、[ES5/ES6/ES7コードをES5のJavascriptにトランスパイラーするツール](https://babeljs.io) を使用して下さい。