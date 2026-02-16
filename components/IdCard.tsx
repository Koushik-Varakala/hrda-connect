import React, { forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";

interface IdCardProps {
    registration: {
        id: number;
        firstName: string;
        lastName: string;
        hrdaId: string | null;
        phone?: string;
        address?: string | null;
        district?: string | null;
    };
}

export const IdCard = forwardRef<HTMLDivElement, IdCardProps>(
    ({ registration }, ref) => {
        const fullName =
            `${registration.firstName || ""} ${registration.lastName || ""}`.trim() ||
            "N/A";

        const hrdaId = registration.hrdaId || "PENDING";
        const phone = registration.phone || "N/A";
        const address =
            registration.address || registration.district || "N/A";

        const verifyUrl = `https://hrda-india.org/verify/${registration.hrdaId || registration.id
            }`;

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

        return (
            <div
                ref={ref}
                className="w-[600px] h-[375px] bg-white p-5 box-border text-black"
                style={{
                    border: "18px solid #558B58",
                    fontFamily: '"Times New Roman", Times, serif',
                    overflow: "hidden",
                }}
            >
                {/* ================= Header ================= */}
                <div className="flex justify-between items-start mb-4">
                    <img
                        src="/hrda_id_header.png"
                        alt="HRDA Header"
                        className="h-[80px] object-contain"
                        onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                    />

                    <QRCodeSVG value={verifyUrl} size={90} level="H" />
                </div>

                {/* ================= Body ================= */}
                <div className="flex flex-col gap-3 mt-2">

                    {/* Name */}
                    <Row label="Name">
                        <div
                            className="font-bold whitespace-nowrap overflow-hidden text-ellipsis"
                            style={{ fontSize: getNameSize(fullName) }}
                            title={fullName}
                        >
                            {fullName}
                        </div>
                    </Row>

                    {/* HRDA ID */}
                    <Row label="HRDA ID">
                        <div
                            className="font-bold whitespace-nowrap overflow-hidden text-ellipsis"
                            style={{ fontSize: getIdSize(hrdaId) }}
                            title={hrdaId}
                        >
                            {hrdaId}
                        </div>
                    </Row>

                    {/* State */}
                    <Row label="State">
                        <div className="font-bold text-[20px]">Telangana</div>
                    </Row>

                    {/* Phone */}
                    <Row label="Phone no">
                        <div className="font-bold text-[20px] break-words">{phone}</div>
                    </Row>

                    {/* Address */}
                    <Row label="Address">
                        <div
                            className="font-bold text-[19px]"
                            style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                wordBreak: "break-word",
                            }}
                            title={address}
                        >
                            {address}
                        </div>
                    </Row>

                </div>
            </div>
        );
    }
);

IdCard.displayName = "IdCard";

/* ---------- Row Component ---------- */

function Row({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-start">
            <div className="w-[160px] text-[20px] font-semibold leading-tight">
                {label}:
            </div>
            <div className="flex-1 leading-tight">{children}</div>
        </div>
    );
}
