import React, { useState, useEffect } from 'react';
import { TodoItem } from '../types';
import { storageService } from '../services/storage';
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);

  const [newTodo, setNewTodo] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<'high' | 'medium' | 'low'>('medium');

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      const savedTodos = await storageService.getAllTodos();
      setTodos(savedTodos);
    } catch (error) {
      console.error('Failed to load todos:', error);
    }
  };

  const addTodo = async () => {
    if (newTodo.trim()) {
      const todo: TodoItem = {
        id: Date.now().toString(),
        content: newTodo.trim(),
        status: 'pending',
        priority: selectedPriority,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      try {
        await storageService.saveTodo(todo);
        setTodos([...todos, todo]);
        setNewTodo('');
      } catch (error) {
        console.error('Failed to save todo:', error);
      }
    }
  };

  const updateStatus = async (id: string, status: 'pending' | 'in_progress' | 'completed') => {
    const updatedTodo = todos.find(todo => todo.id === id);
    if (updatedTodo) {
      const newTodo = { ...updatedTodo, status, updatedAt: new Date() };
      try {
        await storageService.updateTodo(newTodo);
        setTodos(todos.map(todo => 
          todo.id === id ? newTodo : todo
        ));
      } catch (error) {
        console.error('Failed to update todo:', error);
      }
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await storageService.deleteTodo(id);
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  const getPriorityVariant = (priority: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'pending': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <Card className="h-full rounded-none border-y-0 border-r-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Todo List</CardTitle>
        
        <div className="flex gap-2">
          <Input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            placeholder="Add task..."
            className="flex-1"
            size="sm"
          />
          <Select value={selectedPriority} onValueChange={(value: 'high' | 'medium' | 'low') => setSelectedPriority(value)}>
            <SelectTrigger className="w-16">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">🔴 H</SelectItem>
              <SelectItem value="medium">🟡 M</SelectItem>
              <SelectItem value="low">🟢 L</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={addTodo}
            size="sm"
          >
            Add
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 overflow-y-auto">
        {todos.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No tasks yet</p>
        ) : (
          todos.map(todo => (
            <Card key={todo.id} className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={getPriorityVariant(todo.priority)} className="text-xs">
                      {todo.priority[0].toUpperCase()}
                    </Badge>
                    <Badge variant={getStatusVariant(todo.status)} className="text-xs">
                      {todo.status === 'completed' ? '✓' : todo.status === 'in_progress' ? '→' : '○'}
                    </Badge>
                  </div>
                  <p className={`text-sm ${todo.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                    {todo.content}
                  </p>
                </div>
                
                <div className="flex items-center gap-1">
                  <Select value={todo.status} onValueChange={(value: 'pending' | 'in_progress' | 'completed') => updateStatus(todo.id, value)}>
                    <SelectTrigger className="w-12 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">○</SelectItem>
                      <SelectItem value="in_progress">→</SelectItem>
                      <SelectItem value="completed">✓</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    onClick={() => deleteTodo(todo.id)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    ×
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default TodoList;