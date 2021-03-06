import argparse
import os
import glob
import h5py
import sys
from pathlib import Path
from collections import OrderedDict
from enum import Enum
from collections import OrderedDict, Counter, defaultdict
from flask import Flask, jsonify, request, redirect, url_for, send_from_directory
import re
import matplotlib as mpl
mpl.use('Agg')
import matplotlib.pyplot as plt
import math
from dateutil import parser as dtparser
import os
import mappy as mp
import json
from itertools import chain
import logging
from flask import Flask

app = Flask(__name__)

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

    outHTML += "<h2>Read Length Distribution (aligned reads)</h2>" + "\n"
    outHTML += "<img src=\"{tget}\"/>".format(tget=os.path.basename(resDict["alignedReadLengthPlot"])) + "\n"

    outHTML += "<h2>Aligned Reads Fraction</h2>" + "\n"
    outHTML += "<img src=\"{tget}\"/>".format(tget=os.path.basename(resDict["readsPie"])) + "\n"

    outHTML += "<h2>Aligned Bases Fraction</h2>" + "\n"
    outHTML += "<img src=\"{tget}\"/>".format(tget=os.path.basename(resDict["basesPie"])) + "\n"

    with open(resDict['overviewUrl'], 'w') as fout:

        fout.write(outHTML)


class ResultEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, set):
            return list(obj)

        return json.JSONEncoder.default(self, obj)


def saveExistingResults( erInfo, erFile):

    with open(erFile, 'w') as fout:
        json.dump(erInfo, fout, cls=ResultEncoder)



def loadExistingResults( erFile, defaultObj=dict ):

    print("Trying to load existing result", erFile)

    try:

        if erFile == None:
            return defaultObj()

        if not os.path.isfile(erFile) or not os.path.exists(erFile):
            print("Not a file", erFile)

            return defaultObj()

        # load results

        with open(erFile, 'r') as fin:

            lres = json.load(fin)

        return lres
    except:

        return defaultObj()

def calculateReadRanks(read2infoFile):

    read2RankPlotData = {}

    if len(read2infoFile) > 0:

        for readFile in read2infoFile:

            time2read = defaultdict(list)

            infoFilename = read2infoFile[readFile]

            if infoFilename != None:
                with open(infoFilename, 'r') as fin:

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

            logging.debug("bucket2readid")
            for bucketID in bucket2readid:
                logging.debug("bucketID {} length {}".format(bucketID, len(bucket2readid[bucketID])))

            read2RankPlotData[readFile] = (readid2bucket, bucket2readid, allBuckets)

    return read2RankPlotData




def toBool(strElem):

    if strElem == None:
        return False

    if strElem.upper() in ["1", "T", "TRUE"]:
        return True

    if strElem.upper() in ["0", "F", "FALSE"]:
        return False

    return False




@app.route('/ready')
def is_ready():

    retResponse = app.make_response((jsonify({'ready': True}), 200, None))
    retResponse.mimetype = "application/json"

    return retResponse




