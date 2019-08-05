function redistribution(capital,tax) {
    if(redistMode==1) {
        // flat tax, uniform redistribution
        let sum=capital.reduce((acc,cur) => acc+cur,0);
        let funds=tax*sum/capital.length;
        return capital.map(x => (1.0-tax)*x+funds);
    }
    if(redistMode==2) {
        // flat tax, give to 10% best
        let nGive=Math.ceil(model.nAgents*0.1);
        let sCap=capital.slice(0).sort((a,b) => b-a);
        let thresh=sCap[nGive];
        sCap=null;
        let sum=capital.reduce((acc,cur) => acc+cur,0);
        let funds=tax*sum/nGive;
        return capital.map(x => {
            if(x<thresh) {
                return (1.0-tax)*x;
            }
            return (1.0-tax)*x+funds;
        });
    }
    if(redistMode==3) {
        // progressive tax, uniform redistribution
        let max=Math.max(...capital);
        let taxFn=(x) => tax*x/max;
        let funds=capital.reduce((acc,cur) => acc+taxFn(cur)*cur,0);
        funds/=capital.length;
        return capital.map(x => (1.0-taxFn(x))*x+funds);
    }
    return capital;
}
