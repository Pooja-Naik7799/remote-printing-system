let ordersChart = null;
let revenueChart=null;
document.addEventListener("DOMContentLoaded", function () {

    const currentPage = window.location.pathname;

    // ================= ADMIN LOGIN =================
    if (currentPage.includes("admin_login.html")) {

        const form = document.getElementById("adminLoginForm");

        form.addEventListener("submit", function (event) {
            event.preventDefault();

            const email = document.getElementById("adminEmail").value.trim();
            const password = document.getElementById("adminPassword").value.trim();

            firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {

                const user = userCredential.user;

                return firebase.firestore()
                    .collection("users")
                    .doc(user.uid)
                    .get();
            })
            .then((doc) => {

                if (doc.exists && doc.data().role === "admin") {

                    window.location.href = "admin_dashboard.html";

                } else {

                    alert("Access Denied: Not an admin");
                    firebase.auth().signOut();

                }

            })
            .catch((error) => {
                alert("Login Failed: " + error.message);
            });
        });
    }

    // ================= ADMIN DASHBOARD PROTECTION =================
    if (currentPage.includes("admin_dashboard.html")) {

        firebase.auth().onAuthStateChanged((user) => {

            if (!user) {

                // Not logged in
                window.location.href = "admin_login.html";
                return;
            }

            // Check admin role
            firebase.firestore()
                .collection("users")
                .doc(user.uid)
                .get()
                .then((doc) => {

                    if (!doc.exists || doc.data().role !== "admin") {

                        alert("Access Denied!");
                        window.location.href = "admin_login.html";
                        return;
                    }

                    // ✅ ONLY AFTER CHECK → LOAD DATA
                    loadAdminDashboard();

                })
                .catch((error) => {
                    console.error("Role check error:", error);
                });
        });
    }

});


// ================= LOAD ADMIN DATA =================
function loadAdminDashboard() {

    console.log("Loading Admin Dashboard Data...");

    firebase.firestore()
        .collection("printRequests")
        .orderBy("timestamp", "desc")
        .onSnapshot((snapshot) => {

            const tbody = document.querySelector("#ordersTable tbody");
            tbody.innerHTML = "";

            let total = 0;
            let completed = 0;
            let pending = 0;
            let totalRevenue = 0;

            // Build ascending-order waiting list first, to assign live FCFS positions
            const waitingOrders = [];
            snapshot.forEach(doc => {
                if (doc.data().status === "Waiting in Queue") {
                    waitingOrders.push({ id: doc.id, ...doc.data() });
                }
            });
            waitingOrders.sort((a, b) => {
                const aTime = a.timestamp ? a.timestamp.toMillis() : 0;
                const bTime = b.timestamp ? b.timestamp.toMillis() : 0;
                return aTime - bTime; // oldest first
            });
            const positionMap = {};
            waitingOrders.forEach((order, index) => {
                positionMap[order.id] = index + 1;
            });

            snapshot.forEach((doc) => {

                const order = doc.data();
                const orderId = doc.id;

                total++;
                totalRevenue += Number(order.price || 0);
                if (order.status === "Printed") completed++;
                else pending++;

                const livePosition = positionMap[orderId]
                    ? `#${positionMap[orderId]} in queue`
                    : "—";

                const row = `
                    <tr>
                        <td>${orderId.substring(0,5)}...</td>
                        <td>${order.userId.substring(0,5)}...</td>
                        <td>${order.token}</td>
                     <td>

${order.fileUrl ?

`<a href="javascript:void(0)" onclick="viewPdf('${order.fileUrl}', '${order.token}')">
View PDF
</a>`

:

`<span style="color:red;font-weight:bold;">
Printed
</span>`

}

</td>
                        <td>${order.pages}</td>
                        <td>₹${order.price}</td>
                       <td>${order.status}<br><small>${livePosition}</small></td>

                <td>
          ${
              order.paymentStatus === "Paid"
               ? "🟢 Paid"
               : "🔴 Pending"
           }
     </td>
                        <td>
                            <button onclick="updateOrderStatus('${orderId}','Printed')" 
                            style="padding:5px 10px;background:green;color:white;border:none;">
                                Complete
                            </button>
                        </td>
                    </tr>
                `;

                tbody.innerHTML += row;

            });

            document.getElementById("totalOrders").innerText = total;
            document.getElementById("completedOrders").innerText = completed;
            document.getElementById("pendingOrders").innerText = pending;

            // NEW: live count of people actually waiting right now
            const queueCountEl = document.getElementById("queueCount");
            if (queueCountEl) queueCountEl.innerText = waitingOrders.length;

            updateChart(completed, pending);
            updateRevenueChart(totalRevenue);

        }, (error) => {

            console.error("Firestore Error:", error);
        });
}


