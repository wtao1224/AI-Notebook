import React, { useState, useEffect, useRef } from 'react'
import { marked } from 'marked'
import { useNotepad } from '../context/NotepadContext'
import { storageService } from '../services/storage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const Editor: React.FC = () => {
  const { state, dispatch } = useNotepad()
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const activeDocument = state.documents.find(doc => doc.id === state.activeDocumentId)

  useEffect(() => {
    if (activeDocument) {
      setContent(activeDocument.content)
      setTitle(activeDocument.title)
    } else {
      setContent('')
      setTitle('')
    }
  }, [activeDocument])

  useEffect(() => {
    if (activeDocument) {
      const timeoutId = setTimeout(() => {
        handleSave()
      }, 1000)

      return () => clearTimeout(timeoutId)
    }
  }, [content, title, activeDocument])

  const handleSave = async () => {
    if (!activeDocument) return

    try {
      const updatedDoc = {
        ...activeDocument,
        title,
        content,
        updatedAt: new Date(),
      }

      await storageService.saveDocument(updatedDoc)
      dispatch({
        type: 'UPDATE_DOCUMENT',
        payload: { id: activeDocument.id, content, title }
      })
    } catch (error) {
      console.error('Failed to save document:', error)
    }
  }

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
  }

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 's':
          e.preventDefault()
          handleSave()
          break
        case 'p':
          e.preventDefault()
          dispatch({ type: 'TOGGLE_PREVIEW_MODE' })
          break
      }
    }
  }

  const getMarkdownPreview = () => {
    return { __html: marked(content || '') }
  }

  if (!activeDocument) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-2">
              No Document Selected
            </h2>
            <p className="text-muted-foreground">
              Create a new document or select one from the sidebar
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <Card className="rounded-none border-x-0 border-t-0">
        <CardHeader className="pb-3">
          <Input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Document title..."
            className="text-2xl font-bold border-0 shadow-none px-0 focus-visible:ring-0"
          />
          <div className="flex items-center gap-4 mt-2">
            <Button
              onClick={() => dispatch({ type: 'TOGGLE_PREVIEW_MODE' })}
              variant={state.isPreviewMode ? "default" : "outline"}
              size="sm"
            >
              {state.isPreviewMode ? '📝 Edit' : '👁️ Preview'}
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <Badge variant="secondary" className="text-xs">
              {content.length} characters
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="flex-1 relative">
        {!state.isPreviewMode ? (
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Start typing your document..."
            className="h-full resize-none border-0 rounded-none focus-visible:ring-0 editor-textarea"
          />
        ) : (
          <Card className="h-full rounded-none border-x-0 border-b-0">
            <CardContent className="p-6 h-full overflow-y-auto">
              <div className="markdown-preview prose prose-slate max-w-none" dangerouslySetInnerHTML={getMarkdownPreview()} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default Editor