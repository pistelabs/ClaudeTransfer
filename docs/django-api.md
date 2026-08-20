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

| GET | `/appointment-groups/` | Appointment types, each with its `appointments` nested |
| POST | `/appointment-groups/` | `{ "name": "Standard" }` |
| PATCH | `/appointment-groups/{id}/` | `{ "name": "…" }` |
| DELETE | `/appointment-groups/{id}/` | Cascades to its appointments |
| POST | `/appointments/` | Full appointment payload including `group` |
| PUT | `/appointments/{id}/` | Full appointment payload |
| DELETE | `/appointments/{id}/` | |
| GET | `/sending-domain/` | `{ "address": "alpinewerks@pistelabs.com" }` — read-only |
| GET | `/notifications/` | Notification events, ordered by `position` |
| PATCH | `/notifications/{id}/` | Editable fields only (see below) |
| POST | `/notifications/{id}/send-test/` | `{ "channel": "sms" \| "email", "recipient": "…" }` |

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

## Appointment payload

```json
{
  "group": 1,
  "mode": "work",
  "name": "Boot Fitting",
  "description": "In-store fitting consultation",
  "color": "#0284c7",
  "duration": 45,
  "duration_unit": "min",

  "price": "60.00",
  "buffer_amount": 10,
  "buffer_unit": "min",
  "buffer_position": "after",
  "booking_ask_name": true,
  "booking_ask_email": true,
  "booking_ask_phone": true,
  "max_customers": 1,
  "staff_required": 1,
  "customer_signature_required": false,
  "customer_terms": "",
  "staff_signature_required": false,
  "staff_terms": "",
  "equipment_types": [13],

  "checkin_ask_name": true,
  "checkin_ask_email": true,
  "checkin_ask_phone": true,
  "checkin_ask_brand": true,
  "checkin_ask_model": true,
  "checkin_ask_size": true,
  "checkin_ask_colour": true,
  "checkin_ask_notes": true,
  "allow_service_booking": false,
  "bookable_services": [],

  "fields": [
    {
      "role": "booking",
      "label": "Preferred technician",
      "field_type": "free",
      "select_mode": "single",
      "copy_to_customer": true,
      "position": 0,
      "options": []
    }
  ],
  "is_hidden": false
}
```

Notes:

- `mode` is `work` (full booking) or `checkin` (workshop drop-off). Both modes post every field;
  the UI only shows the ones relevant to the selected mode.
- `fields` is one writable nested list covering all three questionnaires, split by `role`:
  `booking`, `customer`, `staff`. `copy_to_customer` applies to booking fields and mirrors the
  field onto the Customer information tab.
- `bookable_services` is a list of service PKs, used when `allow_service_booking` is true.

## Notification payload

`GET /notifications/` returns one row per event; the console only ever PATCHes the editable half:

```json
{
  "enabled": true,
  "sms_enabled": true,
  "email_enabled": false,
  "sms_mode": "custom",
  "sms_body": "Hi {Name}, your kit is ready.",
  "email_mode": "default",
  "email_subject": "",
  "email_body": "",
  "email_images": [{ "src": "https://…/logo.png", "placement": "header", "position": 0 }],
  "timing_hours": 24
}
```

The read side adds the identity and default copy, which the console never writes:
`key`, `name`, `audience` (`customer` / `staff`), `description`, `position`,
`sms_default_body`, `email_default_subject`, `email_default_body`,
`timing_when` (`before` / `after`) and `timing_anchor`.

Notes:

- Events are seeded rows, not user-created — there is no POST or DELETE for them.
- `*_mode` picks between the stock copy (`default`, shown read-only) and the shop's own text
  (`custom`).
- `email_images.placement` is one of `header`, `above_body`, `below_body`, `footer`; the list is
  writable and nested, ordered by `position`.
- `timing_hours` is only sent for events that have a timing (appointment reminder, review
  reminder).
- **Test sends are capped at 15 per rolling hour** across SMS and email. The console enforces this
  before calling `send-test/`, but the endpoint should enforce it too — a client-side limit is not
  a limit.
