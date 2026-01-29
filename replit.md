# Portfolio Application

## Overview

This is a full-stack web application built as a portfolio showcase with integrated Notion CMS. The application features a modern React frontend with a Node.js/Express backend, designed to display portfolio content managed through Notion databases. It uses a monorepo structure with shared TypeScript types and schemas, offering both static file fallback and dynamic Notion-powered content management.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Content Management**: Notion CMS integration with fallback to static files
- **File Serving**: Static file serving for media assets
- **Development**: Hot reloading with Vite integration
- **Error Handling**: Centralized error handling middleware
- **API Endpoints**: Portfolio data serving and Notion sync endpoints

### Database Architecture
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Schema**: Shared schema definitions between client and server
- **Migrations**: Drizzle Kit for database migrations
- **Validation**: Zod schemas generated from Drizzle tables

## Key Components

### Shared Layer
- **Database Schema**: User table with username/password authentication
- **Type Definitions**: Shared TypeScript interfaces and types
- **Validation**: Zod schemas for runtime validation

### Frontend Components
- **Profile Component**: Main portfolio display component
- **Admin Component**: Notion CMS management interface
- **RichText Component**: Markdown renderer for portfolio content
- **Attachments Component**: Image gallery with modal functionality
- **UI Components**: Comprehensive set of reusable UI components

### Backend Services
- **Notion Integration**: API client for Notion database operations
- **Storage Interface**: Abstracted storage layer with in-memory implementation
- **Route Handlers**: Express route configuration with CMS endpoints
- **Static File Serving**: Media asset delivery

### CMS Features
- **Notion Databases**: Structured content storage (General, Projects, Writing, Speaking, Education)
- **Data Synchronization**: Real-time sync between Notion and application
- **Admin Interface**: Web-based CMS management at `/admin`
- **Fallback System**: Graceful degradation to static JSON files

## Data Flow

1. **Content Loading**: Portfolio data is loaded from JSON files in the public directory
2. **Client Fetching**: React Query manages API calls and caching
3. **Component Rendering**: Profile component renders portfolio sections
4. **Image Handling**: Attachments component provides image viewing functionality
5. **Error Handling**: Centralized error boundaries and fallback UI

## External Dependencies

### Core Dependencies
- **React Ecosystem**: React 18, React DOM, React Query
- **Database**: Drizzle ORM, PostgreSQL via Neon serverless
- **UI/Styling**: Radix UI, Tailwind CSS, Lucide icons
- **Validation**: Zod for runtime type checking
- **Utilities**: Date-fns, clsx, class-variance-authority

### Development Dependencies
- **Build Tools**: Vite, ESBuild, TypeScript
- **Code Quality**: ESLint, Prettier (configured via components.json)
- **Development**: tsx for TypeScript execution

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20 with Replit modules
- **Database**: PostgreSQL 16 integration
- **Port Configuration**: Application runs on port 5000
- **Hot Reloading**: Vite development server with HMR

### Production Build
- **Frontend**: Vite builds optimized React bundle
- **Backend**: ESBuild bundles server code
- **Static Assets**: Served from dist/public directory
- **Process**: Single Node.js process serving both API and static content

### Deployment Configuration
- **Platform**: Replit with autoscale deployment target
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`
- **Port Mapping**: Internal port 5000 maps to external port 80

## Changelog

```
Changelog:
- June 27, 2025: Initial setup
- June 27, 2025: Completed Notion CMS integration with dynamic content management
  • Implemented full Notion API integration with database setup
  • Created admin interface at /admin for content management
  • Built API endpoints for real-time Notion data serving
  • Added fallback system to static files when Notion unavailable
  • Populated all Notion databases with complete authentic GitHub portfolio content
  • Added work experience integration to server and Notion API
  • Successfully verified portfolio serves all content from Notion: 2 projects (14 images), 3 work experiences, 1 speaking engagement (4 images)
  • Added Attachments field to Speaking database with image upload capability
  • All images linked to original GitHub repository for authentic content delivery
- June 27, 2025: Performance optimization with static generation system
  • Implemented event-driven static file generation for instant loading (30ms)
  • Created local image caching system in public/content/media/
  • Added static-generator.ts service for portfolio file management
  • Updated routes to serve pre-generated files instead of live Notion sync
  • Added admin panel controls for manual static file regeneration
  • Made admin button invisible (opacity: 0) positioned at bottom-right corner
  • Portfolio now loads instantly while maintaining Notion CMS capabilities
- June 28, 2025: Content ordering and Contact section implementation
  • Added Contact database to Notion with LinkedIn, Medium, Email entries
  • Implemented Order field system for precise content ordering control
  • Added Order number field to all databases (Projects, Work Experience, Writing, Speaking, Education, Contact)
  • Content now sorts by Order field (ascending) with fallback to creation order if Order field missing
  • Contact section fully functional with proper ordering (LinkedIn, Medium, Email, X, Dribbble)
  • Users can control exact display order by setting Order numbers in Notion databases (1, 2, 3, etc.)
- July 2, 2025: Dead code removal and optimization
  • Removed 41 unused UI components from shadcn/ui library (saved ~110 npm packages)
  • Removed unused user authentication system (User schema, storage interface)
  • Fixed duplicate /api/sync-notion endpoint in routes
  • Removed unused React Hook Form, Passport, and related authentication dependencies
  • Cleaned up unused Tailwind CSS configurations (sidebar, chart, accordion animations)
  • Simplified 404 page to match portfolio design system
  • Updated browserslist database to latest version
  • Significant reduction in bundle size and dependency count
- July 2, 2025: Code quality improvements and TypeScript enhancement
  • Added comprehensive TypeScript interfaces for all API responses and portfolio data
  • Created shared types file for consistent type definitions across project
  • Fixed all 'any' types in Admin.tsx with proper interfaces
  • Implemented React Error Boundary for better error handling
  • Refactored duplicate error handling in routes with reusable helper function
  • Enhanced CSS architecture by integrating portfolio variables with Tailwind config
  • Cleaned up mixed styling approach, removed redundant Tailwind classes
  • Added portfolio-specific color utilities to Tailwind configuration
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```