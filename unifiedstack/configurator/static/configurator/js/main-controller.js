
var app = angular.module("configurator", ['ngResource', 'ngDialog', 'ui.bootstrap']);

app.filter('reverse', function() {
    return function(items) {
	return items.slice().reverse();
    };
});

app.controller("mainController", function($scope,$http,$window,$resource, $compile, $parse, ngDialog, $interpolate, $log, $interval){    
    // Result message to be displayed over top of the screen.
    $scope.result_message = "Initial Result Message";
    //Creates a log 
    $scope.$log = $log;	
    // Data to be accessed all across configurator SPA page.
    $scope.data = {}
    //Creates a list of settings for various devices.
    $scope.data.settings = {}
    //creates a list of devices.
    $scope.data.devices = []
    //cretaes a list of device types.
    $scope.data.device_types = {}
    // Details of new device to be accessed across the ngDialog and main page
    $scope.data.newdevice = {}
    //creates a list of lables to be renderede during addNewDevice
    $scope.labels = []
    //creates a list of sublabel sto be rendered in addNewSubLabel
    $scope.sublabels = []
    
    
    // API endpoint details
    var api_host = "localhost";
    var api_port = 8000;
    var api_prefix = "http://" + api_host + ":" + api_port + "/"
    
    // Loading the Device types supported and storing them in $scope.data.device_types as a list
    $scope.loadDeviceTypes = function () {
	var url = api_prefix + "configurator/api/v1.0/dtl"
	$http.get(url).then(function (response) {
	    // device_types is an array : [["COBBLER"], ["FOREMAN"]...]
	    device_types = response.data;
	    for (var i=0; i<device_types.length; i++){
		$scope.data.device_types[device_types[i][0]] = device_types[i][0];
	    }
	})
    };
    
    //Creates a new from to #devices-holder by creating a new form or devices and provisions for each label
    $scope.registerNewDevice = function(){
	//To delete all values present in labels and sublabels list
	$scope.labels.splice(0,$scope.labels.length);
	$scope.sublabels.splice(0,$scope.sublabels.length);
	
	//Generates the form containing just the device name with provision for adding sublabels.
	var output_html = "";
	output_html +='<h2>Enter Device name</h2>';
	output_html +='<form role="form">';
	output_html +='<div class="form-group">';
	    output_html +='<label for="name">Package Name:</label>';
	    output_html +='<input type="text" class="form-control" id="dname" placeholder="Enter Package name"><br/>';
	    output_html +='<label><input type="checkbox" id="device"> Device? </label>';
	output_html +='</div>';
	output_html +='<div id="labelSet"></div>';
	$('#devices-holder').empty();
	output_html +='<button class="pull-right" class="btn btn-default" data-ng-click="addNewLabel()">Add New Label</button>';
	output_html +='<button data-ng-click="registerToDB()" type="submit" class="btn btn-default">Submit</button></form>';
	
	var compiled_device_html = $compile(output_html)($scope);
		$('#devices-holder').append(compiled_device_html);
	$scope.addNewLabel();
    }
    
    //invoked upon clicking the '+' button on the glyphicon
    $scope.addNewLabel = function(){
	//$scope.labels is a list for the number of lables for that particular div.It should be updated with consecutive numbers only.
	var no_of_labels = $scope.labels.length;
	if (no_of_labels++ == 0) {
	    $scope.labels.push(1);
	}
	else{
	    $scope.labels.push(no_of_labels);
	}
	var output_html = '<hr>';
	var i=(no_of_labels-1);
	output_html +='<div class="form-group" class="alert alert-success">';
	    output_html +='<h3>Label '+(i+1)+' properties</h3>';
	    output_html +='<label>Level of attribute</label>';
	    
	    output_html +='<div class ="fluid-container">';
		output_html +='<select class="form-control" id="Level-'+(i+1)+'" >';
		    output_html +='<option>Basic</option>';
		    output_html +='<option>Mandatory</option>';
		    output_html +='<option>Optional</option>';
		    output_html +='<option>Advanced</option>';
		output_html +='</select><br/>';
	    output_html +='</div>';
	    
	    output_html +='<div class="col-md-6">';
		output_html +='<label>New label</label>';
		output_html +='<div class="fluid-container">';
		    output_html +='<input type="text" class="form-control" id="Label-'+(i+1)+'" placeholder="Enter label">';
		    output_html +='<div id="subLabel-'+(i+1)+'"></div>';
		output_html +='</div>';
	    output_html +='</div>';
	    
	    output_html +='<div class="col-md-6">';
	    output_html +='<label>Type of value to be entered</label>';
		output_html +='<select class="form-control" id="Stype-'+(i+1)+'">';
		    output_html +='<option>ALPHA_NUMERIC_TYPE</option>';
		    output_html +='<option>NUMERIC_TYPE</option>';
		    output_html +='<option>ALPHA_TYPE</option>';
		    output_html +='<option>PASSWORD_TYPE</option>';
		    output_html +='<option>IP_TYPE</option>';
		    output_html +='<option>MAC_TYPE</option>';
		    output_html +='<option>MULTIPLE_IP_TYPE</option>';
		    output_html +='<option>EMAIL_TYPE</option>';
		    output_html +='<option>CUSTOM_TYPE</option>';
		output_html +='</select>';	
	    output_html +='<div id="subStype-'+(i+1)+'"></div>';
	    output_html +='</div>';
	    
	    output_html +='<button class="pull-right" class="btn btn-primary panel-button btn-block" data-ng-click="addNewSubLabel('+(i+1)+')"><em class="glyphicon glyphicon-plus"></em></button>';
	    output_html +='<br/><br/><br/>';
	    
	    
	    output_html +='<br/><label>Standard label</label>';
	    output_html +='<div class="fluid-container">';
		output_html +='<input type="text" class="form-control" id="StdLabel-'+(i+1)+'" placeholder="Enter standard label">';
	    output_html +='</div><br/>';
	    
	    output_html +='<label>Description</label>';
	    output_html +='<div class="fluid-container">';
		output_html +='<input type="text" class="form-control" id="Desc-'+(i+1)+'" placeholder="Enter Description">';
	    output_html +='</div><br/>';
	    
	output_html +='</div><hr>';
	
	var compiled_device_html = $compile(output_html)($scope);
	    $('#labelSet').append(compiled_device_html);
    }
    
    //Add new sublabel and also push to proper list.
    $scope.addNewSubLabel = function(k){
	var l=0;
	while(1){
	    var temp = k+'-'+l;
	    if ($scope.sublabels.indexOf(temp) == -1) {
		$scope.sublabels.push(temp);
		break;
	    }
	    else
	    l++;
	}
	
	//code to add to sublabel
	output_html = '';
	output_html +='<input type="text" class="form-control" id="subLabel-'+temp+'" placeholder="Enter sub label">';
	var compiled_device_html = $compile(output_html)($scope);
	    $('#subLabel-'+k).append(compiled_device_html);
	
	//code to add to substype
	output_html = '';
	output_html +='<select class="form-control" id ="subStype-'+temp+'">';
	    output_html +='<option>ALPHA_NUMERIC_TYPE</option>';
	    output_html +='<option>NUMERIC_TYPE</option>';
	    output_html +='<option>ALPHA_TYPE</option>';
	    output_html +='<option>PASSWORD_TYPE</option>';
	    output_html +='<option>IP_TYPE</option>';
	    output_html +='<option>MAC_TYPE</option>';
	    output_html +='<option>MULTIPLE_IP_TYPE</option>';
	    output_html +='<option>EMAIL_TYPE</option>';
	    output_html +='<option>CUSTOM_TYPE</option>';
	output_html +='</select>';
	var compiled_device_html = $compile(output_html)($scope);
	$('#subStype-'+k).append(compiled_device_html);
    }
    
    //Get parameters from form and call proper function on not empty
    $scope.registerToDB = function(){
	var i;
	dname = document.getElementById('dname').value;
	check = document.getElementById('device').checked;
	$window.alert(check);
        if (check == 1)
	device = "True";
        else
	device = "False";
	for(i=0;i<$scope.labels.length;i++){
	    dlevel = document.getElementById('Level-'+(i+1)).value;
	    dlabel = document.getElementById('Label-'+(i+1)).value;
	    dstype = document.getElementById('Stype-'+(i+1)).value;
	    dstdlabel = document.getElementById('StdLabel-'+(i+1)).value;
	    ddesc = document.getElementById('Desc-'+(i+1)).value;
	    var k=0;
	    var temp = (i+1)+'-'+k;
	    sublabels = '(';
	    substypes = '(';
	    while(1){
		if ($scope.sublabels.indexOf(temp) == -1){break;}
		else{
		    sublabel_this = document.getElementById('subLabel-'+temp).value;
		    sublabels += sublabel_this+";";
		    substype_this =document.getElementById('subStype-'+temp).value;
		    substypes +=substype_this + ";";
		    k++;
		    temp = (i+1)+'-'+k;
		}
	    }
	    var len=sublabels.length;
	    sublabels = sublabels.substring(0,len-1);
	    len = substypes.length;
	    substypes = substypes.substring(0,len-1);
	    if (sublabels) {    
		sublabels +=')';
		substypes +=')';
	    }
	    var url = api_prefix + "configurator/api/v1.0/savenewDeviceType";
	    if (sublabels) {
		dlabel +=sublabels;
		dstype +=substypes;
	    }
	    if (dname) {
		var Value = $resource(url,{});
		DeviceType = new Value();
		DeviceType.dname = dname;
		DeviceType.check = device;
		var p = DeviceType.$save()
		if (p){
		    $scope.AddDTS(dname,dlevel,dlabel,dstype,dstdlabel,ddesc);
		}
	    }
	}
	if (check == 1)
	{
	    $window.alert("Adding Interface details also");
	    $scope.AddDTS(dname,'DeviceTypeSetting.BASIC_LEVEL','Interface (Name; Type; Description; Vlan)','(AN;AN;AN;AN)','interface(name; type; description; vlan)','Information specific to the Interface. Vlan is comma separated list');
	}
	ngDialog.open({
	    template: '<center><div >' +
			'<b "style="color:Green">Saved</b><br/>' +
		      '</div></center>',
	    plain: true,
	    scope:$scope
	});
    }
    
    //Get given instance of dname and add to DTS
    $scope.AddDTS = function (device_name,dlevel,dlabel,dstype,dstdlabel,ddesc){
	var url = api_prefix + "configurator/api/v1.0/savenewdts";
	var DTS = $resource(url,{});
	DeviceTypeSetting = new DTS();
	DeviceTypeSetting.level = dlevel;
	DeviceTypeSetting.d_type = device_name;
	DeviceTypeSetting.stype = dstype;
	DeviceTypeSetting.label = dlabel;
	DeviceTypeSetting.standard_label = dstdlabel;
	DeviceTypeSetting.desc = ddesc;
	DeviceTypeSetting.$save();
    }

//	End of all Step 1 process code
//	Step 2 process begins here
    
    $scope.addNewDevice = function(){
	$('#devices-holder').empty();
	var output_html = '';
	output_html +='<h2>Enter device details</h2>';
	output_html +='<form role="form">';
	output_html +='<div class="form-group">';
	    output_html +='<label for="name">Device Title:</label>';
	    output_html +='<input type="text" class="form-control" id="dname" placeholder="Enter Device Title">';
	output_html +='</div>';
	
	output_html += '<div id="dtype-dropdown"></div>';
	
	output_html +='<div class="form-group">';
	    output_html +='<label for="name">Device Description:</label>';
	    output_html +='<input type="text" class="form-control" id="ddesc" placeholder="Enter Device Description">';
	output_html +='</div>';
	   
	output_html +='<div id="DeviceTypeSetting">';
	output_html +='</div>'	
	
	var compiled_device_html = $compile(output_html)($scope);
		$('#devices-holder').append(compiled_device_html);
	$scope.populatedropDown("dtype-dropdown");
    };

    $scope.populatedropDown = function(str){
	var url = api_prefix + "configurator/api/v1.0/dtl";
	$window.alert(str);
	var output_html = '';
	var Setting = $http.get(url)
	.then(function(response){
	    $scope.listOfOptions = response.data;
	    output_html +='<label>Device Type:</label>';
	    output_html +='<select id="dtype" class="form-control" ng-options="option for option in listOfOptions" ';
	    output_html +='ng-model="selectedDeviceType" ng-value=option';
	    output_html +='ng-change="fillFormValues()"';
	    output_html +='></select><br/>';
	    var compiled_device_html = $compile(output_html)($scope);
	    $('#' + str).append(compiled_device_html);
	})
	.error(function(){
	    $window.alert("Failed to get devices");
	});
    }

    $scope.fillFormValues = function(){
	var device = $scope.selectedDeviceType;
	var url = api_prefix +"configurator/api/v1.0/dtsl/" + device;
	var Setting = $http.get(url)
	.then(function(response){
	    var form_entries = response.data;
	    $('#DeviceTypeSetting').empty();
	    var output_html ='';
	    output_html +='<h2>Enter the properties of the device</h2>';
	    for(i=0;i<form_entries.length;i++)
	    {
		$scope.labels.push("setting-dts-"+form_entries[i].id);
		output_html +='<div class="form-group">';
		output_html +='<label>'+form_entries[i].label+'</label>';
		output_html +='<input type="text" class="form-control" id="setting-dts-'+form_entries[i].id+'" placeholder="Enter '+form_entries[i].label+'" required>';
		output_html +='</div>';
	    }
	    output_html +='</div>';
	    output_html +='<button type="submit"  ng-click="addDeviceToDB()" class="btn btn-default">Submit</button></form>';
	    var compiled_device_html = $compile(output_html)($scope);
	    $('#DeviceTypeSetting').append(compiled_device_html);	    
	})
	.error(function(){
	    $window.alert("Failure");
	});
    }
    
    $scope.addDeviceToDB = function(){
	dTitle = document.getElementById('dname').value;
	dType = $scope.selectedDeviceType;
	ddesc = document.getElementById('ddesc').value;
	var url = api_prefix + 'configurator/api/v1.0/addtodb';
	var DTS = $resource(url,{});
	DeviceTypeSetting = new DTS();
	DeviceTypeSetting.title = dTitle;
	DeviceTypeSetting.d_type = dType;
	DeviceTypeSetting.desc = ddesc;
	var p = DeviceTypeSetting.$save();
	if(p)
	{
	    var url = api_prefix + "configurator/api/v1.0/dtsl/" + dType;
	    $http.get(url).then(function (response){
		var i;
		var settings = response.data;
		for(i=0;i<settings.length;i++)
		{
		    var id = settings[i].id;
		    var element = document.getElementById("setting-dts-"+id).value;
		    var URL = api_prefix + "configurator/api/v1.0/savenewdevice";
		    var DS = $resource(URL,{});
		    var DeviceSetting = new DS();
		    DeviceSetting.device = dType;
		    DeviceSetting.dtitle = dTitle;
		    DeviceSetting.dts_id = id;
		    DeviceSetting.dts_value = element;
		    DeviceSetting.$save();   
		}
	    });
	    ngDialog.open({
	    template: '<center><div >' +
			'<b "style="color:Green">Saved</b><br/>' +
		      '</div></center>',
	    plain: true,
	    scope:$scope
	    });
	}
    }
    
    $scope.connectDevices = function(){
	$scope.labels.splice(0,$scope.labels.length);
	$scope.sublabels.splice(0,$scope.sublabels.length);

	$('#devices-holder').empty();
	var output_html = '';
	output_html +='<h2>Enter Device connection specifications</h2>';
	output_html +='<h3>The following device is</h3>';
	output_html +='<form role="form" class="form-group">';

	output_html +='<div id="devices-list-1"></div>';
	output_html +='<div id="interface-options-1">';
	    output_html +='<div class="form-group">';
	    output_html +='<label for="name">Interface Details:</label>';
	    output_html +='<input type="text" class="form-control" id="iname1" placeholder="Enter Interface name">';
	    output_html +='<input type="text" class="form-control" id="itype1" placeholder="Enter Interface Type">';
	    output_html +='<input type="text" class="form-control" id="ivlan1" placeholder="Enter Interface VLAN">';
	    output_html +='</div>';
	output_html +='</div>';
	output_html +='<h3> Connected to</h3>';
	output_html +='<div id="devices-list-2"></div>';
	output_html +='<div id="interface-options-2">';
	    output_html +='<div class="form-group">';
	    output_html +='<label for="name">Interface Details:</label>';
	    output_html +='<input type="text" class="form-control" id="iname2" placeholder="Enter Interface name">';
	    output_html +='<input type="text" class="form-control" id="itype2" placeholder="Enter Interface Type">';
	    output_html +='<input type="text" class="form-control" id="ivlan2" placeholder="Enter Interface VLAN">';
	    output_html +='</div>';
	output_html +='</div>';
	output_html +='<button data-ng-click="submitdata()" type="submit" class="btn btn-default">Submit</button></form>';
	var compiled_device_html = $compile(output_html)($scope);
	$('#devices-holder').append(compiled_device_html);
	
	var url = api_prefix + "configurator/api/v1.0/dtitle";
	var output_html = '';
	output_html +='<select id="select-form" class="form-control" >';
	var Setting = $http.get(url)
	.then(function(response){
	    for(var i=0;i<response.data.length;i++)
		output_html +='<option>'+response.data[i]+'</option>'
	    output_html +='</select><br/>';
	    var compiled_device_html = $compile(output_html)($scope);
	    $('#devices-list-1').append(output_html);
	    $('#devices-list-2').append(output_html);
	})
	.error(function(){
	    $window.alert("Failed to get devices");
	});
    }
    
    $scope.submitdata = function(){
	var count = 0;
	$scope.Name_list = [];
	$scope.Type_list = [];
	$scope.VLAN_list = [];
	$scope.title = [];
	$('*[id*=select-form]:visible').each(function() {
	    count++;
	    var Name = document.getElementById('iname'+count).value;
	    var Type = document.getElementById('itype'+count).value;
	    var VLAN = document.getElementById('ivlan'+count).value;
	    $scope.Name_list.push(Name);
	    $scope.Type_list.push(Type);
	    $scope.VLAN_list.push(VLAN);
	    $scope.title.push(this.value);
	});

	var url = api_prefix + 'configurator/api/v1.0/connect'
	$window.alert(url);
        var Value = $resource(url,{});
	DeviceSetting = new Value();
        DeviceSetting.iname = $scope.Name_list[0];
	DeviceSetting.itype = $scope.Type_list[0];
	DeviceSetting.ivlan = $scope.VLAN_list[0];
	DeviceSetting.idesc = "Connected to (" + $scope.title[1] + ";" + $scope.Name_list[1] + ";" + $scope.Type_list[1] + ";" + $scope.VLAN_list[1] + ")";
	DeviceSetting.title = $scope.title[0];
        var p = DeviceSetting.$save();
	
	var url = api_prefix + 'configurator/api/v1.0/connect'
        var Value = $resource(url,{});
	DeviceSetting = new Value();
        DeviceSetting.iname = $scope.Name_list[1];
	DeviceSetting.itype = $scope.Type_list[1];
	DeviceSetting.ivlan = $scope.VLAN_list[1];
	DeviceSetting.idesc = "Connected to (" + $scope.title[0] + ";" + $scope.Name_list[0] + ";" + $scope.Type_list[0] + ";" + $scope.VLAN_list[0] + ")";
	DeviceSetting.title = $scope.title[1];
        var p = DeviceSetting.$save();
	
	ngDialog.open({
	template: '<center><div >' +
		'<b "style="color:Green">Saved</b><br/>' +
	      '</div></center>',
	plain: true,
        scope:$scope
	});
    }
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    /* Clear all the settings. Useful while reloading existing settings. */
    $scope.clearSettings = function(){
	$scope.data.settings = {}
	$('#devices-holder').html("");
    }
    
    $scope.loadExistingDevicesOfType = function(device_type){
	$log.info("Starte loading existing devices");
	$scope.clearSettings();
	var url = api_prefix + "configurator/api/v1.0/dlist/" + device_type
	$http.get(url).then(function (response) {
	    var devices = response.data;
	    for (var i=0; i<devices.length; i++){
		$log.info(i + ": Device: Title-" + devices[i].title + " Type-" + devices[i].dtype );
		$log.info($scope.data.device_types[devices[i].dtype]);
		var device_html =
		    '<div id="device-'+ devices[i].id + '">' +
			'<div class="lead" style="padding-top:0px;margin-top:0px">'+ $scope.data.device_types[devices[i].dtype] + " - " + devices[i].title + '</div>' + 				    
		    '</div>'
		$log.info("Device Added: " + device_html);
		var compiled_device_html = $compile(device_html)($scope);
		$('#devices-holder').append(compiled_device_html);
		$scope.loadExistingDeviceSettings(devices[i]);
	    }
	})
    }
    
    /* Initialization of all the existing devices in the */
    $scope.loadExistingDevices = function(){
	$log.info("Starte loading existing devices");
	$scope.clearSettings();
	var url = api_prefix + "configurator/api/v1.0/dlist"
	$http.get(url).then(function (response) {
	    // device_types is an array of arrays: [["S","Switch"],["C","Cobbler"], ...]
	    var devices = response.data;
	    for (var i=0; i<devices.length; i++){
		$log.info(i + ": Device: Title-" + devices[i].title + " Type-" + devices[i].dtype );
		$log.info($scope.data.device_types[devices[i].dtype]);
		var device_html =
		    '<div id="device-'+ devices[i].id + '">' +
			'<h2>'+ $scope.data.device_types[devices[i].dtype] + " - " + devices[i].title + '</h2>' + 				    
		    '</div>'
		$log.info("Device Added: " + device_html);
		var compiled_device_html = $compile(device_html)($scope);
		$('#devices-holder').append(compiled_device_html);
		$scope.loadExistingDeviceSettings(devices[i]);
	    }
	})
    };
    
    $scope.reloadConfiguration = function(){
	$window.alert("Reloading the configuration...");
	var url = api_prefix + "configurator/api/v1.0/reload";
	$http.get(url).then(function (response) {
	    $window.alert("Configuration Completed");
	    $scope.clearSettings()
	    $scope.loadExistingDevices();
	})
    }; 
    
    $scope.loadGeneralConfiguration = function(){
	// Check if General Configuration exists. If not add it and display
	var url = api_prefix + "configurator/api/v1.0/dlist/G"
	$http.get(url).then(function (response) {
	    var devices = response.data;
	    if (devices.length >= 1) {
		$scope.loadExistingDevicesOfType('G');
	    } else{
		$scope.data.newdevice.title = "Common Settings";
		$scope.data.newdevice.desc = "settings common to all the devices";
		$scope.addDevice('G');
	    }
	})
	
    }

    
    $scope.saveConfiguration = function(){
	$log.info("Started Configuration");
	var url = api_prefix + "configurator/api/v1.0/saveconfiguration";
	var Configuration = $resource(url,{});
	var configuration = new Configuration();
	for (var setting in $scope.data.settings) {
	    //var setting_interpolation = $interpolate($scope.data.settings[setting]);
	    setting_value = $scope.$eval($scope.data.settings[setting]);
	    configuration[setting] = setting_value;
	    $log.info("Setting: " + setting + ", " + setting_value);
	    //code
	}
	configuration.$save(configuration);
    }
    
    $scope.configure = function(){
	var url = api_prefix + "configurator/api/v1.0/configure";
	var Configuration = $resource(url,{});
	var conf = new Configuration();
	conf.$save(conf,
	    //success
	    function( value ){
		//$scope.progress_value = 100;
		$window.alert("Configuration Completed Successfully");
	    },
	    //error
	    function( error ){
		$window.alert("Some trouble adding device")
	    }
	 )
    };
    
    $scope.showConfigurationResult = function () {
	$scope.progress_value = 2;
	ngDialog.open({            
	    template: '<div ><br/>' +
			'<b "style="color:Green">Unified Stack Configurator in Progress.<br/> Please donot Interrupt.</b><br/>' + 
			'<progressbar class="progress-striped active" max="100" value="progress_value" type="info"></progressbar>' + 
			'<div style="width:430px; height:400px;overflow-y:auto;overflow-x:auto;">' +
			    '<div ng-repeat="console_log in console_logs | reverse">' +
				'<div><i>{{console_log.console_summary}}</i></div>' +
			    '</div>' +
			'</div>' +
		      '</div>',
	    plain: true,
	    scope:$scope
	   
	});
	$scope.configure()
    }  

    $scope.count = 0;
    $scope.progress_value = 0;
    $scope.loadConsoleMessages = function(){

	var console_url = 'http://localhost:8000/console';
	$http.get(console_url).then(function (response) {
	    $scope.console_logs = response.data; 
	});
	if ($scope.progress_value!=0 && $scope.progress_value<=100) {
	    $scope.progress_value += 2;
	}
	$log.info("Called loading console");
	$scope.count++;
    };
    
    $interval($scope.loadConsoleMessages, 1000);    
    $scope.loadDeviceTypes();
    $scope.loadGeneralConfiguration();
    //$scope.loadExistingDevices();
    // Testing
    // $scope.addDevice('S');
    
});