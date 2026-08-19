# Django API contract

The admin console reads and writes everything through a Django REST Framework API.
`lib/api/django-workshop-api.ts` calls the endpoints below; `lib/api/serializers.ts` maps the
snake_case wire format onto the camelCase types in `lib/workshop/types.ts`.

Set the base URL in `.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

With that unset the console falls back to `lib/api/mock-workshop-api.ts` (in-memory) and shows a
banner saying so, which keeps the UI reviewable before the backend exists.

## Auth

Requests are sent with `credentials: "include"` (Django session cookie) and, for unsafe methods,
the `csrftoken` cookie echoed in the `X-CSRFToken` header. For a cross-origin backend:

```python
CORS_ALLOWED_ORIGINS = ["http://localhost:3000"]
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = ["http://localhost:3000"]
```

Swap `lib/api/http.ts` if you use token or JWT auth instead — it is the only place auth is applied.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/equipment-types/` | All equipment types with their `enabled` flag |
| GET | `/service-groups/` | Groups, each with its `services` nested, ordered by `position` |
| POST | `/service-groups/` | `{ "name": "Standard tunes" }` |
| PATCH | `/service-groups/{id}/` | `{ "name": "…" }` |
| DELETE | `/service-groups/{id}/` | Cascades to its services |
| POST | `/services/` | Full service payload including `group` |
| PUT | `/services/{id}/` | Full service payload (the dialog always sends every field) |
| DELETE | `/services/{id}/` | |

Plain lists and DRF's paginated `{count, next, previous, results}` envelope are both accepted.

Not yet consumed by the UI, but the same shape is expected when the Appointments section is built:
`/appointment-groups/` (nested `appointments`) and `/appointments/`.

## Service payload

```json
{
  "group": 1,
  "name": "Full Tune",
  "description": "Base grind, edge sharpen, hot wax",
  "color": "#3b82f6",
  "pricing_type": "fixed",
  "price": "170.00",
  "duration": 45,
  "duration_unit": "min",
  "allow_multiples": false,
  "equipment_types": [1, 2],
  "standard_entries": ["din"],
  "required_fields": [
    {
      "label": "Rider ability",
      "field_type": "options",
      "select_mode": "single",
      "position": 0,
      "options": [{ "value": "Beginner", "position": 0 }]
    }
  ],
  "checkin_waiver_required": true,
  "checkin_terms": "…",
  "checkin_customer_signature": true,
  "checkin_staff_signature": false,
  "release_waiver_required": false,
  "release_terms": "",
  "release_customer_signature": true,
  "release_staff_signature": false,
  "docket_count": 1,
  "barcode_on_docket": true,
  "is_hidden": false
}
```

Notes:

- `price` is sent as a decimal string, matching DRF's `DecimalField` output.
- `equipment_types` is a list of equipment-type PKs (many-to-many).
- `standard_entries` holds codes: `din`, `snowboard_stance`.
- `required_fields` is a **writable nested** list: the server replaces the service's fields and their
  options with what is sent, using `position` for ordering. Existing rows include their `id`.
- Responses echo the saved object; the UI replaces its local copy with the response.

Validation errors are surfaced in the UI. DRF's `{"name": ["This field is required."]}` and
`{"detail": "…"}` are both understood.

## Reference implementation

```python
# models.py
from django.db import models


class EquipmentType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    enabled = models.BooleanField(default=False)
    position = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["position", "id"]


class ServiceGroup(models.Model):
    name = models.CharField(max_length=120)
    position = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["position", "id"]


class Service(models.Model):
    PRICING_CHOICES = [("fixed", "Fixed price"), ("quoted", "Quoted per job")]
    DURATION_UNITS = [("min", "Minutes"), ("hr", "Hours")]

    group = models.ForeignKey(ServiceGroup, related_name="services", on_delete=models.CASCADE)
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default="#3b82f6")
    pricing_type = models.CharField(max_length=6, choices=PRICING_CHOICES, default="fixed")
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    duration = models.PositiveIntegerField(default=0)
    duration_unit = models.CharField(max_length=3, choices=DURATION_UNITS, default="min")
    allow_multiples = models.BooleanField(default=False)
    equipment_types = models.ManyToManyField(EquipmentType, related_name="services", blank=True)
    standard_entries = models.JSONField(default=list, blank=True)  # ["din", "snowboard_stance"]

    checkin_waiver_required = models.BooleanField(default=False)
    checkin_terms = models.TextField(blank=True)
    checkin_customer_signature = models.BooleanField(default=True)
    checkin_staff_signature = models.BooleanField(default=False)

    release_waiver_required = models.BooleanField(default=False)
    release_terms = models.TextField(blank=True)
    release_customer_signature = models.BooleanField(default=True)
    release_staff_signature = models.BooleanField(default=False)

    docket_count = models.PositiveIntegerField(default=1)
    barcode_on_docket = models.BooleanField(default=True)
    is_hidden = models.BooleanField(default=False)
    position = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["position", "id"]


class RequiredField(models.Model):
    FIELD_TYPES = [("free", "Free entry"), ("options", "Predefined options"), ("file", "File upload")]
    SELECT_MODES = [("single", "Single select"), ("multi", "Multi select")]

    service = models.ForeignKey(Service, related_name="required_fields", on_delete=models.CASCADE)
    label = models.CharField(max_length=120)
    field_type = models.CharField(max_length=7, choices=FIELD_TYPES, default="free")
    select_mode = models.CharField(max_length=6, choices=SELECT_MODES, default="single")
    position = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["position", "id"]


class RequiredFieldOption(models.Model):
    field = models.ForeignKey(RequiredField, related_name="options", on_delete=models.CASCADE)
    value = models.CharField(max_length=120)
    position = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["position", "id"]
```

