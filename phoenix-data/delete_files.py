# Provide credentials with
# export AWS_ACCESS_KEY_ID=A
# export AWS_SECRET_ACCESS_KEY=5

import s3fs

s3 = s3fs.S3FileSystem(anon=False)

#bucket = 'air-sampling'
#path = '/phoenix/data'
bucket = 'caltech-phoenix-data'
path = ''

files = s3.ls(bucket + path)

count = len(files)

for file in files:
    if file.endswith('.json'):
        s3.rm(file)
    count -= 1
    print(count)




