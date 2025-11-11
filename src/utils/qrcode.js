import QRCode from 'qrcode';

export const generateQRCode = async (data) => {
  try {
    const qrDataURL = await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

export const generateRegistrationURL = (eventId) => {
  const baseURL = window.location.origin;
  const basePath = import.meta.env.BASE_URL || '/';
  return `${baseURL}${basePath}${eventId}/register`;
};
