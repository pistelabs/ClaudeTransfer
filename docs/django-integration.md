# Connecting the Store Management UI to Django

The frontend ships with an in-memory mock adapter so every screen is clickable
before any backend exists. Pointing it at Django is a two-line change:

```bash
# frontend/.env.local
VITE_API_BASE_URL=http://localhost:8000/api
VITE_USE_MOCK_API=false
```

No component changes. Both adapters satisfy the same `StoreApi` interface
(`src/lib/api/types.ts`); `src/lib/api/index.ts` picks one at module load.

## Where the seams are

| File | What it owns |
| --- | --- |
| `src/lib/api/config.ts` | Base URL, CSRF cookie/header names, auth scheme, mock switch |
| `src/lib/api/http.ts` | fetch wrapper, CSRF, DRF pagination + error normalization |
| `src/lib/api/dto.ts` | snake_case ⇄ camelCase mapping — **rename serializer fields here only** |
| `src/lib/api/endpoints.ts` | Every URL path in one object |
| `src/lib/api/http-api.ts` | The real adapter |
| `src/lib/api/mock-api.ts` | The mock adapter (demo data) |
| `src/lib/api/queries.ts` | TanStack Query hooks + cache keys |

`ApiError` carries `status`, `detail` and DRF's per-field `fieldErrors`
(`{"email": ["Enter a valid email address."]}`), so serializer errors can be
surfaced on the matching form field.

## Endpoint contract

All list endpoints accept either a bare array or a DRF pagination envelope
(`{count, next, previous, results}`) — `unwrapList` handles both.

| Method | Path | Purpose |
| --- | --- | --- |
| GET / POST | `/staff/` | List, create staff |
| PATCH / DELETE | `/staff/{id}/` | Update, delete staff |
| GET | `/services/` | Bookable services |
| GET | `/time-blocks/?week_start=YYYY-MM-DD` | Blocks for a week (Monday) |
| POST | `/time-blocks/` | Create a block |
| PATCH / DELETE | `/time-blocks/{id}/` | Update, delete a block |
| POST | `/time-blocks/copy-day/` | `{staff, from_day, to_day, week_start}` → created blocks |
| GET / POST | `/leave/` | List, create annual leave |
| DELETE | `/leave/{id}/` | Delete a leave entry |
| GET / PATCH | `/store-settings/` | Singleton: online booking, walk-in, payment flag |
| GET | `/integrations/` | Integration list |
| POST | `/integrations/{id}/connect/` | Connect → returns the integration |
| POST | `/integrations/{id}/disconnect/` | Disconnect → returns the integration |
| GET / PATCH | `/printer-settings/` | Singleton |
| POST | `/printer-settings/test/` | `{ok: bool, detail: str}` |
| GET / PATCH | `/docket-settings/` | Singleton |

### Field shapes

Times are `"HH:MM"` on the wire (`"HH:MM:SS"` from Django is trimmed on read).
Days are `"Mon"`…`"Sun"`. Lead-time units are `"min" | "h" | "d"`.

```jsonc
// GET /staff/
{
  "id": 1, "name": "Mara Lindqvist", "role": "Rental Technician",
  "initials": "ML", "email": "mara@example.co", "phone": "+41 79 000 00 01",
  "status": "Active", "color": "#0284c7",
  "available_hours": 40, "days_off": ["Wed"],
  "booking_notify": "every",          // every | daily | none
  "can_check_equipment": true, "can_complete_appointments": true
}

// GET /time-blocks/
{
  "id": 12, "staff": 1, "day": "Mon",
  "start_time": "09:00", "end_time": "12:00",
  "categories": ["rental", "fitting"],   // rental | tuning | lessons | fitting
  "service_ids": [1, 2, 8],
  "recurring": true, "enabled": true,
  "interval_minutes": 30,                // 15 | 30 | 60 | 90 | 120
  "online": true,
  "breaks": [{"start_time": "12:00", "end_time": "12:30"}],
  "lead_times": {
    "1": {"custom": true, "min_value": 2, "min_unit": "h",
          "max_value": 60, "max_unit": "d"}
  }
}

// GET /store-settings/
{
  "store_name": "Chamonix",
  "online_booking_enabled": true, "booking_url": "book.example.app/shop",
  "min_notice_value": 2, "min_notice_unit": "h",
  "max_ahead_value": 60, "max_ahead_unit": "d",
  "walk_in_enabled": true, "walk_in_url": "book.example.app/shop/check-in",
  "walk_in_max_queue": 15, "walk_in_cutoff_when_full": true,
  "walk_in_notify_when_close": true, "walk_in_service_ids": [1, 2, 4, 8],
  "no_payment_software": false
}

// GET /docket-settings/
{
  "customer_copy_enabled": true,
  "header_text": "PisteLabs",
  "footer_text": "We are open daily from 7am-7pm.\nCheck us out online at …",
  "customer_elements": {"logo": true, "jobNumber": true, "checkedIn": true,
    "equipment": true, "specs": true, "services": true, "prices": true,
    "total": true, "payNotice": true, "barcode": true, "footer": true},
  "shop_elements": {"jobNumber": true, "itemCount": true, "timestamp": true,
    "equipment": true, "specs": true, "services": true, "serviceDetail": true,
    "notes": true, "customer": true, "barcode": true}
}
```

## A matching DRF sketch

