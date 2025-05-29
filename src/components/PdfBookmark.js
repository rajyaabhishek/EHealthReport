import React, { useState } from 'react';
// Import necessary pdf-lib components directly
import { PDFDocument, PDFName, PDFString, PDFNumber, PDFArray } from 'pdf-lib';
import './PdfBookmark.css'; // Assuming you have this CSS file
import { showErrorAlert, showSuccessAlert } from '../utils/alertUtils';

const PdfBookmark = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookmarkData, setBookmarkData] = useState(null);

  const handlePdfUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setPdfFile(e.target.files[0]);
      setBookmarkData(null); // Reset results when a new file is selected
    }
  };

  const handleBookmark = async () => {
    if (!pdfFile) {
      showErrorAlert('Please upload a legal document first.');
      return;
    }

    setLoading(true);
    setBookmarkData(null); // Clear previous results

    try {
      // Simulate API call
      setTimeout(() => {
        const mockBookmarkData = {
          // Updated mock data structure with page property
          bookmarks: [
            { title: "Case Information Format", page: 1, startPage: 1, endPage: 1, level: 1 },
            { title: "Advocate Certificate - Annexure-A", page: 2, startPage: 2, endPage: 2, level: 1 },
            { title: "Plaintiff Declaration - Appendix V, Annexure-B", page: 3, startPage: 3, endPage: 3, level: 1 },
            { title: "Index of Documents", page: 4, startPage: 4, endPage: 5, level: 1 },
            { title: "Memo of Parties - Plaintiff and Defendants", page: 6, startPage: 6, endPage: 7, level: 1 },
            { title: "Complaint under Section 223 BNSS", page: 8, startPage: 8, endPage: 19, level: 1 },
            { title: "Complaint Introduction and Charges", page: 8, startPage: 8, endPage: 8, level: 2 },
            { title: "Grounds of Complaint - Marriage, Harassment Allegations", page: 9, startPage: 9, endPage: 11, level: 2 },
            { title: "Legal Grounds & Supreme Court and High Court Precedents on FIR Registration", page: 12, startPage: 12, endPage: 15, level: 2 },
            { title: "Continuation and Request for FIR Registration - Cognizable Offence", page: 16, startPage: 16, endPage: 18, level: 2 },
            { title: "Prayer for FIR Registration and Legal Action", page: 19, startPage: 19, endPage: 19, level: 2 },
            { title: "Affidavit for Complaint", page: 20, startPage: 20, endPage: 21, level: 1 },
            { title: "Application under Section 175 BNSS", page: 22, startPage: 22, endPage: 24, level: 1 },
            { title: "Affidavit for Application under Section 175 BNSS", page: 22, startPage: 22, endPage: 22, level: 2 }, // Same page as parent, should still work
            { title: "Prayer for Application under Section 175 BNSS - Direct SHO to Register FIR", page: 23, startPage: 23, endPage: 24, level: 2 },
          ],
          fileName: pdfFile.name,
          totalPages: 25, // Example total pages
          bookmarkedPdfUrl: "#"
        };
        setBookmarkData(mockBookmarkData);
        setLoading(false);
      }, 1500); // Reduced timeout for faster testing
    } catch (error) {
      console.error("Error processing document:", error);
      showErrorAlert('An error occurred during processing. Please try again.');
      setLoading(false);
    }
  };

  const downloadBookmarkAsTxt = () => {
    if (!bookmarkData || !bookmarkData.bookmarks) return;

    let content = `Bookmarks for: ${bookmarkData.fileName}\n`;
    content += `Total Pages: ${bookmarkData.totalPages}\n\n`;
    content += "Sections:\n";

    bookmarkData.bookmarks.forEach(bookmark => {
      const indent = "  ".repeat(bookmark.level - 1); // Use spaces for indent
      const pageInfo = bookmark.startPage && bookmark.endPage && bookmark.startPage !== bookmark.endPage 
        ? `Pages ${bookmark.startPage}-${bookmark.endPage}`
        : `Page ${bookmark.page || bookmark.startPage || 1}`;
      content += `${indent}${bookmark.title} (${pageInfo})\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' }); // Ensure UTF-8
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookmarks_${bookmarkData.fileName.replace('.pdf', '')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Get a hierarchical representation of bookmarks
  const createBookmarkTree = (bookmarks) => {
    if (!bookmarks || bookmarks.length === 0) return [];

    const result = [];
    const stack = []; // Stack to track parent bookmarks

    for (let i = 0; i < bookmarks.length; i++) {
      const bookmark = { ...bookmarks[i], children: [] };
      
      // If it's a level 1 bookmark, add to the result
      if (bookmark.level === 1) {
        result.push(bookmark);
        stack[0] = bookmark;
      } 
      // Otherwise, find its parent
      else {
        // Find the parent at the previous level
        const parentLevel = bookmark.level - 1;
        const parent = stack[parentLevel - 1];
        
        if (parent) {
          parent.children.push(bookmark);
        } else {
          // If no parent is found, add to the root level
          console.warn("No parent found for bookmark:", bookmark.title);
          result.push(bookmark);
        }
        
        // Update the stack at the current level
        stack[bookmark.level - 1] = bookmark;
        
        // Clear all deeper levels in the stack
        stack.length = bookmark.level;
      }
    }
    
    return result;
  };

  const downloadBookmarkedPdf = async () => {
    if (!bookmarkData || !pdfFile) {
      showErrorAlert('No bookmark data available. Process a document first.');
      return;
    }

    setLoading(true);

    try {
      // Load the PDF
      const fileArrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileArrayBuffer);
      
      // Create a simple text-based bookmarks file instead of trying to modify the PDF
      // This is a workaround since we're having issues with PDF bookmarks
      let bookmarkContent = `Bookmarks for ${bookmarkData.fileName}\n\n`;
      
      // Add each bookmark with proper indentation based on level
      bookmarkData.bookmarks.forEach(bookmark => {
        const indent = '  '.repeat(bookmark.level - 1);
        bookmarkContent += `${indent}Page ${bookmark.page}: ${bookmark.title}\n`;
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
      pdfLink.download = `processed_${bookmarkData.fileName}`;
      document.body.appendChild(pdfLink);
      pdfLink.click();
      
      setTimeout(() => {
        const bookmarkLink = document.createElement('a');
        bookmarkLink.href = bookmarkUrl;
        bookmarkLink.download = `bookmarks_${bookmarkData.fileName.replace('.pdf', '.txt')}`;
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
      console.error("Error processing PDF:", error);
      showErrorAlert(`Failed to process PDF: ${error.message || error}`);
      setLoading(false);
    }
  };

  // --- Render JSX ---
  return (
    <div className="pdf-bookmark-container">
      <h2>PDF Auto-Bookmarking</h2>
      <p className="feature-description">
        Upload a legal document to automatically detect and generate bookmarks for all sections.
      </p>

      <div className="upload-section">
        <div className="file-selection-container">
          <div className={`file-upload-area ${pdfFile ? 'has-file' : ''}`}>
            <div className="file-icon">
              <i className={`fas ${pdfFile ? 'fa-file-pdf' : 'fa-folder-open'}`}></i>
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
              id="pdf-upload-input"
            />
          </div>

          <button
            className="bookmark-button"
            onClick={handleBookmark}
            disabled={loading || !pdfFile}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Processing...
              </>
            ) : (
              <>
                <i className="fas fa-bookmark"></i> Generate Bookmarks
              </>
            )}
          </button>
        </div>
      </div>

      {loading && !bookmarkData && (
        <div className="loading-container">
          <div className="loading-spinner">
            <i className="fas fa-cog fa-spin fa-3x"></i>
          </div>
          <p>Analyzing document structure...</p>
        </div>
      )}

      {bookmarkData && (
        <div className="results-container">
          <div className="results-header">
            <h3>Document Bookmarks</h3>
            <div className="header-buttons">
              <button className="download-button" onClick={downloadBookmarkAsTxt} disabled={loading}>
                <i className="fas fa-file-alt"></i> Download TXT
              </button>
              <button 
                className="download-button"
                onClick={downloadBookmarkedPdf}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Generating PDF...
                  </>
                ) : (
                  <>
                    <i className="fas fa-file-pdf"></i> Download PDF
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="document-info">
            <div className="info-item">
              <span className="info-label">Document:</span>
              <span className="info-value">{bookmarkData.fileName}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Total Pages:</span>
              <span className="info-value">{bookmarkData.totalPages}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Bookmarks Found:</span>
              <span className="info-value">{bookmarkData.bookmarks.length}</span>
            </div>
          </div>

          <div className="bookmarks-container">
            <h4>Detected Structure</h4>
            <ul className="bookmarks-list">
              {bookmarkData.bookmarks.map((bookmark, index) => (
                <li 
                  key={index} 
                  className={`bookmark-item level-${bookmark.level}`}
                  style={{ paddingLeft: `${(bookmark.level - 1) * 20}px` }}
                >
                  <div className="bookmark-title">
                    <i className={`fas ${bookmark.level === 1 ? 'fa-bookmark' : 'fa-caret-right'}`} style={{ marginRight: '8px' }}></i>
                    <span>{bookmark.title}</span>
                  </div>
                  <div className="bookmark-page">
                    {bookmark.startPage && bookmark.endPage && bookmark.startPage !== bookmark.endPage 
                      ? `Pages ${bookmark.startPage}-${bookmark.endPage}` 
                      : `Page ${bookmark.page || bookmark.startPage || 1}`}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfBookmark;