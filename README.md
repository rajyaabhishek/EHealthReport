# Legal Document Processor

This application allows you to process legal documents by extracting case information and generating bookmarks for PDFs using AI.

## Environment Setup

Before running the application, you need to set up your AI API key:

1. Create a `.env` file in the root directory of the project
2. Add your AI API key to the file:

```
REACT_APP_AI_API_KEY=your_api_key_here
```

## Features

- **Legal Information Extraction**: Upload legal documents to automatically extract case details, party information, and legal provisions
- **PDF Bookmarking**: Generate structured bookmarks for legal PDFs to improve navigation
- **Document Inspection**: Preview PDFs while viewing extracted information in a side panel
- **Data Export**: Download extracted information as CSV or JSON files
- **Bookmark Export**: Download bookmarks as text files or apply them to PDFs

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser

## Usage

1. Upload a legal document (PDF format)
2. The AI will automatically extract case information and generate bookmarks
3. Use the inspection mode to review and edit extracted data
4. Download results in your preferred format
