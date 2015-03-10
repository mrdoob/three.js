import os
import argparse
import sys
import io_three
from io_three.exporter import constants


try:
    separator = sys.argv.index('--')
except IndexError:
    print('ERROR: no parameters specified')
    sys.exit(1)


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('filepath')
    for key, value in constants.EXPORT_OPTIONS.items():
        if not isinstance(value, bool):
            kwargs = {'type': type(value), 'default': value}
        else:
            kwargs = {'action':'store_true'}
        parser.add_argument('--%s' % key, **kwargs)

    return vars(parser.parse_args(sys.argv[separator+1:]))


def main():
    args = parse_args()
    args[constants.ENABLE_PRECISION] = True
    args[constants.INDENT] = True
    if args[constants.SCENE]:
        io_three.exporter.export_scene(args['filepath'], args)
    else:
        io_three.exporter.export_geometry(args['filepath'], args)


if __name__ == '__main__':
    main()
