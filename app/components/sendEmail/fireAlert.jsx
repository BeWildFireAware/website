'use client';

import { useState, useEffect, useRef } from 'react';

export default function FireAlert({ fdraData, sendTo }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const hasAutoSent = useRef(false);// Ref to track if auto-send has already occurred for this alert to prevent multiple sends on re-renders

  // Use danger level from database - it's an object with DangerLevelName property
  const dangerLevel = fdraData?.Danger_Level?.DangerLevelName || 'Unknown';
  const date = new Date().toLocaleString();
  // Simple color mapping based on danger level name
  const getColorForLevel = (level) => {
    switch (level) {
      case 'Low': return '#4CAF50';
      case 'Moderate': return '#FF9800';
      case 'High': return '#FF5722';
      case 'Very High': return '#F44336';
      case 'Extreme': return '#9C27B0';
      default: return '#666';
    }
  };

  const currentColor = getColorForLevel(dangerLevel);
  const shouldAutoSend = ['High', 'Very High', 'Extreme'].includes(dangerLevel); // Auto-send alert for high danger levels
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD check for daily sends
  const fdraName = fdraData?.FDRAname || 'unknown';
  const safeKey = `fireAlertSent_${fdraName}_${dangerLevel}_${today}`;// Unique key to track if alert has been sent today for this FDRA and danger level

  useEffect(() => {
    if (!shouldAutoSend) return;// Only auto-send for high danger levels

    // Check localStorage to see if we've already sent an alert for this FDRA and danger level today

    const alreadySentToday = typeof window !== 'undefined' && window.localStorage.getItem(safeKey);// If we've already sent an alert today for this FDRA and danger level, or if we've already auto-sent during this session, do not send again
    if (alreadySentToday || hasAutoSent.current) return;

    hasAutoSent.current = true;
    sendAlert();
  }, [shouldAutoSend, safeKey]);

  const sendAlert = async () => {
    setLoading(true);
    setResult('');

    try {


      const subject = `FIRE ALERT: ${dangerLevel || 'Unknown'} Danger in ${fdraData?.FDRAname || 'Unknown Area'}`;
      //html content for email, can be styled with inline styles
      const html = `
        <div>
          <h1>FIRE DANGER ALERT</h1>

          <div>
            <h2>${fdraData?.FDRAname}</h2>
            <p><strong>Dispatch Area:</strong> ${fdraData?.DispatchArea?.DispatchName}</p>
            <p><strong>Date:</strong> ${date}</p>
          </div>

          <div>
            <h3>DANGER LEVEL: ${(dangerLevel || '').toUpperCase()}</h3>
            <p><strong>Average ERC:</strong> ${fdraData?.AVG_ERC}</p>
            <p><strong>Average BI:</strong> ${fdraData?.AVG_BI}</p>
          </div>

          <div>
            <p>Please check local fire restrictions and be prepared for potential fire activity in this area.</p>
          </div>

          <p>This alert was generated automatically by the BWA Fire Monitoring System.</p>
        </div>
      `;

      //send email via API route 
      const recipient = (sendTo?.trim() || 'delivered@resend.dev');
      const response = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sendTo: [recipient],
          subject,
          html
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(safeKey, 'true');
        }
        setResult(`Alert sent to ${data.recipientCount} verified users!`);
      } else {
        setResult(`Error: ${data.error}`);
      }
    } catch (error) {
      setResult(`Error: ${error.message}`);
    }

    setLoading(false);
  };

  return (
    <div 
      className="fire-alert-card" 
      style={{ borderColor: currentColor }}   // only border color dynamic
    >
      <h3 className="fire-alert-title" style={{ color: currentColor }}>
        Fire Danger Alert System
      </h3>

      <div className="fire-alert-details">
        <p>Current Danger Level: <span className="danger-level" style={{ color: currentColor }}>{dangerLevel}</span></p>
        <p>Average ERC: {fdraData?.AVG_ERC || 'N/A'}</p>
        <p>Average BI: {fdraData?.AVG_BI || 'N/A'}</p>
      </div>

      <button
        className="send-alert-btn"
        onClick={sendAlert}
        disabled={loading}
        style={{ backgroundColor: currentColor }}   // button color from danger level
      >
        {loading ? 'Sending Alert...' : 'Send Fire Alert'}
      </button>

      {result && (
        <div className={`alert-result ${result.startsWith('Alert sent') ? 'success' : 'error'}`}>
          {result}
        </div>
      )}
    </div>
  );
}