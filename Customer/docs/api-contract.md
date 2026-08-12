# API contract

What the frontend expects from the Django backend. The TypeScript wire types in
`src/api/dto.ts` are the machine-readable version of this document; the live
client that calls these endpoints is `src/api/live.ts`, and `src/api/mock/`
implements the same surface in memory so the app runs before the backend
exists.

Point the app at a real server with:

```bash
VITE_API_BASE_URL=http://localhost:8000/api
```

With that unset, the mock is used. Nothing else in the app changes.

## Conventions

- **Paths** end in a trailing slash, as DRF routers generate them.
- **Keys** are `snake_case`.
- **Dates** are ISO `YYYY-MM-DD`; **times** are 24-hour `HH:MM`; **timestamps**
  are ISO 8601 with an offset. The frontend does all display formatting — never
  send pre-formatted strings like `"Jun 26, 2026"`.
- **Money** is a decimal string, e.g. `"65.00"`.
- **Choices** are lowercase slugs (see the table below), not display labels.
- **Auth** is session-based: the client sends cookies (`credentials: 'include'`)
  and mirrors the `csrftoken` cookie into an `X-CSRFToken` header on unsafe
  methods. Swap `src/api/http.ts` if you use token auth instead.
- **Errors** should carry a `detail` string; the client surfaces it in a toast.
- **List responses** may be a bare array or DRF's paginated
  `{count, next, previous, results}` — the client handles both. Note that the
  directory filters and searches client-side today, so `GET /customers/` is
  expected to return the full set.

### Choice values

| Field | Values |
| --- | --- |
| `branch` | `city`, `mountain` |
| `preferred_contact` | `email`, `sms`, `phone` |
| `appointment.status` | `confirmed`, `completed`, `cancelled`, `pending` |
| `equipment.status` | `active`, `retired` |
| `din.measurements.ability` | `type_1`, `type_2`, `type_3` |

## Endpoints

### `GET /customers/`

Returns every customer, each with its equipment (and their jobs) and
appointments nested — the directory needs `prefs` and equipment counts to
filter, and the detail page needs the rest.

```json
[
  {
    "id": "c1",
    "name": "Chris Barnett",
    "email": "chris@rick.com",
    "phone": "(604) 555-0112",
    "branch": "city",
    "preferred_contact": "email",
    "last_activity_on": "2026-06-26",
    "member_since": "2019-03-12",
    "prefs": {
      "email_equipment": true,
      "sms_equipment": true,
      "email_promotions": false,
      "sms_promotions": false
    },
    "equipment": [
      {
        "id": "e1",
        "status": "active",
        "name": "Nordica Enforcer 100",
        "size": "186cm",
        "notes": "Prefers a hot wax before every trip. Detune tips slightly.",
        "jobs": [
          {
            "id": "j1",
            "sequence": "0042",
            "service": "Full Tune",
            "technician": "Tommy",
            "completed_on": "2026-06-24"
          }
        ]
      }
    ],
    "appointments": [
      {
        "id": "a1",
        "scheduled_on": "2026-06-26",
        "scheduled_at": "09:00",
        "service": "Full Tune",
        "status": "confirmed",
        "technician": "Tommy",
        "notes": "Race grind requested for the weekend.",
        "price": "65.00"
      }
    ]
  }
]
```

`sequence` is the job number within the branch. The frontend renders the job ID
as `{company}-{branch}-{sequence}` — `AP-CB-0042` — using the company initials
in `src/lib/config.ts`. If the backend would rather own that string, add a
`reference` field and we will use it directly.

### `GET /customers/{id}/`

One customer, same shape as a list entry.

