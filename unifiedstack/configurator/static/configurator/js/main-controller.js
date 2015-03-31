
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
    
    //Add dname to DeviceType and upon success add to DTS
    $scope.addDeviceToDB = function(device_name,dlevel,dlabel,dstype,dstdlabel,ddesc,dpurpose,dsublabels,dsubstypes){
	var url = api_prefix + "configurator/api/v1.0/savenewdevicetype";
	if (dsublabels) {
	    dlabel +=dsublabels;
	    dstype +=dsubstypes;
	}
	if (device_name) {
	    $window.alert("Saving DeviceType = "+device_name);
	    var Value = $resource(url,{});
	    DeviceType = new Value();
	    DeviceType.dname = device_name;
	    var p = DeviceType.$save()
	    if (p){
		$scope.AddDTS(device_name,dlevel,dlabel,dstype,dstdlabel,ddesc,dpurpose,dsublabels);
	    }
	}
    }
    
    
    //Get given instance of dname and add to DTS
    $scope.AddDTS = function (device_name,dlevel,dlabel,dstype,dstdlabel,ddesc,dpurpose,dsublabels){
	var url = api_prefix + "configurator/api/v1.0/savenewdts";
	var DTS = $resource(url,{});
	DeviceTypeSetting = new DTS();
	DeviceTypeSetting.level = dlevel;
	DeviceTypeSetting.d_type = device_name;
	DeviceTypeSetting.stype = dstype;
	DeviceTypeSetting.label = dlabel;
	DeviceTypeSetting.standard_label = dstdlabel;
	DeviceTypeSetting.desc = ddesc;
	DeviceTypeSetting.dpurpose = dpurpose;
	DeviceTypeSetting.$save();
	ngDialog.open({         
	    template: '<center><div >' +
			'<b "style="color:Green">Saved</b><br/>' +
		      '</div></center>',
	    plain: true,
	    scope:$scope
	});
    }
    
    //Get parameters from form and call proper function on not empty
    $scope.registerToDB = function(){
	var i;
	for(i=0;i<$scope.labels.length;i++){
	    dname = document.getElementById('dname').value;
	    dlevel = document.getElementById('Level-'+(i+1)).value;
	    dlabel = document.getElementById('Label-'+(i+1)).value;
	    dstype = document.getElementById('Stype-'+(i+1)).value;
	    dstdlabel = document.getElementById('StdLabel-'+(i+1)).value;
	    ddesc = document.getElementById('Desc-'+(i+1)).value;
	    dpurpose = document.getElementById('Purpose-'+(i+1)).value;
	    $window.alert("Getting all values!");
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
	    $scope.addDeviceToDB(dname,dlevel,dlabel,dstype,dstdlabel,ddesc,dpurpose,sublabels,substypes); 
	}
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

	    output_html +='<label>To be filled during</label>';
	    output_html +='<div class="fluid-container">';
		output_html +='<select class="form-control" id="Purpose-'+(i+1)+'" >';
		    output_html +='<option>Addition of devices</option>';
		    output_html +='<option>Connection of devices</option>';
		output_html +='</select>';
	    output_html +='</div><br/>';
	    
	output_html +='</div><hr>';
	
	var compiled_device_html = $compile(output_html)($scope);
	    $('#labelSet').append(compiled_device_html);
    }
    
    //Creates a new from to #devices-holder by creating a new form or devices and provisions for each label
    $scope.registerNewDevice = function(){
	//To delete all values present in labels and sublabels list
	$scope.labels.splice(0,$scope.labels.length);
	$scope.sublabels.splice(0,$scope.sublabels.length);
	
	//Generates the form containing just the device name with provision fr adding sublabels.
	var output_html = "";
	output_html +='<h2>Enter Device name</h2>';
	output_html +='<form role="form">';
	output_html +='<div class="form-group">';
	    output_html +='<label for="name">Device Name:</label>';
	    output_html +='<input type="text" class="form-control" id="dname" placeholder="Enter Device name">';
	output_html +='</div>';
	output_html +='<div id="labelSet"></div>';
	$('#devices-holder').empty();
	output_html +='<button class="pull-right" class="btn btn-default" data-ng-click="addNewLabel()">Add New Label</button>';
	output_html +='<button data-ng-click="registerToDB()" type="submit" class="btn btn-default">Submit</button></form>';
	
	var compiled_device_html = $compile(output_html)($scope);
		$('#devices-holder').append(compiled_device_html);
	$scope.addNewLabel();
    }
    
    
    $scope.addConnection = function(){
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
	    output_html +='<input type="text" class="form-control" id="dname" placeholder="Enter Device Description">';
	output_html +='</div>';
    
	output_html +='<div id="DeviceTypeSetting">';
	output_html +='</div>'	
	
	var compiled_device_html = $compile(output_html)($scope);
		$('#devices-holder').append(compiled_device_html);
	$scope.populatedropDown();
    }
    
    $scope.populatedropDown = function(){
	var url = api_prefix + "configurator/api/v1.0/dtl";
	var output_html = '';
	var Setting = $http.get(url)
	.then(function(response){
	    $scope.listOfOptions = response.data;
	    output_html +='<label>Device Type:</label>';
	    output_html +='<select class="form-control" ng-options="option for option in listOfOptions" ';
	    output_html +='ng-model="selectedDeviceType" ng-change="fillOptions()">';
	    output_html +='</select><br/>';
	    var compiled_device_html = $compile(output_html)($scope);
	    $('#dtype-dropdown').append(compiled_device_html);
	})
	.error(function(){
	    $window.alert("Failed to get devices");
	});
    }
    
    $scope.fillOptions = function(){
	var device = $scope.selectedDeviceType;
	var url = api_prefix +"configurator/api/v1.0/dtsl/" +device;
	var Setting = $http.get(url)
	.then(function(response){
	    $('#DeviceTypeSetting').empty();
	    var output_html ='';
	    output_html +='<h2>Enter the properties of the device</h2>';
	    for(i=0;i<response.data.length;i++)
	    {
	    	if (angular.equals(response.data[i].dpurpose, "Addition of devices") || angular.equals(response.data[i].dpurpose, "AD")) {
		    output_html +='<div class="form-group">';
		    output_html +='<label>'+response.data[i].label+'</label>';
		    output_html +='<input type="text" class="form-control" id="setting_dts-'+response.data[i].id+'" placeholder="Enter '+response.data[i].label+'">';
		    output_html +='</div>';
		}
	    }
	    output_html +='</div>';
	    output_html +='<button type="submit" class="btn btn-default">Submit</button></form>';
	    var compiled_device_html = $compile(output_html)($scope);
	    $('#DeviceTypeSetting').append(compiled_device_html);	    
	})
	.error(function(){
	    $window.alert("Failure");
	});
    }
    
