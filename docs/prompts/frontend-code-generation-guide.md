# Frontend Code Generation Guide for Procurement System

## Overview

This guide provides instructions for generating frontend code for a microservices-based procurement platform using Next.js 14, React 19, and a Turborepo monorepo structure. Follow these guidelines to ensure code maintainability, testability, and composability.

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **UI**: React 19, shadcn/ui
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Authentication**: Clerk
- **Routing & Middleware**: Hono
- **Build Tool**: Turborepo

## Directory Structure

When generating code, follow this directory structure for frontend applications:

```
/apps/[app-name]/
├── app/
│   ├── (auth)/              # Authentication-related routes
│   ├── (dashboard)/         # Dashboard and main features
│   ├── api/                 # API routes (if needed)
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Homepage
│   └── globals.css          # Global styles
├── components/
│   ├── ui/                  # Reusable UI components
│   ├── forms/               # Form components
│   ├── data-display/        # Tables, charts, etc.
│   └── [feature]/           # Feature-specific components
├── hooks/                   # Custom React hooks
├── lib/                     # Utility functions
├── store/                   # Zustand stores
├── types/                   # TypeScript type definitions
└── utils/                   # Helper functions
```

## Code Generation Principles

### 1. Component Structure

Generate React components using this structure:

```tsx
// Feature component
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { fetchData } from '@/lib/api';

export function FeatureComponent({ initialData }) {
  // State management
  const [state, setState] = useState(initialData);
  
  // Data fetching
  const { data, isLoading } = useQuery({
    queryKey: ['data-key'],
    queryFn: fetchData,
    initialData,
  });
  
  // Event handlers
  const handleAction = () => {
    // Implementation
  };
  
  // Conditional rendering
  if (isLoading) return <LoadingSpinner />;
  
  // Component rendering
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Feature Title</h2>
      {/* Component content */}
      <Button onClick={handleAction}>Action</Button>
    </div>
  );
}
```

### 2. Server Components

Prefer React Server Components for data fetching and static content:

```tsx
// app/dashboard/page.tsx
import { DashboardMetrics } from '@/components/dashboard/metrics';
import { fetchMetricsData } from '@/lib/api';

export default async function DashboardPage() {
  // Server-side data fetching
  const metricsData = await fetchMetricsData();
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <DashboardMetrics data={metricsData} />
      {/* Other dashboard components */}
    </div>
  );
}
```

### 3. Client Components

Use the "use client" directive for interactive components:

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function InteractiveComponent({ onAction }) {
  const [state, setState] = useState(false);
  
  return (
    <div className="p-4 border rounded">
      <Button onClick={() => {
        setState(!state);
        onAction(state);
      }}>
        Toggle State
      </Button>
    </div>
  );
}
```

### 4. State Management with Zustand

Create focused stores for specific features:

```tsx
// store/procurement-store.ts
import { create } from 'zustand';

interface ProcurementStore {
  requests: ProcurementRequest[];
  selectedRequest: ProcurementRequest | null;
  isLoading: boolean;
  error: string | null;
  setRequests: (requests: ProcurementRequest[]) => void;
  selectRequest: (id: string) => void;
  // Other actions
}

export const useProcurementStore = create<ProcurementStore>((set, get) => ({
  requests: [],
  selectedRequest: null,
  isLoading: false,
  error: null,
  setRequests: (requests) => set({ requests }),
  selectRequest: (id) => {
    const request = get().requests.find(req => req.id === id);
    set({ selectedRequest: request });
  },
  // Other action implementations
}));
```

### 5. API Client Implementation

Create type-safe API clients:

```tsx
// lib/api/procurement.ts
import { api } from './api-client';
import type { ProcurementRequest, CreateRequestPayload } from '@/types';

export const procurementApi = {
  getRequests: async (): Promise<ProcurementRequest[]> => {
    return api.get('/api/v1/procurement/requests');
  },
  
  getRequestById: async (id: string): Promise<ProcurementRequest> => {
    return api.get(`/api/v1/procurement/requests/${id}`);
  },
  
  createRequest: async (payload: CreateRequestPayload): Promise<ProcurementRequest> => {
    return api.post('/api/v1/procurement/requests', payload);
  },
  
  // Other API methods
};
```

### 6. Form Handling

Implement forms with proper validation:

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { procurementApi } from '@/lib/api';

export function RequestForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const validateForm = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.budget) newErrors.budget = 'Budget is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const result = await procurementApi.createRequest({
        ...formData,
        budget: parseFloat(formData.budget),
      });
      onSuccess(result);
    } catch (error) {
      setErrors({ form: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form fields */}
      <div className="space-y-2">
        <label htmlFor="title" className="block text-sm font-medium">Title</label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          className={errors.title ? "border-red-500" : ""}
        />
        {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
      </div>
      
      {/* Additional fields */}
      
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Create Request'}
      </Button>
      
      {errors.form && <p className="text-red-500">{errors.form}</p>}
    </form>
  );
}
```

