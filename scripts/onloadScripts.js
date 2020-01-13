/*
    Need to pull in all associates squadrons to populate the dropdown, future iterations will remove the squadron
        dropdown and be driven by user roles from a CAC, functions are called from controlling function
 */
function initialLoading(){
    addDateLabels();
    populateSqdDropdown();

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
addDates populates the date labels, 3 days behind and 35 days ahead
 */
function addDateLabels(){
    let todayDate = moment().add(-3,'days').format("MM/DD");
    let weekdayName = moment(todayDate).format('dddd');
    for(i=-2; i<36; ++i){
        $('#labelAndDate').append('<div id= '+todayDate+' class="dateLabels">'+weekdayName+'<br>'+todayDate+'</div>');
        todayDate = moment().add(i,'days').format('MM/DD')
    }


}