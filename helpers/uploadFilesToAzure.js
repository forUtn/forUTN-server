const azureStorage = require('azure-storage');
const blobService = azureStorage.createBlobService(process.env.AZURE_STORAGE_CONNECTION_STRING);
const containerName = 'forutn-container';
const getStream = require('into-stream');
const blobUrl = 'https://forutntest.blob.core.windows.net/forutn-container';

const getBlobName = originalName => {
    const identifier = Math.random().toString().replace(/0\./,'');
    return identifier+"-"+originalName;
}

const uploadFilesToAzure = async (files) => {
    const uploadPromises = files.map(file => {
        return new Promise((resolve, reject) => {
            const blobName = getBlobName(file.originalname);
            const streamLength = file.buffer.length;
            const stream = getStream(file.buffer);
            
            blobService.createBlockBlobFromStream(containerName, blobName, stream, streamLength, (err, result) => {
                if (err) {
                    console.log("ERROR:", err);
                    reject(err);
                } else {
                    resolve({
                        name: file.originalname, 
                        urlFile: `${blobUrl}/${blobName}`
                    });
                }
            });
        });
    });
    
    return Promise.all(uploadPromises);
}


module.exports = uploadFilesToAzure;
