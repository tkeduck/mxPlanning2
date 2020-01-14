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
     // Using current date to indicate the start of the calendar, will cycle through maintenance events to test if
     // current date is equal to a maintenance date in order to create a maintenance calendar element
     let numberOfBunos = inputArray.length;
     let mxWindowStartArray = new Array();
     let currentDateMXItems = new Array();
     for(i=0; i<numberOfBunos; ++i){
         let currentDate = moment().add(-3,'days').format("MM/DD/YYYY");
         let currentBuno = inputArray[i][0];
         let daysUntilMXItem = 0;
         $('#bunosAndMx').append('<span id="'+currentBuno+'"></span>');
         let bunoHtml =  '<span id="label'+currentBuno+'" class = "bunoCalendarElement">'+currentBuno+'</span>';
         $('#bunoLabel').append(bunoHtml);
         mxWindowStartArray=[];
         //Converting the maintenance due date into a window start date in order to rend to the calendar
         for(k=2; k<12; ++k){
             let mxItemDueDate = inputArray[i][k];
             let mxWindowStart = moment(mxItemDueDate).add(-3, 'days').format('MM/DD/YYYY');
              mxWindowStartArray.push(mxWindowStart)
         }
         //cycling through the amount of days in order to determine if MC or NMC or MC-MX
         let mxWindowCounter=0;
         let calendarEleClass = 'mc';
         let calendarEleLabel = 'MC';
         for(j=-3; j<36; ++j){
             currentDateMXItems=[];
             for(l = 0; l<11; ++l){
                 if(mxWindowStartArray[l] == currentDate){
                     currentDateMXItems.push(l);

                }
            }
             //Need to allow for several differnt classes, planes are either MC or NMC based upon their required mainte
             // requirement for that day there is +-3 days from the due date to get the mainteance done so this is the
             // mx window, need to allow them to move the maintenance event around in that window to allow for planning
            if(currentDateMXItems.length >0){
                 calendarEleClass = 'mxWindow';
                 calendarEleLabel = 'MX Window';
                 mxWindowCounter = 6;
            }else if(mxWindowCounter==4||mxWindowCounter==3||mxWindowCounter==2){
                calendarEleClass = 'maintenance';
                calendarEleLabel = 'Mx Start';
                mxWindowCounter = mxWindowCounter-1;
            }
            else if(mxWindowCounter>0){
                 calendarEleClass = 'mxWindow';
                 calendarEleLabel = 'MX Window';
                 mxWindowCounter = mxWindowCounter-1;
            }else{
                calendarEleClass = 'mc';
                calendarEleLabel = 'MC';
            }


             currentDate = moment().add(j,'days').format('MM/DD/YYYY');
             //let calendarEleHTML = '<div class="'+calendarEleClass+'">'+calendarEleLabel+'</div>';
             let calendarEleHTML='<span class="'+calendarEleClass+'">'+calendarEleLabel+' </span>';
             if(j==35){
                 calendarEleHTML = '<span class="'+calendarEleClass+'">'+calendarEleLabel+'</span><br>';
             }
             //let calendarEleHTML='<span class="'+calendarEleClass+'">'+calendarEleLabel+' </span>';
             $('#'+currentBuno).append(calendarEleHTML);

        }

     }



 }



