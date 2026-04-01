import { NextResponse } from "next/server";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await props.params;

        const response = await fetch(
            `https://api.regonlinetsmc.in/tsmc/api/v1/common/getTgmcDocDetails?fmrNo=${id}&docName=''&gender=''&fatherName=''`,
            {
                headers: {
                    'Origin': 'https://regonlinetsmc.in',
                    'Referer': 'https://regonlinetsmc.in/',
                    'x-client-token': 'VEdNQ0RvY1NlYXJjaC5ZdFUrOTVxWGd5MVkzZ3d6VkVsWityTlJjbFNXbE42ZklrdnhJV0U5elY4PQ==',
                    'Accept': 'application/json, text/plain, */*',
                },
                cache: 'no-store'
            }
        );

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("TSMC API Proxy Error:", error);
        return NextResponse.json({ message: "Failed to fetch doctor details" }, { status: 500 });
    }
}