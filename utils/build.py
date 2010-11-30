#!/usr/bin/env python

try:
	import argparse
	ap = 1
except ImportError:
	import optparse
	ap = 0

import os
import tempfile


def merge(files):

	text = ""

	for filename in files:
		with open(os.path.join('..', 'src', filename), 'r') as f:
			text = text + f.read()

	return text


def output(text, filename):

	with open(os.path.join('..', 'build', filename), 'w') as f:
		f.write(text)


def compress(text):

	in_tuple = tempfile.mkstemp()
	with os.fdopen(in_tuple[0], 'w') as handle:
		handle.write(text)

	out_tuple = tempfile.mkstemp()
	# os.system("java -jar yuicompressor-2.4.2.jar %s --type js -o %s --charset utf-8 -v" % (in_tuple[1], out_tuple[1]))
	os.system("java -jar compiler.jar --js %s --js_output_file %s" % (in_tuple[1], out_tuple[1]))

	with os.fdopen(out_tuple[0], 'r') as handle:
		compressed = handle.read()

	os.unlink(in_tuple[1])
	os.unlink(out_tuple[1])

	return compressed


def addHeader(text, endFilename):
	with open(os.path.join('.', 'REVISION'), 'r') as handle:
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


def build(files, debug, outputFilename):

	text = merge(files)

	if debug:
		text = makeDebug(text)
		outputFilename = outputFilename + 'Debug'

	outputFilename = outputFilename + '.js'

	print "=" * 40
	print "Compiling", outputFilename
	print "=" * 40

	output(addHeader(compress(text), outputFilename), outputFilename)


def buildExtras(debug):
	files = [
		'Three.js',
		'core/Color.js',
		'core/Vector2.js',
		'core/Vector3.js',
		'core/Vector4.js',
		'core/Ray.js',
		'core/Rectangle.js',
		'core/Matrix3.js',
		'core/Matrix4.js',
		'core/Vertex.js',
		'core/Face3.js',
		'core/Face4.js',
		'core/UV.js',
		'core/Geometry.js',
		'cameras/Camera.js',
		'lights/Light.js',
		'lights/AmbientLight.js',
		'lights/DirectionalLight.js',
		'lights/PointLight.js',
		'objects/Object3D.js',
		'objects/Particle.js',
		'objects/Line.js',
		'objects/Mesh.js',
		'materials/Material.js',
		'materials/LineBasicMaterial.js',
		'materials/MeshBasicMaterial.js',
		'materials/MeshLambertMaterial.js',
		'materials/MeshPhongMaterial.js',
		'materials/MeshDepthMaterial.js',
		'materials/MeshNormalMaterial.js',
		'materials/MeshFaceMaterial.js',
		'materials/MeshCubeMaterial.js',
		'materials/MeshShaderMaterial.js',
		'materials/ParticleBasicMaterial.js',
		'materials/ParticleCircleMaterial.js',
		'materials/ParticleDOMMaterial.js',
		'materials/textures/Texture.js',
		'materials/textures/TextureCube.js',
		'scenes/Scene.js',
		'renderers/Projector.js',
		'renderers/DOMRenderer.js',
		'renderers/CanvasRenderer.js',
		'renderers/SVGRenderer.js',
		'renderers/WebGLRenderer.js',
		'renderers/renderables/RenderableFace3.js',
		'renderers/renderables/RenderableParticle.js',
		'renderers/renderables/RenderableLine.js',
		'extras/GeometryUtils.js',
		'extras/ImageUtils.js',
		'extras/SceneUtils.js',
		'extras/ShaderUtils.js',
		'extras/primitives/Cube.js',
		'extras/primitives/Cylinder.js',
		'extras/primitives/Plane.js',
		'extras/primitives/Sphere.js',
		'extras/io/Loader.js'
	]

	build(files, debug, 'ThreeExtras')

