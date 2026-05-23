// 1. Initialize PDF.js
/*const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

// 2. Auth Protection
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        document.getElementById("userGreeting").innerText = `Welcome, ${user.phoneNumber || "User"}`;
        loadRecentActivity(user.uid);
    } else {
        window.location.replace("registration.html");
    }
});

let selectedFile = null;

// 3. File Selection & Page Counting
document.getElementById("fileInput").addEventListener("change", async (e) => {
    selectedFile = e.target.files[0];
    if (!selectedFile) return;

    document.getElementById("fileName").innerText = selectedFile.name;
    document.getElementById("fileInfo").style.display = "block";

    const fileReader = new FileReader();
    fileReader.onload = async function() {
        const typedarray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        document.getElementById("pages").value = pdf.numPages;
        calculatePrice();
    };
    fileReader.readAsArrayBuffer(selectedFile);
});

// 4. Price Calculation
function calculatePrice() {
    const pages = parseInt(document.getElementById("pages").value) || 0;
    const type = parseFloat(document.getElementById("printType").value);
    const price = pages * type;
    document.getElementById("priceResult").innerText = `Total Price : ₹${price}`;
}

// 5. THE UPLOAD FUNCTION (Matches your HTML onclick="uploadFile()")
async function uploadFile() {
    console.log("Upload button clicked...");
    
    const user = firebase.auth().currentUser;
    const shop = document.getElementById("shopSelect").value;
    const pages = document.getElementById("pages").value;
    const type = document.getElementById("printType").value;

    if (!selectedFile || !shop || !pages) {
        alert("Please select a file, a shop, and calculate the price first!");
        return;
    }

    const price = parseInt(pages) * parseFloat(type);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("upload_preset", "remote_print_preset"); // Matches your Cloudinary image

    try {
        const btn = document.querySelector(".btn-confirm");
        btn.innerText = "Processing... Please wait";
        btn.disabled = true;

        console.log("Sending to Cloudinary...");

        // Upload to Cloudinary
        const response = await fetch("https://api.cloudinary.com/v1_1/dky77tacp/auto/upload", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (data.secure_url) {
            console.log("Cloudinary Success:", data.secure_url);

            // Save to Firestore
            await firebase.firestore().collection("printRequests").add({
                
            });

            alert("Print Request Sent Successfully!");
            location.reload();
        } else {
            console.error("Cloudinary Error:", data);
            throw new Error(data.error ? data.error.message : "Upload failed");
        }
    } catch (error) {
        console.error("Final Error:", error);
        alert("Error: " + error.message);
        const btn = document.querySelector(".btn-confirm");
        btn.innerText = "Send Print Request";
        btn.disabled = false;
    }
}

// 6. Load History
// Updated loadRecentActivity with Success Notification
function loadRecentActivity(uid) {

    firebase.firestore()
        .collection("printRequests")
        .where("userId", "==", uid)
        .orderBy("timestamp", "desc")
        .onSnapshot((snapshot) => {

            const tbody = document.getElementById("printStatusBody");

            tbody.innerHTML = "";

            snapshot.forEach(doc => {

    const data = doc.data();

    // ✅ Show notification only once
    if (data.status === "Printed" && !sessionStorage.getItem(doc.id)) {

        showNotification(
            `✅ Your order "${data.fileName}" is ready for pickup`
        );

        sessionStorage.setItem(doc.id, "shown");
    }

    const row = `
    <tr>

        <td>
            <a href="${data.fileUrl}" target="_blank">
            ${data.fileName}
            </a>
        </td>

        <td>${data.shop}</td>

        <td>
            <span class="badge">
            ${data.status}
            </span>
        </td>

    </tr>
    `;

    tbody.innerHTML += row;

});

        });

}

// Function to create a popup notification

function showNotification(message) {

    const notification = document.createElement("div");

    notification.className = "notification-box";

    notification.innerText = message;

    document.body.appendChild(notification);

    setTimeout(() => {

        notification.remove();

    }, 5000);

}

function logout() {
    firebase.auth().signOut().then(() => window.location.replace("registration.html"));
} */

    // ================= PDF.js =================
