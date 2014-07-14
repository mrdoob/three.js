#!/usr/bin/env python

__doc__ = '''
Convert a json file to msgpack.

If fed only an input file the converted will write out a .pack file
of the same base name in the same directory
$ json2msgpack.py -i foo.json
foo.json > foo.pack

Specify an output file path
$ json2msgpack.py -i foo.json -o /bar/tmp/bar.pack
foo.json > /bar/tmp/bar.pack

Dependencies:
https://github.com/msgpack/msgpack-python
'''

import os
import sys
import json
import argparse

sys.path.append(os.path.dirname(os.path.realpath(__file__)))

import msgpack

EXT = '.pack'

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('-i', '--infile', required=True,
        help='Input json file to convert to msgpack')
    parser.add_argument('-o', '--outfile',
        help=('Optional output. If not specified the .pack file '\
            'will write to the same director as the input file.'))
    args = parser.parse_args()
    convert(args.infile, args.outfile)

def convert(infile, outfile):
    if not outfile:
        ext = infile.split('.')[-1]
        outfile = '%s%s' % (infile[:-len(ext)-1], EXT)

    print('%s > %s' % (infile, outfile))

    print('reading in JSON')
    with open(infile) as op:
        data = json.load(op)

    print('writing to msgpack')
    with open(outfile, 'wb') as op:
        msgpack.dump(data, op)

if __name__ == '__main__':
    main()
