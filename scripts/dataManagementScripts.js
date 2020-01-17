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
             let mxWindowStart = moment(mxItemDueDate).add(-4, 'days').format('MM/DD/YYYY');
              mxWindowStartArray.push(mxWindowStart)
         }
         //cycling through the amount of days in order to determine if MC or NMC or MC-MX
         let mxWindowCounter=0;
         let calendarEleClass = 'mc';
         let calendarEleLabel = 'MC';
         for(j=-3; j<36; ++j){
             currentDateMXItems=[];
             let lastElement = false;
             for(l = 0; l<11; ++l){
                 if(mxWindowStartArray[l] == currentDate){
                     currentDateMXItems.push(l);

                }
            }
             //Need to allow for several different classes, planes are either MC or NMC based upon their required mainte
             // requirement for that day there is +-3 days from the due date to get the mainteance done so this is the
             // mx window, need to allow them to move the maintenance event around in that window to allow for planning
            if(currentDateMXItems.length >0){
                 calendarEleClass = 'mxWindow';
                 calendarEleLabel = 'MX Window';
                 mxWindowCounter = 6;
                $('#'+currentBuno).append('<span id="'+currentBuno+'MxWindow"></span>');
            }else if(mxWindowCounter==4){

                let mxDateHtml = '<span id="'+currentBuno+'MxDates" ></span>';
                $('#'+currentBuno+'MxWindow').append(mxDateHtml);
                calendarEleClass = 'maintenance';
                calendarEleLabel = 'Mx Start';
                mxWindowCounter = mxWindowCounter-1;
            } else if(mxWindowCounter==3||mxWindowCounter==2){
                calendarEleClass = 'maintenance';
                calendarEleLabel = 'Mx Start';
                mxWindowCounter = mxWindowCounter-1;

            } else if(mxWindowCounter>0){
                 calendarEleClass = 'mxWindow';
                 calendarEleLabel = 'MX Window';
                 if(mxWindowCounter==1){
                     lastElement=true
                 }
                 mxWindowCounter = mxWindowCounter-1;
            }else{
                calendarEleClass = 'mc';
                calendarEleLabel = 'MC';
            }


             currentDate = moment().add(j,'days').format('MM/DD/YYYY');
             let calendarEleHTML='<span class="'+calendarEleClass+'" id="'+currentBuno+'Day'+j+'">'+calendarEleLabel+' </span>';
             if(j==35){
                 calendarEleHTML = '<span class="'+calendarEleClass+'"  id="'+currentBuno+'Day'+j+'"  >'+calendarEleLabel+'</span><br>';
             }



            if( mxWindowCounter == 3 || mxWindowCounter==2||mxWindowCounter==1){
              $('#'+currentBuno+'MxDates').append(calendarEleHTML);
            }else if(lastElement==true){
                $('#'+currentBuno+'MxWindow').append(calendarEleHTML);
            } else if(mxWindowCounter>0){
                $('#'+currentBuno+'MxWindow').append(calendarEleHTML);
                $('#'+currentBuno+'MxWindow').sortable({
                    helper: 'clone',
                    forceHelperSize: true,
                    axis: 'x',
                    placeholder: 'sortable-placeholder',
                    revert: true,
                    //activate: function(event, ui){dragFunction(ui.item.attr('id'))},
                    //start: function(event, ui){dragFunction(ui.item.attr('id'))}
                    //stop:  function(event, ui){dragFunction(ui.item.attr('id'))}
                });
            }else {
                $('#' + currentBuno).append(calendarEleHTML);
            }
        }

     }
 }

 function dragFunction(idName){
     //console.log(idName);
     //let output = $('#'+idName+':first-child').attr('id')
     //$('#'+idName).siblings('#735914Day8').css('background-color','red');
     let output = $('#'+idName).siblings();
     //console.log(output[0].id);
     for(i=0;i<6;++i){
         let nameToTest = output[i].id;
         //console.log(output[5].id)
         console.log(nameToTest)
         /*
         if(nameToTest == idName){
             console.log(nameToTest);
             console.log(idName)
             console.log(output)
             //console.log(i);
             //console.log(output[i].id);
             //console.log(output[i])
             //console.log(output)
         }*/
     }



 }



