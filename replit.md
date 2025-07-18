# Cognitive Testing Platform

## Overview

This is a web-based cognitive testing platform built with React (frontend) and Express.js (backend). The application allows researchers to administer various cognitive assessments including the Eriksen Flanker Task, Simple Reaction Time, Trail Making Task, Corsi Memory Task, and Go/No-Go Task. The platform captures participant demographics, test performance data, and provides data export capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: React Query for server state, local React state for UI
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Storage**: In-memory storage with extensible interface
- **API**: RESTful endpoints for data export

### Data Storage Strategy
- **Primary Storage**: Local browser storage (localStorage) for client-side data persistence
- **Database Schema**: PostgreSQL tables for test sessions and trial data
- **Export Formats**: CSV export for research data analysis

## Key Components

### Test Implementation
- **Flanker Task**: Measures selective attention and cognitive control
- **Reaction Time**: Basic processing speed assessment
- **Trail Making**: Executive function and visual scanning
- **Corsi Memory**: Spatial working memory assessment
- **Go/No-Go**: Response inhibition and sustained attention

### Data Collection
- **Participant Demographics**: Age, gender, participant ID (optional)
- **Trial-Level Data**: Reaction times, accuracy, stimulus presentation, responses
- **Session Management**: Test completion tracking and results aggregation

### UI/UX Design
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Accessibility**: ARIA labels and keyboard navigation support
- **Component System**: Consistent design language using shadcn/ui components
- **Dark Mode**: CSS variable-based theming system

## Data Flow

1. **Participant Registration**: Optional demographic information collected and stored locally
2. **Test Selection**: Users choose from available cognitive assessments
3. **Test Execution**: Real-time data collection during test administration
4. **Data Storage**: Trial data stored in localStorage with session persistence
5. **Results Display**: Aggregated performance metrics and detailed breakdowns
6. **Data Export**: CSV export functionality for research analysis

## External Dependencies

### Core Framework Dependencies
- React ecosystem (React, React DOM, React Query)
- Express.js with TypeScript support
- Drizzle ORM for database operations

### UI Component Libraries
- Radix UI primitives for accessible components
- Lucide React for iconography
- Tailwind CSS for styling
- shadcn/ui component system

### Development Tools
- Vite for build tooling and development server
- TypeScript for type safety
- ESBuild for production bundling
- PostCSS with Autoprefixer

### Database & Storage
- Neon Database (serverless PostgreSQL)
- Drizzle Kit for database migrations
- Local storage for client-side persistence

## Deployment Strategy

### Development Environment
- Vite development server with HMR
- Express server with middleware mode
- TypeScript compilation and type checking
- Database schema synchronization with Drizzle

### Production Build
- Vite static asset compilation
- Express server bundling with ESBuild
- Environment variable configuration for database
- Static file serving for frontend assets

### Database Management
- PostgreSQL schema defined in TypeScript
- Migration files generated automatically
- Connection pooling through Neon serverless
- Environment-based configuration

The application uses a monorepo structure with shared TypeScript interfaces between client and server, enabling type-safe development across the full stack. The cognitive tests are implemented as individual React components with standardized interfaces for data collection and export.