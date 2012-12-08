"""Join multiple binary files into single file and generate JSON snippet with offsets

-------------------------------------
How to use
-------------------------------------

python join_ctm.py -i "part_*.ctm" -o joined.ctm [-j offsets.js]

Will read multiple files following wildcard pattern (ordered lexicographically):

part_000.ctm
part_001.ctm
part_002.ctm

...

part_XXX.ctm

And generate single concatenated files:

joined.ctm
offsets.js (optional, offsets are also dumped to standard output)

"""

import getopt
import glob
import sys
import os

# #####################################################
# Templates
# #####################################################
TEMPLATE_JSON = u"""\
"offsets": [ %(offsets)s ],
"""

# #############################################################################
# Helpers
# #############################################################################
def usage():
    print 'Usage: %s -i "filename_*.ctm" -o filename.ctm [-j offsets.js]' % os.path.basename(sys.argv[0])

# #####################################################
# Main
# #####################################################
if __name__ == "__main__":

    # get parameters from the command line

    try:
        opts, args = getopt.getopt(sys.argv[1:], "hi:o:j:", ["help", "input=", "output=", "json="])

    except getopt.GetoptError:
        usage()
        sys.exit(2)


    inpattern = ""
    outname = ""
    jsonname = ""

    for o, a in opts:
        if o in ("-h", "--help"):
            usage()
            sys.exit()

        elif o in ("-i", "--input"):
            inpattern = a

        elif o in ("-o", "--output"):
            outname = a

        elif o in ("-j", "--json"):
            jsonname = a

    # quit if required parameters are missing

    if inpattern == "" or outname == "":
        usage()
        sys.exit(2)

    outfile = open(outname, "wb")

    matches = glob.glob(inpattern)
    matches.sort()

    total = 0
    offsets = []

    for filename in matches:
        filesize = os.path.getsize(filename)
        offsets.append(total)
        total += filesize

        print filename, filesize

        infile = open(filename, "rb")
        buffer = infile.read()
        outfile.write(buffer)
        infile.close()

    outfile.close()

    json_str = TEMPLATE_JSON % {
    "offsets" : ", ".join(["%d" % o for o in offsets])
    }

    print json_str

    if jsonname:
        jsonfile = open(jsonname, "w")
        jsonfile.write(json_str)
        jsonfile.close()