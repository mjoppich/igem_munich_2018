import urllib.request
from collections import defaultdict
from Bio import SeqIO
import glob
import re
import os
import argparse
import sys

bac2class = {}

#CP003946 CP001217 CP010323 HE965803 CP000413 CP003494 CP006835 CP003322 CU458896 AE000783 FP236530 CP002207 CP010451 CP000038 CP001019 KC763634

if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument('-b', '--bac_details', type=argparse.FileType('r'), help='ea table file to read in', required=True)
    parser.add_argument('-s', '--bacseqs', type=argparse.FileType('w'), help='outputfile', required=True)
    parser.add_argument('-g', '--genomes', type=str, help='outputfile', required=True)
    parser.add_argument('-sel', '--selected', type=str, nargs='+', help='outputfile', required=False, default=None)

    args = parser.parse_args()


    for idx, line in enumerate(args.bac_details):

        if idx == 0:
            continue

        line = line.strip().split("\t")
        accNum = line[0]

        accID = accNum.split(".")[0]       

        bacName = line[4]
        abacName = bacName.split(" ")

        mbacName = " ".join([abacName[i] for i in range(0, min(2, len(abacName)))])

        #print(accID, accID + ".embl", mbacName, sep="\t")

        bac2class[accID] = mbacName

    riboSearch = re.compile(r"[rR]ibosoma")


    for fidx, fname in enumerate(glob.glob(args.genomes +"/*.embl")):

        print(fidx, fname)

        bfname = os.path.basename(fname)
        bfname = bfname.split(".")[0]

        if args.selected != None and not bfname in args.selected:
            continue

        try:

            seenRecords = 0

            for record in SeqIO.parse(fname, "embl"):

                seenRecords += 1

                if len(record.features) <= 2:
                    raise Exception('Too few features for file')
                


                for feature in record.features:

                    if not feature.type in ['CDS', 'rRNA']:
                        continue



                    bacClass = bac2class.get(bfname, None)

                    if bacClass == None:
                        print("Invalid bacClass for accid", bfname, fname)
                        continue

                    seqName = None
                    seqName = feature.qualifiers.get("locus_tag", feature.qualifiers.get("product", [None]))[0]


                    if feature.type == 'rRNA':

                        dnaSeq = str(feature.location.extract(record).seq)

                        print(bacClass, bfname, seqName, feature.type, dnaSeq, sep="\t", file=args.bacseqs)

                    else:

                        allDescriptors = []
                        allDescriptors += feature.qualifiers.get('product', [])

                        for desc in allDescriptors:

                            if riboSearch.match(desc):
                                dnaSeq = str(feature.location.extract(record).seq)
                                print(bacClass, bfname, seqName, feature.type, dnaSeq, sep="\t", file=args.bacseqs)

                                break

            if seenRecords == 0:
                raise Exception('No records for file')

                            
        except Exception as e:

            print("Error processing file", fname)
            print(str(e))

            print("Error processing file", fname, file=sys.stderr)
            print(str(e), file=sys.stderr)






