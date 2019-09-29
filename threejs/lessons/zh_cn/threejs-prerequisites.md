Title: Three.js先决条件
Description: 使用此网站你需要了解的。
TOC: 先决条件

这些文章意在帮助你学习如何使用three.js。
假设你知道怎么使用JavaScript编程。假设
你知道DOM是什么，怎么写HTML以及使用JavaScript创建
DOM元素。假设你知道如何使用 `<script>`标签来
引用外部的JavaScript文件以及行内脚本。
假设你了解CSS并且知道
[CSS选择器](https://developer.mozilla.org/en-US/docs/Learn/CSS/Introduction_to_CSS/Selectors). 
还假设你了解ES5、 ES6或者一些ES7。
假设你知道浏览器通过事件和回调函数来运行JavaScript。
假设你知道什么是闭包。

这有一些简单的复习和笔记。

## `document.querySelector` and `document.querySelectorAll`

你可以使用`document.querySelector`来选择和CSS选择器
匹配的第一个元素。 `document.querySelectorAll`返回
所有和CSS选择器匹配的元素。

## You don't need `onbody`

很多20年前的页面像这样使用HTML

    <body onload="somefunction()">

这种风格已经被弃用了。将你的脚本放在
页面的底部。

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

or [use the `defer` property](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script).

## 不需要`type="text/javascript"`

最新的

    <script>...</script>

过时的

    <script type="text/javascript"></script>

## 始终使用`strict`模式

将`'use strict';`放在JavaScript文件的顶部。可以帮助减少很多bug。

## 了解闭包如何工作

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

在上面的代码中函数`a`每次被调用都会创建一个新的函数。新函数
会封存变量`foo`. 这里有 [更多信息](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures).

## 理解`this`的工作原理

`this`并不是什么魔法。它实际上像是一个像被自动传给函数的参数一样的变量。
简单的说就是像这样直接调用函数

    somefunction(a, b, c);

`this`将会为`null` (使用严格模式时) 当你使用`.`操作符像这样调用函数时

    someobject.somefunction(a, b, c);

`this`将会被设置为`someobject`。

令人困惑的部分是使用回调函数。

     const callback = someobject.somefunction;
     loader.load(callback);

并没有像不熟悉的所期望的那样工作，因为当
`loader.load`调用回调函数时并没有使用`.`操作符。
所以默认`this`将会为null (除非loader明确将他设置为某些东西)。
如果你希望`this`为`someobject`当回调函数执行时你需要
通过将this绑定到函数来告诉JavaScript。

     const callback = someobject.somefunction.bind(someobject);
     loader.load(callback);

[*this* article might help explain `this`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this).

## ES5/ES6/ES7 特性

### `var`已经被弃用，使用`const`和`let`

没有**任何**理由再使用`var`，基于此使用它被认为是
坏习惯。大所数时间如果变量不会被重新分配使用`const`。
变量会改变的情况下使用`let`。这将会帮助避免大量bug。

### 使用`for(elem of collection)`而不是`for(elem in collection)`

`for of`是新的，`for in`是旧的。 `for of`解决了`for in`的问题。

举个例子，你可以像这样迭代一个对象的所以键/值对

```js
for (const [key, value] of Object.entries(someObject)) {
  console.log(key, value);
}
```

### 使用 `forEach`, `map`, 和 `filter`

数组新增的函数[`forEach`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach、
[`map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)和 
[`filter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
在现代JavaScript中使用都是相当广泛的。

### 使用解构赋值

假设有一个对象`const dims = {width: 300, height: 150}`

老的代码

     const width = dims.width;
     const height = dims.height;

新代码

     const {width, height} = dims;

### 使用对象声明简写

老的代码

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

新代码

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

### 使用扩展运算符`...`

扩展运算符有大量的用途。例如

```js
 function log(className, ...args) {
   const elem = document.createElement('div');
   elem.className = className;
   elem.textContent = [...args].join(' ');
   document.body.appendChild(elem);
 }
```

另一个例子

```js
const position = [1, 2, 3];
somemesh.position.set(...position);
```

### 使用`class`

大多数人都不熟悉在ES5之前生成类对象的语法。
ES5之后你现在可以[使用`class`
关键字](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)
接近于C++/C#/Java的语法。

### 理解 getters 和 setters

[Getters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get)和
[setters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set)是
在大多数现代语言中常见的。ES6`class`语法
让他们比ES6之前的更容易。

### 合理使用箭头函数

回调函数和promise使用箭头函数非常有用

```js
loader.load((texture) => {
  // use textrue
});
```

箭头函数会绑定`this`，它是下面的简写

```js
(function(args) {/* code */}).bind(this))
```

### Promises 以及 async/await

Promises改善异步代码的处理。Async/await改善
promise的使用。

这是一个需要深入了解的话题你可以[在这里
细读promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)
和[async/await](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await).

### 使用模板字符串

模板字符串是使用反引号代替引号的字符串。

    const foo = `this is a template literal`;

模板字符串有两个基本的特点。一个是它可以多行

```js
const foo = `this
is
a
template
literal`;
const bar = "this\nis\na\ntemplate\nliteral";
```

上面的`foo`和`bar`是一样的。

另一个是你可以超越字符串模式
使用`${javascript表达式}`插入JavaScript代码段。这是模板部分。比如:

```js
const r = 192;
const g = 255;
const b = 64;
const rgbCSSColor = `rgb(${r},${g},${b})`;
```

or

```js
const color = [192, 255, 64];
const rgbCSSColor = `rgb(${color.join(',')})`;
```

or

```js
const aWidth = 10;
const bWidth = 20;
someElement.style.width = `${aWidth + bWidth}px`;
```

# 学习JavaScript代码风格。

尽管欢迎您以任何方式组织您的代码，但至少有一个约定您应该知道。
在JavaScript中变量、函数名、方法名
都是小驼峰。构造函数、类名都是
大驼峰。如果你遵守这些约定你的diamagnetic将会和大部分JavaScript匹配。

# 考虑使用Visual Studio Code

当然你想想用什么编辑器就用什么但是如果你没尝试过它那就考虑下
使用[Visual Studio Code](https://code.visualstudio.com/)来写JavaScript。
安装完之后[设置
eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)。
可能会花几分钟来设置但是会对你寻找JavaScript的bug有极大的帮助。

一些例子

如果你开启[`no-undef`规则](https://eslint.org/docs/rules/no-undef)然后
VSCode通过ESLint将会警告你很多没有定义的变量。 

<div class="threejs_center"><img style="width: 615px;" src="resources/images/vscode-eslint-not-defined.png"></div>

上面你可以看到我将`doTheThing`误写成了`doThing`。有一个红色的曲线
在`doThing`下面并且鼠标悬停会提醒我们它未定义。这样就避免了一个错误。

使用`THREE`会得到警告所以将`/* global THREE */`放在你的
JavaScript文件的顶部来告诉eslint`THREE`的存在。

<div class="threejs_center"><img style="width: 615px;" src="resources/images/vscode-eslint-not-a-constructor.png"></div>

上面你可以看到eslint知道使用`UpperCaseNames`规则的是构造函数
所以你应该使用`new`操作符。另一个错误被捕捉并避免了。这是[the
`new-cap`规则](https://eslint.org/docs/rules/new-cap)。

这里有[100多条规则你可以打开或者关闭或者自定义
](https://eslint.org/docs/rules/)。比如上面我提醒你
应该使用`const`和`let`代替`var`。

这里我使用了`var`它警告我应该使用`let`或者`const`

<div class="threejs_center"><img style="width: 615px;" src="resources/images/vscode-eslint-var.png"></div>

这里我是用了`let`但是它发现我一直没改变值所以建议我使`const`。

<div class="threejs_center"><img style="width: 615px;" src="resources/images/vscode-eslint-let.png"></div>

当然如果你更希望继续使用`var`你只要关闭那条规则。
如我上面所说所以我更喜欢使用`const`和`let`而不是`var`因为
他们工作的更好而且能减少bugs。

对于确实需要重写这些规则的情况[你可以添加注释
来禁用
他们](https://eslint.org/docs/user-guide/configuring#disabling-rules-with-inline-comments)
通过单行或者一段代码。

# 如果你确实需要支持老的浏览器请使用编译器

大多数现代浏览器都是自动更新的，所以使用这些新的特性会帮助你提高效率 
和避免bug。意思是说，如果你正在做一个需要支持老的浏览器的项目，
[有工具会把ES5/ES6/ES7代码
转换成ES5之前的Javascript](https://babeljs.io).
