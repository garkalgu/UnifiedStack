import sys
import os
import time
from configurator import fetch_db
from configurator.models import DeviceTypeSetting, Device, DeviceSetting 
from codebase.UnifiedStack.cli import Console_Output as con
from codebase.UnifiedStack.netswitch.Switch_Config_Generator import SwitchConfigGenerator
#from codebase.UnifiedStack.config import Config_Parser as cfg
import paramiko
import socket
class SwitchConfigurator:
    # Returns SSH connection through which terminal needs to be invoked to send
    # a command and recieve it's output
    
    def establish_connection(self, ipaddress, username, password):
        remote_conn_pre = paramiko.SSHClient()
        # Automatically add untrusted hosts
        remote_conn_pre.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        remote_conn_pre.connect(
            ipaddress,
            username=username,
            password=password)
        return remote_conn_pre

    # Used to configure any switch with reference to the topology provided from
    # config file.
    def configure_device_with_file(self, ip_address, username, password, commands_file):
        remote_conn_client = self.establish_connection(
            ipaddress=ip_address,
            username=username,
            password=password)
        # Use invoke_shell to establish an 'interactive session'	
        remote_conn = remote_conn_client.invoke_shell()
        output = remote_conn.recv(1000)	
	lines=[]
        with open(commands_file) as file:
	    lines=file.readlines()
            # error check for ssh connection and send function and retry 3
            # times if fail
	for line in lines:
            success = False
            attempts = 0 
	    count=0
            while (success == False) and (attempts < 3):		
                try:
                    remote_conn.send(line)
		    print line
                    time.sleep(1)
                    success = True
                except socket.error:
		    attempts += 1
        output = remote_conn.recv(5000)

    def configure_switch(self, console):
	switch_device_list=Device.objects.filter(dtype = DeviceTypeSetting.SWITCH_TYPE)
	#console.cprint_progress_bar("Generating config files for switches", 10)
        sw_gen = SwitchConfigGenerator()
	print len(switch_device_list)
	for device in switch_device_list:  	 
            sw_gen.generate_config_file(device)
	    Config = fetch_db.Switch(device)
	    ip_address=Config.get("ip-address")
	    username=Config.get("username")
	    password=Config.get("password") 
	    self.configure_device_with_file(ip_address=ip_address,
			        username=username,
			        password=password,
				commands_file= str(device.id) + "_commands.cmds")
        console.cprint_progress_bar("Configured the  switches", 100)
	print "here"


if __name__ == "__main__":
    sw_config = SwitchConfigurator()
    # sw_config.configure_switch(con.ConsoleOutput())
