/*
Controlling function for switching squadrons, calls functions to:
    Change image in SQDImage
    Populate the calendar
 */
function switchSquadron(){
    clearCurrentSchedule();
    getImageSrc();
    populateCalendar();
    populateOpsSpinners()
    $('#expectedFlightDateButton').data('clicked', false)
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
            getBUNOConfig(outputArray)
            storeMxDates(outputArray)
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
         $("#bunoLabel").data('numBunos', numberOfBunos);
         let currentDate = moment().add(-3,'days').format("MM/DD/YYYY");
         let currentBuno = inputArray[i][0];
         let currentModex= inputArray[i][12];
         $('#bunoLabel').data('BUNO'+i,currentBuno);
         $('#bunosAndMx').append('<span class="emptyClassRemoval" id="'+currentBuno+'"></span>');
         let bunoHtml =  '<span id="label'+currentBuno+'" class = "bunoCalendarElement">'+currentBuno+'<br>'+currentModex+'</span>';
         $('#bunoLabels').append(bunoHtml);
         $('#label'+currentBuno).data('numMXWindows', 0);
         $('#label'+currentBuno).data('clicked', false);
         //bunoQueryTwo(currentBuno);
         //flightScheduleQuery(currentBuno);
         mxWindowStartArray=[];
         //Converting the maintenance due date into a window start date in order to render to the calendar
         for(k=2; k<12; ++k){
             let mxItemDueDate = inputArray[i][k];

             let mxWindowStart = moment(mxItemDueDate).add(-4, 'days').format('MM/DD/YYYY');
              mxWindowStartArray.push(mxWindowStart)
         }
         //cycling through the amount of days in order to determine if MC or NMC or MC-MX
         let mxWindowCounter=0;
         let calendarEleClass = 'mc';
         let calendarEleLabel = 'MC';
         let mxEventCounter = 1;
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
                 calendarEleLabel = '<i class="material-icons">build</i>';
                 mxWindowCounter = 6;
                $('#'+currentBuno).append('<span id="'+currentBuno+'MxWindow'+mxEventCounter+'"></span>');
                $('#label'+currentBuno).data('endPos'+mxEventCounter, 3);
                let numberMxWindows = $('#label'+currentBuno).data('numMXWindows');
                numberMxWindows = numberMxWindows+1;
                $('#label'+currentBuno).data('numMXWindows', numberMxWindows);

                for(x = 0; x<currentDateMXItems.length; ++x){
                    $('#'+currentBuno+'MxWindow'+mxEventCounter).data('mxItem'+x,currentDateMXItems[x]);
                    $('#'+currentBuno+'MxWindow'+mxEventCounter).data('numberMXItems', x+1)

                }

            }else if(mxWindowCounter==4){

                let mxDateHtml = '<span  id="'+currentBuno+'MxDates'+mxEventCounter+'" ></span>';
                $('#'+currentBuno+'MxWindow'+mxEventCounter).append(mxDateHtml);
                calendarEleClass = 'maintenance';
                calendarEleLabel = '<i class="material-icons">build airplanemode_inactive</i>';
                mxWindowCounter = mxWindowCounter-1;
            } else if(mxWindowCounter==3||mxWindowCounter==2){
                calendarEleClass = 'maintenance';
                calendarEleLabel = '<i class="material-icons">build airplanemode_inactive</i>';
                mxWindowCounter = mxWindowCounter-1;

            } else if(mxWindowCounter>0){
                 calendarEleClass = 'mxWindow';
                 calendarEleLabel = '<i class="material-icons">build</i>';
                 if(mxWindowCounter==1){
                     lastElement=true
                 }
                 mxWindowCounter = mxWindowCounter-1;
            }else{
                calendarEleClass = 'mc';
                calendarEleLabel = '<i class="material-icons">airplanemode_active</i> ';
            }

             currentDate = moment().add(j,'days').format('MM/DD/YYYY');
             let calendarEleHTML='<span class="'+calendarEleClass+'" id="'+currentBuno+'Day'+j+'">'+calendarEleLabel+''+
                 '</span>';
             if(j==35){
                 calendarEleHTML = '<span class="'+calendarEleClass+'"  id="'+currentBuno+'Day'+j+'"  >'+
                     calendarEleLabel+'<br></span><br>';
             }



            if( mxWindowCounter == 3 || mxWindowCounter==2||mxWindowCounter==1){
              $('#'+currentBuno+'MxDates'+mxEventCounter).append(calendarEleHTML);
            }else if(lastElement==true){
                $('#'+currentBuno+'MxWindow'+mxEventCounter).append(calendarEleHTML);
                ++mxEventCounter
            } else if(mxWindowCounter>0){
                $('#'+currentBuno+'MxWindow'+mxEventCounter).append(calendarEleHTML);
                $('#'+currentBuno+'MxWindow'+mxEventCounter).sortable({
                    helper: 'clone',
                    forceHelperSize: true,
                    axis: 'x',
                    placeholder: 'sortable-placeholder',
                    revert: true,
                    //activate: function(event, ui){dragFunction(ui.item.attr('id'))},
                    //start: function(event, ui){logStartPosition(ui.item.attr('id'))},
                    //beforeStop:  function(event, ui){dragFunction(ui.item.attr('id'))},
                    //sort:function(event, ui){dragFunction(ui.item.attr('id'))},
                    stop:  function(event, ui){dragFunction(ui.item.attr('id'))}
                });
            }else {
                $('#' + currentBuno).append(calendarEleHTML);
            }
            $('#'+currentBuno+'Day'+j).data('expectedFlightDate', false)
            $('#label'+currentBuno).data('budgetedHours',0)
             if(j==-1){
                 $('#'+currentBuno+'Day'+j).addClass('lastPastDatesCalendarEle');
                 //console.log('test')
             }

        }
         //renderFlightSchedule(currentBuno)
         flightScheduleQuery(currentBuno);
     }
    $('.bunoCalendarElement').on('click', function(){
        let id = $(this).attr('id');
        loadBunoDetails(id)
    });

}

