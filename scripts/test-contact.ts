
import axios from 'axios';

async function testContact() {
    try {
        const response = await axios.post('http://localhost:3003/api/contact', {
            firstName: "Test",
            lastName: "User",
            email: "test@example.com",
            subject: "Test Subject",
            message: "This is a test message."
        });
        console.log("✅ Response:", response.data);
    } catch (error: any) {
        console.error("❌ Error:", error);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        }
    }
}

testContact();
