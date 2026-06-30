import { NextResponse } from "next/server";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await props.params;

        const { searchParams } = new URL(request.url);
        const name = searchParams.get('name') || '';

        const headers = {
            'Origin': 'https://regonlinetsmc.in',
            'Referer': 'https://regonlinetsmc.in/',
            'x-client-token': 'VEdNQ0RvY1NlYXJjaC5ZdFUrOTVxWGd5MVkzZ3d6VkVsWityTlJjbFNXbE42ZklrdnhJV0U5elY4PQ==',
            'Accept': 'application/json, text/plain, */*',
        };

        let response = await fetch(
            `https://api.regonlinetsmc.in/tsmc/api/v1/common/getTgmcDocDetails?fmrNo=${encodeURIComponent(id)}&docName=&gender=&fatherName=`,
            { headers, cache: 'no-store' }
        );

        let data = await response.json();

        // If the ID is purely numeric, TSMC has collisions (e.g. 40283 is a legacy doctor, TSMC/FMR/40283 is a newer doctor)
        // We must fetch ALL prefix variations and combine them, so the frontend can check if ANY of them match the name!
        if (/^[0-9]+$/.test(id)) {
            const prefixes = ["TSMC/FMR/", "APMC/FMR/", "TSMC/P/", "APMC/P/", "TSMC/", "APMC/"];
            for (const prefix of prefixes) {
                const testId = `${prefix}${id}`;
                const preRes = await fetch(
                    `https://api.regonlinetsmc.in/tsmc/api/v1/common/getTgmcDocDetails?fmrNo=${encodeURIComponent(testId)}&docName=&gender=&fatherName=`,
                    { headers, cache: 'no-store' }
                );
                const preData = await preRes.json();
                if (preData.data && Array.isArray(preData.data)) {
                    data.data = (data.data || []).concat(preData.data);
                }
            }
        }

        // Fallback: If no results found yet, try searching by name and filtering locally
        // Note: TSMC API requires 'gender' for name searches. Since we don't know the gender, we search both.
        if ((!data.data || data.data.length === 0) && name) {
            let combinedData: any[] = [];
            for (const gender of ['M', 'F']) {
                const nameRes = await fetch(
                    `https://api.regonlinetsmc.in/tsmc/api/v1/common/getTgmcDocDetails?fmrNo=&docName=${encodeURIComponent(name)}&gender=${gender}&fatherName=`,
                    { headers, cache: 'no-store' }
                );
                const nameData = await nameRes.json();
                if (nameData.data && Array.isArray(nameData.data)) {
                    combinedData = combinedData.concat(nameData.data);
                }
            }

            if (combinedData.length > 0) {
                // Filter the name-search results to only include those matching the requested ID
                // Remove prefixes (e.g. APMC/FMR/, TSMC/) for a robust match
                const cleanRequestedId = id.replace(/[^0-9]/g, '');
                const filteredData = combinedData.filter((doc: any) => {
                    const cleanDocId = (doc.original_fmr_no || "").replace(/[^0-9]/g, '');
                    return cleanDocId === cleanRequestedId || (doc.original_fmr_no || "").includes(id);
                });
                
                data.data = filteredData;
                // Update success message if we found a match via fallback
                if (filteredData.length > 0) {
                    data.success = true;
                    data.message = "getDoctorInfoByNameGender  Registered";
                }
            }
        }
        return NextResponse.json(data);
    } catch (error) {
        console.error("TSMC API Proxy Error:", error);
        return NextResponse.json({ message: "Failed to fetch doctor details" }, { status: 500 });
    }
}