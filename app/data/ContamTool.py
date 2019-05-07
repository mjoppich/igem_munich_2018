import argparse
import json
import os
from collections import defaultdict
import re
import matplotlib as mpl
mpl.use('Agg')
import matplotlib.pyplot as plt
import math

SMALL_SIZE = 20
MEDIUM_SIZE = 22
BIGGER_SIZE = 24

plt.rc('font', size=SMALL_SIZE)          # controls default text sizes
plt.rc('axes', titlesize=SMALL_SIZE)     # fontsize of the axes title
plt.rc('axes', labelsize=MEDIUM_SIZE)    # fontsize of the x and y labels
plt.rc('xtick', labelsize=SMALL_SIZE)    # fontsize of the tick labels
plt.rc('ytick', labelsize=SMALL_SIZE)    # fontsize of the tick labels
plt.rc('legend', fontsize=SMALL_SIZE)    # legend fontsize
plt.rc('figure', titlesize=BIGGER_SIZE)  # fontsize of the figure title
plt.rc('figure', autolayout=True)


ap = argparse.ArgumentParser(description='--reads file1.fastq --cont file2.fasta file3.fasta')

ap.add_argument("--reads", nargs='+', required=True, help="path to tde read file")
ap.add_argument('--cont', nargs='+', help="path to tde fasta file(s)", required=True)
ap.add_argument("--transcript", nargs="+", required=False, help = "path to tde trascriptomic read files")

ap.add_argument('--o', help="path to tde output directory", required=True)

ap.add_argument("--prefix", help="", required=True)

ap.add_argument('--extract_prefix', type=str, required=False)
ap.add_argument('--extract_not_aligned',  nargs='+', help="path to all fasta files to witch reads did not match", required=False)
ap.add_argument('--extract_aligned',  nargs='+', help="path to all fasta files to witch reads match", required=False)

ap.add_argument("--no_images", default=False, action="store_true", required=False)

args = vars(ap.parse_args())
read_file = args["reads"]
cont_file = args["cont"]
proof_transcript = []
proof_transcript = args['transcript']
output_dir = args["o"]
prefix = args["prefix"]

extracted_not_aligned = args["extract_not_aligned"]
extracted_aligned = args["extract_aligned"]
extract_prefix = args["extract_prefix"]
makeImages = not args['no_images'] 

if prefix[-1] != "_":
    prefix += "_"

if not os.path.exists(output_dir):
    os.mkdir(output_dir)

for rf in read_file:
    if not (rf.endswith(".fastq") or rf.endswith(".fq") or rf.endswith(".tmp")):
        print('Please enter contamination in fastq format \n *Please no spaces in file name!*')
        print(rf)
        exit()

    if not os.path.isfile(rf):
        print('Read file does not exist \n *Please no spaces in file name!*')
        print(rf)
        exit()

for rf in cont_file:
    if not (rf.endswith(".fasta") or rf.endswith(".fa")):
        print('Please enter reference in fasta format \n *Please no spaces in file name!*')
        print(rf)
        exit()

    if not os.path.isfile(rf):
        print('Reference file does not exist \n *Please no spaces in file name!*')
        print(rf)
        exit()


