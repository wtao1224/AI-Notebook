import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotepad } from '../context/NotepadContext';
import { storageService } from '../services/excelStorage';
import { Document, TodoItem } from '../types';
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'


// Add custom CSS for markdown styling
const markdownStyles = `
  .markdown-content h1 { font-size: 1.5em; font-weight: bold; margin: 0.5em 0; color: #1f2937; }
  .markdown-content h2 { font-size: 1.3em; font-weight: bold; margin: 0.4em 0; color: #374151; }
  .markdown-content h3 { font-size: 1.1em; font-weight: bold; margin: 0.3em 0; color: #4b5563; }
  .markdown-content p { margin: 0.5em 0; line-height: 1.6; }
  .markdown-content strong { font-weight: bold; color: #1f2937; }
  .markdown-content em { font-style: italic; }
  .markdown-content ul { margin: 0.5em 0; padding-left: 1.5em; }
  .markdown-content ol { margin: 0.5em 0; padding-left: 1.5em; }
  .markdown-content li { margin: 0.2em 0; }
  .markdown-content code { background: #f3f4f6; padding: 0.2em 0.4em; border-radius: 0.25em; font-family: monospace; }
  .markdown-content pre { background: #f3f4f6; padding: 1em; border-radius: 0.5em; overflow-x: auto; margin: 0.5em 0; }
`;

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  images?: string[]; // Base64 encoded images
  formatted?: boolean; // Whether content should be rendered as markdown
}

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { dispatch } = useNotepad();
  
  const CHAT_HISTORY_KEY = 'ai_chat_history';

  const API_KEY = "sk-3qvdzx18J3qQdotCRx2k7jzpGpn4ITJeKquZzB1UpLha3tLu";
  const API_URL = "https://api.moonshot.cn/v1/chat/completions"; // Kimi API endpoint
  const USE_MOCK_API = false; // Set to true if you want to use mock responses

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        const messagesWithDates = parsedHistory.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    }
  }, []);

  // Save chat history whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Handle image file selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const imagePromises = Array.from(files).map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
      });
      
      Promise.all(imagePromises).then(images => {
        setSelectedImages(prev => [...prev, ...images]);
      });
    }
  };

  // Remove selected image
  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Clear chat history
  const clearChatHistory = () => {
    setMessages([]);
    localStorage.removeItem(CHAT_HISTORY_KEY);
  };

  // Render markdown content
  const renderMarkdown = (content: string) => {
    // Simple markdown rendering - can be enhanced with a proper markdown library
    let html = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/^# (.*$)/gm, '<h1>$1</h1>') // H1
      .replace(/^## (.*$)/gm, '<h2>$1</h2>') // H2
      .replace(/^### (.*$)/gm, '<h3>$1</h3>') // H3
      .replace(/^- (.*$)/gm, '<li>$1</li>') // List items
      .replace(/`([^`]+)`/g, '<code>$1</code>') // Inline code
      .replace(/\n\n/g, '</p><p>') // Paragraphs
      .replace(/\n/g, '<br>') // Line breaks
      .replace(/^(.*)$/gm, '<p>$1</p>') // Wrap in paragraphs
      .replace(/<p><\/p>/g, '') // Remove empty paragraphs
      .replace(/<p>(<h[1-6]>.*<\/h[1-6]>)<\/p>/g, '$1') // Remove p tags around headers
      .replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>') // Wrap list items
      .replace(/<\/ul><ul>/g, ''); // Merge consecutive lists
    
    return `<div class="markdown-content">${html}</div>`;
  };

  // Helper function to create a new document
  const createDocument = async (title: string, content: string = '') => {
    const newDocument: Document = {
      id: Date.now().toString(),
      title,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: []
    };
    
    dispatch({ type: 'ADD_DOCUMENT', payload: newDocument });
    await storageService.saveDocument(newDocument);
    return newDocument;
  };

  // Helper function to create a new todo item
  const createTodo = async (text: string, priority: 'low' | 'medium' | 'high' = 'medium') => {
    const newTodo: TodoItem = {
      id: Date.now().toString(),
      content: text,
      status: 'pending',
      priority,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await storageService.saveTodo(newTodo);
    return newTodo;
  };

  // Function to process AI commands for creating documents and todos
  const processAICommands = async (userInput: string, aiResponse: string) => {
    const lowerInput = userInput.toLowerCase();
    
    // Check for document creation requests
    if (lowerInput.includes('create document') || lowerInput.includes('new document') || lowerInput.includes('add document')) {
      const titleMatch = userInput.match(/(?:create|new|add)\s+document\s+(?:titled|called|named)?\s*["']?([^"'\n]+)["']?/i);
      if (titleMatch) {
        const title = titleMatch[1].trim();
        await createDocument(title);
        return `✅ I've created a new document titled "${title}" for you! You can find it in your documents list.`;
      }
    }
    
    // Check for todo creation requests
     if (lowerInput.includes('create todo') || lowerInput.includes('add todo') || lowerInput.includes('new todo') || lowerInput.includes('remind me')) {
       const todoMatch = userInput.match(/(?:create|add|new)\s+todo\s+["']?([^"'\n]+)["']?/i) || 
                        userInput.match(/remind me to\s+([^\n]+)/i);
       if (todoMatch) {
         const todoText = todoMatch[1].trim();
         const priority = lowerInput.includes('urgent') || lowerInput.includes('important') ? 'high' : 
                         lowerInput.includes('low priority') ? 'low' : 'medium';
         await createTodo(todoText, priority);
         return `✅ I've added "${todoText}" to your todo list with ${priority} priority! You can view it in the Todo section.`;
       }
     }
    
    return aiResponse;
  };

  const getMockAIResponse = (userInput: string): string => {
    const responses = [
      "I understand you're working on your notes. How can I help you organize or improve them?",
      "That's an interesting point! Would you like me to help you expand on that idea?",
      "I can help you with writing, organizing, or analyzing your content. What would you like to focus on?",
      "Great question! Let me think about that and provide you with some insights.",
      "I'm here to assist with your note-taking and writing tasks. What specific help do you need?",
      "That sounds like something worth exploring further. Would you like me to help you brainstorm?",
      "I can help you structure your thoughts or provide feedback on your ideas. What are you working on?"
    ];
    
    // Simple keyword-based responses
    const lowerInput = userInput.toLowerCase();
    if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
      return "Hello! I'm your AI assistant integrated into this notepad application. I'm here to help you with your notes, writing, and any questions you might have. I can also create documents and todo items for you! How can I assist you today?";
    }
    if (lowerInput.includes('help')) {
      return "I can help you with various tasks like organizing your notes, brainstorming ideas, writing assistance, summarizing content, or answering questions. I can also create new documents and todo items for you! Just say 'create document [title]' or 'add todo [task]' or 'remind me to [task]'. What would you like help with?";
    }
    if (lowerInput.includes('note') || lowerInput.includes('write')) {
      return "I'd be happy to help with your note-taking and writing! I can assist with organizing ideas, improving structure, checking grammar, or providing feedback. I can also create new documents for you - just say 'create document [title]'. What are you working on?";
    }
    if (lowerInput.includes('todo') || lowerInput.includes('task')) {
      return "I can help you manage your tasks and todos! You can ask me to 'add todo [task description]' or 'remind me to [task]'. I can also set priority levels - just mention if something is 'urgent', 'important', or 'low priority'. What task would you like to add?";
    }
    
    // Return a random response for other inputs
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const sendMessage = async () => {
    if ((!inputValue.trim() && selectedImages.length === 0) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue || '[Image sent]',
      role: 'user',
      timestamp: new Date(),
      images: selectedImages.length > 0 ? [...selectedImages] : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    // const currentImages = [...selectedImages];
    setInputValue('');
    setSelectedImages([]);
    setIsLoading(true);

    try {
      let assistantContent: string;
      
      if (USE_MOCK_API) {
        // Use mock AI response
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000)); // Simulate API delay
        assistantContent = getMockAIResponse(currentInput);
      } else {
        // Use real OpenAI API
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
          },
          body: JSON.stringify({
            model: 'moonshot-v1-8k',
            messages: [
              {
                role: 'system',
                content: 'You are a helpful AI assistant integrated into a notebook application. You can help users with their questions, provide insights, and assist with their notes and tasks. You have the ability to create documents and todo items for users. When users ask you to create a document, use phrases like "create document [title]" or "new document [title]". When users ask you to add tasks or reminders, use phrases like "create todo [task]" or "remind me to [task]". You can also set priority levels by mentioning "urgent", "important", or "low priority".'
              },
              ...messages.map(msg => ({ role: msg.role, content: msg.content })),
              { role: 'user', content: currentInput }
            ],
            max_tokens: 1000,
            temperature: 0.7
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Response Error:', response.status, errorText);
          throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        assistantContent = data.choices[0].message.content;
      }
      
      // Process AI commands for creating documents and todos
      const processedContent = await processAICommands(currentInput, assistantContent);
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: processedContent,
        role: 'assistant',
        timestamp: new Date(),
        formatted: true // Enable markdown formatting for AI responses
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      let errorContent = 'Sorry, I encountered an error. Please try again.';
      
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        if (error.message.includes('Failed to fetch')) {
          errorContent = 'Network error: Unable to connect to AI service. Please check your internet connection.';
        } else if (error.message.includes('401')) {
          errorContent = 'Authentication error: Invalid API key.';
        } else if (error.message.includes('429')) {
          errorContent = 'Rate limit exceeded. Please try again later.';
        } else if (error.message.includes('CORS')) {
          errorContent = 'CORS error: Please check browser console for details.';
        }
      }
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: errorContent,
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-screen">
      <style dangerouslySetInnerHTML={{ __html: markdownStyles }} />
      <Card className="rounded-none border-x-0 border-t-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div>
            <CardTitle className="text-lg">AI Assistant</CardTitle>
            <p className="text-sm text-muted-foreground">Chat with AI to get help with your notes</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={clearChatHistory}
              variant="destructive"
              size="sm"
              title="Clear chat history"
            >
              Clear History
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              size="sm"
            >
              ← Back to Notes
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <Card className="mx-auto mt-8 max-w-md">
            <CardContent className="text-center pt-6">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="font-semibold mb-2">Hello! I'm here to help you with your notes and tasks.</h3>
              <p className="text-sm text-muted-foreground">Ask me anything about your documents or todos.</p>
            </CardContent>
          </Card>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`mb-6 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <Card className={`max-w-xs lg:max-w-2xl ${
              message.role === 'user' 
                ? 'bg-primary text-primary-foreground' 
                : ''
            }`}>
              <CardContent className="p-4">
              {/* Display images if present */}
              {message.images && message.images.length > 0 && (
                <div className="mb-3">
                  <div className="grid grid-cols-2 gap-2">
                    {message.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Uploaded image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-md border"
                      />
                    ))}
                  </div>
                </div>
              )}
              
                {/* Display content */}
                {message.formatted && message.role === 'assistant' ? (
                  <div 
                    className="text-sm"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
                  />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                )}
                
                <Badge variant="outline" className={`mt-2 text-xs ${
                  message.role === 'user' ? 'border-primary-foreground/20' : ''
                }`}>
                  {formatTime(message.timestamp)}
                </Badge>
              </CardContent>
            </Card>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start mb-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <Card className="rounded-none border-x-0 border-b-0">
        <CardContent className="p-4">
          {/* Image Preview */}
          {selectedImages.length > 0 && (
            <Card className="mb-3">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">
                    Selected Images ({selectedImages.length})
                  </Badge>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {selectedImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-16 object-cover rounded border"
                      />
                      <Button
                        onClick={() => removeImage(index)}
                        variant="destructive"
                        size="sm"
                        className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message... (supports markdown formatting)"
                disabled={isLoading}
                rows={inputValue.includes('\n') ? Math.min(inputValue.split('\n').length, 4) : 1}
                className="resize-none"
              />
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="icon"
              title="Upload images"
            >
              📷
            </Button>
            
            <Button
              onClick={sendMessage}
              disabled={isLoading || (!inputValue.trim() && selectedImages.length === 0)}
            >
              {isLoading ? '...' : 'Send'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIChat;