from django.urls import path
from home.views import gift_list_view, unavailable


urlpatterns = [
    path("", gift_list_view, name="gift_list"),
    path("unavailable/<int:gift_id>/", unavailable, name="unavailable"),
]