const pdfjsLib = window['pdfjs-dist/build/pdf'];

pdfjsLib.GlobalWorkerOptions.workerSrc =
'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';



// ================= AUTH PROTECTION =================
firebase.auth().onAuthStateChanged((user) => {

    if (user) {

        document.getElementById("userGreeting").innerText =
            `Welcome, ${user.phoneNumber || "User"}`;

        loadRecentActivity(user.uid);

    } else {

        window.location.replace("registration.html");

    }

});



// ================= GLOBAL FILE VARIABLE =================
let selectedFile = null;
let paymentDone = false;


// ================= FILE SELECTION =================
document.getElementById("fileInput")
.addEventListener("change", async (e) => {

    selectedFile = e.target.files[0];

    if (!selectedFile) return;

    document.getElementById("fileName").innerText =
        selectedFile.name;

    document.getElementById("fileInfo").style.display =
        "block";



    // ONLY PDF ALLOWED
    if (selectedFile.type !== "application/pdf") {

        alert("Please upload PDF only");

        return;

    }



    // READ PDF & COUNT PAGES
    const fileReader = new FileReader();

    fileReader.onload = async function() {

        const typedarray = new Uint8Array(this.result);

        const pdf =
            await pdfjsLib.getDocument(typedarray).promise;

        document.getElementById("pages").value =
            pdf.numPages;

        calculatePrice();

    };

    fileReader.readAsArrayBuffer(selectedFile);

});



// ================= PRICE CALCULATION =================
function calculatePrice() {

    const pages =
        parseInt(document.getElementById("pages").value) || 0;

    const type =
        parseFloat(document.getElementById("printType").value);

    const price = pages * type;

    document.getElementById("priceResult").innerText =
        `Total Price : ₹${price}`;

    // UPDATE PAYMENT SECTION
    document.getElementById("paymentAmount").innerText =
        `Total Amount: ₹${price}`;
}

function makePayment() {

    const pages =
        document.getElementById("pages").value;

    if (!pages) {

        alert("Please upload PDF first");

        return;
    }

    const paymentBtn =
        document.querySelector(".btn-payment");

    paymentBtn.innerText =
        "Processing Payment...";

    paymentBtn.disabled = true;

    // FAKE PAYMENT DELAY
    setTimeout(() => {

        paymentDone = true;

        document.getElementById(
            "paymentStatusText"
        ).innerHTML =
            "✅ Payment Successful";

        paymentBtn.innerText =
            "Paid";

        alert("Payment Successful ✅");

    }, 2000);
}

