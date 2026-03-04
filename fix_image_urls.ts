export function formatDriveUrls(url: string) {
    if (!url) return url;
    if (url.includes('drive.google.com/file/d/')) {
        const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (idMatch && idMatch[1]) {
            return `https://drive.google.com/uc?export=view&id=${idMatch[1]}`;
        }
    }
    return url;
}
console.log(formatDriveUrls("https://drive.google.com/file/d/1lKly5ufmN8Sv1cJEQu0mpLxG-WyQCCuL/view?usp=drive_link"));
