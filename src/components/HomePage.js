import React, { useState, useEffect } from 'react';
import OpenAIService from '../services/openaiService';
import { useDropzone } from 'react-dropzone';
import './HomePage.css';
import { showErrorAlert, showUploadErrorAlert, showProcessingErrorAlert } from '../utils/alertUtils';

const HomePage = ({ setActiveTab }) => {
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [bookmarkData, setBookmarkData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [animateUpload, setAnimateUpload] = useState(false);
  const [currentCredits, setCurrentCredits] = useState(0);
  const [requiredCredits, setRequiredCredits] = useState(0);

  // Create an instance of OpenAIService
  const openaiService = new OpenAIService();

  // Helper function to count PDF pages
  const countPdfPages = async (pdfFile) => {
    try {
      if (window.countPdfPages) {
        return await window.countPdfPages(pdfFile);
      }
      return 0;
    } catch (error) {
      console.error('Error counting PDF pages:', error);
      return 0;
    }
  };

  useEffect(() => {
    // Add animation class after component mounts
    const timer = setTimeout(() => {
      setAnimateUpload(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

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

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      // Reset any previous results when a new file is selected
      setExtractedData(null);
      setBookmarkData(null);
      
      // Count pages and update required credits
      try {
        const pageCount = await countPdfPages(file);
        setRequiredCredits(pageCount);
        
        // Check if user has enough credits
        if (currentCredits >= pageCount) {
          // Automatically process the document when it's uploaded if credits are sufficient
          await handleProcessDocument(file);
        }
      } catch (error) {
        console.error('Error counting pages:', error);
        setRequiredCredits(0);
      }
    } else if (file) {
      showUploadErrorAlert(file.name, 'Invalid file type - only PDF files are accepted');
      setPdfFile(null);
      setRequiredCredits(0);
    }
  };

  const needsSubscription = requiredCredits > 0 && currentCredits < requiredCredits;
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: needsSubscription ? (acceptedFiles) => {} : onDrop, // Disable onDrop when subscription needed
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    disabled: needsSubscription
  });

  const handleProcessDocument = async (file) => {
    const fileToProcess = file || pdfFile;
    
    if (!fileToProcess) {
      showErrorAlert('Please upload a legal document first.');
      return;
    }

    // Check credits before processing - passed from parent component
    if (window.checkCreditsForPages) {
      const pageCount = await window.checkCreditsForPages(fileToProcess);
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
      const results = await openaiService.processLegalDocument(fileToProcess, 'both');
      
      // Update state with results
      if (results.extractedData) setExtractedData(results.extractedData);
      if (results.bookmarkData) setBookmarkData(results.bookmarkData);
      
      setLoading(false);
    } catch (error) {
      console.error('Error processing document:', error);
      showProcessingErrorAlert('document analysis');
      setLoading(false);
    }
  };

  const navigateToProcessor = (mode) => {
    // Navigate to the document processor with the specified mode
    setActiveTab('unified');
    
    // Store the current data in sessionStorage to pass to the processor component
    if (pdfFile) {
      // Store PDF as a blob URL
      const pdfUrl = URL.createObjectURL(pdfFile);
      window.sessionStorage.setItem('pdfBlobUrl', pdfUrl);
      window.sessionStorage.setItem('pdfFileName', pdfFile.name);
      window.sessionStorage.setItem('pdfFileSize', pdfFile.size);
    }
    
    // Store extracted data and bookmark data as JSON strings
    if (extractedData) {
      window.sessionStorage.setItem('extractedData', JSON.stringify(extractedData));
    }
    
    if (bookmarkData) {
      window.sessionStorage.setItem('bookmarkData', JSON.stringify(bookmarkData));
    }
    
    // Set the mode (inspection or details)
    window.sessionStorage.setItem('processorMode', mode);
  };

  const handleShowDetails = () => {
    navigateToProcessor('details');
  };

  const handleInspectPDF = () => {
    navigateToProcessor('inspect');
  };

  const handleRemoveFile = () => {
    setPdfFile(null);
    setExtractedData(null);
    setBookmarkData(null);
  };

  const navigateToPricing = () => {
    window.scrollTo(0, 0);
    window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'pricing' } }));
  };

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1>The World's most trusted Legal Document Information</h1>
          <p>Upload any legal document to extract information and bookmarks for PDFs in seconds</p>
          
          
          
          <div className={`hero-pdf-upload-container ${animateUpload ? 'animate-in' : ''}`}>
            <div 
              {...getRootProps()} 
              className={`upload-button ${pdfFile ? 'has-file' : ''} ${extractedData ? 'has-results' : ''} ${needsSubscription ? 'needs-subscription' : ''}`}
            >
              <input {...getInputProps()} />
              
              {needsSubscription ? (
                <div className="subscription-content">
                  <div className="subscription-icon">
                    <i className="fas fa-exclamation-triangle"></i>
                    <h3>You're low on credits</h3>
                  </div>
               
                  <button 
                    className="subscribe-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToPricing();
                    }}
                  >
                  Subscribe Now
                  </button>
                </div>
              ) : (
                <>
                  {!pdfFile && (
                    <div className="upload-content">
                      <span>Click here to upload your document</span>
                    </div>
                  )}
                  
                  
                  
                  {loading && (
                    <div className="processing-state">
                      <div className="processing-animation">
                        <i className="fas fa-spinner fa-spin"></i>
                      </div>
                    
                    </div>
                  )}
                  
                  {extractedData && !loading && (
                    <div className="results-containerr">
                      <div className="document-info-wrapper">
                        <i className="fas fa-file-pdf"></i>
                        <span className="document-name">{pdfFile.name}</span>
                      </div>
                      
                      <button 
                        className="remove-results-btn" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile();
                        }}
                      >
                        <i className="fas fa-times"></i> 
                      </button>
                      
                      <div className="result-actions">
                        <button 
                          className="result-action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShowDetails();
                          }}
                        >
                          <i className="fas fa-info-circle"></i> Details
                        </button>
                        <button 
                          className="result-action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInspectPDF();
                          }}
                        >
                          <i className="fas fa-search"></i> Inspect
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="features-container">
          <div className="feature-item">
            <div className="feature-icon">
              <i className="fas fa-shield-alt"></i>
            </div>
            <h3>Secure</h3>
            <p>Your documents are encrypted, confidential, and never used for training.</p>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">
              <i className="fas fa-university"></i>
            </div>
            <h3>Institutional</h3>
            <p>We've provid our services to thousands of law Firms & legal Professionals.</p>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">
              <i className="fas fa-bullseye"></i>
            </div>
            <h3>Accurate</h3>
            <p>We aim for top results but if it doesn't get to your expectations, <a href="mailto:contact@ecase.site">email us</a> and we'll fix it.</p>
          </div>
        </div>
      </section>


      <section className="free-tier-preview">
        <div className="free-tier-cards">
          <div className="free-tier-preview-card">
            <h3>Anonymous</h3>
            <p>Anonymous with no sign up</p>
            <div className="tier-feature">
              <span className="check-icon">✓</span> 5 page every 24 hours
            </div>
            <div className="tier-price">Free</div>
          </div>
          
          <div className="free-tier-preview-card">
            <h3>Registered</h3>
            <p>Registration is free</p>
            <div className="tier-feature">
              <span className="check-icon">✓</span> 10 pages every 24 hours
            </div>
            <div className="tier-price">Free</div>
          </div>
          
          <div className="free-tier-preview-card">
            <h3>Subscribe</h3>
            <p>Subscribe to get usage for more documents</p>
            <button className="subscribee-button" onClick={navigateToPricing}>Subscribe</button>
          </div>
        </div>
      </section>

      <section className="contact-section">
        <div className="contact-section-content">
          <h2>Need more?</h2>
          <p>We are purely devoted to providing the best service to our clients. Let us know how we can help!</p>
        </div>
        <div className="contact-info">
          <div className="contact-item">
            <i className="fas fa-envelope"></i>
            <span>contact@ecase.site</span>
          </div>
          <div className="contact-item">
            <i className="fas fa-phone-alt"></i>
            <span>+91 9873777831</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 