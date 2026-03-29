import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# ---------- Core ----------
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'insecure-dev-key')
DEBUG = os.environ.get('DEBUG', '0') == '1'
ALLOWED_HOSTS = ['*']

# ---------- Apps ----------
INSTALLED_APPS = [
    'daphne',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'drf_spectacular',
    'chat_app',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'chat_project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

ASGI_APPLICATION = 'chat_project.asgi.application'

# ---------- Database ----------
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('POSTGRES_DB', 'ft_transcendence'),
        'USER': os.environ.get('POSTGRES_USER', 'ft_user'),
        'PASSWORD': os.environ.get('POSTGRES_PASSWORD', 'devpassword'),
        'HOST': os.environ.get('POSTGRES_HOST', 'postgres'),
        'PORT': os.environ.get('POSTGRES_PORT', '5432'),
    }
}

# ---------- Redis Channel Layer ----------
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [
                f"redis://:{os.environ.get('REDIS_PASSWORD', '')}@{os.environ.get('REDIS_HOST', 'redis_broker')}:{os.environ.get('REDIS_PORT', 6379)}/0"
            ],
        },
    },
}

# ---------- CORS ----------
CORS_ALLOWED_ORIGINS = [
    'https://localhost',
    'https://127.0.0.1',
]

# ---------- i18n ----------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ---------- Static ----------
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ---------- REST Framework ----------
REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# ---------- API Documentation ----------
SPECTACULAR_SETTINGS = {
    'TITLE': 'ft_transcendence Chat API',
    'DESCRIPTION': 'Chat rooms, messaging, and real-time communication API.',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'SWAGGER_UI_SETTINGS': {
        'deepLinking': True,
    },
}

# ---------- AI Service ----------
AI_SERVICE_URL = os.environ.get('AI_SERVICE_URL', 'http://ai_service:8002/api/ai')
