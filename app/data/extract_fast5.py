import argparse
import os
import glob
import h5py
import sys
from pathlib import Path
from collections import OrderedDict
from enum import Enum
from collections import OrderedDict, Counter

import dateutil
import os

class FASTQ:

    def __init__(self, id, seq, qual):

        self.seq = seq.strip()
        self.id = id.strip()

        if id[0] == '@':
            self.id = id[1:]

        self.qual = qual.strip()

    def __str__(self):
        return '@' + self.id + os.linesep + self.seq + os.linesep + '+' + os.linesep + self.qual

    def __len__(self):
        return len(self.seq)

    @classmethod
    def parseFromStr(cls, fqrec):

        afq = fqrec.split("\n")

        return FASTQ(afq[0], afq[1], afq[3])


def makePath(path):
    """

    :param path: path to be normalized
    :return: normalizes path by adding path sep to end if needed (/tmp/bla -> /tmp/bla/)
    """
    if os.path.isfile(path):

        if path[len(path)-1] == os.path.sep:
            return path

        return path + os.path.sep

    else: # this assumes everything is a path ... which is wrong in so many ways ...

        if path[len(path)-1] == os.path.sep:
            return path

        return path + os.path.sep

class classproperty(object):
    """
    class to allow the usage of class properties (extension of class functions)
    """

    def __init__(self, fget):
        self.fget = fget

    def __get__(self, owner_self, owner_cls):
        return self.fget(owner_cls)


class Fast5TYPEAction(argparse.Action):
    def __call__(self, parser, args, values, option_string=None):

        try:

            if len(values) == 0:
                style = None

            else:

                style = []
                if type(values) == list:

                    for elem in values:
                        style.append(Fast5TYPE[elem])
                else:
                    style = [Fast5TYPE[values]]

            args.__dict__[self.dest] = style

        except:

            raise argparse.ArgumentError(None, 'Fast5TYPE can not be {n}, it must be one of {m}'.format(n=values, m=', '.join([str(x.value) for x in Fast5TYPE])))

class Fast5TYPE(Enum):
    PRE_BASECALL = 'PRE_BASECALL'
    BASECALL_RNN_1D = 'BASECALL_RNN_1D'
    BASECALL_1D = 'BASECALL_1D'
    BASECALL_1D_COMPL = 'BASECALL_1D_COMPL'
    BASECALL_2D = 'BASECALL_2D'
    BARCODING = 'BARCODING'
    UNKNOWN = 'UNKNOWN'

    def __str__(self):
        return self.name

    # @classproperty
    # def type2str(cls):
    #     """
    #     :return :dictionary of type to str for fast5 read types
    #     """
    #     return {x: x.name for x in list(cls)}
    #
    # @classproperty
    # def str2type(cls):
    #     """
    #     :return : dictionary of str to type for fast5 read types
    #     """
    #     return {x.name: x for x in list(cls)}

class Fast5FileException(Exception):
    pass

