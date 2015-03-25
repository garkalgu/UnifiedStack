from django.conf.urls import patterns, url
from configurator import views

urlpatterns = patterns('',
                       url(r'^configurator/api/v1.0/dtl$', views.device_type_list), 
                       url(r'^configurator/api/v1.0/dtsl/(?P<p_dtype>[A-Z]+)/$', views.device_type_settings_list),
                       url(r'^configurator/api/v1.0/dtsget/(?P<dtsid>[0-9]+)/$', views.device_type_setting_get),
                       url(r'^configurator/api/v1.0/reload$', views.reload_configuration),
                       url(r'^configurator/api/v1.0/dlist/$', views.device_list),
                       url(r'^configurator/api/v1.0/dlist/(?P<p_dtype>[A-Z]+)/$', views.device_of_type_list),
                       url(r'^configurator/api/v1.0/dslist/(?P<dpk>[0-9]+)/$', views.device_settings_list),
                       url(r'^configurator/api/v1.0/configure$', views.configure_setup),
                       url(r'^configurator/api/v1.0/saveconfiguration$', views.save_configuration),
                       url(r'^configurator/api/v1.0/savenewdevice$', views.save_new_device),

                       url(r'^configurator/sample$', views.sample),
                )
