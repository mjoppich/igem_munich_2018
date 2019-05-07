import urllib.request
from collections import defaultdict


seenBacs = defaultdict(list)



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

        #print(accID, accID + ".embl", mbacName, sep="\t")

        seenBacs[mbacName].append(accID)

for bacClass in seenBacs:

    for bacID in seenBacs[bacClass]:

        baseURL = "https://www.ebi.ac.uk/ena/data/view/"+bacID+"&display=txt&expanded=true"

        print(baseURL)
        print("\tout=./genomes/"+bacID+".embl")

        break