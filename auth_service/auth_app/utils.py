def safe_media_url(file_field):
    """Return the URL of a file field, or None if the field is empty or broken."""
    if not file_field:
        return None
    try:
        if not getattr(file_field, 'name', None):
            return None
        return file_field.url
    except Exception:
        return None
