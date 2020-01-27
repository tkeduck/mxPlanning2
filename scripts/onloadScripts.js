/*
    Need to pull in all associates squadrons to populate the dropdown, future iterations will remove the squadron
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
    let weekdayName = moment().add(-3,'days').format('dddd');
    for(i=-2; i<37; ++i){
        $('#dateContainter').append('<span id= '+todayDate+' class="dateLabels">'+weekdayName+'<br>'+todayDate+'<br><input id="opsSpinner'+i+'" class="spinner"></span>');
        if(i==36){
            $('#dateContainter').append('<br>')
        $('.spinner').spinner()
        }
        todayDate = moment().add(i,'days').format('MM/DD');
        weekdayName = moment().add(i, 'days').format('dddd');
    }


}

/*
createOpsSpinners creates an op spinner for each date and adds a unique name and id to be utilized in a datamanagement
script
 */
