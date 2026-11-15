import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { TavilySearch } from '@langchain/tavily';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-proj-',
  model: 'gpt-4.1',
  temperature: 0.3,
});

export interface ResearchResult {
  query: string;
  results: {
    title: string;
    url: string;
    content: string;
  }[];
  summary: string;
  insights: string[];
  sources: string[];
}

export interface CompetitorAnalysis {
  competitor: string;
  strengths: string[];
  weaknesses: string[];
  contentPatterns: string[];
  engagementTactics: string[];
  postingFrequency: string;
  topContent: {
    type: string;
    content: string;
    engagement: string;
  }[];
}

@Injectable()
export class DeepResearchService {
  private tavily: TavilySearch | null = null;

  constructor() {
    if (process.env.TAVILY_API_KEY) {
      this.tavily = new TavilySearch({
        maxResults: 10,
        includeAnswer: true,
        includeRawContent: true,
      });
    }
  }

  async conductResearch(query: string, focus?: string): Promise<ResearchResult> {
    const searchQuery = focus ? `${query} ${focus}` : query;
    
    let results: any[] = [];
    
    if (this.tavily) {
      const searchResults = await this.tavily.invoke(searchQuery);
      results = searchResults.results || [];
    } else {
      const webSearch = new TavilySearch({ maxResults: 5 });
      const searchResults = await webSearch.invoke(searchQuery);
      results = searchResults.results || [];
    }

    const sources = results.map((r: any) => r.url).filter(Boolean);
    
    const summaryPrompt = ChatPromptTemplate.fromTemplate(`
      You are a research assistant. Based on the following search results, provide a comprehensive summary and key insights.
      
      Query: {query}
      
      Results:
      {results}
      
      Provide:
      1. A summary of the findings (2-3 sentences)
      2. Key insights (bullet points)
      3. Actionable takeaways for social media content creation
    `);

    const structuredOutput = model.withStructuredOutput(z.object({
      summary: z.string().describe('Summary of the research findings'),
      insights: z.array(z.string()).describe('Key insights from the research'),
      takeaways: z.array(z.string()).describe('Actionable takeaways for social media'),
    }));

    const analysis = await summaryPrompt
      .pipe(structuredOutput)
      .invoke({
        query,
        results: results.map((r: any) => `${r.title}\n${r.content || r.snippet}`).join('\n\n'),
      });

    return {
      query,
      results: results.map((r: any) => ({
        title: r.title,
        url: r.url,
        content: r.content || r.snippet,
      })),
      summary: analysis.summary,
      insights: analysis.insights,
      sources,
    };
  }

  async analyzeCompetitors(competitors: string[], niche: string): Promise<CompetitorAnalysis[]> {
    const analyses: CompetitorAnalysis[] = [];

    for (const competitor of competitors) {
      const query = `${competitor} ${niche} social media strategy`;
      const research = await this.conductResearch(query, 'social media');

      const analysisPrompt = ChatPromptTemplate.fromTemplate(`
        Analyze the competitor's social media presence and content strategy.
        
        Competitor: {competitor}
        Niche: {niche}
        Research: {research}
        
        Provide:
        1. Strengths (what they do well)
        2. Weaknesses (what could be improved)
        3. Content patterns (recurring themes/formats)
        4. Engagement tactics (how they interact with audience)
        5. Posting frequency (estimated)
        6. Top performing content types
      `);

      const structuredOutput = model.withStructuredOutput(z.object({
        strengths: z.array(z.string()).describe('What the competitor does well'),
        weaknesses: z.array(z.string()).describe('Areas where the competitor could improve'),
        contentPatterns: z.array(z.string()).describe('Recurring content themes and formats'),
        engagementTactics: z.array(z.string()).describe('How they engage with their audience'),
        postingFrequency: z.string().describe('Estimated posting frequency'),
        topContent: z.array(z.object({
          type: z.string().describe('Type of content'),
          content: z.string().describe('Description of the content'),
          engagement: z.string().describe('Engagement level'),
        })).describe('Top performing content types'),
      }));

      const analysis = await analysisPrompt.pipe(structuredOutput).invoke({
        competitor,
        niche,
        research: research.summary,
      });

      analyses.push({
        competitor,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        contentPatterns: analysis.contentPatterns,
        engagementTactics: analysis.engagementTactics,
        postingFrequency: analysis.postingFrequency,
        topContent: analysis.topContent,
      });
    }

    return analyses;
  }

  async generateContentIdeas(topic: string, category: string, count: number = 5): Promise<string[]> {
    const research = await this.conductResearch(topic, category);
    
    const ideasPrompt = ChatPromptTemplate.fromTemplate(`
      Based on the following research, generate {count} unique content ideas for social media posts.
      
      Topic: {topic}
      Category: {category}
      
      Research insights: {insights}
      
      Generate engaging, trend-aware content ideas that would perform well on social media.
      Each idea should include:
      - A compelling hook
      - Core message/topic
      - Call to action suggestion
    `);

    const structuredOutput = model.withStructuredOutput(z.object({
      ideas: z.array(z.object({
        hook: z.string().describe('Compelling hook for the post'),
        message: z.string().describe('Core message of the content'),
        cta: z.string().describe('Suggested call to action'),
      })).describe('Content ideas'),
    }));

    const result = await ideasPrompt.pipe(structuredOutput).invoke({
      topic,
      category,
      count,
      insights: research.insights.join('\n'),
    });

    return result.ideas.map((idea, index) => 
      `Hook: ${idea.hook}\nMessage: ${idea.message}\nCTA: ${idea.cta}`
    );
  }

  async getTrendingTopics(niche: string, platform?: string): Promise<{topic: string; trend: string; opportunity: string}[]> {
    const query = platform 
      ? `trending ${niche} topics ${platform} 2026`
      : `trending ${niche} topics social media 2026`;
    
    const research = await this.conductResearch(query, 'trending');

    const trendsPrompt = ChatPromptTemplate.fromTemplate(`
      Identify current trending topics and opportunities in the following research.
      
      Niche: {niche}
      {platform ? `Platform: ${platform}` : ''}
      
      Research: {research}
      
      Provide top trending topics with:
      - Topic name
      - Current trend direction
      - Opportunity for content creation
    `);

    const structuredOutput = model.withStructuredOutput(z.object({
      trends: z.array(z.object({
        topic: z.string().describe('Trending topic name'),
        trend: z.string().describe('Current trend direction'),
        opportunity: z.string().describe('Why this is an opportunity'),
      })).describe('Trending topics'),
    }));

    const result = await trendsPrompt.pipe(structuredOutput).invoke({
      niche,
      platform: platform || '',
      research: research.summary,
    });

    return result.trends;
  }
}