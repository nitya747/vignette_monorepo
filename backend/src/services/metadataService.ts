import fetch from 'node-fetch';
import { ExtractResponse } from '../types/index.js';
import { ValidationError } from '../middleware/errorHandler.js';

export async function extractYouTubeMetadata(url: string): Promise<ExtractResponse> {
  if (!url) {
    throw new ValidationError({ url: 'URL is required' }, 'URL is required');
  }

  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);

  if (!match) {
    throw new ValidationError(
      { url: 'Invalid format' },
      'Invalid YouTube URL format. Please enter a standard video link.'
    );
  }

  const videoId = match[1];
  const targetUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(targetUrl)}&format=json`;

  console.log(`[Backend API] Fetching oEmbed metadata from YouTube for video: ${videoId}`);

  try {
    const response = await fetch(oembedUrl);
    if (!response.ok) {
      throw new Error(`YouTube oEmbed returned status ${response.status}`);
    }

    const metadata: any = await response.json();
    const title = metadata.title || 'Untitled YouTube Video';
    const author = metadata.author_name || 'YouTube Creator';

    const stopWords = new Set([
      'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent', 
      'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 
      'cant', 'cannot', 'could', 'couldnt', 'did', 'didnt', 'do', 'does', 'doesnt', 'doing', 'dont', 
      'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadnt', 'has', 'hasnt', 'have', 
      'havent', 'having', 'he', 'hed', 'hell', 'hes', 'her', 'here', 'heres', 'hers', 'herself', 'him', 
      'himself', 'his', 'how', 'hows', 'i', 'id', 'ill', 'im', 'ive', 'if', 'in', 'into', 'is', 'isnt', 
      'it', 'its', 'itself', 'lets', 'me', 'more', 'most', 'mustnt', 'my', 'myself', 'no', 'nor', 'not', 
      'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 
      'own', 'same', 'shant', 'she', 'shed', 'shell', 'shes', 'should', 'shouldnt', 'so', 'some', 'such', 
      'than', 'that', 'thats', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'theres', 
      'these', 'they', 'theyd', 'theyll', 'theyre', 'theyve', 'this', 'those', 'through', 'to', 'too', 
      'under', 'until', 'up', 'very', 'was', 'wasnt', 'we', 'wed', 'well', 'were', 'weve', 'werent', 
      'what', 'whats', 'when', 'whens', 'where', 'wheres', 'which', 'while', 'who', 'whos', 'whom', 
      'why', 'whys', 'with', 'wont', 'would', 'wouldnt', 'you', 'youd', 'youll', 'youre', 'youve', 
      'your', 'yours', 'yourself', 'yourselves'
    ]);

    const words = title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((word: string) => word.length > 2 && !stopWords.has(word));

    const uniqueKeywords = Array.from(new Set(words)).slice(0, 5).join(', ');

    return {
      title,
      author,
      topic: `A detailed video discussion regarding: ${title}`,
      keywords: uniqueKeywords || 'youtube, video, tutorial, viral'
    };

  } catch (fetchError: any) {
    console.error(`[Backend API] oEmbed metadata fetch failed for video ID ${videoId}:`, fetchError);
    throw new ValidationError(
      { url: 'Metadata fetch failed' },
      `Failed to retrieve YouTube video metadata. The video might be private, deleted, or the system is experiencing rate limits: ${fetchError?.message || fetchError}`
    );
  }
}
