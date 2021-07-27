Title: Les Matériaux dans Three.js
Description: Les Matériaux dans Three.js
TOC: Matériaux

Cet article fait partie d'une série consacrée à Three.js.
Le premier article s'intitule [Principes de base](threejs-fundamentals.html).
Si vous ne l'avez pas encore lu, vous voudriez peut-être commencer par là.

Three.js fournit plusieurs types de matériaux.
Ils définissent comment les objets apparaîtront dans la scène.
Les matériaux que vous utilisez dépendent vraiment de ce que vous essayez d'accomplir.

Il existe 2 façons de définir la plupart des propriétés des matériaux. A la création, comme nous l'avons déjà vu.

```js
const material = new THREE.MeshPhongMaterial({
  color: 0xFF0000,    // red (can also use a CSS color string here)
  flatShading: true,
});
```

Ou après la création.

```js
const material = new THREE.MeshPhongMaterial();
material.color.setHSL(0, 1, .5);  // red
material.flatShading = true;
```

notez qu'il y a plusieurs façons de paramétrer la propriété `THREE.Color`.

```js
material.color.set(0x00FFFF);    // same as CSS's #RRGGBB style
material.color.set(cssString);   // any CSS color, eg 'purple', '#F32',
                                 // 'rgb(255, 127, 64)',
                                 // 'hsl(180, 50%, 25%)'
material.color.set(someColor)    // some other THREE.Color
material.color.setHSL(h, s, l)   // where h, s, and l are 0 to 1
material.color.setRGB(r, g, b)   // where r, g, and b are 0 to 1
```

A la création, vous pouvez passer, soit un nombre héxadécimal ou une valeur entre guillemet comme en CSS.

```js
const m1 = new THREE.MeshBasicMaterial({color: 0xFF0000});         // rouge
const m2 = new THREE.MeshBasicMaterial({color: 'red'});            // rouge
const m3 = new THREE.MeshBasicMaterial({color: '#F00'});           // rouge
const m4 = new THREE.MeshBasicMaterial({color: 'rgb(255,0,0)'});   // rouge
const m5 = new THREE.MeshBasicMaterial({color: 'hsl(0,100%,50%)'); // rouge
```

Examinons l'ensemble des materials de Three.js

Le `MeshBasicMaterial` n'est pas affecté par la lumière.
Le `MeshLambertMaterial` calcul la lumière uniquement pour les sommets (vertices), par contre le `MeshPhongMaterial`, lui, calcule la lumière pour chaque pixel. Le `MeshPhongMaterial` prend en charge aussi les reflets spéculaires.

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
<div class="threejs_center code">modèles low-poly avec les mêmes materials</div>

Le paramètre `shininess` du `MeshPhongMaterial` détermine la *brillance* de la surbrillance spéculaire. La valeur par défaut est 30.

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

Notez que définir la propriété `émissive` sur une couleur sur un
`MeshLambertMaterial` ou un `MeshPhongMaterial` et régler la `couleur` sur noir
(et `shininess` à 0 pour phong) finit par ressembler au `MeshBasicMaterial`.

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

Pourquoi avoir les 3, si `MeshPhongMaterial` peut faire les mêmes choses que `MeshBasicMaterial` et `MeshLambertMaterial` ? La raison est simple. Le materials le plus sophistiqué nécessite aussi plus de puissance de la part du GPU. Sur un GPU plus lent comme par exemple sur un téléphone mobile, vous souhaiterez peut-être réduire la puissance du GPU  en utilisant l'un des materials les moins complexes. Il s'ensuit également que si vous n'avez pas besoin des fonctionnalités supplémentaires, utilisez le materials le plus simple. Si vous n'avez pas besoin de l'éclairage et de la surbrillance spéculaire, utilisez le `MeshBasicMaterial`.

