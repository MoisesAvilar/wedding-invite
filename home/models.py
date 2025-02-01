from django.db import models
from home.gift_choice import GIFT_LIST


class Gift(models.Model):
    gift = models.CharField(max_length=100, choices=GIFT_LIST)
    available = models.BooleanField(default=True)

    def __str__(self):
        return self.gift
