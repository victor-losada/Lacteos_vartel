import { list } from '@vercel/blob';

async function main() {
  const { blobs } = await list();
  
  console.log(`Total archivos: ${blobs.length}\n`);
  
  // Group by type
  const videos = blobs.filter(b => b.pathname.endsWith('.mp4') || b.pathname.endsWith('.MP4'));
  const others = blobs.filter(b => !b.pathname.endsWith('.mp4') && !b.pathname.endsWith('.MP4'));
  
  console.log('=== VIDEOS ===');
  for (const b of videos) {
    const sizeMB = (b.size / (1024 * 1024)).toFixed(2);
    console.log(`${b.pathname} | ${sizeMB} MB | ${b.url}`);
  }
  
  console.log('\n=== OTROS ===');
  for (const b of others) {
    const sizeKB = (b.size / 1024).toFixed(1);
    console.log(`${b.pathname} | ${sizeKB} KB | ${b.url}`);
  }
}

main().catch(console.error);
