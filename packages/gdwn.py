import gdown, sys
import os

path = os.path.expanduser('~/.cache/gdown')
os.makedirs(path, exist_ok=True)

url = sys.argv[1]

file_id = url.split('/')[-2]  

prefix = 'https://drive.google.com/uc?export=download&id='

gdown.download(prefix+file_id) 