class Fast5File:

    @classmethod
    def join_paths(cls, prefix, suffix):

        if prefix[len(prefix)-1] == '/':
            prefix = prefix[0:len(prefix)-1]

        if len(suffix) > 0 and suffix[0] == '/':
            suffix = suffix[1:]

        return prefix + "/" + suffix


    @classproperty
    def analyses_paths(cls):
        return OrderedDict([
            (Fast5TYPE.BASECALL_2D, '/Analyses/Basecall_2D_%03d/'),
            (Fast5TYPE.BASECALL_1D_COMPL, '/Analyses/Basecall_1D_%03d/'),
            (Fast5TYPE.BASECALL_1D, '/Analyses/Basecall_1D_%03d/'),
            (Fast5TYPE.BASECALL_RNN_1D, '/Analyses/Basecall_RNN_1D_%03d/'),
            (Fast5TYPE.BARCODING, '/Analyses/Barcoding_%03d/'),
            (Fast5TYPE.PRE_BASECALL, '/Analyses/EventDetection_%03d/')
            #(Fast5TYPE.UNKNOWN, "")
        ])

    @classproperty
    def sequence_paths(cls):
        return OrderedDict([

            (Fast5TYPE.BASECALL_2D, 'BaseCalled_2D'),
            (Fast5TYPE.BASECALL_1D_COMPL, 'BaseCalled_complement'),
            (Fast5TYPE.BASECALL_1D, 'BaseCalled_template'),
            (Fast5TYPE.BASECALL_RNN_1D, 'BaseCalled_template'),
            (Fast5TYPE.BARCODING, 'Barcoding'),
            (Fast5TYPE.PRE_BASECALL, ''),
            (Fast5TYPE.UNKNOWN, "")

        ])

    def __init__(self, path, group=0, keep_file_open = False):

        self.filename = path
        self.type = None

        self.sequence_paths = {}
        self.winner = Fast5TYPE.BASECALL_1D

        self.hdf5file = None
        self.is_open = self._open(keep_file_open)

        self.pore = (-1, -1)
        self.timestamp = 0
        self.readnum = 0
        self.read_length = 0

    def _open(self, keep_open):

        self.hdf5file = h5py.File(self.filename, 'r')
        self.type = self._guessType()

        #self.printGroupsAttribs()

    def hdf_error(self, reason):

        msg = """hdf reading failure in file '%s': %s """ % (self.filename, reason)

        sys.exit(msg)

    def _guessType(self):

        for filetype in Fast5File.analyses_paths:
            
            analyses_path = Fast5File.analyses_paths[filetype]

            group = -1


            # findest highest group for filetype
            while True:

                analyses_group = analyses_path % (group+1)

                if not analyses_group in self.hdf5file:
                    break

                group += 1

            if group == -1:
                continue

            analyses_group = analyses_path % group

            seqpath = self.join_paths(analyses_group, Fast5File.sequence_paths[filetype])
    
            if not seqpath in self.hdf5file:
                #try alternative version
                seqpath = self.join_paths(analyses_group, "BaseCalled_template")

                if not seqpath in self.hdf5file:
                    continue

            self.sequence_paths = {}

            # get analyses_group . 'basecall_1d'
            if filetype == Fast5TYPE.BASECALL_2D:

                
                basecallAttrib = self._get_attribute(analyses_group, 'basecall_1d')                
                # if that returns None, attrib not existant => no 2D basecall
                if basecallAttrib != None:
                    
                    basecall1dpath = basecallAttrib #basecall1dpath = '/Analyses/' + basecallAttrib
                    self.sequence_paths[Fast5TYPE.BASECALL_1D] = self.join_paths( basecall1dpath , "BaseCalled_template" )
                    self.sequence_paths[Fast5TYPE.BASECALL_1D_COMPL] = self.join_paths( basecall1dpath , "BaseCalled_complement" )

                    eventpath = '/' + self._get_attribute(basecall1dpath, 'event_detection', "Analyses/EventDetection_000")
                    self.sequence_paths[Fast5TYPE.PRE_BASECALL] = eventpath


                self.sequence_paths[Fast5TYPE.BASECALL_2D] = seqpath
                self.winner = Fast5TYPE.BASECALL_2D

            elif filetype == Fast5TYPE.BASECALL_1D_COMPL:

                self.sequence_paths[Fast5TYPE.BASECALL_1D] = self.join_paths(analyses_group, "BaseCalled_template")
                self.sequence_paths[Fast5TYPE.BASECALL_1D_COMPL] = self.join_paths(analyses_group, "BaseCalled_complement")

                eventpath = '/' + self._get_attribute(analyses_group, 'event_detection',"Analyses/EventDetection_000")
                self.sequence_paths[Fast5TYPE.PRE_BASECALL] = eventpath

                self.winner = Fast5TYPE.BASECALL_1D_COMPL

            elif filetype == Fast5TYPE.BASECALL_1D:

                self.sequence_paths[Fast5TYPE.BASECALL_1D] = self.join_paths(analyses_group, "BaseCalled_template")

                eventpath = '/' + self._get_attribute(analyses_group, 'event_detection', "Analyses/EventDetection_000")
                self.sequence_paths[Fast5TYPE.PRE_BASECALL] = eventpath

                self.winner = Fast5TYPE.BASECALL_1D


            elif filetype == Fast5TYPE.BASECALL_RNN_1D:

                self.sequence_paths[Fast5TYPE.BASECALL_RNN_1D] = self.join_paths(analyses_group, "BaseCalled_template")

                eventpath = '/' + self._get_attribute(analyses_group, 'event_detection', "Analyses/EventDetection_000")
                self.sequence_paths[Fast5TYPE.PRE_BASECALL] = eventpath
                self.winner = Fast5TYPE.BASECALL_RNN_1D


            elif filetype == Fast5TYPE.PRE_BASECALL:

                self.sequence_paths[Fast5TYPE.PRE_BASECALL] = seqpath
                self.winner = None

            # set up available sequences

            # sanity check
            ftypeEjected=False
            for path in self.sequence_paths:

                temp_path = self.sequence_paths[path]
                exists = temp_path in self.hdf5file

                if not exists and not path == Fast5TYPE.PRE_BASECALL:
                    #print( temp_path + " " + str(temp_path in self.hdf5file))
                    ftypeEjected=True
                    
            if ftypeEjected:
                #print("Eject ftype", filetype)
                continue

            return filetype

        return Fast5TYPE.UNKNOWN

    def getFastQ(self, readType=None):

        if readType == None:
            readType = self.winner
       
        return self._read_fastq(readType)


    def _get_signal(self):

        iReadNum = self.readNumber()

        sSignalPath = 'Raw/Reads/Read_' + str(iReadNum)

        hdf_elem = self.hdf5file[sSignalPath]

        raw_signal = hdf_elem['Signal'][()]

        iSignalLength = len(raw_signal)

        return iSignalLength

    def _read_fastq(self, readType):

        try:

            if readType == None:
                return None

            pathToFQ = self.sequence_paths[readType]

            hdf_elem = self.hdf5file[pathToFQ]
            fastq_seq = hdf_elem['Fastq'][()]

            if not type(fastq_seq) == str:
                fastq_seq = fastq_seq.decode("utf-8")

            return FASTQ.parseFromStr(fastq_seq)

        except Exception as e:

            return None

    def _read_raw_signal(self):

        try:
            allevs=[]
            readNames = [x for x in self.hdf5file['Raw/Reads']]

            for readName in readNames:
                hdf_elem = self.hdf5file['Raw/Reads/'+readName]
                evs = hdf_elem['Signal'][()]

                allevs.append(evs)

            return allevs



        except Exception as e:

            return []

    def _read_events(self, readType):

        try:

            if readType == None:
                return None

            pathToFQ = self.sequence_paths[readType]

            hdf_elem = self.hdf5file[pathToFQ]
            fastq_seq = hdf_elem['Events'][()]

            return fastq_seq

        except Exception as e:

            return None

    def getSampleFrequency(self):
        return int(self._get_attribute('/UniqueGlobalKey/context_tags', 'sample_frequency', 4000))

    def getExperimentStartTime(self):

        timeAttribData = self._get_attribute('/UniqueGlobalKey/tracking_id', 'exp_start_time', None)

        try:
            timestamp = int(timeAttribData)
            return timestamp
        except:
            try:
                from dateutil import parser
                parsedTime = parser.parse(str(timeAttribData))
                timestamp = parsedTime.timestamp()
                return int(timestamp)

            except:
                raise Fast5FileException("Invalid exp start time format: " + str(timeAttribData))



    def readCreateTime(self):

        expStartTime = self.getExperimentStartTime()
        sampleFrequency = self.getSampleFrequency()

        if expStartTime == None:
            return None

        startTimes = self._read_attrib('start_time')

        if startTimes == None:
            path = "/Analyses/EventDetection_000/Reads/"+self.readID()
            startTimes = self._get_attribute(path, "start_time", None)
            

        if startTimes == None:
            return None

        if type(startTimes) == list:
            vReturn = [x + expStartTime for x in startTimes]
            return vReturn

        else:
            iReadStart = int(expStartTime + (startTimes / sampleFrequency))
            return iReadStart


    def _read_attrib(self, attribname):

        try:
            path = "/Raw/Reads/"

            if not path in self.hdf5file:
                path = "/Analyses/EventDetection_000/Reads/"               

            readsGroup = self.hdf5file[path]
            storedReads = readsGroup.keys()

            readNum = -1
            singleRead = True
            if len(storedReads) > 1:
                singleRead = False

                readNum = set()

            for read in storedReads:

                seqRead = self.hdf5file[path + read]

                if singleRead:
                    return seqRead.attrs[attribname]
                else:
                    readNum.add(seqRead.attrs[attribname])

            return readNum

        except:

            return None

    def _get_attribute(self, path, attrib, default=None):
        try:

            if path in self.hdf5file:
                hdf_elem = self.hdf5file[path]

                run_id = hdf_elem.attrs[attrib]

                if not type(run_id) == str:
                    return run_id.decode("utf-8")
                else:
                    return run_id

            raise Fast5FileException("Path does not exist: " + path)

        except:
            return default

    def user_filename_input(self):
        """

        :return: user_filename_input from UniqueGlobalKey/context_tags
        """
        return self._get_attribute("/UniqueGlobalKey/context_tags/", 'user_filename_input')

    def readNumber(self):
        """

        :return: read number, or set of read numbers (if multiple reads in file)
        """
        return int(self._read_attrib('read_number'))

    def readID(self):
        """

        :return: read number, or set of read numbers (if multiple reads in file)
        """
        return self._read_attrib('read_id').decode("utf-8")


    def runID(self):

        return self._get_attribute("/UniqueGlobalKey/tracking_id/", 'run_id')

    def channelID(self):

        return int(self._get_attribute("/UniqueGlobalKey/channel_id/", 'channel_number'))


    def _read_main_fastq(self):

        return self._read_fastq(self.type)

    def analyses(self):

        return [str(x) for x in self.hdf5file['Analyses']]

    def printGroupsAttribs(self):

        def printName(name):
            print(str(name) + " " + str([(k, v) for (k, v) in self.hdf5file[name].attrs.items()]))

        print(self.filename)
        print(self.type)

        self.hdf5file.visit(printName)