//    $scope.addDeviceSetting = function(device_id, type_setting_id, label){
//	$log.info("Adding a Setting");
//	// Id to be placed in front of the 
//	var type_setting_div_id = 'setting-'+ device_id + '-' + type_setting_id;
//	var url = api_prefix + "configurator/api/v1.0/dslist/" + device_id;
//	var Setting = $resource(url,{});
//	var setting = new Setting();
//	setting.device_id = device_id;
//	setting.type_setting_id = type_setting_id;
//	setting.value = " "
//	//var newDevice = {}
//	setting.$save(setting,
//	    //success
//	    function( value ){
//		// Getting the id associated to
//		// the newly added setting
//		var newSetting = value;
//		var setting_div_id = type_setting_div_id + '-' + newSetting.id;
//		var setting_model = 'setting_'+ device_id + "_" +
//				    type_setting_id + "_" + newSetting.id;
//
//		$log.info("DeviceSetting id: " + setting_div_id);
//		device_html = '<div id="' + setting_div_id + '" class="setting">';
//		
//		var label_str = label.trim();
//		var setting_html = ""
//		if(label_str[label_str.length-1]==')'){
//		    $log.info("Compound Setting: " + setting_div_id + ", " + label_str);
//		    // Removing the last ')' character
//		    label_str = label_str.substr(0, label_str.length-1);
//		    // Seperating the compound setting main label with
//		    // label tokens
//		    var tokens = label_str.split('(');
//		    var label_main = tokens[0].trim();
//		    var label_tokens = tokens[1].split(';');
//		    // device_html += '<label>' + label_main + '</label>';
//		    for (var i=0; i<label_tokens.length; i++) {
//			subsetting_model = setting_model + "_" + i;
//			$log.info("Sub Field: " + label_tokens[i].trim() + "; Id: " + subsetting_model);
//			device_html += '<input type"text" class="form-control" placeholder="' + label_tokens[i].trim() +
//					'" ng-model="' + subsetting_model + '"/>'
//			setting_html += '{{' + subsetting_model + '}};';
//		    }	    
//		} else{
//		    $log.info("Simple  Setting: " + setting_div_id + ", " + label_str);
//		    device_html += '<label style="float:left">' + label + '</label>';
//		    device_html += '<input type="text" class="form-control" ng-model="'+ setting_model + '"/>';
//		    setting_html += '{{' + setting_model + '}};';
//		}
//		if (setting_html.length>=1) { // Removing last semicolon from the set of values
//		    setting_html = setting_html.substring(0, setting_html.length-1)
//		}
//		var compiled_device_html = $compile(device_html)($scope)
//		$('#'+type_setting_div_id).append(compiled_device_html);
//		//$scope.result_message = value;
//		$scope.data.settings[setting_model] = $interpolate(setting_html);
//		//newDevice.settings[setting_model] = setting_html;
//		$log.info("Setting model assigned as: " + setting_html);
//	    },
//	    //error
//	    function( error ){
//		$window.alert("Some trouble adding setting");
//	    }
//	)
//    }
    
