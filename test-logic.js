const doc = { fullname: "MAMIDI KOUSHIK KUMAR " };
const item = { firstName: "Koushik", lastName: "Koushik" };

const fName = (item.firstName || "").toLowerCase();
const lName = (item.lastName || "").toLowerCase();
const councilName = (doc.fullname || "").toLowerCase();

const matchesFirst = fName ? councilName.includes(fName) : false;
const matchesLast = lName ? councilName.includes(lName) : false;

console.log("matchesFirst:", matchesFirst);
console.log("matchesLast:", matchesLast);
console.log("Final:", matchesFirst || matchesLast);
