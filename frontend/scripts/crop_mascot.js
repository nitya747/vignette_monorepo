import { Jimp } from 'jimp';

async function main() {
  const imgPath = 'C:/Users/Nitya/.gemini/antigravity/brain/f7784e4a-cd88-4ad2-8e0a-9d5c473f16fa/media__1780585794283.jpg';
  const image = await Jimp.read(imgPath);
  
  // Crop parameters (we can adjust these)
  // Mascot in 1024x646 image is on the right side
  const cropX = 660;
  const cropY = 180;
  const cropW = 320;
  const cropH = 340;
  
  console.log(`Cropping from (${cropX}, ${cropY}) with size ${cropW}x${cropH}...`);
  image.crop({ x: cropX, y: cropY, w: cropW, h: cropH });

  console.log('Removing background pixels...');
  // The background of the mockup is a cream/beige color. 
  // Let's identify the background color by inspecting the corners of the cropped area or using color ranges.
  // The page background is around #FAF6F0 (R: 250, G: 246, B: 240)
  // Let's make anything close to this background color transparent.
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    
    // Check if color is close to #FAF6F0 (cream) or white
    // E.g., R > 238, G > 230, B > 220
    if (r > 238 && g > 230 && b > 220) {
      this.bitmap.data[idx + 3] = 0; // Transparent
    }
  });

  const outPath = 'c:/Users/Nitya/.gemini/antigravity/scratch/vignette_monorepo/frontend/public/mascot_camera_crop_test.png';
  await image.write(outPath);
  console.log(`Saved crop to ${outPath}`);
}

main().catch(console.error);
