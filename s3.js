import { S3Client, PutObjectCommand} from '@aws-sdk/client-s3'
import { AWS_BUCKET_REGION, AWS_PUBLIC_KEY, AWS_SECRET_KEY, AWS_BUCKET_NAME } from './config.js' 
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import express from 'express'   
import bodyParser from  'body-parser'
import cors from 'cors' 

const app = express()
app.use(cors());
 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/book', (req, res) => {
    
    try{
        const file = req.body.file
        const nameFile = req.body.nameFile
        const typeFile = req.body.typeFile
        const mimeTypeFile = req.body.mimeTypeFile

        if (file === "") return res.status(409).json("file param is required");
        if (nameFile === "") return res.status(409).json("Name file is required");
        if (typeFile === "") return res.status(409).json("Type file is required");
        if (mimeTypeFile === "") return res.status(409).json("mimeTypeFile file is required");

        if (file.trim().length === 0) return res.status(409).json({message: "file param is required"});
        if (nameFile.trim().length === 0) return res.status(409).json({message: "Name file is required"});
        if (typeFile.trim().length === 0) return res.status(409).json({message: "Type file is required"});
        if (mimeTypeFile.trim().length === 0) return res.status(409).json({message: "mimeTypeFile file is required"});

        const returnvalue =  uploadFile(file,nameFile,typeFile,mimeTypeFile);
        res.json({message: 'data successfully registered'})

    }catch (error) {
        res.json({message: error})
    }    
});

app.listen(3000)
console.log(`server on port ${3000}`);

const client = new S3Client({
    region: AWS_BUCKET_REGION,
    credentials: {
        accessKeyId: AWS_PUBLIC_KEY,
        secretAccessKey: AWS_SECRET_KEY
    }
})

 async function uploadFile(base64,nameFile ,typeFile ,mimeTypeFile) {
       
    const AWS = require('aws-sdk');   
    const { ACCESS_KEY_ID, SECRET_ACCESS_KEY, AWS_REGION, AWS_BUCKET_NAME } = process.env;

    
    AWS.config.setPromisesDependency(require('bluebird'));
    AWS.config.update({ accessKeyId: ACCESS_KEY_ID, secretAccessKey: SECRET_ACCESS_KEY, region: AWS_REGION });

    
    const s3 = new AWS.S3();

    const base64Data = new Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    // const type = base64.split(';')[0].split('/')[1];
    const type = typeFile ;

    console.log("type : ", type);

    const userId = nameFile
 
    const uploadParams = {
        Bucket: AWS_BUCKET_NAME,
        Key: `${userId}.${type}`, 
        Body: base64Data,
        ACL: 'public-read',
        ContentEncoding: 'base64',
        ContentType: `${mimeTypeFile}/${type}`
    }  

    console.log(uploadParams)

    try {
        const { Location, Key } = await s3.upload(uploadParams).promise();
        // location = Location;
        // key = Key 
      } catch (error) {
         console.log(error)
      }
    
}

  