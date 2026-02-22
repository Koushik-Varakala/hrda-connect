import React, { forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { appConfig } from "@/lib/app-config";

interface IdCardProps {
    registration: {
        id: number;
        firstName: string;
        lastName: string;
        hrdaId: string | null;
        phone?: string;
        address?: string | null;
        district?: string | null;
        tgmcId: string | null;
        membershipType: string | null;
        verificationToken: string | null;
    };
    photoUrl?: string | null; // Added local photo preview
}

export const IdCard = forwardRef<HTMLDivElement, IdCardProps>(
    ({ registration, photoUrl }, ref) => {
        const fullName =
            `${registration.firstName || ""} ${registration.lastName || ""}`.trim() ||
            "N/A";

        const hrdaId = registration.hrdaId || "PENDING";
        const phone = registration.phone || "N/A";
        const district = registration.district || "N/A";

        const verifyUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://hrda-connect.in'}/verify/${registration.verificationToken || 'pending'}`;

        /* ---------- Dynamic font helpers ---------- */
        const getNameSize = (text: string) => {
            if (text.length > 28) return "18px";
            if (text.length > 22) return "20px";
            if (text.length > 16) return "22px";
            return "24px";
        };

        const getIdSize = (text: string) => {
            if (text.length > 18) return "18px";
            return "20px";
        };

        const cardStyle = {
            width: "600px",
            height: "375px",
            backgroundColor: "white",
            border: "18px solid hsl(215, 90%, 45%)", // Website's primary blue theme
            fontFamily: '"Times New Roman", Times, serif',
            color: "black",
            boxSizing: "border-box" as const,
            overflow: "hidden",
            position: "relative" as const,
        };

        return (
            <div ref={ref} className="flex flex-col items-center bg-transparent">

                {/* ================= SINGLE ID CARD ================= */}
                <div style={cardStyle} className="p-5 flex flex-col justify-between shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-2 relative z-10 w-full">
                        <img
                            src="/hrda_id_header.png"
                            alt="HRDA Header"
                            className="h-[70px] object-contain shrink-0"
                            onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = "none";
                            }}
                        />
                        <div className="bg-white p-1 rounded-sm shadow-sm shrink-0 border border-slate-100 ml-2">
                            <QRCodeSVG value={verifyUrl} size={80} level="H" includeMargin={false} />
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex gap-4 items-start w-full mt-2">
                        {/* Profile Photo Area */}
                        <div className="w-[120px] h-[155px] shrink-0 border-2 border-slate-300 flex items-center justify-center bg-slate-50 overflow-hidden relative top-1">
                            {photoUrl ? (
                                <img src={photoUrl} alt="Member Photo" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-slate-400 text-sm text-center px-2">Attach Photo</span>
                            )}
                        </div>

                        {/* Details Area */}
                        <div className="flex flex-col gap-[14px] flex-1 min-w-0">
                            <Row label="Name">
                                <div
                                    className="font-bold whitespace-nowrap overflow-hidden text-ellipsis text-slate-900"
                                    style={{ fontSize: getNameSize(fullName) }}
                                    title={fullName}
                                >
                                    {fullName}
                                </div>
                            </Row>

                            <Row label="HRDA ID">
                                <div
                                    className="font-bold whitespace-nowrap overflow-hidden text-ellipsis text-slate-800"
                                    style={{ fontSize: getIdSize(hrdaId) }}
                                    title={hrdaId}
                                >
                                    {hrdaId}
                                </div>
                            </Row>

                            <Row label="P.no">
                                <div className="font-bold text-[20px] text-slate-800">{phone}</div>
                            </Row>

                            <Row label="State">
                                <div className="font-bold text-[20px] text-slate-800">{appConfig.stateName}</div>
                            </Row>

                            <Row label="District">
                                <div className="font-bold text-[20px] text-slate-800">{district}</div>
                            </Row>
                        </div>
                    </div>
                </div>

            </div>
        );
    }
);

IdCard.displayName = "IdCard";

/* ---------- Row Component ---------- */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-start leading-none">
            <div className="w-[105px] text-[18px] font-bold text-slate-600 uppercase">
                {label}
            </div>
            <div className="px-1 text-[18px] font-bold text-slate-600 mr-2">:</div>
            <div className="flex-1 min-w-0 flex items-center">{children}</div>
        </div>
    );
}