@app.route('/align', methods=['POST'])
def align():
    reqData = request.get_json(force=True, silent=True)

    if reqData == None:
        return app.make_response((jsonify( {'error': 'invalid json'} ), 400, None))


    logging.debug(reqData)
    """

    GETTING SETTINGS

    """
    readFiles = reqData.get("reads", [])
    existingResultsInfo = reqData.get("results", None)

    readsAreTranscriptomic = toBool(reqData.get("transcriptomic", "False"))
    makeImages = toBool(reqData.get("images", "True"))

    output_dir = reqData.get("outdir", None)
    prefix = reqData.get("prefix", "")

    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    """

    reads: self.allFiles,
    results: outdir + "/.results",
    outdir: outdir,
    prefix: "extracted",
    extractAligned: extractAligned,
    extractUnaligned: extractUnaligned,
    extractAllAligned: extractAllAligned,
    extractAllUnaligned: extractAllUnaligned,
    extractDir: readOutputDir

    """

    extractDir = reqData.get("extractDir", None)
    extractAligned = reqData.get("extractAligned", None)
    extractUnaligned = reqData.get("extractUnaligned", None)
    extractAllAligned = reqData.get("extractAllAligned", None)
    extractAllUnaligned = reqData.get("extractAllUnaligned", None)
    useExistingResults = reqData.get("useExisting", None)

    canExtract = extractDir != None
    canExtractAllAligned = None
    canExtractAllUnaligned = None

    if canExtract:
        logging.debug("Extract MODE")

        def makeNormPaths(inobj):
            newEA = []  
            for x in inobj:
                logging.debug(x)
                ny = {}
                for y in x:
                    ny[y] = os.path.normpath(x[y])
                newEA.append(ny)

            return newEA


        logging.debug("Aligned extract")
        if extractAligned != None:
            extractAligned = makeNormPaths(extractAligned)

        logging.debug("Unaligned extract")
        if extractUnaligned != None:
            extractUnaligned = makeNormPaths(extractUnaligned)

    if canExtract and not os.path.isdir(extractDir):
        logging.debug("Creating Extract Dir {}".format(extractDir) )
        os.makedirs(extractDir)

    if useExistingResults == None:
        useExistingResults = True

    else:
        if str(useExistingResults).upper() == "FALSE":
            useExistingResults = False
        else:
            useExistingResults = True

    """

    PREPARING RESULTS

    """
    existingResults = {}
    existingResultsOverview = None

    if not canExtract and useExistingResults:
        existingResults = loadExistingResults(existingResultsInfo)
        existingResultsOverview = loadExistingResults(existingResultsInfo + "_overview", defaultObj=list)

    if existingResultsOverview == None or len(existingResultsOverview) == 0:
        existingResultsOverview = [set(), defaultdict(set)]

    else:
        existingResultsOverview[0] = set([(x[0], x[1]) for x in existingResultsOverview[0]])

        for ex in existingResultsOverview[1]:
            existingResultsOverview[1][ex] = set([(x[0], x[1]) for x in existingResultsOverview[1][ex]])

    read2infoFile = {}
    for x in readFiles:
        infoFile = os.path.splitext(x)[0] + ".info"

        if os.path.isfile(infoFile):
            read2infoFile[x] = infoFile
        #else:
        #    read2infoFile[x] = None

    for fastqFile in readFiles:

        reads_fname = re.sub('\W+', '_', fastqFile)    

        logging.debug("FastqFile {} {}".format( fastqFile, reads_fname) )

        extractAllAlignedFile = None
        extractAllUnalignedFile = None

        canExtractAllAligned = None
        canExtractAllUnaligned = None

        if canExtract:

            for x in extractAllAligned:                
                if "reads" in x and os.path.normpath(x["reads"]) == fastqFile:
                    extractAllAlignedFile = open(os.path.join(extractDir, prefix+"_" + "all" + "_aligned_"+getShortName(reads_fname, 25)+".fastq"), "w")
                    break

            for x in extractAllUnaligned:                
                if "reads" in x and os.path.normpath(x["reads"]) == fastqFile:
                    extractAllUnalignedFile = open(os.path.join(extractDir, prefix+"_" + "all" + "_unaligned_"+getShortName(reads_fname, 25)+".fastq"), "w")
                    break



        for refFileIdx, refFile in enumerate(refFile2aligner):

            read2RankPlotData = calculateReadRanks(read2infoFile)

            canExtractAllAlignedFQ = None
            canExtractAllUnalignedFQ = None

            if extractAllAlignedFile != None or extractAllUnalignedFile != None:
                canExtractAllAlignedFQ = set()
                canExtractAllUnalignedFQ = set()


            logging.debug("RefFile {}".format( refFile))

            a = refFile2aligner[refFile]

            logging.debug("Aligning: {} {}".format( refFile, fastqFile) )

            reference_fname = re.sub('\W+', '_', refFile)    
            refreadFname = "_".join([getShortName(reference_fname, 25), getShortName(reads_fname, 25)])

            ## preparing info file
            infoFile = os.path.splitext(fastqFile)[0] + ".info"
            readName2Batch = {}

            ## info file exists
            if os.path.isfile(infoFile):
                print("INFO file for input", fastqFile, infoFile)

                
                with open(infoFile, 'r') as fin:
                    for line in fin:
                        line = line.strip().split("\t")
                        nameElems = line[0].split(" ")
                        readName = nameElems[0]
                        readBatch = line[3]

                        readName2Batch[readName] = readBatch
            else:
                print("No INFO file for input", fastqFile, infoFile)
                                   

            #exists a info file

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
            
            
            def comboContained(ref, reads, einfo):

                if einfo == None:
                    return False

                for x in einfo:

                    if "ref" in x and x["ref"] != ref:
                        continue

                    if "reads" in x and x["reads"] == reads:
                        return True

                return False
                        

            extractAlignedFile = None
            extractUnalignedFile = None

            if canExtract and comboContained(ref=refFile, reads=fastqFile, einfo=extractAligned):
                extractAlignedFile = open(os.path.join(extractDir, prefix+"_" + refreadFname + "_aligned_reads.fastq"), "w")
            else:
                if canExtract:
                    logging.debug("Combo not contained in aligned: {} {} {}".format(refFile, fastqFile, extractAligned))

            if canExtract and comboContained(ref=refFile, reads=fastqFile, einfo=extractUnaligned):
                extractUnalignedFile = open(os.path.join(extractDir, prefix+"_" + refreadFname + "_unaligned_reads.fastq"), "w")
            else:
                if canExtract:
                    logging.debug("Combo not contained in unaligned: {} {} {}".format( refFile, fastqFile, extractUnaligned) )

            readLengths = []
            alignedReadLengths = []
            usedReadBatches = set()

            alreadyUsedBatches = existingResults.get(makeJsonKey(refFile, fastqFile), {}).get("usedReadBatches", set())
            readRankBuckets = []

            logging.debug("Already used Batches/Ignoring Batches {}".format( alreadyUsedBatches))

            fastqAlreadyContained = 0

            for name, seq, qual in mp.fastx_read(fastqFile): # read a fasta/q sequence

                if name in readName2Batch:
                    readBatch = readName2Batch[name]
                    usedReadBatches.add( readBatch )

                    if readBatch in alreadyUsedBatches:
                        fastqAlreadyContained += 1
                        continue
                else:

                    if len(readName2Batch) > 0:
                        logging.warn("Unknown read name", name)

                hasHit = False

                totalReads += 1
                totalBases += len(seq)
                readLengths.append(len(seq))

                existingResultsOverview[0].add((fastqFile, name))


                for hit in a.map(seq): # traverse alignments

                    if not hit.is_primary:
                        continue

                    hasHit = True

                    alignmentBases += hit.r_en-hit.r_st
                    alignedBases += hit.mlen
                    alignedLength += hit.blen

                    #if transcript
                    if readsAreTranscriptomic:
                        if fastqFile in readsAreTranscriptomic:
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

                    if canExtractAllUnalignedFQ != None:
                        canExtractAllUnalignedFQ.add((name, seq, qual))

                else:

                    if canExtractAllAlignedFQ != None:
                        canExtractAllAlignedFQ.add((name, seq, qual))
                    
                    if not refFile in existingResultsOverview[1]:
                        existingResultsOverview[1][refFile] = set()
                    existingResultsOverview[1][refFile].add((fastqFile, name))

                    idAlignedReads.append(name)
                    alignedReadsBases += len(seq)
                    alignedReads += 1

                    alignedReadLengths.append(len(seq))

                    if extractAlignedFile != None:
                        extractAlignedFile.write("@"+name + "\n" + seq + "\n+\n" + qual + "\n")

                if fastqFile in read2RankPlotData:

                    (readid2bucket, bucket2readid, readRankBuckets) = read2RankPlotData[fastqFile]

                    readBucket = readid2bucket.get(name, None)

                    if readBucket != None:

                        name_len = (name, len(seq))

                        if readBucket >= len(readRankBuckets):
                            readBucket = len(readRankBuckets)-1

                        if hasHit:
                            readRankBuckets[readBucket]["aligned"].append(name_len)
                        else:
                            readRankBuckets[readBucket]["unaligned"].append(name_len)
                    
                    read2RankPlotData[fastqFile] = (readid2bucket, bucket2readid, readRankBuckets)

            # full information
            logging.debug("Finished Fastq {} with skipped reads {}".format(fastqFile, fastqAlreadyContained))


            # derived information
            tmp_dict = dict(
                            alignedReadLengths=alignedReadLengths,
                            allReadLengths=readLengths,
                            totalReads=totalReads,
                            alignedReads=alignedReads,
                            totalBases=totalBases,
                            alignmentBases=alignmentBases,
                            alignedLength=alignedLength,
                            unalignedBases=unalignedBases,
                            unalignedReads=unalignedReads,
                            alignedReadsBases=alignedReadsBases,
                            usedReadBatches=usedReadBatches.union(alreadyUsedBatches),
                            fastq=set([fastqFile]),
                            reference=set([refFile])
                            )
                            #idAlignedReads=idAlignedReads,
                            #idNotAlignedReads=idNotAlignedReads

            logging.debug("{} {} {}".format(refFile, fastqFile, tmp_dict["usedReadBatches"]))

            if fastqFile in read2RankPlotData:
                (a, b, readRankBuckets) = read2RankPlotData[fastqFile]
                logging.debug("read rank buckets stats")
                for bIdx, rRB in enumerate(readRankBuckets):
                    logging.debug("{} {} {} {} {}".format(refFile, fastqFile, bIdx, len(rRB["aligned"]), len(rRB["unaligned"])))

            if makeJsonKey(refFile, fastqFile) in existingResults:

                originalRRB = existingResults[makeJsonKey(refFile, fastqFile)].get("readRankBuckets", [])
                existingResults[makeJsonKey(refFile, fastqFile)]=mergeResults(existingResults[makeJsonKey(refFile, fastqFile)], tmp_dict)

                logging.debug("orig read rank buckets stats")
                for bIdx, orrb in enumerate(originalRRB):
                    logging.debug("{} {} {} {} {}".format(refFile, fastqFile, bIdx, len(orrb["aligned"]), len(orrb["unaligned"])))

                exReadRankBuck = list(originalRRB)#existingResults[makeJsonKey(refFile, fastqFile)]["readRankBuckets"]
                for bucketID, rrBucket in enumerate(readRankBuckets):

                    alignedElems = rrBucket["aligned"]
                    unalignedElems = rrBucket["unaligned"]

                    if len(exReadRankBuck) <= bucketID:
                        exReadRankBuck.append( {"aligned": [], "unaligned": []} )

                    exReadRankBuck[bucketID]["aligned"] += alignedElems
                    exReadRankBuck[bucketID]["unaligned"] += unalignedElems

                existingResults[makeJsonKey(refFile, fastqFile)]["readRankBuckets"] = exReadRankBuck                    

            else:
                existingResults[makeJsonKey(refFile, fastqFile)] = tmp_dict

                if fastqFile in read2RankPlotData:
                    (a, b, readRankBuckets) = read2RankPlotData[fastqFile]
                    existingResults[makeJsonKey(refFile, fastqFile)]["readRankBuckets"] = readRankBuckets

            if extractAlignedFile != None:
                extractAlignedFile.close()

            if extractUnalignedFile != None:
                extractUnalignedFile.close()


            if canExtractAllAligned == None and canExtractAllAlignedFQ != None:
                canExtractAllAligned = canExtractAllAlignedFQ
            elif canExtractAllAligned != None and canExtractAllAlignedFQ != None:
                canExtractAllAligned = canExtractAllAligned.intersection(canExtractAllAlignedFQ)

            if canExtractAllUnaligned == None and canExtractAllUnalignedFQ != None:
                canExtractAllUnaligned = canExtractAllUnalignedFQ
            elif canExtractAllUnaligned != None and canExtractAllUnalignedFQ != None:
                canExtractAllUnaligned = canExtractAllUnaligned.intersection(canExtractAllUnalignedFQ)
    
        if extractAllAlignedFile != None:

            trueExtractAll = canExtractAllAligned.difference(canExtractAllUnaligned)

            for name, seq, qual in trueExtractAll:
                extractAllAlignedFile.write("@"+name + "\n" + seq + "\n+\n" + qual + "\n")
            extractAllAlignedFile.close()

        if extractAllUnalignedFile != None:

            trueExtractAll = canExtractAllUnaligned.difference(canExtractAllAligned)

            for name, seq, qual in trueExtractAll:
                extractAllUnalignedFile.write("@"+name + "\n" + seq + "\n+\n" + qual + "\n")
            extractAllUnalignedFile.close()


    if canExtract:
        retResponse = app.make_response(("{\"extract_status\": \"done\"}", 200, None))
        logging.debug("Extract exit")
        return retResponse

    updatedFastqFiles = set()
    for mkey in existingResults:

        refFile, fastqFile = fromJsonKey(mkey)

        reference_fname = re.sub('\W+', '_', refFile)    
        reads_fname = re.sub('\W+', '_', fastqFile)    

        refreadFname = "_".join([getShortName(reference_fname, 25), getShortName(reads_fname, 25)])

        currentElement = existingResults[mkey]

        try:
            readsLengthPlot = os.path.join(output_dir,prefix+ "_" + reads_fname + "reads_length.png")
            readsLengthPlot10k = os.path.join(output_dir,prefix+"_" + reads_fname + "reads_length_10000.png")

            if not fastqFile in updatedFastqFiles:
                #only once per update ...
                readLengths = currentElement["allReadLengths"]
                alignedReadLengths = currentElement["alignedReadLengths"]

                prepareLengthHistograms(readLengths, readsLengthPlot, titleAdd=" (all, n={})".format(len(readLengths)))
                sub10kReads = [x for x in readLengths if x < 10000]
                prepareLengthHistograms( sub10kReads, readsLengthPlot10k, titleAdd=" < 10kbp (n={})".format(len(sub10kReads)))

                updatedFastqFiles.add(fastqFile)


            alignedReadsLengthPlot = os.path.join(output_dir,prefix + "_" + refreadFname + "aligned_read_lengths.png")
            prepareLengthFrequencyPlot(alignedReadLengths, alignedReadsLengthPlot)

            readPiePlot = os.path.join(output_dir,prefix + "_" + refreadFname + "read_pie.png")
            basesPiePlot = os.path.join(output_dir,prefix + "_" + refreadFname + "bases_pie.png")

            prepareReadsPiePlot(currentElement["alignedReads"], currentElement["unalignedReads"], readPiePlot)
            prepareBasesPiePlot(currentElement["alignmentBases"], currentElement["unalignedBases"], basesPiePlot)

            rankPlot = None

            if "readRankBuckets" in currentElement:
                allBuckets = currentElement["readRankBuckets"]
                rankPlot = os.path.join(output_dir,prefix + "_" + refreadFname + "rank_plot.png")
                prepareRankPlot(allBuckets, rankPlot)

            currentElement["readLengthPlot"] = readsLengthPlot
            currentElement["readLengthPlotSmall"] = readsLengthPlot10k
            currentElement["alignedReadLengthPlot"] = alignedReadsLengthPlot
            currentElement["readsPie"] = readPiePlot
            currentElement["basesPie"] = basesPiePlot
            currentElement["refs"] = [refFile]
            currentElement["overviewUrl"] = os.path.join(output_dir,prefix + "_" + refreadFname + "overview.html")

            if rankPlot != None:
                currentElement["rankplot"] = rankPlot

            existingResults[makeJsonKey(refFile, fastqFile)] = currentElement

        except ValueError:
            logging.error('Some problems with read file: Secondary ID line in FASTQ file doesnot start with ''+''.')

            exit()


        makeReport(existingResults[makeJsonKey(refFile, fastqFile)], refFile)

    saveExistingResults(existingResults, existingResultsInfo)
    saveExistingResults(existingResultsOverview, existingResultsInfo + "_overview")

    upsetPlotPath = os.path.join(output_dir,prefix+ "upset_reads_aligned.png")
    overviewPlotPath = os.path.join(output_dir,prefix+ "pie_reads_aligned.png")

    showReadAssignments(existingResultsOverview, upsetPlotPath)
    showReadAssignmentOverview(existingResultsOverview, overviewPlotPath)

    for mkey in existingResults:

        for field in ["alignedReadLengths", "readRankBuckets", "allReadLengths"]:
            if field in existingResults[mkey]:
                del existingResults[mkey][field]


    #for mkey in existingResults:
    #    print(mkey, [x for x in existingResults[mkey]])

    jsonStr = json.dumps({
        "general": {
            "upset": upsetPlotPath
        },
        "analysis": existingResults
    }, cls=ResultEncoder)

    retResponse = app.make_response((jsonStr, 200, None))
    retResponse.mimetype = "application/json"

    logging.debug("general exit")
    return retResponse


