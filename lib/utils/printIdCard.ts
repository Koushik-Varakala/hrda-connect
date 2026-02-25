export interface PrintOptions {
    mode?: 'popup' | 'iframe';
    preset?: 'card' | 'A4';
    timeoutMs?: number;
    title?: string;
}

export interface PrintResult {
    status: 'printed' | 'failed' | 'timed_out';
    details?: string;
}

function emitTelemetry(event: string, data?: Record<string, any>) {
    // In production, dispatch this to your analytics provider (PostHog, Vercel, Datadog).
    console.log(`[Print Telemetry] ${event}`, data || {});
}

async function waitForFontsAndImages(doc: Document, timeoutMs: number): Promise<boolean> {
    const startTime = Date.now();

    // Promisify font readiness
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();

    // Promisify all images within the document
    const images = Array.from(doc.getElementsByTagName("img"));
    const imagePromises = images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error(`Failed to load image: ${img.src}`));
        });
    });

    const timeoutPromise = new Promise<boolean>((resolve) => {
        setTimeout(() => resolve(false), timeoutMs);
    });

    try {
        const result = await Promise.race([
            Promise.all([fontsReady, ...imagePromises]).then(() => true),
            timeoutPromise
        ]);

        emitTelemetry('assets_loaded', { durationMs: Date.now() - startTime, success: result });
        return result;
    } catch (e: any) {
        emitTelemetry('assets_load_failed', { error: e.message || 'Unknown image error' });
        return false;
    }
}

function getCriticalCss(preset: 'card' | 'A4'): string {
    // Base CSS required for clean rendering
    let css = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
            box-sizing: border-box;
            font-family: 'Inter', system-ui, sans-serif;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        
        html, body {
            margin: 0;
            padding: 0;
            background: white;
            width: 100%;
            height: 100%;
        }

        /* Container explicitly used to handle deterministic centering */
        #print-wrapper {
            position: absolute;
            top: 2rem;
            left: 50%;
            transform: translateX(-50%) scale(1);
            transform-origin: top center;
        }

        /* Responsive Mobile Native Scaling Hooks (Internal Iframe/Popup Only) */
        @media print and (max-width: 650px) {
            #print-wrapper { transform: translateX(-50%) scale(0.7) !important; }
        }
        @media print and (max-width: 450px) {
            #print-wrapper { transform: translateX(-50%) scale(0.6) !important; }
        }
        @media print and (max-width: 380px) {
            #print-wrapper { transform: translateX(-50%) scale(0.53) !important; }
        }
    `;

    // Presets allow enforcing hardware paper constraints if required
    if (preset === 'card') {
        css += `
            @page {
                margin: 0;
                /* Optional explicit size for strict hardware printers: size: 86mm 54mm; */
            }
        `;
    } else {
        css += `
            @page {
                size: A4 portrait;
                margin: 0;
            }
        `;
    }

    return css;
}

function createHiddenIframeDocument(): Window | null {
    let iframe = document.getElementById("print-iframe") as HTMLIFrameElement;
    if (iframe) {
        document.body.removeChild(iframe);
    }

    iframe = document.createElement("iframe");
    iframe.id = "print-iframe";
    iframe.style.position = "fixed";
    iframe.style.top = "-9999px";
    iframe.style.left = "-9999px";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    return iframe.contentWindow;
}

export async function printIdCard(
    cardNode: HTMLElement,
    options: PrintOptions = {}
): Promise<PrintResult> {
    const {
        mode = 'iframe',
        preset = 'A4',
        timeoutMs = 5000,
        title = "HRDA ID Card"
    } = options;

    emitTelemetry('print_initiated', { mode, preset });

    if (!cardNode) {
        emitTelemetry('print_failed', { reason: 'No card node provided' });
        return { status: 'failed', details: 'No card node provided' };
    }

    try {
        // Create an exact replica of the requested DOM node.
        const clone = cardNode.cloneNode(true) as HTMLElement;

        // Initialize print context
        const printWindow = mode === 'popup'
            ? window.open('', '_blank', 'noopener,noreferrer,width=800,height=600')
            : createHiddenIframeDocument();

        if (!printWindow) {
            throw new Error(`Failed to create print context (mode: ${mode})`);
        }

        const printDoc = printWindow.document;

        // Inject empty structural shell
        printDoc.open();
        printDoc.write(`<!doctype html><html><head><title>${title}</title></head><body></body></html>`);
        printDoc.close();

        // Inject critical CSS
        const styleEl = printDoc.createElement("style");
        styleEl.textContent = getCriticalCss(preset);
        printDoc.head.appendChild(styleEl);

        // Inject Tailwind classes if explicitly needed matching original environment
        // Assuming your application injects a global stylesheet, you might need to copy over stylesheet links
        const links = Array.from(document.querySelectorAll("link[rel='stylesheet']"));
        links.forEach((link) => {
            const newLink = printDoc.createElement("link");
            newLink.rel = "stylesheet";
            newLink.href = (link as HTMLLinkElement).href;
            printDoc.head.appendChild(newLink);
        });

        // Assemble wrapper and inject clone
        const wrapper = printDoc.createElement('div');
        wrapper.id = 'print-wrapper';
        wrapper.appendChild(clone);
        printDoc.body.appendChild(wrapper);

        // Await readiness
        const loaded = await waitForFontsAndImages(printDoc, timeoutMs);
        if (!loaded) {
            emitTelemetry('print_timeout_warning', { timeoutMs });
            console.warn(`[Print Util] Assets did not fully load within ${timeoutMs}ms.`);
        }

        // Focus and initiate native print dialog
        printWindow.focus();

        // Execute print
        printWindow.print();

        emitTelemetry('print_success');

        // Optional Cleanup (Leave popup open if user wants to keep examining, kill iframe immediately)
        if (mode === 'iframe') {
            // Slight delay ensures the print dialog has been sent to the OS stack
            // before destroying the iframe layout
            setTimeout(() => {
                const iframe = document.getElementById("print-iframe");
                if (iframe && document.body.contains(iframe)) {
                    document.body.removeChild(iframe);
                }
            }, 1000);
        }

        return { status: 'printed' };
    } catch (e: any) {
        emitTelemetry('print_failed', { error: e.message || 'Unknown error' });
        console.error("[Print Util] Error printing:", e);
        return { status: 'failed', details: e.message };
    }
}
