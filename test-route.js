const id = "TSMC/FMR/32673";
const name = "Koushik";

async function test() {
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
    console.log("Initial fetch results count:", data.data ? data.data.length : 0);

    if ((!data.data || data.data.length === 0) && name) {
        console.log("Entering fallback...");
        let combinedData = [];
        for (const gender of ['M', 'F']) {
            console.log("Fetching for gender", gender);
            const nameRes = await fetch(
                `https://api.regonlinetsmc.in/tsmc/api/v1/common/getTgmcDocDetails?fmrNo=&docName=${encodeURIComponent(name)}&gender=${gender}&fatherName=`,
                { headers, cache: 'no-store' }
            );
            const nameData = await nameRes.json();
            console.log(`Gender ${gender} results count:`, nameData.data ? nameData.data.length : 0);
            if (nameData.data && Array.isArray(nameData.data)) {
                combinedData = combinedData.concat(nameData.data);
            }
        }
        
        console.log("Total combined results:", combinedData.length);
        const cleanRequestedId = id.replace(/[^0-9]/g, '');
        const filteredData = combinedData.filter((doc) => {
            const cleanDocId = (doc.original_fmr_no || "").replace(/[^0-9]/g, '');
            return cleanDocId === cleanRequestedId || (doc.original_fmr_no || "").includes(id);
        });
        console.log("Filtered results count:", filteredData.length);
        if (filteredData.length > 0) {
            console.log("Matched doctor:", filteredData[0].fullname, filteredData[0].original_fmr_no);
        }
    }
}
test();
