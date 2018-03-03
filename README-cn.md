three.js
========

[![Latest NPM release][npm-badge]][npm-badge-url]
[![License][license-badge]][license-badge-url]
[![Dependencies][dependencies-badge]][dependencies-badge-url]
[![Dev Dependencies][devDependencies-badge]][devDependencies-badge-url]

#### JavaScript 3D library ####

项目的目标是创建一个易于使用的轻量级 3D 库。该库提供 &lt;canvas&gt;, &lt;svg&gt;, CSS3D 和 WebGL 渲染器。

[示例](http://threejs.org/examples/) &mdash;
[文档](http://threejs.org/docs/) &mdash;
[Wiki](https://github.com/mrdoob/three.js/wiki) &mdash;
[升级迁移](https://github.com/mrdoob/three.js/wiki/Migration-Guide) &mdash;
[问答](http://stackoverflow.com/questions/tagged/three.js) &mdash;
[论坛](https://discourse.threejs.org/) &mdash;
[Gitter](https://gitter.im/mrdoob/three.js) &mdash;
[Slack](https://threejs-slack.herokuapp.com/)

### 用法 ###

下载 [压缩版本 library](http://threejs.org/build/three.min.js) 并将其引入到 HTML 中，或者将其视为[模块](http://threejs.org/docs/#manual/introduction/Import-via-modules)安装和导入，
或者自行构建，请查看[如何自行构建 library](https://github.com/mrdoob/three.js/wiki/Build-instructions)。

```html
<script src="js/three.min.js"></script>
```

This code creates a scene, a camera, and a geometric cube, and it adds the cube to the scene. It then creates a `WebGL` renderer for the scene and camera, and it adds that viewport to the document.body element. Finally, it animates the cube within the scene for the camera.

```javascript
var camera, scene, renderer;
var geometry, material, mesh;

init();
animate();

function init() {

	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
	camera.position.z = 1;

	scene = new THREE.Scene();

	geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
	material = new THREE.MeshNormalMaterial();

	mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

}

function animate() {

	requestAnimationFrame( animate );

	mesh.rotation.x += 0.01;
	mesh.rotation.y += 0.02;

	renderer.render( scene, camera );

}
```

If everything went well you should see [this](https://jsfiddle.net/f2Lommf5/).

### Change log ###

[releases](https://github.com/mrdoob/three.js/releases)


[npm-badge]: https://img.shields.io/npm/v/three.svg
[npm-badge-url]: https://www.npmjs.com/package/three
[license-badge]: https://img.shields.io/npm/l/three.svg
[license-badge-url]: ./LICENSE
[dependencies-badge]: https://img.shields.io/david/mrdoob/three.js.svg
[dependencies-badge-url]: https://david-dm.org/mrdoob/three.js
[devDependencies-badge]: https://img.shields.io/david/dev/mrdoob/three.js.svg
[devDependencies-badge-url]: https://david-dm.org/mrdoob/three.js#info=devDependencies
