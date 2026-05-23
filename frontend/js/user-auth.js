let currentGeneratedOtp = null;
let timerOn = false;

// ================= OTP LOGIC =================

function sendOTP() {
    if (timerOn) return; 

    const phone = document.getElementById("phone").value;
    if (phone.length !== 10 || isNaN(phone)) {
        alert("Please enter a valid 10-digit mobile number");
        return;
    }

    // Generate Unique Random 6-digit OTP
    currentGeneratedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Debug: OTP for " + phone + " is " + currentGeneratedOtp);

    showMobileNotification(currentGeneratedOtp);

    // UI Updates
    document.getElementById("otpSection").style.display = "block";
    startTimer(30); 
}

function startTimer(remaining) {
    timerOn = true;
    const btn = document.getElementById("sendOtpBtn");
    btn.disabled = true;
    
    const countdown = setInterval(function() {
        remaining -= 1;
        if (remaining <= 0) {
            clearInterval(countdown);
            btn.innerHTML = "Resend OTP";
            btn.disabled = false;
            timerOn = false;
        } else {
            btn.innerHTML = `Resend in ${remaining}s`;
        }
    }, 1000);
}

function showMobileNotification(otp) {
    const notify = document.createElement("div");
    notify.className = "mobile-otp-popup";
    notify.innerHTML = `
        <div class="otp-card">
            <div class="otp-header">
                <i class="fas fa-comment-dots"></i>
                <span>MESSAGES • NOW</span>
            </div>
            <div class="otp-body">
                <strong>RemotePrint Verification</strong>
                <p>Your one-time password is <strong>${otp}</strong>. Do not share this with anyone.</p>
            </div>
        </div>
    `;
    document.body.appendChild(notify);

    setTimeout(() => {
        notify.style.animation = "slideOutUp 0.5s forwards";
        setTimeout(() => notify.remove(), 500);
    }, 7000);
}

// ================= REGISTRATION LOGIC =================

function verifyAndRegister() {
    const userEnteredOtp = document.getElementById("otpInput").value;
    const loader = document.getElementById("loader");
    const btnText = document.getElementById("btnText");
    const verifyBtn = document.getElementById("verifyBtn");

    if (userEnteredOtp === currentGeneratedOtp) {
        // Show Loading State
        if(loader) loader.style.display = "block";
        if(btnText) btnText.innerText = "Processing...";
        if(verifyBtn) verifyBtn.disabled = true;

        const fullName = document.getElementById("regName").value;
        const phone = document.getElementById("phone").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        // Bypassing billing by using Email Auth
        firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            return firebase.firestore().collection("users").doc(userCredential.user.uid).set({
                fullName: fullName,
                phone: phone,
                email: email,
                role: "user",
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            alert("Registration Successful!");
            window.location.href = "user_dashbord.html"; //
        })
        .catch((error) => {
            if(loader) loader.style.display = "none";
            if(btnText) btnText.innerText = "Verify & Register";
            if(verifyBtn) verifyBtn.disabled = false;
            alert("Registration Failed: " + error.message);
        });

    } else {
        alert("Invalid OTP! Check the notification.");
    }
}

// ================= LOGIN LOGIC =================

function loginUser() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPass").value.trim();

    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
        console.log("Login successful");
        window.location.href = "user_dashbord.html"; //
    })
    .catch((error) => {
        alert("Login Failed: " + error.message);
    });
}