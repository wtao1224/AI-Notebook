import { StorageProvider, Document, TodoItem } from '../types';
import * as XLSX from 'xlsx';

export class ExcelStorage implements Partial<StorageProvider> {
  private readonly STORAGE_KEY = 'notepad_excel_data';
  private data: { documents: any[], todos: any[] } = { documents: [], todos: [] };

  private loadData(): { documents: any[], todos: any[] } {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      this.data = JSON.parse(stored);
    }
    return this.data;
  }

  private saveData(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
  }



  async init(): Promise<void> {
    // Initialize with existing data from localStorage
    this.loadData();
  }

  async saveDocument(document: Document): Promise<void> {
    const data = this.loadData();
    const existingIndex = data.documents.findIndex(doc => doc.id === document.id);
    
    const docData = {
      id: document.id,
      title: document.title,
      content: document.content,
      tags: document.tags,
      createdAt: document.createdAt.toISOString(),
      updatedAt: document.updatedAt.toISOString()
    };

    if (existingIndex >= 0) {
      data.documents[existingIndex] = docData;
    } else {
      data.documents.push(docData);
    }
    
    this.saveData();
  }

  async getDocument(id: string): Promise<Document | null> {
    const data = this.loadData();
    const doc = data.documents.find(doc => doc.id === id);
    
    if (!doc) return null;
    
    return {
      id: doc.id,
      title: doc.title,
      content: doc.content,
      tags: doc.tags,
      createdAt: new Date(doc.createdAt),
      updatedAt: new Date(doc.updatedAt)
    };
  }

  async getAllDocuments(): Promise<Document[]> {
    const data = this.loadData();
    return data.documents.map(doc => ({
      id: doc.id,
      title: doc.title,
      content: doc.content,
      tags: doc.tags,
      createdAt: new Date(doc.createdAt),
      updatedAt: new Date(doc.updatedAt)
    }));
  }

  async deleteDocument(id: string): Promise<void> {
    const data = this.loadData();
    data.documents = data.documents.filter(doc => doc.id !== id);
    this.saveData();
  }

  async searchDocuments(query: string): Promise<Document[]> {
    const allDocs = await this.getAllDocuments();
    const lowerQuery = query.toLowerCase();
    return allDocs.filter(doc => 
      doc.title.toLowerCase().includes(lowerQuery) ||
      doc.content.toLowerCase().includes(lowerQuery) ||
      doc.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  async saveTodo(todo: TodoItem): Promise<void> {
    const data = this.loadData();
    const existingIndex = data.todos.findIndex(t => t.id === todo.id);
    
    const todoData = {
      id: todo.id,
      content: todo.content,
      status: todo.status,
      priority: todo.priority,
      createdAt: todo.createdAt.toISOString(),
      updatedAt: todo.updatedAt.toISOString()
    };

    if (existingIndex >= 0) {
      data.todos[existingIndex] = todoData;
    } else {
      data.todos.push(todoData);
    }
    
    this.saveData();
  }

  async getAllTodos(): Promise<TodoItem[]> {
    const data = this.loadData();
    return data.todos.map(todo => ({
      id: todo.id,
      content: todo.content,
      status: todo.status,
      priority: todo.priority,
      createdAt: new Date(todo.createdAt),
      updatedAt: new Date(todo.updatedAt)
    }));
  }

  async deleteTodo(id: string): Promise<void> {
    const data = this.loadData();
    data.todos = data.todos.filter(todo => todo.id !== id);
    this.saveData();
  }

  async updateTodo(todo: TodoItem): Promise<void> {
    await this.saveTodo(todo);
  }

  // Additional method to export data to Excel file
  exportToExcel(): void {
    const data = this.loadData();
    
    const wb = XLSX.utils.book_new();
    
    // Create documents sheet
    const documents = data.documents.map(doc => ({
      id: doc.id,
      title: doc.title,
      content: doc.content,
      tags: doc.tags.join(', '),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    }));
    const ws1 = XLSX.utils.json_to_sheet(documents);
    XLSX.utils.book_append_sheet(wb, ws1, 'Documents');
    
    // Create todos sheet
    const todos = data.todos.map(todo => ({
      id: todo.id,
      content: todo.content,
      status: todo.status,
      priority: todo.priority,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt
    }));
    const ws2 = XLSX.utils.json_to_sheet(todos);
    XLSX.utils.book_append_sheet(wb, ws2, 'Todos');
    
    // Download the file
    XLSX.writeFile(wb, 'notepad_data.xlsx');
  }
}

// Export a singleton instance
export const storageService = new ExcelStorage();