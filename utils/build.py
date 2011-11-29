#!/usr/bin/env python

try:
	import argparse
	ap = 1
except ImportError:
	import optparse
	ap = 0

import os
import tempfile
import sys

COMMON_FILES = [
'Three.js',
'core/Clock.js',
'core/Color.js',
'core/Vector2.js',
'core/Vector3.js',
'core/Vector4.js',
'core/Ray.js',
'core/Rectangle.js',
'core/Math.js',
'core/Matrix3.js',
'core/Matrix4.js',
'core/Object3D.js',
'core/Projector.js',
'core/Quaternion.js',
'core/Vertex.js',
'core/Face3.js',
'core/Face4.js',
'core/UV.js',
'core/Geometry.js',
'core/Spline.js',
'core/Edge.js',
'cameras/Camera.js',
'cameras/OrthographicCamera.js',
'cameras/PerspectiveCamera.js',
'lights/Light.js',
'lights/AmbientLight.js',
'lights/DirectionalLight.js',
'lights/PointLight.js',
'lights/SpotLight.js',
'materials/Material.js',
'materials/LineBasicMaterial.js',
'materials/MeshBasicMaterial.js',
'materials/MeshLambertMaterial.js',
'materials/MeshPhongMaterial.js',
'materials/MeshDepthMaterial.js',
'materials/MeshNormalMaterial.js',
'materials/MeshFaceMaterial.js',
'materials/MeshShaderMaterial.js',
'materials/ParticleBasicMaterial.js',
'materials/ParticleCanvasMaterial.js',
'materials/ParticleDOMMaterial.js',
'materials/ShaderMaterial.js',
'textures/Texture.js',
'textures/DataTexture.js',
'objects/Particle.js',
'objects/ParticleSystem.js',
'objects/Line.js',
'objects/Mesh.js',
'objects/Bone.js',
'objects/SkinnedMesh.js',
'objects/MorphAnimMesh.js',
'objects/Ribbon.js',
'objects/LOD.js',
'objects/Sprite.js',
'scenes/Scene.js',
'scenes/Fog.js',
'scenes/FogExp2.js',
'renderers/DOMRenderer.js',
'renderers/CanvasRenderer.js',
'renderers/SVGRenderer.js',
'renderers/WebGLShaders.js',
'renderers/WebGLRenderer.js',
'renderers/WebGLRenderTarget.js',
'renderers/WebGLRenderTargetCube.js',
'renderers/renderables/RenderableVertex.js',
'renderers/renderables/RenderableFace3.js',
'renderers/renderables/RenderableFace4.js',
'renderers/renderables/RenderableObject.js',
'renderers/renderables/RenderableParticle.js',
'renderers/renderables/RenderableLine.js'
]

EXTRAS_FILES = [
'extras/ColorUtils.js',
'extras/GeometryUtils.js',
'extras/ImageUtils.js',
'extras/SceneUtils.js',
'extras/ShaderUtils.js',
'extras/core/Curve.js',
'extras/core/CurvePath.js',
'extras/core/Path.js',
'extras/core/Shape.js',
'extras/core/TextPath.js',
'extras/animation/AnimationHandler.js',
'extras/animation/Animation.js',
'extras/cameras/CubeCamera.js',
'extras/cameras/FirstPersonCamera.js',
'extras/cameras/PathCamera.js',
'extras/cameras/FlyCamera.js',
'extras/cameras/RollCamera.js',
'extras/cameras/TrackballCamera.js',
'extras/cameras/CombinedCamera.js',
'extras/controls/FirstPersonControls.js',
'extras/controls/PathControls.js',
'extras/controls/FlyControls.js',
'extras/controls/RollControls.js',
'extras/controls/TrackballControls.js',
'extras/geometries/CubeGeometry.js',
'extras/geometries/CylinderGeometry.js',
'extras/geometries/ExtrudeGeometry.js',
'extras/geometries/IcosahedronGeometry.js',
'extras/geometries/LatheGeometry.js',
'extras/geometries/OctahedronGeometry.js',
'extras/geometries/PlaneGeometry.js',
'extras/geometries/SphereGeometry.js',
'extras/geometries/TextGeometry.js',
'extras/geometries/TorusGeometry.js',
'extras/geometries/TorusKnotGeometry.js',
'extras/modifiers/SubdivisionModifier.js',
'extras/loaders/Loader.js',
'extras/loaders/BinaryLoader.js',
'extras/loaders/ColladaLoader.js',
'extras/loaders/JSONLoader.js',
'extras/loaders/SceneLoader.js',
'extras/loaders/UTF8Loader.js',
'extras/objects/Axes.js',
'extras/objects/MarchingCubes.js',
'extras/renderers/AnaglyphWebGLRenderer.js',
'extras/renderers/CrosseyedWebGLRenderer.js'
]

