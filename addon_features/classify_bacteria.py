import urllib.request


with open("./bacteria.details.txt") as fin:

    for idx, line in enumerate(fin):

        if idx == 0:
            continue

        line = line.strip().split("\t")
        accNum = line[0]

        accID = accNum.split(".")[0]

        bacName = line[4]
        abacName = bacName.split(" ")

        mbacName = " ".join([abacName[i] for i in range(0, min(2, len(abacName)))])

        print(accID, accID + ".embl", mbacName, sep="\t")