function flightScheduleQuery(buno){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            //console.log(JSON.parse(xhttp.responseText));
            let outputArray = JSON.parse(xhttp.responseText);
            storeFlightSchedule(outputArray, buno);
            //renderFlightSchedule(outputArray, buno)

        }
    };

    xhttp.open("POST", "scripts/flightScheduleQuery.php", true);
    xhttp.send(JSON.stringify(buno));


}
function storeFlightSchedule(flightSchedule, buno){
    let flattenedArray = new Array()
    for(i=0; i<flightSchedule.length;++i){
        flattenedArray[i]=flightSchedule[i][0]
    }
    bunoQueryTwo(flightSchedule, buno,);
    let bunoEle = $('#label'+buno);
    bunoEle.data('flightSchedule', flattenedArray);

}


function bunoQueryTwo(flightSchedule,buno){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let dynamicInfoArray = JSON.parse(xhttp.responseText);
            storeBunoDynInfo(dynamicInfoArray, buno);
            let scheduledArray = new Array(7)
            scheduledArray.fill(false)
            renderFlightSchedule(flightSchedule,dynamicInfoArray,buno,scheduledArray)
        }
    };

    xhttp.open("POST", "scripts/dynamicComponentsQuery.php", true);
    xhttp.send(JSON.stringify(buno));

}
function storeBunoDynInfo(inputArray, buno){
    let bunoEle = $('#label'+buno);
    bunoEle.data('currentFlightHours', inputArray[0][8])
    bunoEle.data('dynamicComponents', inputArray);

}








 function logStartPosition(idName){
     let nameParent =$('#'+idName).parent();
     let parentId = nameParent[0].id;
     let mxWindowNumber = parentId.substr(-1);
     let buno = idName.substr(0,6);
     let startPos = $('#'+buno+'MxDates'+mxWindowNumber).index();
     $('#label'+buno).data('startPos', startPos)

 }
 function dragFunction(idName){
    let nameParent =$('#'+idName).parent();
     let parentId = nameParent[0].id;
     let mxWindowNumber = parentId.substr(-1);
     let buno = idName.substr(0,6);
     let endPos = $('#'+buno+'MxDates'+mxWindowNumber).index();
     $('#label'+buno).data('endPos'+mxWindowNumber, endPos);
     for(i=0;i<8;++i){
         if($('#'+parentId).find('span').eq(i).hasClass('maintenance')== true) {
             //left empty for now, initially used it but dont want to change the if statement until later
         }else if($('#'+parentId).find('span').eq(i).hasClass('mxWindow') &&  (i==3 || i==4 || i==5||i==6)){
             $('#' + parentId).find('span').eq(i).css('background-color', '#e65c00');
             $('#' + parentId).find('span').eq(i).html('<i class="material-icons">compare_arrows</i>');
         }else if($('#'+parentId).find('span').eq(i).hasClass('mxWindow')){
             $('#' + parentId).find('span').eq(i).css('background-color', 'forestgreen');
             $('#' + parentId).find('span').eq(i).html('<i class="material-icons">build</i>');
         }
     }


 }

