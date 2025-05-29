// Alert utility functions for consistent error handling across the app

export const showErrorAlert = (message) => {
  // Clean up the message to make it more user-friendly
  const cleanMessage = message.replace(/Error: /gi, '').trim();
  alert(`❌ Error\n\n${cleanMessage}`);
};

export const showSuccessAlert = (message) => {
  const cleanMessage = message.replace(/Success: /gi, '').trim();
  alert(`✅ Success\n\n${cleanMessage}`);
};

export const showWarningAlert = (message) => {
  const cleanMessage = message.replace(/Warning: /gi, '').trim();
  alert(`⚠️ Warning\n\n${cleanMessage}`);
};

export const showInfoAlert = (message) => {
  const cleanMessage = message.replace(/Info: /gi, '').trim();
  alert(`ℹ️ Information\n\n${cleanMessage}`);
};

// For more complex scenarios where we need custom popup
export const showCustomPopup = (title, message, type = 'error') => {
  const emoji = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
  const cleanTitle = title.trim();
  const cleanMessage = message.trim();
  alert(`${emoji} ${cleanTitle}\n\n${cleanMessage}`);
};

// Enhanced error alert for specific scenarios
export const showCreditErrorAlert = (required, available) => {
  alert(`❌ Insufficient Credits\n\nRequired: ${required} credits\nAvailable: ${available} credits\n\nPlease subscribe to get more credits.`);
};

export const showUploadErrorAlert = (filename, reason) => {
  alert(`❌ Upload Failed\n\nFile: ${filename}\n\nReason: ${reason}\n\nPlease try uploading a valid PDF file.`);
};

export const showProcessingErrorAlert = (step) => {
  alert(`❌ Processing Failed\n\nError occurred during: ${step}\n\nPlease try again or contact support if the issue persists.`);
}; 