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
                ('dtype', models.CharField(max_length=2, choices=[(b'S', b'Switch'), (b'C', b'Cobbler'), (b'F', b'FI'), (b'P', b'Packstack'), (b'FO', b'Foreman'), (b'G', b'General')])),
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
            name='DeviceTypeSetting',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('level', models.CharField(default=b'B', max_length=1, choices=[(b'M', b'Mandatory'), (b'B', b'Basic'), (b'O', b'Optional'), (b'A', b'Advanced')])),
                ('dtype', models.CharField(max_length=2, choices=[(b'S', b'Switch'), (b'C', b'Cobbler'), (b'F', b'FI'), (b'P', b'Packstack'), (b'FO', b'Foreman'), (b'G', b'General')])),
                ('stype', models.CharField(max_length=200)),
                ('label', models.CharField(max_length=200)),
                ('standard_label', models.CharField(max_length=200)),
                ('desc', models.CharField(default=b'', max_length=200, blank=True)),
                ('multiple', models.BooleanField()),
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
    ]
