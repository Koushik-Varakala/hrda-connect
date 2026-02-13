import { NextResponse } from "next/server";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await props.params;
        const response = await fetch(`https://api.regonlinetsmc.in/tsmc/api/v1/common/getDoctorInfoByNameGender?fmrNo=${id}&docName=&gender=&fatherName=`);

        if (!response.ok) {
            throw new Error(`External API responded with ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("TSMC API Proxy Error:", error);
        return NextResponse.json({ message: "Failed to fetch doctor details" }, { status: 500 });
    }
}