Le `MeshToonMaterial` est similaire au `MeshPhongMaterial`
avec une grande différence. Plutôt que d'ombrager en douceur, il utilise une carte de dégradé (une texture X par 1) pour décider comment ombrager. La valeur par défaut utilise une carte de dégradé dont la luminosité est de 70 % pour les premiers 70 % et 100 % après, mais vous pouvez fournir votre propre carte de dégradé. Cela finit par donner un look 2 tons qui ressemble à un dessin animé.

<div class="spread">
  <div data-diagram="MeshToonMaterial"></div>
</div>

Ensuite, il y a 2 materials de *rendu physique*. Le rendu physique est souvent abrégé PBR.

Les materials ci-dessus utilisent des mathématiques simples pour créer des materials qui semblent 3D, mais ne réagissent pas comme dans le monde réel. Les 2 materials PBR utilisent des mathématiques beaucoup plus complexes pour se rapprocher de ce qui se passe réellement dans le monde réel.

Le premier est `MeshStandardMaterial`. La plus grande différence entre `MeshPhongMaterial` et `MeshStandardMaterial` est qu'il utilise des paramètres différents.
`MeshPhongMaterial` a un paramètre `shininess`. `MeshStandardMaterial` a 2 paramètres `roughness` (rugosité) et `metalness` (metalique).

Basiquement, [`roughness`](MeshStandardMaterial.roughness) est l'opposé de `shininess`.
Quelque chose qui a une rugosité élevée, comme une balle de baseball, n'a pas de reflets durs alors que quelque chose qui n'est pas rugueux, comme une boule de billard, est très brillant. La rugosité va de 0 à 1.

L'autre paramètre, [`metalness`](MeshStandardMaterial.metalness), indique
à quel point le matériau est métallique. Les métaux se comportent différemment des non-métaux. 0
pour le non-métal et 1 pour le métal.

Voici quelques exemples de `MeshStandardMaterial` avec une `roughness` allant de 0 à 1
sur la diagonale et une `metalness` allant de 0 à 1 en descendant.

<div data-diagram="MeshStandardMaterial" style="min-height: 400px"></div>

Le `MeshPhysicalMaterial` est le même que le `MeshStandardMaterial` mais il ajoute un paramètre `clearcoat` (vernis) qui va de 0 à 1 pour savoir quelle couche de brillance appliquée. Et un paramètre `clearCoatRoughness` qui spécifie à quel point la couche de brillance est rugueuse.

Voici la même grille que ci-dessusmais avec les paramètres `clearcoat` et `clearCoatRoughness` en plus.

<div data-diagram="MeshPhysicalMaterial" style="min-height: 400px"></div>

Les divers matériaux standard progressent du plus rapide au plus lent
`MeshBasicMaterial` ➡ `MeshLambertMaterial` ➡ `MeshPhongMaterial` ➡
`MeshStandardMaterial` ➡ `MeshPhysicalMaterial`. Les matériaux les plus lents peuvent créer des scènes plus réalistes, mais vous devrez peut-être concevoir votre code pour utiliser les matériaux les plus rapides sur des machines mobiles ou de faible puissance.

Il existe 3 matériaux qui ont des utilisations spéciales. `ShadowMaterial`
est utilisé pour obtenir les données créées à partir des ombres. Nous n'avons pas encore couvert les ombres. Lorsque nous le ferons, nous utiliserons ce materiau pour jeter un œil à ce qui se passe dans les coulisses.

The `MeshDepthMaterial` resttitue la profondeur de chaque pixel où les pixels
négatifs [`near`](PerspectiveCamera.near) sont à 0 et les négatifs [`far`](PerspectiveCamera.far) sont à 1.
Certains effets spéciaux peuvent utiliser ces données que nous aborderons plus tard.

<div class="spread">
  <div>
    <div data-diagram="MeshDepthMaterial"></div>
  </div>
</div>

Le `MeshNormalMaterial` vous montrera les *normals* de la geéometrie.
Les *Normals* sont la direction d'un triangle ou d'un pixel particulier.
`MeshNormalMaterial` dessine les normales de l'espace de vue (les normales par rapport à la caméra).