def getShortName(inputStr, length):

    if len(inputStr) < length:
        return inputStr

    return inputStr[-length:]

keySplitString = "_;_"
def makeJsonKey(k1, k2):
    return k1 + keySplitString + k2

def fromJsonKey(k):
    return tuple(k.split(keySplitString))

def mergeResults( dict1, dict2, resultType=dict):
    dict3 = resultType()

    if dict1 == None:
        return dict2

    if dict2 == None:
        return dict1

    for k, v in chain(dict1.items(), dict2.items()):

        if k in dict3:


            if type(dict3[k]) == tuple and type(v) not in [tuple, set, list]:
                oldvals = list(dict3[k])
                oldvals.append(v)
                dict3[k] = tuple(oldvals)

            else:

                if type(dict3[k]) == list and type(v) == set:
                    # special case for jsonified sets
                    dict3[k] = set(dict3[k]).union(v)
                    continue

                elif not type(v) == type(dict3[k]):
                    print(k, type(v), type(dict3[k]))
                    raise Exception("You try to merge two different objects!")

                if type(v) == list:

                    dict3[k] = dict3[k] + v

                elif type(v) == set:

                    dict3[k] = dict3[k].union(v)

                elif type(v) == dict:

                    dict3[k] = mergeDicts(dict3[k], v)

                elif type(v) == Counter:

                    dict3[k] = mergeCounter(dict3[k], v)

                elif type(v) == defaultdict:
                    dict3[k] = mergeDefaultDict(dict3[k], v)

                elif type(v) == int or type(v) == float:
                    dict3[k] = dict3[k] + v

                else:
                    retSet = set()
                    retSet.add(v)
                    retSet.add(dict3[k])

                    if len(retSet) != 1:
                        dict3[k] = tuple(retSet)
                    else:
                        dict3[k] = tuple(retSet)[0]
        else:

            dict3[k] = v

    return dict3    


