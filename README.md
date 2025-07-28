# AI Research Paper Tutor

A full-stack web application that transforms complex research papers into clear, comprehensive explanations using OpenAI's GPT-4.1. Upload PDFs or provide arXiv URLs to get section-by-section analysis with key concepts, complexity ratings, and detailed explanations.

## Features

- **PDF Upload & arXiv Integration**: Upload research papers directly or fetch from arXiv URLs
- **GPT-4.1 Analysis**: Comprehensive paper analysis using OpenAI's latest model
- **Section-by-Section Breakdown**: Detailed explanations for each paper section
- **Key Concept Extraction**: Automatic identification and explanation of important concepts
- **Interactive Interface**: Clean, academic-themed UI with sidebar navigation
- **Cost Tracking**: Real-time analysis of processing costs and token usage
- **Complexity Assessment**: Automatic difficulty rating (Beginner/Intermediate/Advanced)

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Shadcn/ui** component library
- **TanStack Query** for server state management
- **Wouter** for lightweight routing

### Backend
- **Node.js** with Express.js
- **TypeScript** with ES modules
- **OpenAI API** integration
- **PDF.js Extract** for PDF parsing
- **Multer** for file uploads
- **In-memory storage** (can be upgraded to PostgreSQL)

## Prerequisites

- Node.js 18+ (LTS recommended)
- OpenAI API key
- Modern web browser

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ai-research-tutor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   NODE_ENV=development
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5000`

## Usage

### Analyzing Papers

1. **Upload PDF**: Drag and drop a research paper PDF (max 10MB)
2. **arXiv URL**: Paste an arXiv paper URL (e.g., `https://arxiv.org/abs/1706.03762`)
3. **Quick Start**: Try the pre-loaded "Attention is All You Need" example

### Features in Action

- **Real-time Processing**: Watch progress as the AI analyzes your paper
- **Cost Estimation**: See processing costs before and after analysis
- **Interactive Navigation**: Use the sidebar to jump between sections
- **Key Concepts**: View extracted concepts with color-coded tags
- **Export Options**: Download analysis results (feature ready for implementation)

## API Endpoints

- `POST /api/papers/analyze` - Upload and analyze a paper
- `GET /api/papers/:id/analysis` - Retrieve paper analysis
- `GET /api/papers` - List all analyzed papers
- `POST /api/arxiv/validate` - Validate arXiv URLs

## Cost Information

Using GPT-4.1 API pricing (as of 2025):
- **Input**: $2.00 per 1M tokens
- **Output**: $8.00 per 1M tokens
- **Typical paper analysis**: $2-5 depending on paper length and complexity

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and configurations
├── server/                # Express backend
│   ├── services/          # Business logic services
│   │   ├── openai.ts      # OpenAI API integration
│   │   ├── pdfParser.ts   # PDF text extraction
│   │   └── arxivFetcher.ts # arXiv paper fetching
│   ├── routes.ts          # API route definitions
│   └── storage.ts         # Data storage interface
├── shared/                # Shared types and schemas
└── package.json           # Dependencies and scripts
```

## Configuration

### OpenAI Model
The application uses GPT-4.1 by default. You can modify the model in `server/services/openai.ts`:

```typescript
model: "gpt-4.1", // Change to gpt-4o, gpt-4.1-mini, etc.
```

### Database Upgrade
To use PostgreSQL instead of in-memory storage:

1. Install PostgreSQL dependencies:
   ```bash
   npm install drizzle-orm @neondatabase/serverless
   ```

2. Update database configuration in `drizzle.config.ts`
3. Replace `MemStorage` with database implementation in `server/storage.ts`

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run db:push` - Push database schema (when using PostgreSQL)

### Adding New Features

1. **New API Endpoints**: Add to `server/routes.ts`
2. **Frontend Components**: Create in `client/src/components/`
3. **Database Schema**: Update `shared/schema.ts`
4. **OpenAI Prompts**: Modify `server/services/openai.ts`

## Troubleshooting

### Common Issues

1. **OpenAI API Errors**
   - Verify your API key is correct
   - Check your OpenAI account has sufficient credits
   - Ensure the key has proper permissions

2. **PDF Upload Failures**
   - Check file size (max 10MB)
   - Ensure file is a valid PDF
   - Try a different PDF if extraction fails

3. **arXiv Fetch Issues**
   - Verify the arXiv URL format
   - Check internet connectivity
   - Some papers may have restricted access

### Debug Mode

Set `NODE_ENV=development` and check console logs for detailed error information.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit with clear messages: `git commit -m "Add feature description"`
5. Push and create a pull request

## License

This project is open source. Please ensure you comply with OpenAI's usage policies when using their API.

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review OpenAI API documentation
3. Create an issue in the repository

---

**Built with GPT-4.1 API for comprehensive research paper analysis**