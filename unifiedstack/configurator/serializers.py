from rest_framework import serializers
from configurator.models import DeviceTypeSetting, DeviceType, Device, DeviceSetting

# Serializers define the API representation.
class DeviceTypeSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = DeviceType
        fields = ('id','dname','if_device')
    
    
class DeviceSettingSerializer(serializers.HyperlinkedModelSerializer):
    device_id = serializers.PrimaryKeyRelatedField(source='device')
    device_title = serializers.SlugRelatedField(source='device', slug_field='title', read_only=True)
    device_type = serializers.SlugRelatedField(source='device_type_setting',slug_field='label',read_only=True)
    device_type_setting_id = serializers.SlugRelatedField(source ='device_type_setting',slug_field='id',read_only=True)
    class Meta:
        model = DeviceSetting
        # fields = ('id', 'label', 'desc', 'stype', 'value', 'standard_label', 'setting_id', 'device_id', 'device_title', )
        fields = ('id','device_id','device_title','device_type_setting_id','device_type', 'value',)

class DeviceTypeSettingSerializer(serializers.HyperlinkedModelSerializer):
    setting_values = serializers.RelatedField(source='values', many=True)
    Device_name = serializers.SlugRelatedField(source = 'd_type',slug_field='dname')
    #setting_id = serializers.PrimaryKeyRelatedField(source='compound_settings', required=False)
    class Meta:
        model = DeviceTypeSetting
        # fields = ('id', 'label', 'desc', 'stype', 'value', 'standard_label', 'setting_id', 'device_id', 'device_title', )
        fields = ('id','Device_name', 'stype', 'label', 'desc', 'standard_label', 'level', 'multiple', 'setting_values',)

class DeviceSerializer(serializers.HyperlinkedModelSerializer):
    #logs = serializers.RelatedField(source='logs', many=True)
    #settings = serializers.RelatedField(source='settings', many=True)
    deviceName = serializers.SlugRelatedField(source="d_type",slug_field="dname",read_only=True)
    device_type_id = serializers.PrimaryKeyRelatedField(source="d_type")
    class Meta:
        model = Device
        fields = ('id' , 'deviceName', 'device_type_id', 'title', 'desc', )        