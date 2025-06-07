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
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // Create an instance of OpenAIService
  const openaiService = new OpenAIService();

  // Load data from session storage
  useEffect(() => {
    const loadSessionData = async () => {
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
      
      // Check for PDF blob URL and load it first
      const pdfBlobUrl = window.sessionStorage.getItem('pdfBlobUrl');
      if (pdfBlobUrl) {
        try {
          // Fetch the file from the blob URL
          const response = await fetch(pdfBlobUrl);
          const blob = await response.blob();
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
        } catch (err) {
          console.error('Error fetching PDF from blob URL:', err);
          showErrorAlert('Failed to load the PDF file. Please try uploading again.');
        }
      }
    };

    loadSessionData();
    
    // Initialize default data structure
    const defaultData = {
      reportSummary: {
        testName: '',
        reportDate: '',
        labName: '',
        patientAge: '',
        patientGender: '',
      },
      keyHealthIndicators: [],
      aiGeneratedInsights: {
        explanations: '',
        potentialCauses: '',
        interParameterRelationships: '',
      },
      medicalRecommendations: {
        preventionTips: '',
        lifestyleModifications: '',
        homeRemedies: '',
        mentalWellness: '',
      },
      treatmentSuggestions: {
        doctorActions: '',
        suggestedMedications: '',
        followUpTests: '',
      },
      
      criticalAlertSystem: {
        redFlagIndicators: '',
        emergencyContacts: '',
        urgencyTimeline: '',
      },
      demographicInterpretations: {
        ageAdjustedRanges: '',
        genderSpecificAnalysis: '',
        ethnicityConsiderations: '',
        specialPopulations: '',
      },
      healthSummary: ''
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
          reportSummary: {
            ...defaultData.reportSummary,
            ...(parsedData.reportSummary || {})
          },
          keyHealthIndicators: parsedData.keyHealthIndicators || defaultData.keyHealthIndicators,
          aiGeneratedInsights: {
            ...defaultData.aiGeneratedInsights,
            ...(parsedData.aiGeneratedInsights || {})
          },
          medicalRecommendations: {
            ...defaultData.medicalRecommendations,
            ...(parsedData.medicalRecommendations || {})
          },
          treatmentSuggestions: {
            ...defaultData.treatmentSuggestions,
            ...(parsedData.treatmentSuggestions || {})
          },
          riskPrediction: {
            ...defaultData.riskPrediction,
            ...(parsedData.riskPrediction || {})
          },
          criticalAlertSystem: {
            ...defaultData.criticalAlertSystem,
            ...(parsedData.criticalAlertSystem || {})
          },
          demographicInterpretations: {
            ...defaultData.demographicInterpretations,
            ...(parsedData.demographicInterpretations || {})
          }
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
    
    // Mark session loading as complete
    setIsLoadingSession(false);
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
    
    if (section === 'reportSummary') {
      newData.reportSummary = { ...newData.reportSummary, [field]: value };
    } else if (section === 'aiGeneratedInsights') {
      newData.aiGeneratedInsights = { ...newData.aiGeneratedInsights, [field]: value };
    } else if (section === 'medicalRecommendations') {
      newData.medicalRecommendations = { ...newData.medicalRecommendations, [field]: value };
    } else if (section === 'treatmentSuggestions') {
      newData.treatmentSuggestions = { ...newData.treatmentSuggestions, [field]: value };
    } else if (section === 'riskPrediction') {
      newData.riskPrediction = { ...newData.riskPrediction, [field]: value };
    } else if (section === 'criticalAlertSystem') {
      newData.criticalAlertSystem = { ...newData.criticalAlertSystem, [field]: value };
    } else if (section === 'demographicInterpretations') {
      newData.demographicInterpretations = { ...newData.demographicInterpretations, [field]: value };
    } else if (section === 'healthSummary') {
      newData.healthSummary = value;
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

  const downloadCaseDetailsPDF = async () => {
    if (!extractedData) return;

    const dataToDownload = editMode && editableData ? editableData : extractedData;
    
    try {
      // Dynamically import jsPDF
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      let yPosition = 20;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      const lineHeight = 7;
      const sectionSpacing = 15;
      
      // Helper function to add text with word wrapping
      const addText = (text, x, y, maxWidth = 170, fontSize = 10) => {
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return y + (lines.length * lineHeight);
      };
      
      // Helper function to check page break
      const checkPageBreak = (requiredSpace) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          doc.addPage();
          yPosition = 20;
        }
      };
      
      // Header
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('Medical Report Analysis', margin, yPosition);
      yPosition += 15;
      
      // Report Summary Section
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Report Summary', margin, yPosition);
      yPosition += 10;
      
      doc.setFont(undefined, 'normal');
      const reportSummary = dataToDownload.reportSummary || {};
      Object.entries(reportSummary).forEach(([field, value]) => {
        checkPageBreak(15);
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        const fieldName = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        doc.text(`${fieldName}:`, margin, yPosition);
        doc.setFont(undefined, 'normal');
        yPosition = addText(value || 'Not Found', margin + 50, yPosition);
        yPosition += 3;
      });
      yPosition += sectionSpacing;
      
      // Key Health Indicators Section
      checkPageBreak(20);
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Key Health Indicators', margin, yPosition);
      yPosition += 10;
      
      if (dataToDownload.keyHealthIndicators && Array.isArray(dataToDownload.keyHealthIndicators)) {
        dataToDownload.keyHealthIndicators.forEach((indicator, index) => {
          checkPageBreak(25);
          doc.setFont(undefined, 'bold');
          yPosition = addText(`${indicator.parameterName || indicator.parameter || `Parameter ${index + 1}`}`, margin, yPosition, 170, 11);
          doc.setFont(undefined, 'normal');
          yPosition = addText(`Value: ${indicator.value || 'N/A'}`, margin + 10, yPosition);
          yPosition = addText(`Normal Range: ${indicator.referenceRange || indicator.optimalRange || 'N/A'}`, margin + 10, yPosition);
          yPosition = addText(`Status: ${indicator.interpretation || 'N/A'}`, margin + 10, yPosition);
          yPosition += 5;
        });
      }
      yPosition += sectionSpacing;
      
      // AI Generated Insights Section
      checkPageBreak(20);
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('AI Generated Insights', margin, yPosition);
      yPosition += 10;
      
      const insights = dataToDownload.aiGeneratedInsights || {};
      Object.entries(insights).forEach(([field, value]) => {
        if (value && value !== 'Not Found') {
          checkPageBreak(20);
          doc.setFont(undefined, 'bold');
          const fieldName = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          doc.text(`${fieldName}:`, margin, yPosition);
          yPosition += 5;
          doc.setFont(undefined, 'normal');
          yPosition = addText(value, margin, yPosition);
          yPosition += 5;
        }
      });
      yPosition += sectionSpacing;
      
      // Medical Recommendations Section
      checkPageBreak(20);
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Medical Recommendations', margin, yPosition);
      yPosition += 10;
      
      const medicalRecs = dataToDownload.medicalRecommendations || {};
      Object.entries(medicalRecs).forEach(([field, value]) => {
        if (value && value !== 'Not Found') {
          checkPageBreak(20);
          doc.setFont(undefined, 'bold');
          const fieldName = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          doc.text(`${fieldName}:`, margin, yPosition);
          yPosition += 5;
          doc.setFont(undefined, 'normal');
          yPosition = addText(value, margin, yPosition);
          yPosition += 5;
        }
      });
      yPosition += sectionSpacing;
      
      // Treatment Suggestions Section
      checkPageBreak(20);
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Treatment Suggestions', margin, yPosition);
      yPosition += 10;
      
      const treatmentSuggs = dataToDownload.treatmentSuggestions || {};
      Object.entries(treatmentSuggs).forEach(([field, value]) => {
        if (value && value !== 'Not Found') {
          checkPageBreak(20);
          doc.setFont(undefined, 'bold');
          const fieldName = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          doc.text(`${fieldName}:`, margin, yPosition);
          yPosition += 5;
          doc.setFont(undefined, 'normal');
          yPosition = addText(value, margin, yPosition);
          yPosition += 5;
        }
      });
      yPosition += sectionSpacing;
      
      // Critical Alert System Section
      checkPageBreak(20);
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Critical Alert System', margin, yPosition);
      yPosition += 10;
      
      const criticalAlerts = dataToDownload.criticalAlertSystem || {};
      Object.entries(criticalAlerts).forEach(([field, value]) => {
        if (value && value !== 'Not Found') {
          checkPageBreak(20);
          doc.setFont(undefined, 'bold');
          const fieldName = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          doc.text(`${fieldName}:`, margin, yPosition);
          yPosition += 5;
          doc.setFont(undefined, 'normal');
          yPosition = addText(value, margin, yPosition);
          yPosition += 5;
        }
      });
      yPosition += sectionSpacing;
      
      // Demographic Interpretations Section
      checkPageBreak(20);
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Demographic Interpretations', margin, yPosition);
      yPosition += 10;
      
      const demographics = dataToDownload.demographicInterpretations || {};
      Object.entries(demographics).forEach(([field, value]) => {
        if (value && value !== 'Not Found') {
          checkPageBreak(20);
          doc.setFont(undefined, 'bold');
          const fieldName = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          doc.text(`${fieldName}:`, margin, yPosition);
          yPosition += 5;
          doc.setFont(undefined, 'normal');
          yPosition = addText(value, margin, yPosition);
          yPosition += 5;
        }
      });
      yPosition += sectionSpacing;
      
      // Health Summary Section
      if (dataToDownload.healthSummary && dataToDownload.healthSummary !== 'Not Found') {
        checkPageBreak(30);
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Health Summary', margin, yPosition);
        yPosition += 10;
        doc.setFont(undefined, 'normal');
        yPosition = addText(dataToDownload.healthSummary, margin, yPosition);
      }
      
      // Save the PDF
      doc.save(`${pdfFileName.replace('.pdf', '')}_medical_report.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      showErrorAlert('Failed to generate PDF. Please try again.');
    }
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
    const needsSubscription = currentCredits === 0 && !loading && !extractedData;
    
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
          onClick={downloadCaseDetailsPDF}
        >
          <i className="fas fa-file-pdf"></i> Download PDF
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
        <div className="pdf-document-container">
          <Document
            file={pdfFile}
            onLoadSuccess={onDocumentLoadSuccess}
            className="pdf-document"
          >
            {Array.from({ length: numPages }, (_, index) => (
              <div key={index + 1} className="pdf-page-wrapper">
                <div className="page-number-indicator">
                  Page {index + 1} of {numPages}
                </div>
                <Page 
                  pageNumber={index + 1} 
                  scale={pdfScale}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="pdf-page"
                />
              </div>
            ))}
          </Document>
        </div>
        
        <div className="pdf-controls">
          <div className="zoom-controls">
            <button 
              onClick={() => changeScale(pdfScale - 0.2)}
              disabled={pdfScale <= 0.6}
              className="zoom-button"
            >
              <i className="fas fa-search-minus"></i>
            </button>
            <span className="zoom-level">{Math.round(pdfScale * 100)}%</span>
            <button 
              onClick={() => changeScale(pdfScale + 0.2)}
              disabled={pdfScale >= 2.0}
              className="zoom-button"
            >
              <i className="fas fa-search-plus"></i>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Helper function to format bullet points
  const formatBulletPoints = (text) => {
    if (!text || text === 'Not Found') return text;
    
    // If the text already contains bullet points from API, render them properly
    if (text.includes('•') || text.includes('-') || text.includes('*')) {
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      return (
        <div className="bullet-points-container">
          {lines.map((line, index) => {
            const cleanLine = line.trim().replace(/^[•\-\*]\s*/, '');
            return (
              <div key={index} className="bullet-point-item">
                <span className="bullet-icon">•</span>
                <span className="bullet-text">{cleanLine}</span>
              </div>
            );
          })}
        </div>
      );
    }
    
    // Split by common delimiters and create bullet points
    const sentences = text.split(/[.;]\s+/)
      .filter(sentence => sentence.trim().length > 0)
      .map(sentence => sentence.trim().replace(/^[•\-\*]\s*/, ''));
    
    if (sentences.length <= 1) return text;
    
    return (
      <div className="bullet-points-container">
        {sentences.map((sentence, index) => (
          <div key={index} className="bullet-point-item">
            <span className="bullet-icon">•</span>
            <span className="bullet-text">{sentence.endsWith('.') ? sentence : sentence + '.'}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderEditableField = (section, field, value, label, type = 'text') => {
    // Convert objects or arrays to readable strings
    const formatValue = (val) => {
      if (val === null || val === undefined) return 'Not Found';
      if (typeof val === 'object') {
        if (Array.isArray(val)) {
          return val.map(item => 
            typeof item === 'object' ? JSON.stringify(item) : String(item)
          ).join(', ');
        }
        return JSON.stringify(val, null, 2);
      }
      return String(val);
    };
    
    // Convert "Not Found" and other empty-like values to empty string for easier editing
    const formattedValue = formatValue(value);
    const isEmptyValue = !value || 
                        formattedValue === 'Not Found' || 
                        formattedValue === 'Not found' || 
                        formattedValue === 'not found' || 
                        formattedValue === '' || 
                        value === null || 
                        value === undefined;
    const editValue = editMode && isEmptyValue ? '' : formattedValue;
    
    // Check if this is a medical recommendation or treatment suggestion field for bullet point formatting
    const isBulletPointField = section === 'medicalRecommendations' || section === 'treatmentSuggestions';
    
    return (
      <div className="data-item editable">
        <div className="data-label">{label}</div>
        {editMode ? (
          type === 'textarea' ? (
            <textarea
              className="editable-field textarea"
              value={editValue}
              onChange={(e) => handleEditableDataChange(section, field, e.target.value)}
              placeholder={`Enter ${label.toLowerCase()}`}
            />
          ) : (
            <input
              type="text"
              className="editable-field"
              value={editValue}
              onChange={(e) => handleEditableDataChange(section, field, e.target.value)}
              placeholder={`Enter ${label.toLowerCase()}`}
            />
          )
        ) : (
          <div className="data-value">
            {isBulletPointField && formattedValue !== 'Not Found' ? 
              formatBulletPoints(formattedValue) : 
              formattedValue
            }
          </div>
        )}
      </div>
    );
  };
  
  const renderBookmarkEditor = () => {
    if (!bookmarkData && !editableBookmarks) return null;

    const bookmarks = isBookmarkEditMode ? editableBookmarks : bookmarkData;

    return (
      <div className="extracted-info-container">
        <div className="extracted-section">
          <h3>Document Bookmarks</h3>
          
          <div className="bookmarks-grid">
            {bookmarks.map((bookmark, index) => (
              <div key={index} className="bookmark-data-item">
                <div className="bookmark-row">
                  <div className="bookmark-field-group">
                    <div className="data-item">
                      <div className="data-label">Title</div>
                      {isBookmarkEditMode ? (
                        <input
                          type="text"
                          className="editable-field"
                          value={bookmark.title}
                          onChange={(e) => handleEditableBookmarkChange(index, 'title', e.target.value)}
                          placeholder="Enter bookmark title"
                        />
                      ) : (
                        <div className="data-value">{bookmark.title}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bookmark-page-group">
                    <div className="data-item">
                      <div className="data-label">Start Page</div>
                      {isBookmarkEditMode ? (
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
                      ) : (
                        <div className="data-value">{bookmark.startPage || bookmark.page || 1}</div>
                      )}
                    </div>
                    
                    <div className="data-item">
                      <div className="data-label">End Page</div>
                      {isBookmarkEditMode ? (
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
                      ) : (
                        <div className="data-value">{bookmark.endPage || bookmark.startPage || bookmark.page || 1}</div>
                      )}
                    </div>
                    
                    <div className="data-item">
                      <div className="data-label">Level</div>
                      {isBookmarkEditMode ? (
                        <select
                          className="editable-field small"
                          value={bookmark.level}
                          onChange={(e) => handleEditableBookmarkChange(index, 'level', parseInt(e.target.value))}
                        >
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                        </select>
                      ) : (
                        <div className="data-value">{bookmark.level}</div>
                      )}
                    </div>
                  </div>
                  
                  {isBookmarkEditMode && (
                    <div className="bookmark-actions-group">
                      <button 
                        className="bookmark-action-btn move-up"
                        onClick={() => moveBookmark(index, 'up')}
                        disabled={index === 0}
                        title="Move up"
                      >
                        <i className="fas fa-arrow-up"></i>
                      </button>
                      <button 
                        className="bookmark-action-btn move-down"
                        onClick={() => moveBookmark(index, 'down')}
                        disabled={index === bookmarks.length - 1}
                        title="Move down"
                      >
                        <i className="fas fa-arrow-down"></i>
                      </button>
                      <button 
                        className="bookmark-action-btn delete"
                        onClick={() => deleteBookmark(index)}
                        title="Delete bookmark"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isBookmarkEditMode && (
              <div className="add-bookmark-container">
                <button className="add-bookmark-btn" onClick={addNewBookmark}>
                  <i className="fas fa-plus"></i> Add New Bookmark
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Helper function to determine severity color
  const getSeverityColor = (interpretation, severity) => {
    const lowerInterp = (interpretation || '').toLowerCase();
    const lowerSev = (severity || '').toLowerCase();
    
    if (lowerSev.includes('critical') || lowerSev.includes('immediate') || lowerInterp.includes('high') || lowerInterp.includes('critical')) {
      return '#ff4444'; // Red
    } else if (lowerSev.includes('borderline') || lowerInterp.includes('borderline') || lowerInterp.includes('slightly')) {
      return '#ffa500'; // Orange
    } else if (lowerSev.includes('normal') || lowerInterp.includes('normal') || lowerInterp.includes('good')) {
      return '#22c55e'; // Green
    }
    return '#6b7280'; // Gray for unknown
  };

  // Function to render health indicators with color coding
  const renderHealthIndicators = (indicators) => {
    if (!indicators || !Array.isArray(indicators) || indicators.length === 0) {
      return <div className="no-indicators">No health indicators available</div>;
    }

    return (
      <div className="health-indicators-grid">
        {indicators.map((indicator, index) => {
          const parameterName = indicator.parameterName || indicator.parameter || indicator.name || `Parameter ${index + 1}`;
          const value = indicator.value || indicator.yourValue || 'N/A';
          const referenceRange = indicator.referenceRange || indicator.optimalRange || indicator.range || 'N/A';
          const interpretation = indicator.interpretation || 'N/A';
          const severity = indicator.severity || indicator.severityTag || 'N/A';
          
          const severityColor = getSeverityColor(interpretation, severity);
          
          return (
            <div key={index} className="health-indicator-card" style={{ borderLeft: `4px solid ${severityColor}` }}>
              <div className="indicator-header">
                <h4 className="parameter-name">{parameterName}</h4>
                <div className="severity-badge" style={{ backgroundColor: severityColor, color: 'white' }}>
                  {severity}
                </div>
              </div>
              <div className="indicator-details">
                <div className="indicator-row">
                  <span className="label">Value:</span>
                  <span className="value" style={{ color: severityColor, fontWeight: 'bold' }}>{value}</span>
                </div>
                <div className="indicator-row">
                  <span className="label">Normal:</span>
                  <span className="value">{referenceRange}</span>
                </div>
                <div className="indicator-row">
                  <span className="label">Status:</span>
                  <span className="value">{interpretation}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderExtractedInfo = () => {
    if (!extractedData && !editableData) return null;

    const data = editMode && editableData ? editableData : extractedData;
    
    // Check if data or required properties are undefined
    if (!data || !data.reportSummary) {
      showErrorAlert('The document data is incomplete or in an unexpected format. Please try processing the document again.');
      return null;
    }
    
    const { reportSummary, keyHealthIndicators, aiGeneratedInsights, medicalRecommendations, treatmentSuggestions, riskPrediction, criticalAlertSystem, demographicInterpretations, healthSummary } = data;

    return (
      <div className="extracted-info-container">
        <div className="edit-controls">
          
        </div>

        <div className="extracted-section">
          <h3>🔍 Report Summary</h3>
          <div className="data-grid">
            {renderEditableField('reportSummary', 'testName', reportSummary?.testName || 'Not Found', 'Test Name')}
            {renderEditableField('reportSummary', 'reportDate', reportSummary?.reportDate || 'Not Found', 'Report Date')}
            {renderEditableField('reportSummary', 'labName', reportSummary?.labName || 'Not Found', 'Lab Name')}
            {renderEditableField('reportSummary', 'patientAge', reportSummary?.patientAge || 'Not Found', 'Patient Age')}
            {renderEditableField('reportSummary', 'patientGender', reportSummary?.patientGender || 'Not Found', 'Patient Gender')}
          </div>
        </div>

        <div className="extracted-section">
          <h3>📊 Key Health Indicators</h3>
          <div className="health-indicators-container">
            {renderHealthIndicators(keyHealthIndicators)}
          </div>
        </div>

        <div className="extracted-section">
          <h3>🧠Insights</h3>
          <div className="data-grid">
            {renderEditableField('aiGeneratedInsights', 'explanations', aiGeneratedInsights?.explanations || 'Not Found', 'What does this mean?', 'textarea')}
            {renderEditableField('aiGeneratedInsights', 'potentialCauses', aiGeneratedInsights?.potentialCauses || 'Not Found', 'Potential Causes', 'textarea')}
            {renderEditableField('aiGeneratedInsights', 'interParameterRelationships', aiGeneratedInsights?.interParameterRelationships || 'Not Found', 'Inter-parameter Relationships', 'textarea')}
          </div>
        </div>
     
        <div className="extracted-section">
          <h3>👥 Demographic-Specific Interpretations</h3>
          <div className="data-grid">
            {renderEditableField('demographicInterpretations', 'ageAdjustedRanges', demographicInterpretations?.ageAdjustedRanges || 'Not Found', 'Age-Adjusted Ranges', 'textarea')}
            {renderEditableField('demographicInterpretations', 'genderSpecificAnalysis', demographicInterpretations?.genderSpecificAnalysis || 'Not Found', 'Gender-Specific Analysis', 'textarea')}
            {renderEditableField('demographicInterpretations', 'ethnicityConsiderations', demographicInterpretations?.ethnicityConsiderations || 'Not Found', 'Ethnicity Considerations', 'textarea')}
            {renderEditableField('demographicInterpretations', 'specialPopulations', demographicInterpretations?.specialPopulations || 'Not Found', 'Special Populations', 'textarea')}
          </div>
        </div>
         
        <div className="extracted-section">
          <h3>🩺 Medical Recommendations</h3>
          <div className="data-grid">
            {renderEditableField('medicalRecommendations', 'preventionTips', medicalRecommendations?.preventionTips || 'Not Found', 'Prevention Tips', 'textarea')}
            {renderEditableField('medicalRecommendations', 'lifestyleModifications', medicalRecommendations?.lifestyleModifications || 'Not Found', 'Lifestyle Modifications', 'textarea')}
            {renderEditableField('medicalRecommendations', 'homeRemedies', medicalRecommendations?.homeRemedies || 'Not Found', 'Home Remedies', 'textarea')}
            {renderEditableField('medicalRecommendations', 'mentalWellness', medicalRecommendations?.mentalWellness || 'Not Found', 'Mental Wellness', 'textarea')}
          </div>
        </div>

        <div className="extracted-section">
          <h3>💊 Treatment Suggestions</h3>
          <div className="data-grid">
            {renderEditableField('treatmentSuggestions', 'doctorActions', treatmentSuggestions?.doctorActions || 'Not Found', 'Doctor Recommended Actions', 'textarea')}
            {renderEditableField('treatmentSuggestions', 'suggestedMedications', treatmentSuggestions?.suggestedMedications || 'Not Found', 'Suggested Medications', 'textarea')}
            {renderEditableField('treatmentSuggestions', 'followUpTests', treatmentSuggestions?.followUpTests || 'Not Found', 'Next Tests/Follow-ups', 'textarea')}
          </div>
        </div>

       

        <div className="extracted-section critical-alerts">
          <h3>🚨 Critical Alert System</h3>
          <div className="data-grid">
            {renderEditableField('criticalAlertSystem', 'redFlagIndicators', criticalAlertSystem?.redFlagIndicators || 'Not Found', 'Red Flag Indicators', 'textarea')}
            {renderEditableField('criticalAlertSystem', 'emergencyContacts', criticalAlertSystem?.emergencyContacts || 'Not Found', 'Emergency Contact Suggestions', 'textarea')}
            {renderEditableField('criticalAlertSystem', 'urgencyTimeline', criticalAlertSystem?.urgencyTimeline || 'Not Found', 'Urgency Timeline', 'textarea')}
          </div>
        </div>

     

        {/* <div className="extracted-section health-summary-section">
          <h3>📁 Health Summary</h3> */}
          <div className="health-summary-item">
            <div className="data-label">Comprehensive Health Overview</div>
            {editMode ? (
              <textarea
                className="health-summary-textarea"
                value={healthSummary && healthSummary !== 'Not Found' && healthSummary !== 'Not found' && healthSummary !== 'not found' ? healthSummary : ''}
                onChange={(e) => handleEditableDataChange('healthSummary', '', e.target.value)}
                placeholder="Enter comprehensive health summary including overall health status, key findings, recommendations, and next steps..."
                rows="10"
              />
            ) : (
              <div className="health-summary-value">{healthSummary || 'Not Found'}</div>
            )}
          </div>
        {/* </div> */}

        
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
      {isLoadingSession ? (
        <div className="loading-container">
          <div className="loading-spinner">
            <i className="fas fa-cog fa-spin"></i>
          </div>
          <p>Loading...</p>
        </div>
      ) : (
        <>
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
                    <button className="download-button small" onClick={downloadCaseDetailsPDF}>
                      <i className="fas fa-file-pdf"></i>
                      Download PDF
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
        </>
      )}
    </div>
  );
};

export default LegalDocProcessor;