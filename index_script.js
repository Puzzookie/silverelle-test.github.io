const database = firebase.database();
var ref;
var snapshotObj = {};

firebase.auth().onAuthStateChanged(function(user) 
{
    if (user) 
    {
        //Signed in
        fetch('http://worldclockapi.com/api/json/utc/now')
        .then(response => response.json())
        .then(data => {
            const currentDateTime = data.currentDateTime;
            const epochTime = Math.floor(new Date(currentDateTime).getTime());
            setDatePicker(epochTime);
            document.getElementById('appointmentPicker').value = "default";
            onPickerChanged();
        })
        .catch(error => {
            document.getElementById("loader").style.display = "none";
        });
    } 
    else 
    {
        //Not signed in
        document.location.href = "login.html";
    }
});

function setDatePicker(timestamp)
{
    var date = getMountainTime(timestamp);

    document.getElementById('datePicker').value = datePickerFormat(date);
    document.getElementById('datePicker').defaultValue = datePickerFormat(date);

    document.getElementById('datePicker').setAttribute("min", datePickerFormat(date));
    document.getElementById('datePicker').setAttribute("max", getMaxDate(date));
}

function createTableHeader()
{
    var selectedDay = document.getElementById("datePicker").value;

    var table = document.getElementById("myTable");
    var innerTable = "<tr>";

    var timestamp = mountainTimestamp(selectedDay);

    var date = readableHeader(getMountainTime(timestamp));

    innerTable += "<th name=" + timestamp + " id=day0>" + date + "</th>";
   
    innerTable += "</tr>";
    table.innerHTML = innerTable;

    //createAppointmentTable();
}

function onPickerChanged()
{
    document.getElementById("loader").style.display = "block";
    document.getElementById("textBody").style.display="none";
    createTableHeader();
    subscribeToChanges();
}

// Subscribe to all event changes using the updated reference
function subscribeToChanges() 
{
  var selectedDay = document.getElementById("datePicker").value;

  if(ref)
  {
    ref.off();
  }

  ref = database.ref(selectedDay);

  ref.on('value', function(snapshot) {
        snapshotObj = {};

      if(snapshot.val() != null)
      {
          update(snapshot);
      }
      else
      {
          console.log("It's null");
          createTable();
      }
  });
}

function createTable()
{
    createTableHeader();
    createAppointmentTable();

    const select = document.getElementById('appointmentPicker');
    const selectedIndex = select.selectedIndex;
    const selectedOption = select.options[selectedIndex];
    const selectedValue = selectedOption.value;

    var table = document.getElementById("myTable");
    var innerTable = "";

    if(selectedValue == "default")
    {
        document.getElementById("loader").style.display = "none";
        document.getElementById("textBody").style.display="block";
        return;
    }
    var selectedDay = document.getElementById("datePicker").value;
    var timestamp = mountainTimestamp(selectedDay);

    var startDay = getMountainTime(timestamp);
    var firstTime = mountainDate(new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDate(), startDay.getHours() + 10, startDay.getMinutes()));
    var lastTime = mountainDate(new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDate(), startDay.getHours() + 17, startDay.getMinutes()));

    var allPossible = [];

    for(let i = Date.parse(firstTime); i < (Date.parse(lastTime)); i += 900000)
    {
        allPossible.push(i);
    }

    for(const key in snapshotObj)
    {
        if(snapshotObj.hasOwnProperty(key))
        {
            for(const key2 in snapshotObj[key])
            {
                if(snapshotObj[key].hasOwnProperty(key2))
                {
                    for(const key3 in snapshotObj[key][key2])
                    {
                        if(snapshotObj[key][key2].hasOwnProperty(key3))
                        {
                            if(key3 == "allValues")
                            {
                                for(let i = 0; i < snapshotObj[key][key2][key3].length; i++)
                                {
                                    let index = allPossible.indexOf(snapshotObj[key][key2][key3][i]); // returns 2
                                    allPossible.splice(index, 1);
                                }
                            }
                            
                        }
                    }
                }
            }
        }
    }    

    if(selectedValue != "default")
    {
        var split = selectedValue.split('-');
        var splitAgain = split[1].split(' ');

        var minutes = splitAgain[1];
        
        for(let i = 0; i < allPossible.length; i++)
        {
            var start = parseInt(allPossible[i]);
            var end = start + (parseInt(minutes) * 60000);

            var valid = true;
            for(let j = start; j < end; j += 900000)
            {
                if (!allPossible.includes(j))
                {
                    valid = false;
                }
            }

            if(valid)
            {
                innerTable += "<tr>"

                innerTable += "<td>" + "<button style='display: block; margin: 0 auto;' id=" + allPossible[i] + " onclick='onClickEvent(this)' type='button'>" +  readableTime(getMountainTime(allPossible[i])) + "</button></td>";    
    
                innerTable += "</tr>";
            }
        }
    }

    table.innerHTML += innerTable;

    document.getElementById("loader").style.display = "none";
    document.getElementById("textBody").style.display="block";
}

