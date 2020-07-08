Title: Three.js 안개
Description: Three.js의 안개에 대해 알아봅니다
TOC: 안개(Fog)

※ 이 글은 Three.js의 튜토리얼 시리즈로서,
먼저 [Three.js의 기본 구조에 관한 글](threejs-fundamentals.html)을
읽고 오길 권장합니다.

※ 카메라에 대해 잘 모른다면, 먼저 [카메라에 관한 글](threejs-cameras.html)을
먼저 읽기 바랍니다.


3D 엔진에서 안개란, 일반적으로 카메라로부터의 거리에 따라 특정 색상으로
점차 변화하는 것을 말합니다. Three.js에서는 `Fog`나 `FogExp2` 객체를
생성한 뒤 장면(scene)의 [`fog`](Scene.fog) 속성에 지정해 안개를 사용합니다.

`Fog`는 인자로 `near`와 `far`값을 받는데, 이는 카메라로부터의 거리값입니다.
`near`값보다 가까운 공간은 안개의 영향이 전혀 없고, `far`값보다 먼 공간은
완전히 안개에 뒤덮입니다. `near`와 `far` 사이의 공간에 있는 물체 또는 물체의
일부는 점차 안개의 색으로 변화하죠.

`FogExp2`는 카메라에서 멀어질수록 안개의 강도가 강해집니다.

두 가지 안개 모두 마찬가지로, 안개를 사용하려면 장면의 속성에 지정해야 합니다.

```js
const scene = new THREE.Scene();
{
  const color = 0xFFFFFF;  // 하양
  const near = 10;
  const far = 100;
  scene.fog = new THREE.Fog(color, near, far);
}
```

`FogExp2`의 경우는 다음처럼 쓸 수 있죠.

```js
const scene = new THREE.Scene();
{
  const color = 0xFFFFFF;
  const density = 0.1;
  scene.fog = new THREE.FogExp2(color, density);
}
```

`FogExp2`가 더 현실적이긴 하나, 보통 안개의 범위를 특정하기 쉬운
`Fog`를 더 많이 사용합니다.

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

한 가지 알아둬야 하는 건 안개는 *렌더링되는 물체*라는 점입니다.
안개는 물체의 픽셀을 렌더링할 때 같이 렌더링되는데, 이 말은 장면에
특정 색상의 안개 효과를 주려면 안개와 배경색 **둘 다** 같은 색으로
지정해야 한다는 겁니다. 배경색은 [`scene.background`](Scene.background)
속성을 `THREE.Color` 인스턴스로 지정해 바꿀 수 있습니다.

```js
scene.background = new THREE.Color('#F00');  // 빨강
```

<div class="spread">
  <div>
    <div data-diagram="fogBlueBackgroundRed" class="border"></div>
    <div class="code">파란 안개, 빨간 배경</div>
  </div>
  <div>
    <div data-diagram="fogBlueBackgroundBlue" class="border"></div>
    <div class="code">파란 안개, 파란 배경</div>
  </div>
</div>

아래는 이전에 사용했던 예제에 안개를 추가한 것입니다. 장면을 생성한 뒤
안개를 추가하고, 장면의 배경색을 바꾸기만 했죠.

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

아래 예제의 카메라는 `near`값이 0.1, `far`값이 5입니다. 카메라의 위치는
`z = 2`이죠. 정육면체의 크기는 1칸이고, z축의 원점에 있습니다. 여기서
안개를 `near = 1`, `far = 2`로 설정하면 정육면체가 중간부터 사라지기
시작하겠죠.

{{{example url="../threejs-fog.html" }}}

Let's add an interface so we can adjust the fog. Again we'll use
[dat.GUI](https://github.com/dataarts/dat.gui). dat.GUI takes
an object and a property and automagically makes an interface
for that type of property. We could just simply let it manipulate
the fog's `near` and `far` properties but it's invalid to have
`near` be greater than `far` so let's make a helper so dat.GUI
can manipulate a `near` and `far` property but we'll make sure `near`
is less than or equal to `far` and `far` is greater than or equal `near`.

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

We can then add it like this

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

The `near` and `far` parameters set the minimum and maximum values
for adjusting the fog. They are set when we setup the camera.

The `.listen()` at the end of the last 2 lines tells dat.GUI to *listen*
for changes. That way when we change `near` because of an edit to `far`
or we change `far` in response to an edit to `near` dat.GUI will update
the other property's UI for us.

It might also be nice to be able to change the fog color but like was
mentioned above we need to keep both the fog color and the background
color in sync. So, let's add another *virtual* property to our helper
that will set both colors when dat.GUI manipulates it.

dat.GUI can manipulate colors in 4 ways, as a CSS 6 digit hex string (eg: `#112233`). As an hue, saturation, value, object (eg: `{h: 60, s: 1, v: }`).
As an RGB array (eg: `[255, 128, 64]`). Or, as an RGBA array (eg: `[127, 200, 75, 0.3]`).

It's easiest for our purpose to use the hex string version since that way
dat.GUI is only manipulating a single value. Fortunately `THREE.Color`
as a [`getHexString`](Color.getHexString) method
we get use to easily get such a string, we just have to prepend a '#' to the front.

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

We then call `gui.addColor` to add a color UI for our helper's virtual property.

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

You can see setting `near` to like 1.9 and `far` to 2.0 gives
a very sharp transition between un-fogged and completely fogged.
where as `near` = 1.1 and `far` = 2.9 should just about be
the smoothest given our cubes are spinning 2 units away from the camera.

One last thing, there is a boolean [`fog`](Material.fog)
property on a material for whether or not objects rendered
with that material are affected by fog. It defaults to `true`
for most materials. As an example of why you might want
to turn the fog off, imagine you're making a 3D vehicle
simulator with a view from the driver's seat or cockpit.
You probably want the fog off for everything inside the vehicle when
viewing from inside the vehicle.

A better example might be a house
and thick fog outside house. Let's say the fog is set to start
2 meters away (near = 2) and completely fogged out at 4 meters (far = 4).
Rooms are longer than 2 meters and the house is probably longer
than 4 meters so you need to set the materials for the inside
of the house to not apply fog otherwise when standing inside the
house looking outside the wall at the far end of the room will look
like it's in the fog.

<div class="spread">
  <div>
    <div data-diagram="fogHouseAll" style="height: 300px;" class="border"></div>
    <div class="code">fog: true, all</div>
  </div>
</div>

Notice the walls and ceiling at the far end of the room are getting fog applied.
By turning fog off on the materials for the house we can fix that issue.

<div class="spread">
  <div>
    <div data-diagram="fogHouseInsideNoFog" style="height: 300px;" class="border"></div>
    <div class="code">fog: true, only outside materials</div>
  </div>
</div>

<canvas id="c"></canvas>
<script type="module" src="resources/threejs-fog.js"></script>