def prepareRankPlot(allBuckets, rankPlotPath):
    xdata = []
    ydata = []

    rankAlignedCount = 0
    rankTotalCount = 0

    logging.debug("Read Rank Plot")

    for idx, bucket in enumerate(allBuckets):

        nbucketAligned = set([tuple(x) for x in bucket["aligned"]])
        nbucketUnaligned = set([tuple(x) for x in bucket["unaligned"]])

        rankAlignedBucket = len(nbucketAligned)
        rankUnalignedBucket = len(nbucketUnaligned)

        logging.debug("Bucket Idx {} Aligned: {} Unaligned: {}".format(idx, rankAlignedBucket, rankUnalignedBucket))

        rankAlignedCount += rankAlignedBucket
        rankTotalCount += rankAlignedBucket + rankUnalignedBucket

        rankAlignedFraction = 0
        
        if rankTotalCount > 0:
            rankAlignedFraction = rankAlignedCount/rankTotalCount

        xdata.append( idx+1 )
        ydata.append( rankAlignedFraction )

    logging.debug("Read Rank Plot Finish")


    plt.figure()

    if len(xdata) < 2:
        plt.scatter(xdata, ydata, marker="o", label="Aligned Fraction")
    else:
        plt.plot(xdata, ydata, label="Aligned Fraction")
    plt.title(r'Aligned ratio in sequencing samples')
    plt.xlabel(r'$x$th bin of 1000 reads')
    plt.ylabel(r'Aligned ratio [%]')
    plt.savefig(rankPlotPath, bbox_inches="tight")
    plt.close()

