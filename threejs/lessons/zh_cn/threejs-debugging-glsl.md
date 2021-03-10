Title: 在Three.js中调试GLSL
Description: 如何在THREE.JS中调试着色器
TOC: 调试着色器

这个网站不会教你GLSL本身就像它不会教你JavaScript一样。这些真的是很大的话题。如果您想学习 GLSL，可以考虑查看[这些文章](https://webglfundamentals.org)作为起点。

如果您已经了解 GLSL，那么这里有一些调试技巧。

当我正在写一个新的 GLSL 着色器并且什么都没有出现的时候，一般情况下，我做的第一件事是改变片段着色器返回一个纯色。
例如，在着色器的最底部，我可以把

```glsl
void main() {

  ...

  gl_FragColor = vec4(1, 0, 0, 1);  // red
}
```

如果我看到我试图绘制的对象，那么我就知道这个问题与我的片段着色器有关。
它可能是任何不好的纹理，未初始化的uniforms变量，有错误值的uniforms变量，但至少我有一个方向去检查。

为了测试其中的一些点，我可能会开始尝试绘制一些输入。例如，如果我在片段着色器中使用常量，那么我可以添加

```glsl
gl_FragColor = vec4(vNormal * 0.5 + 0.5, 1);
```

常量从 -1到 + 1，所以乘以0.5，再加上0.5，我们得到的值从0.0到1.0，这使得它们对颜色很有用。

尝试一些你知道会生效的然后你就会开始知道改变某个常量它应该是什么样子的。如果你改变的常量看起来和正常情况不太一样，你就有线索去排查了。如果你正在操作片段着色器中的常量，你可以使用同样的技术来绘制操作的结果。

<div class="threejs_center"><img src="resources/images/standard-primitive-normals.jpg" style="width: 650px;"></div>

类似的，如果我们使用纹理，会有纹理坐标，我们可以用类似的东西来绘制它们

```glsl
gl_FragColor = vec4(fract(vUv), 0, 1);
```

如果我们使用的纹理坐标超出了0到1的范围，那么问题就在`fract`那里。 如果 texture.repeat 设置为大于1的值，这种情况很常见。

<div class="threejs_center"><img src="resources/images/standard-primitive-uvs.jpg" style="width: 650px;"></div>

你可以在片段着色器中对所有的值做类似的事情。弄清楚它们的范围可能是什么，添加一些代码来设置 gl _ fragcolor，该范围可从0.0到1.0。

若要检查纹理，请尝试使用你知道有效的CanvasTexture 或 DataTexture。

相反，如果设置 gl _ fragcolor 为红色后，我仍然看不到任何东西，那么我有一个提示，我的问题可能是在与顶点着色器相关的东西的方向上。某些矩阵可能是错误的，或者我的属性可能有错误的数据，或者设置不正确。

我会先看一下矩阵。我可能会在调用 `renderer.render(scene, camera)`之后立即设置一个断点，然后开始在检查面板中展开内容。
相机的`world matrix`和投影矩阵是不是`NaN`？扩展场景并观察它的`children`，我会检查坐标系矩阵看起来是否合理(没有 NaN) ，
每个矩阵的最后4个值对于我的场景来说是否合理。如果我期望我的场景是50x50x50单位，而一些矩阵显示552352623.123显然有问题。

<div class="threejs_center"><img src="resources/images/inspect-matrices.gif"></div>

就像我们为片段着色器所做的一样，我们也可以通过将顶点着色器的值传递给片段着色器来绘制这些值。
在它们上都定义一个变量，并传递那个你也不知道正确与否的值。实际上如果我的着色器使用正在被使用的常量，
我会像上面提到的那样改变片段着色器来显示它们。然后将 `vNormal` 设置为我想要显示的值，但是将其缩小，
这样值就在0.0~1.0的范围内。
然后我看看结果，看看它们是否符合我的期望。

另一个好办法是使用更简单的着色器。你能用 MeshBasicMaterial 绘制你的数据吗？
如果你可以，尝试它，并确保它显示如预期。

如果顶点着色器没有简单到让你可视化你的结构，通常先和下面这个一样简单

```glsl
gl_Position = projection * modelView * vec4(position.xyz, 1);
```

如果这样做有效，那就每次都添加一小点改变。

你也可以使用[Shader Editor extension for Chrome](https://chrome.google.com/webstore/detail/shader-editor/ggeaidddejpbakgafapihjbgdlbbbpob?hl=en)或者在其他浏览器中使用类似的工具。
这是一个观察其他着色器如何工作的好方法。改动一些代码来实时查看变化也是一个非常好的办法。

