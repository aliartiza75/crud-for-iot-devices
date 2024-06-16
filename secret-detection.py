import json
f = open("secret-detection-job.json")
data = json.load(f)
if len(list(data["results"])) > 0:
    raise Exception("Secrets found")
f.close()
