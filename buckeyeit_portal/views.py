import os
from django.conf import settings
from django.http import FileResponse, HttpResponseNotFound, HttpResponse

def spa_index(request):
    index_path = os.path.join(settings.BASE_DIR, 'portal', 'static', 'portal', 'react', 'index.html')
    if not os.path.exists(index_path):
        return HttpResponseNotFound(f"index.html not found at {index_path}".encode('utf-8'))
    try:
        return FileResponse(open(index_path, 'rb'))
    except Exception as e:
        return HttpResponse(f"Error opening index.html at {index_path}: {e}".encode('utf-8'), status=500) 