/*
Functions below are used to save the modified schedule to the server to allow for the approval process to begin
 */
function saveSubmit(){

    saveOpsDetails();
    let numberBunos = $('#bunoLabel').data('numBunos');

    for( i = 0; i< numberBunos; ++i){

        let currentBuno = $('#bunoLabel').data('BUNO'+i);
        let numMXWindows = $('#label'+currentBuno).data('numMXWindows');
        let numMXEvents = 0;
        let mxArray = new Array();
        let squadronName = $('#squadronSelect').val();
        let mxItemName = '';
        for(j=0; j<=numMXWindows; ++j){
            numMXEvents= $('#'+currentBuno+'MxWindow'+j).data('numberMXItems');
            mxArray=[];
            mxArray.push(currentBuno);
            mxArray.push(squadronName);
            for(k=0;k<numMXEvents;++k){
                let currentMxItem = $('#'+currentBuno+'MxWindow'+j).data('mxItem'+k);
                switch(currentMxItem){
                    case 0:
                        mxItemName ='14day';
                        break;
                    case 1:
                        mxItemName='28day';
                        break;
                    case 2:
                        mxItemName='84day';
                        break;
                    case 3:
                        mxItemName='112day';
                        break;
                    case 4:
                        mxItemName='168day';
                        break;
                    case 5:
                        mxItemName='336day';
                        break;
                    case 6:
                        mxItemName='365day';
                        break;
                    case 7:
                        mxItemName='728day';
                        break;
                    case 8:
                        mxItemName='14day2';
                        break;
                    case 9:
                        mxItemName='28day2';
                        break;
                }


                mxArray.push(mxItemName)
            }
            let endPos = $('#label'+currentBuno).data('endPos'+j);
            let mxWindowDateOffset = 0;
            //The index call returns where the MxWindow is, need to also find the position of the MXdates inside that
            //div so we need to convert
            mxWindowDateOffset = $('#'+currentBuno+'MxWindow'+j).index();
            if(endPos==0){
                mxWindowDateOffset=mxWindowDateOffset-3
            }else if(endPos==1){
                mxWindowDateOffset=mxWindowDateOffset-2
            }else if(endPos==2){
                mxWindowDateOffset=mxWindowDateOffset-1
            }else if(endPos==4){
                mxWindowDateOffset=mxWindowDateOffset+1
            }
            //Need to add 3 to the offset because the days in the mxWindow div are not included in the index,
            // so if there are two MXwindows the 2nd date would be recorded as 3 days earlier, the 3rd date would be 6
            // dates earlier and so on
            if(j>1){
                mxWindowDateOffset=mxWindowDateOffset+j*3;
            }
            let mxDate = moment().add(mxWindowDateOffset,'days').format('MM/DD/YYYY');
            mxArray.push(mxDate);
            sendProposedSchedule(mxArray,numMXWindows,j);




        }





    }


}
function sendProposedSchedule(mxArray, numMXWindows, currentCounter){

    //pull value from squadron dropdown
    mxArray.unshift(numMXWindows,currentCounter);
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(JSON.parse(xhttp.responseText))
        }
    };

    xhttp.open("POST", "scripts/sendProposedSchedule.php", true);
    xhttp.send(JSON.stringify(mxArray));
}


