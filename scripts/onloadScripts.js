/*
    Need to pull in all associated squadrons to populate the dropdown, future iterations will remove the squadron
        dropdown and be driven by user roles from a CAC, functions are called from controlling function
 */
function initialLoading(){
    createFilters();
    addDateLabels();
    populateSqdDropdown();

}
function createFilters(){
    $('.filterCheckbox').checkboxradio({
        icon:false
    })

}

/*
populateSqdDropdown queries DB for all unique squadron names and populates the dropdown with that information
 */
function populateSqdDropdown(){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let outputArray = JSON.parse(xhttp.responseText);
            let loopCounter = outputArray.length;
            for(i = 0; i<loopCounter; ++i){
                let squadronName = outputArray[i];
                let html = '<option>'+squadronName+'</option>';
                $("#squadronSelect").append(html);
            }
        }
    };
    xhttp.open("GET", "scripts/squadronquery.php", true);
    xhttp.send();
}

/*
addDatelabels populates the date labels, 3 days behind and 35 days ahead also adds ops spinners for displaying the ops
requirement for any given day
 */
function addDateLabels(){
    let todayDate = moment().add(-3,'days').format("MM/DD");
    let idtodayDate = moment().add(-3,'days').format("MMDD");
    let weekdayName = moment().add(-3,'days').format('dddd');
    for(i=-2; i<37; ++i){
        if(i==-2||i==-1||i==0){
            if(i==0){
                $('#dateContainter').append('<span id="date'+idtodayDate+'" class="dateLabels lastPastDates">'+weekdayName+'<div>'+todayDate+'</div></span>');
            }else{
                $('#dateContainter').append('<span id="date'+idtodayDate+'" class="dateLabels pastDates">'+weekdayName+'<div>'+todayDate+'</div></span>');
            }
        }else{
            $('#dateContainter').append('<span id="date'+idtodayDate+'" class="dateLabels">'+weekdayName+'<br>'+todayDate+'<br><input id="opsSpinner'+i+'" class="spinner"></span>');
        }
        if(i==36){
            $('#dateContainter').append('<br>')
        $('.spinner').spinner()
        }
        $('#date'+idtodayDate).data('currentFlights', 0);
        todayDate = moment().add(i,'days').format('MM/DD');
        idtodayDate=moment().add(i,'days').format('MMDD');
        weekdayName = moment().add(i, 'days').format('dddd');

    }


}

/*
createOpsSpinners creates an op spinner for each date and adds a unique name and id to be utilized in a datamanagement
script
 */