- The sending domain is fixed infrastructure config, so `/sending-domain/` is read-only.

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
    is_hidden = models.BooleanField(default=False)
    position = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["position", "id"]


class AppointmentGroup(models.Model):
    name = models.CharField(max_length=120)
    position = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["position", "id"]


class Appointment(models.Model):
    MODES = [("work", "Carry out work"), ("checkin", "Workshop check-in")]
    UNITS = [("min", "Minutes"), ("hr", "Hours")]
    BUFFER_POSITIONS = [("before", "Before"), ("after", "After"), ("both", "Both")]

    group = models.ForeignKey(AppointmentGroup, related_name="appointments", on_delete=models.CASCADE)
    mode = models.CharField(max_length=7, choices=MODES, default="work")
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default="#0284c7")
    duration = models.PositiveIntegerField(default=0)
    duration_unit = models.CharField(max_length=3, choices=UNITS, default="min")

    # Carry out work
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    buffer_amount = models.PositiveIntegerField(default=0)
    buffer_unit = models.CharField(max_length=3, choices=UNITS, default="min")
    buffer_position = models.CharField(max_length=6, choices=BUFFER_POSITIONS, default="after")
    booking_ask_name = models.BooleanField(default=True)
    booking_ask_email = models.BooleanField(default=True)
    booking_ask_phone = models.BooleanField(default=True)
    max_customers = models.PositiveIntegerField(default=1)
    staff_required = models.PositiveIntegerField(default=1)
    customer_signature_required = models.BooleanField(default=False)
    customer_terms = models.TextField(blank=True)
    staff_signature_required = models.BooleanField(default=False)
    staff_terms = models.TextField(blank=True)
    equipment_types = models.ManyToManyField(EquipmentType, related_name="appointments", blank=True)

    # Workshop check-in
    checkin_ask_name = models.BooleanField(default=True)
    checkin_ask_email = models.BooleanField(default=True)
    checkin_ask_phone = models.BooleanField(default=True)
    checkin_ask_brand = models.BooleanField(default=True)
    checkin_ask_model = models.BooleanField(default=True)
    checkin_ask_size = models.BooleanField(default=True)
    checkin_ask_colour = models.BooleanField(default=True)
    checkin_ask_notes = models.BooleanField(default=True)
    allow_service_booking = models.BooleanField(default=False)
    bookable_services = models.ManyToManyField(Service, related_name="appointments", blank=True)

    is_hidden = models.BooleanField(default=False)
    position = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["position", "id"]


class AppointmentField(models.Model):
    ROLES = [("booking", "Booking"), ("customer", "Customer"), ("staff", "Staff")]
    FIELD_TYPES = [("free", "Free entry"), ("options", "Predefined options"), ("file", "File upload")]
    SELECT_MODES = [("single", "Single select"), ("multi", "Multi select")]

    appointment = models.ForeignKey(Appointment, related_name="fields", on_delete=models.CASCADE)
    role = models.CharField(max_length=8, choices=ROLES)
    label = models.CharField(max_length=120)
    field_type = models.CharField(max_length=7, choices=FIELD_TYPES, default="free")
    select_mode = models.CharField(max_length=6, choices=SELECT_MODES, default="single")
    copy_to_customer = models.BooleanField(default=False)
    position = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["position", "id"]


class AppointmentFieldOption(models.Model):
    field = models.ForeignKey(AppointmentField, related_name="options", on_delete=models.CASCADE)
    value = models.CharField(max_length=120)
    position = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["position", "id"]


