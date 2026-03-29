from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/chat/', include('chat_app.urls')),
    path('api/chat/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/chat/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
