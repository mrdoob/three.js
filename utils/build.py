#!/usr/bin/env python

try:
    import argparse
    ap = 1
except ImportError:
    import optparse
    ap = 0
    
import os
import tempfile


FILES = {
    'core': ['Three.js', 'core/Color.js', 'core/Vector2.js', 'core/Vector3.js', 'core/Vector4.js', 'core/Ray.js', 'core/Rectangle.js', 'core/Matrix3.js', 'core/Matrix4.js', 'core/Vertex.js', 'core/Face3.js', 'core/Face4.js', 'core/UV.js', 'core/Geometry.js'],
    'cameras': ['cameras/Camera.js'],
    'io': ['io/Loader.js'],
    'lights': ['lights/Light.js', 'lights/AmbientLight.js', 'lights/DirectionalLight.js', 'lights/PointLight.js'],
    'objects': ['objects/Object3D.js', 'objects/Particle.js', 'objects/Line.js', 'objects/Mesh.js'],
    'materials': ['materials/LineColorMaterial.js', 'materials/MeshPhongMaterial.js', 'materials/MeshBitmapMaterial.js', 'materials/MeshColorFillMaterial.js', 'materials/MeshColorStrokeMaterial.js', 'materials/MeshFaceMaterial.js', 'materials/ParticleBitmapMaterial.js', 'materials/ParticleCircleMaterial.js', 'materials/ParticleDOMMaterial.js'],
    'scenes': ['scenes/Scene.js'],
    'projector': ['renderers/Projector.js'],
    'renderers': ['renderers/DOMRenderer.js', 'renderers/CanvasRenderer.js', 'renderers/SVGRenderer.js', 'renderers/WebGLRenderer.js'],
    'renderables': ['renderers/renderables/RenderableFace3.js', 'renderers/renderables/RenderableFace4.js', 'renderers/renderables/RenderableParticle.js', 'renderers/renderables/RenderableLine.js']
}


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
    os.system("java -jar yuicompressor-2.4.2.jar %s --type js -o %s --charset utf-8 -v" % (in_tuple[1], out_tuple[1]))

    with os.fdopen(out_tuple[0], 'r') as handle:
        compressed = handle.read()
    
    os.unlink(in_tuple[1])
    os.unlink(out_tuple[1])

    return compressed


def addHeader(text, endFilename):
    with open(os.path.join('.', 'REVISION'), 'r') as handle:
        revision = handle.read().rstrip()
    
    return ("// %s r%s - http://github.com/mrdoob/three.js\n" % (endFilename, revision)) + text


def getAllFiles():
    files = []
    for k in ['core', 'cameras', 'io', 'lights', 'objects', 'materials', 'scenes', 'projector', 'renderers', 'renderables']:
        files.extend(FILES[k])
    return files


def build(files, outputFilename):
    print "=" * 40
    print "Compiling", outputFilename
    print "=" * 40

    output(addHeader(compress(merge(files)), outputFilename), outputFilename)


def buildFull():
    build(getAllFiles(), 'Three.js')


def buildCanvas():

    files = getAllFiles()

    files.remove('materials/ParticleDOMMaterial.js')
    files.remove('renderers/DOMRenderer.js')
    files.remove('renderers/SVGRenderer.js')
    files.remove('renderers/WebGLRenderer.js')

    build(files, 'ThreeCanvas.js')


def buildWebGL():

    files = getAllFiles()

    files.remove('materials/ParticleDOMMaterial.js')
    files.remove('renderers/Projector.js')
    files.remove('renderers/DOMRenderer.js')
    files.remove('renderers/CanvasRenderer.js')
    files.remove('renderers/SVGRenderer.js')
    
    for f in FILES['renderables']:
        files.remove(f)

    build(files, 'ThreeWebGL.js')


def buildSVG():

    files = getAllFiles()

    files.remove('materials/MeshPhongMaterial.js')
    files.remove('materials/ParticleDOMMaterial.js')
    files.remove('renderers/DOMRenderer.js')
    files.remove('renderers/CanvasRenderer.js')
    files.remove('renderers/WebGLRenderer.js')

    build(files, 'ThreeSVG.js')


def buildDOM():

    files = []
    for k in ['core', 'cameras', 'io', 'objects', 'scenes', 'projector']:
        files.extend(FILES[k])
    
    files.remove('core/Geometry.js')
    files.remove('objects/Line.js')
    files.remove('objects/Mesh.js')
    files.append('materials/ParticleDOMMaterial.js')
    files.append('renderers/DOMRenderer.js')
    files.append('renderers/renderables/RenderableParticle.js')

    build(files, 'ThreeDOM.js')


def buildDebug():

    outputFilename = 'ThreeDebug.js'

    print "=" * 40
    print "Compiling", outputFilename
    print "=" * 40

    files = getAllFiles()
    text = merge(files)

    position = 0
    while True:
        position = text.find("/* DEBUG", position)
        if position == -1:
            break
        text = text[0:position] + text[position+8:]
        position = text.find("*/", position)
        text = text[0:position] + text[position+2:]

    output(addHeader(compress(text), outputFilename), outputFilename)


def parse_args():

    if ap:
        parser = argparse.ArgumentParser(description='Build and compress Three.js')
        parser.add_argument('--full', help='Build Three.js', action='store_const', const=True, default=True)
        parser.add_argument('--canvas', help='Build ThreeCanvas.js', action='store_true')
        parser.add_argument('--webgl', help='Build ThreeWebGL.js', action='store_true')
        parser.add_argument('--svg', help='Build ThreeSVG.js', action='store_true')
        parser.add_argument('--dom', help='Build ThreeDOM.js', action='store_true')
        parser.add_argument('--debug', help='Build ThreeDebug.js', action='store_true')
        parser.add_argument('--all', help='Build all Three.js versions', action='store_true')
        
        args = parser.parse_args()
        
    else:
        parser = optparse.OptionParser(description='Build and compress Three.js')
        parser.add_option('--full', dest='full', help='Build Three.js', action='store_const', const=True, default=True)
        parser.add_option('--canvas', dest='canvas', help='Build ThreeCanvas.js', action='store_true')
        parser.add_option('--webgl', dest='webgl', help='Build ThreeWebGL.js', action='store_true')
        parser.add_option('--svg', dest='svg', help='Build ThreeSVG.js', action='store_true')
        parser.add_option('--dom', dest='dom', help='Build ThreeDOM.js', action='store_true')
        parser.add_option('--debug', dest='debug', help='Build ThreeDebug.js', action='store_true')
        parser.add_option('--all', dest='all', help='Build all Three.js versions', action='store_true')

        args, remainder = parser.parse_args()
    
    return args


def main(argv=None):

    args = parse_args()

    if args.full or args.all:
        buildFull()

    if args.canvas or args.all:
        buildCanvas()

    if args.webgl or args.all:
        buildWebGL()

    if args.svg or args.all:
        buildSVG()

    if args.dom or args.all:
        buildDOM()

    if args.debug or args.all:
        buildDebug()


if __name__ == "__main__":
    main()

