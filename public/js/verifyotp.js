const otpInputs = document.querySelectorAll(".otp-input");
const hiddenOtp =document.getElementById("otp");
otpInputs.forEach((input,index)=>{
    input.addEventListener("input",function(){
        if(this.value.length===1 && index<otpInputs.length-1){
            otpInputs[index+1].focus();
        }
        hiddenOtp.value="";
        otpInputs.forEach(box=>{
            hiddenOtp.value+=box.value;
        });
    });
   });
input.addEventListener("keydown", function(e){
    if(e.key === "Backspace" &&this.value === "" &&index > 0){
        otpInputs[index - 1].focus();

    }

});