//    $scope.showAddDeviceDialog = function (selectedDevice) {
//	ngDialog.open({            
//	    template: '<center><div >' +
//			'<b "style="color:Green">Add New '+ $scope.data.device_types[selectedDevice] + '</b><br/>' +
//			'<table cellspacing:"10"><tr><th>' +
//			'Title: </th> <td> <input type="text" ng-model="data.newdevice.title" /> </td></tr> <tr><th>' + 
//			'Desc: </th> <td> <input type="text" ng-model="data.newdevice.desc"/> </td></tr> </table>' +
//			'<button data-ng-click=addDevice("' + selectedDevice + '")>Add Device</button>' +
//		      '</div></center>',
//	    plain: true,
//	    scope:$scope
//	});
//    } 
//
//    // Util function to help identify and breakdown compound settings
//    // Plus store it into the $scope.devices[i].settings
//    
    

//    
//    // Add all the Device Settings corresponding to a device
//    $scope.addDeviceSettings = function(newDevice){
//	// Displaying settings
//	url = api_prefix + "configurator/api/v1.0/dtsl/" + newDevice.dtype;
//	// $window.alert(url);
//	$http.get(url).then(function (response) {
//	    var device_type_settings = response.data;
//	    for (var i=0; i<device_type_settings.length; i++){
//		var type_setting_id = 'setting-'+ newDevice.id + '-' + device_type_settings[i].id;
//		$log.info("Type Setting id: " + type_setting_id);
//		var device_html = '<div id="' + type_setting_id + '" class="type-setting">';
//		var label_str = device_type_settings[i].label.trim();
//		if (device_type_settings[i].multiple==true) {
//		    var device_html = '<div id="' + type_setting_id + '">';
//		    /*
//		    var device_html = '<div class="table-responsive">' +
//			    '<table class="table table-bordered table-hover table-striped" id="' +
//			    type_setting_id + '">';
//		    */
//		    $log.info(type_setting_id  + ": is multiple");
//		    var tokens = device_type_settings[i].label.split('(');
//		    var label_main = tokens[0].trim();
//		    device_html += '<label>' + label_main + '</label>';
//		    $log.log('"addDeviceSetting(' + newDevice.id + ', ' + device_type_settings[i].id +
//				    ',\'' + device_type_settings[i].label + '\')"');
//		    
//		    device_html += '<div style="float:right"><a href="#" data-ng-click="addDeviceSetting(' + newDevice.id + ', ' + device_type_settings[i].id +
//				    ',\'' + device_type_settings[i].label + '\')">Add One</a> | <a href="#" >Add More</a></div> <br/>';
//		    device_html += '</div>';
//		} else if(label_str[label_str.length - 1]==')'){
//		    var tokens = device_type_settings[i].label.split('(');
//		    var label_main = tokens[0].trim();
//		    device_html += '<label>' + label_main + '</label>'
//		} else{
//		    $log.info(type_setting_id  + ": is not multiple");
//		}
//		device_html += '</div>'
//		var compiled_device_html = $compile(device_html)($scope);
//		$('#device-'+newDevice.id).append(compiled_device_html);
//		$scope.addDeviceSetting(newDevice.id, device_type_settings[i].id,
//					device_type_settings[i].label);
//	    }
//	})
//    }
//    
//    // Adding a new device - Adds a new device to the database and displays the settings
//    // it needs at the devices-holder
//    $scope.addDevice = function(device_type){
//	// Closing the dialog from showAddDeviceDialog
//	ngDialog.close()
//	
//	// Adding device into database
//	var url = api_prefix + "configurator/api/v1.0/dlist/"
//	var Device = $resource(url,{});
//	var device = new Device();
//	device.dtype = device_type;
//	device.title = $scope.data.newdevice.title;
//	device.desc = $scope.data.newdevice.desc;
//	//var newDevice = {}
//	device.$save(device,
//	    //success
//	    function( value ){
//		// Getting the id associated to
//		// the newly added device
//		$scope.data.newdevice = value;
//		var device_html =
//		    '<div id="device-'+ value.id + '">' +
//			'<h2 style="padding-top:0px">'+ $scope.data.device_types[value.dtype] + " - " + value.title + '</h2>' + 				    
//		    '</div>'
//		$log.info("Device Added: " + device_html);
//		var compiled_device_html = $compile(device_html)($scope)
//		// Adding device template to the devices-holder
//		$('#devices-holder').html(compiled_device_html);
//		// $scope.data.devices.push(value.id);
//    		$log.info("Device being added into scope: " + value.id );
//		$scope.addDeviceSettings(value);
//		$log.info("Device after adding Settings: " + value.settings)
//		//$scope.result_message = value;
//	    },
//	    //error
//	    function( error ){
//		$window.alert("Some trouble adding device");
//	    }
//	)
//    };
//    
//    $scope.loadExistingDeviceSetting = function(device, setting){
//	var url = api_prefix + "configurator/api/v1.0/dtsget/" + setting.device_type_setting_id;
//	$log.info("Existing device setting url: " + url);
//	var device_div_id = "device-" + device.id;
//	var type_setting_div_id = "setting-" + device.id + "-" + setting.device_type_setting_id;
//	var setting_div_id = type_setting_div_id + "-" + setting.id;
//	var setting_model = "setting_" + device.id + "_" + setting.device_type_setting_id + "_" + setting.id;
//	$log.info(device_div_id + ", " + type_setting_div_id + ", " + setting_model);
//	var device_html = "";
//	
//	$http.get(url).then(function (response) {
//	    var type_setting = response.data;
//	    $log.info("Label: " + type_setting.label );
//	    
//	    var label_str = type_setting.label.trim();
//	    // If setting type is coming for the first-time
//	    if( $('#'+type_setting_div_id).length == 0 ){
//		device_html = '<div id="' + type_setting_div_id + '" class="type-setting">';
//		if (type_setting.multiple==true) {
//		    $log.info(type_setting_div_id  + ": is multiple");
//		    var tokens = type_setting.label.split('(');
//		    var label_main = tokens[0].trim();
//		    device_html += '<label>' + label_main + '</label>';
//		    $log.log('"addDeviceSetting(' + device.id + ', ' + type_setting.id +
//				    ',\'' + type_setting.label + '\')"');
//		    
//		    device_html += '<div style="float:right"><a href="#" data-ng-click="addDeviceSetting(' + device.id + ', ' + type_setting.id +
//				    ',\'' + type_setting.label + '\')">Add One</a> | <a href="#" >Add More</a></div> <br/>';
//		} else if(label_str[label_str.length - 1]==')'){
//		    var tokens = type_setting.label.split('(');
//		    var label_main = tokens[0].trim();
//		    device_html += '<label>' + label_main + '</label>'
//		} else{
//		    $log.info(type_setting_div_id  + ": is not multiple");
//		}
//		device_html += '</div>'
//		var compiled_device_html = $compile(device_html)($scope);
//		$('#'+device_div_id).append(compiled_device_html)
//	    }
//	    
//	    device_html = '<div id="' + setting_div_id + '" class="setting">';
//	    var setting_html = ""
//	    if(label_str[label_str.length-1]==')'){
//		$log.info("Compound Setting: " + setting_div_id + ", " + label_str);
//		// Removing the last ')' character
//		label_str = label_str.substr(0, label_str.length-1);
//		// Seperating the compound setting main label with
//		// label tokens
//		var tokens = label_str.split('(');
//		var label_main = tokens[0].trim();
//		var label_tokens = tokens[1].split(';');
//		var value_tokens = setting.value.trim().split(';');
//		// device_html += '<label>' + label_main + '</label>';
//		for (var i=0; i<label_tokens.length; i++) {
//		    subsetting_model = setting_model + "_" + i;
//		    $log.info("Sub Field: " + label_tokens[i].trim() + "; Id: " + subsetting_model);
//		    device_html += '<input type"text" class="form-control" placeholder="' + label_tokens[i].trim() +
//				    '" ng-model="' + subsetting_model + '"/>'
//		    setting_html += '{{' + subsetting_model + '}};';
//		    var subsetting_model_var = $parse(subsetting_model);
//		    subsetting_model_var.assign($scope, value_tokens[i]);
//		}	    
//	    } else{
//		$log.info("Simple  Setting: " + setting_div_id + ", " + label_str);
//		device_html += '<label>' + label_str + '</label>';
//		device_html += '<input type="text" class="form-control" ng-model="'+ setting_model + '"/>';
//		setting_html += '{{' + setting_model + '}};';
//		var setting_model_var = $parse(setting_model);
//		setting_model_var.assign($scope, setting.value);
//	    }
//	    if (setting_html.length>=1) { // Removing last semicolon from the set of values
//		setting_html = setting_html.substring(0, setting_html.length-1)
//	    }
//	    var compiled_device_html = $compile(device_html)($scope)
//	    $('#'+type_setting_div_id).append(compiled_device_html);
//	    //$scope.result_message = value;
//	    $scope.data.settings[setting_model] = $interpolate(setting_html);
//	})
//
//    };
//    
//    $scope.loadExistingDeviceSettings = function(device){
//	var url = api_prefix + "configurator/api/v1.0/dslist/" + device.id;
//	$http.get(url).then(function (response) {
//	    var settings = response.data;
//	    for (var i=0; i<settings.length; i++) {
//		$log.info("Value: " + settings[i].value);
//		$scope.loadExistingDeviceSetting(device, settings[i]);
//	    }
//	})
//    };
//    


    
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



