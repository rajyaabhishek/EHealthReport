import React from 'react';

const AboutPage = () => {
  return (
    <div className="about-page">  
      <div className="about-content container">
        <h1 className="about-title">About eHealthReport</h1>
        <h3 className="about-subtitle">The story behind your new favorite medical assistant</h3>
        
        <div className="mission-section">
  <h2 className="section-heading">Our Mission (Or Why We Exist)</h2>
  <p className="about-text">
    Let’s face it – healthcare is a complex field, and medical professionals barely have time to breathe, let alone dig through endless pages of reports. In a world where every second matters, your time is more valuable than ever (even more than those hard-earned medical degrees on your wall!).
  </p>
  <p className="about-text">
    We built eHealthReport after seeing doctors, nurses, researchers – and everyday people – waste countless hours trying to make sense of complex medical documents. Whether it’s hunting for key diagnostics, comparing treatments, or simply trying to understand what that test result actually means, it often feels like deciphering another language.
  </p>
  <p className="about-text">
    eHealthReport is our answer: we process your medical records and instantly highlight the insights that truly matter – in language that's easy to understand. We’re here to save professionals time and empower everyday users to take charge of their health with clarity and confidence.
  </p>
</div>

        <div className="developer-section">
          <h2 className="section-heading">The Human Behind the Code</h2>
          <p className="about-text">
             eHealthReport comes from the crazy mind of a 21-year-old with a simple but powerful belief: straightforward tools can create extraordinary impact. 
          </p>
          <p className="about-text">
            Armed with a passion for user experience, a genuine desire to help people, and yes – perhaps a healthy dose of youthful idealism (we prefer to call it "unbounded optimism") – we're on a mission to build solutions that aren't just useful, but become essential parts of your daily workflow.
          </p>
          <p className="about-text">
            We take pride in crafting tools with heart, designed specifically to solve real problems for the health community. No venture capital, no fancy office, just one person with a laptop and the determination to make your life a little bit easier.
          </p>
          <p className="about-text final-note">
            Thanks for giving our little tool a chance to help with your big work! ⚖️
            Chat with me on <a href="https://x.com/yupps8" target="_blank" rel="noopener noreferrer">Twitter</a>
          </p>
        </div>
      </div>
      
      <style jsx>{`
        .about-page {
          padding: 2rem 1rem;
          max-width: 1000px;
          margin: 0 auto;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        
        .about-content {
          text-align: left;
        }
        
        .about-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-top: 0rem;
          margin-bottom: 0.5rem;
          text-align: center;
          color: #2d3748;
        }
        
        .about-subtitle {
          text-align: center;
          color: #6b7280;
          font-weight: 500;
          margin-bottom: 2.5rem;
          font-size: 1.25rem;
        }
        
        .section-heading {
          font-size: 1.8rem;
          font-weight: 600;
          margin-bottom: 1.25rem;
          color:rgb(0, 0, 0);
        }
        
        .about-text {
          font-size: 1.2rem;
          line-height: 1.6;
          margin-bottom: 1.5rem;
          color: #374151;
        }
        
        .mission-section, .developer-section {
          margin-bottom: 3rem;
          padding-bottom: 1.5rem;
        }
        
        .mission-section {
          // border-bottom: 1px dashed #e5e7eb;
          margin-bottom: 0rem;
        }
        
        strong {
          color: #1e40af;
        }
        
        .final-note {
          font-style: italic;
          text-align: center;
          margin-top: 2rem;
        }
      `}</style>
    </div>
  );
};

export default AboutPage;