from django import forms

class SupportTicketForm(forms.Form):
    REQUEST_TYPE_CHOICES = [
        ("Technical Issue", "Technical Issue"),
        ("New User Setup", "New User Setup"),
        ("Password Reset", "Password Reset"),
        ("Software Installation", "Software Installation"),
        ("Hardware Problem", "Hardware Problem"),
        ("Network Issue", "Network Issue"),
        ("General Inquiry", "General Inquiry"),
        ("Other", "Other"),
    ]
    ONSITE_REMOTE_CHOICES = [
        ("Remote Support", "Remote Support"),
        ("Onsite Visit Requested", "Onsite Visit Requested"),
    ]
    PRIORITY_CHOICES = [
        ("Low", "Low (e.g., minor inconvenience)"),
        ("Medium", "Medium (e.g., workarounds exist)"),
        ("High", "High (e.g., unable to work)"),
        ("Emergency", "Emergency (e.g., business down)"),
    ]

    request_type = forms.ChoiceField(choices=REQUEST_TYPE_CHOICES, label="What type of request is this?", required=True)
    request_type_other = forms.CharField(label="Other Request Type", required=False)
    onsite_or_remote = forms.ChoiceField(choices=ONSITE_REMOTE_CHOICES, label="Onsite or Remote?", required=True)
    priority = forms.ChoiceField(choices=PRIORITY_CHOICES, label="Priority", required=True)
    description = forms.CharField(widget=forms.Textarea(attrs={'rows': 4, 'placeholder': 'Please describe the issue or request in detail, including affected systems or users.'}), label="Description of the Issue", required=True)
    attachment = forms.FileField(label="Attach a Screenshot or File (Optional)", required=False)
    affected_user = forms.EmailField(label="Affected User (if different from you)", required=False, help_text="Example: jsmith@company.com") 