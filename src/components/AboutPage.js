import React from 'react';

const AboutPage = () => {
  return (
    <div className="about-page">  
      <div className="about-content container">
        <h1 className="about-title">About eCase.site</h1>
        <h3 className="about-subtitle">The story behind your new favorite legal assistant</h3>
        
        <div className="mission-section">
          <h2 className="section-heading">Our Mission (Or Why We Exist)</h2>
          <p className="about-text">
            Let's face it – the legal world moves faster than a judge's gavel on a Friday afternoon. And we all know time is your most precious commodity (even more valuable than those fancy law school degrees hanging on your wall!).
          </p>
          <p className="about-text">
            We created eCase.site after watching brilliant legal minds – lawyers, judges, clerks, and entire firms – spend countless hours hunting through mountains of documents for those critical nuggets of information. It's exactly like searching for a needle in a haystack, except the needle is a crucial legal precedent and the haystack is... well, hundreds of pages of dense legalese.
          </p>
          <p className="about-text">
            eCase.site is our humble solution: we process your legal documents and instantly highlight the insights you actually need. We save you time so you can focus on the important stuff – like winning cases, serving justice, or making it home for dinner with the family. Maybe even all three!
          </p>
        </div>
        
        <div className="developer-section">
          <h2 className="section-heading">The Human Behind the Code</h2>
          <p className="about-text">
             eCase.site comes from the crazy mind of a 21-year-old with a simple but powerful belief: straightforward tools can create extraordinary impact. 
          </p>
          <p className="about-text">
            Armed with a passion for user experience, a genuine desire to help people, and yes – perhaps a healthy dose of youthful idealism (we prefer to call it "unbounded optimism") – we're on a mission to build solutions that aren't just useful, but become essential parts of your daily workflow.
          </p>
          <p className="about-text">
            We take pride in crafting tools with heart, designed specifically to solve real problems for the legal community. No venture capital, no fancy office, just one person with a laptop and the determination to make your professional life a little bit easier.
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