export function formatGoogleDriveUrl(url: string) {
    if (!url) return url;
    // Extract ID from full drive link
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
        return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
    return url;
}
console.log(formatGoogleDriveUrl("https://drive.google.com/file/d/1lKly5ufmN8Sv1cJEQu0mpLxG-WyQCCuL/view?usp=drive_link"));
