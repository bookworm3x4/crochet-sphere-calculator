"use strict";

//Displays selected units throughout page.
var units = "in";
function populateUnits() {
    units = $("#units").val();
    var labels = $(".units-label");
    for (var i=0; i<labels.length; i++) {
        labels[i].textContent=units;
    }
}

//Standardizes given gauges to one unit and assigns these values to the gauge variables.
var gauge = {stitch: 0, row: 0}
function populateGauges() {
    gauge.stitch = $("#stitch-gauge").val()/$("#gauge-width").val();
    gauge.row = $("#row-gauge").val()/$("#gauge-height").val();
}

//Sets variable value to input diameter.
var diameter;
function populateDiameter() {
    diameter = $("#diameter").val();
}

//Calculates total number of rows needed, rounding to nearest whole number.
var totalRows, pi = Math.PI;
function calculateRows() {
    totalRows = pi * diameter * gauge.row / 2;
    totalRows = Math.round(totalRows);
}

//Displays row total.
function displayRowTotal() {
    var displayRows = "";
    displayRows += "Rows: ";
    displayRows += totalRows;
    $("#total-rows").text(displayRows);
}

//Recalculates actual diameter based on rounded row count, then displays it.
function updateDiameter() {
    diameter = totalRows * 2 / (pi * gauge.row);
    var displayDiameter = "";
    displayDiameter += "Actual diameter: ";
    displayDiameter += diameter.toFixed(2);
    displayDiameter += " ";
    displayDiameter += $("#units").val();
    $("#diameter-actual").text(displayDiameter);
}

//Calculates number of stitches needed for each row.
var angle = [], radius = [], circumference = [], stitches = [], incDecAmount = [], incOrDec = [], i;
function calculateRowSizes() {
    for (i=1; i<=totalRows; i++) {
        angle[i] = pi * (i/totalRows - 1/(2*totalRows));
        radius[i] = diameter * Math.sin(angle[i]) / 2;
        circumference[i] = 2 * pi * radius[i];
        stitches[i] = circumference[i] * gauge.stitch;
        stitches[i] = Math.round(stitches[i]);
    }
    if (stitches[1] < 4) {stitches[1] = 4;}
    if (stitches[totalRows] < 4) {stitches[totalRows] = 4;}
}

//Calculates increase or decrease amount for each row.
function calculateIncDec() {
    for (i=2; i<=totalRows; i++) {
        incDecAmount[i] = stitches[i] - stitches[i-1];
        if (incDecAmount[i] > 0) {
            incOrDec[i] = "Increase ";
        } else if (incDecAmount[i] < 0) {
            incOrDec[i] = "Decrease ";
        } else {
            incOrDec[i] = "No change";
        }
        incDecAmount[i] = Math.abs(incDecAmount[i]);
        if (incDecAmount[i] == 0) {
            incDecAmount[i] = "";
        }
        incDecAmount[1] = "";
        incOrDec[1] = "Start with 4 stitches";
    }
}

//Sets up indexed display of all rows.
function displayAllRows() {
    $("#rows-output").empty();
    for (var x=1; x<=totalRows; x++) {
        displayRowStitches(x);
    }
}

//Displays increase/decrease amount and stitch count for each row.
function displayRowStitches(n) {
    var buffer = "";
    buffer += "<tr><td>Row ";
    buffer += n;
    buffer += ": ";
    buffer += incOrDec[n];
    buffer += incDecAmount[n];
    buffer += " ("
    buffer += stitches[n];
    buffer += " stitches total).</td></tr>";
    $("#rows-output").append(buffer);
}

//Calculates and displays error as r^2.
var rSquaredPercent;
function calculateError() {
    var circumferenceSum = 0, essSum = 0, tssSum = 0; //resets these variables to zero for new calculation
    var circumferenceActual = [], ess = [], tss = []; //introduces indexed variables
    for (i=1; i<=totalRows; i++) {
        circumferenceActual[i] = stitches[i] / gauge.stitch;
        circumferenceSum = circumferenceSum + circumferenceActual[i];
        var circumferenceAverage = circumferenceSum / totalRows;
        ess[i] = Math.pow((circumferenceActual[i] - circumferenceAverage),2);
        essSum = essSum + ess[i];
        tss[i] = Math.pow((circumference[i] - circumferenceAverage),2);
        tssSum = tssSum + tss[i];
        var rSquared = essSum / tssSum;
        rSquaredPercent = (rSquared * 100).toFixed(2);
    } 
}
function displayError() {
    var displayRSquared = "Percent accuracy (r-squared): " + rSquaredPercent + "%";
    $("#r-squared").text(displayRSquared);
}

//Generates an error message if form is incomplete.
function errorMessage() {
    var stitchGauge = $("gauge.stitch");
    if (stitchGauge=="") {$("#message").text("Stitch gauge missing.");}
    /*if (gauge.stitch=="" || gauge.row=="" || diameter=="") {
        $("diameter-actual").empty();
        $("total-rows").empty();
        $("r-squared").empty();
        $("rows-output").empty();
        $("#message").text("Hmm, it seems like you didn't fill out the form correctly...");
    }*/
}

//Runs all functions when "Calculate!" button is clicked.
function calculateAll() {
    populateUnits();
    populateGauges();
    populateDiameter();
    calculateRows();
    $("#message").empty(); //Clears prompt to user from output space.
    updateDiameter();
    displayRowTotal();
    calculateRowSizes();
    calculateIncDec();
    calculateError();
    displayError();
    displayAllRows();
    errorMessage();
}

//Generates date of last update and displays in page footer.
function generateUpdate() {
    var pieces = document.lastModified.split(" ");
    var datePieces = pieces[0].split("/");
    var timePieces = pieces[1].split(":");
    var monthNames = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "June", "July", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];
    var monthNumber = datePieces[0] - 1;
    var dateUpdated = datePieces[1] + " " + monthNames[monthNumber] + " " + datePieces[2] + ", " + timePieces[0] + ":" + timePieces[1] + " EST";
    $("#date-updated").text(dateUpdated);
}
generateUpdate();

//Displays default units when page loads.
populateUnits();