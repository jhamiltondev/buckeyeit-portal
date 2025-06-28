from django import template
register = template.Library()

@register.filter
def dict_get(d, key):
    return d.get(key)

@register.filter
def img_fallback(value, fallback_url='/static/portal/assets/news-fallback.png'):
    if not value or not isinstance(value, str) or not value.startswith('http'):
        return fallback_url
    return value 