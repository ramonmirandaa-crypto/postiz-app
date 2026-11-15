import { Injectable } from '@nestjs/common';
import { DallEAPIWrapper, OpenAIImageGeneration } from '@langchain/openai';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import { UploadFactory } from '@gitroom/nestjs-libraries/upload/upload.factory';
import { MediaService } from '@gitroom/nestjs-libraries/database/prisma/media/media.service';

const dalle3 = new DallEAPIWrapper({
  apiKey: process.env.OPENAI_API_KEY || 'sk-proj-',
  model: 'dall-e-3',
  style: 'natural',
  quality: 'standard',
  size: '1024x1024',
});

const imageModel = new OpenAIImageGeneration({
  apiKey: process.env.OPENAI_API_KEY || 'sk-proj-',
  modelName: 'dall-e-3',
});

const imageGenModel = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-proj-',
  model: 'gpt-4o',
  temperature: 0.8,
});

export interface GeneratedImage {
  url: string;
  revisedPrompt?: string;
  style?: string;
  dimensions?: string;
}

export interface ImageStyle {
  name: string;
  prompt: string;
  description: string;
}

@Injectable()
export class ImageGenerationService {
  private storage = UploadFactory.createStorage();
  
  private styles: ImageStyle[] = [
    { name: 'photographic', prompt: 'photorealistic, professional photography', description: 'Realistic photos' },
    { name: 'digital-art', prompt: 'digital art, illustration style, vibrant colors', description: 'Digital illustration' },
    { name: 'minimalist', prompt: 'minimalist design, clean lines, simple colors', description: 'Minimalist' },
    { name: 'corporate', prompt: 'professional corporate illustration, clean design', description: 'Corporate/business' },
    { name: 'social-media', prompt: 'social media post design, bold typography, modern', description: 'Social media optimized' },
    { name: 'storytelling', prompt: 'cinematic, storytelling visual, dramatic lighting', description: 'Cinematic/storytelling' },
    { name: 'flat-design', prompt: 'flat design illustration, vector art style', description: 'Flat design' },
    { name: 'gradient', prompt: 'gradient background, modern design, vibrant', description: 'Modern gradient' },
  ];

  constructor(private _mediaService: MediaService) {}

  async generateImage(
    prompt: string,
    style?: string,
    size: '1024x1024' | '1024x1792' | '1792x1024' = '1024x1024'
  ): Promise<GeneratedImage> {
    let finalPrompt = prompt;
    
    if (style && this.styles.find(s => s.name === style)) {
      const selectedStyle = this.styles.find(s => s.name === style)!;
      finalPrompt = `${prompt}, ${selectedStyle.prompt}, high quality`;
    }

    try {
      const imageUrl = await dalle3.invoke(finalPrompt);
      
      return {
        url: imageUrl as string,
        style: style || 'default',
        dimensions: size,
      };
    } catch (error) {
      console.error('DALL-E generation failed:', error);
      throw new Error('Failed to generate image');
    }
  }

  async generateMultipleImages(
    prompts: string[],
    style?: string
  ): Promise<GeneratedImage[]> {
    return Promise.all(
      prompts.map(prompt => this.generateImage(prompt, style))
    );
  }

  async enhancePrompt(content: string, platform?: string): Promise<string> {
    const structuredOutput = imageGenModel.withStructuredOutput(z.object({
      enhancedPrompt: z.string().describe('Enhanced image generation prompt'),
      style: z.string().describe('Suggested style'),
      composition: z.string().describe('Suggested composition'),
    }));

    const promptTemplate = ChatPromptTemplate.fromTemplate(`
      You are an expert at creating image prompts for AI image generators like DALL-E.
      Enhance the following social media post content into a detailed image generation prompt.
      
      Content: {content}
      Platform: {platform}
      
      Consider:
      - Platform-specific requirements (Instagram, Twitter, LinkedIn, etc.)
      - Modern aesthetic standards
      - Visual storytelling elements
      - Brand-safe content (no logos, text overlays, or copyrighted elements)
      
      Create a prompt that will generate an engaging, platform-optimized image.
    `);

    const result = await promptTemplate
      .pipe(structuredOutput)
      .invoke({
        content,
        platform: platform || 'general',
      });

    return result.enhancedPrompt;
  }

  async generateThumbnail(
    title: string,
    niche: string,
    style: 'professional' | 'playful' | 'dramatic' | 'minimalist' = 'professional'
  ): Promise<GeneratedImage> {
    const thumbnailPrompts: Record<string, string> = {
      professional: `Professional thumbnail for video titled "${title}" in ${niche} niche, clean design, high contrast text area, cinematic lighting`,
      playful: `Colorful, playful thumbnail for content titled "${title}" in ${niche}, fun design, vibrant colors, engaging`,
      dramatic: `Dramatic thumbnail for "${title}" in ${niche}, dark background, spotlight effect, bold contrast`,
      minimalist: `Minimalist thumbnail for "${title}" in ${niche}, clean design, lots of whitespace, modern`,
    };

    return this.generateImage(thumbnailPrompts[style]);
  }

  async uploadGeneratedImage(imageUrl: string, orgId: string, filename?: string): Promise<string> {
    const upload = await this.storage.uploadSimple(imageUrl);
    const name = filename || upload.split('/').pop()!;
    const uploadWithId = await this._mediaService.saveFile(orgId, name, upload);
    return uploadWithId;
  }

  async generateAndUpload(
    prompt: string,
    orgId: string,
    style?: string
  ): Promise<string> {
    const generated = await this.generateImage(prompt, style);
    return this.uploadGeneratedImage(generated.url, orgId);
  }

  getAvailableStyles(): ImageStyle[] {
    return this.styles;
  }
}