function loadProposedSchedule(){
    getProposedCalendarDates()

}
function clearCurrentSchedule(){
    $('#bunoLabels').html('');
    $('.mc').remove();
    $('.mxWindow').remove();
    $('.maintenance').remove();
    $('.emptyClassRemoval').remove()
}
function getProposedCalendarDates(){
    let xhttp = new XMLHttpRequest();
    let selectedSquadron = $('#squadronSelect').val();
    let outputArray = new Array();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            outputArray = JSON.parse(xhttp.responseText);
            proposedCalendarQueryOrig(outputArray)

        }
    };
    xhttp.open("POST", "scripts/proposedCalendarQuery.php", true);
    xhttp.send(JSON.stringify(selectedSquadron));


}
function proposedCalendarQueryOrig(proposedArray){
    let xhttp = new XMLHttpRequest();
    let selectedSquadron = $('#squadronSelect').val();
    let outputArray = new Array();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            outputArray = JSON.parse(xhttp.responseText);
            calendarProposedDisplay(proposedArray,outputArray)
            //addProposedCalendarElements(proposedArray, outputArray)
        }
    };
    xhttp.open("POST", "scripts/calendarquery.php", true);
    xhttp.send(JSON.stringify(selectedSquadron));

}
function calendarProposedDisplay(proposedArray, originalArray){
    let numberOfBunos = proposedArray.length;
    for(i=0; i<numberOfBunos; ++i){
        let currentBuno = proposedArray[i][0];
        let numberMxWindows = $('#label'+currentBuno).data('numMXWindows');
        for(j = 1; j<=numberMxWindows;++j) {
            let numberMXItems = $('#' + currentBuno + 'MxWindow' + j).data('numberMXItems');
            let mxNumber = $('#' + currentBuno + 'MxWindow' + j).data('mxItem0');
            if(proposedArray[i][mxNumber+2]!= originalArray[i][mxNumber+2]){
                let proposedDate = moment(proposedArray[i][mxNumber+2]);
                let originalDate = moment(originalArray[i][mxNumber+2]);
                let dateDiff = originalDate.diff(proposedDate,'days');
                let appendAfterID = $('#' + currentBuno + 'MxWindow' + j+' span').eq(dateDiff).attr('id');
                let detachedElement = $('#'+currentBuno+'MxDates'+j).detach();
                if(dateDiff==3){
                    dateDiff = 0;
                    appendAfterID = $('#' + currentBuno + 'MxWindow' + j+' span').eq(dateDiff).attr('id');
                    detachedElement.insertBefore($('#'+appendAfterID))
                }else {
                    detachedElement.insertAfter($('#' + appendAfterID));
                }

            }
            for(x=0;x<8;++x){
                if($('#'+ currentBuno + 'MxWindow' + j).find('span').eq(x).hasClass('maintenance')== true) {
                    //left empty for now, initially used it but dont want to change the if statement until later
                }else if($('#'+ currentBuno + 'MxWindow' + j).find('span').eq(x).hasClass('mxWindow') &&  (x==3 || x==4 || x==5||x==6)){
                    $('#' + currentBuno + 'MxWindow' + j).find('span').eq(x).css('background-color', '#e65c00');
                    $('#' + currentBuno + 'MxWindow' + j).find('span').eq(x).html('Orig MX Date');
                }else if($('#'+ currentBuno + 'MxWindow' + j).find('span').eq(x).hasClass('mxWindow')){
                    $('#'+ currentBuno + 'MxWindow' + j).find('span').eq(x).css('background-color', 'forestgreen');
                    $('#' + currentBuno + 'MxWindow' + j).find('span').eq(x).html('MX Window');
                }
            }


        }



    }


}
/*
Functions below are used to populate ops schedule spinners
 */

function getBUNOConfig(inputArray){
    let numberBunos = inputArray.length;
    let bunoArray = new Array();
for(i=0;i<numberBunos;++i){
    let bunoToAdd = inputArray[i][0];
    bunoArray.push(bunoToAdd)
}
    $('#SQDImage').data('bunoArray',bunoArray);
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let outputArray = JSON.parse(xhttp.responseText);
            //console.log(outputArray);
            distributeBunoConfig(outputArray);

        }
    };

    xhttp.open("POST", "scripts/packageQuery.php", true);
    xhttp.send(JSON.stringify(bunoArray));
}



function distributeBunoConfig(inputArray){

    let numberBunos = inputArray.length;

    for(i=0;i<numberBunos;++i){
        let currentArray = inputArray[i][0];
        let currentBuno = currentArray[0];
        let numberOfPkgs=currentArray.length;
        for(j=1;j<=numberOfPkgs;++j){
            let pkgStatus = currentArray[j];
            $('#label'+currentBuno).data('package'+j,pkgStatus)
        }
    }

}


function filterBunos() {
    let bunos = $('#SQDImage').data('bunoArray');
    let numberBunos = bunos.length;
    let currentSelectedFiltersArray = new Array();
    let filteredStatus = false
    for (x = 1; x < 6; ++x) {
        let checkedState = $('#checkbox' + x).prop('checked');
        currentSelectedFiltersArray.push(checkedState);
    }

    for (j = 0; j < 5; ++j) {
        let filterSelected = currentSelectedFiltersArray[j];
        for (i = 0; i < numberBunos; ++i) {
            let currentBuno = bunos[i];
            let number = j + 1;
            let pkgStatus = $('#label' + currentBuno).data('package' + number);
            if (pkgStatus == 0 && filterSelected == true) {
                 filteredStatus = true
                $('#label' + currentBuno).hide();
                $('#' + currentBuno).hide()
            }
            if(filteredStatus==false){
                $('#label' + currentBuno).show();
                $('#' + currentBuno).show()
            }
        }


    }
}





