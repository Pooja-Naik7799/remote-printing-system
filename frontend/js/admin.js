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
            snapshot.forEach((doc) => {
             
                const order = doc.data();
                const orderId = doc.id;

                total++;
                 totalRevenue += Number(order.price || 0);
                if (order.status === "Printed") completed++;
                else pending++;

                const row = `
                    <tr>
                        <td>${orderId.substring(0,5)}...</td>
                        <td>${order.userId.substring(0,5)}...</td>
                        <td>${order.token}</td>
                        <td><a href="${order.fileUrl}" target="_blank">View PDF</a></td>
                        <td>${order.pages}</td>
                        <td>₹${order.price}</td>
                       <td>${order.status}</td>

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
            updateChart(completed, pending);
            updateRevenueChart(totalRevenue);

        }, (error) => {

            console.error("Firestore Error:", error);
        });
}


// ================= UPDATE STATUS =================
window.updateOrderStatus = function(id, newStatus) {

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