def makeReport(resDict, fname):

    outHTML = """
    <html>
    <head>
    <title>sequ-into Overview</title>
    <style>
    img {
        display: block;
        margin-left: auto;
        margin-right: auto }

    table {
    border-collapse: collapse;
    width: 100%;
    }

    th, td {
    text-align: left;
    padding: 8px;
    }

    tr:nth-child(even){background-color: #f2f2f2}

    th {
    background-color: #4CAF50;
    color: white;
    }

    body {
        font-family: Arial, Helvetica, sans-serif;
    }
    </style> 
    </head>
    <body>
    """

    outHTML += "<h1>sequ-into report: "+os.path.basename(fname)+"</h1>" + "\n"

    outHTML += "<h2>Alignment Statistics</h2>" + "\n"

    outHTML += "<table><tbody>" + "\n"
    outHTML += "<tr><th>Statistics</th><th>Value</th><th>Rel. Value</th></tr>" + "\n"
    outHTML += "<tr><td>{tdesc}</td><td>{tval:8,d}</td><td>{rval:.5f}</td></tr>".format(tdesc="Total Reads", tval=resDict["totalReads"], rval=1.0) + "\n"
    outHTML += "<tr><td>{tdesc}</td><td>{tval:8,d}</td><td>{rval:.5f}</td></tr>".format(tdesc="Aligned Reads", tval=resDict["alignedReads"], rval=resDict["alignedReads"]/resDict["totalReads"]) + "\n"
    outHTML += "<tr><td>{tdesc}</td><td>{tval:8,d}</td><td>{rval:.5f}</td></tr>".format(tdesc="Unaligned Reads", tval=resDict["totalReads"]-resDict["alignedReads"], rval=(resDict["totalReads"]-resDict["alignedReads"])/resDict["totalReads"]) + "\n"
    outHTML += "<tr><td>{tdesc}</td><td>{tval:8,d}</td><td>{rval:.5f}</td></tr>".format(tdesc="Total Bases", tval=resDict["totalBases"], rval=1.0) + "\n"
    outHTML += "<tr><td>{tdesc}</td><td>{tval:8,d}</td><td>{rval:.5f}</td></tr>".format(tdesc="Alignment Bases", tval=resDict["alignmentBases"], rval=resDict["alignmentBases"]/resDict["totalBases"]) + "\n"
    outHTML += "<tr><td>{tdesc}</td><td>{tval:8,d}</td><td>{rval:.5f}</td></tr>".format(tdesc="Aligned Length", tval=resDict["alignedLength"], rval=resDict["alignedLength"]/resDict["totalBases"]) + "\n"
    outHTML += "<tr><td>{tdesc}</td><td>{tval:8,d}</td><td>{rval:.5f}</td></tr>".format(tdesc="Aligned Reads Bases", tval=resDict["alignedReadsBases"], rval=resDict["alignedReadsBases"]/resDict["totalBases"]) + "\n"
    outHTML += "<tr><td>{tdesc}</td><td>{tval:8,d}</td><td>{rval:.5f}</td></tr>".format(tdesc="Unaligned Bases", tval=resDict["unalignedBases"], rval=resDict["unalignedBases"]/resDict["totalBases"]) + "\n"
    outHTML += "</tbody></table>"


    outHTML += "<h2>Read Length Distribution (all reads)</h2>" + "\n"
    outHTML += "<img src=\"{tget}\"/>".format(tget=os.path.basename(resDict["readLengthPlot"])) + "\n"

    outHTML += "<h2>Read Length Distribution (reads <= 10kbp)</h2>" + "\n"
    outHTML += "<img src=\"{tget}\"/>".format(tget=os.path.basename(resDict["readLengthPlotSmall"])) + "\n"

    outHTML += "<h2>Aligned Reads Fraction</h2>" + "\n"
    outHTML += "<img src=\"{tget}\"/>".format(tget=os.path.basename(resDict["readsPie"])) + "\n"

    outHTML += "<h2>Aligned Bases Fraction</h2>" + "\n"
    outHTML += "<img src=\"{tget}\"/>".format(tget=os.path.basename(resDict["basesPie"])) + "\n"

    with open(resDict['overviewUrl'], 'w') as fout:

        fout.write(outHTML)


"""

PREPARE RANK PLOTS


"""

read2infoFile = {}
for x in read_file:
    infoFile = os.path.splitext(x)[0] + ".info"

    if os.path.isfile(infoFile):
        read2infoFile[x] = infoFile


read2RankPlotData = {}

if len(read2infoFile) > 0:

    for readFile in read2infoFile:

        time2read = defaultdict(list)

        with open(read2infoFile[readFile], 'r') as fin:

            idcolumn = 0
            timecolumn = 1

            for idx, content in enumerate(fin):

                acontent = content.strip().split("\t")
                if idx == 0 and acontent[0] == "READ_ID":
                    idcolumn = 1
                    timecolumn = 6
                    continue

                readid = acontent[idcolumn].split(" ")[0]
                readtime = int (acontent[timecolumn])
                time2read[readtime].append(readid)

        readid2bucket = {}
        bucket2readid = defaultdict(set)
        curBucketID = 0
        allBuckets = []
        allBuckets.append({"aligned": [], "unaligned": []})

        for timeStamp in sorted([x for x in time2read]):

            for readID in time2read[timeStamp]:
                
                if len(bucket2readid[curBucketID]) == 1000:
                    curBucketID += 1
                    allBuckets.append({"aligned": [], "unaligned": []})

                bucket2readid[curBucketID].add(readID)
                readid2bucket[readID] = curBucketID


        read2RankPlotData[readFile] = (readid2bucket, bucket2readid, allBuckets)









