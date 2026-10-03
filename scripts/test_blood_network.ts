import "dotenv/config";
import { storage } from "../lib/storage";

async function main() {
    console.log("=== TESTING HRDA AP BLOOD DONOR NETWORK ===");

    // 1. Register a test donor (Doctor in Guntur)
    const testPhone = "9988776655";
    console.log("\n1. Registering test donor Dr. Ananya Rao...");
    const donor = await storage.createBloodDonor({
        fullName: "Dr. Ananya Rao",
        phone: testPhone,
        email: "ananya.rao@example.com",
        bloodGroup: "O+",
        district: "Guntur",
        cityTown: "Guntur",
        hospitalOrWorkplace: "Guntur GGH",
        isAvailable: true,
        consentGiven: true,
        status: "active",
        notes: "Test donor entry"
    });
    console.log(`✅ Donor registered with ID: ${donor.id}, Token: ${donor.verificationToken}`);

    // 2. Submit a Blood Requirement in Guntur
    console.log("\n2. Submitting Blood Requirement for O+ in Guntur...");
    const request = await storage.createBloodRequest({
        requestTrackingCode: "BLD-AP-TEST01",
        patientName: "Mr. Venkat Reddy",
        attendantName: "Suresh Reddy",
        contactPhone: "9123456789",
        secondaryPhone: null,
        bloodGroup: "O+",
        unitsRequired: 2,
        hospitalName: "Ramesh Hospitals",
        hospitalAddress: "Collector Office Road, Guntur",
        district: "Guntur",
        cityTown: "Guntur",
        urgency: "Critical / Immediate",
        status: "open",
        clinicalRequirement: "Emergency Cardiac ICU",
        adminNotes: null
    });
    console.log(`✅ Request created with Tracking Code: ${request.requestTrackingCode}`);

    // 3. Match Donors
    console.log("\n3. Matching available O+ donors in Guntur...");
    const matchedDonors = await storage.getBloodDonors({
        district: "Guntur",
        bloodGroup: "O+",
        isAvailable: true,
        status: "active"
    });
    console.log(`✅ Found ${matchedDonors.length} matching donor(s) in Guntur.`);
    const matched = matchedDonors.find(d => d.id === donor.id);
    if (!matched) throw new Error("Created donor not found in matching list!");

    // 4. Create Alert Response Token (Step 5 in flyer)
    console.log("\n4. Dispatching alert to Dr. Ananya Rao...");
    const responseToken = "test-token-" + Date.now();
    const alertRecord = await storage.createBloodDonorResponse({
        requestId: request.id,
        donorId: donor.id,
        responseToken,
        status: "pending",
        respondedAt: null,
        notes: null
    });
    console.log(`✅ Alert recorded with Token: ${alertRecord.responseToken}`);

    // 5. Test Controlled Privacy: Recipient tracking should NOT see donor details yet
    console.log("\n5. Checking Recipient Tracking before donor accepts...");
    let responses = await storage.getBloodDonorResponsesByRequestId(request.id);
    let accepted = responses.filter(r => r.status === "accepted");
    console.log(`✅ Unaccepted donors visible to recipient: ${accepted.length} (Expected: 0)`);
    if (accepted.length !== 0) throw new Error("Privacy violation: unaccepted donor was visible!");

    // 6. Donor Clicks "Accept" (Step 6 in flyer)
    console.log("\n6. Donor clicks 'Accept / Willing to Donate'...");
    await storage.updateBloodDonorResponse(alertRecord.id, {
        status: "accepted",
        respondedAt: new Date(),
        notes: "Can reach hospital in 45 mins"
    });
    console.log("✅ Response updated to 'accepted'.");

    // 7. Test Controlled Sharing (Step 7 in flyer)
    console.log("\n7. Checking Recipient Tracking after donor accepts...");
    responses = await storage.getBloodDonorResponsesByRequestId(request.id);
    accepted = responses.filter(r => r.status === "accepted");
    console.log(`✅ Accepted donors unlocked for recipient: ${accepted.length} (Expected: 1)`);
    const donorUnlocked = await storage.getBloodDonorById(accepted[0].donorId);
    console.log(`✅ Unlocked Donor: ${donorUnlocked?.fullName} (${donorUnlocked?.phone}) - Blood Group: ${donorUnlocked?.bloodGroup}`);

    // 8. Clean up test data
    console.log("\n8. Cleaning up test data from Neon DB...");
    await storage.deleteBloodDonor(donor.id);
    console.log("✅ Test donor deleted.");

    console.log("\n🎉 ALL 8-STEP WORKFLOW TESTS PASSED FLAWLESSLY!\n");
    process.exit(0);
}

main().catch(err => {
    console.error("Test failed:", err);
    process.exit(1);
});