### `POST /customers/`

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "(604) 555-0100",
  "branch": "city",
  "preferred_contact": "email",
  "prefs": {
    "email_equipment": true,
    "sms_equipment": false,
    "email_promotions": false,
    "sms_promotions": false
  }
}
```

Returns `201` with the created customer. The server sets `member_since` and
`last_activity_on`.

### `PATCH /customers/{id}/`

Any of `name`, `email`, `phone`, `branch`, `preferred_contact`. Returns the
updated customer.

### `GET /customers/{id}/din/`

The customer's DIN record. One per customer; create it lazily with defaults if
the customer has none.

```json
{
  "customer": "c1",
  "measurements": {
    "height_cm": "178",
    "weight_kg": "80",
    "age": 34,
    "boot_sole_mm": "312",
    "ability": "type_2"
  },
  "custom_value": null,
  "signed_at": null,
  "signature_url": null,
  "signed_by": null
}
```

`custom_value` is `null` while the calculated value stands. The calculation
itself lives in the frontend (`src/lib/din.ts`); the backend stores the inputs
and the override, not the result.

### `PATCH /customers/{id}/din/`

```json
{ "measurements": { "weight_kg": "82" } }
```

or

```json
{ "custom_value": "7.5" }
```

Returns the updated record. **Changing `custom_value` must clear `signed_at`,
`signature_url` and `signed_by`** — a signature authorises one specific value,
so any edit forces a re-sign. Sending `"custom_value": null` drops the override.

### `POST /customers/{id}/din/signature/`

`multipart/form-data` with a `signature` file part (PNG, drawn on a canvas by
the technician). The server stores the image, stamps `signed_at` and records the
signed-in staff member in `signed_by`, and returns the full updated DIN record
with `signature_url` pointing at the stored file.

Reject with `400` if `custom_value` is null — there is nothing to sign off.

### Reserved: `GET /jobs/{id}/`

Not called yet. The equipment panel's **Open** button currently raises a toast;
when the job record view is built it will fetch a single job here.

## Django sketch

Models the shapes above imply:

```python
class Customer(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=40, blank=True)
    branch = models.CharField(max_length=20, choices=Branch.choices)
    preferred_contact = models.CharField(max_length=20, choices=PreferredContact.choices)
    member_since = models.DateField(auto_now_add=True)
    last_activity_on = models.DateField(null=True)
    # prefs: four booleans, or a related ContactPreferences model

class Equipment(models.Model):
    customer = models.ForeignKey(Customer, related_name="equipment", on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=EquipmentStatus.choices)
    name = models.CharField(max_length=200)
    size = models.CharField(max_length=40, blank=True)
    notes = models.TextField(blank=True)

class Job(models.Model):
    equipment = models.ForeignKey(Equipment, related_name="jobs", on_delete=models.CASCADE)
    sequence = models.CharField(max_length=10)
    service = models.CharField(max_length=100)
    technician = models.CharField(max_length=100)
    completed_on = models.DateField()

class Appointment(models.Model):
    customer = models.ForeignKey(Customer, related_name="appointments", on_delete=models.CASCADE)
    scheduled_on = models.DateField()
    scheduled_at = models.TimeField()
    service = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=AppointmentStatus.choices)
    technician = models.CharField(max_length=100)
    notes = models.TextField(blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)

class DinRecord(models.Model):
    customer = models.OneToOneField(Customer, related_name="din", on_delete=models.CASCADE)
    height_cm = models.DecimalField(max_digits=5, decimal_places=1)
    weight_kg = models.DecimalField(max_digits=5, decimal_places=1)
    age = models.PositiveSmallIntegerField()
    boot_sole_mm = models.DecimalField(max_digits=5, decimal_places=1)
    ability = models.CharField(max_length=10, choices=SkierAbility.choices)
    custom_value = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    signature = models.ImageField(upload_to="din-signatures/", null=True, blank=True)
    signed_at = models.DateTimeField(null=True, blank=True)
    signed_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
```

`measurements` is a nested serializer over the `DinRecord` fields, and
`signature_url` is `request.build_absolute_uri(obj.signature.url)`.

## When the backend lands

1. Set `VITE_API_BASE_URL` and add the frontend origin to `CORS_ALLOWED_ORIGINS`
   / `CSRF_TRUSTED_ORIGINS`.
2. Run the app and check the network tab — the UI is unchanged.
3. Delete `src/api/mock/` and the `usingLiveApi` branch in `src/api/index.ts`.
   Only `src/lib/csv.test.ts`, `src/lib/filters.test.ts` and
   `src/api/mappers.test.ts` import the fixtures; point them at a small inline
   fixture instead.
