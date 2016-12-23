import os
import json
import stat
import shutil
import argparse


os.chdir(os.path.dirname(os.path.realpath(__file__)))
os.chdir('..')
review = os.path.join(os.getcwd(), 'review')

MASK = stat.S_IRWXU|stat.S_IRGRP|stat.S_IXGRP|stat.S_IROTH|stat.S_IXOTH

HTML = '''<!doctype html>
<html lang='en'>
  <head>
    <title>%(title)s</title>
    <meta charset='utf-8'>
    <script src='../../../../../../build/three.min.js'></script>
    <script src='../../../../../../examples/js/controls/OrbitControls.js'></script>
    <script src='../../scripts/js/review.js'></script>
    <link href='../../scripts/css/style.css' rel='stylesheet' />
  </head>
  <body>
    <script>
      init('%(filename)s');
    </script>
  </body>
</html>
'''

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('json')
    parser.add_argument('-t', '--tag', required=True)
    return vars(parser.parse_args())


def copy_for_review(tmp_json, tag):
    tag_dir = os.path.join(review, tag)
    if not os.path.exists(tag_dir):
        print('making %s' % tag_dir)
        os.makedirs(tag_dir)
    dst_json = os.path.join(tag_dir, '%s.json' % tag)
    print('moving %s > %s' % (tmp_json, dst_json))
    shutil.move(tmp_json, dst_json)
    create_template(tag_dir, os.path.basename(dst_json))

    print('looking for maps...')
    with open(dst_json) as stream:
        data = json.load(stream)

    textures = []
    materials = data.get('materials')
    if data['metadata']['type'] == 'Geometry' and materials:
        textures.extend(_parse_geometry_materials(materials))

    images = data.get('images')
    if data['metadata']['type'] == 'Object' and images:
        for each in images:
            textures.append(each['url'])
    
    textures = list(set(textures))
    print('found %d maps' % len(textures))
    dir_tmp = os.path.dirname(tmp_json)
    for texture in textures:
        texture = os.path.join(dir_tmp, texture)
        dst = os.path.join(tag_dir, os.path.basename(texture))
        shutil.move(texture, dst)
        print('moving %s > %s' % (texture, dst))

    if data['metadata']['type'] == 'Object':
        print('looking for non-embedded geometry')
        for geometry in data['geometries']:
            url = geometry.get('url')
            if not url: continue
            src = os.path.join(dir_tmp, url)
            dst = os.path.join(tag_dir, url)
            print('moving %s > %s' % (src, dst))
            shutil.move(src, dst)
    elif data['metadata']['type'] == 'Geometry':
        print('looking for external animation files')
        for key in ('animation', 'morphTargets'):
            try:
                value = data[key]
            except KeyError:
                continue

            if not isinstance(value, str):
                continue

            src = os.path.join(dir_tmp, value)
            dst = os.path.join(tag_dir, value)
            print('moving %s > %s' % (src, dst))
            shutil.move(src, dst)
            

def _parse_geometry_materials(materials):
    maps = ('mapDiffuse', 'mapSpecular', 'mapBump',
        'mapLight', 'mapNormal')
    textures = []
    for material in materials:
        for key in material.keys():
            if key in maps:
                textures.append(material[key])
    return textures


def create_template(tag_dir, filename):
    html = HTML % {
        'title': filename[:-5].title(),
        'filename': filename
    }

    html_path = os.path.join(tag_dir, 'index.html')
    with open(html_path, 'w') as stream:
        stream.write(html)
    os.chmod(html_path, MASK)


def main():
    args = parse_args()
    copy_for_review(args['json'], args['tag'])


if __name__ == '__main__':
    main()
