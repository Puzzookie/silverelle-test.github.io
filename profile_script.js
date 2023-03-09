var ref;


firebase.auth().onAuthStateChanged(function(user) 
{
    if (user) 
    {
        //Signed in
        var fullName = firebase.auth().currentUser.displayName.split(' ');

        document.getElementById("firstName").value = fullName[0];
        document.getElementById("lastName").value = fullName[1];
        document.getElementById("phone").value = firebase.auth().currentUser.photoURL;
        document.getElementById("email").innerHTML = firebase.auth().currentUser.email;

        document.getElementById("loader").style.display = "none";
        document.getElementById("textBody").style.display="block";
    } 
    else 
    {
        //Not signed in
        document.location.href = "login.html";
    }
});

const hamburgerMenu = document.querySelector('.hamburger-menu');
const menuItems = document.querySelector('.menu-items');

hamburgerMenu.addEventListener('click', () => {
  menuItems.classList.toggle('show');
});

document.addEventListener('click', (event) => {
    if (!menuItems.contains(event.target) && !hamburgerMenu.contains(event.target)) {
      menuItems.classList.remove('show');
    }
  });

function viewHome()
{
    document.location.href = "index.html";
}

function viewAppointments()
{
    document.location.href = "appointment.html";

}

function logout()
{
    if (window.confirm("Are you sure you want to logout?"))
     {
        firebase.auth().signOut().then(function() 
        {
            // Sign-out successful.
            //console.log("Sign-out successful");
            if(ref)
            {
            ref.off();
            }
            document.location.href = "login.html";
        }).catch(function(error) 
        {
            // An error happened.
            alert(error);
        });
    }
}

function onChangePassword()
{
  var email = firebase.auth().currentUser.email;

  if (window.confirm("Are you sure you want to send a password reset email to " + email + "?"))
  {
    document.getElementById("loader").style.display = "block";
    document.getElementById("textBody").style.display="none";
    // Use Firebase Authentication to send a password reset email to the provided email
    firebase.auth().sendPasswordResetEmail(email).then(function() 
    {
      firebase.auth().signOut().then(function() 
        {
            // Sign-out successful.
            //console.log("Sign-out successful");
            if(ref)
            {
            ref.off();
            }
            document.location.href = "login.html";
            alert("Password reset email sent to " + email + ". Please check your email.");
        }).catch(function(error) 
        {
            // An error happened.
            alert(error);
        });
    })
    .catch(function(error) 
    {
      document.getElementById("loader").style.display = "none";
      document.getElementById("textBody").style.display="block";
      alert(error.message);
    });
  }
}

// Get the form element
var form = document.getElementById("registration-form");

// Add an event listener to the form to handle the submit event
form.addEventListener("submit", function(event) 
{
  event.preventDefault();
  loader.style.display = "flex";
  document.getElementById("textBody").style.display="none";

  // Get the values of the email and password inputs
  var email = document.getElementById("email").value;

  //Should check if it's null or empty or whitespace probably
  if(document.getElementById("email").value == "" || 
  document.getElementById("phone").value == "" ||
  document.getElementById("firstName").value == "" ||
  document.getElementById("lastName").value == "")
  {
    document.getElementById("loader").style.display = "none";
    document.getElementById("textBody").style.display="block";
      return;
  }

  if (document.getElementById("firstName").value.trim().indexOf(' ') !== -1) {
    // Value has a space
    alert("First name can't contain a space");
    document.getElementById("loader").style.display = "none";
    document.getElementById("textBody").style.display="block";
    return;
  }

  if (document.getElementById("lastName").value.trim().indexOf(' ') !== -1) {
    // Value has a space
    alert("Last name can't contain a space");
    document.getElementById("loader").style.display = "none";
    document.getElementById("textBody").style.display="block";
    return;
  }

  // Retrieve the phone number string from a form input element
  var phone = document.getElementById("phone").value;

  // Create a PhoneNumberUtil object
  var phoneUtil = window.libphonenumber.PhoneNumberUtil.getInstance();

  /// Parse the phone number
  var parsedPhone = phoneUtil.parse(phone, 'US');
  //console.log("Parsed Phone: " + parsedPhone);

  // Check if the phone number is valid
  if (!phoneUtil.isValidNumber(parsedPhone)) {
    alert('Invalid phone number');
    document.getElementById("loader").style.display = "none";
    document.getElementById("textBody").style.display="block";
  return;
  }

  // Format the phone number in E.164 format
  var formattedPhone = phoneUtil.format(parsedPhone, window.libphonenumber.PhoneNumberFormat.E164);
  //console.log("Formatted Phone: " + formattedPhone);

  // Update the user's display name
  firebase.auth().currentUser.updateProfile({
    displayName: document.getElementById("firstName").value.trim() + " " + document.getElementById("lastName").value.trim(),
    photoURL: formattedPhone
  }).then(function() {
    document.getElementById("loader").style.display = "none";
    document.getElementById("textBody").style.display="block";
    // Update successful.
  }).catch(function(error) {
    alert(error);
    // An error happened.
  });
});