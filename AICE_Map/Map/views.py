from django.shortcuts import render

# Create your views here.


def map(request):
    context = {}
    return render(request, "map.html", context=context)