function populateOpsSpinners(){
    let squadronName = squadronSelect.value;
    var xhttp = new XMLHttpRequest();
    let outputArray = new Array;
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let outputArray = JSON.parse(xhttp.responseText);
            for(i = 1; i<37; ++i){
                var spinner = $('#opsSpinner'+i).spinner().val(outputArray[i-1][2]);
                if(i==1){
                    var spinner = $('#opsSpinner1').spinner().val(outputArray[0][2]);

                }
            }
        }

    };

    xhttp.open("POST", "scripts/populateOpsSpinners.php", true);
    xhttp.send(JSON.stringify(squadronName));


}


function saveOpsDetails(){
    let opsNeedArray = new Array();
    let todayDate = moment().format('YYYY-MM-DD');
    let squadronName = squadronSelect.value;
    //todayDate = moment()
    opsNeedArray[0]= squadronName;
    let j =1;
    for( i = 1; i<37; ++i){
        var spinner = $('#opsSpinner'+i).spinner();
        opsNeedArray[i]= spinner.val();
        opsNeedArray[i+36] = todayDate;
        todayDate = moment().add(j, 'days').format('YYYY-MM-DD');
        ++j;
    }
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log('saveOpsDetails');

        }
    };

    xhttp.open("POST", "scripts/saveDataToDB.php", true);
    xhttp.send(JSON.stringify(opsNeedArray));

}






function expectedFlightDateTool(){

    if($('#expectedFlightDateButton').data('clicked')==true){
        $('#expectedFlightDateButton').data('clicked', false);
        $('#expectedFlightDateButton').css('background-color', 'lightgrey');
        $('.mc').unbind('click');
        $('.mxWindow').unbind('click');
        $('#efdHoursSpinner').css('display', 'none')

    }else if($('#expectedFlightDateButton').data('clicked')==false){
        clearFlightCount()
        $('#expectedFlightDateButton').data('clicked',true);
        $('#expectedFlightDateButton').css('background-color', 'tan');
        var spinner = $('#efdHoursSpinner').spinner();
        spinner.spinner()
        $('#efdHoursSpinner').css('display','inline-block');
        $('.mxWindow').on('click', function(){
            var id = $(this).attr('id');
            if($('#'+id).data('expectedFlightDate')==false) {
                let flightHours = $('#efdHoursSpinner').val();
                $('#'+id).append(' &emsp;<i class="material-icons">flight_takeoff</i>'+flightHours);
                $('#' + id).data('expectedFlightDate', true);
                assignHours(flightHours, id)
                manageFlightNumber(1,id)
                clearFlightCount()
            } else if($('#'+id).data('expectedFlightDate')==true){
                $('#'+id).html('<i class="material-icons">build</i>');
                $('#' + id).data('expectedFlightDate', false);
                manageFlightNumber(-1,id)
                let flightHours = $('#efdHoursSpinner').val();
                flightHours = flightHours*-1;
                assignHours(flightHours, id)
                clearFlightCount()
            }
        });

        $('.mc').on('click', function(){
            var id = $(this).attr('id');
            if($('#'+id).data('expectedFlightDate')==false) {
                let flightHours = $('#efdHoursSpinner').val();
                $('#'+id).append(' <i class="material-icons">flight_takeoff</i>'+flightHours);
                $('#' + id).data('expectedFlightDate', true);
                assignHours(flightHours, id)
                manageFlightNumber(1,id)
                clearFlightCount()


            } else if($('#'+id).data('expectedFlightDate')==true){
                $('#'+id).html('<i class="material-icons">airplanemode_active</i>');
                $('#' + id).data('expectedFlightDate', false);
                //let flightHours = $('#efdHoursSpinner').val();
                manageFlightNumber(-1,id)
               let  flightHours = $('#'+id).data('expectedFlightHours')*-1
                //console.log(flightHours)
                assignHours(flightHours, id)
                clearFlightCount()
            }
        });



    }


}

