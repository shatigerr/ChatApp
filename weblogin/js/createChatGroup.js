document.addEventListener("DOMContentLoaded", function () {
    const links = document.querySelectorAll(".users-select a");
    const iframe = document.getElementById("chat-iframe");
    const grupoGeneral = document.getElementById("grupo-general")

    links.forEach(function (link) {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const href = this.getAttribute("href");
            iframe.src = href;
        });
    });

    grupoGeneral.addEventListener("click", function(e){
        e.preventDefault();
        const href = this.getAttribute("href");
        iframe.src = href;
    })
});