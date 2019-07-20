from django import template
from fundsmart import settings

register = template.Library()


@register.simple_tag
def get_domain():
    """returns FRONTEND_DOMAIN value from settings"""
    return settings.FRONTEND_DOMAIN