function manageFlightNumber(numberChange, id){
    let dateNumber = id.slice(9);
    let buno = id.slice(0,6);
    let date = moment().add(dateNumber,'days').format('MMDD');
    let dateElement = $('#date'+date);
    let currentFlights = dateElement.data('currentFlights');
    currentFlights= currentFlights + numberChange;
    dateElement.data('currentFlights', currentFlights);
    let spinnerNumber=parseInt(dateNumber)+1;
    let spinnerValue = $('#opsSpinner'+spinnerNumber).val();

    if(currentFlights<spinnerValue){
        //dateElement.css('backgroundColor', '#CC5500');
    }else{
        //dateElement.css('backgroundColor', '#454545');
    }



}


function assignHours(proposedFlightHours, id){
    let buno = id.slice(0,6);
    let dateNumber = id.slice(9);
    let bunoEle = $('#label'+buno);
    let dynamicCompArray = bunoEle.data('dynamicComponents');
    let currentlyBudgetedHours = bunoEle.data('budgetedHours');
    currentlyBudgetedHours = parseInt(currentlyBudgetedHours)+parseInt(proposedFlightHours);
    bunoEle.data('budgetedHours', currentlyBudgetedHours);
    let currentFlighthours= parseInt(dynamicCompArray[0][8]);

    let flightHourConvertedArray = new Array()
    for(i=1;i<8; ++i){
        flightHourConvertedArray[i]= currentFlighthours + parseInt(dynamicCompArray[0][i])

    }
    let currentDate = moment().add(dateNumber, 'days').format('MMDD');
    let currentFlightSchedule = new Array;
        currentFlightSchedule=bunoEle.data('flightSchedule');

    if(proposedFlightHours<0){
        let index = currentFlightSchedule.indexOf(currentDate+proposedFlightHours*-1);
        currentFlightSchedule.splice(index,1)
    }else{
    currentFlightSchedule.push(currentDate+proposedFlightHours);
    currentFlightSchedule.sort()
    }
    bunoEle.data('flightSchedule', currentFlightSchedule);
    let scheduledArray = bunoEle.data('scheduledArray')
    let otherCurrentFlightSchedule = new Array()
    //console.log(currentFlightSchedule)
    for(x=0;x<currentFlightSchedule.length;++x){
        let flightEntry = currentFlightSchedule[x]
        otherCurrentFlightSchedule.push([flightEntry, ''])
    }



    renderFlightSchedule(otherCurrentFlightSchedule,dynamicCompArray,buno,scheduledArray)


}

function renderFlightSchedule(flightSchedule,dynamicInfoArray,buno,scheduledArray){
    let dynamicCompArrayAdjusted = new Array()

    for(i=1;i<8;++i){
        let currentHours = parseInt(dynamicInfoArray[0][8])

        let adjustedMXHours = currentHours + parseInt(dynamicInfoArray[0][i]);
        dynamicCompArrayAdjusted[i-1]=adjustedMXHours
    }
    let bunoEle = $('#label'+buno)
    let currentHours = parseInt(bunoEle.data('currentFlightHours'));
    let totalAssignedHours = currentHours
    clearLeftInfoPanel()
    let toolTip=''
    for(i=0;i<flightSchedule.length;++i){
        let flightEntry = flightSchedule[i][0];
        let flightHours= flightEntry.slice(4,6);
        let currentFlightDate = flightEntry.slice(0,4);
        let todayFlights = $('#date'+currentFlightDate).data('currentFlights');
        todayFlights = todayFlights+1;
        $('#date'+currentFlightDate).data('currentFlights', todayFlights);

        let currentFlightDay = currentFlightDate.slice(2,4);
        let currentFlightMonth = currentFlightDate.slice(0,2);
        currentFlightMonth = currentFlightMonth-1;
        let currentYear= moment().year();
        currentFlightDate = moment([currentYear,currentFlightMonth, currentFlightDay]).format('MMDD');
        let today = moment().format('MMDD');
        //let difference = currentFlightDate.diff(today,'days')+1;

        let difference =currentFlightDate-today;
        let calendarEle = $('#'+buno+'Day'+difference)
        totalAssignedHours=totalAssignedHours+parseInt(flightHours)
        bunoEle.data('budgetedHours', totalAssignedHours-currentHours)
        let htCompHtml = ''
        for(j=0;j<8;++j){
            let scheduledStatus = scheduledArray[j];
            let hoursRequired = dynamicCompArrayAdjusted[j];

            if(totalAssignedHours>=hoursRequired && scheduledStatus===false){
                console.log(totalAssignedHours)
                scheduledArray[j]=true;
                htCompHtml = 'access_time'
                toolTip = determineMxItemTitle(j);
                populateLeftInfoPanel(j,currentFlightDate,buno)
            }else if(totalAssignedHours<hoursRequired){
                scheduledArray[j]=false
            }
        }
        updateScheduledHoursDisplay(buno)

        calendarEle.data('expectedFlightDate', true);
        calendarEle.data('expectedFlightHours', flightHours);
        if($('#'+buno+'Day'+difference).hasClass('mc')){
            calendarEle.html('<i title="'+toolTip+'" class="material-icons">airplanemode_active'+htCompHtml+' flight_takeoff</i>'+flightHours)

        }else{
            calendarEle.html('<i class="material-icons">build'+htCompHtml+' flight_takeoff</i>'+flightHours)
            calendarEle.data('expectedFlightDate', true)
        }
        bunoEle.data('scheduledArray', scheduledArray)

    }

}
function determineMxItemTitle(mxNumber){
    let toolTip = ''
    if(mxNumber==0){
        toolTip='Phase A'
    }else if(mxNumber==1){
        toolTip='Phase b'
    }else if(mxNumber==2){
        toolTip='Phase C'
    }else if(mxNumber==3){
        toolTip='Phase D'
    }else if(mxNumber == 4){
        toolTip='Rudder Actuator'
    }else if(mxNumber==5){
        toolTip='Stab Actuator'
    }else if(mxNumber==6){
        toolTip= 'F404 Combustion Section'
    }
    return toolTip
}


