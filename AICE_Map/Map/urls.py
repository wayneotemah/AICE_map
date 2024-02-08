from django.urls import path

from . import views

urlpatterns = [
    path("", views.kenyanMap, name="kenyanMap"),
    path("africa", views.africanMap, name="africanMap"),
]
