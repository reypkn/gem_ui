import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message, history, token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'API token is required' },
        { status: 400 }
      )
    }

    const genAI = new GoogleGenerativeAI(token)
    
    // Use the current model name - Gemini 1.5 Pro
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

    // Convert history to Gemini format
    const chatHistory = history.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }))

    const chat = model.startChat({
      history: chatHistory
    })

    const result = await chat.sendMessage(message)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ response: text })
  } catch (error) {
    console.error('Chat API error:', error)
    
    // Provide more helpful error messages
    let errorMessage = 'Failed to process message'
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'Invalid API key. Please check your Gemini API token.'
      } else if (error.message.includes('quota')) {
        errorMessage = 'API quota exceeded. Please try again later.'
      } else if (error.message.includes('permission')) {
        errorMessage = 'Permission denied. Please check your API token permissions.'
      } else if (error.message.includes('model')) {
        errorMessage = 'Model not available. Please try a different model or check your API access.'
      } else {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
