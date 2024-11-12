document.getElementById("contact-form").addEventListener("submit", function (e) {
    e.preventDefault();

    // Show success message (this is just an example)
    alert("Thank you for your message! We will get back to you soon.");

    // Reset the form
    e.target.reset();
});