def buildFull(debug):
	files = [
		'Three.js',
		'core/Color.js',
		'core/Vector2.js',
		'core/Vector3.js',
		'core/Vector4.js',
		'core/Ray.js',
		'core/Rectangle.js',
		'core/Matrix3.js',
		'core/Matrix4.js',
		'core/Vertex.js',
		'core/Face3.js',
		'core/Face4.js',
		'core/UV.js',
		'core/Geometry.js',
		'cameras/Camera.js',
		'lights/Light.js',
		'lights/AmbientLight.js',
		'lights/DirectionalLight.js',
		'lights/PointLight.js',
		'objects/Object3D.js',
		'objects/Particle.js',
		'objects/Line.js',
		'objects/Mesh.js',
		'materials/Material.js',
		'materials/LineBasicMaterial.js',
		'materials/MeshBasicMaterial.js',
		'materials/MeshLambertMaterial.js',
		'materials/MeshPhongMaterial.js',
		'materials/MeshDepthMaterial.js',
		'materials/MeshNormalMaterial.js',
		'materials/MeshFaceMaterial.js',
		'materials/MeshCubeMaterial.js',
		'materials/MeshShaderMaterial.js',
		'materials/ParticleBasicMaterial.js',
		'materials/ParticleCircleMaterial.js',
		'materials/ParticleDOMMaterial.js',
		'materials/textures/Texture.js',
		'materials/textures/TextureCube.js',
		'scenes/Scene.js',
		'renderers/Projector.js',
		'renderers/DOMRenderer.js',
		'renderers/CanvasRenderer.js',
		'renderers/SVGRenderer.js',
		'renderers/WebGLRenderer.js',
		'renderers/renderables/RenderableFace3.js',
		'renderers/renderables/RenderableParticle.js',
		'renderers/renderables/RenderableLine.js'
	]

	build(files, debug, 'Three')


def buildCanvas(debug):

	files = [
		'Three.js',
		'core/Color.js',
		'core/Vector2.js',
		'core/Vector3.js',
		'core/Vector4.js',
		'core/Ray.js',
		'core/Rectangle.js',
		'core/Matrix3.js',
		'core/Matrix4.js',
		'core/Vertex.js',
		'core/Face3.js',
		'core/Face4.js',
		'core/UV.js',
		'core/Geometry.js',
		'cameras/Camera.js',
		'lights/Light.js',
		'lights/AmbientLight.js',
		'lights/DirectionalLight.js',
		'lights/PointLight.js',
		'objects/Object3D.js',
		'objects/Particle.js',
		'objects/Line.js',
		'objects/Mesh.js',
		'materials/Material.js',
		'materials/LineBasicMaterial.js',
		'materials/MeshBasicMaterial.js',
		'materials/MeshLambertMaterial.js',
		'materials/MeshPhongMaterial.js',
		'materials/MeshDepthMaterial.js',
		'materials/MeshNormalMaterial.js',
		'materials/MeshFaceMaterial.js',
		'materials/ParticleBasicMaterial.js',
		'materials/ParticleCircleMaterial.js',
		'materials/textures/Texture.js',
		'scenes/Scene.js',
		'renderers/Projector.js',
		'renderers/CanvasRenderer.js',
		'renderers/renderables/RenderableFace3.js',
		'renderers/renderables/RenderableParticle.js',
		'renderers/renderables/RenderableLine.js'
	]

	build(files, debug, 'ThreeCanvas')


def buildWebGL(debug):

	files = [
		'Three.js',
		'core/Color.js',
		'core/Vector2.js',
		'core/Vector3.js',
		'core/Vector4.js',
		'core/Ray.js',
		'core/Rectangle.js',
		'core/Matrix3.js',
		'core/Matrix4.js',
		'core/Vertex.js',
		'core/Face3.js',
		'core/Face4.js',
		'core/UV.js',
		'core/Geometry.js',
		'cameras/Camera.js',
		'lights/Light.js',
		'lights/AmbientLight.js',
		'lights/DirectionalLight.js',
		'lights/PointLight.js',
		'objects/Object3D.js',
		'objects/Particle.js',
		'objects/Line.js',
		'objects/Mesh.js',
		'materials/Material.js',
		'materials/LineBasicMaterial.js',
		'materials/MeshBasicMaterial.js',
		'materials/MeshLambertMaterial.js',
		'materials/MeshPhongMaterial.js',
		'materials/MeshDepthMaterial.js',
		'materials/MeshNormalMaterial.js',
		'materials/MeshFaceMaterial.js',
		'materials/MeshCubeMaterial.js',
		'materials/MeshShaderMaterial.js',
		'materials/ParticleBasicMaterial.js',
		'materials/ParticleCircleMaterial.js',
		'materials/textures/Texture.js',
		'materials/textures/TextureCube.js',
		'scenes/Scene.js',
		'renderers/WebGLRenderer.js',
	]

	build(files, debug, 'ThreeWebGL')