// ================= UPDATE STATUS =================
/*window.updateOrderStatus = function(id, newStatus) {

    firebase.firestore()
        .collection("printRequests")
        .doc(id)
        .update({
            status: newStatus
        })
        .then(() => {
            console.log("Updated successfully");
        })
        .catch((error) => {
            alert("Update failed: " + error.message);
        });
};*/
window.updateOrderStatus = function(id, newStatus) {

    firebase.firestore()
        .collection("printRequests")
        .doc(id)
        .update({

            status: newStatus,

            fileUrl: "",

            fileDeleted: true,

            printedAt: firebase.firestore.FieldValue.serverTimestamp()

        })

        .then(() => {

            console.log("Updated successfully");

        })

        .catch((error) => {

            alert("Update failed: " + error.message);

        });

};


// ================= LOGOUT =================
window.logout = function() {

    firebase.auth().signOut().then(() => {
        window.location.href = "admin_login.html";

    });

};
function updateChart(completed, pending) {

    const ctx = document.getElementById("ordersChart");

    if (ordersChart) {
        ordersChart.destroy();
    }

    ordersChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Completed", "Pending"],
            datasets: [{
                data: [completed, pending]
            }]
        },
        options: {
    responsive: true,
    maintainAspectRatio: false
}
    });
}

function updateRevenueChart(totalRevenue) {

    const ctx = document.getElementById("revenueChart");

    if (!ctx) return;

    if (revenueChart) {

        revenueChart.destroy();

    }

    revenueChart = new Chart(ctx, {

        type: "bar",

        data: {

            labels: ["Revenue"],

            datasets: [{

                label: "Total Revenue (₹)",

                data: [totalRevenue]

            }]

        },
        options: {
    responsive: true,
    maintainAspectRatio: false
}

    });

}
window.goToRoles = function () {

    window.location.href = "role_selection.html";

};
// ================= PDF VIEWER MODAL =================
function injectPdfModal() {
    if (document.getElementById("pdfViewerModal")) return; // already injected

    const modal = document.createElement("div");
    modal.id = "pdfViewerModal";
    modal.style.cssText = `
        display:none; position:fixed; top:0; left:0; width:100%; height:100%;
        background:rgba(0,0,0,0.7); z-index:9999; justify-content:center; align-items:center;
    `;

    modal.innerHTML = `
        <div style="background:#0f1f3d; width:90%; max-width:900px; height:85%; border-radius:10px; display:flex; flex-direction:column; overflow:hidden;">
            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:#1a2f5c;">
                <span id="pdfViewerTitle" style="color:white; font-weight:bold;">PDF Preview</span>
                <div>
                    <button id="pdfPrintBtn" style="padding:6px 14px; margin-right:8px; background:#2563eb; color:white; border:none; border-radius:4px; cursor:pointer;">🖨 Print</button>
                    <button id="pdfDownloadBtn" style="padding:6px 14px; margin-right:8px; background:green; color:white; border:none; border-radius:4px; cursor:pointer;">⬇ Download</button>
                    <button id="pdfCloseBtn" style="padding:6px 14px; background:#dc2626; color:white; border:none; border-radius:4px; cursor:pointer;">✕ Close</button>
                </div>
            </div>
            <iframe id="pdfViewerFrame" style="flex:1; width:100%; border:none; background:white;"></iframe>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("pdfCloseBtn").onclick = () => {
        modal.style.display = "none";
        document.getElementById("pdfViewerFrame").src = ""; // stop loading
    };
}

window.viewPdf = async function (url, token) {
    injectPdfModal();

    const modal = document.getElementById("pdfViewerModal");
    const frame = document.getElementById("pdfViewerFrame");
    const title = document.getElementById("pdfViewerTitle");

    title.innerText = `Order ${token} - PDF Preview`;
    modal.style.display = "flex";
    frame.src = ""; // clear previous

    let blobUrl = null;

    try {
        const res = await fetch(url);

        if (!res.ok) {
            throw new Error(`Fetch failed: ${res.status}`);
        }

        const arrayBuffer = await res.arrayBuffer();

        // Force the correct MIME type — Cloudinary raw uploads
        // often come back as application/octet-stream, which the
        // browser's PDF viewer refuses to render
        const blob = new Blob([arrayBuffer], { type: "application/pdf" });

        blobUrl = URL.createObjectURL(blob);
        frame.src = blobUrl;

    } catch (e) {
        console.error("PDF fetch failed:", e);
        alert("Couldn't load preview, opening in new tab instead.");
        window.open(url, "_blank");
        modal.style.display = "none";
        return;
    }

    // Print button
    document.getElementById("pdfPrintBtn").onclick = () => {
        try {
            frame.contentWindow.focus();
            frame.contentWindow.print();
        } catch (e) {
            window.open(blobUrl || url, "_blank");
        }
    };

    // Download button
    document.getElementById("pdfDownloadBtn").onclick = () => {
        const link = document.createElement("a");
        link.href = blobUrl || url;
        link.download = `Order_${token}.pdf`;
        link.click();
    };

    // Clean up blob when modal closes
    document.getElementById("pdfCloseBtn").onclick = () => {
        modal.style.display = "none";
        frame.src = "";
        if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
};