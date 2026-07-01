export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num).replace('TZS', 'TZS ');
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-TZ', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-TZ', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
