import { GoogleGenerativeAI } from "@google/generative-ai";
import { pdfjs } from 'react-pdf';

// Use the working PDF.js worker configuration from the second file
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Gemini API configuration
const GEMINI_API_KEY = process.env.REACT_APP_AI_API_KEY;
const MODEL_NAME = 'gemini-2.5-flash-preview-05-20';

class OpenAIService {
  constructor() {
    this.apiKey = GEMINI_API_KEY;
    
    // Check if API key exists before creating the Gemini instance
    if (!this.apiKey) {
      throw new Error('Gemini API key is not configured. Please set the REACT_APP_AI_API_KEY environment variable.');
    }
    
    // Initialize the Gemini model
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: MODEL_NAME });
  }

  // Helper method to clean JSON strings
  cleanJsonString(jsonStr) {
    // Remove code block markers if present
    let cleaned = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Fix common JSON issues
    cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
    cleaned = cleaned.replace(/([{,]\s*)(\w+):/g, '$1"$2":'); // Quote unquoted keys
    
    return cleaned.trim();
  }

  // Helper method to extract text from PDF
  async extractTextFromPdf(pdfFile) {
    try {
      // Read PDF file as ArrayBuffer
      const arrayBuffer = await this.readFileAsArrayBuffer(pdfFile);
      
      // Load PDF document using PDF.js
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      let fullText = '';
      
      // Process each page
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Extract text from the page
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n\n';
      }
      
      return fullText;
    } catch (error) {
      console.error("Error extracting PDF text:", error);
      throw error;
    }
  }
  
  // Helper method to read file as ArrayBuffer
  async readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  async processLegalDocument(pdfFile, processingMode) {
    try {
      // Extract text from PDF
      const pdfText = await this.extractTextFromPdf(pdfFile);
      
      let results = {};
      
      // Process extraction if mode is extract or both
      if (processingMode === 'extract' || processingMode === 'both') {
        const extractionPrompt = `<thinking>
I need to systematically analyze this legal document to extract precise information. Let me break this down into steps:

1. First, I'll identify the document type and structure
2. Then I'll scan for case identification details (numbers, dates, court info)
3. Next, I'll locate party information (appellant/petitioner and respondent)
4. I'll extract factual details and chronology
5. I'll identify legal provisions and acts cited
6. Finally, I'll summarize the judgment or decision

I need to be extremely careful about:
- Distinguishing between different types of legal entities (individual vs organization)
- Accurately parsing dates in various formats
- Identifying the correct hierarchy of courts
- Not confusing appellant/petitioner with respondent details
- Extracting exact legal citations and section numbers
- Being precise about case types and categories
</thinking>

You are an expert legal document analyst with deep knowledge of legal system, court procedures, and document formats. Analyze this legal document with systematic precision.

**DOCUMENT TO ANALYZE:**
PDF text content (${pdfFile.name}):
${pdfText.substring(0, 20000)}${pdfText.length > 20000 ? '... [text truncated for processing limits]' : ''}

**SYSTEMATIC ANALYSIS REQUIRED:**

**STEP 1: Document Classification**
- Identify if this is a judgment, petition, appeal, application, or other legal document
- Determine the court level (Supreme Court, High Court, District Court, etc.)
- Identify the jurisdiction and legal system context

**STEP 2: Case Identification Analysis**
- Extract case number with exact format and year
- Identify all relevant dates (filing, hearing, decision dates)
- Determine case type and sub-classifications
- Identify court establishment and district details

**STEP 3: Party Analysis**
For each party (appellant/petitioner and respondent):
- Distinguish between individual and organizational parties
- Extract complete names with proper salutations
- Identify relationship details (father's name, family relations)
- Extract demographic information (age, gender, caste if mentioned)
- Locate contact information (addresses, phone, email)
- Determine occupational details

**STEP 4: Factual and Legal Analysis**
- Extract chronological facts with specific dates and times
- Identify the core legal dispute or cause of action
- Locate specific amounts, properties, or assets involved
- Extract all cited legal provisions with exact act names and section numbers

**STEP 5: Health Report Analysis (if document contains health/medical data)**
- Extract test names, lab information, and report dates
- Identify patient demographics (age, gender)
- Analyze test parameters with values and reference ranges (keep VERY concise)
- Generate health insights and recommendations
- Identify critical values requiring medical attention
- Provide demographic-specific interpretations
- **IMPORTANT**: Format all medical recommendations and treatment suggestions as bullet points using • symbol, each recommendation on a new line
- **HEALTH INDICATORS**: Keep referenceRange as one word (e.g., "absent", "normal", "70-100") and interpretation as single word (Low/Normal/High/Borderline)

**STEP 6: Decision Analysis**
- Summarize the court's reasoning and judgment
- Identify the final outcome and relief granted

**CRITICAL REQUIREMENTS:**
- Use exact text from document - no paraphrasing
- Maintain original formatting for case numbers, dates, and citations
- Distinguish clearly between different parties
- Be precise about legal terminology and classifications
- If information is ambiguous, note the ambiguity rather than guessing
- **FORMAT MEDICAL RECOMMENDATIONS AND TREATMENT SUGGESTIONS AS BULLET POINTS**: Each recommendation should start with • symbol and be on a separate line
- **KEEP HEALTH INDICATORS CONCISE**: referenceRange should be one word or very short (e.g., "absent", "normal", "70-100"), interpretation should be single word (Low/Normal/High/Borderline)

**OUTPUT FORMAT:**
Return results in this exact JSON structure with maximum accuracy:

{
  "reportSummary": {
    "testName": "[Extract specific test name(s) performed]",
    "reportDate": "[Extract report generation date in YYYY-MM-DD format]",
    "labName": "[Extract laboratory or healthcare facility name]",
    "patientAge": "[Extract patient age or calculate from DOB]",
    "patientGender": "[Extract patient gender]"
  },
  "keyHealthIndicators": [
    {
      "parameterName": "[e.g., Fasting Blood Sugar, HDL, WBC count]",
      "value": "[Your actual value with units]",
      "referenceRange": "[One word or very short range like 'absent', '70-100', 'normal']",
      "interpretation": "[One word status: Low, Normal, High, Borderline]",
      "severity": "[Normal, Borderline, Critical, Alert]"
    }
  ],
  "aiGeneratedInsights": {
    "explanations": "[Simplified explanation of the parameters and results - e.g., Your HDL is slightly low, which can affect heart health]",
    "potentialCauses": "[e.g., Poor diet, sedentary lifestyle, dehydration, stress]",
    "interParameterRelationships": "[How different values relate to each other - e.g., high glucose + low HDL = metabolic syndrome risk]"
  },
  "medicalRecommendations": {
    "preventionTips": "[General health tips to prevent worsening - Format as bullet points using • symbol, each on new line]",
    "lifestyleModifications": "[Diet, Exercise, Sleep, Stress Management recommendations - Format as bullet points using • symbol, each on new line]",
    "homeRemedies": "[Home remedies if applicable - Format as bullet points using • symbol, each on new line]",
    "mentalWellness": "[Mental wellness suggestions - Format as bullet points using • symbol, each on new line]"
  },
  "treatmentSuggestions": {
    "doctorActions": "[e.g., Consult an endocrinologist for thyroid imbalance - Format as bullet points using • symbol, each on new line]",
    "suggestedMedications": "[Only if part of uploaded report - Format as bullet points using • symbol, each on new line]",
    "followUpTests": "[Recommended future tests or time to re-check - Format as bullet points using • symbol, each on new line]"
  },
 
  "criticalAlertSystem": {
    "redFlagIndicators": "[Values requiring immediate medical attention]",
    "emergencyContacts": "[When to call doctor vs. go to ER]",
    "urgencyTimeline": "[See doctor within 24 hours vs Schedule appointment this week]"
  },
  "demographicInterpretations": {
    "ageAdjustedRanges": "[Different normals for children, adults, elderly]",
    "genderSpecificAnalysis": "[Hormonal considerations, pregnancy factors]",
    "ethnicityConsiderations": "[Some conditions have different prevalence rates]",
    "specialPopulations": "[Diabetics, pregnant women, athletes, etc.]"
  },
  "healthSummary": "[Comprehensive health summary in plain language + technical details for sharing with doctors]"
}

**IMPORTANT:** Use "Not Found" only when information is definitively absent. If information exists but is unclear, provide the best interpretation with a note about ambiguity.`;

        try {
          const extractionResult = await this.model.generateContent(extractionPrompt);
          const extractionContent = extractionResult.response.text();
          
          try {
            // Extract JSON from the response
            const jsonMatch = extractionContent.match(/```json\n([\s\S]*?)\n```/) || 
                            extractionContent.match(/```\n([\s\S]*?)\n```/) ||
                            extractionContent.match(/\{([\s\S]*?)\}/);
            
            if (jsonMatch) {
              const jsonStr = jsonMatch[0].startsWith('{') ? jsonMatch[0] : jsonMatch[1];
              // Clean up the JSON string to fix common issues
              const cleanedJsonStr = this.cleanJsonString(jsonStr);
              const extractedData = JSON.parse(cleanedJsonStr);
              
              // Apply default "Not Found" values to any missing fields
              const defaultStructure = {
                reportSummary: {
                  testName: "Not Found",
                  reportDate: "Not Found",
                  labName: "Not Found",
                  patientAge: "Not Found",
                  patientGender: "Not Found"
                },
                keyHealthIndicators: [],
                aiGeneratedInsights: {
                  explanations: "Not Found",
                  potentialCauses: "Not Found",
                  interParameterRelationships: "Not Found"
                },
                medicalRecommendations: {
                  preventionTips: "Not Found",
                  lifestyleModifications: "Not Found",
                  homeRemedies: "Not Found",
                  mentalWellness: "Not Found"
                },
                treatmentSuggestions: {
                  doctorActions: "Not Found",
                  suggestedMedications: "Not Found",
                  followUpTests: "Not Found"
                },
              
                criticalAlertSystem: {
                  redFlagIndicators: "Not Found",
                  emergencyContacts: "Not Found",
                  urgencyTimeline: "Not Found"
                },
                demographicInterpretations: {
                  ageAdjustedRanges: "Not Found",
                  genderSpecificAnalysis: "Not Found",
                  ethnicityConsiderations: "Not Found",
                  specialPopulations: "Not Found"
                },
                healthSummary: "Not Found"
              };
              
              // Merge with default structure to ensure all fields exist
              results.extractedData = {
                ...defaultStructure,
                ...extractedData,
                reportSummary: { ...defaultStructure.reportSummary, ...(extractedData.reportSummary || {}) },
                keyHealthIndicators: extractedData.keyHealthIndicators || defaultStructure.keyHealthIndicators,
                aiGeneratedInsights: { ...defaultStructure.aiGeneratedInsights, ...(extractedData.aiGeneratedInsights || {}) },
                medicalRecommendations: { ...defaultStructure.medicalRecommendations, ...(extractedData.medicalRecommendations || {}) },
                treatmentSuggestions: { ...defaultStructure.treatmentSuggestions, ...(extractedData.treatmentSuggestions || {}) },
                riskPrediction: { ...defaultStructure.riskPrediction, ...(extractedData.riskPrediction || {}) },
                criticalAlertSystem: { ...defaultStructure.criticalAlertSystem, ...(extractedData.criticalAlertSystem || {}) },
                demographicInterpretations: { ...defaultStructure.demographicInterpretations, ...(extractedData.demographicInterpretations || {}) }
              };
            } else {
              // If no JSON found, use default structure
              results.extractedData = this.getDefaultStructure();
            }
          } catch (parseError) {
            console.error("Error parsing extraction response:", parseError);
            results.extractedData = this.getDefaultStructure();
          }
        } catch (apiError) {
          console.error("Error calling Gemini API for extraction:", apiError);
          results.extractedData = this.getDefaultStructure();
        }
      }
      
      // Process bookmark generation if mode is bookmark or both
      if (processingMode === 'bookmark' || processingMode === 'both') {
        const bookmarkPrompt = `<thinking>
I need to create comprehensive bookmarks for this legal document. Let me think through this systematically:

1. First, I'll read through the entire document to understand its overall structure
2. I'll identify the main sections and their hierarchy
3. I'll determine appropriate page ranges based on content flow and length
4. I'll create meaningful, specific titles that help users navigate
5. I'll establish proper hierarchy levels (1 for main sections, 2 for subsections, 3 for detailed subsections)

For legal documents, typical sections might include:
- Case header/title information
- Parties and their details
- Procedural history
- Facts of the case
- Issues raised
- Arguments by parties
- Legal analysis
- Citations and precedents
- Court's findings
- Judgment/Order
- Directions/Relief granted

I need to be precise about page estimations based on content density and flow.
</thinking>

You are an expert legal document specialist with extensive experience in creating detailed navigation systems for complex legal texts. Analyze this document with systematic precision to create comprehensive bookmarks.

**DOCUMENT TO ANALYZE:**
PDF text content (${pdfFile.name}):
${pdfText.substring(0, 20000)}${pdfText.length > 20000 ? '... [text truncated for processing limits]' : ''}

**SYSTEMATIC BOOKMARK ANALYSIS:**

**STEP 1: Document Structure Analysis**
- Identify the overall document type and format
- Determine the logical flow and organization
- Locate clear section breaks and transitions
- Identify repetitive patterns or standard formats

**STEP 2: Content Sectioning**
- Map out all major thematic sections
- Identify subsections within each major section
- Locate specific legal elements (facts, arguments, citations, judgments)
- Determine natural breaking points for navigation

**STEP 3: Hierarchy Determination**
- Level 1: Major document sections (Case Details, Facts, Arguments, Judgment, etc.)
- Level 2: Subsections within major sections (Appellant's Arguments, Respondent's Arguments, etc.)
- Level 3: Specific elements within subsections (Individual points, specific citations, etc.)

**STEP 4: Page Estimation Strategy**
- Estimate page breaks based on content density
- Consider typical legal document formatting
- Account for paragraph breaks and section transitions
- Provide realistic page ranges for each section

**COMPREHENSIVE REQUIREMENTS:**
- Create bookmarks for ALL identifiable sections, no matter how small
- Use specific, descriptive titles that reflect actual content
- Provide accurate page estimations based on content flow
- Establish clear hierarchy that aids navigation
- Include bookmarks for procedural elements, legal citations, and administrative details
- Ensure no important section is missed

**BOOKMARK CATEGORIES TO IDENTIFY:**
1. **Administrative Sections**: Case numbers, court details, parties list
2. **Procedural Sections**: Filing details, hearing dates, procedural history
3. **Substantive Sections**: Facts, issues, arguments, evidence
4. **Legal Analysis**: Citations, precedents, legal reasoning
5. **Conclusion Sections**: Findings, judgment, orders, directions

**OUTPUT FORMAT:**
Create a comprehensive JSON array with detailed bookmarks:

[
  {
    "title": "[Specific, descriptive title reflecting actual content]",
    "level": "[1, 2, or 3 based on hierarchy]",
    "page": "[Primary page number where section begins]",
    "startPage": "[First page of the section]",
    "endPage": "[Last page of the section]"
  }
]

**EXAMPLES OF GOOD BOOKMARK TITLES:**
- "Case No. [Specific Number] - Initial Details"
- "Appellant [Name] - Personal Details and Background"
- "Facts: Property Dispute at [Location]"
- "Legal Provisions: Indian Contract Act Sections 10-17"
- "Court's Analysis of Evidence Presented"
- "Final Judgment and Relief Granted"

**CRITICAL INSTRUCTIONS:**
- Make titles specific to the actual content, not generic
- Ensure page ranges don't overlap inappropriately
- Create enough detail for easy navigation without being overwhelming
- Include bookmarks for legal citations and precedents mentioned
- Cover the entire document comprehensively

Return only the JSON array of bookmarks, ensuring complete coverage of the document.`;

        try {
          const bookmarkResult = await this.model.generateContent(bookmarkPrompt);
          const bookmarkContent = bookmarkResult.response.text();
          
          try {
            // Extract JSON from the response
            const jsonMatch = bookmarkContent.match(/```json\n([\s\S]*?)\n```/) || 
                            bookmarkContent.match(/```\n([\s\S]*?)\n```/) ||
                            bookmarkContent.match(/\[([\s\S]*?)\]/) ||
                            bookmarkContent.match(/\{([\s\S]*?)\}/);
            
            if (jsonMatch) {
              let jsonStr = jsonMatch[0];
              
              // Handle case where we get a single object instead of array
              if (jsonStr.startsWith('{')) {
                jsonStr = '[' + jsonStr + ']';
              }
              
              // Ensure we have brackets
              if (!jsonStr.startsWith('[')) {
                jsonStr = '[' + jsonStr + ']';
              }
              
              // Clean up the JSON string
              const cleanedJsonStr = this.cleanJsonString(jsonStr);
              
              let parsedBookmarks = JSON.parse(cleanedJsonStr);
              
              // Handle nested arrays - flatten if needed
              if (Array.isArray(parsedBookmarks) && parsedBookmarks.length === 1 && Array.isArray(parsedBookmarks[0])) {
                parsedBookmarks = parsedBookmarks[0];
              }
              
              // Ensure we have an array of bookmark objects
              if (!Array.isArray(parsedBookmarks)) {
                parsedBookmarks = [parsedBookmarks];
              }
              
              // Validate bookmark structure and add missing fields
              parsedBookmarks = parsedBookmarks.map((bookmark, index) => {
                if (!bookmark || typeof bookmark !== 'object') {
                  return {
                    title: `Section ${index + 1}`,
                    level: 1,
                    page: 1,
                    startPage: 1,
                    endPage: 1
                  };
                }
                
                return {
                  title: bookmark.title || `Section ${index + 1}`,
                  level: bookmark.level || 1,
                  page: bookmark.page || bookmark.startPage || 1,
                  startPage: bookmark.startPage || bookmark.page || 1,
                  endPage: bookmark.endPage || bookmark.startPage || bookmark.page || 1
                };
              });
              
              results.bookmarkData = parsedBookmarks;
            } else {
              // If no valid JSON found, use fallback bookmarks
              results.bookmarkData = [
                { title: "Document Start", level: 1, page: 1, startPage: 1, endPage: 1 }
              ];
            }
          } catch (parseError) {
            console.error("Error parsing bookmark response:", parseError);
            
            // Provide a basic fallback bookmark
            results.bookmarkData = [
              { title: "Document Start", level: 1, page: 1, startPage: 1, endPage: 1 }
            ];
          }
        } catch (apiError) {
          console.error("Error calling Gemini API for bookmarks:", apiError);
          
          results.bookmarkData = [
            { title: "Document Start", level: 1, page: 1, startPage: 1, endPage: 1 }
          ];
        }
      }
      
      return results;
    } catch (error) {
      console.error("Error processing legal document:", error);
      throw error;
    }
  }

  // Helper method to get default structure
  getDefaultStructure() {
    return {
      reportSummary: {
        testName: "Not Found",
        reportDate: "Not Found",
        labName: "Not Found",
        patientAge: "Not Found",
        patientGender: "Not Found"
      },
      keyHealthIndicators: [],
      aiGeneratedInsights: {
        explanations: "Not Found",
        potentialCauses: "Not Found",
        interParameterRelationships: "Not Found"
      },
      medicalRecommendations: {
        preventionTips: "Not Found",
        lifestyleModifications: "Not Found",
        homeRemedies: "Not Found",
        mentalWellness: "Not Found"
      },
      treatmentSuggestions: {
        doctorActions: "Not Found",
        suggestedMedications: "Not Found",
        followUpTests: "Not Found"
      },
      
      criticalAlertSystem: {
        redFlagIndicators: "Not Found",
        emergencyContacts: "Not Found",
        urgencyTimeline: "Not Found"
      },
      demographicInterpretations: {
        ageAdjustedRanges: "Not Found",
        genderSpecificAnalysis: "Not Found",
        ethnicityConsiderations: "Not Found",
        specialPopulations: "Not Found"
      },
      healthSummary: "Not Found"
    };
  }
}

export default OpenAIService;

// Helper functions for processing PDFs (these use the actual service)
export const extractDataFromPDF = async (file) => {
  const service = new OpenAIService();
  const result = await service.processLegalDocument(file, 'extract');
  return result.extractedData;
};

export const generateBookmarks = async (file) => {
  const service = new OpenAIService();
  const result = await service.processLegalDocument(file, 'bookmark');
  return result.bookmarkData;
};

export const processDocument = async (file, mode = 'both') => {
  const service = new OpenAIService();
  return await service.processLegalDocument(file, mode);
};