### 7. Testing Approach

Generate test files for components:

```tsx
// __tests__/components/request-form.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RequestForm } from '@/components/forms/request-form';
import { procurementApi } from '@/lib/api';

// Mock API
jest.mock('@/lib/api', () => ({
  procurementApi: {
    createRequest: jest.fn(),
  },
}));

describe('RequestForm', () => {
  const onSuccess = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders the form correctly', () => {
    render(<RequestForm onSuccess={onSuccess} />);
    
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create request/i })).toBeInTheDocument();
  });
  
  it('shows validation errors on empty submission', async () => {
    render(<RequestForm onSuccess={onSuccess} />);
    
    fireEvent.click(screen.getByRole('button', { name: /create request/i }));
    
    expect(await screen.findByText(/title is required/i)).toBeInTheDocument();
    expect(procurementApi.createRequest).not.toHaveBeenCalled();
  });
  
  it('submits form with valid data', async () => {
    procurementApi.createRequest.mockResolvedValueOnce({ id: '123', title: 'Test Request' });
    
    render(<RequestForm onSuccess={onSuccess} />);
    
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Test Request' } });
    fireEvent.change(screen.getByLabelText(/budget/i), { target: { value: '1000' } });
    
    fireEvent.click(screen.getByRole('button', { name: /create request/i }));
    
    await waitFor(() => {
      expect(procurementApi.createRequest).toHaveBeenCalledWith({
        title: 'Test Request',
        description: '',
        budget: 1000,
      });
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
```

## Feature-Specific Guidelines

### 1. Map Visualization

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMapData } from '@/lib/api';

export function DeliveryMap({ requestId }) {
  const mapRef = useRef(null);
  const { data, isLoading } = useQuery({
    queryKey: ['map-data', requestId],
    queryFn: () => fetchMapData(requestId),
  });
  
  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !data) return;
    
    // Setup map with data
    // This would use a mapping library integration
    
    return () => {
      // Cleanup
    };
  }, [data]);
  
  if (isLoading) return <div className="h-64 bg-gray-100 animate-pulse" />;
  
  return (
    <div className="border rounded overflow-hidden">
      <div ref={mapRef} className="h-64" />
    </div>
  );
}
```

### 2. Real-time Chat

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { chatApi } from '@/lib/api';

export function RequestChat({ requestId }) {
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();
  
  // Fetch messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['request-messages', requestId],
    queryFn: () => chatApi.getMessages(requestId),
    refetchInterval: 5000, // Poll for new messages
  });
  
  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: (message) => chatApi.sendMessage(requestId, message),
    onSuccess: () => {
      queryClient.invalidateQueries(['request-messages', requestId]);
      setMessage('');
    },
  });
  
  const handleSend = () => {
    if (!message.trim()) return;
    sendMutation.mutate({ content: message });
  };
  
  return (
    <div className="flex flex-col h-96 border rounded">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <p>Loading messages...</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`p-3 rounded ${msg.isMine ? 'bg-blue-100 ml-auto' : 'bg-gray-100'} max-w-[80%]`}>
              <p className="text-sm font-medium">{msg.sender.name}</p>
              <p className="mt-1">{msg.content}</p>
              <p className="text-xs text-gray-500 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
            </div>
          ))
        )}
      </div>
      
      <div className="border-t p-4 flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1"
        />
        <Button 
          onClick={handleSend}
          disabled={!message.trim() || sendMutation.isPending}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
```

## Common Pitfalls to Avoid

1. **Over-engineering components** - Keep components focused and small
2. **Prop drilling** - Use Zustand for state that needs to be shared across multiple components
3. **Insufficient error handling** - Always handle loading, error, and success states
4. **Poor type definitions** - Define comprehensive TypeScript types for all data structures
5. **Mixing concerns** - Separate data fetching, state management, and UI rendering
6. **Unnecessary re-renders** - Use memoization techniques for expensive components
7. **Lacking accessibility** - Ensure all UI elements are properly labeled and accessible

## Best Practices for Code Generation

1. Generate code with detailed TypeScript interfaces for all props and state
2. Create reusable hooks for common functionality
3. Separate UI components from business logic
4. Include proper error boundaries and fallback components
5. Write test cases for critical components
6. Document component props and usage patterns
7. Ensure consistency in styling and component composition
8. Structure code for code splitting and lazy loading
