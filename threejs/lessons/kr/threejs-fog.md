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
생성한 뒤, 장면(scene)의 [`fog`](Scene.fog) 속성에 지정해 안개를 사용합니다.

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
    <div data-diagram="fogBlueBackgroundRed" style="height:300px" class="border"></div>
    <div class="code">파란 안개, 빨간 배경</div>
  </div>
  <div>
    <div data-diagram="fogBlueBackgroundBlue" style="height:300px" class="border"></div>
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

인터페이스를 추가해 안개를 조정할 수 있도록 하겠습니다. 이번에도 [dat.GUI](https://github.com/dataarts/dat.gui)를
사용할 거예요. dat.GUI는 객체와 객체의 속성 키값을 받아 자동으로 인터페이스를
생성합니다. 단순히 안개의 `near`와 `far` 제어하도록 설정할 수도 있지만, `near`값이
`far`값보다 큰 경우는 없기에 헬퍼를 만들어 `near`값을 항상 `far`보다 같거나
작게, `far`값을 항상 `near`보다 같거나 크게 설정하도록 하겠습니다.

```js
/**
 * 이 클래스의 인스턴스를 dat.GUI에 넘겨
 * near나 far 속성을 조정할 때 항상
 * near는 never >= far, far는 never <= near가 되도록 합니다
 **/
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

방금 만든 클래스를 아래처럼 활용합니다.

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

`near`와 `far` 인자는 각 안개 속성의 최솟값과 최댓값입니다.

마지막 2줄의 `.listen()` 메서드를 호출하면 dat.GUI가 변화를 *감지*합니다.
`near` 속성을 바꿀 때 동시에 `far` 속성을 재할당하고, `far` 속성을 바꿀 때도
동시에 `near`를 재할당하는데, 이 메서드를 호출하면 조작한 속성 외의 다른
속성의 변화도 UI에 업데이트됩니다.

여기에 안개의 색까지 조정할 수 있으면 금상첨화겠네요. 하지만 아까 설명했듯
안개의 색을 바꾸려면 배경색도 같이 바꿔야 합니다. 헬퍼 클래스에 *가상* 속성을
하나 만들어 dat.GUI가 이 속성을 변경할 때 배경색과 안개색을 같은 값으로
바꿔주면 어떨까요?

dat.GUI의 색상 타입은 4가지입니다. 하나는 CSS의 6자리 16진수 문자열(hex string, 예: `#f8f8f8`)이고,
하나는 hue(색상), saturation(채도), value 객체(예: `{ h: 60, s: 1, v: 0 }`),
하나는 RGB 배열(예: `[ 255, 128, 64 ]`) 또는 RGBA 색상 배열(예: `[ 127, 200, 75, 0.3 ]`)이죠.

`dat.GUI`가 하나의 값만 조작하도록 하는 게 제일 간단하니, 16진수 문자열을 사용하겠습니다.
다행히 `THREE.Color`에는 [`getHexString`](Color.getHexString) 메서드가 있어 색상을
문자열로 쉽게 바꿀 수 있죠. 앞에 '#'만 덧붙이면 됩니다.

```js
/**
 * 이 클래스의 인스턴스를 dat.GUI에 넘겨
 * near나 far 속성을 조정할 때 항상
 * near는 never >= far, far는 never <= near가 되도록 합니다
 **/
+// 또 dat.GUI가 color 속성을 조작할 때 안개와 배경색을 동시에 변경합니다
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

이번에는 `gui.addColor` 메서드를 호출합니다. 색상 UI를 생성하는 메서드로,
방금 추가한 가상 속성을 조작하도록 설정합니다.

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

`near`를 1.9 정도, `far`를 2.0 정도로 설정하면 안개의 경계가 굉장히
선명해질 겁니다. 정육면체들이 카메라에서 2칸 떨어져 있으므로 `near`를
1.1, `far`를 2.9 정도로 설정하면 경계가 가장 부드러운 것이라고 할 수
있죠.

추가로 재질(material)에는 불린 타입의 [`fog`](Material.fog) 속성이 있습니다.
해당 재질로 렌더링되는 물체가 안개의 영향을 받을지의 여부를 결정하는 속성이죠.
"안개 효과를 없애버리면 그만 아닌가?" 생각할 수 있지만, 3D 운전 시뮬레이터를
만드는 경우를 상상해봅시다. 차 밖은 안개가 자욱하더라도 차 안에서 볼 때 차 내부는
깔끔해야 할 수도 있죠.

안개가 짙은 날, 집 안에서 창 밖을 바라보는 장면이 더 와닿을지도 모르겠네요.
안개가 카메라로부터 2미터 이후부터 끼기 시작하고(near = 2), 4미터 이후에는
완전히 안개에 덮히도록(far = 4) 설정합니다. 방은 2미터이고, 집은 최소 4미터입니다.
여기서 집 안의 재질이 안개의 영향을 받도록 놔둔다면 방 끝에서 창 밖을 바라볼
때 방 안도 안개가 낀 것처럼 보이겠죠.

<div class="spread">
  <div>
    <div data-diagram="fogHouseAll" style="height: 300px;" class="border"></div>
    <div class="code">모든 재질의 fog: true</div>
  </div>
</div>

방 끝 쪽 천장과 벽에 안개가 낀 것이 보일 겁니다. 집 내부 재질의 fog 옵션을 끄면
안개를 없앨 수 있죠.

<div class="spread">
  <div>
    <div data-diagram="fogHouseInsideNoFog" style="height: 300px;" class="border"></div>
    <div class="code">집 밖 물체의 재질만 fog: true</div>
  </div>
</div>

<canvas id="c"></canvas>
<script type="module" src="../resources/threejs-fog.js"></script>