function clearFlightCount(){
    for(i=0;i<36;++i){
        let date = moment().add(i, 'days').format('MMDD');
        $('#date'+date).data('currentFlights',0)

    }

}
function colorDateLabels(){
    for(i=0;i<36;++i){
        let date = moment().add(i, 'days').format('MMDD');
        let dateEle = $('#date'+date)
        let scheduledFlights = dateEle.data('currentFlights')
        let neededFlights = $('#opsSpinner'+i).val()
        if(scheduledFlights<neededFlights){
            dateEle.css('background-color', 'red')
        }else{
            dateEle.css('background-color', '#454545')
        }

    }

}
function clearLeftInfoPanel(){
    $('#nextPhaseDateScheduledDisplay').html('-')
    $('#rudderActuatorDateScheduledDisplay').html('-')
    $('#stabActuatorDateScheduledDisplay').html('-')
    $('#f404dateScheduledDisplay').html('-')
}

function updateScheduledHoursDisplay(buno){
    let bunoEle = $('#label'+buno);
    let bunoClickedStatus =bunoEle.data('clicked');
    if(bunoClickedStatus){
        $('#currentlyScheduledHoursDisplay').html(bunoEle.data('budgetedHours'))
    }
}

function populateLeftInfoPanel(mxNumber,dateScheduled, buno){
    let bunoEle = $('#label'+buno);
    let bunoClickedStatus =bunoEle.data('clicked');


        let mxItemEle = ''
        if (mxNumber == 0 || mxNumber == 1 || mxNumber == 2 || mxNumber == 3) {
            mxItemEle = $('#nextPhaseDateScheduledDisplay')
            bunoEle.data('phaseDate', dateScheduled)
        } else if (mxNumber == 4) {
            mxItemEle = $('#rudderActuatorDateScheduledDisplay')
            bunoEle.data('rudderActDate', dateScheduled)
        } else if (mxNumber == 5) {
            mxItemEle = $('#stabActuatorDateScheduledDisplay')
            bunoEle.data('stabActDate', dateScheduled)
        } else if (mxNumber == 6) {
            mxItemEle = $('#f404dateScheduledDisplay')
            bunoEle.data('f404Date', dateScheduled)
        }
    if(bunoClickedStatus) {
        mxItemEle.html(dateScheduled.slice(0, 2) + '/' + dateScheduled.slice(2, 4));
        $('#currentlyScheduledHoursDisplay').html(bunoEle.data('budgetedHours'))
    }
}




function loadBunoDetails(id){
    bunoQuery(id);
    selectedBunoIndicator(id)
    displayMxDates(id);
    $('#'+id).data('clicked', true)
}

