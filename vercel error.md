22:44:00.876 src/components/AIProjectInsights.tsx(50,49): error TS2554: Expected 1 arguments, but got 2.
22:44:00.877 src/components/GoalManager.tsx(385,43): error TS2345: Argument of type 'Date | undefined' is not assignable to parameter of type 'string | undefined'.
22:44:00.878 src/components/GoalManager.tsx(441,72): error TS2345: Argument of type 'Date' is not assignable to parameter of type 'string'.
22:44:00.878 src/components/GoalManager.tsx(466,34): error TS6133: 'progress' is declared but its value is never read.
22:44:00.878 src/components/KanbanBoard.tsx(1,27): error TS6133: 'useEffect' is declared but its value is never read.
22:44:00.878 src/components/KanbanBoard.tsx(1,38): error TS6133: 'useRef' is declared but its value is never read.
22:44:00.879 src/components/PomodoroTimer.tsx(4,41): error TS6133: 'CardTitle' is declared but its value is never read.
22:44:00.879 src/components/PomodoroTimer.tsx(26,30): error TS2503: Cannot find namespace 'NodeJS'.
22:44:00.879 src/components/PomodoroTimer.tsx(27,9): error TS6133: 'audioRef' is declared but its value is never read.
22:44:00.879 src/components/PomodoroTimer.tsx(32,9): error TS6133: 'LONG_BREAK_TIME' is declared but its value is never read.
22:44:00.879 src/components/ProjectManagement.tsx(10,16): error TS6133: 'CardContent' is declared but its value is never read.
22:44:00.880 src/components/ProjectManagement.tsx(12,1): error TS6133: 'Badge' is declared but its value is never read.
22:44:00.880 src/components/ProjectManagement.tsx(119,7): error TS2322: Type 'string' is not assignable to type 'Date'.
22:44:00.880 src/components/ProjectManagement.tsx(120,7): error TS2322: Type 'string' is not assignable to type 'Date'.
22:44:00.881 src/components/ProjectManagement.tsx(126,14): error TS2345: Argument of type '(prev: Task[]) => (Task | { updatedAt: string; id: string; title: string; description?: string | undefined; status: "in_progress" | "completed" | "todo" | "review"; priority: "high" | ... 2 more ... | "urgent"; ... 10 more ...; completedAt?: Date | undefined; })[]' is not assignable to parameter of type 'SetStateAction<Task[]>'.
22:44:00.882 src/components/ProjectManagement.tsx(142,7): error TS2322: Type 'string' is not assignable to type 'Date'.
22:44:00.882 src/components/ProjectManagement.tsx(143,7): error TS2322: Type 'string' is not assignable to type 'Date'.
22:44:00.883 src/components/ProjectManagement.tsx(149,17): error TS2345: Argument of type '(prev: Project[]) => (Project | { updatedAt: string; id: string; name: string; description?: string | undefined; status: "completed" | "planning" | "active" | "on_hold" | "cancelled"; ... 8 more ...; createdAt: Date; })[]' is not assignable to parameter of type 'SetStateAction<Project[]>'.
22:44:00.885 src/components/ProjectManagement.tsx(167,7): error TS2322: Type 'string' is not assignable to type 'Date'.
22:44:00.885 src/components/ProjectManagement.tsx(168,7): error TS2322: Type 'string' is not assignable to type 'Date'.
22:44:00.885 src/components/ProjectManagement.tsx(174,14): error TS2345: Argument of type '(prev: Goal[]) => (Goal | { updatedAt: string; id: string; title: string; description?: string | undefined; type: "daily" | "weekly" | "monthly" | "yearly" | "custom"; target: number; ... 5 more ...; createdAt: Date; })[]' is not assignable to parameter of type 'SetStateAction<Goal[]>'.
22:44:00.886 src/components/ProjectManagement.tsx(194,9): error TS6133: 'handleUpdateCategory' is declared but its value is never read.
22:44:00.886 src/components/ProjectManagement.tsx(200,9): error TS6133: 'handleDeleteCategory' is declared but its value is never read.
22:44:00.886 src/components/ProjectManagement.tsx(269,19): error TS2322: Type '{ projects: Project[]; tasks: Task[]; goals: Goal[]; onTaskUpdate: (id: string, updates: Partial<Task>) => void; onProjectUpdate: (id: string, updates: Partial<Project>) => void; }' is not assignable to type 'IntrinsicAttributes & AIProjectInsightsProps'.
22:44:00.886 src/components/ProjectManagement.tsx(279,19): error TS2322: Type '{ onProjectCreate: (project: Omit<Project, "id" | "createdAt" | "updatedAt">) => void; onTaskCreate: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void; categories: Category[]; }' is not assignable to type 'IntrinsicAttributes & AIProjectTemplateGeneratorProps'.
22:44:00.886 src/components/ProjectManagement.tsx(289,17): error TS2322: Type '{ tasks: Task[]; projects: Project[]; timeEntries: TimeEntry[]; goals: Goal[]; categories: Category[]; onTaskCreate: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void; onTaskUpdate: (id: string, updates: Partial<...>) => void; onTaskDelete: (id: string) => void; }' is not assignable to type 'IntrinsicAttributes & DashboardProps'.
22:44:00.886 src/components/ProjectManagement.tsx(300,15): error TS2322: Type '(id: string, updates: Partial<Task>) => void' is not assignable to type '(task: Task) => void'.
22:44:00.886 src/components/ProjectManagement.tsx(313,15): error TS2322: Type '(id: string, updates: Partial<Task>) => void' is not assignable to type '(task: Task) => void'.
22:44:00.886 src/components/ProjectManagement.tsx(315,15): error TS2322: Type '(category: Omit<Category, "id">) => void' is not assignable to type '(category: Omit<Category, "id" | "createdAt">) => void'.
22:44:00.887 src/components/ProjectManagement.tsx(322,15): error TS2322: Type '{ goals: Goal[]; projects: Project[]; onGoalCreate: (goal: Omit<Goal, "id" | "createdAt" | "updatedAt">) => void; onGoalUpdate: (id: string, updates: Partial<Goal>) => void; onGoalDelete: (id: string) => void; }' is not assignable to type 'IntrinsicAttributes & GoalManagerProps'.
22:44:00.887 src/components/ProjectManager.tsx(4,1): error TS6192: All imports in import declaration are unused.
22:44:00.887 src/components/ProjectManager.tsx(5,1): error TS6192: All imports in import declaration are unused.
22:44:00.908 Error: Command "npm run build" exited with 2