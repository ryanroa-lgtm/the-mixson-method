"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  AgreementBox,
  CheckboxGroup,
  Honeypot,
  IntakeNotice,
  MissingFieldsDialog,
  Row,
  Section,
  SelectField,
  SubmitArea,
  TextAreaField,
  TextField,
  YesNoField,
  collectMissing,
  labelClass,
  scrollToField,
  submitIntake,
  type MissingField,
  type SubmitStatus,
} from "@/components/intake";

const tfpConditions = [
  "Concept fits my portfolio",
  "Editorial/magazine submission",
  "New talent development",
  "Reduced rate instead of free",
  "Limited TFP slots per month",
  "Credit and tagging required",
  "Other",
];

const IMAGE_USAGE =
  "Talent and The Mixson Method may use images from collaborations for portfolios, the agency website and social media, with credit. Any commercial use requires a separate written agreement.";

export default function CollaboratePage() {
  const [status, setStatus] = useState<SubmitStatus>({ state: "idle" });
  const [missingFields, setMissingFields] = useState<MissingField[]>([]);
  const [tfp, setTfp] = useState("");
  const [conditions, setConditions] = useState<string[]>([]);
  const [studio, setStudio] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const conditional = tfp === "TFP under certain conditions";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;

    const missing = collectMissing(form);
    if (missing.length > 0) {
      setStatus({ state: "idle" });
      setMissingFields(missing);
      return;
    }

    const ok = await submitIntake({
      form,
      endpoint: "/api/collaborate",
      prefix: "collab",
      files: [],
      startedAt: startedAt.current,
      setStatus,
    });
    if (ok) {
      form.reset();
      setTfp("");
      setConditions([]);
      setStudio(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="font-heading text-4xl md:text-5xl tracking-wide uppercase mb-6 text-center">
        Collaborate
      </h1>

      <p className="text-center text-muted text-base mb-10 max-w-xl mx-auto leading-relaxed">
        The Mixson Method partners with creatives who share our standards. Tell
        us about your work and how you collaborate. Approved creatives may be
        invited to shoot or style our talent and considered for our vendor list.
      </p>

      <p className="text-center text-xs uppercase tracking-widest text-muted mb-6">
        Photographers · Stylists · Makeup artists · Hair stylists · Videographers · Designers
      </p>

      <IntakeNotice />

      <form ref={formRef} onSubmit={handleSubmit} noValidate className="relative space-y-10">
        <Honeypot />

        {/* ── A. Basics ── */}
        <Section title="Basics" first>
          <Row>
            <TextField id="full-name" label="Full Name" required />
            <TextField id="business-name" label="Business Name" />
          </Row>
          <Row>
            <TextField id="age" label="Age" type="number" inputMode="numeric" min={18} max={120} required />
            <SelectField
              id="years-experience"
              label="Years of Experience"
              options={["Under 2", "2–5", "5–10", "10+"]}
              required
            />
          </Row>
          <CheckboxGroup
            name="roles"
            label="Role"
            options={["Photographer", "Stylist", "Makeup artist", "Hair stylist", "Videographer", "Designer", "Other"]}
            required
          />
          <Row>
            <TextField id="location" label="City & State" required />
            <SelectField
              id="travel-radius"
              label="Travel Radius"
              options={["Local only", "Within Florida", "Nationally"]}
              required
            />
          </Row>
          <Row>
            <TextField id="email" label="Email" type="email" required />
            <TextField id="phone" label="Phone" type="tel" required />
          </Row>
          <Row>
            <TextField id="instagram" label="Instagram Handle" required placeholder="@" />
            <TextField id="portfolio-url" label="Portfolio or Website" type="url" required placeholder="https://" />
          </Row>
        </Section>

        {/* ── B. Work and experience ── */}
        <Section title="Work & Experience">
          <CheckboxGroup
            name="specialties"
            label="Specialties"
            options={["Fitness", "Editorial", "Swim", "Commercial", "Runway", "Beauty", "Lifestyle"]}
            required
          />
          <CheckboxGroup
            name="comfortable-working-with"
            label="Comfortable Working With"
            options={["Men", "Women", "Couples", "Mature talent (35+)", "First-time models"]}
            required
          />
          <div>
            <p className={labelClass}>Notable Clients or Publications (up to 3)</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TextField id="notable-1" label="Client or publication 1" />
              <TextField id="notable-2" label="Client or publication 2" />
              <TextField id="notable-3" label="Client or publication 3" />
            </div>
          </div>
          <Row>
            <TextField id="reference-name" label="Professional Reference Name" required />
            <TextField id="reference-contact" label="Reference Email or Phone" required />
          </Row>
          <Row>
            <YesNoField
              id="studio-access"
              label="Studio Access?"
              required={false}
              onChange={(v) => setStudio(v === "Yes")}
            />
            {studio && <TextField id="studio-location" label="Studio Location" required />}
          </Row>
        </Section>

        {/* ── C. TFP policy ── */}
        <Section title="TFP Policy">
          <SelectField
            id="tfp-availability"
            label="TFP Availability"
            options={["Paid only", "TFP available", "TFP under certain conditions"]}
            required
            onChange={(v) => {
              setTfp(v);
              if (v !== "TFP under certain conditions") setConditions([]);
            }}
          />
          {conditional && (
            <>
              <CheckboxGroup
                name="tfp-conditions"
                label="TFP Conditions"
                options={tfpConditions}
                onChange={setConditions}
              />
              {conditions.includes("Other") && (
                <TextField id="tfp-conditions-other" label="Other TFP Condition" required />
              )}
            </>
          )}
          <Row>
            <TextField id="rate-range" label="Standard Rate Range" placeholder="e.g. $150–$300/hr" />
            <TextField
              id="tfp-edited-images"
              label="Edited Images Delivered on TFP Shoots"
              type="number"
              inputMode="numeric"
              min={0}
            />
          </Row>
          <Row>
            <SelectField
              id="turnaround"
              label="Typical Turnaround"
              options={["Under 1 week", "1–2 weeks", "2–4 weeks"]}
            />
            <TextField id="credit" label="How You'd Like to Be Credited" placeholder="e.g. @handle, Photo: Name" />
          </Row>
        </Section>

        {/* ── D. Image usage ── */}
        <Section title="Image Usage">
          <p className="bg-neutral-50 border border-border p-6 text-sm leading-relaxed">
            {IMAGE_USAGE}
          </p>
        </Section>

        {/* ── E. Agency standards ── */}
        <Section title="Agency Standards">
          <div className="space-y-4">
            <AgreementBox
              id="agree-book-through-agency"
              short="book through the agency"
              text="I will book shoots with Mixson Method talent through the agency, not by contacting talent directly."
            />
            <AgreementBox
              id="agree-mood-board"
              short="mood board and wardrobe plan"
              text="I will share a mood board and wardrobe plan in advance of every shoot."
            />
            <AgreementBox
              id="agree-chaperone"
              short="companion or chaperone"
              text="Talent may bring a companion or chaperone to any shoot."
            />
            <AgreementBox
              id="agree-no-nudity"
              short="no nudity without written agreement"
              text="No nudity or implied nudity without prior written agreement from the agency and the talent."
            />
            <AgreementBox
              id="agree-background"
              short="background check"
              text="I understand that creatives working one-on-one with talent may be asked to consent to a background check."
            />
            <AgreementBox
              id="agree-image-usage"
              short="image usage terms"
              text="I agree to the image usage terms above."
            />
            <AgreementBox id="agree-age" short="18 or older" text="I am 18 years of age or older." />
          </div>
        </Section>

        {/* ── F. Opt-in ── */}
        <Section title="Vendor List">
          <YesNoField
            id="vendor-list"
            label="Would you like to be considered for The Mixson Method vendor list?"
            required={false}
          />
        </Section>

        <SubmitArea status={status} />
      </form>

      {missingFields.length > 0 && (
        <MissingFieldsDialog
          fields={missingFields}
          onClose={() => setMissingFields([])}
          onGoTo={(id) => {
            setMissingFields([]);
            scrollToField(formRef.current, id);
          }}
        />
      )}
    </section>
  );
}