function displayMxDates(id){
    let bunoEle = $('#'+id)
    let mxArray = bunoEle.data('mxItemsDates')
    let mxEle = ''
    for(i=4; i<10;++i){
        if(i==4){
            mxEle=$('#eightyFourDayDateDisplay')
        }else if(i==5){
            mxEle=$('#oneTwelverDateDisplay')
        }else if(i==6){
            mxEle=$('#oneSixEightDateDisplay')
        }else if(i==7){
            mxEle=$('#threeThreeSixDateDisplay')
        }else if(i==8){
            mxEle=$('#threeSixFiveDateDisplay')
        }else if(i==9){
            mxEle=$('#seventTwoEightDateDisplay')
        }
        mxEle.html(mxArray[i])

    }


}



function bunoQuery(id){
    let selectedBuno = id.slice(5,11);


    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log('OUT IT WENT HOPEFULLY');
            let outputArray = JSON.parse(xhttp.responseText);

            displayBunoDynInfo(outputArray);
        }
    };

    xhttp.open("POST", "scripts/dynamicComponentsQuery.php", true);
    xhttp.send(JSON.stringify(selectedBuno));

}
function displayBunoDynInfo(inputArray){
    clearLeftInfoPanel()
    let buno=inputArray[0][0];
    $('#bunoDisplay').html(buno);
    let rudderActuator = inputArray[0][5];
    $('#rudderActuatorDisplay').html(rudderActuator);
    let totalFlightHours = inputArray[0][8];
    $('#totalFlightHoursDisplay').html(totalFlightHours);
    let phaseHours = inputArray[0][1];
    $('#phaseHoursDisplay').html(phaseHours);
    let stabActuator= inputArray[0][6];
    $('#stabActuatorDisplay').html(stabActuator);
    let f404Combustionhours = inputArray[0][7];
    $('#f404CombustionSectionDisplay').html(f404Combustionhours);
    let currentlyScheduledHours = $('#label'+buno).data('budgetedHours')
    $('#currentlyScheduledHoursDisplay').html(currentlyScheduledHours)
    let bunoEle = $('#label'+buno)
    if(bunoEle.data('phaseDate')){
       $('#nextPhaseDateScheduledDisplay').html(bunoEle.data('phaseDate').slice(0,2)+'/'+bunoEle.data('phaseDate').slice(2,4))
    }else if(bunoEle.data('rudderActDate')){
        $('#rudderActuatorDateScheduledDisplay').html(bunoEle.data('rudderActDate'))
    }else if(bunoEle.data('stabActDate')){
        $('#stabActuatorDateScheduledDisplay').html(bunoEle.data('stabActDate'))
    }else if(bunoEle.data('f404Date')){
        $('#f404dateScheduledDisplay').html(bunoEle.data('f404Date').slice(0,2)+'/'+bunoEle.data('f404Date').slice(2,4))
    }



}

function selectedBunoIndicator(id){
    let lastBuno =$('#SQDImage').data('currentlySelectedBuno');
    if(lastBuno!=id){
        $('#'+lastBuno).css('background-color', '#454545');
        $('#'+lastBuno).css('color', 'white')
    }
        $('#'+id).css('background-color','tan');
        $('#'+id).css('color','black');
        $('#SQDImage').data('currentlySelectedBuno', id);
}

function saveFlightSchedule(){
    let bunoArray = $('#SQDImage').data('bunoArray')

    for(i=0;i<bunoArray.length;++i){
        let outputArray = new Array()
        let buno = bunoArray[i]
        let bunoFlightSchedule =$('#label'+buno).data('flightSchedule')
        let outputFlightArray = new Array()
        outputFlightArray.push(buno)
        for(j=0; j<bunoFlightSchedule.length;++j){
            outputFlightArray.push(bunoFlightSchedule[j])
            saveFlightScheduleQuery(outputFlightArray)
        }



    }

}
function saveFlightScheduleQuery(inputArray){

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(JSON.parse(xhttp.responseText))
        }
    };

    xhttp.open("POST", "scripts/saveFlightScheduleQuery.php", true);
    xhttp.send(JSON.stringify(inputArray));


}
function storeMxDates(mxArray){
    let numberOfBunos = mxArray.length
    for(i=0;i<numberOfBunos;++i){
        let buno = mxArray[i][0];
        let bunoEle = $('#label'+buno)
        bunoEle.data('mxItemsDates',mxArray[i])
    }

}

function testFunction(){
    //console.log($('#label123456').data())
saveFlightSchedule()
}
function testFunction2(){
    $(document).tooltip()
    //console.log($('#label123456').data())

}