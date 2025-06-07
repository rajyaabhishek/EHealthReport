import React from 'react';

const PrivacyPage = () => {
  return (
    <div className="privacy-container">
      {/* Page Title */}
      <h1 className="page-title">Privacy Policy</h1>
      <p className="subtitle">The document we hope you'll actually read</p>

      {/* Effective Date */}
      <p className="effective-date">
        Effective Date: April 16, 2025 (yes, we keep track of these things)
      </p>

      {/* Section: Consent */}
      <section className="policy-section">
        <h2 className="section-heading">1. Consent (Or, "How We Become Internet Friends")</h2>
        <p className="paragraph">
          By using our humble little service at eHealthReport, you're giving us a friendly nod to collect, use, and store your information as we've described below. We promise to be good stewards of your trust!
        </p>
        <p className="paragraph">
          We get your consent in a few different ways (no carrier pigeons involved, we promise):
        </p>
        <ul className="list">
          <li className="list-item">When you create an account with us (thanks for joining our little community!)</li>
          <li className="list-item">When you upload files for processing (we appreciate your trust)</li>
          <li className="list-item">When you opt-in to receive our charming communications</li>
          <li className="list-item">When you continue using our service after we update policies (your continued visits warm our hearts)</li>
        </ul>
        <p className="paragraph">
          Want to take back that consent? No hard feelings! You can withdraw it anytime by deleting your account or dropping us a line. Just keep in mind that it might limit what cool things you can do with our service - kind of like trying to bake cookies without flour.
        </p>
      </section>

      {/* Section: Google API Information */}
      <section className="policy-section">
        <h2 className="section-heading">2. Powered by Google API (Our Digital Superhero)</h2>
        <p className="paragraph">
          Our document processing magic—like file extraction, conversion, and AI-based document understanding—comes from our friends at Google API. Your files take a quick, secure field trip to their servers just to fulfill your request, then come right back home.
        </p>
        <ul className="list">
          <li className="list-item">They <strong>don't</strong> use your data to train their models (no peeking at your documents for inspiration!)</li>
          <li className="list-item">Your files are processed faster than you can say "ephemeral" and aren't stored permanently</li>
          <li className="list-item">No training or fine-tuning happens with your uploaded data (your files aren't joining any AI gym memberships)</li>
        </ul>
      </section>

      {/* Section: Information We Collect */}
      <section className="policy-section">
        <h2 className="section-heading">3. Information We Collect (Our Very Modest Collection)</h2>
        <p className="sub-heading"><strong>a) Personal Data (The Basics):</strong></p>
        <ul className="list">
          <li className="list-item">Account Info via Clerk: your name, email, and user ID (the digital "Hello, my name is" sticker)</li>
          <li className="list-item">Contact Info if you reach out via email (we love hearing from you!)</li>
        </ul>
        <p className="sub-heading"><strong>b) Usage Data (How You Use Our Digital Treehouse):</strong></p>
        <p className="paragraph">Things like which features you enjoy, when you visit us, and some device info (IP address, browser type, operating system) - nothing too creepy, we promise!</p>
        <p className="sub-heading"><strong>c) Uploaded Files (Your Important Documents):</strong></p>
        <p className="paragraph">Files you temporarily entrust to us via the Google API for whatever helpful task you've selected. We treat them with care and respect!</p>
        <p className="sub-heading"><strong>d) Cookies (The Digital Kind, Not Chocolate Chip):</strong></p>
        <ul className="list">
          <li className="list-item">Necessary cookies for login/session management via Clerk (so you don't have to reintroduce yourself every time)</li>
          <li className="list-item">Analytics cookies to understand how folks are using our service (helps us make it better for you)</li>
        </ul>
      </section>

      {/* Section: How We Use Your Information */}
      <section className="policy-section">
        <h2 className="section-heading">4. How We Use Your Information (The Good Stuff We Do With It)</h2>
        <ul className="list">
          <li className="list-item">To provide our service (that's why we're here!)</li>
          <li className="list-item">To deliver what you've asked for (your wish is our command!)</li>
          <li className="list-item">To improve and expand our features (we're always growing, like a digital garden)</li>
          <li className="list-item">To understand how you use our service (so we can make it even better)</li>
          <li className="list-item">To keep things fair and enforce our policies (we believe in digital good citizenship)</li>
          <li className="list-item">To communicate with you about important stuff (we'll try to keep it interesting)</li>
          <li className="list-item">To keep the bad guys away (security is our middle name... well, not legally)</li>
          <li className="list-item">To follow the law (because we're responsible digital citizens)</li>
        </ul>
      </section>

      {/* Section: Data Processing & Third-Party Sharing */}
      <section className="policy-section">
        <h2 className="section-heading">5. Data Processing & Third-Party Sharing (Our Digital Dance Partners)</h2>
        <p className="sub-heading"><strong>a) File Processing (How We Handle Your Precious Documents):</strong></p>
        <p className="paragraph">Files take a quick trip through Google API and aren't invited to stay permanently. Think of it as a brief business trip for your data, not a permanent vacation.</p>
        <p className="sub-heading"><strong>b) Third-Party Services (The Friends Who Help Us Help You):</strong></p>
        <p className="paragraph">We work with some trusted partners to keep things running smoothly:</p>
        <ul className="list">
          <li className="list-item">Clerk (our friendly doorkeeper for authentication)</li>
          <li className="list-item">Google (the brainy one who processes your files)</li>
          <li className="list-item">Cloud hosting providers (where our digital home lives)</li>
          <li className="list-item">Analytics providers (who help us understand what's working well)</li>
        </ul>
        <p className="sub-heading"><strong>c) Legal Requirements (When The Law Comes Knocking):</strong></p>
        <p className="paragraph">We may need to share information if required by law or if we believe it's necessary to protect rights and safety. Don't worry, we won't hand over your data for just any reason!</p>
        <p className="sub-heading"><strong>d) No Data Selling (We're Not That Kind of Company):</strong></p>
        <p className="paragraph">We solemnly swear that <strong>we never sell your personal data or uploaded content</strong>. Not for all the digital cookies in the world! Your trust means more to us than that.</p>
      </section>

      {/* Section: Data Retention */}
      <section className="policy-section">
        <h2 className="section-heading">6. Data Retention (How Long We Keep Things Around)</h2>
        <ul className="list">
          <li className="list-item">Uploaded files vanish from our systems faster than leftovers at a potluck - just after your requested task is complete</li>
          <li className="list-item">Generated reports hang around briefly (up to 24 hours) so you can access them, then they gracefully exit stage left</li>
          <li className="list-item">Account data stays with us as long as you're part of our community (we like having you around!)</li>
          <li className="list-item">We keep some anonymized usage data indefinitely to make our service better (don't worry, it can't be traced back to you personally)</li>
        </ul>
      </section>

      {/* Section: Security */}
      <section className="policy-section">
        <h2 className="section-heading">7. Security (Our Digital Fort Knox)</h2>
        <p className="paragraph">
          We work hard to keep your information safe and sound, using HTTPS for data transmission (that little padlock in your browser), secure authentication via Clerk, and minimizing what we store, especially for uploaded files. That said, we're honest folks - no internet security is 100% perfect. We're doing our best, but the internet can be a wild place!
        </p>
      </section>

      {/* Section: Your Rights (GDPR/CCPA) */}
      <section className="policy-section">
        <h2 className="section-heading">8. Your Rights (Because You Matter!)</h2>
        <p className="paragraph">
          Depending on where you call home, you may have certain rights under laws with impressive acronyms like GDPR or CCPA. These include accessing, correcting, deleting, restricting, or porting your data. Need to exercise these rights? Just send a friendly email to <a href="mailto:contact@ehealthreport" className="link">contact@ehealthreport</a>. We'll respond as quickly as our little fingers can type!
        </p>
      </section>

      {/* Section: Cookie Policy */}
      <section className="policy-section">
        <h2 className="section-heading">9. Cookie Policy (Not The Tasty Kind, Unfortunately)</h2>
        <p className="paragraph">
          By hanging out on our service, you're okay with us using cookies as we mentioned back in Section 3d. They help our site remember you and understand how folks use our service. You can usually manage or disable them through your browser settings, but fair warning - our site might get a bit confused if you do, like trying to find your way home without GPS.
        </p>
      </section>

      {/* Section: Children's Privacy */}
      <section className="policy-section">
        <h2 className="section-heading">10. Children's Privacy (The Kids Are Alright...Elsewhere)</h2>
        <p className="paragraph">
          Our service isn't designed for the young ones under 13 (or under 16 in certain European regions where kids apparently mature differently). We don't knowingly collect information from children. If we discover we've accidentally gathered data from a minor without parental consent, we'll take steps to remove it faster than a teenager clears their browser history when parent walks in.
        </p>
      </section>

      {/* Section: Third-Party Links */}
      <section className="policy-section">
        <h2 className="section-heading">11. Third-Party Links (When We Point You Elsewhere)</h2>
        <p className="paragraph">
          Sometimes we might link to other websites or services that we don't control. If you click these links, you'll be whisked away to their digital domain. We gently suggest reviewing their privacy policies too. We can't be responsible for what happens in someone else's digital house - we're just making the introduction!
        </p>
      </section>

      {/* Section: Contact Us */}
      <section className="policy-section">
        <h2 className="section-heading">12. Contact Us (We're Real Humans, We Promise!)</h2>
        <p className="paragraph">
          Questions? Concerns? Just want to chat about privacy? We'd love to hear from you:
        </p>
        <p className="paragraph">
          Email: <a href="mailto:contact@ehealthreport" className="link">contact@ehealthreport</a> (we read every message!)
        </p>
        <p className="paragraph">
          Twitter: <a href="https://twitter.com/@yupps8" target="_blank" rel="noopener noreferrer" className="link">@twitterhandle</a> (slide into our DMs, as the kids say)
        </p>
        <p className="paragraph final-note">
          Thanks for reading all the way to the end! You deserve a virtual cookie (the delicious kind, not the tracking kind) 🍪
        </p>
      </section>

      <style jsx>{`
        .privacy-container {
          max-width: 1000px;
          margin: 0 0rem ;
          padding: 1rem;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          color: #333;
          line-height: 1.6;
        }
        
        .page-title {
          font-size: 2rem;
          text-align: center;
          margin-bottom: 0.5rem;
        }
        
        .subtitle {
          text-align: center;
          margin-bottom: 1rem;
          color:#64748b;
        }
        
        .effective-date {
          text-align: center;
          margin-bottom: 2rem;
          font-style: italic;
          color: #64748b;
          font-size: 0.9rem;
        }
        
        .policy-section {
          margin-bottom: 2rem;
          text-align: justify;
          border-bottom: 1px dashed rgb(255, 255, 255);
          padding-bottom: 1rem;
        }
        
        .policy-section:last-child {
          border-bottom: none;
        }
        
        .section-heading {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #333;
        }
        
        .sub-heading {
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #4b5563;
        }
        
        .paragraph {
          margin-bottom: 1rem;
          line-height: 1.6;
        }
        
        .list {
          padding-left: 2rem;
          margin-bottom: 1rem;
          line-height: 1.6;
        }
        
        .list-item {
          margin-bottom: 0.5rem;
        }
        
        .link {
          color: #4c6ef5;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        
        .link:hover {
          text-decoration: underline;
          color: #364fc7;
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

export default PrivacyPage;