def prepareReadsPiePlot( alignedReads, unalignedReads, readPiePlotPath):

    plt.figure()
    labels = ('Aligned\nReads\n(n={:,})'.format(alignedReads), 'Unaligned\nReads\n (n={:,})'.format(unalignedReads))
    patches, texts, autotexts = plt.pie([alignedReads, unalignedReads], explode=(0,0), labels=labels, colors=['gold', 'yellowgreen'],
            autopct='%1.1f%%', shadow=True, startangle=-10)
    plt.axis('equal')
    plt.savefig(readPiePlotPath, bbox_extra_artists=autotexts+texts, bbox_inches="tight")
    plt.close()

def prepareBasesPiePlot(alignedReadsBases, unalignedBases, basesPiePlotPath):

    plt.figure()
    labels = ('Aligned\n Bases\n(n={:,})'.format(alignedReadsBases), 'Unaligned\nBases\n(n={:,})'.format(unalignedBases))
    patches, texts, autotexts = plt.pie([alignedReadsBases, unalignedBases], explode=(0, 0), labels=labels, colors=['lightcoral', 'lightskyblue'],
            autopct='%1.1f%%', shadow=True, startangle=-10)
    plt.axis('equal')
    plt.savefig(basesPiePlotPath, bbox_extra_artists=autotexts+texts, bbox_inches="tight")
    plt.close()

