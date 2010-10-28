import sys
import os

filename = 'ThreeDebug.js'

# MERGER

files = []
files.append('Three.js')
files.append('core/Color.js')
files.append('core/Vector2.js')
files.append('core/Vector3.js')
files.append('core/Vector4.js')
files.append('core/Rectangle.js')
files.append('core/Matrix3.js')
files.append('core/Matrix4.js')
files.append('core/Vertex.js')
files.append('core/Face3.js')
files.append('core/Face4.js')
files.append('core/UV.js')
files.append('core/Geometry.js')
files.append('cameras/Camera.js')
files.append('lights/Light.js')
files.append('lights/AmbientLight.js')
files.append('lights/DirectionalLight.js')
files.append('lights/PointLight.js')
files.append('objects/Object3D.js')
files.append('objects/Particle.js')
files.append('objects/Line.js')
files.append('objects/Mesh.js')
files.append('materials/LineColorMaterial.js')
files.append('materials/MeshPhongMaterial.js')
files.append('materials/MeshBitmapMaterial.js')
files.append('materials/MeshColorFillMaterial.js')
files.append('materials/MeshColorStrokeMaterial.js')
files.append('materials/MeshFaceMaterial.js')
files.append('materials/ParticleBitmapMaterial.js')
files.append('materials/ParticleCircleMaterial.js')
files.append('materials/ParticleDOMMaterial.js')
files.append('scenes/Scene.js')
files.append('renderers/Projector.js')
files.append('renderers/DOMRenderer.js')
files.append('renderers/CanvasRenderer.js')
files.append('renderers/SVGRenderer.js')
files.append('renderers/WebGLRenderer.js')
files.append('renderers/renderables/RenderableFace3.js')
files.append('renderers/renderables/RenderableFace4.js')
files.append('renderers/renderables/RenderableParticle.js')
files.append('renderers/renderables/RenderableLine.js')

string = ''

for item in files:
	src_file = open('../src/' + item,'r')
	string += src_file.read() + "\n"

position = 0

while True:
	position = string.find("/* DEBUG", position)
	if position == -1:
		break
	string = string[0:position] + string[position+8:]
	position = string.find("*/", position)
	string = string[0:position] + string[position+2:]

tmp_file = open('temp.js','w')
tmp_file.write(string)
tmp_file.close()


# YUICOMPRESSOR

os.system("java -jar yuicompressor-2.4.2.jar temp.js -o ../build/" + filename + " --charset utf-8 -v")
os.unlink("temp.js");


# HEADER

rev_file = open('REVISION','r')
rev = rev_file.read().rstrip()

output = '../build/' + filename
string = "// " + filename + " r" + rev + " - http://github.com/mrdoob/three.js\n"

src_file = open(output,'r')
string += src_file.read()

dep_file = open(output,'w')
dep_file.write(string)
dep_file.close()
