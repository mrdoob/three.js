import sys
import os

# MERGER

rev = 14

files = []
files.append('Three.js')
files.append('core/Color.js')
files.append('core/Vector2.js')
files.append('core/Vector3.js')
files.append('core/Vector4.js')
files.append('core/Rectangle.js')
files.append('core/Matrix4.js')
files.append('core/Vertex.js')
files.append('core/Face3.js')
files.append('core/Face4.js')
files.append('core/UV.js')
files.append('core/Geometry.js')
files.append('cameras/Camera.js')
files.append('objects/Object3D.js')
files.append('objects/Line.js')
files.append('objects/Mesh.js')
files.append('objects/Particle.js')
files.append('materials/LineColorMaterial.js')
files.append('materials/MeshBitmapUVMappingMaterial.js')
files.append('materials/MeshColorFillMaterial.js')
files.append('materials/MeshColorStrokeMaterial.js')
files.append('materials/MeshFaceColorFillMaterial.js')
files.append('materials/MeshFaceColorStrokeMaterial.js')
files.append('materials/ParticleBitmapMaterial.js')
files.append('materials/ParticleCircleMaterial.js')
files.append('scenes/Scene.js')
files.append('renderers/Renderer.js')
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

tmp_file = open('temp.js','w')
tmp_file.write(string)
tmp_file.close()


# YUICOMPRESSOR

os.system("java -jar yuicompressor-2.4.2.jar temp.js -o ../build/three.js --charset utf-8 -v")
os.unlink("temp.js")

# HEADER

output = '../build/three.js'
string = "// three.js r" + str(rev) + " - http://github.com/mrdoob/three.js\n"

src_file = open(output,'r')
string += src_file.read()

dep_file = open(output,'w')
dep_file.write(string)
dep_file.close()
