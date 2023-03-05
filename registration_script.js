
  // Get the form element
var form = document.getElementById("registration-form");

// Add an event listener to the form to handle the submit event
form.addEventListener("submit", function(event) 
{
  event.preventDefault();
  loader.style.display = "flex";

  if(document.getElementById("password").value != document.getElementById("repassword").value)
  {
    alert("Passwords don't match");
    document.getElementById("loader").style.display = "none";
    return;
  }

  // Get the values of the email and password inputs
  var email = document.getElementById("email").value;
  var password = document.getElementById("password").value;

  //Should check if it's null or empty or whitespace probably
  if(document.getElementById("email").value == "" || 
  document.getElementById("password").value == "" || 
  document.getElementById("repassword").value == "" || 
  document.getElementById("phone").value == "" ||
  document.getElementById("firstName").value == "" ||
  document.getElementById("lastName").value == "")
  {
    document.getElementById("loader").style.display = "none";
      return;
  }
  
  attemptCreateUser(email, password);
});

function attemptCreateUser(email, password)
{
  
  // Retrieve the phone number string from a form input element
  var phone = document.getElementById("phone").value;

  // Create a PhoneNumberUtil object
  var phoneUtil = window.libphonenumber.PhoneNumberUtil.getInstance();

  /// Parse the phone number
  var parsedPhone = phoneUtil.parse(phone, 'US');
  console.log("Parsed Phone: " + parsedPhone);

  // Check if the phone number is valid
  if (!phoneUtil.isValidNumber(parsedPhone)) {
    console.log('Invalid phone number');
    document.getElementById("loader").style.display = "none";
  return;
  }

  // Format the phone number in E.164 format
  var formattedPhone = phoneUtil.format(parsedPhone, window.libphonenumber.PhoneNumberFormat.E164);
  console.log("Formatted Phone: " + formattedPhone);


  
  // Register the user with Firebase using the formatted phone number
  return firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Set the user's phone number in their profile
      
      return userCredential.user.updateProfile({
        displayName: document.getElementById("firstName").value + " " + document.getElementById("lastName").value,
        photoURL: formattedPhone
      }).then(() => {
        console.log("Phone number added successfully");
      }).catch((error) => {
        console.log("Failed to add phone number: " + error);
        document.getElementById("loader").style.display = "none";
      });
    })
    .then(() => {
      // Registration successful
      attemptSendEmailVerification();
    })
    .catch((error) => {
      // Registration failed
      console.log(error);
      document.getElementById("loader").style.display = "none";
    });
}

function attemptSendEmailVerification()
{
  // Profile updated successfully
  firebase.auth().currentUser.sendEmailVerification().then(function() 
  {
    alert("Email verification sent to " + firebase.auth().currentUser.email);
    document.getElementById("loader").style.display = "none";
    document.location.href = "login.html";
  }).catch(function(error) 
  {
    document.getElementById("loader").style.display = "none";
    alert(error.message);
  });
}