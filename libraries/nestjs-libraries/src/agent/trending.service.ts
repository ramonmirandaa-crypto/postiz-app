import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';
import { TavilySearch } from '@langchain/tavily';

const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-proj-',
  model: 'gpt-4.1',
  temperature: 0.5,
});

export interface TrendingTopic {
  topic: string;
  category: string;
  trend: 'rising' | 'stable' | 'declining';
  engagement: 'high' | 'medium' | 'low';
  opportunity: 'excellent' | 'good' | 'moderate';
  contentAngles: string[];
  bestPostingTime: string;
  hashtags: string[];
  relatedTopics: string[];
  competitorCoverage: 'low' | 'medium' | 'high';
}

export interface TrendReport {
  generatedAt: string;
  niche: string;
  overview: string;
  topTopics: TrendingTopic[];
  contentRecommendations: string[];
  timingSuggestions: string[];
  platformSpecific: {
    platform: string;
    recommendations: string[];
  }[];
}

@Injectable()
export class TrendingService {
  private tavily: TavilySearch | null = null;

  constructor() {
    if (process.env.TAVILY_API_KEY) {
      this.tavily = new TavilySearch({
        maxResults: 8,
        includeAnswer: true,
      });
    }
  }

  async getTrendingTopics(niche: string, count: number = 10): Promise<TrendingTopic[]> {
    let searchResults: any[] = [];
    
    if (this.tavily) {
      const results = await this.tavily.invoke(`trending topics ${niche} social media 2026`);
      searchResults = results.results || [];
    }

    const topicsPrompt = ChatPromptTemplate.fromTemplate(`
      Analyze the following trending topics and provide detailed information about each.
      
      Niche: {niche}
      
      Search results: {results}
      
      For each trending topic provide:
      - Topic name
      - Category classification
      - Trend direction (rising/stable/declining)
      - Engagement level (high/medium/low)
      - Opportunity level (excellent/good/moderate)
      - Content angles (different ways to approach this topic)
      - Best posting time recommendation
      - Relevant hashtags
      - Related topics
      - Competitor coverage level
    `);

    const structuredOutput = model.withStructuredOutput(z.object({
      topics: z.array(z.object({
        topic: z.string().describe('Trending topic name'),
        category: z.string().describe('Topic category'),
        trend: z.enum(['rising', 'stable', 'declining']).describe('Trend direction'),
        engagement: z.enum(['high', 'medium', 'low']).describe('Engagement level'),
        opportunity: z.enum(['excellent', 'good', 'moderate']).describe('Opportunity level'),
        contentAngles: z.array(z.string()).describe('Different angles to approach this topic'),
        bestPostingTime: z.string().describe('Best time to post about this topic'),
        hashtags: z.array(z.string()).describe('Relevant hashtags'),
        relatedTopics: z.array(z.string()).describe('Related topics'),
        competitorCoverage: z.enum(['low', 'medium', 'high']).describe('How much competitors are covering this'),
      })).describe('Trending topics'),
    }));

    const result = await topicsPrompt.pipe(structuredOutput).invoke({
      niche,
      results: searchResults.map((r: any) => `${r.title}: ${r.content || r.snippet}`).join('\n'),
    });

    return result.topics.slice(0, count);
  }

  async generateTrendReport(niche: string, platforms?: string[]): Promise<TrendReport> {
    const topics = await this.getTrendingTopics(niche, 5);
    
    const overviewPrompt = ChatPromptTemplate.fromTemplate(`
      Based on the following trending topics, generate a comprehensive trend report.
      
      Niche: {niche}
      Trending topics: {topics}
      {platforms ? `Platforms: ${platforms.join(', ')}` : ''}
      
      Generate:
      1. An overview of the current state of the niche
      2. Content recommendations based on the trends
      3. Timing suggestions for posting
      4. Platform-specific recommendations (if platforms provided)
    `);

    const structuredOutput = model.withStructuredOutput(z.object({
      overview: z.string().describe('Overview of the niche current state'),
      contentRecommendations: z.array(z.string()).describe('Content recommendations'),
      timingSuggestions: z.array(z.string()).describe('Best timing suggestions'),
      platformSpecific: z.array(z.object({
        platform: z.string(),
        recommendations: z.array(z.string()),
      })).describe('Platform-specific recommendations'),
    }));

    const result = await overviewPrompt.pipe(structuredOutput).invoke({
      niche,
      topics: topics.map(t => `${t.topic} (${t.trend}, ${t.engagement} engagement)`).join('\n'),
      platforms: platforms || [],
    });

    return {
      generatedAt: new Date().toISOString(),
      niche,
      overview: result.overview,
      topTopics: topics,
      contentRecommendations: result.contentRecommendations,
      timingSuggestions: result.timingSuggestions,
      platformSpecific: result.platformSpecific,
    };
  }

  async suggestContentIdeas(topic: TrendingTopic, count: number = 5): Promise<string[]> {
    const ideasPrompt = ChatPromptTemplate.fromTemplate(`
      Generate {count} content ideas based on the following trending topic.
      
      Topic: {topic}
      Category: {category}
      Content angles: {angles}
      
      Create engaging, platform-optimized content ideas that leverage this trend.
    `);

    const structuredOutput = model.withStructuredOutput(z.object({
      ideas: z.array(z.object({
        title: z.string().describe('Content title/hook'),
        description: z.string().describe('Brief description of the content'),
        format: z.string().describe('Suggested format (video, post, thread, etc.)'),
        hook: z.string().describe('Compelling opening hook'),
        keyPoints: z.array(z.string()).describe('Key points to cover'),
        cta: z.string().describe('Call to action'),
      })).describe('Content ideas'),
    }));

    const result = await ideasPrompt.pipe(structuredOutput).invoke({
      topic: topic.topic,
      category: topic.category,
      angles: topic.contentAngles.join(', '),
      count,
    });

    return result.ideas.map((idea, index) => 
      `📌 ${idea.title}\n${idea.description}\n🎬 Format: ${idea.format}\n✨ Hook: ${idea.hook}\n📝 Key Points: ${idea.keyPoints.join(', ')}\n💫 CTA: ${idea.cta}`
    );
  }
}