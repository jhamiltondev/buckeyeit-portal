import os
from django.conf import settings
from django.http import FileResponse

def spa_index(request):
    index_path = os.path.join(settings.BASE_DIR, 'client-portal-frontend', 'build', 'index.html')
    return FileResponse(open(index_path, 'rb')) 