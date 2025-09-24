import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { Document } from '../types'

interface NotepadState {
  documents: Document[]
  activeDocumentId: string | null
  isPreviewMode: boolean
  searchQuery: string
}

type NotepadAction =
  | { type: 'SET_DOCUMENTS'; payload: Document[] }
  | { type: 'ADD_DOCUMENT'; payload: Document }
  | { type: 'UPDATE_DOCUMENT'; payload: { id: string; content: string; title: string } }
  | { type: 'DELETE_DOCUMENT'; payload: string }
  | { type: 'SET_ACTIVE_DOCUMENT'; payload: string | null }
  | { type: 'TOGGLE_PREVIEW_MODE' }
  | { type: 'SET_SEARCH_QUERY'; payload: string }

const initialState: NotepadState = {
  documents: [],
  activeDocumentId: null,
  isPreviewMode: false,
  searchQuery: '',
}

function notepadReducer(state: NotepadState, action: NotepadAction): NotepadState {
  switch (action.type) {
    case 'SET_DOCUMENTS':
      return { ...state, documents: action.payload }
    case 'ADD_DOCUMENT':
      return { ...state, documents: [...state.documents, action.payload] }
    case 'UPDATE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.map(doc =>
          doc.id === action.payload.id
            ? { ...doc, content: action.payload.content, title: action.payload.title, updatedAt: new Date() }
            : doc
        ),
      }
    case 'DELETE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.filter(doc => doc.id !== action.payload),
        activeDocumentId: state.activeDocumentId === action.payload ? null : state.activeDocumentId,
      }
    case 'SET_ACTIVE_DOCUMENT':
      return { ...state, activeDocumentId: action.payload }
    case 'TOGGLE_PREVIEW_MODE':
      return { ...state, isPreviewMode: !state.isPreviewMode }
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload }
    default:
      return state
  }
}

interface NotepadContextType {
  state: NotepadState
  dispatch: React.Dispatch<NotepadAction>
}

const NotepadContext = createContext<NotepadContextType | undefined>(undefined)

export function NotepadProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(notepadReducer, initialState)

  return (
    <NotepadContext.Provider value={{ state, dispatch }}>
      {children}
    </NotepadContext.Provider>
  )
}

export function useNotepad() {
  const context = useContext(NotepadContext)
  if (context === undefined) {
    throw new Error('useNotepad must be used within a NotepadProvider')
  }
  return context
}