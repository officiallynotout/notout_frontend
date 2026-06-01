import { format, parseISO } from 'date-fns';

export const formatDate = (dateStr: string): string => {
  try {
    return format(parseISO(dateStr), 'EEE, dd MMM yyyy');
  } catch {
    return dateStr;
  }
};

export const formatTime = (timeStr: string): string => {
  try {
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour   = h % 12 === 0 ? 12 : h % 12;
    return `${hour}:${String(m).padStart(2, '0')} ${period}`;
  } catch {
    return timeStr;
  }
};

export const formatCurrency = (amount: number): string =>
  `₹${amount.toLocaleString('en-IN')}`;

export const maskPhone = (phone: string): string => {
  if (phone.length < 4) return phone;
  return `${phone.slice(0, -4).replace(/\d/g, '*')}${phone.slice(-4)}`;
};
