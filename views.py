from django.contrib.auth.models import User

# Этот код создаст тебя автоматически при загрузке сайта
if not User.objects.filter(username='my_admin').exists():
    User.objects.create_superuser('my_admin', 'boxosh210@email.com', 'Baxo0909')