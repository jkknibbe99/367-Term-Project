
// Globals
let mode = "view";
let boat_speed = 0;
let boat_top_speed = 2;
let throttle = 0;
let throttle_input_elem = document.getElementById("throttle").getElementsByTagName("input")[0];
let boat_accel = false;
let boat_turn_deg = 0;
let boat_left_turn = false;
let boat_right_turn = false;
let boat_max_turn = 1;

// Mode listener
document.getElementById("mode-select").addEventListener("change", modeListener, false);
function modeListener(event) {
    mode = this.value;
    if (mode == "view") {
        throttle = 0;
        throttle_input_elem.value = throttle;
        document.getElementById("boat-speed").style.display = "none";
        document.getElementById("throttle").style.display = "none";
        document.getElementById("steering").style.display = "none";
        document.getElementById("orbit-controls").style.display = "inline-block";
    } else if (mode == "drive") {
        document.getElementById("boat-speed").style.display = "inline-block";
        document.getElementById("throttle").style.display = "inline-block";
        document.getElementById("steering").style.display = "inline-block";
        document.getElementById("orbit-controls").style.display = "none";
    }

}

// update boat speed
function updateBoatSpeed() {
    let boat_max_speed = throttle / (10 / boat_top_speed);
    if (boat_max_speed > boat_speed) {
        boat_accel = true;
    } else {
        boat_accel = false;
    }
    if (boat_accel) {
        if (boat_speed < boat_max_speed) {
            boat_speed += 0.006;
        } else {
            boat_speed = boat_max_speed;
        }
    } else {
        if (Math.abs(boat_speed - boat_max_speed) < 0.01) {
            boat_speed = boat_max_speed;
        } else {
            boat_speed -= 0.005;
        }
    }
    function round(value, decimals) {
        return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    }
    document.getElementById("boat-speed").getElementsByTagName("span")[0].innerHTML = round(boat_speed * 15, 2);
}

// Throttle listener
throttle_input_elem.addEventListener("change", throttleListener, false);
function throttleListener(event) {
    throttle = throttle_input_elem.value;
}

// Update boat turning
function updateBoatTurn() {
    if (boat_speed > boat_max_turn) {
        if (boat_left_turn) {
            boat_turn_deg = boat_max_turn;
        } else if (boat_right_turn) {
            boat_turn_deg = -boat_max_turn;
        } else {
            boat_turn_deg = 0;
        }
    } else {
        if (boat_left_turn) {
            boat_turn_deg = boat_speed;
        } else if (boat_right_turn) {
            boat_turn_deg = -boat_speed;
        } else {
            boat_turn_deg = 0;
        }
    }
}

// Keydown listener
document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
    var keyCode = event.which;
    if (keyCode == 65 || keyCode == 37) {  // A ←
        boat_left_turn = true;
    }
    if (keyCode == 68 || keyCode == 39) {  // D →
        boat_right_turn = true;
    }
    if (keyCode == 87 || keyCode == 38) {  // W ↑
        if (mode == "drive") {
            if (throttle >= 10) {
                throttle = 10;
            } else {
                throttle += 1;
            }
            throttle_input_elem.value = throttle;
        }
    }
    if (keyCode == 83 || keyCode == 40) {  // S ↓
        if (mode == "drive") {
            if (throttle <= 0) {
                throttle = 0;
            } else {
                throttle -= 1;
            }
            throttle_input_elem.value = throttle;
        }
    }

};

// Keyup listener
document.addEventListener("keyup", onDocumentKeyUp, false);
function onDocumentKeyUp(event) {
    var keyCode = event.which;
    if (keyCode == 65 || keyCode == 37) {  // A ←
        boat_left_turn = false;
    }
    if (keyCode == 68 || keyCode == 39) {  // D →
        boat_right_turn = false;
    }
};