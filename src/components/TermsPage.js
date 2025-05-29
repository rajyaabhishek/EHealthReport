import React from 'react';

const TermsPage = () => {
  return (
    <div className="terms-container">
      {/* Page Title */}
      <h1 className="page-title">Terms of Service</h1>
      <p className="subtitle">The Rules of the Road (We've tried to make them painless)</p>

      {/* Last Updated */}
      <p className="last-updated">
        Last Updated: May 5, 2025. eCase.site: Making document conversion less painful since 2025!
      </p>

      {/* Section 1 */}
      <section className="policy-section">
        <h2 className="section-heading">1. A Friendly Introduction</h2>
        <p className="paragraph">
          Hello there! Welcome to <strong>eCase.site</strong> ("us," "we," or "the company that really hopes you're having a nice day").
        </p>
        <p className="paragraph">
          These Terms of Service (or as we like to call them, "The Rules of the Road") govern your journey through our website at ecase.site. We've tried to make them as painless as possible—kind of like a trip to the dentist where they actually have the good flavors of toothpaste.
        </p>
        <p className="paragraph">
          Our Privacy Policy is also part of this agreement (it's like the sidekick to these Terms' superhero). Together they explain how we'll treat your information with the care it deserves.
        </p>
        <p className="paragraph">
          By using our service, you're nodding along to these terms. If you find yourself vigorously shaking your head instead, that's okay! Just please don't use our service, and maybe drop us a line at <a href="mailto:contact@ecase.site" className="link">contact@ecase.site</a> so we can see if there's another path forward. We're reasonable folks, we promise.
        </p>
      </section>

      {/* Section 2 */}
      <section className="policy-section">
        <h2 className="section-heading">2. Keeping in Touch</h2>
        <p className="paragraph">
          When you use eCase.site, you're agreeing to receive newsletters and updates from us. Think of them less as "marketing materials" and more like "friendly letters from that pen pal who's really excited about document conversion."
        </p>
        <p className="paragraph">
          Not your cup of tea? No problem! You can unsubscribe faster than you can say "no more emails please" by clicking the unsubscribe link or emailing <a href="mailto:contact@ecase.site" className="link">contact@ecase.site</a>.
        </p>
      </section>

      {/* Section 3 */}
      <section className="policy-section">
        <h2 className="section-heading">3. Money Matters</h2>
        <p className="paragraph">
          If you decide to purchase something from us (thank you, by the way!), we'll need some payment information. We promise we're not collecting card numbers for fun—we actually need them to process your payment.
        </p>
        <p className="paragraph">
          By providing your payment details, you're confirming that:
        </p>
        <ul className="list">
          <li className="list-item">You have the legal right to use that payment method (borrowing your roommate's credit card without permission is a no-no)</li>
          <li className="list-item">All the information you've given us is accurate (no need to pretend you live at "123 Fake Street")</li>
        </ul>
        <p className="paragraph">
          We work with trusted third-party payment processors who help make the money magic happen. When you submit your payment info, you're giving us permission to share it with these companies, subject to our Privacy Policy.
        </p>
        <p className="paragraph">
          We reserve the right to cancel orders for reasons including product availability, pricing errors, or suspected fraud. It's not that we don't trust you—we just need to keep things on the up-and-up.
        </p>
      </section>

      {/* Section 4 */}
      <section className="policy-section">
        <h2 className="section-heading">4. Subscriptions: The Gift That Keeps on Giving</h2>
        <p className="paragraph">
          Some of our services require a subscription (think of it like a membership to your favorite club, but with fewer awkward holiday parties).
        </p>
        <p className="paragraph">
          Here's how it works:
        </p>
        <ul className="list">
          <li className="list-item">You'll be billed in advance on a recurring basis</li>
          <li className="list-item">Your subscription will automatically renew (like magic, except you get charged)</li>
          <li className="list-item">You can cancel anytime through your account or by emailing <a href="mailto:contact@ecase.site" className="link">contact@ecase.site</a></li>
        </ul>
        <p className="paragraph">
          We need valid payment information to process your subscription. If your payment method fails, we may have to terminate your access to the service. Not to be dramatic, but please keep your payment info up to date!
        </p>
      </section>

      {/* Section 5 */}
      <section className="policy-section">
        <h2 className="section-heading">5. Free Trials: Try Before You Buy</h2>
        <p className="paragraph">
          eCase.site occasionally on its sole discretion offer free trials of our subscription services to some of our users. It's like test-driving a car, but with fewer salespeople hovering nearby.
        </p>
        <p className="paragraph">
          Important notes about free trials:
        </p>
        <ul className="list">
          <li className="list-item">We might ask for your billing info when you sign up</li>
          <li className="list-item">If you provide billing info, you won't be charged until the trial ends</li>
          <li className="list-item">If you don't cancel before the trial expires, we'll automatically start billing you</li>
          <li className="list-item">We reserve the right to modify or cancel free trial offers at any time</li>
        </ul>
      </section>

      {/* Section 6 */}
      <section className="policy-section">
        <h2 className="section-heading">6. Fee Changes: The Only Constant is Change</h2>
        <p className="paragraph">
          We may modify our subscription fees from time to time. When we do, the new rates will take effect at the end of your current billing cycle.
        </p>
        <p className="paragraph">
          Don't worry—we're not sneaky. We'll give you advance notice of any price changes so you can decide whether to continue your subscription. If you keep using the service after a price change, that signals your acceptance of the new fee.
        </p>
      </section>

      {/* Section 7 */}
      <section className="policy-section">
        <h2 className="section-heading">7. Refunds: Sometimes Things Just Don't Work Out</h2>
        <p className="paragraph">
          We offer refunds within 14 days of purchase. Like returning a sweater that looked better online than it does on you—no hard feelings.
        </p>
      </section>

      {/* Section 8 */}
      <section className="policy-section">
        <h2 className="section-heading">8. Your Content: With Great Uploads Come Great Responsibilities</h2>
        <p className="paragraph">
          Our service lets you upload information, documents, and other materials ("Content"). You're responsible for making sure your Content is legal and appropriate.
        </p>
        <p className="paragraph">
          By uploading Content, you're telling us:
        </p>
        <ul className="list">
          <li className="list-item">You own it or have permission to use it</li>
          <li className="list-item">Sharing it doesn't violate anyone else's rights</li>
        </ul>
        <p className="paragraph highlight">
          Documents you upload to eCase.site remain on our servers for only 24 hours before being automatically deleted. We're not hoarders—we don't keep your files longer than necessary, and we don't share them with third parties.
        </p>
      </section>

      {/* Section 9 */}
      <section className="policy-section">
        <h2 className="section-heading">9. Things You Definitely Shouldn't Do</h2>
        <p className="paragraph">
          Please don't use our service to:
        </p>
        <ul className="list">
          <li className="list-item">Break any laws (that should go without saying, but we're saying it anyway)</li>
          <li className="list-item">Harm minors or expose them to inappropriate content (protect the children!)</li>
          <li className="list-item">Send spam (nobody likes spam, not even the people sending it)</li>
          <li className="list-item">Impersonate others (unless you're auditioning for a role in a play)</li>
          <li className="list-item">Infringe on others' rights</li>
          <li className="list-item">Engage in conduct that could restrict others' enjoyment of the service</li>
        </ul>
        <p className="paragraph">
          Also, please don't:
        </p>
        <ul className="list">
          <li className="list-item">Overload our service or interfere with others' use</li>
          <li className="list-item">Use bots or automated tools to access our service</li>
          <li className="list-item">Try to copy or monitor our service without permission</li>
          <li className="list-item">Introduce viruses or other harmful code (that's just mean)</li>
          <li className="list-item">Try to gain unauthorized access to our systems</li>
          <li className="list-item">Attack our service via denial-of-service attacks</li>
          <li className="list-item">Take actions that could damage our reputation</li>
        </ul>
      </section>

      {/* Section 10 */}
      <section className="policy-section">
        <h2 className="section-heading">10. Age Restrictions: Adults Only, Please</h2>
        <p className="paragraph">
          Our service is only for individuals who are at least 18 years old. By using eCase.site, you're confirming that you're an adult with the legal capacity to enter into this agreement. If you're under 18, we're sorry, but you'll need to wait to use our service.
        </p>
      </section>

      {/* Section 11 */}
      <section className="policy-section">
        <h2 className="section-heading">11. Your Account: Guard It Like Your Smartphone</h2>
        <p className="paragraph">
          When you create an account with us:
        </p>
        <ul className="list">
          <li className="list-item">You must be over 18</li>
          <li className="list-item">You must provide accurate information</li>
          <li className="list-item">You're responsible for maintaining the confidentiality of your password</li>
          <li className="list-item">You're responsible for all activities that happen under your account</li>
        </ul>
        <p className="paragraph">
          Please notify us immediately if someone has broken into your account. And please don't use offensive, vulgar, or obscene usernames—keep it classy!
        </p>
      </section>

      {/* Section 12 */}
      <section className="policy-section">
        <h2 className="section-heading">12. Our Intellectual Property: We Made This!</h2>
        <p className="paragraph">
          eCase.site and all its original content remain our exclusive property. Our service is protected by copyright, trademark, and other laws. Please don't use our trademarks without our written permission—we're rather attached to them.
        </p>
      </section>

      {/* Section 13 */}
      <section className="policy-section">
        <h2 className="section-heading">13. Copyright Issues: Respecting Creative Work</h2>
        <p className="paragraph">
          We respect intellectual property rights and expect you to do the same. If you believe someone has infringed on your copyright through our service, please email us at <a href="mailto:contact@ecase.site" className="link">contact@ecase.site</a> with "Copyright Infringement" in the subject line.
        </p>
        <p className="paragraph">
          Include detailed information about the alleged infringement as outlined in our DMCA procedure below.
        </p>
      </section>

      {/* Section 14 */}
      <section className="policy-section">
        <h2 className="section-heading">14. DMCA Procedure: The Official Process</h2>
        <p className="paragraph">
          To submit a copyright infringement notification, provide our Copyright Agent with:
        </p>
        <ul className="list">
          <li className="list-item">Your electronic or physical signature</li>
          <li className="list-item">A description of the copyrighted work you believe has been infringed</li>
          <li className="list-item">The location of the allegedly infringing material on our service</li>
          <li className="list-item">Your contact information</li>
          <li className="list-item">A statement that you believe the use is not authorized</li>
          <li className="list-item">A statement, under penalty of perjury, that your information is accurate and you're authorized to act on the copyright owner's behalf</li>
        </ul>
        <p className="paragraph">
          Contact our Copyright Agent at <a href="mailto:contact@ecase.site" className="link">contact@ecase.site</a>.
        </p>
      </section>

      {/* Section 15 */}
      <section className="policy-section">
        <h2 className="section-heading">15. Feedback: We're All Ears</h2>
        <p className="paragraph">
          We welcome your feedback, suggestions, and error reports! By providing feedback, you agree that:
        </p>
        <ul className="list">
          <li className="list-item">You're not claiming intellectual property rights to your feedback</li>
          <li className="list-item">Your feedback doesn't contain confidential information</li>
          <li className="list-item">We're not under confidentiality obligations regarding your feedback</li>
          <li className="list-item">We may use your feedback for any purpose without compensation</li>
        </ul>
      </section>

      {/* Section 16 */}
      <section className="policy-section">
        <h2 className="section-heading">16. Third-Party Links: Venturing Beyond Our Borders</h2>
        <p className="paragraph">
          Our service may contain links to third-party websites that we don't control. We're not responsible for their content or practices. Think of these links as us pointing to another store across the street—we can direct you there, but we can't control what happens once you're inside.
        </p>
        <p className="paragraph">
          We strongly encourage you to read the terms and privacy policies of any third-party sites you visit. It's like checking restaurant reviews before dining—always a good idea.
        </p>
      </section>

      {/* Section 17 */}
      <section className="policy-section">
        <h2 className="section-heading">17. Disclaimer of Warranty: The Legal Version of "As Is"</h2>
        <p className="paragraph">
          Our services are provided "as is" and "as available" without warranties of any kind. We don't promise that our service will be error-free, secure, accurate, or uninterrupted.
        </p>
        <p className="paragraph">
          We disclaim all warranties, express or implied, including warranties of merchantability, fitness for a particular purpose, and non-infringement. It's like buying a mystery box—we hope it's awesome, but we can't make guarantees.
        </p>
        <p className="paragraph">
          This doesn't affect any warranties that can't be excluded under applicable law.
        </p>
      </section>

      {/* Section 18 */}
      <section className="policy-section">
        <h2 className="section-heading">18. Limitation of Liability: Where We Draw the Line</h2>
        <p className="paragraph">
          Except as prohibited by law, you agree to hold us harmless for indirect, punitive, special, incidental, or consequential damages, however they arise.
        </p>
        <p className="paragraph">
          If there is liability found on our part, it will be limited to the amount you paid for our products or services. Some states don't allow the exclusion of certain damages, so these limitations may not apply to you.
        </p>
      </section>

      {/* Section 19 */}
      <section className="policy-section">
        <h2 className="section-heading">19. Account Termination: Parting Ways</h2>
        <p className="paragraph">
          We may terminate your account immediately for any reason, including if you breach these Terms.
        </p>
        <p className="paragraph">
          If you want to terminate your account, you can simply stop using our service. Certain provisions of these Terms (like ownership and liability limitations) will survive termination.
        </p>
      </section>

      {/* Section 20 */}
      <section className="policy-section">
        <h2 className="section-heading">20. Governing Law: The Rule Book</h2>
        <p className="paragraph">
          These Terms are governed by the laws of [Your Jurisdiction], regardless of conflict of law principles.
        </p>
      </section>

      {/* Section 21 */}
      <section className="policy-section">
        <h2 className="section-heading">21. Changes to Our Service: Evolution in Action</h2>
        <p className="paragraph">
          We reserve the right to modify or discontinue our service at any time without notice. We won't be liable if our service is unavailable for any period.
        </p>
      </section>

      {/* Section 22 */}
      <section className="policy-section">
        <h2 className="section-heading">22. Amendments to Terms: The Shifting Sands</h2>
        <p className="paragraph">
          We may update these Terms at any time by posting the amended terms on our site. It's your responsibility to review these Terms periodically, like checking the weather before a picnic.
        </p>
        <p className="paragraph">
          By continuing to use our service after revisions become effective, you're agreeing to the changes. If you don't agree with the new terms, it's time to stop using our service.
        </p>
      </section>

      {/* Section 23 */}
      <section className="policy-section">
        <h2 className="section-heading">23. Waiver and Severability: The Legal Safety Net</h2>
        <p className="paragraph">
          If we don't enforce a provision of these Terms, that doesn't mean we're waiving our right to do so in the future.
        </p>
        <p className="paragraph">
          If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will remain in effect. It's like removing one bad apple—the rest of the bunch is still good.
        </p>
      </section>

      {/* Section 24 */}
      <section className="policy-section">
        <h2 className="section-heading">24. Acknowledgement: The Final Handshake</h2>
        <p className="paragraph">
          By using our service, you acknowledge that you've read these Terms and agree to be bound by them. No fine print tricks here—we want you to understand what you're agreeing to.
        </p>
      </section>

      {/* Section 25 */}
      <section className="policy-section">
        <h2 className="section-heading">25. Contact Us: We're Here to Help</h2>
        <p className="paragraph">
          Have questions, comments, or technical support needs? We'd love to hear from you!
        </p>
        <p className="paragraph">
          Email us at: <a href="mailto:contact@ecase.site" className="link">contact@ecase.site</a>
        </p>
        <p className="paragraph final-note">
          Thanks for reading all the way to the end! You deserve a virtual high-five! ✋
        </p>
      </section>

      <style jsx>{`
        .terms-container {
          max-width: 1000px;
          margin: 0 0rem;
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
          color: #64748b;
        }
        
        .last-updated {
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
        
        .paragraph {
          margin-bottom: 1rem;
          line-height: 1.6;
        }
        
        .highlight {
          background-color: #f8fafc;
          padding: 1rem;
          border-left: 4px solidrgb(234, 234, 234);
          margin-bottom: 1rem;
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

export default TermsPage;