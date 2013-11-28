#!/usr/bin/env python

import sys

if sys.version_info < (2, 7):
	print("This script requires at least Python 2.7.")
	print("Please, update to a newer version: http://www.python.org/download/releases/")
	exit()

import argparse
import json
import os
import re
import shutil
import tempfile


def main(argv=None):

	parser = argparse.ArgumentParser()
	parser.add_argument('--include', action='append', required=True)
	parser.add_argument('--output', default='sublimetext2/threejs.sublime-completions')

	args = parser.parse_args()

	output = args.output

	# parsing

	print(' * Generating ' + output)

	fd, path = tempfile.mkstemp()
	tmp = open(path, 'w')
	tmp.write('{\n\t"scope": "source.js,source.js.embedded.html,source.coffee",\n\t"version": "r55",\n\t"completions":\n\t[\n')

	for include in args.include:
		with open('../build/includes/' + include + '.json','r') as f: files = json.load(f)
		for filename in files:
			filename = '../../' + filename;
			with open(filename, 'r') as f:
				string = f.read()
				match = re.search('THREE.(\w+)[\ ]+?=[\ ]+?function[\ ]+\(([\w\,\ ]+)?\)', string)
				if match:
					name = match.group(1)
					parameters = match.group(2)
					if parameters is None:
						parameters = ''
					else:
						array = parameters.split( ',' )
						for i in range(len(array)):
							array[i] = '${'+str(i+1)+':'+array[i].strip()+'}' # ${1:param}
						parameters = ' '+', '.join(array)+' '
					tmp.write('\t\t{ "trigger": "THREE.'+name+'", "contents": "THREE.'+name+'('+parameters+')$0" },\n' )

	tmp.write("\t\t\"THREE\"\n\t]\n}")
	tmp.close()

	# save

	shutil.copy(path, output)
	os.chmod(output, 0o664); # temp files would usually get 0600


if __name__ == "__main__":
	main()
