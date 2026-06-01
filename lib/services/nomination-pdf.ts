import { jsPDF } from "jspdf";
import { Nomination } from "@shared/schema";

export async function generateNominationPDF(nom: Nomination): Promise<Buffer> {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentW = pageW - margin * 2;
    let y = 20;

    // ---- Helper Functions ----
    const centerText = (text: string, fontSize: number, bold = false) => {
        doc.setFontSize(fontSize);
        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.text(text, pageW / 2, y, { align: "center" });
        y += fontSize * 0.5;
    };

    const addField = (label: string, value: string) => {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(`${label}:`, margin, y);
        doc.setFont("helvetica", "normal");
        doc.text(value || "N/A", margin + 50, y);
        y += 6;
    };

    const drawLine = () => {
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y, pageW - margin, y);
        y += 5;
    };

    // ---- Header ----
    centerText("Healthcare Reforms Doctors Association (HRDA)", 14, true);
    y += 2;
    centerText("Telangana State", 11, false);
    y += 2;
    centerText("DISTRICT ELECTIONS 2026 - NOMINATION APPLICATION", 12, true);
    y += 3;
    drawLine();

    // ---- Photo (if available) ----
    if (nom.photoUrl) {
        try {
            const photoRes = await fetch(nom.photoUrl);
            const photoBuffer = await photoRes.arrayBuffer();
            const base64 = Buffer.from(photoBuffer).toString("base64");
            const ext = nom.photoUrl.includes(".png") ? "PNG" : "JPEG";
            doc.addImage(`data:image/${ext.toLowerCase()};base64,${base64}`, ext, pageW - margin - 30, y - 5, 28, 35);
        } catch (e) {
            console.error("[PDF] Failed to embed photo:", e);
        }
    }

    // ---- Personal Details ----
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("1. PERSONAL DETAILS", margin, y);
    y += 8;

    addField("Full Name", nom.fullName);
    addField("HRDA Membership ID", nom.hrdaMembershipId);
    addField("TGMC/TSMC Number", nom.tgmcNumber);
    addField("Mobile", nom.mobile);
    addField("Email", nom.email);
    y += 3;
    drawLine();

    // ---- Election Details ----
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("2. ELECTION DETAILS", margin, y);
    y += 8;

    addField("District / Zone", nom.district);
    addField("Post Applied For", nom.postApplied);
    addField("Nomination Fee", `Rs. ${nom.nominationFee}/-`);
    y += 3;
    drawLine();

    // ---- Payment Details ----
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("3. PAYMENT DETAILS", margin, y);
    y += 8;

    addField("Payment Status", nom.paymentStatus === "success" ? "PAID" : nom.paymentStatus.toUpperCase());
    addField("Payment Reference", nom.razorpayPaymentId || "N/A");
    addField("Order ID", nom.razorpayOrderId || "N/A");
    addField("Date", nom.createdAt ? new Date(nom.createdAt).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" }) : "N/A");
    y += 3;
    drawLine();

    // ---- Declaration ----
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("4. CANDIDATE DECLARATION & UNDERTAKING", margin, y);
    y += 7;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const declarationText = 
        "I, the undersigned candidate, hereby submit my nomination for election to the post applied for " +
        "in the Healthcare Reforms Doctors Association (HRDA) District Panel / Hyderabad City Zonal Branch " +
        "Committee for the term 2026-2028. I solemnly declare that all information furnished by me is true " +
        "and correct. I agree to abide by the HRDA Constitution, Election Rules, By-laws, and Code of Conduct. " +
        "I understand that any false statement may result in rejection of my nomination, cancellation of " +
        "candidature, or disciplinary action under HRDA Rules.";

    const lines = doc.splitTextToSize(declarationText, contentW);
    doc.text(lines, margin, y);
    y += lines.length * 4 + 5;

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("[✓] I Agree to the above Declaration and Undertaking by the HRDA State Panel", margin, y);
    y += 10;

    // ---- Signature (if available) ----
    if (nom.signatureUrl) {
        try {
            const sigRes = await fetch(nom.signatureUrl);
            const sigBuffer = await sigRes.arrayBuffer();
            const base64 = Buffer.from(sigBuffer).toString("base64");
            const ext = nom.signatureUrl.includes(".png") ? "PNG" : "JPEG";

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text("Signature of Candidate:", margin, y);
            y += 3;
            doc.addImage(`data:image/${ext.toLowerCase()};base64,${base64}`, ext, margin, y, 50, 18);
            y += 22;
        } catch (e) {
            console.error("[PDF] Failed to embed signature:", e);
        }
    }

    // ---- Candidate Name ----
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`Name: ${nom.fullName}`, margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${nom.createdAt ? new Date(nom.createdAt).toLocaleDateString("en-IN") : "N/A"}`, margin, y);

    // ---- Footer ----
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setFontSize(8);
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, footerY - 3, pageW - margin, footerY - 3);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text("This is a system-generated document from hrda-india.org", pageW / 2, footerY, { align: "center" });
    doc.text(`Generated on: ${new Date().toLocaleString("en-IN")}`, pageW / 2, footerY + 4, { align: "center" });

    // Return as Buffer
    return Buffer.from(doc.output("arraybuffer"));
}
