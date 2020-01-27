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
         $('#bunoLabel').data('BUNO'+i,currentBuno);
         $('#bunosAndMx').append('<span class="emptyClassRemoval" id="'+currentBuno+'"></span>');
         let bunoHtml =  '<span id="label'+currentBuno+'" class = "bunoCalendarElement">'+currentBuno+'</span>';
         $('#bunoLabels').append(bunoHtml);
         $('#label'+currentBuno).data('numMXWindows', 0);
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
                 calendarEleLabel = 'MX Window';
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
                calendarEleLabel = 'Mx Start';
                mxWindowCounter = mxWindowCounter-1;
            } else if(mxWindowCounter==3||mxWindowCounter==2){
                calendarEleClass = 'maintenance';
                calendarEleLabel = 'MX';
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
             let calendarEleHTML='<span class="'+calendarEleClass+'" id="'+currentBuno+'Day'+j+'">'+calendarEleLabel+''+
                 '<br><input id="hoursSpinner'+currentBuno+j+'" class="hoursSpinner"> </span>';
             if(j==35){
                 calendarEleHTML = '<span class="'+calendarEleClass+'"  id="'+currentBuno+'Day'+j+'"  >'+
                     calendarEleLabel+'<br><input class="hoursSpinner"></span><br>';
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
        $('.hoursSpinner').spinner()
         }

     }
 }
 function logStartPosition(idName){
     let nameParent =$('#'+idName).parent();
     let parentId = nameParent[0].id;
     let mxWindowNumber = parentId.substr(-1);
     let buno = idName.substr(0,6);
     //console.log($('#'+buno+'MxDates'+mxWindowNumber).index())
     let startPos = $('#'+buno+'MxDates'+mxWindowNumber).index();
     $('#label'+buno).data('startPos', startPos)

 }
 function dragFunction(idName){
     let nameParent =$('#'+idName).parent();
     let parentId = nameParent[0].id;
     let mxWindowNumber = parentId.substr(-1);
     let buno = idName.substr(0,6);
     //console.log($('#'+buno+'MxDates'+mxWindowNumber).index())
     let endPos = $('#'+buno+'MxDates'+mxWindowNumber).index();
     $('#label'+buno).data('endPos'+mxWindowNumber, endPos);
     for(i=0;i<8;++i){
         if($('#'+parentId).find('span').eq(i).hasClass('maintenance')== true) {
             //left empty for now, initially used it but dont want to change the if statement until later
         }else if($('#'+parentId).find('span').eq(i).hasClass('mxWindow') &&  (i==3 || i==4 || i==5||i==6)){
             $('#' + parentId).find('span').eq(i).css('background-color', 'red');
             $('#' + parentId).find('span').eq(i).html('Orig MX Date');
         }else if($('#'+parentId).find('span').eq(i).hasClass('mxWindow')){
             $('#' + parentId).find('span').eq(i).css('background-color', 'forestgreen');
             $('#' + parentId).find('span').eq(i).html('MX Window');
         }
     }


 }

/*
Functions below are used to save the modified schedule to the server to allow for the approval process to begin
 */
function saveSubmit(){

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
    //let selectedSquadron = $("#squadronSelect").val();
    mxArray.unshift(numMXWindows,currentCounter);
    var xhttp = new XMLHttpRequest();
    console.log(mxArray);
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(JSON.parse(xhttp.responseText))
        }
    };

    xhttp.open("POST", "scripts/sendProposedSchedule.php", true);
    xhttp.send(JSON.stringify(mxArray));
}
function loadProposedSchedule(){
    //clearCurrentSchedule();
    getProposedCalendarDates()
    //console.log($('#785643MxWindow2').data())
    /*let detachedElement =$('#735914MxDates1').detach();
    detachedElement.insertAfter('#735914Day3')*/
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
                console.log(dateDiff);
                let appendAfterID = $('#' + currentBuno + 'MxWindow' + j+' span').eq(dateDiff).attr('id');
                console.log(appendAfterID);
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
                    $('#' + currentBuno + 'MxWindow' + j).find('span').eq(x).css('background-color', 'red');
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

function testFunction(){
 $('.hoursSpinner').css("display", 'none')
}
function testFunction2(){
    $('.filterCheckbox').checkboxradio({
        icon:false
    })
}
function getBUNOConfig(inputArray){
    let numberBunos = inputArray.length;
    let bunoArray = new Array();
for(i=0;i<numberBunos;++i){
    let bunoToAdd = inputArray[i][0]
    bunoArray.push(bunoToAdd)
}
console.log(bunoArray);
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(xhttp.responseText)
        }
    };

    xhttp.open("POST", "scripts/packageQuery.php", true);
    xhttp.send(JSON.stringify(bunoArray));







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
        //opsNeedArray[36]=12;//todayDate;
        todayDate = moment().add(j, 'days').format('YYYY-MM-DD');
        ++j;
        //console.log(opsNeedArray[i]);
    }
    console.log(opsNeedArray);
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log('OUT IT WENT HOPEFULLY');

        }
    };
    //console.log(JSON.stringify(opsNeedArray));
    xhttp.open("POST", "scripts/saveDataToDB.php", true);
    xhttp.send(JSON.stringify(opsNeedArray));

}


