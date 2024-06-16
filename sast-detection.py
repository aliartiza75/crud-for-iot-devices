import json

f = open("gi.json")


data = json.load(f)


for measure in data["component"]["measures"]:
    if int(measure["value"]) > 0:
        raise Exception("SAST Tool detected issues")

f.close()
