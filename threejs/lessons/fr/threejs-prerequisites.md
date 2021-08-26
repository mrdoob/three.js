Title: Pré-requis pour Three.js
Description: Ce que vous avez besoin de connaître pour comprendre ce site.
TOC: Pré-requis

Ces articles sont faits pour vous aider à apprendre comment utiliser three.js.
Ils supposent que :
  * vous savez programmer en Javascript ;
  * vous savez ce que c'est qu'un *DOM*, comment écrire du HTML, ainsi que créer des éléments *DOM*
en Javascript ;
  * vous savez exploiter les
[modules es6](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import)
que ce soit via le mot clef import ou via les balises `<script type="module">` ;
  * vous avez des connaissances en CSS et savez ce que sont
[les sélecteurs CSS](https://developer.mozilla.org/en-US/docs/Learn/CSS/Introduction_to_CSS/Selectors).
  * vous connaissez ES5, ES6, voire ES7 ;
  * vous savez que le navigateur n'exécute que du Javascript de façon événementiel via des fonctions de rappel (*callbacks*) ;
  * vous savez ce qu'est une fonction de clôture (*closure*).

Voici ci-dessous quelques rappels et notes.

## Modules es6

Les modules es6 peuvent être chargé via le mot-clé `import` dans un script
ou en ligne via une balise `<script type="module">`. Voici un exemple des deux

```html
<script type="module">
import * as THREE from './resources/threejs/r132/build/three.module.js';

...

</script>
```

Les chemins doivent être absolus ou relatifs. Ces derniers débutent toujours par `./` ou `../`,
ce qui est différent des autres balises telles que `<img>`, `<a>` et les références css.

Davantage de détails se trouvent à la fin de [cet article](threejs-fundamentals.html).

## `document.querySelector` et `document.querySelectorAll`

Vous pouvez utiliser `document.querySelector` pour sélectionner le
premier élément qui correspond à un sélecteur CSS.
`document.querySelectorAll` retourne tous les éléments qui correspondent
à un sélecteur CSS.

## `onbody` n'est pas nécessaire

Beaucoup de pages vielles d'il y a 20 ans utilisent

    <body onload="somefunction()">

Ce style est déprécié. Mettez vos scripts à la fin de la page.

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

ou [utilisez la propriété `defer`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script).

## Connaître le fonctionnement des clôtures (*closures*)

```js
function a(v) {
  const foo = v;
  return function() {
     return foo;
  };
}

const f = a(123);
const g = a(456);
console.log(f());  // affiche 123
console.log(g());  // affiche 456
```

Dans le code ci-dessus, la fonction `a` créé une nouvelle fonction chaque fois qu'elle est appelée.
Cette fonction se *clôt* sur la variable `foo`. Voici [davantage d'information](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures).

## Comprendre le fonctionnement de `this`

`this` est une variable passée automatiquement aux fonctions tout comme les arguments y sont passés.
Une explication simple est que quand vous appelez une fonction directement comme ceci :

    somefunction(a, b, c);

`this` prendra la valeur `null` (dans le cas du mode *strict* ou d'un module) tandis que lorsque vous
appelez une fonction via l'opérateur `.` comme ceci :

    someobject.somefunction(a, b, c);

`this` sera une référence vers `someobject`.

Ce fonctionnement peut dérouter lorsqu'il est combiné avec les fonctions de rappel (*callbacks*).

     const callback = someobject.somefunction;
     loader.load(callback);

Ceci ne fonctionne pas comme s'y attendrait une personne inexpérimentée parce que, quand
`loader.load` appelle la fonction de rappel, il n'utilise pas l'opérateur `.` et donc
par défaut `this` est null (à moins que loader le fixe arbitrairement à une valeur).
Si vous souhaitez que `this` se rapporte à `someobject` quand la fonction de rappelle
est activée, vous devez dire à Javascript de le lier à la fonction.

     const callback = someobject.somefunction.bind(someobject);
     loader.load(callback);

[Cet article peut aider à expliquer `this`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this).


## Particularités d'ES5/ES6/ES7
### `var` est déprécié. Privilégiez l'usage de `const` et/ou `let`

Il n'y a **PLUS AUCUNE** raison d'utiliser `var`. L'utiliser est dorénavant considéré
comme une mauvaise pratique. Utilisez `const` si la variable n'est jamais réaffectée,
ce qui se passe dans la majorité des cas. Utilisez `let` dans le cas où la valeur change.
Cela aidera à éviter beaucoup de bogues.

### Utilisez `for(elem of collection)` jamais `for(elem in collection)`

`for of` est récent, `for in` est ancien. `for in` avait des problèmes résolus par `for of`

Voici un exemple où vous pouvez itérer au travers de toutes les paires clef/valeur
d'un objet :

```js
for (const [key, value] of Object.entries(someObject)) {
  console.log(key, value);
}
```

### Utilisez `forEach`, `map`, et `filter` quand c'est utile

Les fonctions [`forEach`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach),
[`map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map), et
[`filter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter) ont
été ajoutées aux tableaux (*arrays*) et sont utilisés de manière assez intensives en JavaScript moderne.

### Utiliser l'affectation par décomposition (*destructuring*)

Soit l'objet `const dims = {width: 300, height: 150}`

ancien code

     const width = dims.width;
     const height = dims.height;

nouveau code

     const {width, height} = dims;

### Utilisez les raccourcis pour la déclaration des objets

ancien code :

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

nouveau code :

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

### Utilisez l'opérateur d'expansion `...`

L'opérateur d'expansion a de multiples usages. Voici un exemple :

```js
 function log(className, ...args) {
   const elem = document.createElement('div');
   elem.className = className;
   elem.textContent = [...args].join(' ');
   document.body.appendChild(elem);
 }
```

et un autre exemple :

```js
const position = [1, 2, 3];
somemesh.position.set(...position);
```

### Utilisez `class`

La syntaxe pour créer des objets au comportement de classe avant ES5
n'était connue que des programmeurs chevronnés. Depuis ES5, vous pouvez
à présent [utiliser le mot-clef `class`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)
qui est plus proche du style C++/C#/Java.

### Comprendre les accesseurs (*getters* et *setters*)

[Getters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get) et
[setters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set) sont
communs dans la plupart des langages modernes. La syntaxe de type `class`
de ES5 les rend plus faciles à employer qu'avant.

### Utilisez les fonctions fléchées (*arrow functions*) quand c'est approprié

Cela est particulièrement utile avec les fonctions de rappel (*callbacks*) et les promesses (*promises*).

```js
loader.load((texture) => {
  // utiliser la texture
});
```

Les fonctions fléchées se lient avec `this`. Ainsi

```js
const foo = (args) => {/* code */};
```

est un raccourci pour

```js
const foo = (function(args) {/* code */}).bind(this));
```

### De l'utilisation des promesses ainsi que de async/await

Les promesses (*promises*) aident à l'utilisation de code asynchrone.
Async/await aident à l'utilisation des promesses.

Cela nécessiterait des développements trop long à détailler ici.
Toutefois, vous pouvez [en lire davantage sur les promesses ici](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)
et sur [async/await ici](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await).

### Utilisez les gabarits de libellés (*template Literals*)

Les gabarits de libellés sont des chaînes de caractères délimitées par
des accents graves au lieu d'apostrophes doubles (*quotes*).

    const foo = `this is a template literal`;

Les gabarits de libellés ont deux particularités. La première est d'être multi-ligne

```js
const foo = `this
is
a
template
literal`;
const bar = "this\nis\na\ntemplate\nliteral";
```

ainsi `foo` et `bar` ci-dessus sont similaires.

L'autre particularité est que vous pouvez sortir du mode chaîne et insérer des fragments
de code Javascript en utilisant `${javascript-expression}`.
C'est l'objet des gabarits. Par exemple :

```js
const r = 192;
const g = 255;
const b = 64;
const rgbCSSColor = `rgb(${r},${g},${b})`;
```

ou

```js
const color = [192, 255, 64];
const rgbCSSColor = `rgb(${color.join(',')})`;
```

ou

```js
const aWidth = 10;
const bWidth = 20;
someElement.style.width = `${aWidth + bWidth}px`;
```

# Apprenez les conventions de codage JavaScript

Alors que vous êtes libre de formater votre code comme vous le souhaitez, il
y a au moins une convention dont vous devez avoir connaissance. Les variables,
les noms de fonctions et de méthodes sont toutes en *lowerCasedCamelCase* (c'est
à dire que les mots formant les noms des entités sont collés les uns aux autres et leur première lettre
est en majuscule, les autres en minuscules à l'exception de la toute première lettre du nom qui
est également en minuscule -- NDT).
Les constructeurs, les noms des classes sont en *CapitalizedCamelCase* (
les mots formant les noms des entités sont collés les uns aux autres et leur première lettre
est en majuscule, les autres en minuscules -- NDT).
Si vous suivez cette règle, votre code ressemblera à la plupart des autres
écrits en JavaScript. Beaucoup de [linters](https://eslint.org), qui sont
des programmes vérifiant les erreurs dans votre code,
mettrons en évidence des erreurs si vous utiliser la mauvaise casse puisqu'en
suivant la convention ci-dessus ils sauront que ces lignes ci-dessous sont
mauvaises :

```js
const v = new vector(); // évidemment une erreur si toutes les classes commencent par une majuscule.
const v = Vector();     // évidemment une erreur si toutes les fonctions commencent par une minuscule.
```

<!-- JYD -->
# Envisagez l'utilisation de Visual Studio Code

Bien sûr, vous pouvez utiliser l'éditeur de votre choix mais, si vous ne l'avez pas
encore essayé, envisagez d'utiliser [Visual Studio Code](https://code.visualstudio.com/)
pour JavaScript et après l'avoir installé, [intégrez-y eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint).
Cela vous prendra quelques minutes à installer mais vous aidera grandement pour
trouver les bogues de votre JavaScript.

Quelques exemples

Si vous activez [la règle `no-undef`](https://eslint.org/docs/rules/no-undef)
alors VSCode via ESLint vous avertira de l'utilisation de nombreuses variables non définies.

<div class="threejs_center"><img style="width: 615px;" src="resources/images/vscode-eslint-not-defined.png"></div>

Ci-dessous vous pouvez voir que nous avons écrit `doTheThing` à la place `doThing`.
`doThing` se retrouve souligné en rouge et un passage au dessus me dira que
c'est non défini. Une erreur est donc évitée.

Vous aurez des avertissements (*warnings*) en utilisant `THREE` donc ajoutez `/* global THREE */`
en haut de vos fichiers JavaScript pour notifier à eslint que `THREE` existe.

<div class="threejs_center"><img style="width: 615px;" src="resources/images/vscode-eslint-not-a-constructor.png"></div>

Ci-dessus, vous pouvez voir que eslint connaît la règle que les noms commençant par
une majuscule `UpperCaseNames` sont des constructeurs et vous devez donc utiliser `new`.
Une autre erreur évitée. C'est [la règle `new-cap` rule](https://eslint.org/docs/rules/new-cap).

Il y a [des centaines de règles que vous pouvez activer, désactiver ou personnaliser](https://eslint.org/docs/rules/).
Par exemple, précédemment nous avons indiquer que nous devions utiliser `const` et `let` à la place de `var`.

Ici nous avons utilisé `var` et nous avons été avertis que nous devions utiliser `let` ou `const`

<div class="threejs_center"><img style="width: 615px;" src="resources/images/vscode-eslint-var.png"></div>

Ici nous avons utilisé `let` mais comme la valeur de la variable ne change jamais, nous
nous voyons suggérer l'utilisation de `const`.

<div class="threejs_center"><img style="width: 615px;" src="resources/images/vscode-eslint-let.png"></div>

Bien sûr, si vous préférez conserver `var`, vous pouvez désactiver cette règle.
Comme écrit plus haut, nous préférons privilégier `const` et `let` à la place de `var`
puisqu'ils sont plus efficaces et évitent les bogues.

Pour les cas où vous avez vraiment besoin d'outrepasser une règle,
[vous pouvez ajouter un commentaire pour les désactiver](https://eslint.org/docs/user-guide/configuring#disabling-rules-with-inline-comments)
pour une seule ligne ou une section de code.

# Si vous avez vraiment besoin d'assurer le support de vieux navigateurs, utilisez un transpileur

La plupart des navigateurs se mettent à jour automatiquement donc utiliser les subtilités
vues plus haut vous aiderons à être productif et éviter les bogues.
Ceci étant dit, si vous êtes dans un projet qui doit absolument supporter des
vieux navigateurs, il y a des [outils qui interpréterons votre code ES5/ES6/ES7
et le transpilent en code JavaScript pre-ES5](https://babeljs.io).
