import argparse
import re
import os

if __name__ == '__main__':

    #this.getRiboToolPath() + " --ribodb "+this.getRiboToolDBPath() +" --class \"" + riboClass + "\" --output " + execFilename;

    parser = argparse.ArgumentParser()
    parser.add_argument('-o', '--output', type=str, help='outfile', required=True)
    parser.add_argument('-d', '--ribodb', type=argparse.FileType('r'), help='outputfile', required=True)
    parser.add_argument('-c', '--org', type=str, help='outputfile', required=True)

    args = parser.parse_args()

    absOutput = os.path.abspath(args.output)
    folderPath = os.path.dirname(absOutput)

    if not os.path.isdir(folderPath):
        try:
            os.makedirs(folderPath)
        except:
            parser.error('Selected output file can not be created: {path}'.format(path=absOutput))

    output = open(absOutput, 'w')

    for line in args.ribodb:

        # Deinococcus radiodurans	AE000513	DR_r01	rRNA	TTTATGGAGAGTTTGATCCTGGCTCAGGGTGAACGCTGGCGGCGTGCTTAAGACATGCAAGTCGAACGCGGTCTTCGGACCGAGTGGCGCACGGGTGAGTAACACGTAACTGACCTACCCAGAAGTCACGAATAACTGGCCGAAAGGTCCGCTAATACGTGATGTGGTGATGCACCGTGGTGCATCACTAAAGATTTATCGCTTCTGGATGGGGTTGCGTTCCATCAGCTGGTTGGTGGGGTAAAGGCCTACCAAGGCGACGACGGATAGCCGGCCTGAGAGGGTGGCCGGCCACAGGGGCACTGAGACACGGGTCCCACTCCTACGGGAGGCAGCAGTTAGGAATCTTCCACAATGGGCGCAAGCCTGATGGAGCGACGCCGCGTGAGGGATGAAGGTTTTCGGATCGTAAACCTCTGAATCTGGGACGAAAGAGCCTTAGGGCAGATGACGGTACCAGAGTAATAGCACCGGCTAACTCCGTGCCAGCAGCCGCGGTAATACGGAGGGTGCAAGCGTTACCCGGAATCACTGGGCGTAAAGGGCGTGTAGGCGGAAATTTAAGTCTGGTTTTAAAGACCGGGGCTCAACCTCGGGGATGGACTGGATACTGGATTTCTTGACCTCTGGAGAGGTAACTGGAATTCCTGGTGTAGCGGTGGAATGCGTAGATACCAGGAGGAACACCAATGGCGAAGGCAAGTTACTGGACAGAAGGTGACGCTGAGGCGCGAAAGTGTGGGGAGCAAACCGGATTAGATACCCGGGTAGTCCACACCCTAAACGATGTACGTTGGCTAAGCGCAGGATGCTGTGCTTGGCGAAGCTAACGCGATAAACGTACCGCCTGGGAAGTACGGCCGCAAGGTTGAAACTCAAAGGAATTGACGGGGGCCCGCACAAGCGGTGGAGCATGTGGTTTAATTCGAAGCAACGCGAAGAACCTTACCAGGTCTTGACATGCTAGGAACTTTGCAGAGATGCAGAGGTGCCCTTCGGGGAACCTAGACACAGGTGCTGCATGGCTGTCGTCAGCTCGTGTCGTGAGATGTTGGGTTAAGTCCCGCAACGAGCGCAACCCTTGCCTTTAGTTGTCAGCATTCAGTTGGACACTCTAGAGGGACTGCCTATGAAAGTAGGAGGAAGGCGGGGATGACGTCTAGTCAGCATGGTCCTTACGTCCTGGGCGACACACGTGCTACAATGGGTAGGACAACGCGCAGCAAACCCGCGAGGGTAAGCGAATCGCTAAAACCTATCCCCAGTTCAGATCGGAGTCTGCAACTCGACTCCGTGAAGTTGGAATCGCTAGTAATCGCGGGTCAGCATACCGCGGTGAATACGTTCCCGGGCCTTGTACACACCGCCCGTCACACCATGGGAGTAGATTGCAGTTGAAACCGCCGGGAGCTTAACGGCAGGCGTCTAGACTGTGGTTTATGACTGGGGTGAAGTCGTAACAAGGTAACTGTACCGGAAGGTGCGGTTGGATCACCTCCTTT

        aline = line.strip().split("\t")

        if aline[0] == args.org:

            output.write(">" + re.sub(r"[^0-9a-zA-z]+", "_", aline[0]) + "_" + aline[1] + "_" + aline[2] + "\n")
            output.write(aline[4] + "\n")

