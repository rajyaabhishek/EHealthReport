import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { PDFDocument, PDFName, PDFString, PDFNumber, PDFArray } from 'pdf-lib';
import './LegalDocProcessor.css';
import OpenAIService from '../services/openaiService';
import { GlobalWorkerOptions } from "pdfjs-dist";
import { showErrorAlert, showUploadErrorAlert, showProcessingErrorAlert } from '../utils/alertUtils';

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const LegalDocProcessor = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfFileName, setPdfFileName] = useState("");
  const [pdfFileSize, setPdfFileSize] = useState(0);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [bookmarkData, setBookmarkData] = useState(null);
  const [inspectionMode, setInspectionMode] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfScale, setPdfScale] = useState(1.0);
  const [editMode, setEditMode] = useState(false);
  const [editableData, setEditableData] = useState(null);
  const [processorMode, setProcessorMode] = useState(null);
  const [isBookmarkEditMode, setIsBookmarkEditMode] = useState(false);
  const [editableBookmarks, setEditableBookmarks] = useState(null);
  const [currentCredits, setCurrentCredits] = useState(0);
  const [requiredCredits, setRequiredCredits] = useState(0);

  // Create an instance of OpenAIService
  const openaiService = new OpenAIService();

  // Load data from session storage
  useEffect(() => {
    // Check for processor mode
    const mode = window.sessionStorage.getItem('processorMode');
    if (mode) {
      setProcessorMode(mode);
      
      // Set inspection mode if mode is 'inspect'
      if (mode === 'inspect') {
        setInspectionMode(true);
      }
      
      // If mode is 'download', trigger download immediately
      if (mode === 'download') {
        const storedBookmarkData = window.sessionStorage.getItem('bookmarkData');
        if (storedBookmarkData) {
          setBookmarkData(JSON.parse(storedBookmarkData));
        }
      }
      
      // Clear the mode after reading
      window.sessionStorage.removeItem('processorMode');
    }
    
    // Check for PDF blob URL
    const pdfBlobUrl = window.sessionStorage.getItem('pdfBlobUrl');
    if (pdfBlobUrl) {
      // Fetch the file from the blob URL
      fetch(pdfBlobUrl)
        .then(response => response.blob())
        .then(blob => {
          const fileName = window.sessionStorage.getItem('pdfFileName') || 'document.pdf';
          const fileSize = window.sessionStorage.getItem('pdfFileSize') || 0;
          
          // Create file object from blob
          const file = new File([blob], fileName, { type: 'application/pdf' });
          setPdfFile(file);
          setPdfFileName(fileName);
          setPdfFileSize(fileSize);
          
          // Clear the blob URL after reading
          window.sessionStorage.removeItem('pdfBlobUrl');
          window.sessionStorage.removeItem('pdfFileName');
          window.sessionStorage.removeItem('pdfFileSize');
        })
        .catch(err => {
          console.error('Error fetching PDF from blob URL:', err);
          showErrorAlert('Failed to load the PDF file. Please try uploading again.');
        });
    }
    
    // Initialize default data structure
    const defaultData = {
      caseBasicDetails: {
        district: '',
        establishment: '',
        caseType: '',
        reliefSought: '',
        caseTypeSpecific: '',
        subCourt: '',
        subDistCourt: '',
        subEstablishment: '',
        subCaseType: '',
        caseNumber: '',
        caseYear: '',
        decisionDate: '',
        appliedDate: '',
        receivedDate: '',
        partyName: '',
        partyMobile: '',
      },
      appellantDetails: {
        type: '',
        salutation: '',
        name: '',
        gender: '',
        fatherFlag: '',
        fatherName: '',
        dob: '',
        age: '',
        caste: '',
        extraCount: '',
        email: '',
        mobile: '',
        occupation: '',
        address: '',
        pincode: '',
        state: '',
        district: '',
      },
      respondentDetails: {
        type: '',
        salutation: '',
        name: '',
        gender: '',
        fatherFlag: '',
        fatherName: '',
        dob: '',
        age: '',
        caste: '',
        extraCount: '',
        email: '',
        mobile: '',
        occupation: '',
        address: '',
        pincode: '',
        state: '',
        district: '',
      },
      factsDetails: {
        factDate: '',
        factTime: '',
        facts: '',
      },
      caseDetails: {
        causeOfAction: '',
        offenseDate: '',
        subject: '',
        reliefOffense: '',
        amount: '',
        registeredPlace: false,
        stateId: '',
        districtCode: '',
      },
      legalProvisions: [
        { act: '', sections: [] }
      ],
      judgmentSummary: ''
    };
    
    // Check for extracted data
    const storedExtractedData = window.sessionStorage.getItem('extractedData');
    if (storedExtractedData) {
      try {
        const parsedData = JSON.parse(storedExtractedData);
        
        // Ensure all required fields exist by merging with default structure
        const completeData = {
          ...defaultData,
          ...parsedData,
          caseBasicDetails: {
            ...defaultData.caseBasicDetails,
            ...(parsedData.caseBasicDetails || {})
          },
          appellantDetails: {
            ...defaultData.appellantDetails,
            ...(parsedData.appellantDetails || {})
          },
          respondentDetails: {
            ...defaultData.respondentDetails,
            ...(parsedData.respondentDetails || {})
          },
          factsDetails: {
            ...defaultData.factsDetails,
            ...(parsedData.factsDetails || {})
          },
          legalProvisions: parsedData.legalProvisions || defaultData.legalProvisions
        };
        
        setExtractedData(completeData);
        setEditableData(JSON.parse(JSON.stringify(completeData))); // Deep copy for editing
        
        // Clear the data after reading
        window.sessionStorage.removeItem('extractedData');
      } catch (err) {
        console.error('Error parsing extracted data:', err);
        showErrorAlert('Failed to load document data. Please try processing again.');
        
        // Set default data structure to prevent errors
        setExtractedData(defaultData);
        setEditableData(JSON.parse(JSON.stringify(defaultData)));
      }
    }
    
    // Check for bookmark data
    const storedBookmarkData = window.sessionStorage.getItem('bookmarkData');
    if (storedBookmarkData) {
      try {
        const parsedBookmarks = JSON.parse(storedBookmarkData);
        setBookmarkData(parsedBookmarks);
        setEditableBookmarks(JSON.parse(JSON.stringify(parsedBookmarks))); // Deep copy for editing
        
        // Clear the data after reading
        window.sessionStorage.removeItem('bookmarkData');
      } catch (err) {
        console.error('Error parsing bookmark data:', err);
      }
    }
  }, []);

  // Effect to trigger download if mode is 'download'
  useEffect(() => {
    if (processorMode === 'download' && pdfFile && bookmarkData) {
      downloadBookmarkedPdf();
      setProcessorMode(null); // Reset mode after download
    }
  }, [processorMode, pdfFile, bookmarkData]);

  // Monitor current credits
  useEffect(() => {
    const updateCredits = () => {
      if (window.getCurrentCredits) {
        setCurrentCredits(window.getCurrentCredits());
      }
    };
    
    // Update credits immediately
    updateCredits();
    
    // Set up interval to check credits periodically
    const interval = setInterval(updateCredits, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setPdfFileName(file.name);
      setPdfFileSize(file.size);
      
      // Count pages and update required credits
      try {
        const pageCount = await countPdfPages(file);
        setRequiredCredits(pageCount);
      } catch (error) {
        console.error('Error counting pages:', error);
        setRequiredCredits(0);
      }
      
      // Reset any previous results when a new file is selected
      setExtractedData(null);
      setBookmarkData(null);
      setEditableData(null);
      setEditableBookmarks(null);
      setPageNumber(1);
    } else if (file) {
      showUploadErrorAlert(file.name, 'Invalid file type - only PDF files are accepted');
      setPdfFile(null);
      setRequiredCredits(0);
    }
  };

  // Helper function to count PDF pages
  const countPdfPages = async (pdfFile) => {
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      return pdf.numPages;
    } catch (error) {
      console.error('Error counting PDF pages:', error);
      return 0;
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        setPdfFile(file);
        setPdfFileName(file.name);
        setPdfFileSize(file.size);
        
        // Count pages and update required credits
        try {
          const pageCount = await countPdfPages(file);
          setRequiredCredits(pageCount);
        } catch (error) {
          console.error('Error counting pages:', error);
          setRequiredCredits(0);
        }
        
        // Reset any previous results when a new file is selected
        setExtractedData(null);
        setBookmarkData(null);
        setEditableData(null);
        setEditableBookmarks(null);
        setPageNumber(1);
      } else {
        showUploadErrorAlert(file.name, 'Invalid file type - only PDF files are accepted');
        setRequiredCredits(0);
      }
    }
  };

  const handleProcessDocument = async () => {
    if (!pdfFile) {
      showErrorAlert('Please upload a legal document first.');
      return;
    }

    // Check credits before processing - passed from parent component
    if (window.checkCreditsForPages) {
      const pageCount = await window.checkCreditsForPages(pdfFile);
      if (!pageCount) {
        return; // Error message already set by checkCreditsForPages
      }
      
      // Deduct credits before processing
      const creditsDeducted = await window.decrementCredits(pageCount);
      if (!creditsDeducted) {
        showErrorAlert('Insufficient credits to process this document.');
        return;
      }
    }

    setLoading(true);

    try {
      // Always process both legal information and bookmarks
      const results = await openaiService.processLegalDocument(pdfFile, 'both');
      
      // Update state with results
      if (results.extractedData) {
        setExtractedData(results.extractedData);
        setEditableData(JSON.parse(JSON.stringify(results.extractedData))); // Deep copy for editing
      }
      if (results.bookmarkData) {
        setBookmarkData(results.bookmarkData);
        setEditableBookmarks(JSON.parse(JSON.stringify(results.bookmarkData))); // Deep copy for editing
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error processing document:', error);
      showProcessingErrorAlert('document analysis and bookmark generation');
      setLoading(false);
    }
  };

  const handleInspectionMode = () => {
    setInspectionMode(!inspectionMode);
    if (!inspectionMode && !editableData && extractedData) {
      setEditableData(JSON.parse(JSON.stringify(extractedData))); // Deep copy for editing
    }
  };

  const handleEditMode = () => {
    setEditMode(!editMode);
    if (!editMode && !editableData && extractedData) {
      setEditableData(JSON.parse(JSON.stringify(extractedData))); // Deep copy for editing
    }
  };

  const handleBookmarkEditMode = () => {
    setIsBookmarkEditMode(!isBookmarkEditMode);
    if (!isBookmarkEditMode && !editableBookmarks && bookmarkData) {
      setEditableBookmarks(JSON.parse(JSON.stringify(bookmarkData))); // Deep copy for editing
    }
  };

  const handleEditableDataChange = (section, field, value) => {
    if (!editableData) return;
    
    const newData = { ...editableData };
    
    if (section === 'caseBasicDetails') {
      newData.caseBasicDetails = { ...newData.caseBasicDetails, [field]: value };
    } else if (section === 'appellantDetails') {
      newData.appellantDetails = { ...newData.appellantDetails, [field]: value };
    } else if (section === 'respondentDetails') {
      newData.respondentDetails = { ...newData.respondentDetails, [field]: value };
    } else if (section === 'factsDetails') {
      newData.factsDetails = { ...newData.factsDetails, [field]: value };
    } else if (section === 'legalProvisions' && Array.isArray(newData.legalProvisions)) {
      // For legal provisions, we need to handle the array structure
      const [index, subfield] = field.split('.');
      if (subfield === 'act') {
        newData.legalProvisions[index].act = value;
      } else if (subfield === 'sections') {
        // Split comma-separated sections
        newData.legalProvisions[index].sections = value.split(',').map(s => s.trim());
      }
    } else if (section === 'judgmentSummary') {
      newData.judgmentSummary = value;
    }
    
    setEditableData(newData);
  };

  const handleEditableBookmarkChange = (index, field, value) => {
    if (!editableBookmarks) return;
    
    const newBookmarks = [...editableBookmarks];
    newBookmarks[index] = { ...newBookmarks[index], [field]: value };
    setEditableBookmarks(newBookmarks);
  };

  const addNewBookmark = () => {
    if (!editableBookmarks) return;
    
    const newBookmark = {
      title: "New Bookmark",
      page: pageNumber,
      startPage: pageNumber,
      endPage: pageNumber,
      level: 1
    };
    
    setEditableBookmarks([...editableBookmarks, newBookmark]);
  };

  const deleteBookmark = (index) => {
    if (!editableBookmarks) return;
    
    const newBookmarks = [...editableBookmarks];
    newBookmarks.splice(index, 1);
    setEditableBookmarks(newBookmarks);
  };

  const moveBookmark = (index, direction) => {
    if (!editableBookmarks || 
        (direction === 'up' && index === 0) || 
        (direction === 'down' && index === editableBookmarks.length - 1)) {
      return;
    }
    
    const newBookmarks = [...editableBookmarks];
    const bookmark = newBookmarks[index];
    
    if (direction === 'up') {
      newBookmarks[index] = newBookmarks[index - 1];
      newBookmarks[index - 1] = bookmark;
    } else {
      newBookmarks[index] = newBookmarks[index + 1];
      newBookmarks[index + 1] = bookmark;
    }
    
    setEditableBookmarks(newBookmarks);
  };

  const applyEdits = () => {
    setExtractedData(editableData);
    setEditMode(false);
  };

  const resetEdits = () => {
    setEditableData(JSON.parse(JSON.stringify(extractedData)));
    setEditMode(false);
  };

  const applyBookmarkEdits = () => {
    setBookmarkData(editableBookmarks);
    setIsBookmarkEditMode(false);
  };

  const resetBookmarkEdits = () => {
    setEditableBookmarks(JSON.parse(JSON.stringify(bookmarkData)));
    setIsBookmarkEditMode(false);
  };

  const downloadJsonData = () => {
    if (!extractedData) return;

    const dataToDownload = editMode && editableData ? editableData : extractedData;
    const dataStr = JSON.stringify(dataToDownload, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${pdfFileName.replace('.pdf', '')}_extracted_data.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up the URL object
  };

  const downloadBookmarksTxt = async () => {
    if (!bookmarkData && !pdfFile) {
      showErrorAlert('No bookmark data available. Please process a document first.');
      return;
    }

    try {
      setLoading(true);
      
      // Create a simple text-based bookmarks file
      let bookmarkContent = `Bookmarks for ${pdfFileName}\n\n`;
      
      // Get the bookmarks to use
      const bookmarksToUse = isBookmarkEditMode && editableBookmarks 
        ? editableBookmarks 
        : (bookmarkData.bookmarks || bookmarkData);
        
      // Flatten the bookmark tree for easier text-based representation
      const flattenedBookmarks = [];
      const flattenTree = (items, level = 1) => {
        items.forEach(item => {
          // Ensure every bookmark has a valid page number
          const bookmarkItem = { 
            ...item, 
            level,
            page: item.page || item.startPage || 1 // Default to page 1 if undefined
          };
          flattenedBookmarks.push(bookmarkItem);
          if (item.children && item.children.length > 0) {
            flattenTree(item.children, level + 1);
          }
        });
      };
      
      // Create the flat list from the tree structure
      if (Array.isArray(bookmarksToUse)) {
        if (bookmarksToUse[0]?.children) {
          // This is already a tree structure
          flattenTree(bookmarksToUse);
        } else {
          // This is a flat structure with level properties
          // Ensure each bookmark has a valid page number
          flattenedBookmarks.push(...bookmarksToUse.map(bookmark => ({
            ...bookmark,
            page: bookmark.page || bookmark.startPage || 1 // Default to page 1 if undefined
          })));
        }
      }
      
      // Add each bookmark with proper indentation based on level
      flattenedBookmarks.forEach(bookmark => {
        const indent = '  '.repeat((bookmark.level || 1) - 1);
        const pageNum = bookmark.page || 1; // Fallback to page 1 if still undefined
        const pageRange = bookmark.startPage && bookmark.endPage && bookmark.startPage !== bookmark.endPage
          ? `Pages ${bookmark.startPage}-${bookmark.endPage}`
          : `Page ${pageNum}`;
        bookmarkContent += `${indent}${bookmark.title} (${pageRange})\n`;
      });
      
      // Create a text file with the bookmarks
      const bookmarkBlob = new Blob([bookmarkContent], { type: 'text/plain' });
      const bookmarkUrl = URL.createObjectURL(bookmarkBlob);
      
      // Create link to download the text file
      const bookmarkLink = document.createElement('a');
      bookmarkLink.href = bookmarkUrl;
      bookmarkLink.download = `${pdfFileName.replace('.pdf', '')}_bookmarks.txt`;
      document.body.appendChild(bookmarkLink);
      bookmarkLink.click();
      
      // Clean up
      document.body.removeChild(bookmarkLink);
      URL.revokeObjectURL(bookmarkUrl);
      
      setLoading(false);
    } catch (error) {
      console.error('Error creating bookmark file:', error);
      showErrorAlert(`Failed to create bookmarks: ${error.message || error}`);
      setLoading(false);
    }
  };

  const downloadBookmarkedPdf = async () => {
    if (!bookmarkData || !pdfFile) {
      showErrorAlert('No bookmark data available. Please process a document first.');
      return;
    }

    try {
      setLoading(true);
      
      // Load the PDF
      const fileArrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileArrayBuffer);
      
      // Create a simple text-based bookmarks file instead of trying to modify the PDF
      // This is a workaround since we're having issues with PDF bookmarks
      let bookmarkContent = `Bookmarks for ${pdfFileName}\n\n`;
      
      // Get the bookmarks to use
      const bookmarksToUse = isBookmarkEditMode && editableBookmarks 
        ? editableBookmarks 
        : (bookmarkData.bookmarks || bookmarkData);
        
      // Flatten the bookmark tree for easier text-based representation
      const flattenedBookmarks = [];
      const flattenTree = (items, level = 1) => {
        items.forEach(item => {
          // Ensure every bookmark has a valid page number
          const bookmarkItem = { 
            ...item, 
            level,
            page: item.page || item.startPage || 1 // Default to page 1 if undefined
          };
          flattenedBookmarks.push(bookmarkItem);
          if (item.children && item.children.length > 0) {
            flattenTree(item.children, level + 1);
          }
        });
      };
      
      // Create the flat list from the tree structure
      if (Array.isArray(bookmarksToUse)) {
        if (bookmarksToUse[0]?.children) {
          // This is already a tree structure
          flattenTree(bookmarksToUse);
        } else {
          // This is a flat structure with level properties
          // Ensure each bookmark has a valid page number
          flattenedBookmarks.push(...bookmarksToUse.map(bookmark => ({
            ...bookmark,
            page: bookmark.page || bookmark.startPage || 1 // Default to page 1 if undefined
          })));
        }
      }
      
      // Add each bookmark with proper indentation based on level
      flattenedBookmarks.forEach(bookmark => {
        const indent = '  '.repeat((bookmark.level || 1) - 1);
        const pageNum = bookmark.page || 1; // Fallback to page 1 if still undefined
        bookmarkContent += `${indent}Page ${pageNum}: ${bookmark.title}\n`;
      });
      
      // Create a text file with the bookmarks
      const bookmarkBlob = new Blob([bookmarkContent], { type: 'text/plain' });
      const bookmarkUrl = URL.createObjectURL(bookmarkBlob);
      
      // Save the PDF as is (without bookmarks)
      const pdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Create links to download both files
      const pdfLink = document.createElement('a');
      pdfLink.href = pdfUrl;
      pdfLink.download = `${pdfFileName.replace('.pdf', '')}_processed.pdf`;
      document.body.appendChild(pdfLink);
      pdfLink.click();
      
      setTimeout(() => {
        const bookmarkLink = document.createElement('a');
        bookmarkLink.href = bookmarkUrl;
        bookmarkLink.download = `${pdfFileName.replace('.pdf', '')}_bookmarks.txt`;
        document.body.appendChild(bookmarkLink);
        bookmarkLink.click();
        
        // Clean up
        document.body.removeChild(pdfLink);
        document.body.removeChild(bookmarkLink);
        URL.revokeObjectURL(pdfUrl);
        URL.revokeObjectURL(bookmarkUrl);
        
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error processing PDF:', error);
      showErrorAlert(`Failed to process PDF: ${error.message || error}`);
      setLoading(false);
    }
  };

  const downloadCaseDetailsCSV = () => {
    if (!extractedData) return;

    const dataToDownload = editMode && editableData ? editableData : extractedData;
    
    // Convert the nested data structure to a flat CSV format
    const csvRows = [];
    
    // Add headers
    csvRows.push(['Section', 'Field', 'Value']);
    
    // Add case basic details
    Object.entries(dataToDownload.caseBasicDetails || {}).forEach(([field, value]) => {
      csvRows.push(['Case Basic Details', field, value || 'Not Found']);
    });
    
    // Add appellant details
    Object.entries(dataToDownload.appellantDetails || {}).forEach(([field, value]) => {
      csvRows.push(['Appellant Details', field, value || 'Not Found']);
    });
    
    // Add respondent details
    Object.entries(dataToDownload.respondentDetails || {}).forEach(([field, value]) => {
      csvRows.push(['Respondent Details', field, value || 'Not Found']);
    });
    
    // Add facts details
    Object.entries(dataToDownload.factsDetails || {}).forEach(([field, value]) => {
      csvRows.push(['Facts Details', field, value || 'Not Found']);
    });
    
    // Add case details
    Object.entries(dataToDownload.caseDetails || {}).forEach(([field, value]) => {
      csvRows.push(['Case Details', field, value || 'Not Found']);
    });
    
    // Add legal provisions
    (dataToDownload.legalProvisions || []).forEach((provision, index) => {
      csvRows.push(['Legal Provisions', `Act ${index + 1}`, provision.act || 'Not Found']);
      csvRows.push(['Legal Provisions', `Sections ${index + 1}`, (provision.sections || []).join(', ') || 'Not Found']);
    });
    
    // Add judgment summary
    csvRows.push(['Judgment Summary', 'Summary', dataToDownload.judgmentSummary || 'Not Found']);
    
    // Convert to CSV string
    const csvContent = csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${pdfFileName.replace('.pdf', '')}_case_details.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderInspectionDescription = () => {
    return (
      <div className="inspection-description">
        <h3>Inspect Section - Document Details and Bookmark Editing</h3>
        <p>
          In the Inspect section, you can preview the uploaded PDF while viewing a side panel that displays 
          the details automatically fetched from the document using AI.
        </p>
        <p>
          If you feel that the AI has incorrectly fetched any detail, you can manually edit and update the 
          information directly within the side panel. The goal is to form the most accurate and reliable 
          details extracted from the PDF.
        </p>
        <p>
          Additionally, we provide a Bookmark Editing feature. When you select the "Edit Bookmark" option:
        </p>
        <ul>
          <li>You can edit the existing bookmarks of the PDF.</li>
          <li>You can add new bookmarks, delete existing ones, or rearrange them as needed.</li>
          <li>After completing the editing, you will have the option to download the updated PDF with the modified bookmarks applied.</li>
        </ul>
        <div className="capabilities">
          <h4>Main Capabilities:</h4>
          <ul>
            <li>Preview the PDF alongside AI-extracted document details.</li>
            <li>Edit or correct fetched details manually for higher accuracy.</li>
            <li>Edit, add, delete, and rearrange bookmarks.</li>
            <li>Download a new version of the PDF with updated bookmarks.</li>
            <li>Easy and intuitive user interface for seamless inspection and editing.</li>
          </ul>
        </div>
      </div>
    );
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const changeScale = (newScale) => {
    setPdfScale(newScale);
  };

  const changePage = (offset) => {
    const newPageNumber = pageNumber + offset;
    if (newPageNumber >= 1 && newPageNumber <= numPages) {
      setPageNumber(newPageNumber);
    }
  };

  const renderFileUploadSection = () => {
    const canProcess = pdfFile && currentCredits >= requiredCredits;
    const needsSubscription = requiredCredits > 0 && currentCredits < requiredCredits;
    
    return (
      <div className="upload-section">
        <div className="credit-info">
          <div className="credit-display">
            <i className="fas fa-coins"></i>
            <span>Credits Available: {currentCredits}</span>
          </div>
          {pdfFile && requiredCredits > 0 && (
            <div className={`credit-requirement ${needsSubscription ? 'insufficient' : 'sufficient'}`}>
              <i className={`fas ${needsSubscription ? 'fa-exclamation-triangle' : 'fa-check-circle'}`}></i>
              <span>Required: {requiredCredits} credits ({numPages} pages)</span>
            </div>
          )}
        </div>
        
        <div className="file-selection-container">
          <div 
            className={`file-upload-area ${pdfFile ? 'has-file' : ''} ${needsSubscription ? 'needs-subscription' : ''}`}
            onDragOver={needsSubscription ? (e) => e.preventDefault() : handleDragOver}
            onDrop={needsSubscription ? (e) => e.preventDefault() : handleDrop}
          >
            {needsSubscription ? (
              <div className="subscription-content">
                <div className="file-icon subscription-icon">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <div className="subscription-message">
                  <h3>You're low on credits</h3>
                  <p>Subscribe to continue uploading documents</p>
                </div>
                <button 
                  className="subscribe-button"
                  onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'pricing' } }))}
                >
                  <i className="fas fa-crown"></i> Subscribe Now
                </button>
              </div>
            ) : (
              <>
                <div className="file-icon">
                  <i className="fas fa-file-pdf"></i>
                </div>
                <div className="file-label">
                  {pdfFile ? (
                    <>
                      <div className="file-name">{pdfFileName}</div>
                      <div className="file-size">({(pdfFileSize / 1024 / 1024).toFixed(2)} MB)</div>
                    </>
                  ) : (
                    'Drop PDF here or click to browse'
                  )}
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="file-input"
                />
              </>
            )}
          </div>

          {!needsSubscription && (
            <div className="buttons-container">
              <button
                className="process-button"
                onClick={handleProcessDocument}
                disabled={loading || !pdfFile}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-cogs"></i> Process Document
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderLoadingState = () => {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <i className="fas fa-cog fa-spin"></i>
        </div>
        <p>Processing your legal document...</p>
      </div>
    );
  };

  const renderDocumentActions = () => {
    if (!extractedData) return null;
    
    return (
      <div className="document-actions">
        <button 
          className="action-button"
          onClick={downloadCaseDetailsCSV}
        >
          <i className="fas fa-file-csv"></i> Download CSV
        </button>
        <button 
          className="action-button"
          onClick={downloadBookmarksTxt}
          disabled={!bookmarkData}
        >
          <i className="fas fa-file-download"></i> Download Bookmarks
        </button>
        <button 
          className="action-button"
          onClick={handleInspectionMode}
          disabled={loading || !pdfFile}
        >
          <i className="fas fa-search"></i> Inspect
        </button>
      </div>
    );
  };

  const renderPdfViewer = () => {
    if (!pdfFile) return null;

    return (
      <div className="pdf-viewer-container">
        <div className="pdf-toolbar">
          <div className="pdf-navigation">
            <button 
              onClick={() => changePage(-1)} 
              disabled={pageNumber <= 1}
              className="pdf-nav-button"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <span className="page-info">
              Page {pageNumber} of {numPages}
            </span>
            <button 
              onClick={() => changePage(1)} 
              disabled={pageNumber >= numPages}
              className="pdf-nav-button"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
          <div className="pdf-zoom">
            <button 
              onClick={() => changeScale(pdfScale - 0.2)}
              disabled={pdfScale <= 0.6}
              className="pdf-zoom-button"
            >
              <i className="fas fa-search-minus"></i>
            </button>
            <span className="zoom-level">{Math.round(pdfScale * 100)}%</span>
            <button 
              onClick={() => changeScale(pdfScale + 0.2)}
              disabled={pdfScale >= 2.0}
              className="pdf-zoom-button"
            >
              <i className="fas fa-search-plus"></i>
            </button>
          </div>
        </div>
        
        <div className="pdf-document-container">
          <Document
            file={pdfFile}
            onLoadSuccess={onDocumentLoadSuccess}
            className="pdf-document"
          >
            <Page 
              pageNumber={pageNumber} 
              scale={pdfScale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="pdf-page"
            />
          </Document>
        </div>
      </div>
    );
  };

  const renderEditableField = (section, field, value, label, type = 'text') => {
    return (
      <div className="data-item editable">
        <div className="data-label">{label}</div>
        {editMode ? (
          type === 'textarea' ? (
            <textarea
              className="editable-field textarea"
              value={value}
              onChange={(e) => handleEditableDataChange(section, field, e.target.value)}
            />
          ) : (
            <input
              type="text"
              className="editable-field"
              value={value}
              onChange={(e) => handleEditableDataChange(section, field, e.target.value)}
            />
          )
        ) : (
          <div className="data-value">{value}</div>
        )}
      </div>
    );
  };
  
  const renderBookmarkEditor = () => {
    if (!bookmarkData && !editableBookmarks) return null;

    const bookmarks = isBookmarkEditMode ? editableBookmarks : bookmarkData;

    return (
      <div className="bookmark-editor-container">
       
        <div className="bookmarks-list">
          {bookmarks.map((bookmark, index) => (
            <div 
              key={index} 
              className="bookmark-item"
              style={{ paddingLeft: `${(bookmark.level - 1) * 20}px` }}
            >
              {isBookmarkEditMode ? (
                <div className="editable-bookmark">
                  <div className="bookmark-fields">
                    <input
                      type="text"
                      className="editable-field"
                      value={bookmark.title}
                      onChange={(e) => handleEditableBookmarkChange(index, 'title', e.target.value)}
                      placeholder="Bookmark title"
                    />
                    <div className="bookmark-controls">
                      <div className="bookmark-number-field">
                        <label>Start Page:</label>
                        <input
                          type="number"
                          className="editable-field small"
                          value={bookmark.startPage || bookmark.page || 1}
                          onChange={(e) => handleEditableBookmarkChange(
                            index, 
                            'startPage', 
                            Math.max(1, Math.min(numPages || 999, parseInt(e.target.value) || 1))
                          )}
                          min="1"
                          max={numPages || 999}
                        />
                      </div>
                      <div className="bookmark-number-field">
                        <label>End Page:</label>
                        <input
                          type="number"
                          className="editable-field small"
                          value={bookmark.endPage || bookmark.startPage || bookmark.page || 1}
                          onChange={(e) => handleEditableBookmarkChange(
                            index, 
                            'endPage', 
                            Math.max(bookmark.startPage || 1, Math.min(numPages || 999, parseInt(e.target.value) || 1))
                          )}
                          min={bookmark.startPage || 1}
                          max={numPages || 999}
                        />
                      </div>
                      <div className="bookmark-number-field">
                        <label>Level:</label>
                        <select
                          className="editable-field small"
                          value={bookmark.level}
                          onChange={(e) => handleEditableBookmarkChange(index, 'level', parseInt(e.target.value))}
                        >
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="bookmark-actions">
                    <button 
                      className="bookmark-action-btn move-up"
                      onClick={() => moveBookmark(index, 'up')}
                      disabled={index === 0}
                    >
                      <i className="fas fa-arrow-up"></i>
                    </button>
                    <button 
                      className="bookmark-action-btn move-down"
                      onClick={() => moveBookmark(index, 'down')}
                      disabled={index === bookmarks.length - 1}
                    >
                      <i className="fas fa-arrow-down"></i>
                    </button>
                    <button 
                      className="bookmark-action-btn delete"
                      onClick={() => deleteBookmark(index)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bookmark-display">
                  <div className="bookmark-title">
                    <i className={bookmark.level === 1 ? "fas fa-bookmark" : "fas fa-angle-right"}></i>
                    <span>{bookmark.title}</span>
                  </div>
                  <div className="bookmark-page">
                    Pages {bookmark.startPage || bookmark.page || 1} - {bookmark.endPage || bookmark.startPage || bookmark.page || 1}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {isBookmarkEditMode && (
            <div className="add-bookmark">
              <button className="add-bookmark-btn" onClick={addNewBookmark}>
                <i className="fas fa-plus"></i> Add Bookmark
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderExtractedInfo = () => {
    if (!extractedData && !editableData) return null;

    const data = editMode && editableData ? editableData : extractedData;
    
    // Check if data or required properties are undefined
    if (!data || !data.caseBasicDetails) {
      showErrorAlert('The document data is incomplete or in an unexpected format. Please try processing the document again.');
      return null;
    }
    
    const { caseBasicDetails, appellantDetails, respondentDetails, factsDetails, caseDetails, legalProvisions, judgmentSummary } = data;

    return (
      <div className="extracted-info-container">
        <div className="edit-controls">
          
        </div>

        <div className="extracted-section">
          <h3>Case Basic Details</h3>
          <div className="data-grid">
            {renderEditableField('caseBasicDetails', 'district', caseBasicDetails?.district || 'Not Found', 'District')}
            {renderEditableField('caseBasicDetails', 'establishment', caseBasicDetails?.establishment || 'Not Found', 'Establishment')}
            {renderEditableField('caseBasicDetails', 'caseType', caseBasicDetails?.caseType || 'Not Found', 'Case Type')}
            {renderEditableField('caseBasicDetails', 'reliefSought', caseBasicDetails?.reliefSought || 'Not Found', 'Relief Sought')}
            {renderEditableField('caseBasicDetails', 'caseTypeSpecific', caseBasicDetails?.caseTypeSpecific || 'Not Found', 'Case Type Specific')}
            {renderEditableField('caseBasicDetails', 'subCourt', caseBasicDetails?.subCourt || 'Not Found', 'Sub Court')}
            {renderEditableField('caseBasicDetails', 'subDistCourt', caseBasicDetails?.subDistCourt || 'Not Found', 'Sub District Court')}
            {renderEditableField('caseBasicDetails', 'subEstablishment', caseBasicDetails?.subEstablishment || 'Not Found', 'Sub Establishment')}
            {renderEditableField('caseBasicDetails', 'subCaseType', caseBasicDetails?.subCaseType || 'Not Found', 'Sub Case Type')}
            {renderEditableField('caseBasicDetails', 'caseNumber', caseBasicDetails?.caseNumber || 'Not Found', 'Case Number')}
            {renderEditableField('caseBasicDetails', 'caseYear', caseBasicDetails?.caseYear || 'Not Found', 'Case Year')}
            {renderEditableField('caseBasicDetails', 'decisionDate', caseBasicDetails?.decisionDate || 'Not Found', 'Decision Date')}
            {renderEditableField('caseBasicDetails', 'appliedDate', caseBasicDetails?.appliedDate || 'Not Found', 'Applied Date')}
            {renderEditableField('caseBasicDetails', 'receivedDate', caseBasicDetails?.receivedDate || 'Not Found', 'Received Date')}
            {renderEditableField('caseBasicDetails', 'partyName', caseBasicDetails?.partyName || 'Not Found', 'Party Name')}
            {renderEditableField('caseBasicDetails', 'partyMobile', caseBasicDetails?.partyMobile || 'Not Found', 'Party Mobile')}
          </div>
        </div>

        <div className="extracted-section">
          <h3>Appellant Details</h3>
          <div className="data-grid">
            {renderEditableField('appellantDetails', 'type', appellantDetails?.type || 'Not Found', 'Type')}
            {renderEditableField('appellantDetails', 'salutation', appellantDetails?.salutation || 'Not Found', 'Salutation')}
            {renderEditableField('appellantDetails', 'name', appellantDetails?.name || 'Not Found', 'Name')}
            {renderEditableField('appellantDetails', 'gender', appellantDetails?.gender || 'Not Found', 'Gender')}
            {renderEditableField('appellantDetails', 'fatherFlag', appellantDetails?.fatherFlag || 'Not Found', 'Father Flag')}
            {renderEditableField('appellantDetails', 'fatherName', appellantDetails?.fatherName || 'Not Found', 'Father Name')}
            {renderEditableField('appellantDetails', 'dob', appellantDetails?.dob || 'Not Found', 'Date of Birth')}
            {renderEditableField('appellantDetails', 'age', appellantDetails?.age || 'Not Found', 'Age')}
            {renderEditableField('appellantDetails', 'caste', appellantDetails?.caste || 'Not Found', 'Caste')}
            {renderEditableField('appellantDetails', 'extraCount', appellantDetails?.extraCount || 'Not Found', 'Extra Count')}
            {renderEditableField('appellantDetails', 'email', appellantDetails?.email || 'Not Found', 'Email')}
            {renderEditableField('appellantDetails', 'mobile', appellantDetails?.mobile || 'Not Found', 'Mobile')}
            {renderEditableField('appellantDetails', 'occupation', appellantDetails?.occupation || 'Not Found', 'Occupation')}
            {renderEditableField('appellantDetails', 'address', appellantDetails?.address || 'Not Found', 'Address', 'textarea')}
            {renderEditableField('appellantDetails', 'pincode', appellantDetails?.pincode || 'Not Found', 'Pincode')}
            {renderEditableField('appellantDetails', 'state', appellantDetails?.state || 'Not Found', 'State')}
            {renderEditableField('appellantDetails', 'district', appellantDetails?.district || 'Not Found', 'District')}
          </div>
        </div>

        <div className="extracted-section">
          <h3>Respondent Details</h3>
          <div className="data-grid">
            {renderEditableField('respondentDetails', 'type', respondentDetails?.type || 'Not Found', 'Type')}
            {renderEditableField('respondentDetails', 'salutation', respondentDetails?.salutation || 'Not Found', 'Salutation')}
            {renderEditableField('respondentDetails', 'name', respondentDetails?.name || 'Not Found', 'Name')}
            {renderEditableField('respondentDetails', 'gender', respondentDetails?.gender || 'Not Found', 'Gender')}
            {renderEditableField('respondentDetails', 'fatherFlag', respondentDetails?.fatherFlag || 'Not Found', 'Father Flag')}
            {renderEditableField('respondentDetails', 'fatherName', respondentDetails?.fatherName || 'Not Found', 'Father Name')}
            {renderEditableField('respondentDetails', 'dob', respondentDetails?.dob || 'Not Found', 'Date of Birth')}
            {renderEditableField('respondentDetails', 'age', respondentDetails?.age || 'Not Found', 'Age')}
            {renderEditableField('respondentDetails', 'caste', respondentDetails?.caste || 'Not Found', 'Caste')}
            {renderEditableField('respondentDetails', 'extraCount', respondentDetails?.extraCount || 'Not Found', 'Extra Count')}
            {renderEditableField('respondentDetails', 'email', respondentDetails?.email || 'Not Found', 'Email')}
            {renderEditableField('respondentDetails', 'mobile', respondentDetails?.mobile || 'Not Found', 'Mobile')}
            {renderEditableField('respondentDetails', 'occupation', respondentDetails?.occupation || 'Not Found', 'Occupation')}
            {renderEditableField('respondentDetails', 'address', respondentDetails?.address || 'Not Found', 'Address', 'textarea')}
            {renderEditableField('respondentDetails', 'pincode', respondentDetails?.pincode || 'Not Found', 'Pincode')}
            {renderEditableField('respondentDetails', 'state', respondentDetails?.state || 'Not Found', 'State')}
            {renderEditableField('respondentDetails', 'district', respondentDetails?.district || 'Not Found', 'District')}
          </div>
        </div>

        <div className="extracted-section">
          <h3>Facts Details</h3>
          <div className="data-grid">
            {renderEditableField('factsDetails', 'factDate', factsDetails?.factDate || 'Not Found', 'Fact Date')}
            {renderEditableField('factsDetails', 'factTime', factsDetails?.factTime || 'Not Found', 'Fact Time')}
            {renderEditableField('factsDetails', 'facts', factsDetails?.facts || 'Not Found', 'Facts', 'textarea')}
          </div>
        </div>

        <div className="extracted-section">
          <h3>Case Details</h3>
          <div className="data-grid">
            {renderEditableField('caseDetails', 'causeOfAction', caseDetails?.causeOfAction || 'Not Found', 'Cause of Action')}
            {renderEditableField('caseDetails', 'offenseDate', caseDetails?.offenseDate || 'Not Found', 'Offense Date')}
            {renderEditableField('caseDetails', 'subject', caseDetails?.subject || 'Not Found', 'Subject')}
            {renderEditableField('caseDetails', 'reliefOffense', caseDetails?.reliefOffense || 'Not Found', 'Relief/Offense')}
            {renderEditableField('caseDetails', 'amount', caseDetails?.amount || 'Not Found', 'Amount')}
            {renderEditableField('caseDetails', 'registeredPlace', caseDetails?.registeredPlace ? 'Yes' : 'No', 'Registered Place')}
            {renderEditableField('caseDetails', 'stateId', caseDetails?.stateId || 'Not Found', 'State ID')}
            {renderEditableField('caseDetails', 'districtCode', caseDetails?.districtCode || 'Not Found', 'District Code')}
          </div>
        </div>

        <div className="extracted-section">
          <h3>Legal Provisions</h3>
          <div className="acts-section">
            {editMode ? (
              <table className="acts-table editable">
                <thead>
                  <tr>
                    <th>Act</th>
                    <th>Sections</th>
                  </tr>
                </thead>
                <tbody>
                  {legalProvisions.map((provision, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="text"
                          className="editable-field"
                          value={provision.act || ''}
                          onChange={(e) => handleEditableDataChange('legalProvisions', `${index}.act`, e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="editable-field"
                          value={(provision.sections || []).join(', ')}
                          onChange={(e) => handleEditableDataChange('legalProvisions', `${index}.sections`, e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="acts-table">
                <thead>
                  <tr>
                    <th>Act</th>
                    <th>Sections</th>
                  </tr>
                </thead>
                <tbody>
                  {legalProvisions.map((provision, index) => (
                    <tr key={index}>
                      <td>{provision.act || 'Not Found'}</td>
                      <td>{(provision.sections || []).join(', ') || 'Not Found'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="extracted-section">
          <h3>Judgment Summary</h3>
          {editMode ? (
            <textarea
              className="editable-field textarea full-width"
              value={judgmentSummary || ''}
              onChange={(e) => handleEditableDataChange('judgmentSummary', '', e.target.value)}
            />
          ) : (
            <div className="data-value">{judgmentSummary || 'Not Found'}</div>
          )}
        </div>

        
      </div>
    );
  };

  const handleToggleCaseDetails = () => {
    setEditMode(true);
    setIsBookmarkEditMode(false);
     // Automatically enable edit mode
  };




  const handleToggleBookmarks = () => {
    setIsBookmarkEditMode(true);
    setEditMode(false);
    // Auto-save and download when switching to bookmarks
    if (editableBookmarks) {
      setBookmarkData(editableBookmarks);
      
    }
  };

  return (
       
       
    
    <div className="legal-doc-processor-container">
    

      {!pdfFile && renderFileUploadSection()}

      {loading && renderLoadingState()}
   
      
      {!loading && pdfFile && extractedData && (
        
        <div className={`results-container ${inspectionMode ? 'with-pdf-view' : ''}`}>
          {/* Render actions first when not in inspection mode */}
          {!inspectionMode && renderDocumentActions()}
          
          {inspectionMode ? (
            <div className="split-view">
              <div className="pdf-view">
                {renderPdfViewer()}
              </div>
              <div className="data-view">
                <div className="results-header">
                
                  <div className="header-buttons">
                    <button className="download-button small" onClick={downloadCaseDetailsCSV}>
                      <i className="fas fa-file-csv"></i>
                      Download CSV
                    </button>
                    <button className="download-pdf-button small" onClick={downloadBookmarksTxt} disabled={!bookmarkData}>
                      <i className="fas fa-file-download"></i> Download Bookmarks
                    </button>
                  </div>
                </div>
                
                <div className="edit-mode-toggle">
                  <button 
                    className={`toggle-button small ${!isBookmarkEditMode ? 'active' : ''}`}
                    onClick={handleToggleCaseDetails}
                  >
                    <i className="fas fa-edit"></i> Edit Case Details
                  </button>
                  <button 
                    className={`toggle-button small ${isBookmarkEditMode ? 'active' : ''}`}
                    onClick={handleToggleBookmarks}
                  >
                    <i className="fas fa-bookmark"></i> Edit Bookmarks
                  </button>
                </div>
                
                <div className="edit-panel">
                 
                  <div className="panel-content">
                    {isBookmarkEditMode ? renderBookmarkEditor() : renderExtractedInfo()}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Render extracted info after actions when not in inspection mode
            renderExtractedInfo()
          )}
        </div>
      )}
    </div>
  );
};

export default LegalDocProcessor;