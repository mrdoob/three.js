Title: Three.js Туман
Description: Туман в Three.js
TOC: Туман

Эта статья является частью серии статей о three.js. Первая статья - [основы Three.js](threejs-fundamentals.html).
Если вы еще не читали их, и вы новичок в three.js, возможно, вы захотите начать с них. 
Если вы еще не читали о камерах, вы можете начать с [этой статьи](threejs-cameras.html).

Туман в 3D-движке - это, как правило, способ затухания до определенного цвета в зависимости от расстояния до камеры. 
В three.js вы добавляете туман, создавая объект `Fog` или `FogExp2` и устанавливая его в свойстве сцены 
[`fog`](Scene.fog).

`Fog`  позволяет выбирать `near` и `far` настройки, которые находятся на расстоянии от камеры. 
Все, что `near`  не подвержено влиянию тумана. 
Все, что `far`  - это цвет тумана. Части между `near` и `far`  переходят от их материального цвета к цвету тумана. 

Есть также `FogExp2`, который растет экспоненциально с расстоянием от камеры.

Чтобы использовать любой тип тумана, вы создаете его и назначаете его сцене, как в 

```js
const scene = new THREE.Scene();
{
  const color = 0xFFFFFF;  // white
  const near = 10;
  const far = 100;
  scene.fog = new THREE.Fog(color, near, far);
}
```

или для `FogExp2` это будет

```js
const scene = new THREE.Scene();
{
  const color = 0xFFFFFF;
  const density = 0.1;
  scene.fog = new THREE.FogExp2(color, density);
}
```

`FogExp2` ближе к реальности, но `Fog` используется чаще, поскольку он позволяет вам выбрать место для нанесения тумана, 
чтобы вы могли решить показать чистую сцену на определенном расстоянии, а затем исчезновение до некоторого цвета за этим расстоянием. 

<div class="spread">
  <div>
    <div data-diagram="fog"></div>
    <div class="code">THREE.Fog</div>
  </div>
  <div>
    <div data-diagram="fogExp2"></div>
    <div class="code">THREE.FogExp2</div>
  </div>
</div>

Важно отметить, что туман применяется к *вещам, которые отображаются*.
Это часть расчета каждого пикселя цвета объекта.
 Это означает, что если вы хотите, чтобы ваша сцена стала блеклой, вам нужно установить туман  **и** цвет фона на один и тот же цвет.
Цвет фона устанавливается с помощью свойства [`scene.background`](Scene.background). Чтобы выбрать цвет фона, вы прикрепляете к нему `THREE.Color`. Например 

```js
scene.background = new THREE.Color('#F00');  // red
```

<div class="spread">
  <div>
    <div data-diagram="fogBlueBackgroundRed" class="border"></div>
    <div class="code">fog blue, background red</div>
  </div>
  <div>
    <div data-diagram="fogBlueBackgroundBlue" class="border"></div>
    <div class="code">fog blue, background blue</div>
  </div>
</div>

Вот один из наших предыдущих примеров с добавленным туманом.
Единственное добавление - сразу после настройки сцены мы добавляем туман и устанавливаем цвет фона сцены 

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

В приведенном ниже примере `near` камеры равен 0,1, а `far` - 5. Камера находится в точке `z = 2`. 
Кубики имеют размер 1 и имеют значение `z = 0`. 
Это означает, что при настройке тумана `near = 1` и `far = 2` кубики исчезнут прямо вокруг их центра. 

{{{example url="../threejs-fog.html" }}}

Давайте добавим интерфейс, чтобы мы могли настроить туман. Мы снова будем использовать
[dat.GUI](https://github.com/dataarts/dat.gui). dat.GUI принимает объект и свойство и автоматически создает интерфейс для этого типа свойства.
Мы могли бы просто позволить ему манипулировать свойствами `near` и `far` тумана, но недопустимо иметь `near` больше, чем `far`, поэтому давайте создадим помощник, 
чтобы dat.GUI мог манипулировать свойством `near` и `far`, 
но мы убедимся, что `near` меньше или равно `far` и `far` больше или равно `near`. 

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

Затем мы можем добавить это так

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

Параметры `near` и `far` задают минимальные и максимальные значения для регулировки тумана. Они устанавливаются при настройке камеры. 

`.Listen ()` в конце последних 2 строк указывает dat.GUI *прослушивать*
изменения. Таким образом, когда мы меняем `near` на `far` или мы меняем `far` на `near` dat.GUI обновит интерфейс другого свойства для нас. 

Также было бы неплохо иметь возможность изменить цвет тумана, но, как было упомянуто выше, нам нужно синхронизировать цвет тумана и цвет фона. 
Итак, давайте добавим еще одно *виртуальное* свойство в наш помощник, который будет устанавливать оба цвета, когда dat.GUI манипулирует им. 

dat.GUI может манипулировать цветами 4 способами, как шестнадцатеричная строка из 6 цифр CSS (например: `# 112233`). 
Как тон, насыщенность, яркость объекта (например: `{h: 60, s: 1, v:}`). 
Как массив RGB (например: `[255, 128, 64]`). Или как массив RGBA (например: `[127, 200, 75, 0.3]`). 

Для нашей цели проще всего использовать шестнадцатеричную версию, поскольку таким образом dat.GUI манипулирует только одним значением. 
К счастью, `THREE.Color` как метод [`getHexString`](Color.getHexString)
который мы используем, чтобы легко получить такую cтроку - нам просто нужно добавить `«#»` вперед. 

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

Затем мы вызываем `gui.addColor`, чтобы добавить интерфейс цвета для виртуального свойства нашего помощника.

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

Вы можете видеть `near` до 1,9, а `far` до 2,0 дает очень резкий переход между незатуманенным и полностью затуманенным. 
где `near` = 1,1 и `far` = 2,9 должны быть примерно самыми гладкими, учитывая, что наши кубики вращаются на 2 единицы от камеры. 

И последнее: на материале существует логическое свойство [`fog`](Material.fog),
определяющее, влияет ли туман на объекты, созданные с этим материалом. 
По умолчанию это `true` для большинства материалов. В качестве примера того, почему вы можете захотеть отключить туман, представьте, 
что вы делаете 3D-симулятор автомобиля с видом с места водителя или из кабины.
Вы, вероятно, хотите, чтобы тумана не было внутри, если смотреть изнутри автомобиля. 

Лучшим примером может быть дом и густой туман вне дома. Допустим, туман установлен на расстоянии 2 метра ( near = 2) и полностью затуманен на 4 метра ( far = 4). 
Комнаты длиннее 2 метров, а дом, вероятно, длиннее 4 метров, поэтому вам необходимо установить материалы для внутренней части дома, 
чтобы не было тумана, в противном случае, если вы будете стоять внутри дома, глядя на стену в дальнем конце комнаты, она будет в тумане. 

<div class="spread">
  <div>
    <div data-diagram="fogHouseAll" style="height: 300px;" class="border"></div>
    <div class="code">fog: true, all</div>
  </div>
</div>

Обратите внимание, что на стены и потолок в дальнем конце комнаты распространяется туман. Отключив туман для материалов дома, мы можем решить эту проблему. 

<div class="spread">
  <div>
    <div data-diagram="fogHouseInsideNoFog" style="height: 300px;" class="border"></div>
    <div class="code">fog: true, only outside materials</div>
  </div>
</div>

<canvas id="c"></canvas>
<script type="module" src="../resources/threejs-fog.js"></script>
