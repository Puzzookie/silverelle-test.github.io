// Get the form element
var form = document.getElementById("reset-form");

// Add an event listener to the form to handle the submit event
form.addEventListener("submit", function(event) {
  event.preventDefault();
  loader.style.display = "flex";

  // Get the value of the email input
  var email = document.getElementById("email").value;
  
  attemptReset(email);
});

function attemptReset(email)
{
  // Use Firebase Authentication to send a password reset email to the provided email
  firebase.auth().sendPasswordResetEmail(email).then(function() 
  {
    document.getElementById("loader").style.display = "none";
    alert("Password reset email sent to " + email + ". Please check your email.");
    document.location.href = "login.html";
  })
  .catch(function(error) 
  {
    document.getElementById("loader").style.display = "none";
    alert(error.message);
  });
}