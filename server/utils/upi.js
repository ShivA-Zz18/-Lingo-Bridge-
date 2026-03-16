/**
 * UPI LITE Helper
 * Generates UPI deep-link / Intent URIs for scheme application fees.
 */

/**
 * Generate a UPI payment deep link
 * @param {Object} options
 * @param {string} options.payeeName - Name of the payee
 * @param {string} options.payeeVPA - UPI VPA (e.g., ministry@sbi)
 * @param {number} options.amount - Amount in INR
 * @param {string} options.note - Transaction note
 * @returns {Object} { upiLink, qrData, isZeroFee }
 */
const generateUpiLink = ({ payeeName, payeeVPA, amount, note }) => {
  const isZeroFee = !amount || amount === 0;

  if (isZeroFee) {
    return {
      upiLink: null,
      qrData: null,
      isZeroFee: true,
      message: "✅ No application fee required. This scheme is completely free!",
    };
  }

  const params = new URLSearchParams({
    pa: payeeVPA,
    pn: payeeName,
    am: amount.toFixed(2),
    cu: "INR",
    tn: note || `Lingo-Bridge: ${payeeName} application fee`,
    mode: "04", // UPI LITE mode for offline-friendly
  });

  const upiLink = `upi://pay?${params.toString()}`;

  return {
    upiLink,
    qrData: upiLink, // QR code libraries can encode this directly
    isZeroFee: false,
    amount,
    currency: "INR",
    payeeName,
    message: `₹${amount} application fee via UPI LITE`,
  };
};

module.exports = { generateUpiLink };