#>tig00000001 len=4527241 reads=33593 covStat=14412.82 gappedBases=no class=contig suggestRepeat=no suggestCircular=no

    def sequenceLength(self):

        seq = self.getFastQ()

        if seq == None:
            return -1

        return len(seq)

    def sequenceName(self):

        seq = self.getFastQ()

        if seq == None:
            return ""

        return seq.id

class Fast5Directory:

    def __init__(self, path):

        if not os.path.isdir(path):
            raise ValueError("Given path is not a directory: " + path)

        self.path = Path(path)

        print(self.path)
        self.filesIT = self.path.glob("**/*.fast5")

    def collect(self):

        for nextFile in self.filesIT:

            yield nextFile



if __name__ == '__main__':


    ap = argparse.ArgumentParser(description='--reads file1.fastq --cont file2.fasta file3.fasta')

    ap.add_argument("--folder", type=str, required=True, help="path to the read file")
    ap.add_argument("--count", type=int, required=False, default=-1, help="path to the read file")
    ap.add_argument("--log", type=argparse.FileType("w"), required=False, default=None, help="log file")

    args = ap.parse_args()

    f5folder = Fast5Directory(args.folder)

    iFilesInFolder = 0
    iFilesProcessedInFolder = 0
    collectedOutput = []

    allOutput = []

    with open(args.folder + "/reads.fastq", 'w') as fout, open(args.folder + "/reads.info", 'w') as ftimeout:

        for f5fileName in f5folder.collect():

            iFilesInFolder += 1

            if args.count != -1 and iFilesInFolder > args.count:
                break

            try:
                f5file = Fast5File(f5fileName) 

                output = f5file.getFastQ()
                createDate = f5file.readCreateTime()

                if not type(createDate) == int:
                    print(createDate)

                #dateTime = parser.parse(createDate)
                if output == None:
                    #print("Skipping", f5file.filename)
                    if args.log != None:
                        args.log.write("Skipping for no output: {fname}\n".format(fname=f5file.filename))
                    continue

                fout.write(str(output) + "\n")
                output.id = output.id.split(" ")[0]
                ftimeout.write(output.id + "\t" + str(int(createDate)) + "\n")
                iFilesProcessedInFolder += 1
            except:

                print("Could not read file", f5fileName, file=sys.stderr)
                continue

    print("Folder done: " + str(f5folder.path) + " [Files: " + str(iFilesProcessedInFolder) + "] ("+str(iFilesInFolder)+")")

