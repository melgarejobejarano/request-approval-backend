/**
 * AI Suggestion Response
 * Structured response from AI analysis of a request
 */
export interface AISuggestion {
    suggested_tasks: string[];
    complexity: 'low' | 'medium' | 'high';
    estimated_days: number;
    risks: string[];
}
/**
 * AI Analysis Request
 */
export interface AIAnalysisRequest {
    title: string;
    description: string;
    clientName?: string;
}
/**
 * AI Service Interface
 * Defines the contract for AI-powered request analysis
 *
 * NOTE: This is designed to be a mock service initially.
 * To replace with a real AI implementation later:
 * 1. Create a new class implementing this interface
 * 2. Inject the new implementation via dependency injection
 * 3. No changes needed to use cases or handlers
 */
export interface IAIService {
    /**
     * Analyze a request and provide structured suggestions
     * @param request The analysis request containing title and description
     * @returns Structured AI suggestions
     */
    analyzeRequest(request: AIAnalysisRequest): Promise<AISuggestion>;
    /**
     * Check if the AI service is available
     */
    isAvailable(): Promise<boolean>;
}
//# sourceMappingURL=IAIService.d.ts.map