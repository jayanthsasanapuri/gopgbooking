function showMethod(type, event){

    document.getElementById("upi-section").style.display = "none";
    document.getElementById("card-section").style.display = "none";
    document.getElementById("netbanking-section").style.display = "none";

    document.getElementById(type + "-section").style.display = "block";

    document.querySelectorAll(".method-btn").forEach(function(btn){
        btn.classList.remove("active");
    });

    event.currentTarget.classList.add("active");
}

let timeLeft = 600;

const timer = document.getElementById("countdown");

const countdown = setInterval(function(){

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    timer.innerHTML =
        minutes + ":" +
        (seconds < 10 ? "0" + seconds : seconds);

    if(timeLeft <= 0){

        clearInterval(countdown);

        alert("Payment session expired.");

        window.location.href = "/confirmbooking/" + pgId;

    }

    timeLeft--;

},1000);