class NotificationEvent(models.Model):
    AUDIENCES = [("customer", "Customer"), ("staff", "Staff")]
    MODES = [("default", "Default"), ("custom", "Custom")]
    WHEN = [("before", "Before"), ("after", "After")]

    key = models.SlugField(unique=True)
    name = models.CharField(max_length=120)
    audience = models.CharField(max_length=8, choices=AUDIENCES, default="customer")
    description = models.CharField(max_length=200, blank=True)
    position = models.PositiveIntegerField(default=0)

    enabled = models.BooleanField(default=True)
    sms_enabled = models.BooleanField(default=False)
    email_enabled = models.BooleanField(default=False)

    sms_mode = models.CharField(max_length=7, choices=MODES, default="default")
    sms_body = models.TextField(blank=True)
    sms_default_body = models.TextField(blank=True)

    email_mode = models.CharField(max_length=7, choices=MODES, default="default")
    email_subject = models.CharField(max_length=200, blank=True)
    email_body = models.TextField(blank=True)
    email_default_subject = models.CharField(max_length=200, blank=True)
    email_default_body = models.TextField(blank=True)

    timing_hours = models.PositiveIntegerField(null=True, blank=True)
    timing_when = models.CharField(max_length=6, choices=WHEN, null=True, blank=True)
    timing_anchor = models.CharField(max_length=120, blank=True)

    class Meta:
        ordering = ["position", "id"]


class NotificationImage(models.Model):
    PLACEMENTS = [
        ("header", "Header"),
        ("above_body", "Above body"),
        ("below_body", "Below body"),
        ("footer", "Footer"),
    ]

    event = models.ForeignKey(
        NotificationEvent, related_name="email_images", on_delete=models.CASCADE
    )
    src = models.URLField()
    placement = models.CharField(max_length=10, choices=PLACEMENTS, default="header")
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
    Appointment,
    AppointmentField,
    AppointmentFieldOption,
    AppointmentGroup,
    EquipmentType,
    NotificationEvent,
    NotificationImage,
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

class AppointmentFieldOptionSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = AppointmentFieldOption
        fields = ["id", "value", "position"]


class AppointmentFieldSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    options = AppointmentFieldOptionSerializer(many=True, required=False)

    class Meta:
        model = AppointmentField
        fields = [
            "id",
            "role",
            "label",
            "field_type",
            "select_mode",
            "copy_to_customer",
            "position",
            "options",
        ]