function createAppointmentTable()
{
    var appointmentTable = document.getElementById("myAppointmentTable");
    appointmentTable.innerHTML = "";
    var innerTable = "<tr>";

    innerTable += "<th>" + "My Appointments" + "</th>";
   
    innerTable += "</tr>";
    appointmentTable.innerHTML = innerTable;

    innerTable = "";

    const uid = firebase.auth().currentUser.uid; // Get the current user's UID

    var exists = false;
    for(const key in snapshotObj)
    {
        //console.log("Key: " + key);

        if(key == uid)
        {

            if(snapshotObj.hasOwnProperty(key))
            {
                for(const key2 in snapshotObj[key])
                {
                    if(snapshotObj[key].hasOwnProperty(key2))
                    {
                        exists = true;

                        var appointmentType = "";
                        var startingTimestamp = "";
                        for(const key3 in snapshotObj[key][key2])
                        {
                            if(snapshotObj[key][key2].hasOwnProperty(key3))
                            {
                                if(key3 == "selectedValue")
                                {
                                    for(let i = 0; i < snapshotObj[key][key2][key3].length; i++)
                                    {
                                        appointmentType += snapshotObj[key][key2][key3][i];
                                    }
                                }

                                if(key3 == "allValues")
                                {
                                    startingTimestamp = snapshotObj[key][key2][key3][0];
                                }
                                
                            }
                        }
                
                        innerTable += "<tr>"

                        var x = appointmentType + " at " + readableTime(getMountainTime(startingTimestamp));

                        innerTable += "<td>" + "<button style='display: block; margin: 0 auto;' id=" + key2 + " name='" + x + "' onclick='onDeleteEvent(this)' type='button'>" + x + "</button></td>";    

                        innerTable += "</tr>";
                        
                    }
                }
            }
        }
        
    } 

    if(exists == false)
    {
        innerTable += "<tr><td>You have no scheduled appointments on this day</td></tr>";
    }

    appointmentTable.innerHTML += innerTable;

}
function update(snapshot)
{
    if(snapshot.exists())
    {

        snapshot.forEach((userId) => 
        {
            const userIdKey = userId.key;
            const userValue = userId.val();
            snapshotObj[userIdKey] = userValue;

        });

        createTable();

    }
}

function onClickEvent(button)
{
    //Need cancel option
    //Confirmation pop
    //If you've already passed that time in the day, you can't book it


    const select = document.getElementById('appointmentPicker');
    const selectedIndex = select.selectedIndex;
    const selectedOption = select.options[selectedIndex];
    const selectedValue = selectedOption.value;

    if (window.confirm("Are you sure you want to book this " + selectedValue + " at " + readableTime(getMountainTime(parseInt(button.id))) + "?")) {
        // User clicked "OK"
        // Code to delete the record goes here

    if(selectedValue != "default")
    {

        var split = selectedValue.split('-');
        var splitAgain = split[1].split(' ');

        var minutes = splitAgain[1];

        var start = parseInt(button.id);
        var end = (start + minutes * 60000);

        const allValues = [];

        for(let i = start; i < end; i += 900000)
        {
            allValues.push(i);
        }
        var selectedDay = document.getElementById('datePicker').value;
        const uid = firebase.auth().currentUser.uid; // Get the current user's UID

        database.ref(`${selectedDay}/${uid}/`).push({
            allValues,
            selectedValue
        });
    }   
      } else {
        // User clicked "Cancel"
        // Code to cancel the delete goes here
      }
    
}

function onDeleteEvent(button)
{
    if (window.confirm("Are you sure you want to delete " + button.name + "?")) 
    {
       
        var selectedDay = document.getElementById('datePicker').value;
        const uid = firebase.auth().currentUser.uid; // Get the current user's UID

        database.ref(`${selectedDay}/${uid}/${button.id}`).remove()
        .then(function() {
          console.log("Data removed successfully.");
        })
        .catch(function(error) {
          console.error("Data could not be removed: ", error);
        });
    }   
    
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

function getMaxDate(day)
{
    var dd = day.getDate();
    var mm = day.getMonth() + 1;
    var yyyy = day.getFullYear();
  
    if(dd<10) {
        dd = '0'+dd
    } 
  
    if(mm<10) {
        mm = '0'+mm
    } 
  
    day = (parseInt(yyyy) + 1) + '-' + mm + '-' + dd;
    return day;}

function datePickerFormat(day)
{
    var dd = day.getDate();
    var mm = day.getMonth() + 1;
    var yyyy = day.getFullYear();
  
    if(dd<10) {
        dd = '0'+dd
    } 
  
    if(mm<10) {
        mm = '0'+mm
    } 
  
    day = yyyy + '-' + mm + '-' + dd;
    return day;
}

function logout()
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