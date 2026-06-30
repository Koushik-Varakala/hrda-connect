const id = "40283";
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
    console.log("Initial count:", data.data ? data.data.length : 0);

    if ((!data.data || data.data.length === 0) && /^[0-9]+$/.test(id)) {
        console.log("Entering fallback 1...");
        const prefixes = ["TSMC/FMR/", "APMC/FMR/", "TSMC/P/", "APMC/P/", "TSMC/", "APMC/"];
        for (const prefix of prefixes) {
            const testId = `${prefix}${id}`;
            const preRes = await fetch(
                `https://api.regonlinetsmc.in/tsmc/api/v1/common/getTgmcDocDetails?fmrNo=${encodeURIComponent(testId)}&docName=&gender=&fatherName=`,
                { headers, cache: 'no-store' }
            );
            const preData = await preRes.json();
            if (preData.data && preData.data.length > 0) {
                console.log(`Found with prefix ${prefix}`);
                data = preData;
                break;
            }
        }
    }
    
    console.log("Final data:", JSON.stringify(data));
}
test();
