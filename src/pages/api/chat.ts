import { NextApiRequest, NextApiResponse } from "next"
import { VertexAI, HarmCategory, HarmBlockThreshold, GenerateContentResult } from "@google-cloud/vertexai"
import { DEFAULT_PROMPT } from "@/constants/prompt"
const LOCATION = "us-central1"
const MODEL_NAME = process.env.MODEL_NAME!
const PROJECT_ID = process.env.PROJECT_ID!
const DATASTORE_ID =
  "projects/109319136418/locations/global/collections/default_collection/dataStores/creato-search-agent-datastore-connector_1734085283472_gcs_store"

const DEFAULT_SYSTEM_PROMPT = {
  role: "system",
  parts: [
    {
      text: DEFAULT_PROMPT.TRANSLATOR_PROMPT,
    },
  ],
}
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" })
  }

  const { userInput, history } = req.body

  if (!userInput || !Array.isArray(history)) {
    return res.status(400).json({ error: "Invalid request body" })
  }

  try {
    const vertexAI = new VertexAI({
      project: PROJECT_ID,
      location: LOCATION,
      googleAuthOptions: {
        credentials: {
          client_email: process.env.SERVICE_ACCOUNT_CLIENT_EMAIL,
          private_key: process.env.SERVICE_ACCOUNT_PRIVATE_KEY,
        },
      },
    })

    const generativeModelPreview = vertexAI.preview.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: DEFAULT_SYSTEM_PROMPT,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
      generationConfig: {
        maxOutputTokens: 256,
      },
    })

    const formattedHistory = history.map((msg: { role: string; text: string }) => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    }))

    formattedHistory.push({
      role: "user",
      parts: [{ text: userInput }],
    })

    const vertexAIRetrievalTool = {
      retrieval: {
        vertexAiSearch: {
          datastore: DATASTORE_ID,
        },
        disableAttribution: false,
      },
    }
    

    const result: GenerateContentResult = await generativeModelPreview.generateContent({
      contents: formattedHistory, // Include history in the request
      tools: [vertexAIRetrievalTool],
    })

    // Extract necessary data for frontend
    const candidates = result.response.candidates || []
    const groundingMetadata = result.response.candidates![0]
    console.log("GroundingMetadata is: ", JSON.stringify(groundingMetadata))
    const formattedResponse = candidates.map((candidate) => ({
      text: candidate.content.parts[0].text,
      safetyRatings: candidate.safetyRatings || [],
      groundingMetadata: candidate.groundingMetadata || {},
    }))

    return res.status(200).json({ responses: formattedResponse })
  } catch (error) {
    console.error("Error in API:", error)
    return res.status(500).json({ error: "Internal Server Error" })
  }
}

export default handler
