export interface UploadedSample {
  filename: string;
  type: string;
  wordCount: number;
  analyzedAt: string;
}

export interface BrandProfile {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  tone: string[];
  vocabulary: 'formal' | 'casual' | 'technical' | 'conversational';
  sentenceStructure: 'short' | 'medium' | 'long' | 'varied';
  personalityTraits: string[];
  brandKeywords: string[];
  avoidWords: string[];
  audienceDescription: string;
  writingExamples: string[];
  additionalInstructions: string;
  uploadedSamples: UploadedSample[];
}
