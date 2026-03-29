import os
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

# ---------- Core ----------
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'insecure-dev-key')
DEBUG = os.environ.get('DEBUG', '0') == '1'
ALLOWED_HOSTS = ['*']
ALLOWED_HOSTS += ['auth_service', 'auth-service', 'localhost', '127.0.0.1']

# Allow internal service-to-service calls with underscore hostnames
import django.http.request as _req
_req.validate_host = lambda host, allowed_hosts: True
DOMAIN = os.environ.get('DOMAIN', 'localhost')

# ---------- Apps ----------
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'rest_framework_simplejwt.token_blacklist',
    'drf_spectacular',
    'auth_app',
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

ROOT_URLCONF = 'auth_project.urls'

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

WSGI_APPLICATION = 'auth_project.wsgi.application'

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

# ---------- Auth ----------
AUTHENTICATION_BACKENDS = [
    'auth_app.backends.EmailBackend',
    'django.contrib.auth.backends.ModelBackend',  # Fallback
]

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ---------- REST Framework ----------
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_THROTTLE_CLASSES': (
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ),
    'DEFAULT_THROTTLE_RATES': {
        'anon': '30/minute',
        'user': '100/minute',
    },
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# ---------- API Documentation ----------
SPECTACULAR_SETTINGS = {
    'TITLE': 'ft_transcendence Auth API',
    'DESCRIPTION': 'Authentication, user management, friends, stats, leaderboard, and match recording API.',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'SWAGGER_UI_SETTINGS': {
        'deepLinking': True,
        'persistAuthorization': True,
    },
    'COMPONENT_SPLIT_REQUEST': True,
    'TAGS': [
        {'name': 'Auth', 'description': 'Registration, login, logout, token refresh'},
        {'name': 'Profile', 'description': 'User profile and avatar/banner management'},
        {'name': 'Users', 'description': 'User discovery and public profiles'},
        {'name': 'Friends', 'description': 'Friend list management'},
        {'name': 'Stats', 'description': 'Player statistics, match history, achievements'},
        {'name': 'Leaderboard', 'description': 'Global ranking'},
        {'name': 'Presence', 'description': 'Online/offline heartbeat'},
        {'name': 'OAuth', 'description': '42 OAuth integration'},
        {'name': 'Match', 'description': 'Internal match result recording'},
    ],
}

# ---------- JWT ----------
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(
        minutes=int(os.environ.get('JWT_ACCESS_TOKEN_LIFETIME_MINUTES', 60))
    ),
    'REFRESH_TOKEN_LIFETIME': timedelta(
        days=int(os.environ.get('JWT_REFRESH_TOKEN_LIFETIME_DAYS', 7))
    ),
    'SIGNING_KEY': os.environ.get('JWT_SECRET_KEY', SECRET_KEY),
    'AUTH_HEADER_TYPES': ('Bearer',),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

# ---------- CORS ----------
CORS_ALLOWED_ORIGINS = [
    'https://localhost',
    'https://127.0.0.1',
]

# ---------- Reverse proxy (gateway) ----------
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True

# ---------- OAuth 42 ----------
OAUTH_42_CLIENT_ID = os.environ.get('OAUTH_42_CLIENT_ID', '')
OAUTH_42_CLIENT_SECRET = os.environ.get('OAUTH_42_CLIENT_SECRET', '')
OAUTH_42_REDIRECT_URI = os.environ.get('OAUTH_42_REDIRECT_URI', '')

# ---------- i18n ----------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ---------- Static / Media ----------
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

AUTH_USER_MODEL = 'auth_app.User'

# ---------- AI Service ----------
AI_SERVICE_URL = os.environ.get('AI_SERVICE_URL', 'http://ai_service:8002/api/ai')

SERVICE_SECRET = (os.environ.get('SERVICE_SECRET') or 'dev-service-secret').strip() or 'dev-service-secret'
