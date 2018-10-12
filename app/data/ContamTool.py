import argparse
from pathlib import Path
import json
import os
import HTSeq

import matplotlib as mpl
mpl.use('Agg')
import matplotlib.pyplot as plt

ap = argparse.ArgumentParser(description='--reads file1.fastq --cont file2.fasta file3.fasta')

ap.add_argument("--reads", nargs='+', required=True, help="path to the read file")
ap.add_argument('--cont', nargs='+', help="path to the fasta file(s)", required=True)

ap.add_argument('--o', help="path to the output directory", required=True)

ap.add_argument("--prefix", help="", required=True)

ap.add_argument('--extract_prefix', type=str, required=False)
ap.add_argument('--extract_not_aligned',  nargs='+', help="path to all fasta files to witch reads did not match", required=False)
ap.add_argument('--extract_aligned',  nargs='+', help="path to all fasta files to witch reads match", required=False)

ap.add_argument("--no_images", default=False, action="store_true", required=False)

args = vars(ap.parse_args())
read_file = args["reads"]
cont_file = args["cont"]
output_dir = args["o"]
prefix = args["prefix"]

extracted_not_aligned = args["extract_not_aligned"]
extracted_aligned = args["extract_aligned"]
extract_prefix = args["extract_prefix"]
makeImages = not args['no_images']

if prefix[-1] != "_":
    prefix += "_"

def deleteFileSilently(filepath):

    try:
        os.remove(filepath)
    except OSError:
        pass

if not os.path.exists(output_dir):
    os.mkdir(output_dir)

for file in read_file:
    if not file.endswith(".fastq"):
        print('Please enter contamination in fastq format \n *Please no spaces in file name!*')
        exit()
    file = Path(file)
    if not file.is_file:
        print('Read file does not exist \n *Please no spaces in file name!*')
        exit()

for file in cont_file:
    if not file.endswith(".fasta"):
        print('Please enter contamination in fasta format \n *Please no spaces in file name!*')
        exit()
    file = Path(file)
    if not file.is_file:
        print('Contamination file does not exist \n *Please no spaces in file name!*')
        exit()

fastqFile = os.path.join(output_dir, prefix + "complete.fastq")

os.system("cat " + ' '.join(read_file) + " > " + fastqFile)

read_file = fastqFile

reads = HTSeq.FastqReader(read_file)
n_reads = 0
len_reads=[]

readsLengthPlot = os.path.join(output_dir,prefix+"reads_length.png")


if makeImages:
    try:
        for read in reads:
            len_reads.append(len(read.seq))
            n_reads= n_reads + 1
        plt.ylabel('Frequency', fontsize=10)
        plt.xlabel('Length of reads', fontsize=10)
        plt.title('Length frequencies of all reads', fontsize=12)
        plt.hist(len_reads, bins=100, color='green')
        plt.savefig(readsLengthPlot)
        plt.close()
    except ValueError:
        print('Some problems with read file: Secondary ID line in FASTQ file doesnot start with ''+''.')
        exit()


sam_fasta_pairs = []

for file in cont_file:
    sam_file_name = os.path.split(file)[1][:-6]+".sam"
    samFile = os.path.join(output_dir,prefix + sam_file_name)

    os.system("graphmap align -r "+file+" -d "+read_file+" -o "+samFile)
    sam_fasta_pairs.append( (file, samFile) )

import pysam
sam_file_to_dict = dict()
fasta_file_to_dict = dict()

