import {
  IAIService,
  AISuggestion,
  AIAnalysisRequest
} from '../../application/interfaces/IAIService';

/**
 * Mock AI Service Implementation
 * Provides simulated AI suggestions for request analysis
 * 
 * REPLACEMENT GUIDE:
 * To replace this mock with a real AI implementation:
 * 
 * 1. Create a new class implementing IAIService (e.g., OpenAIService)
 * 2. Implement the analyzeRequest method with real AI API calls
 * 3. Update the dependency injection in the Lambda handlers
 * 
 * Example real implementation structure:
 * ```typescript
 * export class OpenAIService implements IAIService {
 *   constructor(private apiKey: string) {}
 *   
 *   async analyzeRequest(request: AIAnalysisRequest): Promise<AISuggestion> {
 *     // Call OpenAI API with structured output
 *     // Parse and return the suggestion
 *   }
 * }
 * ```
 */
export class MockAIService implements IAIService {
  private readonly mockDelay: number;

  constructor(mockDelayMs: number = 100) {
    this.mockDelay = mockDelayMs;
  }

  async analyzeRequest(request: AIAnalysisRequest): Promise<AISuggestion> {
    // Simulate API delay
    await this.delay(this.mockDelay);

    // Generate mock response based on description length and keywords
    const complexity = this.determineComplexity(request.description);
    const estimatedDays = this.estimateDays(complexity, request.description);
    const suggestedTasks = this.generateTasks(request.title, complexity);
    const risks = this.identifyRisks(request.description, complexity);

    return {
      suggested_tasks: suggestedTasks,
      complexity,
      estimated_days: estimatedDays,
      risks
    };
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private determineComplexity(description: string): 'low' | 'medium' | 'high' {
    const lowercaseDesc = description.toLowerCase();

    // Keywords indicating high complexity
    const highComplexityKeywords = [
      'integration',
      'migration',
      'architecture',
      'security',
      'performance',
      'scalability',
      'real-time',
      'distributed',
      'microservices',
      'machine learning',
      'ai',
      'blockchain'
    ];

    // Keywords indicating medium complexity
    const mediumComplexityKeywords = [
      'api',
      'database',
      'authentication',
      'reporting',
      'dashboard',
      'automation',
      'workflow',
      'notification'
    ];

    const highMatches = highComplexityKeywords.filter(k => lowercaseDesc.includes(k)).length;
    const mediumMatches = mediumComplexityKeywords.filter(k => lowercaseDesc.includes(k)).length;

    if (highMatches >= 2 || (highMatches >= 1 && description.length > 500)) {
      return 'high';
    }

    if (mediumMatches >= 2 || (mediumMatches >= 1 && description.length > 200)) {
      return 'medium';
    }

    return 'low';
  }

  private estimateDays(complexity: 'low' | 'medium' | 'high', description: string): number {
    const baseEstimates = {
      low: 3,
      medium: 8,
      high: 20
    };

    let estimate = baseEstimates[complexity];

    // Adjust based on description length (more detail = more work)
    if (description.length > 300) estimate += 2;
    if (description.length > 600) estimate += 3;

    return estimate;
  }

  private generateTasks(title: string, complexity: 'low' | 'medium' | 'high'): string[] {
    const baseTasks = [
      'Requirements analysis and clarification',
      'Technical design document',
      'Development and implementation',
      'Unit testing',
      'Integration testing',
      'Documentation update',
      'Code review',
      'Deployment preparation'
    ];

    const additionalTasks: Record<'low' | 'medium' | 'high', string[]> = {
      low: [],
      medium: [
        'Database schema design',
        'API endpoint development',
        'User acceptance testing'
      ],
      high: [
        'Architecture review',
        'Security assessment',
        'Performance testing',
        'Load testing',
        'Disaster recovery planning',
        'Team knowledge transfer'
      ]
    };

    return [...baseTasks, ...additionalTasks[complexity]];
  }

  private identifyRisks(description: string, complexity: 'low' | 'medium' | 'high'): string[] {
    const risks: string[] = [];
    const lowercaseDesc = description.toLowerCase();

    // Common risks based on keywords
    if (lowercaseDesc.includes('integration')) {
      risks.push('Third-party integration dependencies may cause delays');
    }

    if (lowercaseDesc.includes('migration')) {
      risks.push('Data migration may require extended downtime');
    }

    if (lowercaseDesc.includes('security')) {
      risks.push('Security requirements may need compliance review');
    }

    if (lowercaseDesc.includes('deadline') || lowercaseDesc.includes('urgent')) {
      risks.push('Tight timeline may impact quality');
    }

    // Add complexity-based risks
    if (complexity === 'high') {
      risks.push('Complex requirements may evolve during development');
      risks.push('Resource availability may be a constraint');
    }

    if (complexity === 'medium') {
      risks.push('Scope creep potential - clear boundaries needed');
    }

    // Default risks if none identified
    if (risks.length === 0) {
      risks.push('Standard project risks apply');
      risks.push('Timeline estimates subject to requirements changes');
    }

    return risks;
  }
}
