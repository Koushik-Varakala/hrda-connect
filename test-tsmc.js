const prefixes = [
    "", 
    "TSMC/FMR/", "TSMC/", "TSMC/S/", "TSMC/P/",
    "APMC/FMR/", "APMC/", "APMC/S/", "APMC/P/",
    "HYD/", "AP/", "TG/", "TS/"
];

async function check() {
    for (const prefix of prefixes) {
        const fmrNo = `${prefix}36901`;
        const res = await fetch(`https://api.regonlinetsmc.in/tsmc/api/v1/common/getTgmcDocDetails?fmrNo=${fmrNo}`, {
            headers: {
                'Origin': 'https://regonlinetsmc.in',
                'Referer': 'https://regonlinetsmc.in/',
                'x-client-token': 'VEdNQ0RvY1NlYXJjaC5ZdFUrOTVxWGd5MVkzZ3d6VkVsWityTlJjbFNXbE42ZklrdnhJV0U5elY4PQ==',
            }
        });
        const data = await res.json();
        if (data && data.data && data.data.length > 0) {
            console.log(`Match found for: ${fmrNo}`);
            console.log(data.data[0].fullname);
        }
    }
}
check();