// ================= UPLOAD FILE =================
async function uploadFile() {

    console.log("Upload button clicked...");

    const user = firebase.auth().currentUser;

    const shop =
        document.getElementById("shopSelect").value;

    const pages =
        document.getElementById("pages").value;

    const type =
        document.getElementById("printType").value;



    // VALIDATIONS
    if (!selectedFile) {

        alert("Please select PDF file");
        return;

    }

    if (!shop) {

        alert("Please select print shop");
        return;

    }

    if (!pages) {

        alert("Page count missing");
        return;

    }

if (!paymentDone) {

    alert("Please complete payment first");

    return;
}

    const price =
        parseInt(pages) * parseFloat(type);



    // CLOUDINARY FORM DATA
    const formData = new FormData();

    formData.append("file", selectedFile);

    formData.append(
        "upload_preset",
        "remote_print_preset"
    );



    try {

        const btn =
            document.querySelector(".btn-confirm");

        btn.innerText =
            "Processing... Please wait";

        btn.disabled = true;



        console.log("Uploading to Cloudinary...");



        // ================= CLOUDINARY UPLOAD =================
        const response = await fetch(

            "https://api.cloudinary.com/v1_1/dky77tacp/auto/upload",

            {
                method: "POST",
                body: formData
            }

        );



        const data = await response.json();



        if (!data.secure_url) {

            console.error(data);

            throw new Error("Cloudinary Upload Failed");

        }



        console.log("Cloudinary Success");



        // ================= QUEUE TOKEN SYSTEM =================

   const snapshot = await firebase.firestore()
    .collection("printRequests")
    .where("userId", "==", user.uid)
    .get();

const queueNumber = snapshot.size + 1;



        const token =
            "RP" +
            String(queueNumber).padStart(3, "0");



        const estimatedTime =
            queueNumber * 2;



        // ================= SAVE TO FIRESTORE =================
        await firebase.firestore()
            .collection("printRequests")
            .add({

    userId: user.uid,
    fileName: selectedFile.name,
    fileUrl: data.secure_url,
    shop: shop,
    pages: parseInt(pages),
    price: price,
    token: token,
    estimatedTime: estimatedTime,

    paymentStatus: "Paid",
    status: "Waiting in Queue",
    timestamp: firebase.firestore.FieldValue.serverTimestamp()

            });



        alert(
            `Print Request Sent!\n\nToken: ${token}\nEstimated Time: ${estimatedTime} mins`
        );

generateReceipt(
    selectedFile.name,
    shop,
    pages,
    price,
    token
);

        location.reload();

    }

    catch (error) {

        console.error("FINAL ERROR:", error);

        alert("Error: " + error.message);



        const btn =
            document.querySelector(".btn-confirm");

        btn.innerText =
            "Send Print Request";

        btn.disabled = false;

    }

}



// ================= LOAD RECENT ACTIVITY =================
function loadRecentActivity(uid) {

    firebase.firestore()

        .collection("printRequests")

        .where("userId", "==", uid)

        .orderBy("timestamp", "desc")

        .onSnapshot((snapshot) => {

            const tbody =
                document.getElementById("printStatusBody");

            tbody.innerHTML = "";



            snapshot.forEach(doc => {

                const data = doc.data();



                // ================= NOTIFICATION =================
                if (

                    data.status === "Printed" &&

                    !sessionStorage.getItem(doc.id)

                ) {

                    showNotification(

                        `✅ Your order "${data.fileName}" is ready for pickup`

                    );



                    sessionStorage.setItem(
                        doc.id,
                        "shown"
                    );

                }



                // ================= TABLE ROW =================
    const row = `

<tr>

    <td>
        <a href="${data.fileUrl}" target="_blank">
            ${data.fileName}
        </a>
    </td>

    <td>
        ${data.shop}<br>

        <small>
            🎟 ${data.token || "N/A"}
        </small><br>

        <small>
            ⏱ ${data.estimatedTime || 0} mins
        </small>
    </td>

    <td>
        <span class="badge">
            ${data.status}
        </span>
    </td>

    <td>
        <span class="${
            data.paymentStatus === "Paid"
            ? "paid-badge"
            : "pending-badge"
        }">

            ${data.paymentStatus || "Pending"}

        </span>
    </td>

</tr>

`;



                tbody.innerHTML += row;

            });

        });

}



// ================= POPUP NOTIFICATION =================
function showNotification(message) {

    const notification =
        document.createElement("div");

    notification.className =
        "notification-box";

    notification.innerText =
        message;

    document.body.appendChild(notification);



    setTimeout(() => {

        notification.remove();

    }, 5000);

}

function generateReceipt(fileName, shop, pages, price, token) {

    const receiptContent = `
REMOTEPRINT RECEIPT
----------------------------

File Name : ${fileName}

Shop : ${shop}

Pages : ${pages}

Price : ₹${price}

Token : ${token}

Status : Waiting in Queue

Thank You For Using RemotePrint
`;

    // Create file
    const blob = new Blob([receiptContent], {
        type: "text/plain"
    });

    // Create download link
    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    link.download = `Receipt_${token}.txt`;

    // Auto download
    link.click();
}

// ================= LOGOUT =================
function logout() {

    firebase.auth()
        .signOut()
        .then(() => {

            window.location.replace(
                "registration.html"
            );

        });

}
function goToRoles() {

    window.location.href = "role_selection.html";

}