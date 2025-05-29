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

**STEP 5: Decision Analysis**
- Summarize the court's reasoning and judgment
- Identify the final outcome and relief granted

**CRITICAL REQUIREMENTS:**
- Use exact text from document - no paraphrasing
- Maintain original formatting for case numbers, dates, and citations
- Distinguish clearly between different parties
- Be precise about legal terminology and classifications
- If information is ambiguous, note the ambiguity rather than guessing

**OUTPUT FORMAT:**
Return results in this exact JSON structure with maximum accuracy:

{
  "caseBasicDetails": {
    "district": "[Extract exact district name]",
    "establishment": "[Extract exact court establishment name]",
    "caseType": "[Extract specific case type]",
    "reliefSought": "[Extract specific relief mentioned]",
    "caseTypeSpecific": "[Extract sub-category of case type]",
    "subCourt": "[Extract sub-court if mentioned]",
    "subDistCourt": "[Extract sub-district court if applicable]",
    "subEstablishment": "[Extract sub-establishment if mentioned]",
    "subCaseType": "[Extract detailed case sub-type]",
    "caseNumber": "[Extract exact case number with format]",
    "caseYear": "[Extract case year]",
    "decisionDate": "[Extract decision date in YYYY-MM-DD format]",
    "appliedDate": "[Extract application/filing date in YYYY-MM-DD format]",
    "receivedDate": "[Extract received date in YYYY-MM-DD format]",
    "partyName": "[Extract primary party name]",
    "partyMobile": "[Extract contact number if available]"
  },
  "appellantDetails": {
    "type": "[Individual/Organization/Government etc.]",
    "salutation": "[Mr./Ms./Dr./Shri etc.]",
    "name": "[Complete name as written]",
    "gender": "[Male/Female/Other if identifiable]",
    "fatherFlag": "[Yes/No - if father's name is mentioned]",
    "fatherName": "[Complete father's name]",
    "dob": "[Date of birth in YYYY-MM-DD if available]",
    "age": "[Age in years]",
    "caste": "[Caste if mentioned]",
    "extraCount": "[Number of additional appellants]",
    "email": "[Email address if available]",
    "mobile": "[Mobile number if available]",
    "occupation": "[Profession/occupation]",
    "address": "[Complete address as written]",
    "pincode": "[PIN code if available]",
    "state": "[State name]",
    "district": "[District name]"
  },
  "respondentDetails": {
    "type": "[Individual/Organization/Government etc.]",
    "salutation": "[Mr./Ms./Dr./Shri etc.]",
    "name": "[Complete name as written]",
    "gender": "[Male/Female/Other if identifiable]",
    "fatherFlag": "[Yes/No - if father's name is mentioned]",
    "fatherName": "[Complete father's name]",
    "dob": "[Date of birth in YYYY-MM-DD if available]",
    "age": "[Age in years]",
    "caste": "[Caste if mentioned]",
    "extraCount": "[Number of additional respondents]",
    "email": "[Email address if available]",
    "mobile": "[Mobile number if available]",
    "occupation": "[Profession/occupation]",
    "address": "[Complete address as written]",
    "pincode": "[PIN code if available]",
    "state": "[State name]",
    "district": "[District name]"
  },
  "factsDetails": {
    "factDate": "[Key incident date in YYYY-MM-DD format]",
    "factTime": "[Time if mentioned in HH:MM format]",
    "facts": "[Comprehensive summary of key facts in chronological order]"
  },
  "caseDetails": {
    "causeOfAction": "[Specific legal cause of action]",
    "offenseDate": "[Date of alleged offense in YYYY-MM-DD format]",
    "subject": "[Subject matter of the case]",
    "reliefOffense": "[Type of relief or offense category]",
    "amount": "[Monetary amount involved if any]",
    "registeredPlace": "[true/false - if place of registration is mentioned]",
    "stateId": "[State identifier/code]",
    "districtCode": "[District code if available]"
  },
  "legalProvisions": [
    {
      "act": "[Exact name of the Act]",
      "sections": ["[Section numbers as array]"]
    }
  ],
  "judgmentSummary": "[Detailed summary of the court's decision, reasoning, and final outcome]"
}

