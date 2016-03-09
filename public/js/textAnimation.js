var e = document.getElementById("updated");


var text;
var loop = 1;
function listener(e) {
    var max = 2;
    if (text){
        max = text.length -1;
    }
    loop++
    if (loop > max)
        loop = 0;

    switch(e.type) {
        case "animationstart":
            //console.log('start '+ e.elapsedTime);
            break;
        case "animationend":
            console.log('animationend '+ e.elapsedTime);
            break;
        case "animationiteration":
            //console.log('animationiteration'+ e.elapsedTime);
            document.getElementById('updated').innerHTML = text[loop];

            break;
    }
}

function updateText(textArray){
    text = textArray;
    e.addEventListener("animationstart", listener, false);
    e.addEventListener("animationend", listener, false);
    e.addEventListener("animationiteration", listener, false);
}