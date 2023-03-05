// Get the form element
var form = document.getElementById("login-form");

// Add an event listener to the form to handle the submit event
form.addEventListener("submit", function(event) 
{
  event.preventDefault();
  loader.style.display = "flex";

  var email = document.getElementById("email").value;
  var password = document.getElementById("password").value;
  
  attemptSignIn(email, password);
});

function attemptSignIn(email, password)
{
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then(function(user) {
      if(firebase.auth().currentUser.emailVerified)
      {
        document.location.href = "index.html";
      }
      else
      {
        alert("Please check your email to verify your account. If you haven't received a verification email, then try resetting your password.");
      }
      document.getElementById("loader").style.display = "none";
      
    })
    .catch(function(error) {
      document.getElementById("loader").style.display = "none";
      alert(error.message);
    });
}