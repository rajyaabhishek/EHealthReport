import React, { useState, useEffect } from 'react';
import './PricingPage.css';
import PaymentButton from './PaymentButton';

const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [currency, setCurrency] = useState('INR');
  const [exchangeRate, setExchangeRate] = useState(1);

  useEffect(() => {
    // Detect user's currency from browser
    const userLocale = navigator.language || 'en-IN';
    const userCurrency = new Intl.NumberFormat(userLocale, { style: 'currency', currency: 'USD' })
      .formatToParts(0)
      .find(part => part.type === 'currency').value;
    
    setCurrency(userCurrency === '$' ? 'USD' : 'INR');

    // In a real app, you would fetch the current exchange rate from an API
    // For demo purposes, we'll use a fixed rate
    const fetchExchangeRate = async () => {
      try {
        // Replace with actual API call in production
        // const response = await fetch('https://api.exchangerate-api.com/v4/latest/INR');
        // const data = await response.json();
        // setExchangeRate(data.rates[userCurrency === '$' ? 'USD' : 'INR']);
        
        // For demo, using fixed rate (1 USD = 83 INR)
        setExchangeRate(userCurrency === '$' ? 0.012 : 1);
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
        setExchangeRate(1); // Fallback to INR
      }
    };

    fetchExchangeRate();
  }, []);

  const formatPrice = (amountInINR) => {
    const convertedAmount = amountInINR * exchangeRate;
    const formatter = new Intl.NumberFormat(navigator.language || 'en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return formatter.format(convertedAmount);
  };

  const handleSubscriptionSuccess = async (plan, billingCycle) => {
    try {
      if (window.handleSubscriptionSuccess) {
        await window.handleSubscriptionSuccess(plan, billingCycle);
        return true;
      } else {
        throw new Error('Global handleSubscriptionSuccess not available');
      }
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="pricing-page">
      <div className="billing-toggle">
        <button 
          className={`toggle-button ${billingCycle === 'monthly' ? 'active' : ''}`}
          onClick={() => setBillingCycle('monthly')}
        >
          Monthly Plan
        </button>
        <button 
          className={`toggle-button ${billingCycle === 'annual' ? 'active' : ''}`}
          onClick={() => setBillingCycle('annual')}
        >
          Annual Plan
        </button>
        <span className="save-text">Save more yearly!</span>
      </div>

      <div className="pricing-tiers">
        <div className="pricing-card">
          <div className="card-header">
            <h2>Nano</h2>
            <div className="price">
              {formatPrice(billingCycle === 'monthly' ? 249 : 2499)} / {billingCycle === 'monthly' ? 'month' : 'year'}
            </div>
          </div>
          <div className="card-body">
            <PaymentButton 
              plan="Nano" 
              amount={billingCycle === 'monthly' ? 249 : 2499}
              billingCycle={billingCycle}
              onSuccess={handleSubscriptionSuccess}
            />
            <ul className="features-list">
              <li><span className="check-icon">✓</span> 400 pages / month</li>
            </ul>
          </div>
        </div>

        <div className="pricing-card">
          <div className="card-header">
            <h2>Starter</h2>
            <div className="price">
              {formatPrice(billingCycle === 'monthly' ? 399 : 3999)} / {billingCycle === 'monthly' ? 'month' : 'year'}
            </div>
          </div>
          <div className="card-body">
            <PaymentButton 
              plan="Starter" 
              amount={billingCycle === 'monthly' ? 399 : 3999}
              billingCycle={billingCycle}
              onSuccess={handleSubscriptionSuccess}
            />
            <ul className="features-list">
              <li><span className="check-icon">✓</span> 1000 pages / month</li>
            </ul>
          </div>
        </div>

        <div className="pricing-card">
          <div className="card-header">
            <h2>Professional</h2>
            <div className="price">
              {formatPrice(billingCycle === 'monthly' ? 599 : 5999)} / {billingCycle === 'monthly' ? 'month' : 'year'}
            </div>
          </div>
          <div className="card-body">
            <PaymentButton 
              plan="Professional" 
              amount={billingCycle === 'monthly' ? 599 : 5999}
              billingCycle={billingCycle}
              onSuccess={handleSubscriptionSuccess}
            />
            <ul className="features-list">
              <li><span className="check-icon">✓</span> 2500 pages / month</li>
            </ul>
          </div>
        </div>

        <div className="pricing-card">
          <div className="card-header">
            <h2>Business</h2>
            <div className="price">
              {formatPrice(billingCycle === 'monthly' ? 999 : 9999)} / {billingCycle === 'monthly' ? 'month' : 'year'}
            </div>
          </div>
          <div className="card-body">
            <PaymentButton 
              plan="Business" 
              amount={billingCycle === 'monthly' ? 999 : 9999}
              billingCycle={billingCycle}
              onSuccess={handleSubscriptionSuccess}
            />
            <ul className="features-list">
              <li><span className="check-icon">✓</span> 5000 pages / month</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;