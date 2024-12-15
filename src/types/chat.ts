import type { GroundingMetadata, SafetyRating } from "@google-cloud/vertexai"

export type GeminiFormattedResponse = {
  text: string | undefined
  safetyRatings?: SafetyRating[]
  groundingMetadata?: GroundingMetadata
}
