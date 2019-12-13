importScripts("../js-lib/random-026.min.js");
importScripts("rcdVoterModel.js");

/* declare globals */
let model=null;

let runFlag=false;

let timeout=100; // ms

/* declare functions */
function doSimulation() {
    let data=model.step();
    self.postMessage({
        "reply": true,
        "data": data,
        "action": "update",
    });
    queueSimulation();
}

function queueSimulation() {
    if(runFlag) {
        setTimeout(()=>doSimulation(),timeout);
    }
}

function process(msg) {
    if(msg.action=="setup") {
        model=new rcdVoterModel(msg.nAgents,msg.convince,msg.doubt,msg.repel);
        timeout=msg.timeout;
        return {
            "reply": true,
            "action": msg.action,
        };
    } else if(msg.action=="step") {
        return {
            "reply": true,
            "data": model.step(),
            "action": msg.action,
        };
    } else if(msg.action=="resume") {
        runFlag=true;
        queueSimulation();
        return {
            "reply": true,
            "action": msg.action,
        };
    } else if(msg.action=="pause") {
        runFlag=false;
        return {
            "reply": true,
            "action": msg.action,
        };
    }
    return {
        "reply": false,
        "action": msg.action,
    };
}

/* reply */
self.addEventListener("message",(e) => self.postMessage(process(e.data)), false);