```python
# models.py
class StaffMember(models.Model):
    NOTIFY = [("every", "Every booking"), ("daily", "Daily recap"), ("none", "None")]

    name = models.CharField(max_length=120)
    role = models.CharField(max_length=120)
    initials = models.CharField(max_length=4, blank=True)
    email = models.EmailField()
    phone = models.CharField(max_length=40, blank=True)
    status = models.CharField(max_length=16, default="Active")
    color = models.CharField(max_length=7, blank=True)
    available_hours = models.PositiveSmallIntegerField(default=40)
    days_off = models.JSONField(default=list)          # ["Wed", "Sun"]
    booking_notify = models.CharField(max_length=8, choices=NOTIFY, default="every")
    can_check_equipment = models.BooleanField(default=True)
    can_complete_appointments = models.BooleanField(default=True)


class TimeBlock(models.Model):
    DAYS = [(d, d) for d in ("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")]

    staff = models.ForeignKey(StaffMember, related_name="time_blocks", on_delete=models.CASCADE)
    day = models.CharField(max_length=3, choices=DAYS)
    start_time = models.TimeField()
    end_time = models.TimeField()
    categories = models.JSONField(default=list)
    services = models.ManyToManyField("Service", blank=True)
    recurring = models.BooleanField(default=True)
    enabled = models.BooleanField(default=True)
    interval_minutes = models.PositiveSmallIntegerField(default=30)
    online = models.BooleanField(default=True)
    breaks = models.JSONField(default=list)            # [{"start_time", "end_time"}]
    lead_times = models.JSONField(default=dict)        # {service_id: {...}}

    def clean(self):
        if self.end_time <= self.start_time:
            raise ValidationError({"end_time": "The end time must be after the start time."})
```

```python
# serializers.py
class TimeBlockSerializer(serializers.ModelSerializer):
    service_ids = serializers.PrimaryKeyRelatedField(
        source="services", many=True, queryset=Service.objects.all(), required=False
    )

    class Meta:
        model = TimeBlock
        fields = ("id", "staff", "day", "start_time", "end_time", "categories",
                  "service_ids", "recurring", "enabled", "interval_minutes",
                  "online", "breaks", "lead_times")

    def validate(self, attrs):
        start = attrs.get("start_time", getattr(self.instance, "start_time", None))
        end = attrs.get("end_time", getattr(self.instance, "end_time", None))
        if start and end and end <= start:
            raise serializers.ValidationError(
                {"end_time": "The end time must be after the start time."}
            )
        return attrs
```

```python
# views.py
class TimeBlockViewSet(viewsets.ModelViewSet):
    serializer_class = TimeBlockSerializer

    def get_queryset(self):
        qs = TimeBlock.objects.select_related("staff").prefetch_related("services")
        # The schedule repeats weekly; week_start is accepted for future
        # per-week overrides and for cache keying on the client.
        return qs

    @action(detail=False, methods=["post"], url_path="copy-day")
    def copy_day(self, request):
        staff_id = request.data["staff"]
        from_day, to_day = request.data["from_day"], request.data["to_day"]
        created = []
        for block in TimeBlock.objects.filter(staff_id=staff_id, day=from_day):
            services = list(block.services.all())
            block.pk, block.day = None, to_day
            block.save()
            block.services.set(services)
            created.append(block)
        return Response(TimeBlockSerializer(created, many=True).data, status=201)


class StoreSettingsView(generics.RetrieveUpdateAPIView):
    serializer_class = StoreSettingsSerializer

    def get_object(self):
        return StoreSettings.load()   # singleton per store
```

```python
# urls.py
router = DefaultRouter()
router.register("staff", StaffViewSet, basename="staff")
router.register("services", ServiceViewSet, basename="service")
router.register("time-blocks", TimeBlockViewSet, basename="time-block")
router.register("leave", LeaveViewSet, basename="leave")
router.register("integrations", IntegrationViewSet, basename="integration")

urlpatterns = [
    path("api/", include(router.urls)),
    path("api/store-settings/", StoreSettingsView.as_view()),
    path("api/printer-settings/", PrinterSettingsView.as_view()),
    path("api/printer-settings/test/", PrinterTestView.as_view()),
    path("api/docket-settings/", DocketSettingsView.as_view()),
]
```

## Auth and CSRF

The client sends `credentials: "include"` by default, so Django session auth
works as-is once CORS is configured:

```python
# settings.py
CORS_ALLOWED_ORIGINS = ["http://localhost:5173"]
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = ["http://localhost:5173"]
```

Unsafe methods pick the CSRF token up from the `csrftoken` cookie and send it as
`X-CSRFToken`. For token auth instead, set `VITE_API_WITH_CREDENTIALS=false`,
`VITE_AUTH_SCHEME=Token` (or `Bearer`) and register a getter at startup:

```ts
import { setAuthTokenGetter } from "@/lib/api"

setAuthTokenGetter(() => localStorage.getItem("authToken"))
```

## Still placeholders

Carried over from the design handoff, flagged for replacement:

- **QR codes** now render real, scannable codes via `qrcode.react`
  (`src/components/common/QrCode.tsx`), pointed at whatever URL the booking and
  walk-in settings hold — so they follow the backend once `booking_url` and
  `walk_in_url` come from Django. Nothing left to swap here.
- **Integration lettermarks** are coloured initials; swap in real brand SVGs.
- **Demo seed data** (`src/lib/demo-data.ts`) — five staff, eight services,
  three leave rows, the `192.168.1.42` printer and `alpinewerks.book.app` URLs.
- **Notification templates** are retained in `demo-data.ts` and typed in
  `types.ts`, but the nav item is deliberately absent. Confirm with the product
  owner before building or dropping that screen.
- **Naming**: the store pill says *Chamonix*, the docket says *PisteLabs*, seeded
  copy says *Alpine Werks*. The tenant/brand split needs confirming before the
  copy is wired.
