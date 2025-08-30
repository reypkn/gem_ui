'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { MessageCircle, Send, Settings, Plus, Trash2, PanelLeft, Sun, Moon, Edit3, Check, X } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  lastUpdated: Date
}

export default function ChatApp() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [geminiToken, setGeminiToken] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTokenDialogOpen, setIsTokenDialogOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentConversation = conversations.find(c => c.id === currentConversationId)

  useEffect(() => {
    // Load saved data from localStorage on mount
    const savedToken = localStorage.getItem('gemini-token')
    const savedConversations = localStorage.getItem('conversations')
    const savedSidebarState = localStorage.getItem('sidebar-open')
    const savedTheme = localStorage.getItem('theme')
    
    if (savedToken) setGeminiToken(savedToken)
    if (savedConversations) {
      const parsed = JSON.parse(savedConversations)
      setConversations(parsed.map((c: any) => ({
        ...c,
        lastUpdated: new Date(c.lastUpdated),
        messages: c.messages.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }))
      })))
    }
    if (savedSidebarState !== null) {
      setSidebarOpen(JSON.parse(savedSidebarState))
    }
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark')
    }
  }, [])

  useEffect(() => {
    // Save conversations to localStorage
    if (conversations.length > 0) {
      localStorage.setItem('conversations', JSON.stringify(conversations))
    }
  }, [conversations])

  useEffect(() => {
    // Save sidebar state to localStorage
    localStorage.setItem('sidebar-open', JSON.stringify(sidebarOpen))
  }, [sidebarOpen])

  useEffect(() => {
    // Apply theme to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentConversation?.messages])

  const saveToken = () => {
    localStorage.setItem('gemini-token', geminiToken)
    setIsTokenDialogOpen(false)
  }

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      lastUpdated: new Date()
    }
    setConversations(prev => [newConversation, ...prev])
    setCurrentConversationId(newConversation.id)
  }

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id))
    if (currentConversationId === id) {
      setCurrentConversationId(null)
    }
  }

  const startEditingTitle = (conversation: Conversation) => {
    setEditingTitleId(conversation.id)
    setEditingTitle(conversation.title)
  }

  const saveTitle = () => {
    if (editingTitle.trim()) {
      setConversations(prev => prev.map(c => 
        c.id === editingTitleId
          ? { ...c, title: editingTitle.trim(), lastUpdated: new Date() }
          : c
      ))
    }
    setEditingTitleId(null)
    setEditingTitle('')
  }

  const cancelEditing = () => {
    setEditingTitleId(null)
    setEditingTitle('')
  }

  const updateConversationTitle = (conversationId: string, firstMessage: string) => {
    const title = firstMessage.length > 30 
      ? firstMessage.substring(0, 30) + '...' 
      : firstMessage
    
    setConversations(prev => prev.map(c => 
      c.id === conversationId 
        ? { ...c, title, lastUpdated: new Date() }
        : c
    ))
  }

  const sendMessage = async () => {
    if (!message.trim() || !geminiToken || isLoading) return

    if (!currentConversationId) {
      createNewConversation()
      // Wait for state update
      setTimeout(() => sendMessage(), 100)
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    }

    // Add user message
    setConversations(prev => prev.map(c => 
      c.id === currentConversationId
        ? { 
            ...c, 
            messages: [...c.messages, userMessage],
            lastUpdated: new Date()
          }
        : c
    ))

    // Update title if this is the first message
    const conversation = conversations.find(c => c.id === currentConversationId)
    if (conversation && conversation.messages.length === 0) {
      updateConversationTitle(currentConversationId, message.trim())
    }

    setMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          history: conversation?.messages || [],
          token: geminiToken
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get response')
      }

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }

      setConversations(prev => prev.map(c => 
        c.id === currentConversationId
          ? { 
              ...c, 
              messages: [...c.messages, assistantMessage],
              lastUpdated: new Date()
            }
          : c
      ))
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error instanceof Error ? error.message : 'Sorry, there was an error processing your message. Please check your API token and try again.',
        timestamp: new Date()
      }

      setConversations(prev => prev.map(c => 
        c.id === currentConversationId
          ? { 
              ...c, 
              messages: [...c.messages, errorMessage],
              lastUpdated: new Date()
            }
          : c
      ))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      saveTitle()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancelEditing()
    }
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-64 border-r bg-muted/50 flex flex-col transition-all duration-300">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold">Chats</h1>
              <Dialog open={isTokenDialogOpen} onOpenChange={setIsTokenDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Gemini API Configuration</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="token">API Token</Label>
                      <Input
                        id="token"
                        type="password"
                        placeholder="Enter your Gemini API token"
                        value={geminiToken}
                        onChange={(e) => setGeminiToken(e.target.value)}
                      />
                    </div>
                    <Button onClick={saveToken} className="w-full">
                      Save Token
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <Button 
              onClick={createNewConversation}
              className="w-full mt-3"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-accent ${
                    currentConversationId === conversation.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => setCurrentConversationId(conversation.id)}
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <MessageCircle className="h-4 w-4 flex-shrink-0" />
                    {editingTitleId === conversation.id ? (
                      <Input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyPress={handleTitleKeyPress}
                        className="h-6 text-sm border-0 p-1 bg-transparent focus-visible:ring-1"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="text-sm truncate">{conversation.title}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {editingTitleId === conversation.id ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            saveTitle()
                          }}
                          className="h-6 w-6 p-0 hover:bg-green-600 hover:text-white"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            cancelEditing()
                          }}
                          className="h-6 w-6 p-0 hover:bg-gray-600 hover:text-white"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            startEditingTitle(conversation)
                          }}
                          className="h-6 w-6 p-0 hover:bg-blue-600 hover:text-white"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteConversation(conversation.id)
                          }}
                          className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar with Controls */}
        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="h-8 w-8 p-0"
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
            {currentConversation && (
              <h2 className="text-lg font-semibold">{currentConversation.title}</h2>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-8 w-8 p-0"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {currentConversation ? (
          <>
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {currentConversation.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <Card className={`max-w-[80%] ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      <CardContent className="p-3">
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <Card className="bg-muted">
                      <CardContent className="p-3">
                        <p className="text-sm">Thinking...</p>
                      </CardContent>
                    </Card>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading || !geminiToken}
                />
                <Button 
                  onClick={sendMessage}
                  disabled={isLoading || !message.trim() || !geminiToken}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Welcome Screen */
          <div className="flex-1 flex items-center justify-center">
            <Card className="w-96">
              <CardHeader>
                <CardTitle className="text-center">Welcome to Chat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-center text-muted-foreground">
                  {!geminiToken 
                    ? 'Please configure your Gemini API token to get started.'
                    : 'Select a conversation or start a new chat.'
                  }
                </p>
                {!geminiToken && (
                  <Button 
                    onClick={() => setIsTokenDialogOpen(true)}
                    className="w-full"
                  >
                    Configure API Token
                  </Button>
                )}
                {geminiToken && (
                  <Button 
                    onClick={createNewConversation}
                    className="w-full"
                  >
                    Start New Chat
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
