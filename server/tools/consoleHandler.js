/// This helper file provides functions for printing to console

function sanitizeLog(input) {
    const stringified = typeof input === 'object' ? JSON.stringify(input) : String(input);
    return stringified.replace(/[\n\r]/g, '_').substring(0, 200);
}

function log(input) {
    sanitizeLog(input);
    console.log(input);
}