<span style="background: red;" class="color">x rouge</span>,
<span style="background: green;" class="dark-color">y est vert</span>, et
<span style="background: blue;" class="dark-color">z est bleu</span> donc les choses tournés vers la droite seront <span style="background: #FF7F7F;" class="color">roses</span>,
ceux vers la gauche seront <span style="background: #007F7F;" class="dark-color">aqua</span>,
vers le haut <span style="background: #7FFF7F;" class="color">vert clair</span>,
vers le bas <span style="background: #7F007F;" class="dark-color">violet</span>,
et vers l'écran <span style="background: #7F7FFF;" class="color">lavande</span>.

<div class="spread">
  <div>
    <div data-diagram="MeshNormalMaterial"></div>
  </div>
</div>

`ShaderMaterial` permet de créer des matériaux personnalisés à l'aide du sytème de shader de Three.js. `RawShaderMaterial` permet de créer des shaders entièrement personnalisés sans l'aide de Three.js. Ces deux sujets sont vastes et seront traités plus tard.

La plupart des matériaux partagent un ensemble de paramètres, tous définis par `Material`.
[Voir la documentation](Material) pour chacun d'eux, mais passons en revue deux des propriétés les plus utilisées.

[`flatShading`](Material.flatShading):
si l'objet à l'air à facettes ou lisse. Par defaut = `false`.

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

[`side`](Material.side): quel côté montrer. La valeur par defaut est `THREE.FrontSide`.
Les autres options sont `THREE.BackSide` et `THREE.DoubleSide` (des deux côtés).
La plupart des objets 3D déssinés dans Three.js sont probablement des solides opaques, il n'est donc pas nécessaire de dessiner les faces arrières (c'est-à-dire les côtés tournés vers l'intérieur du solide). La raison la plus courante de définir le côté, est pour les plans et les objets non solides où il est courant de voir leurs faces arrières.

Voici 6 plans dessinés avec `THREE.FrontSide` et `THREE.DoubleSide`.

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

Il y a vraiment beaucoup de choses à considérer avec les matériaux et il nous en reste encore beaucoup à faire. En particulier, nous avons principalement ignoré les textures qui ouvrent toute une série d'options. Avant de couvrir les textures, nous devons faire une pause et couvrir [la configuration de votre environnement de développement](threejs-setup.html)

<div class="threejs_bottombar">
<h3>material.needsUpdate</h3>
<p>
Ce sujet affecte rarement la plupart des applications Three.js, mais juste pour info...
Three.js applique les paramètres de matériau lorsqu'un matériau est utilisé, où "utilisé" signifie "quelque chose est rendu qui utilise le matériau". 
Certains paramètres de matériau ne sont appliqués qu'une seule fois car leur modification nécessite beaucoup de travail de la part de Three.js.
Dans ces cas, vous devez définir <code>material.needsUpdate = true</code> pour dire à Three.js d'appliquer vos modifications matérielles. Les paramètres les plus courants qui vous obligent à définir <code>needsUpdate</code> si vous modifiez les paramètres après avoir utilisé le matériau sont :
</p>
<ul>
  <li><code>flatShading</code></li>
  <li>ajouter ou supprimer une texture
    <p>
    Changer une texture est possible, mais si vous voulez passer de, aucune texture à l'utilisation d'une texture, ou l'inverse, vous devrez définir <code>needsUpdate = true</code>.
    </p>
    <p>Si vous souhaitez supprimer une texture, il est préférable de la remplacer par une texture blanche de 1 pixel de côté.</p>
  </li>
</ul>
<p>Comme mentionné ci-dessus, la plupart des applications ne rencontrent jamais ces problèmes. La plupart des applications ne basculent pas entre l'ombrage plat et l'ombrage non plat. La plupart des applications utilisent également des textures ou une couleur unie pour un matériau donné, elles passent rarement de l'une à l'autre.
</p>
</div>

<canvas id="c"></canvas>
<script type="module" src="resources/threejs-materials.js"></script>

