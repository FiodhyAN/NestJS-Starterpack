export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T | null;
  error: T | null;
}

export function responseCreator<T>(
  status: number,
  message: string,
  data: T | null = null,
  error: T | null = null,
): ApiResponse<T> {
  return {
    status,
    message,
    data,
    error,
  };
}

export function convertTimezone(date: Date) {
  const expirationDate = new Date(date).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
    timeZone: 'Asia/Jakarta',
  });
  const timezoneName = 'Western Indonesia Time';
  const formattedDate =
    expirationDate.replace(/, /g, ' ').replace(/\./g, ':') +
    ` (${timezoneName})`;

  return formattedDate;
}
