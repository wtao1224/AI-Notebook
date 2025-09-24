import React, { useState } from 'react'
import { useNotepad } from '../context/NotepadContext'
import { storageService } from '../services/storage'
import { Document } from '../types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const Sidebar: React.FC = () => {
  const { state, dispatch } = useNotepad()
  const [searchTerm, setSearchTerm] = useState('')

  const handleCreateDocument = async () => {
    const newDoc: Document = {
      id: Date.now().toString(),
      title: 'Untitled Document',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
    }

    try {
      await storageService.saveDocument(newDoc)
      dispatch({ type: 'ADD_DOCUMENT', payload: newDoc })
      dispatch({ type: 'SET_ACTIVE_DOCUMENT', payload: newDoc.id })
    } catch (error) {
      console.error('Failed to create document:', error)
    }
  }

  const handleSelectDocument = (id: string) => {
    dispatch({ type: 'SET_ACTIVE_DOCUMENT', payload: id })
  }

  const handleDeleteDocument = async (id: string) => {
    try {
      await storageService.deleteDocument(id)
      dispatch({ type: 'DELETE_DOCUMENT', payload: id })
    } catch (error) {
      console.error('Failed to delete document:', error)
    }
  }

  const filteredDocuments = state.documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Card className="w-64 rounded-none border-y-0 border-l-0 flex flex-col h-full">
      <CardHeader className="pb-3">
        <Button
          onClick={handleCreateDocument}
          className="w-full"
          size="sm"
        >
          + New Document
        </Button>
      </CardHeader>
      
      <Separator />
      
      <CardContent className="p-4 pb-0">
        <Input
          type="text"
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </CardContent>
      
      <Separator className="mt-4" />

      <CardContent className="flex-1 overflow-y-auto p-0">
        {filteredDocuments.map(doc => (
          <div
            key={doc.id}
            className={`p-4 border-b cursor-pointer hover:bg-accent transition-colors ${
              state.activeDocumentId === doc.id ? 'bg-accent' : ''
            }`}
            onClick={() => handleSelectDocument(doc.id)}
          >
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium truncate mb-1">{doc.title}</h3>
                <Badge variant="secondary" className="text-xs">
                  {new Date(doc.updatedAt).toLocaleDateString()}
                </Badge>
              </div>
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteDocument(doc.id)
                }}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
              >
                ×
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default Sidebar