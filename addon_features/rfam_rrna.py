interestOrgs = ["Homo sapiens", "Rattus norvegicus", "Mus musculus", "Arabidopsis thaliana", "Caenorhabditis elegans", "Danio rerio"]

def processFile(fin, seqtype):
    for line in fin:

        if line.startswith(">"):
            curID = line.strip()
            curID = curID[1:]

        else:
            curSeq = line.strip()

            for interestOrg in interestOrgs:

                if interestOrg in curID:
                    #>CM000682.2/57360992-57360054 Homo sapiens chromosome 20, GRCh38 reference primary assembly.
                    accid = curID.split("/")[0]
                    lname = curID.split(" ")[0]

                    print("{org}\t{accid}\t{lname}\t{type}\t{seq}".format(org=interestOrg, accid=accid, lname=lname, type=seqtype, seq=curSeq))


with open("RF00177.fa","r") as fin:
    processFile(fin, "RF00177")

with open("RF01960.fa","r") as fin:
    processFile(fin, "RF01960")