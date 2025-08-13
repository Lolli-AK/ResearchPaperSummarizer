# AI Research Paper Tutor

## Overview

This is a full-stack web application that serves as an AI tutor for research papers. The application allows users to upload PDF research papers or provide arXiv URLs, then uses GPT-4.1 to analyze and explain the papers in an accessible format. The system breaks down complex research into digestible sections with explanations, key concepts, and structured analysis.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom academic-themed color variables
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Cloud Database**: Neon Database (@neondatabase/serverless)
- **File Processing**: Multer for file uploads, pdf.js-extract for PDF parsing
- **AI Integration**: OpenAI GPT-4.1 for paper analysis

### Development Environment
- **Platform**: Replit-optimized with cartographer plugin for development
- **Build System**: Vite for frontend, esbuild for backend bundling
- **Package Manager**: npm with lockfile v3

## Key Components

### Core Services
1. **PDF Parser Service** (`server/services/pdfParser.ts`)
   - Extracts text and structure from uploaded PDFs
   - Identifies title, authors, abstract, and sections
   - Handles various PDF formats and layouts

2. **ArXiv Fetcher Service** (`server/services/arxivFetcher.ts`)
   - Downloads papers directly from arXiv URLs
   - Extracts metadata from arXiv API
   - Validates arXiv URL formats

3. **OpenAI Analysis Service** (`server/services/openai.ts`)
   - Uses GPT-4o for comprehensive paper analysis with chunking for large papers
   - Generates structured explanations and summaries
   - **AI Title Generation**: Creates proper academic titles from content analysis instead of problematic PDF parsing
   - Calculates processing costs and complexity ratings
   - Handles papers exceeding token limits through intelligent text segmentation

### Database Schema
- **Users**: User accounts with credit system for API usage tracking
- **Papers**: Stores paper metadata, content, and processing status
- **Analyses**: Structured analysis results including sections, concepts, and costs

### Frontend Components
- **Upload Section**: Handles both file uploads and arXiv URL input with example papers
- **Processing Status**: Real-time progress tracking with cost estimation
- **Paper Analysis**: Displays structured analysis with sidebar navigation and export functionality
  - **Editable Title Feature**: Users can customize AI-generated titles with edit/save/cancel functionality
  - **Enhanced PDF Export**: Generates PDFs with website-matching format, colors, and embedded diagram placeholders
- **Paper Sidebar**: Navigation for sections and key concepts visualization
- **Diagram Generator**: SVG-based visual diagrams with deduplication system
  - **Unique Diagrams**: Prevents duplicate diagram types (architecture, flowchart, concept map) per paper
  - **Smart Allocation**: Each section gets a unique diagram type to avoid repetition

## Data Flow

1. **Paper Submission**: User uploads PDF or provides arXiv URL
2. **Content Extraction**: System parses PDF or fetches from arXiv
3. **AI Processing**: GPT-4.1 analyzes content and generates explanations
4. **Storage**: Results stored in PostgreSQL with structured JSON data
5. **Presentation**: Frontend displays analysis with interactive navigation

## External Dependencies

### Core Libraries
- **Database**: Drizzle ORM with PostgreSQL driver and Neon serverless
- **AI Service**: OpenAI SDK for GPT-4.1 integration
- **PDF Processing**: pdf.js-extract for text extraction
- **File Handling**: Multer for multipart form uploads
- **HTTP Client**: node-fetch for arXiv API requests

### UI Dependencies
- **Component Library**: Extensive Radix UI primitives collection
- **Styling**: Tailwind CSS with PostCSS processing
- **Icons**: Lucide React for consistent iconography
- **Date Handling**: date-fns for time formatting

## Deployment Strategy

### Development
- Runs on Replit with hot reload via Vite HMR
- TypeScript compilation with incremental builds
- Environment variables for database and API keys

### Production Build
- Frontend: Vite builds optimized static assets to `dist/public`
- Backend: esbuild bundles server code to `dist/index.js`
- Database: Drizzle migrations in `migrations/` directory

### Database Management
- Schema defined in `shared/schema.ts` for type safety
- Drizzle Kit handles migrations with `db:push` command
- Connection via DATABASE_URL environment variable

### Key Configuration Files
- `drizzle.config.ts`: Database configuration for PostgreSQL
- `vite.config.ts`: Frontend build configuration with path aliases
- `tailwind.config.ts`: Custom styling with academic theme variables
- `components.json`: Shadcn/ui configuration for component generation

The application is designed as an educational tool that makes academic research more accessible through AI-powered explanations while maintaining a clean, professional interface optimized for academic content consumption.