def prepareLengthHistograms(readLengths, plotPath, titleAdd=""):
    plt.figure()
    plt.ylabel('Frequency')
    plt.xlabel('Length of reads' + titleAdd)
    plt.title('Length frequencies of reads' + titleAdd)
    plt.hist(readLengths, bins=100, color='green')
    plt.savefig(plotPath, bbox_inches="tight")
    plt.close()

def prepareLengthFrequencyPlot( readLengths, readLengthPlot):
    #plt.figure(11)
    #plt.ylabel('Frequency')
    #plt.xlabel('Length of aligned reads')
    #plt.title('Length frequencies of aligned reads (n='+str(len(readLengths))+')')
    #plt.hist(readLengths, bins=100, color='green')
    #plt.savefig(readLengthPlot, bbox_inches="tight")
    #plt.close()

    prepareLengthHistograms(readLengths, readLengthPlot, titleAdd=" (aligned, n=" + str(len(readLengths)) + ")")
    

def showReadAssignmentOverview(assigns, plotPath):

    global refFile2type
    global refFile2color

    plotData = {}
    allReadNames = assigns[0]
   
    for x in assigns[1]:
        plotData[refFile2type[x]] = assigns[1][x]
        allReadNames = allReadNames.difference(assigns[1][x])

    plotData["Unaligned"] = allReadNames

    unalignedCount = len(plotData.get("Unaligned", []))
    offtargetCount = len(plotData.get("off_target", []))
    ontargetCount = len(plotData.get("target", []))

    plt.figure()
    labels = (  'Off-target\n Reads\n(n={:,})'.format(offtargetCount),
                'On-target\n Reads\n(n={:,})'.format(ontargetCount),
                'Unaligned\n Reads\n(n={:,})'.format(unalignedCount)
            )

    colors = (
        'lightcoral', 'lightskyblue', "grey"
    )

    patches, texts, autotexts = plt.pie([offtargetCount, ontargetCount, unalignedCount], explode=(0, 0, 0), labels=labels, colors=colors,
            autopct='%1.1f%%', shadow=True, startangle=-10)
    plt.axis('equal')

    plt.savefig(plotPath, bbox_extra_artists=autotexts+texts, bbox_inches="tight")
    plt.close()

    return plotPath

