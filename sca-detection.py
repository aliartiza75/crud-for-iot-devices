import json

f = open("sca.json")


data = json.load(f)

if ("indirect_vulnerabilities" in list(data)) and ((data["indirect_vulnerabilities"] > 0)):
    raise Exception("SCA Tool detected issues")

f.close()
