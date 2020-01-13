/*
Controlling function for switching squadrons, calls functions to:
    Change image in SQDImage
    Populate the calendar
 */
function switchSquadron(){
    getImageSrc();
    populateCalendar()
}

/*
Getting image source to change displayed squadron emblem
 */
function getImageSrc(){
    //pull value from squadron dropdown
    let selectedSquadron = $("#squadronSelect").val();

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let imageSource = JSON.parse(xhttp.responseText);
            imageSource = 'sqdImages/'+imageSource;
            $("#SQDImage").attr("src", imageSource);
        }
    };

    xhttp.open("POST", "scripts/sqdinfoquery.php", true);
    //sending selected squadron as part of the SQL query
    xhttp.send(JSON.stringify(selectedSquadron));
}

/*
    Need to get BUNOs associated with Squadron selected in order to populate the calendar, need to pull in BUNOs and
        maintenance dates associated with the selected SQUADRON
 */
function populateCalendar(){
    calendarQuery()
}
function calendarQuery(){
    let xhttp = new XMLHttpRequest();
    let selectedSquadron = $('#squadronSelect').val();
    let outputArray = new Array();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            outputArray = JSON.parse(xhttp.responseText);
            addCalendarElements(outputArray);
        }
    };
    xhttp.open("POST", "scripts/calendarquery.php", true);
    xhttp.send(JSON.stringify(selectedSquadron));
}
 function addCalendarElements(inputArray){
 }