CANVAS_FILES = [
'Three.js',
'core/Color.js',
'core/Vector2.js',
'core/Vector3.js',
'core/Vector4.js',
'core/Ray.js',
'core/Rectangle.js',
'core/Math.js',
'core/Matrix3.js',
'core/Matrix4.js',
'core/Object3D.js',
'core/Projector.js',
'core/Quaternion.js',
'core/Vertex.js',
'core/Face3.js',
'core/Face4.js',
'core/UV.js',
'core/Geometry.js',
'cameras/Camera.js',
'cameras/OrthographicCamera.js',
'cameras/PerspectiveCamera.js',
'lights/Light.js',
'lights/AmbientLight.js',
'lights/DirectionalLight.js',
'lights/PointLight.js',
'materials/Material.js',
'materials/LineBasicMaterial.js',
'materials/MeshBasicMaterial.js',
'materials/MeshLambertMaterial.js',
'materials/MeshPhongMaterial.js',
'materials/MeshDepthMaterial.js',
'materials/MeshNormalMaterial.js',
'materials/MeshFaceMaterial.js',
'materials/ParticleBasicMaterial.js',
'materials/ParticleCanvasMaterial.js',
'textures/Texture.js',
'objects/Particle.js',
'objects/Line.js',
'objects/Mesh.js',
'objects/Bone.js',
'objects/Sprite.js',
'scenes/Scene.js',
'renderers/CanvasRenderer.js',
'renderers/renderables/RenderableVertex.js',
'renderers/renderables/RenderableFace3.js',
'renderers/renderables/RenderableFace4.js',
'renderers/renderables/RenderableObject.js',
'renderers/renderables/RenderableParticle.js',
'renderers/renderables/RenderableLine.js'
]

DOM_FILES = [
'Three.js',
'core/Color.js',
'core/Vector2.js',
'core/Vector3.js',
'core/Vector4.js',
'core/Ray.js',
'core/Rectangle.js',
'core/Math.js',
'core/Matrix3.js',
'core/Matrix4.js',
'core/Object3D.js',
'core/Projector.js',
'core/Quaternion.js',
'core/Vertex.js',
'core/Face3.js',
'core/Face4.js',
'core/UV.js',
'cameras/Camera.js',
'cameras/OrthographicCamera.js',
'cameras/PerspectiveCamera.js',
'materials/ParticleDOMMaterial.js',
'objects/Particle.js',
'objects/Bone.js',
'objects/Sprite.js',
'scenes/Scene.js',
'renderers/DOMRenderer.js',
'renderers/renderables/RenderableParticle.js'
]

