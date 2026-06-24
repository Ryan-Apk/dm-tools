/// This helper file provides functions for printing to console

function sanitizeLog(input) {
    const stringified = typeof input === 'object' ? JSON.stringify(input) : String(input);
    return stringified.replace(/[\n\r]/g, '_').substring(0, 200);
}

// takes an input, sanitises it and prints it to console
export function log(input) {
    sanitizeLog(input);
    console.log(input);
}

// takes an input, sanitises it and prints it to console in red
export function logError(input) {
    sanitizeLog(input);
    console.error(input);
}

// takes an input, sanitises it and prints it to console in yellow
export function logWarn(input) {
    sanitizeLog(input);
    console.warn(input);
}