from django import forms
from .models import Gift


class GiftForm(forms.Form):
    gift = forms.ModelChoiceField(
        queryset=Gift.objects.filter(available=True),
        empty_label="Escolha um presente",
        widget=forms.Select(attrs={"class": "form-control"})
    )
