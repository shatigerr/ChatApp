document.addEventListener("DOMContentLoaded", function () {
    const links = document.querySelectorAll(".users-select a");
    const iframe = document.getElementById("chat-iframe");

    links.forEach(function (link) {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const href = this.getAttribute("href");
            iframe.src = href;
        });
    });
});