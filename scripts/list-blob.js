import { list } from '@vercel/blob';

async function listAllBlobs() {
  try {
    let cursor;
    let allBlobs = [];
    
    do {
      const result = await list({ cursor, limit: 100 });
      allBlobs = allBlobs.concat(result.blobs);
      cursor = result.cursor;
    } while (cursor);

    console.log(`Total files found: ${allBlobs.length}\n`);
    
    for (const blob of allBlobs) {
      console.log(`Pathname: ${blob.pathname}`);
      console.log(`URL: ${blob.url}`);
      console.log(`Size: ${(blob.size / 1024).toFixed(1)} KB`);
      console.log(`Content-Type: ${blob.contentType || 'unknown'}`);
      console.log(`Uploaded: ${blob.uploadedAt}`);
      console.log('---');
    }
  } catch (error) {
    console.error('Error listing blobs:', error);
  }
}

listAllBlobs();