SVG_FILES = [
'Three.js',
'core/Color.js',
'core/Vector2.js',
'core/Vector3.js',
'core/Vector4.js',
'core/Ray.js',
'core/Rectangle.js',
'core/Math.js',
'core/Matrix3.js',
'core/Matrix4.js',
'core/Object3D.js',
'core/Projector.js',
'core/Quaternion.js',
'core/Vertex.js',
'core/Face3.js',
'core/Face4.js',
'core/UV.js',
'core/Geometry.js',
'cameras/Camera.js',
'cameras/OrthographicCamera.js',
'cameras/PerspectiveCamera.js',
'lights/Light.js',
'lights/AmbientLight.js',
'lights/DirectionalLight.js',
'lights/PointLight.js',
'materials/Material.js',
'materials/LineBasicMaterial.js',
'materials/MeshBasicMaterial.js',
'materials/MeshLambertMaterial.js',
'materials/MeshPhongMaterial.js',
'materials/MeshDepthMaterial.js',
'materials/MeshNormalMaterial.js',
'materials/MeshFaceMaterial.js',
'materials/ParticleBasicMaterial.js',
'objects/Particle.js',
'objects/Line.js',
'objects/Mesh.js',
'objects/Bone.js',
'objects/Sprite.js',
'scenes/Scene.js',
'renderers/SVGRenderer.js',
'renderers/renderables/RenderableVertex.js',
'renderers/renderables/RenderableFace3.js',
'renderers/renderables/RenderableFace4.js',
'renderers/renderables/RenderableObject.js',
'renderers/renderables/RenderableParticle.js',
'renderers/renderables/RenderableLine.js'
]

WEBGL_FILES = [
'Three.js',
'core/Color.js',
'core/Vector2.js',
'core/Vector3.js',
'core/Vector4.js',
'core/Ray.js',
'core/Rectangle.js',
'core/Math.js',
'core/Matrix3.js',
'core/Matrix4.js',
'core/Object3D.js',
'core/Projector.js',
'core/Quaternion.js',
'core/Vertex.js',
'core/Face3.js',
'core/Face4.js',
'core/UV.js',
'core/Geometry.js',
'core/Spline.js',
'core/Edge.js',
'cameras/Camera.js',
'cameras/OrthographicCamera.js',
'cameras/PerspectiveCamera.js',
'lights/Light.js',
'lights/AmbientLight.js',
'lights/DirectionalLight.js',
'lights/PointLight.js',
'lights/SpotLight.js',
'materials/Material.js',
'materials/LineBasicMaterial.js',
'materials/MeshBasicMaterial.js',
'materials/MeshLambertMaterial.js',
'materials/MeshPhongMaterial.js',
'materials/MeshDepthMaterial.js',
'materials/MeshNormalMaterial.js',
'materials/MeshFaceMaterial.js',
'materials/MeshShaderMaterial.js',
'materials/ParticleBasicMaterial.js',
'materials/ShaderMaterial.js',
'textures/Texture.js',
'textures/DataTexture.js',
'objects/Particle.js',
'objects/ParticleSystem.js',
'objects/Line.js',
'objects/Mesh.js',
'objects/Bone.js',
'objects/SkinnedMesh.js',
'objects/Ribbon.js',
'objects/LOD.js',
'objects/Sprite.js',
'scenes/Scene.js',
'scenes/Fog.js',
'scenes/FogExp2.js',
'renderers/WebGLShaders.js',
'renderers/WebGLRenderer.js',
'renderers/WebGLRenderTarget.js',
'renderers/WebGLRenderTargetCube.js'
]

def merge(files):

	buffer = []

	for filename in files:
		with open(os.path.join('..', 'src', filename), 'r') as f:
			buffer.append(f.read())

	return "".join(buffer)


def output(text, filename):

	with open(os.path.join('..', 'build', filename), 'w') as f:
		f.write(text)


def compress(text):

	in_tuple = tempfile.mkstemp()
	with os.fdopen(in_tuple[0], 'w') as handle:
		handle.write(text)

	out_tuple = tempfile.mkstemp()

	os.system("java -jar compiler/compiler.jar --language_in=ECMASCRIPT5_STRICT --js %s --js_output_file %s" % (in_tuple[1], out_tuple[1]))

	with os.fdopen(out_tuple[0], 'r') as handle:
		compressed = handle.read()

	os.unlink(in_tuple[1])
	os.unlink(out_tuple[1])

	return compressed


def addHeader(text, endFilename):
	with open(os.path.join('..', 'REVISION'), 'r') as handle:
		revision = handle.read().rstrip()

	return ("// %s r%s - http://github.com/mrdoob/three.js\n" % (endFilename, revision)) + text


