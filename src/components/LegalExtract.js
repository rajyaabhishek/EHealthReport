import React, { useState } from 'react';
import './LegalExtract.css';
import { showErrorAlert, showSuccessAlert } from '../utils/alertUtils';
import OpenAIService from '../services/openaiService';

const LegalExtract = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);

  // Create an instance of OpenAIService
  const openaiService = new OpenAIService();

  const handlePdfUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleExtract = async () => {
    if (!pdfFile) {
      showErrorAlert('Please upload a legal document first.');
      return;
    }

    setLoading(true);

    try {
      // Call the actual AI service to extract legal information
      const results = await openaiService.processLegalDocument(pdfFile, 'extract');
      
      if (results.extractedData) {
        setExtractedData(results.extractedData);
      } else {
        showErrorAlert('No legal information could be extracted from this document.');
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error extracting data:", error);
      
      // Check if it's an API key error
      if (error.message && error.message.includes('API key')) {
        showErrorAlert('AI service configuration error. Please check that the API key is properly set.');
      } else {
        showErrorAlert(`An error occurred while processing the document: ${error.message || 'Unknown error'}. Please try again.`);
      }
      
      setLoading(false);
    }
  };

  const renderDataSection = (title, data, keyMapping = {}) => {
    if (!data) return null;

    return (
      <div className="extracted-section">
        <h3>{title}</h3>
        <div className="data-grid">
          {Object.entries(data).map(([key, value]) => {
            // Skip rendering arrays or objects in the grid
            if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
              return null;
            }
            
            const displayKey = keyMapping[key] || key.replace(/([A-Z])/g, ' $1')
              .replace(/^./, str => str.toUpperCase())
              .replace(/([a-z])([A-Z])/g, '$1 $2');
            
            return (
              <div className="data-item" key={key}>
                <div className="data-label">{displayKey}:</div>
                <div className="data-value">
                  {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Render acts separately if they exist */}
        {data.acts && (
          <div className="acts-section">
            <h4>Acts & Sections</h4>
            <table className="acts-table">
              <thead>
                <tr>
                  <th>Act</th>
                  <th>Section</th>
                </tr>
              </thead>
              <tbody>
                {data.acts.map((act, index) => (
                  <tr key={index}>
                    <td>{act.act}</td>
                    <td>{act.section}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const downloadJsonData = () => {
    if (!extractedData) return;

    const jsonString = JSON.stringify(extractedData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `legal_extraction_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="legal-extract-container">
      <h2>Legal Information Extraction</h2>
      <p className="feature-description">
        Upload a legal document to automatically extract case details, party information, and other relevant data.
      </p>

      <div className="upload-section">
        <div className="file-selection-container">
          <div className={`file-upload-area ${pdfFile ? 'has-file' : ''}`}>
            <div className="file-icon">
              <i className="fas fa-file-pdf"></i>
            </div>
            <div className="file-label">
              {pdfFile ? (
                <>
                  <div className="file-name">{pdfFile.name}</div>
                  <div className="file-size">({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)</div>
                </>
              ) : (
                'Select Legal Document (PDF)'
              )}
            </div>
            <input
              type="file"
              accept=".pdf"
              onChange={handlePdfUpload}
              className="file-input"
            />
          </div>

          <button
            className="extract-button"
            onClick={handleExtract}
            disabled={loading || !pdfFile}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Extracting...
              </>
            ) : (
              <>
                <i className="fas fa-magic"></i> Extract Information
              </>
            )}
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner">
            <i className="fas fa-cog fa-spin"></i>
          </div>
          <p>Processing document and extracting legal information...</p>
        </div>
      )}

      {extractedData && !loading && (
        <div className="results-container">
          <div className="results-header">
            <h3>Extracted Legal Information</h3>
            <button className="download-button" onClick={downloadJsonData}>
              <i className="fas fa-download"></i> Download JSON
            </button>
          </div>

          {renderDataSection('Case Basic Details', extractedData.caseBasicDetails, {
            caseNumber: 'Case Number',
            caseYear: 'Case Year',
            caseType: 'Case Type',
            decisionDate: 'Decision Date',
            appliedDate: 'Applied Date',
            receivedDate: 'Received Date'
          })}
          
          {renderDataSection('Appellant Details', extractedData.appellantDetails)}
          
          {renderDataSection('Respondent Details', extractedData.respondentDetails)}
          
          {renderDataSection('Facts', extractedData.factsDetails)}
          
          {renderDataSection('Case Details', extractedData.caseDetails)}
        </div>
      )}
    </div>
  );
};

export default LegalExtract; 