for fastaFile, samFilePath in sam_fasta_pairs:

    alignedLength = 0
    alignmentBases = 0
    totalBases = 0
    totalReads = 0
    alignedReads = 0
    idAlignedReads = []
    idNotAlignedReads = []



    fasta_file_name = fastaFile
    samFile = pysam.AlignmentFile(samFilePath, "r")

    for aln in samFile:
        totalBases += len(aln.seq)
        totalReads += 1
        if not aln.is_unmapped:
            alignmentBases += aln.alen
            alignedLength += len(aln.seq)
            alignedReads += 1
            idAlignedReads.append(aln.query_name)
        else:
            idNotAlignedReads.append(aln.query_name)
    sep = "\t"

    #print(file)
    #print("DESCR", "ABS", "REL", sep=sep)
    #print("reads", totalReads, "{:.5}".format(1.0), sep=sep)
    #print("aligned reads", alignedReads, "{:.5}".format(alignedReads / totalReads), sep=sep)
    #print("unaligned reads", totalReads - alignedReads, "{:.5}".format((totalReads - alignedReads) / totalReads),
    #      sep=sep)
    #print("bases", totalBases, "{:.5}".format(1.0), sep=sep)
    #print("alignment bases", alignmentBases, "{:.5}".format(alignmentBases / totalBases), sep=sep)
    #print("aligned bases", alignedLength, "{:.5}".format(alignedLength / totalBases), sep=sep)
    #print("unaligned bases", totalBases - alignedLength, "{:.5}".format((totalBases - alignedLength) / totalBases),
    #      sep=sep)

    readPiePlot = os.path.join(output_dir,prefix + "read_pie.png")
    basesPiePlot = os.path.join(output_dir,prefix + "bases_pie.png")

    if makeImages:
        labels = ('Aligned \n Reads \n (n={acount})'.format(acount=alignedReads), 'Unaligned \n Reads \n (n={acount})'.format(acount=totalReads-alignedReads))
        plt.pie([alignedReads, (totalReads-alignedReads)], explode=(0,0), labels=labels, colors=['gold', 'yellowgreen'],
                autopct='%1.1f%%', shadow=True, startangle=140, textprops={'fontsize': 13})
        plt.axis('equal')

        plt.savefig(readPiePlot)
        plt.close()

        labels = ('Aligned \n Bases \n (n={acount})'.format(acount=alignedLength), 'Unaligned \n Bases \n (n={acount})'.format(acount=totalBases-alignedLength))
        plt.pie([alignedLength, (totalBases - alignedLength)], explode=(0, 0), labels=labels, colors=['lightcoral', 'lightskyblue'],
                autopct='%1.1f%%', shadow=True, startangle=140, textprops={'fontsize': 13})
        plt.axis('equal')
        plt.savefig(basesPiePlot)
        plt.close()


    tmp_dict = dict(totalReads=totalReads, alignedReads=alignedReads, totalBases=totalBases, alignmentBases=alignmentBases,
                    alignedLength=alignedLength, idAlignedReads=idAlignedReads, idNotAlignedReads=idNotAlignedReads)

    if makeImages:
        tmp_dict["readLengthPlot"] = readsLengthPlot
        tmp_dict["readsPie"] = readPiePlot
        tmp_dict["basesPie"] = basesPiePlot
        tmp_dict["refs"] = [fasta_file_name]


    sam_file_to_dict[samFilePath] = tmp_dict
    fasta_file_to_dict[fasta_file_name]=tmp_dict
print(json.dumps(fasta_file_to_dict))



# outpufolder -> subfolder for extracted




if extracted_not_aligned:
    output_path = os.path.join(output_dir, "_".join(extracted_not_aligned))
    intersected_reads = []
    for file in extracted_not_aligned:
        sam_file_name = os.path.join(output_dir,os.path.split(file)[1][:-6] + ".sam")
        if not intersected_reads:
            intersected_reads=sam_file_to_dict[sam_file_name]["idNotAlignedReads"]
        intersected_reads = list(set(intersected_reads).intersection(sam_file_to_dict[sam_file_name]["idNotAlignedReads"]))
        import HTSeq
        fastq_file = HTSeq.FastqReader(read_file)
        my_fastq_file = open(os.path.join(output_dir, extract_prefix+ "_not_aligned_reads.fastq"), "w")
        for read in fastq_file:
            if any(read.name.split(" ")[0] in s for s in intersected_reads):
                myread = HTSeq.SequenceWithQualities(read.seq, read.name, read.qualstr)
                myread.write_to_fastq_file(my_fastq_file)
        my_fastq_file.close()

if extracted_aligned:
    intersected_reads = []
    for file in extracted_aligned:
        sam_file_name = os.path.join(output_dir,os.path.split(file)[1][:-6] + ".sam")
        if not intersected_reads:
            intersected_reads=sam_file_to_dict[sam_file_name]["idAlignedReads"]
        intersected_reads = list(set(intersected_reads).intersection(sam_file_to_dict[sam_file_name]["idAlignedReads"]))
    import HTSeq
    fastq_file = HTSeq.FastqReader(read_file)

    my_fastq_file = open(os.path.join(output_dir, extract_prefix+ "_aligned_reads.fastq"), "w")
    for read in fastq_file:
        if any(read.name.split(" ")[0] in s for s in intersected_reads):
            myread = HTSeq.SequenceWithQualities(read.seq, read.name, read.qualstr)
            myread.write_to_fastq_file(my_fastq_file)
    my_fastq_file.close()


deleteFileSilently(read_file)
for fastaFile, samFilePath in sam_fasta_pairs:
    deleteFileSilently(samFilePath)