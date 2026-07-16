const otpInputs = document.querySelectorAll(".otp-input");
const hiddenOtp = document.getElementById("otp");
const otpContainer = document.getElementById("otpContainer");
const otpForm = document.getElementById("otpForm");

function updateHiddenValue() {
    hiddenOtp.value = Array.from(otpInputs).map(box => box.value).join("");
}

otpInputs.forEach((input, index) => {
    // Only allow digits
    input.addEventListener("input", function () {
        this.value = this.value.replace(/[^0-9]/g, "");

        if (this.value) {
            this.classList.add("filled");
        } else {
            this.classList.remove("filled");
        }

        if (this.value.length === 1 && index < otpInputs.length - 1) {
            otpInputs[index + 1].focus();
        }

        updateHiddenValue();
    });

    // Move to previous box on backspace when current is empty
    input.addEventListener("keydown", function (e) {
        if (e.key === "Backspace" && this.value === "" && index > 0) {
            otpInputs[index - 1].focus();
        }
    });

    // Support pasting the full OTP into any box
    input.addEventListener("paste", function (e) {
        e.preventDefault();
        const pasted = (e.clipboardData || window.clipboardData)
            .getData("text")
            .replace(/[^0-9]/g, "")
            .slice(0, otpInputs.length);

        pasted.split("").forEach((char, i) => {
            if (otpInputs[i]) {
                otpInputs[i].value = char;
                otpInputs[i].classList.add("filled");
            }
        });

        updateHiddenValue();
        const nextEmpty = Array.from(otpInputs).find(box => !box.value);
        (nextEmpty || otpInputs[otpInputs.length - 1]).focus();
    });
});

// Focus first box on load
if (otpInputs.length) {
    otpInputs[0].focus();
}

// Shake animation on server-side error (element rendered means error exists)
if (document.querySelector(".auth-error")) {
    otpContainer.classList.add("shake");
    setTimeout(() => otpContainer.classList.remove("shake"), 400);
}