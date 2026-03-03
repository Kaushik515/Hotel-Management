import Hotel from "../models/Hotel.js";
import { createError } from "../utils/error.js";

const getAiConfig = () => {
  return {
    baseUrl: (process.env.AI_BASE_URL || "https://openrouter.ai/api/v1").trim(),
    model: (process.env.AI_MODEL || "openai/gpt-4o-mini").trim(),
    apiKey: (process.env.AI_API_KEY || "").trim(),
  };
};

const callAiChatCompletion = async ({ baseUrl, model, apiKey, messages, temperature = 0.5 }) => {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature,
      messages,
    }),
  });

  if (!response.ok) {
    const errorPayload = await response.text();
    throw createError(
      response.status,
      `AI provider error: ${errorPayload || "Unable to generate response."}`
    );
  }

  const data = await response.json();
  const answer = data?.choices?.[0]?.message?.content?.trim();

  if (!answer) {
    throw createError(502, "AI returned an empty response.");
  }

  return answer;
};

const buildSystemPrompt = (hotels = []) => {
  const hotelLines = hotels
    .map(
      (hotel) =>
        `- ${hotel.name} | ${hotel.city} | type: ${hotel.type || "hotel"} | from ₹${hotel.cheapestPrice || "N/A"}`
    )
    .join("\n");

  return [
    "You are a helpful AI travel assistant for a hotel booking app.",
    "Give concise, practical suggestions: destination, budget fit, and booking tips.",
    "If user asks for options, prioritize available hotels from provided context.",
    "If context is limited, clearly say suggestions are based on current data.",
    "Hotel context:",
    hotelLines || "- No hotel data available",
  ].join("\n");
};

export const getAiTripPlan = async (req, res, next) => {
  try {
    const { baseUrl, model, apiKey } = getAiConfig();

    const userMessage = (req.body?.message || "").trim();

    if (!userMessage) {
      return next(createError(400, "Message is required."));
    }

    if (!apiKey) {
      return next(
        createError(
          500,
          "AI is not configured. Set AI_API_KEY, AI_MODEL, and AI_BASE_URL in backend .env."
        )
      );
    }

    const hotels = await Hotel.find({}, "name city type cheapestPrice").limit(12).lean();

    const answer = await callAiChatCompletion({
      baseUrl,
      model,
      apiKey,
      temperature: 0.5,
      messages: [
        { role: "system", content: buildSystemPrompt(hotels) },
        { role: "user", content: userMessage },
      ],
    });

    res.status(200).json({ reply: answer, model });
  } catch (err) {
    next(err);
  }
};

export const generateReviewDraft = async (req, res, next) => {
  try {
    const { baseUrl, model, apiKey } = getAiConfig();
    const hotelName = (req.body?.hotelName || "").trim();
    const dateRange = (req.body?.dateRange || "").trim();
    const rating = Number(req.body?.rating || 5);
    const notes = (req.body?.notes || "").trim();

    if (!apiKey) {
      return next(
        createError(
          500,
          "AI is not configured. Set AI_API_KEY, AI_MODEL, and AI_BASE_URL in backend .env."
        )
      );
    }

    if (!hotelName) {
      return next(createError(400, "hotelName is required."));
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return next(createError(400, "rating must be an integer between 1 and 5."));
    }

    const systemPrompt = [
      "You are an assistant that writes short, natural customer hotel reviews.",
      "Write in first person.",
      "Return plain text only (no markdown, no asterisks).",
      "Keep it 2 to 4 sentences.",
    ].join(" ");

    const userPrompt = [
      `Hotel: ${hotelName}`,
      dateRange ? `Stay dates: ${dateRange}` : "",
      `Rating: ${rating}/5`,
      notes ? `User notes: ${notes}` : "",
      "Generate a polished review draft.",
    ]
      .filter(Boolean)
      .join("\n");

    const draft = await callAiChatCompletion({
      baseUrl,
      model,
      apiKey,
      temperature: 0.6,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    res.status(200).json({ draft, model });
  } catch (err) {
    next(err);
  }
};
