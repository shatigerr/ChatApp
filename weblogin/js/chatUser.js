addEventListener("DOMContentLoaded", (e) => {
    const sendButton = document.getElementById("sendButton");
    const inputText = document.getElementById("inputText");
    const toast = document.getElementById("toast");

    const extendImgChat = document.getElementById("img-chat");

    sendButton.addEventListener("click", (e) => {
        if (inputText.value == "") {
            toast.style.visibility = "visible"
            toast.style.display = "block";
            setTimeout(function () {
                toast.style.opacity = "1";
            }, 10);

            setTimeout(function () {
                toast.style.opacity = "0";
                setTimeout(function () {
                    toast.style.display = "none";
                    toast.style.visibility = "hidden"
                }, 500);
            }, 5000);
        }

        if(inputText.value == ""){ e.preventDefault(); }
    })

    inputText.addEventListener("keyup", (e) => {

        if (e.key == "Enter") {
            if (inputText.value == "") {
                toast.style.visibility = "visible"
                toast.style.display = "block";
                setTimeout(function () {
                    toast.style.opacity = "1";
                }, 10);

                setTimeout(function () {
                    toast.style.opacity = "0";
                    setTimeout(function () {
                        toast.style.display = "none";
                        toast.style.visibility = "hidden"
                    }, 500);
                }, 5000);
            }
        }
        if(inputText.value == ""){ e.preventDefault(); }
    })

    extendImgChat.addEventListener("click", (e)=>{
        
        if(extendImgChat.className != "extenderImg")
        {
           extendImgChat.className = "extenderImg"; 
        }
        else{
            extendImgChat.classList.remove("extenderImg")
        }
        
    })

    // returnImgChat.addEventListener("click", (e)=>{
    //     extendImgChat.classList.remove("extenderImg");
    // })

    function scrollDown() {
        window.scrollTo(0, document.body.scrollHeight);
        behavior: "smooth";
    }

    window.onload = scrollDown;
});