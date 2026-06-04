import { Jimp } from 'jimp';

async function main() {
  console.log('Reading generated image...');
  const image = await Jimp.read('C:/Users/Nitya/.gemini/antigravity/brain/37df3d1b-2b02-4f70-9353-150180574a40/vigi_thumbnail_director_1780570350486.png');
  
  console.log('Removing white background...');
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    
    // Check if the pixel color is close to solid white
    if (r > 245 && g > 245 && b > 245) {
      this.bitmap.data[idx + 3] = 0; // Set alpha to 0 (transparent)
    }
  });

  console.log('Saving processed image...');
  await image.write('c:/Users/Nitya/.gemini/antigravity/scratch/vignette_monorepo/frontend/public/mascot_camera_nobg.png');
  console.log('Background removed successfully and image saved to public assets!');
}

main().catch(console.error);