class AppointmentSerializer(serializers.ModelSerializer):
    fields = AppointmentFieldSerializer(many=True, required=False)

    class Meta:
        model = Appointment
        exclude = []

    def create(self, validated_data):
        fields = validated_data.pop("fields", [])
        equipment_types = validated_data.pop("equipment_types", [])
        services = validated_data.pop("bookable_services", [])
        validated_data.setdefault("position", self._next_position(validated_data["group"]))
        appointment = Appointment.objects.create(**validated_data)
        appointment.equipment_types.set(equipment_types)
        appointment.bookable_services.set(services)
        self._sync_fields(appointment, fields)
        return appointment

    def update(self, instance, validated_data):
        fields = validated_data.pop("fields", None)
        equipment_types = validated_data.pop("equipment_types", None)
        services = validated_data.pop("bookable_services", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if equipment_types is not None:
            instance.equipment_types.set(equipment_types)
        if services is not None:
            instance.bookable_services.set(services)
        if fields is not None:
            self._sync_fields(instance, fields)
        return instance

    @staticmethod
    def _next_position(group):
        last = Appointment.objects.filter(group=group).order_by("-position").first()
        return last.position + 1 if last else 0

    def _sync_fields(self, appointment, fields):
        """Replace booking, customer and staff questions with what was sent."""
        appointment.fields.all().delete()
        for position, field in enumerate(fields):
            options = field.pop("options", [])
            field.pop("id", None)
            field["position"] = position
            appointment_field = AppointmentField.objects.create(appointment=appointment, **field)
            for option_position, option in enumerate(options):
                option.pop("id", None)
                option["position"] = option_position
                AppointmentFieldOption.objects.create(field=appointment_field, **option)


class AppointmentGroupSerializer(serializers.ModelSerializer):
    appointments = AppointmentSerializer(many=True, read_only=True)

    class Meta:
        model = AppointmentGroup
        fields = ["id", "name", "position", "appointments"]

    def create(self, validated_data):
        last = AppointmentGroup.objects.order_by("-position").first()
        validated_data.setdefault("position", last.position + 1 if last else 0)
        return super().create(validated_data)

class NotificationImageSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = NotificationImage
        fields = ["id", "src", "placement", "position"]


class NotificationEventSerializer(serializers.ModelSerializer):
    email_images = NotificationImageSerializer(many=True, required=False)

    class Meta:
        model = NotificationEvent
        fields = "__all__"
        # Identity and default copy are seeded, never written by the console.
        read_only_fields = [
            "key",
            "name",
            "audience",
            "description",
            "position",
            "sms_default_body",
            "email_default_subject",
            "email_default_body",
            "timing_when",
            "timing_anchor",
        ]

    def update(self, instance, validated_data):
        images = validated_data.pop("email_images", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if images is not None:
            instance.email_images.all().delete()
            for position, image in enumerate(images):
                image.pop("id", None)
                image["position"] = position
                NotificationImage.objects.create(event=instance, **image)
        return instance
```

```python
# views.py
from django.conf import settings
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Appointment,
    AppointmentGroup,
    EquipmentType,
    NotificationEvent,
    Service,
    ServiceGroup,
)
from .serializers import (
    AppointmentGroupSerializer,
    AppointmentSerializer,
    EquipmentTypeSerializer,
    NotificationEventSerializer,
    ServiceGroupSerializer,
    ServiceSerializer,
)


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


class AppointmentGroupViewSet(viewsets.ModelViewSet):
    queryset = AppointmentGroup.objects.prefetch_related(
        "appointments__equipment_types",
        "appointments__bookable_services",
        "appointments__fields__options",
    )
    serializer_class = AppointmentGroupSerializer


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.prefetch_related(
        "equipment_types", "bookable_services", "fields__options"
    )
    serializer_class = AppointmentSerializer


class SendingDomainView(APIView):
    """Read-only: the address every notification is sent from."""

    def get(self, request):
        return Response({"address": settings.NOTIFICATION_SENDING_DOMAIN})


class NotificationEventViewSet(viewsets.ModelViewSet):
    """Events are seeded rows — list, retrieve and update only."""

    http_method_names = ["get", "patch", "put", "post", "head", "options"]
    queryset = NotificationEvent.objects.prefetch_related("email_images")
    serializer_class = NotificationEventSerializer

    @action(detail=True, methods=["post"], url_path="send-test")
    def send_test(self, request, pk=None):
        event = self.get_object()
        channel = request.data.get("channel")
        recipient = request.data.get("recipient", "").strip()
        if channel not in {"sms", "email"} or not recipient:
            return Response(
                {"detail": "channel and recipient are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        # Enforce the 15-per-hour cap server-side as well as in the console.
        if not test_send_allowed(request.user):
            return Response(
                {"detail": "Test-send limit reached. Try again later."},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )
        record_test_send(request.user, event, channel, recipient, timezone.now())
        # …hand off to your SMS/email provider here…
        return Response(status=status.HTTP_204_NO_CONTENT)
```

```python
# urls.py
from rest_framework.routers import DefaultRouter

from django.urls import path

from .views import (
    AppointmentGroupViewSet,
    AppointmentViewSet,
    EquipmentTypeViewSet,
    NotificationEventViewSet,
    SendingDomainView,
    ServiceGroupViewSet,
    ServiceViewSet,
)

router = DefaultRouter()
router.register("equipment-types", EquipmentTypeViewSet)
router.register("service-groups", ServiceGroupViewSet)
router.register("services", ServiceViewSet)
router.register("appointment-groups", AppointmentGroupViewSet)
router.register("appointments", AppointmentViewSet)
router.register("notifications", NotificationEventViewSet)

urlpatterns = router.urls + [
    path("sending-domain/", SendingDomainView.as_view()),
]
```

`position` is assigned server-side on create so new services and groups append to the end; the UI
keeps its lists sorted by it.

`_sync_fields` (on both serializers) deletes and recreates rows, which is the simplest correct
behaviour for a form that always posts the full list. Switch to an upsert keyed on the incoming `id` if you need the field PKs
to survive edits (e.g. because captured answers reference them).
