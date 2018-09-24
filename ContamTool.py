import argparse
from pathlib import Path
import json
import os
import HTSeq
import pysam

ap = argparse.ArgumentParser(description='--reads file1.fastq --cont file2.fasta file3.fasta')
#ap.add_argument("--reads", required=True, help="path to the read file")
ap.add_argument("--reads", nargs='+', required=True, help="path to the read file")

ap.add_argument('--cont', nargs='+', help="path to the fasta file(s)", required=True)
ap.add_argument('--o', help="path to the output directory", required=True)
ap.add_argument('--extract_not_aligned',  nargs='+', help="path to all fasta files to witch reads did not match", required=False)
ap.add_argument('--extract_aligned',  nargs='+', help="path to all fasta files to witch reads match", required=False)
args = vars(ap.parse_args())
read_file = args["reads"]
cont_file = args["cont"]
output_dir = args["o"]
extracted_not_aligned = args["extract_not_aligned"]
extracted_aligned = args["extract_aligned"]
#if not read_file.endswith(".fastq"):
#    print('Please enter read file in fastq format')
#file = Path(args["reads"])
#if not file.is_file():
#    print('Read file does not exist')
#    exit()

if not os.path.exists(output_dir):
    os.mkdir(output_dir)

for file in read_file:
    if not file.endswith(".fastq"):
        print('Please enter contamination in fastq format')
        exit()
    file = Path(file)
    if not file.is_file:
        print('Read file does not exist')
        exit()

for file in cont_file:
    if not file.endswith(".fasta"):
        print('Please enter contamination in fasta format')
        exit()
    file = Path(file)
    if not file.is_file:
        print('Contamination file does not exist')
        exit()

#print("cat " + ' '.join(read_file) + " > " + os.path.join(output_dir, "complete.fastq"))
os.system("cat " + ' '.join(read_file) + " >" + os.path.join(output_dir, "complete.fastq"))
read_file = os.path.join(output_dir, "complete.fastq")

for file in cont_file:
    sam_file_name = os.path.split(file)[1][:-6]+".sam"
    os.system("graphmap align -r "+file+" -d "+read_file+" -o "+os.path.join(output_dir,sam_file_name))



sam_file_to_dict = dict()
fasta_file_to_dict = dict()
for file in os.listdir(output_dir):

    alignedLength = 0
    alignmentBases = 0
    totalBases = 0
    totalReads = 0
    alignedReads = 0
    idAlignedReads = []
    idNotAlignedReads = []

    if file.endswith(".sam"):
        fasta_file_name = os.path.split(file)[1][:-4]+".fasta"
        samFile = pysam.AlignmentFile(output_dir+"/"+file, "r")

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
        if not extracted_not_aligned and not extracted_aligned:
            tmp_dict = dict(totalReads=totalReads, alignedReads=alignedReads, totalBases=totalBases,
                            alignmentBases=alignmentBases,
                            alignedLength=alignedLength)
            fasta_file_to_dict[os.path.join(output_dir, fasta_file_name)] = tmp_dict
        else:
            tmp_dict = dict(totalReads=totalReads, alignedReads=alignedReads, totalBases=totalBases, alignmentBases=alignmentBases,
                            alignedLength=alignedLength, idAlignedReads=idAlignedReads, idNotAlignedReads=idNotAlignedReads)
            sam_file_to_dict[os.path.join(output_dir,file)] = tmp_dict
            fasta_file_to_dict[os.path.join(output_dir, fasta_file_name)]=tmp_dict
print(json.dumps(fasta_file_to_dict))

if extracted_not_aligned:
    intersected_reads = []
    for file in extracted_not_aligned:
        sam_file_name = os.path.join(output_dir,os.path.split(file)[1][:-6] + ".sam")
        if not intersected_reads:
            intersected_reads=sam_file_to_dict[sam_file_name]["idNotAlignedReads"]
        intersected_reads = list(set(intersected_reads).intersection(sam_file_to_dict[sam_file_name]["idNotAlignedReads"]))
       
       

        fastq_file = HTSeq.FastqReader(read_file)
        my_fastq_file = open(os.path.join(output_dir, "extracted_not_aligned_reads.fastq"), "w")
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
   
   
   
   

    fastq_file = HTSeq.FastqReader(read_file)
    my_fastq_file = open(os.path.join(output_dir, "extracted_aligned_reads.fastq"), "w")
    for read in fastq_file:
        if any(read.name.split(" ")[0] in s for s in intersected_reads):
            myread = HTSeq.SequenceWithQualities(read.seq, read.name, read.qualstr)
            myread.write_to_fastq_file(my_fastq_file)
    my_fastq_file.close()