#!/usr/bin/env python

import sys

if sys.version_info < (2, 7):
	print("This script requires at least Python 2.7.")
	print("Please, update to a newer version: http://www.python.org/download/releases/")
	exit()

import argparse
import json
import os
import shutil
import tempfile


def main(argv=None):

	parser = argparse.ArgumentParser()
	parser.add_argument('--include', action='append', required=True)
	parser.add_argument('--externs', action='append', default=['externs/common.js'])
	parser.add_argument('--amd', action='store_true', default=False)
	parser.add_argument('--minify', action='store_true', default=False)
	parser.add_argument('--output', default='../../build/three.js')
	parser.add_argument('--sourcemaps', action='store_true', default=False)

	args = parser.parse_args()

	output = args.output

	# merge

	print(' * Building ' + output)

	# enable sourcemaps support

	if args.sourcemaps:
		sourcemap = output + '.map'
		sourcemapping = '\n//@ sourceMappingURL=' + sourcemap
		sourcemapargs = ' --create_source_map ' + sourcemap + ' --source_map_format=V3'
	else:
		sourcemap = sourcemapping = sourcemapargs = ''

	fd, path = tempfile.mkstemp()
	tmp = open(path, 'w')
	sources = []

	if args.amd:
		tmp.write('( function ( root, factory ) {\n\n\tif ( typeof define === \'function\' && define.amd ) {\n\n\t\tdefine( [ \'exports\' ], factory );\n\n\t} else if ( typeof exports === \'object\' ) {\n\n\t\tfactory( exports );\n\n\t} else {\n\n\t\tfactory( root );\n\n\t}\n\n}( this, function ( exports ) {\n\n')

	for include in args.include:
		with open('includes/' + include + '.json','r') as f:
			files = json.load(f)
		for filename in files:
			filename = '../../' + filename;
			sources.append(filename)
			with open(filename, 'r') as f:
				tmp.write(f.read())
				tmp.write('\n')

	if args.amd:
		tmp.write('exports.THREE = THREE;\n\n} ) );')

	tmp.close()

	# save

	if args.minify is False:
		shutil.copy(path, output)
		os.chmod(output, 0o664); # temp files would usually get 0600

	else:

		externs = ' --externs '.join(args.externs)
		source = ' '.join(sources)
		cmd = 'java -jar compiler/compiler.jar --warning_level=VERBOSE --jscomp_off=globalThis --externs %s --jscomp_off=checkTypes --language_in=ECMASCRIPT5_STRICT --js %s --js_output_file %s %s' % (externs, source, output, sourcemapargs)
		os.system(cmd)

		# header

		with open(output,'r') as f: text = f.read()
		with open(output,'w') as f: f.write('// three.js - http://github.com/mrdoob/three.js\n' + text + sourcemapping)

	os.close(fd)
	os.remove(path)


if __name__ == "__main__":
	main()