from ModUpset import UpSet
from upsetplot import from_contents

def showReadAssignments(assigns, upsetPlotPath):
    #assigns should be a map from reffile -> set(readname)    
    plotData = {}
    allReadNames = assigns[0]

    for x in assigns[1]:
        plotData[x] = assigns[1][x]

        allReadNames = allReadNames.difference(assigns[1][x])

    plotData["Unaligned"] = allReadNames

    aoCount = 1
    while len(plotData) < 2:
        plotData["Ignored {}".format(aoCount)] = []

    logging.debug("show Read Assignments Data")
    for x in plotData:
        logging.debug("{} {}".format(x, len(plotData[x])))


    upIn = from_contents(plotData)
    
    UpSet(upIn, set2color=refFile2color, subset_size="auto", show_counts='%d').plot(None)

    plt.savefig(upsetPlotPath, bbox_inches="tight")
    plt.close()

    return upsetPlotPath



refFile2aligner = {}
refFile2type = {}
refFile2color = {}

if __name__ == '__main__':

    ap = argparse.ArgumentParser(description='--references genome.fa')

    ap.add_argument("--references", type=argparse.FileType("r"), nargs='+', required=True, help="path to the read file")
    ap.add_argument("--ref_type", type=str, nargs='+', required=False, default=None, help="path to the read file")
    ap.add_argument('--port', type=int, default=5000, required=False)

    args = ap.parse_args()

    logging.basicConfig(filename="/tmp/silog",level=logging.DEBUG, filemode='w')
    mplLogger = logging.getLogger('matplotlib')
    mplLogger.setLevel(logging.WARNING)

    logging.info("Starting server on node {}".format(args.port))


    for refFileIdx, refFile in enumerate(args.references):

        logging.debug("Loading ref file {}".format(refFile))
        logging.debug("Ref File path {}".format(refFile.name))

        refFilePath = os.path.normpath(refFile.name)
        logging.debug("Normed Ref File Path {} {}".format(refFile.name, refFilePath))

        a = mp.Aligner(refFilePath)  # load or build index
        if not a:
            raise Exception("ERROR: failed to load/build index")

        refFile2aligner[refFilePath] = a

        if args.ref_type != None:
            refFile2type[refFilePath] = args.ref_type[refFileIdx]
        else:
            refFile2type[refFilePath] = "target"

        if refFile2type[refFilePath] == "target":
            refFile2color[refFilePath] = "green"
        else:
            refFile2color[refFilePath] = "red"

    logging.debug("Hosting server")
    app.run(threaded=True, host="0.0.0.0", port=args.port)

