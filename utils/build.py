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
'materials/MeshShaderMaterial.js',
'materials/ParticleBasicMaterial.js',
'materials/ParticleCircleMaterial.js',
'materials/ParticleDOMMaterial.js',
'materials/Texture.js',
'materials/mappings/CubeReflectionMapping.js',
'materials/mappings/CubeRefractionMapping.js',
'materials/mappings/LatitudeReflectionMapping.js',
'materials/mappings/LatitudeRefractionMapping.js',
'materials/mappings/SphericalReflectionMapping.js',
'materials/mappings/SphericalRefractionMapping.js',
'materials/mappings/UVMapping.js',
'scenes/Scene.js',
'scenes/Fog.js',
'renderers/Projector.js',
'renderers/DOMRenderer.js',
'renderers/CanvasRenderer.js',
'renderers/SVGRenderer.js',
'renderers/WebGLRenderer.js',
'renderers/renderables/RenderableObject.js',
'renderers/renderables/RenderableFace3.js',
'renderers/renderables/RenderableParticle.js',
'renderers/renderables/RenderableLine.js'
]

EXTRAS_FILES = [
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

DOM_FILES = [
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

SVG_FILES = [
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
'renderers/renderables/RenderableObject.js',
'renderers/renderables/RenderableFace3.js',
'renderers/renderables/RenderableParticle.js',
'renderers/renderables/RenderableLine.js'
]

CANVAS_FILES = [
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
'materials/Texture.js',
'materials/mappings/CubeReflectionMapping.js',
'materials/mappings/CubeRefractionMapping.js',
'materials/mappings/LatitudeReflectionMapping.js',
'materials/mappings/LatitudeRefractionMapping.js',
'materials/mappings/SphericalReflectionMapping.js',
'materials/mappings/SphericalRefractionMapping.js',
'materials/mappings/UVMapping.js',
'scenes/Scene.js',
'renderers/Projector.js',
'renderers/CanvasRenderer.js',
'renderers/renderables/RenderableObject.js',
'renderers/renderables/RenderableFace3.js',
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
'materials/MeshShaderMaterial.js',
'materials/ParticleBasicMaterial.js',
'materials/ParticleCircleMaterial.js',
'materials/Texture.js',
'materials/mappings/CubeReflectionMapping.js',
'materials/mappings/CubeRefractionMapping.js',
'materials/mappings/LatitudeReflectionMapping.js',
'materials/mappings/LatitudeRefractionMapping.js',
'materials/mappings/SphericalReflectionMapping.js',
'materials/mappings/SphericalRefractionMapping.js',
'materials/mappings/UVMapping.js',
'scenes/Scene.js',
'scenes/Fog.js',
'renderers/WebGLRenderer.js',
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


def buildLib(files, debug, outputFilename):

	text = merge(files)

	if debug:
		text = makeDebug(text)
		outputFilename = outputFilename + 'Debug'

	outputFilename = outputFilename + '.js'

	print "=" * 40
	print "Compiling", outputFilename
	print "=" * 40

	output(addHeader(compress(text), outputFilename), outputFilename)


def buildIncludes(files, outputFilename):

	template = '\t\t<script type="text/javascript" src="../src/%s"></script>'
	text = "\n".join(template % f for f in files)

	output(text, outputFilename + '.js')


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

	config = [
	['Three', 	  	'includes_common', COMMON_FILES, args.common],
	['ThreeCanvas', 'includes_canvas', CANVAS_FILES, args.canvas],
	['ThreeWebGL',  'includes_webgl',  WEBGL_FILES,  args.webgl],
	['ThreeSVG', 	'includes_svg',    SVG_FILES,    args.svg],
	['ThreeDOM', 	'includes_dom',    DOM_FILES,    args.dom],
	['ThreeExtras', 'includes_extras', COMMON_FILES + EXTRAS_FILES, args.extras]
	]

	for fname_lib, fname_inc, files, enabled in config:
		if enabled or args.all:
			buildLib(files, debug, fname_lib)
			if args.includes:
				buildIncludes(files, fname_inc)

if __name__ == "__main__":
	main()

