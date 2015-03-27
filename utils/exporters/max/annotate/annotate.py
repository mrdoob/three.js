#!/usr/bin/env python

__author__ = 'Andrew Dunai <andrew@dun.ai>'

import sys
import json
import argparse
import re
from collections import namedtuple
try:
    from PyQt4 import QtGui
    import argparseui
except ImportError:
    CAN_GUI = False
else:
    CAN_GUI = True

range_regexp = re.compile(r'^([\w\d]+)\=([\d]+)\.\.([\d]+)$')
Range = namedtuple('Range', ('name', 'start', 'end'))


def parse_range(value):
    match = range_regexp.match(value)
    if not match:
        raise argparse.ArgumentTypeError('Ranges should be in form "name=frame..frame"')
    return Range(match.group(1), int(match.group(2)) - 1, int(match.group(3)) - 1)


epilog = 'example:\n  %(prog)s -i model.js -o model.new.js idle=1..10 walk=11..20'
if not CAN_GUI:
    epilog += '\npro tip:\n  Install PyQt4 and argparseui packages to use GUI ("-u" option).'
epilog += '\nCreated by {}'.format(__author__)

parser = argparse.ArgumentParser(
    description='Split THREE.js model animation into seperate parts.',
    epilog=epilog,
    formatter_class=argparse.RawDescriptionHelpFormatter
)
CAN_GUI and parser.add_argument('-u', '--gui', help='run in GUI', dest='gui', action='store_true')
parser.add_argument('-i', metavar='FILE', help='input file name', required=True, dest='source', type=argparse.FileType('r'))
parser.add_argument('-o', metavar='FILE', help='output file name', required=True, dest='destination', type=argparse.FileType('w'))
parser.add_argument('range', nargs='+', help='range in format "name=frame..frame"', type=parse_range)


def process(parser):
    args = parser.parse_args()

    data = json.loads(args.source.read())
    animation = data.get('animation')

    fps = float(animation.get('fps'))
    length = float(animation.get('length'))
    frame_count = int(length * fps)
    frame_duration = 1.0 / fps

    all_hierarchy = animation.get('hierarchy')

    animations = {}

    for r in args.range:
        # Create animation & hierarchy
        hierarchy = []
        animation = {
            'name': r.name,
            'fps': fps,
            'length': (r.end - r.start) * frame_duration,
            'hierarchy': hierarchy
        }

        # Go through each bone animation
        for bone in all_hierarchy:

            keys = [key for key in bone['keys'] if (key['time'] >= r.start * frame_duration) and (key['time'] <= r.end * frame_duration)]

            # Patch time
            time = 0.0
            for key in keys:
                key['time'] = round(time, 3)
                time += frame_duration

            new_bone = {
                'parent': bone['parent'],
                'keys': keys
            }
            hierarchy.append(new_bone)

        animations[r.name] = animation

    del data['animation']
    data['animations'] = animations

    args.destination.write(json.dumps(data))

if '-u' in sys.argv and CAN_GUI:
    app = QtGui.QApplication(sys.argv)
    a = argparseui.ArgparseUi(parser)
    a.show()
    app.exec_()
    
    if a.result() == 1:
        process(a)
else:
    process(parser)