# Mapper/Aligner

import mappy as mp

refFile2Aligner = {}

# SAM FILE BEARBEITUNG
sam_file_to_dict = dict()
fasta_file_to_dict = dict()

for refFileIdx, refFile in enumerate(cont_file):

    a = mp.Aligner(refFile)  # load or build index
    if not a:
        raise Exception("ERROR: failed to load/build index")


    alignedLength = 0


    totalBases = 0
    alignedBases = 0
    alignmentBases = 0

    unalignedBases = 0
    unalignedReads = 0
    
    totalReads = 0
    alignedReads = 0
    alignedReadsBases = 0

    idAlignedReads = []
    idNotAlignedReads = []
    
    fasta_outname = re.sub('\W+', '_', refFile)    

    extractAlignedFile = None
    extractUnalignedFile = None

    if extracted_aligned:
        extractAlignedFile = open(os.path.join(output_dir, extract_prefix+ "_aligned_reads.fastq"), "w")

    if extracted_not_aligned:
        extractUnalignedFile = open(os.path.join(output_dir, extract_prefix+ "_aligned_reads.fastq"), "w")

    readLengths = []

    for fastqFile in read_file:
        for name, seq, qual in mp.fastx_read(fastqFile): # read a fasta/q sequence

            hasHit = False

            totalReads += 1
            totalBases += len(seq)
            readLengths.append(len(seq))


            for hit in a.map(seq): # traverse alignments

                if not hit.is_primary:
                    continue

                hasHit = True

                alignmentBases += hit.r_en-hit.r_st
                alignedBases += hit.mlen
                alignedLength += hit.blen

                #if transcript
                if proof_transcript is not None:
                    if fastqFile in proof_transcript:
                        skipped = 0
                        cigar_array = hit.cigar
                        for i in range(len(cigar_array)):
                            if cigar_array[i][0] == "N":
                                skipped += cigar_array[i][1]
                        alignmentBases = alignmentBases - skipped

                #print("{}\t{}\t{}\t{}".format(hit.ctg, hit.r_st, hit.r_en, hit.cigar_str))

            if not hasHit:
                idNotAlignedReads.append(name)
                unalignedReads += 1
                unalignedBases += len(seq)

                if extractUnalignedFile != None:
                    extractUnalignedFile.write("@"+name + "\n" + seq + "\n+\n" + qual + "\n")

            else:
                idAlignedReads.append(name)
                alignedReadsBases += len(seq)
                alignedReads += 1

                if extractAlignedFile != None:
                    extractAlignedFile.write("@"+name + "\n" + seq + "\n+\n" + qual + "\n")

            if fastqFile in read2RankPlotData:

                (readid2bucket, bucket2readid, allBuckets) = read2RankPlotData[fastqFile]

                readBucket = readid2bucket.get(name, None)

                if readBucket != None:

                    name_len = (name, len(seq))

                    if readBucket >= len(allBuckets):
                        readBucket = len(allBuckets)-1

                    if hasHit:
                        allBuckets[readBucket]["aligned"].append(name_len)
                    else:
                        allBuckets[readBucket]["unaligned"].append(name_len)
                
                read2RankPlotData[fastqFile] = (readid2bucket, bucket2readid, allBuckets)


    if refFileIdx == 0:

        try:
            readsLengthPlot = os.path.join(output_dir,prefix+"reads_length.png")
            readsLengthPlot10k = os.path.join(output_dir,prefix+"reads_length_10000.png")

            plt.figure(0)
            plt.ylabel('Frequency')
            plt.xlabel('Length of reads')
            plt.title('Length frequencies of all reads')
            plt.hist(readLengths, bins=100, color='green')
            plt.savefig(readsLengthPlot)
            plt.close()

            plt.figure(1)
            plt.ylabel('Frequency')
            plt.xlabel('Length of reads')
            plt.title('Length frequencies of all reads')
            plt.hist([x for x in readLengths if x < 10000], bins=100, color='green')
            plt.savefig(readsLengthPlot10k)
            plt.close()

        except ValueError:
            print('Some problems witd read file: Secondary ID line in FASTQ file doesnot start witd ''+''.')
            exit()


    readPiePlot = os.path.join(output_dir,prefix + "_" + fasta_outname + "read_pie.png")
    basesPiePlot = os.path.join(output_dir,prefix + "_" + fasta_outname + "bases_pie.png")
    rankPlot = None

    if makeImages:
        plt.figure(2)
        labels = ('Aligned\nReads\n(n={:,})'.format(alignedReads), 'Unaligned\nReads\n (n={:,})'.format(unalignedReads))
        patches, texts, autotexts = plt.pie([alignedReads, unalignedReads], explode=(0,0), labels=labels, colors=['gold', 'yellowgreen'],
                autopct='%1.1f%%', shadow=True, startangle=-10)
        plt.axis('equal')
        plt.savefig(readPiePlot, bbox_extra_artists=autotexts+texts)
        plt.close()

        plt.figure(3)
        labels = ('Aligned\n Bases\n(n={:,})'.format(alignedReadsBases), 'Unaligned\nBases\n(n={:,})'.format(unalignedBases))
        patches, texts, autotexts = plt.pie([alignedReadsBases, unalignedBases], explode=(0, 0), labels=labels, colors=['lightcoral', 'lightskyblue'],
                autopct='%1.1f%%', shadow=True, startangle=-10)
        plt.axis('equal')
        plt.savefig(basesPiePlot, bbox_extra_artists=autotexts+texts)
        plt.close()


        """
        PREPARE RANK PLOT
        """

        if fastqFile in read2RankPlotData:
            (readid2bucket, bucket2readid, allBuckets) = read2RankPlotData[fastqFile]

            xdata = []
            ydata = []

            rankAlignedCount = 0
            rankTotalCount = 0

            for idx, bucket in enumerate(allBuckets):

                rankAlignedBucket = len(bucket["aligned"])
                rankUnalignedBucket = len(bucket["unaligned"])

                rankAlignedCount += rankAlignedBucket
                rankTotalCount += rankAlignedBucket + rankUnalignedBucket

                rankAlignedFraction = 0
                
                if rankTotalCount > 0:
                    rankAlignedFraction = rankAlignedCount/rankTotalCount

                xdata.append( idx+1 )
                ydata.append( rankAlignedFraction )

            rankPlot = os.path.join(output_dir,prefix + "_" + fasta_outname + "rank_plot.png")

            plt.figure(4)


            if len(xdata) < 2:
                plt.scatter(xdata, ydata, marker="o", label="Aligned Fraction")
            else:
                plt.plot(xdata, ydata, label="Aligned Fraction")
            plt.title(r'Aligned ratio in sequencing samples')
            plt.xlabel(r'First $x \cdot 1000$ reads')
            plt.ylabel(r'Aligned ratio for first $x \cdot 1000$ reads [%]')
            plt.savefig(rankPlot, bbox_inches="tight")
            plt.close()


    tmp_dict = dict(
                    totalReads=totalReads,
                    alignedReads=alignedReads,
                    totalBases=totalBases,
                    alignmentBases=alignmentBases,
                    alignedLength=alignedLength,
                    unalignedBases=unalignedBases,
                    unalignedReads=unalignedReads,
                    alignedReadsBases=alignedReadsBases
                    )
                    #idAlignedReads=idAlignedReads,
                    #idNotAlignedReads=idNotAlignedReads

    if makeImages:
        tmp_dict["readLengthPlot"] = readsLengthPlot
        tmp_dict["readLengthPlotSmall"] = readsLengthPlot10k
        tmp_dict["readsPie"] = readPiePlot
        tmp_dict["basesPie"] = basesPiePlot
        tmp_dict["refs"] = [refFile]
        tmp_dict["overviewUrl"] = os.path.join(output_dir,prefix + "_" + fasta_outname + "overview.html")

        if rankPlot != None:
            tmp_dict["rankplot"] = rankPlot


        makeReport(tmp_dict, refFile)

    fasta_file_to_dict[refFile]=tmp_dict

print(json.dumps(fasta_file_to_dict))