def buildSVG(debug):

	files = [
		'Three.js',
		'core/Color.js',
		'core/Vector2.js',
		'core/Vector3.js',
		'core/Vector4.js',
		'core/Ray.js',
		'core/Rectangle.js',
		'core/Matrix3.js',
		'core/Matrix4.js',
		'core/Vertex.js',
		'core/Face3.js',
		'core/Face4.js',
		'core/UV.js',
		'core/Geometry.js',
		'cameras/Camera.js',
		'lights/Light.js',
		'lights/AmbientLight.js',
		'lights/DirectionalLight.js',
		'lights/PointLight.js',
		'objects/Object3D.js',
		'objects/Particle.js',
		'objects/Line.js',
		'objects/Mesh.js',
		'materials/Material.js',
		'materials/LineBasicMaterial.js',
		'materials/MeshBasicMaterial.js',
		'materials/MeshLambertMaterial.js',
		'materials/MeshPhongMaterial.js',
		'materials/MeshDepthMaterial.js',
		'materials/MeshNormalMaterial.js',
		'materials/MeshFaceMaterial.js',
		'materials/ParticleBasicMaterial.js',
		'materials/ParticleCircleMaterial.js',
		'scenes/Scene.js',
		'renderers/Projector.js',
		'renderers/SVGRenderer.js',
		'renderers/renderables/RenderableFace3.js',
		'renderers/renderables/RenderableParticle.js',
		'renderers/renderables/RenderableLine.js'
	]

	build(files, debug, 'ThreeSVG')


def buildDOM(debug):

	files = [
		'Three.js',
		'core/Color.js',
		'core/Vector2.js',
		'core/Vector3.js',
		'core/Vector4.js',
		'core/Ray.js',
		'core/Rectangle.js',
		'core/Matrix3.js',
		'core/Matrix4.js',
		'core/Vertex.js',
		'core/Face3.js',
		'core/Face4.js',
		'core/UV.js',
		'cameras/Camera.js',
		'objects/Object3D.js',
		'objects/Particle.js',
		'materials/ParticleDOMMaterial.js',
		'scenes/Scene.js',
		'renderers/Projector.js',
		'renderers/DOMRenderer.js',
		'renderers/renderables/RenderableParticle.js',
	]

	build(files, debug, 'ThreeDOM')


def parse_args():

	if ap:
		parser = argparse.ArgumentParser(description='Build and compress Three.js')
		parser.add_argument('--extras', help='Build ThreeExtras.js', action='store_const', const=True)
		parser.add_argument('--full', help='Build Three.js', action='store_const', const=True)
		parser.add_argument('--canvas', help='Build ThreeCanvas.js', action='store_true')
		parser.add_argument('--webgl', help='Build ThreeWebGL.js', action='store_true')
		parser.add_argument('--svg', help='Build ThreeSVG.js', action='store_true')
		parser.add_argument('--dom', help='Build ThreeDOM.js', action='store_true')
		parser.add_argument('--debug', help='Generate debug versions', action='store_const', const=True, default=False)
		parser.add_argument('--all', help='Build all Three.js versions', action='store_true')

		args = parser.parse_args()

	else:
		parser = optparse.OptionParser(description='Build and compress Three.js')
		parser.add_option('--extras', dest='extras', help='Build ThreeExtras.js', action='store_const', const=True)
		parser.add_option('--full', dest='full', help='Build Three.js', action='store_const', const=True)
		parser.add_option('--canvas', dest='canvas', help='Build ThreeCanvas.js', action='store_true')
		parser.add_option('--webgl', dest='webgl', help='Build ThreeWebGL.js', action='store_true')
		parser.add_option('--svg', dest='svg', help='Build ThreeSVG.js', action='store_true')
		parser.add_option('--dom', dest='dom', help='Build ThreeDOM.js', action='store_true')
		parser.add_option('--debug', dest='debug', help='Generate debug versions', action='store_const', const=True, default=False)
		parser.add_option('--all', dest='all', help='Build all Three.js versions', action='store_true')

		args, remainder = parser.parse_args()

	return args


def main(argv=None):

	args = parse_args()

	debug = args.debug

	if args.full or args.all:
		buildFull(debug)

	if args.extras:
		buildExtras(debug)

	if args.canvas or args.all:
		buildCanvas(debug)

	if args.webgl or args.all:
		buildWebGL(debug)

	if args.svg or args.all:
		buildSVG(debug)

	if args.dom or args.all:
		buildDOM(debug)

if __name__ == "__main__":
	main()

