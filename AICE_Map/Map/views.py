from django.shortcuts import render

from .csv_analysis import get_county_total_data

# Create your views here.


def kenyanMap(request):
    country_data = get_county_total_data()
    context = {"country_data": country_data}

    return render(request, "kenyanMap.html", context=context)


def africanMap(request):
    return render(request, "africanMap.html")
