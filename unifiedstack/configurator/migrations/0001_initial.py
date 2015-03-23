# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Device',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('title', models.CharField(max_length=50)),
                ('desc', models.CharField(max_length=200, blank=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='DeviceSetting',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('value', models.CharField(max_length=200)),
                ('device', models.ForeignKey(related_name=b'settings', to='configurator.Device')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='DeviceType',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('dname', models.CharField(max_length=50)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='DeviceTypeSetting',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('level', models.CharField(default=b'B', max_length=1, choices=[(b'M', b'Mandatory'), (b'B', b'Basic'), (b'O', b'Optional'), (b'A', b'Advanced')])),
                ('stype', models.CharField(max_length=200)),
                ('label', models.CharField(max_length=200)),
                ('standard_label', models.CharField(max_length=200)),
                ('desc', models.CharField(default=b'', max_length=200, blank=True)),
                ('multiple', models.BooleanField(default=False)),
                ('dpurpose', models.CharField(default=b'AD', max_length=2, choices=[(b'AD', b'AD'), (b'CO', b'CO')])),
                ('d_type', models.ForeignKey(related_name=b'device_type', default=b'', to='configurator.DeviceType')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.AddField(
            model_name='devicesetting',
            name='device_type_setting',
            field=models.ForeignKey(related_name=b'values', to='configurator.DeviceTypeSetting'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='device',
            name='d_type',
            field=models.ForeignKey(related_name=b'dev_type', default=b'', to='configurator.DeviceType'),
            preserve_default=True,
        ),
    ]
