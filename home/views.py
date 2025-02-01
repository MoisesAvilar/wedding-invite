from django.http import JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from .models import Gift
from .forms import GiftForm


def gift_list_view(request):
    gifts = Gift.objects.all()

    if request.method == "POST":
        form = GiftForm(request.POST)
        if form.is_valid():
            gift_id = form.cleaned_data["gift"]  # Pega o ID enviado
            gift = get_object_or_404(Gift, id=gift_id)

            if gift.disponivel:  # Apenas marca como indisponível se estiver disponível
                gift.disponivel = False
                gift.save()
            
            return redirect("gift_confirm")

    else:
        form = GiftForm()

    return render(request, "gift_template.html", {"gifts": gifts, "form": form})


def unavailable(request, gift_id):
    gift = get_object_or_404(Gift, id=gift_id)

    # Verifica se o presente está disponível
    if gift.available:
        gift.available = False
        gift.save()
        return JsonResponse({"status": "sucesso", "message": "Presente marcado como indisponível."})
    else:
        return JsonResponse({"status": "erro", "message": "O presente já está indisponível."})