def makeDebug(text):
	position = 0
	while True:
		position = text.find("/* DEBUG", position)
		if position == -1:
			break
		text = text[0:position] + text[position+8:]
		position = text.find("*/", position)
		text = text[0:position] + text[position+2:]
	return text


def buildLib(files, debug, minified, filename):

	text = merge(files)

	if debug:
		text = makeDebug(text)
		filename = filename + 'Debug'

	if filename == "Three":
		folder = ''
	else:
		folder = 'custom/'

	filename = filename + '.js'

	print "=" * 40
	print "Compiling", filename
	print "=" * 40

	if minified:
		text = compress(text)

	output(addHeader(text, filename), folder + filename)


def buildIncludes(files, filename):

	template = '\t\t<script type="text/javascript" src="../src/%s"></script>'
	text = "\n".join(template % f for f in files)

	output(text, filename + '.js')


def parse_args():

	if ap:
		parser = argparse.ArgumentParser(description='Build and compress Three.js')
		parser.add_argument('--includes', help='Build includes.js', action='store_true')
		parser.add_argument('--common', help='Build Three.js', action='store_const', const=True)
		parser.add_argument('--extras', help='Build ThreeExtras.js', action='store_const', const=True)
		parser.add_argument('--canvas', help='Build ThreeCanvas.js', action='store_true')
		parser.add_argument('--webgl', help='Build ThreeWebGL.js', action='store_true')
		parser.add_argument('--svg', help='Build ThreeSVG.js', action='store_true')
		parser.add_argument('--dom', help='Build ThreeDOM.js', action='store_true')
		parser.add_argument('--debug', help='Generate debug versions', action='store_const', const=True, default=False)
		parser.add_argument('--minified', help='Generate minified versions', action='store_const', const=True, default=False)
		parser.add_argument('--all', help='Build all Three.js versions', action='store_true')

		args = parser.parse_args()

	else:
		parser = optparse.OptionParser(description='Build and compress Three.js')
		parser.add_option('--includes', dest='includes', help='Build includes.js', action='store_true')
		parser.add_option('--common', dest='common', help='Build Three.js', action='store_const', const=True)
		parser.add_option('--extras', dest='extras', help='Build ThreeExtras.js', action='store_const', const=True)
		parser.add_option('--canvas', dest='canvas', help='Build ThreeCanvas.js', action='store_true')
		parser.add_option('--webgl', dest='webgl', help='Build ThreeWebGL.js', action='store_true')
		parser.add_option('--svg', dest='svg', help='Build ThreeSVG.js', action='store_true')
		parser.add_option('--dom', dest='dom', help='Build ThreeDOM.js', action='store_true')
		parser.add_option('--debug', dest='debug', help='Generate debug versions', action='store_const', const=True, default=False)
		parser.add_option('--minified', help='Generate minified versions', action='store_const', const=True, default=False)
		parser.add_option('--all', dest='all', help='Build all Three.js versions', action='store_true')

		args, remainder = parser.parse_args()

	# If no arguments have been passed, show the help message and exit
	if len(sys.argv) == 1:
		parser.print_help()
		sys.exit(1)

	return args


def main(argv=None):

	args = parse_args()
	debug = args.debug
	minified = args.minified

	config = [
	['Three', 'includes', COMMON_FILES + EXTRAS_FILES, args.common],
	['ThreeCanvas', 'includes_canvas', CANVAS_FILES, args.canvas],
	['ThreeDOM', 'includes_dom', DOM_FILES, args.dom],
	['ThreeSVG', 'includes_svg', SVG_FILES, args.svg],
	['ThreeWebGL', 'includes_webgl', WEBGL_FILES, args.webgl],
	['ThreeExtras', 'includes_extras', EXTRAS_FILES, args.extras]
	]

	for fname_lib, fname_inc, files, enabled in config:
		if enabled or args.all:
			buildLib(files, debug, minified, fname_lib)
			if args.includes:
				buildIncludes(files, fname_inc)

if __name__ == "__main__":
	main()

