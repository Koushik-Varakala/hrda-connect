
import { Instagram } from "lucide-react";

export function FloatingInstagram() {
    return (
        <a
            href="https://www.instagram.com/hrda4people/"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] rounded-full shadow-lg hover:scale-110 transition-transform duration-300 group"
            title="Follow us on Instagram!"
            aria-label="Follow us on Instagram"
        >
            <Instagram className="w-8 h-8 text-white" />
            <span className="absolute right-full mr-3 bg-white text-slate-900 px-3 py-1 rounded shadow-md text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Follow us!
            </span>
        </a>
    );
}
