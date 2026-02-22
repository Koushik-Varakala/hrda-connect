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
        const stateCouncilId = registration.tgmcId || "N/A";
        const phone = registration.phone || "N/A";
        const email = (registration as any).email || "N/A";
        const district = registration.district || "N/A";
        const address = registration.address || registration.district || "N/A";

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
            border: "18px solid #558B58",
            fontFamily: '"Times New Roman", Times, serif',
            color: "black",
            boxSizing: "border-box" as const,
            overflow: "hidden",
            position: "relative" as const,
        };

        return (
            <div ref={ref} className="flex flex-col gap-8 print:gap-8 items-center bg-transparent">

                {/* ================= FRONT CARD ================= */}
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
                            <QRCodeSVG value={verifyUrl} size={85} level="H" includeMargin={false} />
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex gap-4 items-start w-full">
                        {/* Profile Photo Area */}
                        <div className="w-[120px] h-[150px] shrink-0 border-2 border-slate-300 flex items-center justify-center bg-slate-50 overflow-hidden mt-1">
                            {photoUrl ? (
                                <img src={photoUrl} alt="Member Photo" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-slate-400 text-sm text-center px-2">Attach Photo</span>
                            )}
                        </div>

                        {/* Details Area */}
                        <div className="flex flex-col gap-3 flex-1 min-w-0">
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

                            <Row label={appConfig.medicalCouncilId}>
                                <div className="font-bold text-[20px] text-slate-800">{stateCouncilId}</div>
                            </Row>

                            <Row label="State">
                                <div className="font-bold text-[20px] text-slate-800">{appConfig.stateName}</div>
                            </Row>

                            {registration.membershipType && (
                                <div className="inline-block px-3 py-1 bg-green-100 text-green-800 font-bold text-sm uppercase rounded shadow-sm self-start mt-1 border border-green-200">
                                    {registration.membershipType} Member
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ================= BACK CARD ================= */}
                <div style={cardStyle} className="p-6 flex flex-col shadow-sm">
                    {/* Organization Banner */}
                    <div className="w-full text-center border-b-2 border-green-800 pb-2 mb-4 bg-green-50/50 rounded-sm">
                        <h2 className="text-xl font-bold text-green-900 leading-tight uppercase relative top-1">
                            {appConfig.organizationName}
                        </h2>
                    </div>

                    {/* Back Body Details */}
                    <div className="flex flex-col gap-3 flex-1 w-full text-slate-800">
                        <BackRow label="Mobile">
                            <span className="font-bold text-[18px]">{phone}</span>
                        </BackRow>

                        <BackRow label="Email">
                            <span className="font-bold text-[18px] truncate block w-full" title={email}>{email}</span>
                        </BackRow>

                        <BackRow label="District">
                            <span className="font-bold text-[18px]">{district}</span>
                        </BackRow>

                        <div className="flex flex-col mt-1">
                            <div className="w-full text-[17px] font-semibold text-slate-600 uppercase mb-1">
                                Registered Address
                            </div>
                            <div
                                className="font-bold text-[18px] leading-tight"
                                style={{
                                    display: "-webkit-box",
                                    WebkitLineClamp: 4,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    wordBreak: "break-word",
                                }}
                                title={address}
                            >
                                {address}
                            </div>
                        </div>
                    </div>

                    {/* Footer Warning */}
                    <div className="mt-auto w-full text-center border-t-2 border-slate-200 pt-3">
                        <p className="text-[14px] font-medium text-slate-600 leading-tight">
                            If found, please return to the issuing authority. <br />
                            <span className="text-black font-bold">Contact: {appConfig.phone}</span>
                        </p>
                    </div>
                </div>

            </div>
        );
    }
);

IdCard.displayName = "IdCard";

/* ---------- Front Row Component ---------- */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-start">
            <div className="w-[120px] text-[18px] font-semibold text-slate-600 uppercase pt-[2px]">
                {label}
            </div>
            <div className="px-2 text-[18px] font-bold text-slate-400 pt-[2px]">:</div>
            <div className="flex-1 min-w-0">{children}</div>
        </div>
    );
}

/* ---------- Back Row Component ---------- */
function BackRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-start">
            <div className="w-[100px] text-[17px] font-semibold text-slate-600 uppercase pt-[2px]">
                {label}
            </div>
            <div className="px-2 text-[18px] font-bold text-slate-400 pt-[2px]">-</div>
            <div className="flex-1 min-w-0">{children}</div>
        </div>
    );
}
