import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotepad } from '../context/NotepadContext'
import Sidebar from './Sidebar'
import Editor from './Editor'
import TodoList from './TodoList'
import { storageService } from '../services/storage'
import { ExcelStorage } from '../services/excelStorage'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from './ThemeToggle'

const Layout: React.FC = () => {
  const { state, dispatch } = useNotepad()
  const [showTodo, setShowTodo] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const documents = await storageService.getAllDocuments()
        dispatch({ type: 'SET_DOCUMENTS', payload: documents })
        
        if (documents.length > 0 && !state.activeDocumentId) {
          dispatch({ type: 'SET_ACTIVE_DOCUMENT', payload: documents[0].id })
        }
      } catch (error) {
        console.error('Failed to load documents:', error)
      }
    }

    loadDocuments()
  }, [dispatch])

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Card className="rounded-none border-x-0 border-t-0">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-2xl font-bold tracking-tight">Notepad</h1>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowTodo(!showTodo)}
                variant={showTodo ? "default" : "outline"}
                size="sm"
              >
                {showTodo ? 'Hide Todo' : 'Show Todo'}
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button
                onClick={() => navigate('/project-management')}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                📊 Projects
              </Button>
              <Button
                onClick={() => navigate('/ai-chat')}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                🤖 AI Chat
              </Button>
              <Button
                onClick={() => navigate('/pomodoro')}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                🍅 Pomodoro
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <ThemeToggle />
              <Button
                onClick={() => {
                  if (storageService instanceof ExcelStorage) {
                    storageService.exportToExcel();
                  }
                }}
                variant="secondary"
                size="sm"
              >
                Export Excel
              </Button>
            </div>
          </div>
        </Card>
        
        <div className="flex-1 flex">
          <div className={`${showTodo ? 'flex-1' : 'flex-1'} transition-all duration-300`}>
            <Editor />
          </div>
          
          {showTodo && (
            <Card className="w-96 rounded-none border-y-0 border-r-0 overflow-y-auto">
              <TodoList />
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default Layout