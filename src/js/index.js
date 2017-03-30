(function (root) {

    var SELECTED = {
        team: "",
        employee: ""
    };

    var sampledata = [{
        team: 'Engineering',
        employees: ['Lawana Fan', 'Larry Rainer', 'Rahul Malik', 'Leah Shumway']
    }, {team: 'Executive', employees: ['Rohan Gupta', 'Ronda Dean', 'Robby Maharaj']}, {
        team: 'Finance',
        employees: ['Caleb Brown', 'Carol Smithson', 'Carl Sorensen']
    }, {team: 'Sales', employees: ['Ankit Jain', 'Anjali Maulingkar']}];

    jqDropdown.register("teams", function (e, target, data) {
        return sampledata.filter(function (tm) {
            return (tm.team.toLowerCase().indexOf(target.userinput.toLowerCase()) >= 0);
        }).map(function (tm) {
            return {
                value: tm.team, text: tm.team
            }
        });
    });

    jqDropdown.register("employees", function (e, target, data) {
        var teamName = data.team;
        return (sampledata.filter(function (tm) {
            return tm.team === teamName
        })[0] || {employees: []}).employees.filter(function (emp) {
            return (emp.toLowerCase().indexOf(target.userinput.toLowerCase()) >= 0);
        }).map(function (emp) {
            return {
                value: emp, text: emp
            }
        });
    });

    var form_dirty = false;

    root.modal =  function(show){
        if(show){
            document.querySelector(".main-box").style.display = "block";
            document.querySelector("#team").value = SELECTED.team;
            document.querySelector("#employee").value = SELECTED.employee;
        } else {
            document.querySelector(".main-box").style.display = "none";
        }
    };

    var updateDisplay = function () {
        document.querySelector("#team_view").innerText = SELECTED.team;
        document.querySelector("#employee_view").innerText = SELECTED.employee;
    };

    document.querySelector("#team").addEventListener("change", function () {
        var $employee = document.querySelector("#employee");
        $employee.dataset.team = this.value;
        $employee.value = "";
        $employee.text = "";
        form_dirty = true;
    });
    document.querySelector("#employee").addEventListener("change", function () {
        form_dirty = true;
    });

    document.querySelector(".btn-ok").addEventListener("click", function () {
        var $employee = document.querySelector("#employee");
        var $team = document.querySelector("#team");
        if ((sampledata.filter(function (tm) { //find team
                return tm.team === $team.value;
            })[0] || {employees: []}).employees.filter(function (emp) { //find employee
                return emp === $employee.value;
            })[0]) {
            SELECTED.team = $team.value;
            SELECTED.employee = $employee.value;
            form_dirty = false;
            updateDisplay();
            modal(false);
        } else {
            alert("Selected valid team and employee");
        }
    });
    document.querySelectorAll(".btn-cancel").forEach(function(elem){
        elem.addEventListener("click", function () {
            if(!form_dirty || root.confirm("Do you want to discard changes?")){
                form_dirty = false;
                modal(false);
            }
        });
    });

    updateDisplay();

})(this);

