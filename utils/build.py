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
import json

def merge(files):

	buffer = []

	for filename in files:
		with open(os.path.join('..', 'src', filename), 'r') as f:
			buffer.append(f.read())

	return "".join(buffer)


def output(text, filename):

	with open(os.path.join('..', 'build', filename), 'w') as f:
		f.write(text)


def compress(text, fname_externs):

	externs = ""
	if fname_externs:
		externs = "--externs %s.js" % fname_externs

	in_tuple = tempfile.mkstemp()
	with os.fdopen(in_tuple[0], 'w') as handle:
		handle.write(text)

	out_tuple = tempfile.mkstemp()

	os.system("java -jar compiler/compiler.jar --warning_level=VERBOSE --jscomp_off=globalThis --jscomp_off=checkTypes --externs externs_common.js %s --language_in=ECMASCRIPT5_STRICT --js %s --js_output_file %s" % (externs, in_tuple[1], out_tuple[1]))

	with os.fdopen(out_tuple[0], 'r') as handle:
		compressed = handle.read()

	os.unlink(in_tuple[1])
	os.unlink(out_tuple[1])

	return compressed


def addHeader(text, endFilename):

	return ("// %s - http://github.com/mrdoob/three.js\n" % endFilename) + text


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


def buildLib(files, debug, minified, filename, fname_externs):

	text = merge(files)

	if debug:
		text = makeDebug(text)
		filename = filename + 'Debug'

	if filename == "Three":
		folder = ''
	else:
		folder = 'custom/'

	filename = filename + '.js'

	print("=" * 40)
	print("Compiling " + filename)
	print("=" * 40)

	if minified:
		text = compress(text, fname_externs)

	output(addHeader(text, filename), folder + filename)


def buildIncludes(files, filename):

	template = '\t\t<script src="../src/%s"></script>'
	text = "\n".join(template % f for f in files)

	output(text, filename + '.js')
	
def getFileNames():
	
	file =  open(os.path.join('.', 'files.json'), 'r')
	data = json.load(file)
	file.close()
	
	return data


def parse_args():

	if ap:
		parser = argparse.ArgumentParser(description='Build and compress Three.js')
		parser.add_argument('--includes', help='Build includes.js', action='store_true')
		parser.add_argument('--common', help='Build Three.js', action='store_const', const=True)
		parser.add_argument('--extras', help='Build ThreeExtras.js', action='store_const', const=True)
		parser.add_argument('--canvas', help='Build ThreeCanvas.js', action='store_true')
		parser.add_argument('--webgl', help='Build ThreeWebGL.js', action='store_true')
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
	files = getFileNames()

	config = [
	['Three', 'includes', '', files["COMMON"] + files["EXTRAS"], args.common],
	['ThreeCanvas', 'includes_canvas', '', files["CANVAS"], args.canvas],
	['ThreeWebGL', 'includes_webgl', '', files["WEBGL"], args.webgl],
	['ThreeExtras', 'includes_extras', 'externs_extras', files["EXTRAS"], args.extras]
	]

	for fname_lib, fname_inc, fname_externs, files, enabled in config:
		if enabled or args.all:
			buildLib(files, debug, minified, fname_lib, fname_externs)
			if args.includes:
				buildIncludes(files, fname_inc)

if __name__ == "__main__":
	main()

