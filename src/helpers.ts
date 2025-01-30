const BASE_URL = 'https://api.trainerize.com';

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${BASE_URL}/${path}`, options);

    if (!response.ok) {
        const error = new Error(response.statusText) as ErrorWithStatus;
        error.status = response.status;
        throw error;
    }

    const contentType = response.headers.get('Content-Type');

    if (contentType && contentType.includes('application/json')) {
        // Handle as JSON
        return response.json() as T;
    } else {
        // Handle as Blob
        return response as T;
    }
}

export function last7Days(offset = 0) {
    const result = [];
    const tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    for (let i = offset; i < 7 + offset; i++) {
        const d = new Date(Date.now() - tzoffset);
        d.setDate(d.getDate() - i);
        result.push(d.toISOString().split('T')[0]);
    }

    return result.toReversed();
}

export function formatDate(dateStr: string, options: Intl.DateTimeFormatOptions = {}) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        ...options,
        timeZone: options.timeZone || 'UTC'
    });
}

export function getCookie(name: string) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return (parts.pop() as string).split(';').shift();
    }
}
