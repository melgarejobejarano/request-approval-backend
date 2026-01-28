import { IAIService, AISuggestion, AIAnalysisRequest } from '../../application/interfaces/IAIService';
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
export declare class MockAIService implements IAIService {
    private readonly mockDelay;
    constructor(mockDelayMs?: number);
    analyzeRequest(request: AIAnalysisRequest): Promise<AISuggestion>;
    isAvailable(): Promise<boolean>;
    private delay;
    private determineComplexity;
    private estimateDays;
    private generateTasks;
    private identifyRisks;
}
//# sourceMappingURL=MockAIService.d.ts.map