```python
# serializers.py
from rest_framework import serializers

from .models import (
    EquipmentType,
    RequiredField,
    RequiredFieldOption,
    Service,
    ServiceGroup,
)


class EquipmentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EquipmentType
        fields = ["id", "name", "enabled"]


class RequiredFieldOptionSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = RequiredFieldOption
        fields = ["id", "value", "position"]


class RequiredFieldSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    options = RequiredFieldOptionSerializer(many=True, required=False)

    class Meta:
        model = RequiredField
        fields = ["id", "label", "field_type", "select_mode", "position", "options"]


class ServiceSerializer(serializers.ModelSerializer):
    required_fields = RequiredFieldSerializer(many=True, required=False)

    class Meta:
        model = Service
        fields = "__all__"

    def create(self, validated_data):
        fields = validated_data.pop("required_fields", [])
        equipment_types = validated_data.pop("equipment_types", [])
        validated_data.setdefault("position", self._next_position(validated_data["group"]))
        service = Service.objects.create(**validated_data)
        service.equipment_types.set(equipment_types)
        self._sync_fields(service, fields)
        return service

    def update(self, instance, validated_data):
        fields = validated_data.pop("required_fields", None)
        equipment_types = validated_data.pop("equipment_types", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if equipment_types is not None:
            instance.equipment_types.set(equipment_types)
        if fields is not None:
            self._sync_fields(instance, fields)
        return instance

    @staticmethod
    def _next_position(group):
        """New services append to the end of their group."""
        last = Service.objects.filter(group=group).order_by("-position").first()
        return last.position + 1 if last else 0

    def _sync_fields(self, service, fields):
        """Replace the service's required fields (and their options) with what was sent."""
        service.required_fields.all().delete()
        for position, field in enumerate(fields):
            options = field.pop("options", [])
            field.pop("id", None)
            field["position"] = position
            required_field = RequiredField.objects.create(service=service, **field)
            for option_position, option in enumerate(options):
                option.pop("id", None)
                option["position"] = option_position
                RequiredFieldOption.objects.create(field=required_field, **option)


class ServiceGroupSerializer(serializers.ModelSerializer):
    services = ServiceSerializer(many=True, read_only=True)

    class Meta:
        model = ServiceGroup
        fields = ["id", "name", "position", "services"]

    def create(self, validated_data):
        """New groups append to the end of the tab strip."""
        last = ServiceGroup.objects.order_by("-position").first()
        validated_data.setdefault("position", last.position + 1 if last else 0)
        return super().create(validated_data)
```

```python
# views.py
from rest_framework import viewsets

from .models import EquipmentType, Service, ServiceGroup
from .serializers import EquipmentTypeSerializer, ServiceGroupSerializer, ServiceSerializer


class EquipmentTypeViewSet(viewsets.ModelViewSet):
    queryset = EquipmentType.objects.all()
    serializer_class = EquipmentTypeSerializer


class ServiceGroupViewSet(viewsets.ModelViewSet):
    queryset = ServiceGroup.objects.prefetch_related(
        "services__equipment_types", "services__required_fields__options"
    )
    serializer_class = ServiceGroupSerializer


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.prefetch_related("equipment_types", "required_fields__options")
    serializer_class = ServiceSerializer
    filterset_fields = ["group"]  # needs django-filter installed and configured
```

```python
# urls.py
from rest_framework.routers import DefaultRouter

from .views import EquipmentTypeViewSet, ServiceGroupViewSet, ServiceViewSet

router = DefaultRouter()
router.register("equipment-types", EquipmentTypeViewSet)
router.register("service-groups", ServiceGroupViewSet)
router.register("services", ServiceViewSet)

urlpatterns = router.urls
```

`position` is assigned server-side on create so new services and groups append to the end; the UI
keeps its lists sorted by it.

`_sync_fields` deletes and recreates rows, which is the simplest correct behaviour for a form that
always posts the full list. Switch to an upsert keyed on the incoming `id` if you need the field PKs
to survive edits (e.g. because captured answers reference them).
