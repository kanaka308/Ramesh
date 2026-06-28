export const generateWhatsAppLink = (phone: string, message: string): string => {
  // Strip non-numeric characters from the phone number
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Encode the message for URI parameters (ensuring single quote character is correctly represented if required)
  const encodedMessage = encodeURIComponent(message)
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29")
    .replace(/\*/g, "%2A")
    .replace(/!/g, "%21");
    
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
};
