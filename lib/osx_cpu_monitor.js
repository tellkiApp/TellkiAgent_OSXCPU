/**
* This script was developed by Guberni and is part of Tellki's Monitoring Solution
*
* May, 2015
* 
* Version 1.0
*
* DESCRIPTION: Monitor CPU OSX
*
* SYNTAX: node cpu_osx.js <METRIC_STATE>
* 
* EXAMPLE: node cpu_osx.js "1,1,1,1,0"
*
* README:
*		<METRIC_STATE> is generated internally by Tellki and it's only used by Tellki default monitors.
*		1 - metric is on ; 0 - metric is off
**/



// METRICS IDS
var metrics = [];
metrics["user"] =  {id:"0000:% CPU User Time:6",value:0, retrieveMetric: 1};
metrics["sys"] =  {id:"0000:% CPU System Time:6",value:0, retrieveMetric: 1};
metrics["idle"] =  {id:"0000:% CPU Idle Time:6",value:0, retrieveMetric: 1};
metrics["nice"] =  {id:"0000:% CPU Nice Time:6",value:0, retrieveMetric: 1};
metrics["cpu_usage"] = {id:"0000:% CPU Utilization:6",value:0, retrieveMetric: 1};



// ############# INPUT ###################################

//START
(function() {
	try
	{
		monitorInputProcess(process.argv.slice(2));
	}
	catch(err)
	{	
		console.log(err.message);
		process.exit(1);

	}
}).call(this)




/*
* Process the passed arguments and send them to monitor execution (monitorCPU)
* Receive: arguments to be processed
*/
function monitorInputProcess(args)
{

	/* ######################### 
	* DELETE IF USER CUSTOM LIBRARY
	*/
	if(args[0] != undefined)
	{

		//<METRIC_STATE>
		var metricState = args[0].replace("\"", "");
		var tokens = metricState.split(",");

		if(tokens.length != Object.keys(metrics).length)
			throw new Error("Invalid number of metric state");


		var i = 0;
		for (var key in metrics) 
		{
			if (metrics.hasOwnProperty(key)) 
			{
				metrics[key].retrieveMetric = parseInt(tokens[i]);
				i++;
			}
		}
	}

	/* ######################### */




	//console.log(metrics);
	//call monitor
	monitorCPU();
	
}

//################# CPU ###########################

/*
* Retrieve metrics information
*/
function monitorCPU()
{

	var process = require('child_process');
	 
	var ls = process.exec('sar -u 1 1', function (error, stdout, stderr) {
		
		if (error)
			errorHandler(new UnableToGetMetricsError());
		

		parseResult(stdout.trim());
		   
	});
		
	ls.on('exit', function (code) {
	   
		if(code != 0)
	   		errorHandler(new UnableToGetMetricsError());
	    
	});
}



/*
* Parse result from process output
* Receive: string containing results
*/
function parseResult(result)
{
	var lines = result.split('\n');

	for(var i in lines)
	{

		if(lines[i].indexOf("Average:") == -1)
		{
			continue;
		}	
		else
		{
			//get only values
			var values = lines[i].match(/\d+/g)
			
			if(values.length != 4)
				errorHandler(new UnableToGetMetricsError());

			metrics['user'].value = values[0];
			metrics['nice'].value = values[1];
			metrics['sys'].value = values[2];
			metrics['idle'].value = values[3];
			metrics['cpu_usage'].value = parseInt(values[0]) + parseInt(values[2]);

			break;
		}
	}


	output();

}



//################### OUTPUT METRICS ###########################

/*
* Send metrics to console
*/
function output()
{
	
	for (var key in metrics) 
	{
		if (metrics.hasOwnProperty(key)) 
		{

			if(metrics[key].retrieveMetric === 1)
			{
				var out = "";
				
				out += metrics[key].id + "|";
				out += metrics[key].value;
				out += "|";
				
				console.log(out);
			}

	    	
		}
	}
}

//################### ERROR HANDLER #########################
/*
* Used to handle errors of async functions
* Receive: Error/Exception
*/
function errorHandler(err)
{
	if(err instanceof UnableToGetMetricsError)
	{
		console.log(err.message);
		process.exit(err.code);
	}
	else
	{
		console.log(err.message);
		process.exit(1);
	}
}


//####################### EXCEPTIONS ################################

//All exceptions used in script

function UnableToGetMetricsError() {
    this.name = "UnableToGetMetricsError";
    this.message = ("Unable to get cpu metrics");
	this.code = 30;
}
UnableToGetMetricsError.prototype = Object.create(Error.prototype);
UnableToGetMetricsError.prototype.constructor = UnableToGetMetricsError;








