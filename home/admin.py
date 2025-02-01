from django.contrib import admin
from home.models import Gift


@admin.register(Gift)
class HomeAdmin(admin.ModelAdmin):
    list_display = ('gift',)