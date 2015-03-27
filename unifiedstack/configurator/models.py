from django.db import models

class DeviceType(models.Model):
    dname = models.CharField(max_length=50)
    def __str__(self):
        return str(self.id) + ": "+ str(self.dname)
#   A new device being added such as "Switch-nexus9K" which should be registred by the admin will be added to this.
#   Other models reference from this model for the drop-down menu

class DeviceTypeSetting(models.Model):
    MANDATORY_LEVEL = 'M'
    BASIC_LEVEL = 'B'
    OPTIONAL_LEVEL = 'O'
    ADVANCED_LEVEL = 'A'
    
    SETTING_LEVEL_CHOICES = (
        (MANDATORY_LEVEL, 'Mandatory'),
        (BASIC_LEVEL, 'Basic'),
        (OPTIONAL_LEVEL, 'Optional'),
        (ADVANCED_LEVEL, 'Advanced'),
    )
    
    ALPHA_TYPE = 'A'
    NUMERIC_TYPE = 'N'
    ALPHA_NUMERIC_TYPE = 'AN'
    PASSWORD_TYPE = 'P'
    IP_TYPE = 'IP'
    MAC_TYPE = 'MA'
    MULTIPLE_IP_TYPE = 'MI'
    EMAIL_TYPE = 'E'
    CUSTOM_TYPE = 'CU'
    
    SETTING_TYPE_CHOICES = (
        (ALPHA_TYPE, 'Aphabetic'),
        (NUMERIC_TYPE, 'Numeric'),
        (ALPHA_NUMERIC_TYPE, 'Alpha Numeric'),
        (PASSWORD_TYPE, 'Password'),
        (IP_TYPE, 'IPv4 Address'),
        (MAC_TYPE, 'MAC Address'),
        (MULTIPLE_IP_TYPE, 'Multiple IP Addresses'),
        (EMAIL_TYPE, 'Email'),
        (CUSTOM_TYPE, 'Custom'),
    )
    
    ADDITION = 'AD'
    CONNECTION = 'CO'
    
    PURPOSE_TYPE_CHOICES = (
        (ADDITION, 'AD'),
        (CONNECTION, 'CO'),
    )
    level = models.CharField(max_length=1, choices=SETTING_LEVEL_CHOICES,
                                    default=BASIC_LEVEL)
    d_type = models.ForeignKey(DeviceType, related_name="device_type",default="")
    stype = models.CharField(max_length=200,choices = SETTING_TYPE_CHOICES,default=ALPHA_NUMERIC_TYPE)
    label = models.CharField(max_length=200, blank=False)
    standard_label = models.CharField(max_length=200, blank=False)
    desc = models.CharField(max_length=200, blank=True, default="")
    multiple = models.BooleanField(default=False)
    dpurpose = models.CharField(max_length=2, choices=PURPOSE_TYPE_CHOICES ,default=ADDITION)
    def __str__(self):
        return self.label + ": " + self.level + ": " + self.d_type
#   The above DeviceTypeSetting model is used to store the TypeSetting of each device.Ex:"Hostname"(as label) can be stored for a switch
#   with other fields in the model specifying info about the label.
#   dpurpose is used to specify if the particular value is to be specified during addition of the device or during connection of the device(Step 2 or 3)
#   For a compound setting say ("hostsettings"  with "ip" and "password") we may use as follows
#   label (Host Settings(hostname; IP; Password))
#   Standard label (host_settings(hostname;ip; password))
#   value (rootuser;19.19.200.150;fun)
 
class Device(models.Model):
    title = models.CharField(max_length=50)
    d_type = models.ForeignKey(DeviceType, related_name="dev_type", default="")
    desc = models.CharField(max_length=200, blank=True)
    def __str__(self):
        return self.title + ":"  + ": " + self.desc
#   A new device which will be added by the user will be added to this.


class DeviceSetting(models.Model):
    device = models.ForeignKey(Device, related_name="settings")
    device_type_setting = models.ForeignKey(DeviceTypeSetting, related_name="values")
    value = models.CharField(max_length=200, blank=False)
    def __str__(self):
        return str(self.device_type_setting) + ": " + self.value
    def __unicode__(self):
        return unicode(self.value)
#   The value for each label specified in the DevicetypeSetting is stored for a corresponding entry in the DeviceTypeSetting and Device models.    