**IMPORTANT:** Use "Not Found" only when information is definitively absent. If information exists but is unclear, provide the best interpretation with a note about ambiguity.`;

        try {
          const extractionResult = await this.model.generateContent(extractionPrompt);
          const extractionContent = extractionResult.response.text();
          console.log("Extraction API Response:", extractionContent);
          
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
                caseBasicDetails: {
                  district: "Not Found",
                  establishment: "Not Found",
                  caseType: "Not Found",
                  reliefSought: "Not Found",
                  caseTypeSpecific: "Not Found",
                  subCourt: "Not Found",
                  subDistCourt: "Not Found",
                  subEstablishment: "Not Found",
                  subCaseType: "Not Found",
                  caseNumber: "Not Found",
                  caseYear: "Not Found",
                  decisionDate: "Not Found",
                  appliedDate: "Not Found",
                  receivedDate: "Not Found",
                  partyName: "Not Found",
                  partyMobile: "Not Found"
                },
                appellantDetails: {
                  type: "Not Found",
                  salutation: "Not Found",
                  name: "Not Found",
                  gender: "Not Found",
                  fatherFlag: "Not Found",
                  fatherName: "Not Found",
                  dob: "Not Found",
                  age: "Not Found",
                  caste: "Not Found",
                  extraCount: "Not Found",
                  email: "Not Found",
                  mobile: "Not Found",
                  occupation: "Not Found",
                  address: "Not Found",
                  pincode: "Not Found",
                  state: "Not Found",
                  district: "Not Found"
                },
                respondentDetails: {
                  type: "Not Found",
                  salutation: "Not Found",
                  name: "Not Found",
                  gender: "Not Found",
                  fatherFlag: "Not Found",
                  fatherName: "Not Found",
                  dob: "Not Found",
                  age: "Not Found",
                  caste: "Not Found",
                  extraCount: "Not Found",
                  email: "Not Found",
                  mobile: "Not Found",
                  occupation: "Not Found",
                  address: "Not Found",
                  pincode: "Not Found",
                  state: "Not Found",
                  district: "Not Found"
                },
                factsDetails: {
                  factDate: "Not Found",
                  factTime: "Not Found",
                  facts: "Not Found"
                },
                caseDetails: {
                  causeOfAction: "Not Found",
                  offenseDate: "Not Found",
                  subject: "Not Found",
                  reliefOffense: "Not Found",
                  amount: "Not Found",
                  registeredPlace: false,
                  stateId: "Not Found",
                  districtCode: "Not Found"
                },
                legalProvisions: [
                  {
                    act: "Not Found",
                    sections: ["Not Found"]
                  }
                ],
                judgmentSummary: "Not Found"
              };
              
              // Merge with default structure to ensure all fields exist
              results.extractedData = {
                ...defaultStructure,
                ...extractedData,
                caseBasicDetails: { ...defaultStructure.caseBasicDetails, ...(extractedData.caseBasicDetails || {}) },
                appellantDetails: { ...defaultStructure.appellantDetails, ...(extractedData.appellantDetails || {}) },
                respondentDetails: { ...defaultStructure.respondentDetails, ...(extractedData.respondentDetails || {}) },
                factsDetails: { ...defaultStructure.factsDetails, ...(extractedData.factsDetails || {}) },
                caseDetails: { ...defaultStructure.caseDetails, ...(extractedData.caseDetails || {}) },
                legalProvisions: extractedData.legalProvisions || defaultStructure.legalProvisions
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
          console.log("Bookmarking API Response:", bookmarkContent);
          
          try {
            // Extract JSON from the response
            const jsonMatch = bookmarkContent.match(/```json\n([\s\S]*?)\n```/) || 
                            bookmarkContent.match(/```\n([\s\S]*?)\n```/) ||
                            bookmarkContent.match(/\[([\s\S]*?)\]/) ||
                            bookmarkContent.match(/\{([\s\S]*?)\}/);
            
            if (jsonMatch) {
              const jsonStr = jsonMatch[0].startsWith('[') ? jsonMatch[0] : '[' + jsonMatch[1] + ']';
              // Clean up the JSON string
              const cleanedJsonStr = this.cleanJsonString(jsonStr);
              results.bookmarkData = JSON.parse(cleanedJsonStr);
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
      caseBasicDetails: {
        district: "Not Found",
        establishment: "Not Found",
        caseType: "Not Found",
        reliefSought: "Not Found",
        caseTypeSpecific: "Not Found",
        subCourt: "Not Found",
        subDistCourt: "Not Found",
        subEstablishment: "Not Found",
        subCaseType: "Not Found",
        caseNumber: "Not Found",
        caseYear: "Not Found",
        decisionDate: "Not Found",
        appliedDate: "Not Found",
        receivedDate: "Not Found",
        partyName: "Not Found",
        partyMobile: "Not Found"
      },
      appellantDetails: {
        type: "Not Found",
        salutation: "Not Found",
        name: "Not Found",
        gender: "Not Found",
        fatherFlag: "Not Found",
        fatherName: "Not Found",
        dob: "Not Found",
        age: "Not Found",
        caste: "Not Found",
        extraCount: "Not Found",
        email: "Not Found",
        mobile: "Not Found",
        occupation: "Not Found",
        address: "Not Found",
        pincode: "Not Found",
        state: "Not Found",
        district: "Not Found"
      },
      respondentDetails: {
        type: "Not Found",
        salutation: "Not Found",
        name: "Not Found",
        gender: "Not Found",
        fatherFlag: "Not Found",
        fatherName: "Not Found",
        dob: "Not Found",
        age: "Not Found",
        caste: "Not Found",
        extraCount: "Not Found",
        email: "Not Found",
        mobile: "Not Found",
        occupation: "Not Found",
        address: "Not Found",
        pincode: "Not Found",
        state: "Not Found",
        district: "Not Found"
      },
      factsDetails: {
        factDate: "Not Found",
        factTime: "Not Found",
        facts: "Not Found"
      },
      caseDetails: {
        causeOfAction: "Not Found",
        offenseDate: "Not Found",
        subject: "Not Found",
        reliefOffense: "Not Found",
        amount: "Not Found",
        registeredPlace: false,
        stateId: "Not Found",
        districtCode: "Not Found"
      },
      legalProvisions: [
        {
          act: "Not Found",
          sections: ["Not Found"]
        }
      ],
      judgmentSummary: "Not Found"
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