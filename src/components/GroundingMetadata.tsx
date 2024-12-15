import React, { useState } from "react"

interface GroundingChunk {
  retrievedContext: {
    uri: string
    title: string
    text: string
  }
  confidenceScores?: number[]
}

interface GroundingMetadataProps {
  groundingChunks: GroundingChunk[]
}

const GroundingMetadata: React.FC<GroundingMetadataProps> = ({ groundingChunks }) => {
  const [expandedIndices, setExpandedIndices] = useState<number[]>([])

  const toggleExpand = (index: number) => {
    if (expandedIndices.includes(index)) {
      setExpandedIndices(expandedIndices.filter((i) => i !== index)) // Collapse
    } else {
      setExpandedIndices([...expandedIndices, index]) // Expand
    }
  }

  if (!groundingChunks || groundingChunks.length === 0) {
    return <div className="text-gray-500 text-sm italic">No grounding metadata available.</div>
  }

  return (
    <div className="space-y-6">
      {groundingChunks.map((chunk, index) => {
        const isExpanded = expandedIndices.includes(index)

        return (
          <div key={index} className="p-4 bg-gray-100 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg text-blue-600 mb-2">{chunk.retrievedContext.title}</h3>
            <p className="text-gray-700 text-sm">
              {isExpanded
                ? chunk.retrievedContext.text // Show full text when expanded
                : chunk.retrievedContext.text.slice(0, 100) + (chunk.retrievedContext.text.length > 100 ? "..." : "")}{" "}
              {/* Show truncated text */}
            </p>
            <button onClick={() => toggleExpand(index)} className="text-blue-500 text-sm mt-2 underline focus:outline-none">
              {isExpanded ? "Collapse" : "Expand"}
            </button>
            {chunk.confidenceScores && (
              <div className="mt-3">
                <h4 className="text-gray-600 text-sm font-medium">Confidence Scores:</h4>
                <ul className="list-disc list-inside text-gray-600 text-sm">
                  {chunk.confidenceScores.map((score, i) => (
                    <li key={i}>{score.toFixed(2)}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default GroundingMetadata
