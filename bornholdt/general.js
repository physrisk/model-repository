Array.prototype.max=function(){return Math.max.apply(null,this);};
Array.prototype.min=function(){return Math.min.apply(null,this);};

function myParseFloat(val) {return parseFloat((""+val).replace(",","."));}

var g;
var statisticalProp=false;
var timeExternal=0;
var timeoutID=null;
var showPrice=[];
var showPriceFund=[];
var showReturns=[];
var showReturnsFund=[];
var showVolume=[];
$('#priceDiv').data('plotOptions', {yaxis:{tickDecimals:1}});
$('#returnDiv').data('plotOptions', {yaxis:{tickDecimals:2}});
$('#volumeDiv').data('plotOptions', {yaxis:{tickDecimals:2}});

function initialize() {
	timeExternal=0;
	showPrice=[];
	showPriceFund=[];
	showReturns=[];
	showReturnsFund=[];
	showVolume=[];
	g=$("#plotDiv")[0].getContext('2d');
	model=new bornholdtModel();
	model.initialize();
    var alpha=myParseFloat($('#controlAlpha').val());
    $('#controlAlpha').val(alpha);
    var beta=myParseFloat($('#controlBeta').val());
    $('#controlBeta').val(beta);
    var sigma=Math.abs(myParseFloat($('#controlSigma').val()));
    $('#controlSigma').val(sigma);
    if(sigma>0) colorStatLabel();
    else uncolorStatLabel();
    var b=myParseFloat($('#controlB').val());
    $('#controlB').val(b);
    var am=myParseFloat($('#controlAM').val());
    $('#controlAM').val(am);
	model.setParameters(alpha,beta,sigma,b,am);
	window.clearInterval(timeoutID);
	timeoutID=null;
	model.populate();
	drawField();
	plotFigure();
}

function plotFigure() {
	$.plot($("#returnDiv"),[{data:showReturns,color:"red"},{data:showReturnsFund,color:"blue"}],$('#returnDiv').data('plotOptions'));
    if(!statisticalProp) {
        $.plot($("#priceDiv"),[{data:showPrice,color:"red"},{data:showPriceFund,color:"blue"}],$('#priceDiv').data('plotOptions'));
        $.plot($("#volumeDiv"),[{data:showVolume,color:"red"}],$('#volumeDiv').data('plotOptions'));
    }
	if(timeExternal>16 && statisticalProp) {
        var ret=commonFunctions.toOneDimensionalArray(model.returns,1);
        var sigma=commonFunctions.standardDeviation(ret);
		ret=ret.map(Math.abs).map(function(x){return x/sigma;});
        var retFund=commonFunctions.toOneDimensionalArray(model.returnsFundamental,1);
        sigma=commonFunctions.standardDeviation(retFund);
		retFund=retFund.map(Math.abs).map(function(x){return x/sigma;});
		var retMin=Math.max(ret.min(),0.01);
		var retMax=ret.max();
		var retFundMin=Math.max(retFund.min(),0.01);
		var retFundMax=retFund.max();
        var plotPdf=[];
        var plotSpec=[];
		if(retMax>retMin) {
			var retPdf=commonFunctions.pdfModification(commonFunctions.makePdf(ret,0,retMax,10000,false),true,retMin,retMax*1.1,100,0,retMax/10000.0);
            var retSpec=commonFunctions.specModification(commonFunctions.performRealFFT(ret),1,100,true);
            plotPdf.push({data:retPdf,color:"red"});
            plotSpec.push({data:retSpec,color:"red"});
		}
		if(retFundMax>retFundMin) {
			var retFundPdf=commonFunctions.pdfModification(commonFunctions.makePdf(retFund,0,retFundMax,10000,false),true,retFundMin,retFundMax*1.1,100,0,retFundMax/10000.0);
            var retFundSpec=commonFunctions.specModification(commonFunctions.performRealFFT(retFund),1,100,true);
            plotPdf.push({data:retFundPdf,color:"blue"});
            plotSpec.push({data:retFundSpec,color:"blue"});
		}
        $.plot($("#pdfDiv"),plotPdf,$('#volumeDiv').data('plotOptions'));
        $.plot($("#specDiv"),plotSpec,$('#volumeDiv').data('plotOptions'));
	}
}

function drawField() {
	for(var i=0;i<model.spins;i++) {
		for(var j=0;j<model.spins;j++) {
			if(model.getSpin(i,j)==1) g.fillStyle="rgb(255,0,0)";
			else g.fillStyle="rgb(0,0,255)";
			g.fillRect(i*model.spinsPx,j*model.spinsPx,model.spinsPx,model.spinsPx);
		}
	}
}

function singleFrame() {
	for(var i=0;i<8;i++) model.singleFrame();
	drawField();
	if(timeExternal % 4==0) {
        plotFigure();
        var time=model.price.lastTime();
		showPrice.push([time,model.price.lastValue()]);
		showPriceFund.push([time,model.priceFundamental.lastValue()]);
		showReturns.push([time,model.returns.lastValue()]);
		showReturnsFund.push([time,model.returnsFundamental.lastValue()]);
		showVolume.push([time,model.volume.lastValue()]);
		if(showPrice.length>128) {
			showPrice.splice(0,1);showPriceFund.splice(0,1);showReturns.splice(0,1);showReturnsFund.splice(0,1);showVolume.splice(0,1);
		}
    }
	timeExternal++;
}

function colorStatLabel(){$("#retLabel").css("color","red");$("#fundLabel").css("color","blue");$("#fundBlock").show();}
function uncolorStatLabel(){$("#retLabel").css("color","");$("#fundLabel").css("color","");$("#fundBlock").hide();}
function startGame() {initialize();$("#resume").click();}

$(function () {
	initialize();
	hideStat();
	$("#start").click(function(){startGame();});
	$("#resume").toggle(function(){resumeGame();},function(){stopGame();});
	$("#stat").toggle(function(){showStat();},function(){hideStat();});
});