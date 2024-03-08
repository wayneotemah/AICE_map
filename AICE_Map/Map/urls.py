from django.urls import path

from . import views

urlpatterns = [
    path("", views.kenyanMap, name="kenyanMap"),
    path("africa/", views.africanMap, name="africanMap"),
    path("analysis/", views.county_anlalysis, name="coutny analysis"),
]
