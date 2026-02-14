import React, { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface IdCardProps {
    registration: {
        id: number;
        firstName: string;
        lastName: string;
        hrdaId: string | null;
        tgmcId: string;
        phone: string;
        email: string | null;
        address: string | null;
        district: string | null;
        // state: string | null; // Not in schema, defaulting to Telangana
    };
}

export const IdCard = forwardRef<HTMLDivElement, IdCardProps>(({ registration }, ref) => {
    return (
        <div ref={ref} className="w-[600px] h-[375px] bg-white relative overflow-hidden text-slate-900"
            style={{
                border: '16px solid #4CAF50',
                boxSizing: 'border-box',
                fontFamily: 'Arial, sans-serif' // Enforce standard font
            }}>
            {/* Header Section */}
            <div className="absolute top-0 left-0 w-full h-[100px] border-b-4 border-black box-border bg-white z-10">
                {/* Logo */}
                <div className="absolute top-2 left-6">
                    <img src="/hrda_logo.png" alt="logo" className="w-[80px] h-[80px] object-contain" />
                </div>

                {/* Title */}
                <div className="absolute top-4 left-[110px] w-[380px] text-center">
                    <h1 className="text-[54px] font-bold leading-none tracking-tighter text-black" style={{ fontFamily: 'Times New Roman, serif' }}>HRDA</h1>
                    <p className="text-[11px] font-bold text-red-600 tracking-wider uppercase mt-1">HEALTHCARE REFORMS DOCTORS ASSOCIATION</p>
                </div>

                {/* QR Code */}
                <div className="absolute top-2 right-4">
                    <QRCodeSVG
                        value={`https://hrda-connect.vercel.app/verify/${registration.hrdaId}`}
                        size={80}
                        level="H"
                        includeMargin={false}
                    />
                </div>
            </div>

            {/* Details Section - Split into two absolute columns to prevent overlap */}
            {/* Labels Column */}
            <div className="absolute top-[120px] left-[30px] w-[100px] flex flex-col gap-[10px] text-left">
                <span className="font-bold text-[18px] text-black h-[24px]" style={{ fontFamily: 'Times New Roman, serif' }}>Name</span>
                <span className="font-bold text-[18px] text-black h-[24px]" style={{ fontFamily: 'Times New Roman, serif' }}>HRDA ID</span>
                <span className="font-bold text-[18px] text-black h-[24px]" style={{ fontFamily: 'Times New Roman, serif' }}>State</span>
                <span className="font-bold text-[18px] text-black h-[24px]" style={{ fontFamily: 'Times New Roman, serif' }}>Phone no</span>
                <span className="font-bold text-[18px] text-black h-[24px]" style={{ fontFamily: 'Times New Roman, serif' }}>Address</span>
            </div>

            {/* Values Column */}
            <div className="absolute top-[120px] left-[130px] w-[290px] flex flex-col gap-[10px] text-left">
                <span className="text-[18px] font-bold uppercase text-black leading-none h-[24px] truncate">{registration.firstName} {registration.lastName}</span>
                <span className="text-[18px] font-bold text-blue-700 leading-none h-[24px]">{registration.hrdaId || "PENDING"}</span>
                <span className="text-[18px] font-bold text-black leading-none h-[24px]">Telangana</span>
                <span className="text-[18px] font-bold text-black leading-none h-[24px]">{registration.phone}</span>
                <span className="text-[16px] font-medium leading-tight text-black line-clamp-3 -mt-1">
                    {registration.address || registration.district || "N/A"}
                </span>
            </div>

            {/* Photo Section */}
            <div className="absolute top-[150px] right-[30px] w-[130px] h-[150px] border-4 border-[#4CAF50] rounded-2xl overflow-hidden bg-white flex items-center justify-center">
                <div className="w-[100px] h-[100px] bg-black rounded-full flex items-center justify-center -mt-6">
                    <div className="w-[50px] h-[50px] bg-black rounded-full relative top-[30px] scale-[2.5]"></div>
                </div>
            </div>
        </div>
    );
});

IdCard.displayName = "IdCard";