/*
 * Adding Device Setting - deprecated code
$scope.addDeviceSetting = function(newDevice, device_type_setting){
	$log.info("Adding a Setting");
	var type_setting_id = 'setting-'+ newDevice.id + '-' + device_type_setting.id;
	
	var url = api_prefix + "configurator/api/v1.0/dslist/" + newDevice.id;
	var Setting = $resource(url,{});
	var setting = new Setting();
	setting.device_id = newDevice.id;
	setting.type_setting_id = device_type_setting.id;
	setting.value = " "
	//var newDevice = {}
	setting.$save(setting,
	    //success
	    function( value ){
		// Getting the id associated to
		// the newly added setting
		var newSetting = value;
		var setting_id = type_setting_id + '-' + newSetting.id;
		var setting_model = 'setting_'+ newDevice.id + "_" +
				    device_type_setting.id + "_" + newSetting.id;

		$log.info("DeviceSetting id: " + setting_id);
		device_html = '<div id="' + newSetting.id + '" class="setting">';
		
		var label_str = device_type_setting.label.trim();
		var setting_html = ""
		if(label_str[label_str.length-1]==')'){
		    $log.info("Compound Setting: " + setting_id + ", " + label_str);
		    // Removing the last ')' character
		    label_str = label_str.substr(0, label_str.length-1);
		    // Seperating the compound setting main label with
		    // label tokens
		    var tokens = label_str.split('(');
		    var label_main = tokens[0].trim();
		    var label_tokens = tokens[1].split(';');
		    // device_html += '<label>' + label_main + '</label>';
		    for (var i=0; i<label_tokens.length; i++) {
			subsetting_model = setting_model + "_" + i;
			$log.info("Sub Field: " + label_tokens[i].trim() + "; Id: " + subsetting_model);
			device_html += '<input type"text" placeholder="' + label_tokens[i].trim() +
					'" ng-model="' + subsetting_model + '"/>'
			setting_html += '{{' + subsetting_model + '}};';
		    }	    
		} else{
		    $log.info("Simple  Setting: " + setting_id + ", " + label_str);
		    device_html += '<label>' + device_type_setting.label + '</label>';
		    device_html += '<input type="text" ng-model="'+ setting_model + '"/><br/>';
		    setting_html += '{{' + setting_model + '}};';
		}
		if (setting_html.length>=1) { // Removing last semicolon from the set of values
		    setting_html = setting_html.substring(0, setting_html.length-1)
		}
		device_html += setting_html + "<br/>";
		var compiled_device_html = $compile(device_html)($scope)
		$('#'+type_setting_id).append(compiled_device_html);
		//$scope.result_message = value;
		$scope.data.settings[setting_model] = $interpolate(setting_html);
		//newDevice.settings[setting_model] = setting_html;
		$log.info("Setting model assigned as: " + setting_html);
	    },
	    //error
	    function( error ){
		$window.alert("Some trouble adding setting");
	    }
	)
    }
*/

