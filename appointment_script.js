const database = firebase.database();
var ref;
var snapshotObj = {};

firebase.auth().onAuthStateChanged(function(user) 
{
    if (user) 
    {
        //Signed in
        getDatabaseData();
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

function viewProfile()
{
    document.location.href = "profile.html";

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

function getDatabaseData() 
{
  if(ref)
  {
    ref.off();
  }

  ref = database.ref();

  ref.once('value')
  .then((snapshot) => {
    snapshotObj = {};

    if(snapshot.val() != null)
    {
        update(snapshot);
    }
    else
    {
        //console.log("no data");
    }

    document.getElementById("loader").style.display = "none";
    document.getElementById("textBody").style.display="block";
    // Use the data here
  });
}

function update(snapshot)
{
    if(snapshot.exists())
    {

        snapshot.forEach((date) => 
        {
            const dateKey = date.key;
            const dateValue = date.val();
            snapshotObj[dateKey] = dateValue;

        });

        print();


    }
}


function print()
{

    var exists = false;

    var appointmentTable = document.getElementById("myTable");
    appointmentTable.innerHTML = "";
    var innerTable = "";

    const uid = firebase.auth().currentUser.uid;

    var mine = false;
    var addedHeader = false;

    for(const key in snapshotObj)
    {
        if(snapshotObj.hasOwnProperty(key))
        {
            var timestamp = mountainTimestamp(key);

            var date = readableHeader(getMountainTime(timestamp));

            addedHeader = false;
            //console.log("1 " + key + ": " + snapshotObj[key]);
            for(const key2 in snapshotObj[key])
            {
                if(snapshotObj[key].hasOwnProperty(key2))
                {
                    mine = false;
                    if(key2 == uid)
                    {
                        mine = true;
                    }
                    //console.log("2 " + key2 + ": " + snapshotObj[key][key2]);

                    for(const key3 in snapshotObj[key][key2])
                    {
                        if(snapshotObj[key][key2].hasOwnProperty(key3))
                        {
                            //console.log("3 " + key3 + ": " + snapshotObj[key][key2][key3]); // returns 2
                            var appointmentType = "";
                            var startingTimestamp = "";
                            for(const key4 in snapshotObj[key][key2][key3])
                            {
                                if(snapshotObj[key][key2][key3].hasOwnProperty(key4))
                                {
                                    if(key4 == "selectedValue")
                                    {
                                        for(let i = 0; i < snapshotObj[key][key2][key3][key4].length; i++)
                                        {
                                            appointmentType += snapshotObj[key][key2][key3][key4][i];
                                        }
                                    }
    
                                    if(key4 == "allValues")
                                    {
                                        startingTimestamp = snapshotObj[key][key2][key3][key4][0];
                                    }                                                                       
                                }
                            }
                            
                            if(mine)
                            {
                                
                                if(addedHeader == false)
                                {
                                    innerTable += "<tr><th>" + date + "</th></tr>";
                                    addedHeader = true;
                                }
                                exists = true;

                                innerTable += "<tr>"

                                var x = appointmentType + " at " + readableTime(getMountainTime(startingTimestamp));

                                innerTable += "<td>" + "<button style='display: block; margin: 0 auto;' id=" + key3 + " name='" + x + "," + key + "' onclick='onDeleteEvent(this)' type='button'>" + x + "</button></td>";    

                                innerTable += "</tr>";



                               // console.log(key + " " + key3 + " " + appointmentType + " " + startingTimestamp);
                            }

                        }
                    }
                }
            }
        }
    }    
    if(exists == false)
    {
        innerTable += "<tr><td>No scheduled appointments found.</td></tr>";
    }

    appointmentTable.innerHTML += innerTable;
}

function onDeleteEvent(button)
{
    let arr = button.name.split(',');
    if (window.confirm("Are you sure you want to delete " + arr[0] + "?")) 
    {
       

        var selectedDay = arr[1];
        const uid = firebase.auth().currentUser.uid; // Get the current user's UID
        console.log(selectedDay + " " + uid + " " + button.id);
        database.ref(`${selectedDay}/${uid}/${button.id}`).remove()
        .then(function() {
          console.log("Data removed successfully.");
          getDatabaseData(); //This is kinda lazy and kinda expensive because we're regetting database data when we could just delete it from snapshot data
        })
        .catch(function(error) {
          console.error("Data could not be removed: ", error);
        });
    }   
    
}

function readableTime(date)
{
    var hour = date.getHours();
    var minute = date.getMinutes();
    var readable = "";

    var isAfternoon = false;
    if(hour >= 12)
    {
        isAfternoon = true;
    }

    if(hour > 12)
    {
        readable = hour % 12;
    }
    else
    {
        readable = hour;
    }

    if(minute.toString().length == 1)
    {
        if(minute < 10)
        {
            readable += ":0" + minute;
        }
        else
        {
            readable += ":" + minute + "0";
        }
    }
    else
    {
        readable += ":" + minute;
    }


    if(isAfternoon)
    {
        readable += " PM";
    }
    else
    {
        readable += " AM";
    }
    return readable;

}
function mountainTimestamp(selectedDay)
{
    //console.log(selectedDay);
    let arr = selectedDay.split('-');
    var myDate = mountainDate(new Date(arr[0], arr[1]-1, arr[2]));
    //console.log(myDate);
    return Date.parse(myDate);
}

function getMountainTime(timestamp) {
    const mountainTimezone = "America/Denver";
    const dateInUTC = new Date(timestamp);
    const dateInMountainTimezone = new Date(dateInUTC.toLocaleString("en-US", { timeZone: mountainTimezone }));
    return dateInMountainTimezone;
  }
  
function mountainDate(date)
{
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes()).toLocaleString("en-US", {timeZone: "America/Denver"});
}

  function readableHeader(date) 
{
    var daysOfTheWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var day = date.getDate();
    // get month from 0 to 11
    var month = date.getMonth();
    // conver month digit to month name
    month = months[month];
    var year = date.getFullYear();

    var dayOfWeek = daysOfTheWeek[date.getDay()];
  
    // show date in two digits
    if (day < 10) {
      day = '0' + day;
    }
    // now we have day, month and year
    // arrange them in the format we want
    return dayOfWeek + ' ' + month + ' ' + day + ', ' + year;
}