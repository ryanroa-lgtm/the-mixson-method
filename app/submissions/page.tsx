"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  AgreementBox,
  CheckboxGroup,
  FileSlot,
  Honeypot,
  IntakeNotice,
  MissingFieldsDialog,
  MultiImageSlot,
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
  type PickedFile,
  type SubmitStatus,
} from "@/components/intake";

type ExperienceLevel = "" | "new-face" | "some-experience" | "experienced";

const divisions = [
  "Runway",
  "Fashion & Editorial",
  "Commercial & Lifestyle",
  "Fitness & Athletic",
  "Swim & Underwear",
  "Mature (35+)",
  "Couples & Family",
  "Brand Ambassador & Events",
];

const digitals = [
  { slot: "full-length-front", label: "Full-length front" },
  { slot: "full-length-side", label: "Full-length side" },
  { slot: "waist-up-front", label: "Waist-up front" },
  { slot: "headshot-neutral", label: "Headshot, neutral expression" },
  { slot: "headshot-smiling", label: "Headshot, smiling" },
];

const heightBands = [
  {
    division: "Runway & Fashion",
    men: "5’11” – 6’7”",
    women: "5’8” – 6’0”",
  },
  {
    division: "Fitness & Athletic",
    men: "5’10” – 6’4”",
    women: "5’6” – 5’11”",
  },
];

const emptyDigitals = (): Record<string, File | null> =>
  Object.fromEntries(digitals.map((d) => [d.slot, null]));

export default function SubmissionsPage() {
  const [status, setStatus] = useState<SubmitStatus>({ state: "idle" });
  const [missingFields, setMissingFields] = useState<MissingField[]>([]);
  const [experience, setExperience] = useState<ExperienceLevel>("");
  const [represented, setRepresented] = useState(false);
  const [couple, setCouple] = useState(false);
  const [tattoos, setTattoos] = useState(false);

  const [digitalFiles, setDigitalFiles] = useState(emptyDigitals);
  const [portfolio, setPortfolio] = useState<File[]>([]);
  const [introVideo, setIntroVideo] = useState<File | null>(null);
  const [walkVideo, setWalkVideo] = useState<File | null>(null);
  const [tattooPhoto, setTattooPhoto] = useState<File | null>(null);
  const [compCard, setCompCard] = useState<File | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  function pickedFiles(): PickedFile[] {
    const out: PickedFile[] = [];
    for (const d of digitals) {
      const file = digitalFiles[d.slot];
      if (file) out.push({ slot: d.slot, label: d.label, kind: "image", file });
    }
    portfolio.forEach((file, i) =>
      out.push({ slot: `portfolio-${i + 1}`, label: `Portfolio / tear sheet ${i + 1}`, kind: "image", file })
    );
    if (tattoos && tattooPhoto)
      out.push({ slot: "tattoo", label: "Tattoo photo", kind: "image", file: tattooPhoto });
    if (experience === "experienced" && compCard)
      out.push({ slot: "comp-card", label: "Comp card", kind: "image", file: compCard });
    if (introVideo)
      out.push({ slot: "intro-video", label: "Intro video", kind: "video", file: introVideo });
    if (walkVideo)
      out.push({ slot: "walk-video", label: "Walk video", kind: "video", file: walkVideo });
    return out;
  }

  function resetAll(form: HTMLFormElement) {
    form.reset();
    setExperience("");
    setRepresented(false);
    setCouple(false);
    setTattoos(false);
    setDigitalFiles(emptyDigitals());
    setPortfolio([]);
    setIntroVideo(null);
    setWalkVideo(null);
    setTattooPhoto(null);
    setCompCard(null);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;

    const extra: MissingField[] = digitals
      .filter((d) => !digitalFiles[d.slot])
      .map((d) => ({ anchorId: `digital-${d.slot}`, label: `Digitals — ${d.label}` }));
    if (experience === "experienced" && !compCard) {
      extra.push({ anchorId: "comp-card", label: "Comp card" });
    }

    const missing = collectMissing(form, extra);
    if (missing.length > 0) {
      setStatus({ state: "idle" });
      setMissingFields(missing);
      return;
    }

    const ok = await submitIntake({
      form,
      endpoint: "/api/submissions",
      prefix: "talent",
      files: pickedFiles(),
      startedAt: startedAt.current,
      setStatus,
    });
    if (ok) resetAll(form);
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <h1 className="font-heading text-4xl md:text-5xl tracking-wide uppercase mb-6 text-center">
        Submissions
      </h1>

      <p className="text-center text-muted text-base mb-10 max-w-xl mx-auto leading-relaxed">
        We&rsquo;re always looking for new faces. If you think you have what it
        takes, submit your details below.
      </p>

      <IntakeNotice />

      {/* Height requirements */}
      <div className="mb-16 max-w-xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {heightBands.map((b) => (
            <div key={b.division} className="border border-border py-6 px-4 text-center">
              <p className="text-xs uppercase tracking-widest text-muted mb-3">
                {b.division}
              </p>
              <p className="font-heading text-lg">Men {b.men}</p>
              <p className="font-heading text-lg">Women {b.women}</p>
            </div>
          ))}
        </div>
        <p className="border border-t-0 border-border py-4 px-4 text-center text-sm">
          Commercial, Lifestyle, Mature &amp; Couples: all heights welcome.
        </p>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} noValidate className="relative space-y-10">
        <Honeypot />

        {/* ── A. Personal details ── */}
        <Section title="Personal Details" first>
          <Row>
            <TextField id="legal-name" label="Legal Name" required />
            <TextField id="stage-name" label="Professional / Stage Name" />
          </Row>
          <Row>
            <TextField id="age" label="Age" type="number" inputMode="numeric" min={18} max={120} required />
            <TextField id="location" label="City & State" required />
          </Row>
          <Row>
            <TextField id="email" label="Email" type="email" required />
            <TextField id="phone" label="Phone" type="tel" required />
          </Row>
          <Row>
            <TextField id="instagram" label="Instagram Handle (must be public)" required placeholder="@" />
            <SelectField
              id="preferred-contact"
              label="Preferred Contact Method"
              options={["Email", "Text", "Call"]}
              required
            />
          </Row>
        </Section>

        {/* ── B. Measurements ── */}
        <Section title="Measurements">
          <Row>
            <TextField id="height" label="Height" required placeholder={"e.g. 5'10\""} />
            <TextField id="chest-bust" label="Chest / Bust" required />
          </Row>
          <Row>
            <TextField id="waist" label="Waist" required />
            <TextField id="hips" label="Hips" required />
          </Row>
          <Row>
            <TextField id="inseam" label="Inseam" required />
            <TextField id="shoe-size" label="Shoe Size" required />
          </Row>
          <Row>
            <TextField id="hair-color" label="Hair Color" required />
            <TextField id="eye-color" label="Eye Color" required />
          </Row>
        </Section>

        {/* ── C. Divisions and self-description ── */}
        <Section title="Divisions & Your Look">
          <CheckboxGroup name="divisions" label="Divisions of Interest" options={divisions} required />
          <SelectField id="primary-focus" label="Primary Focus" options={divisions} required />
          <TextAreaField
            id="describe-look"
            label="How would you describe your look and the work you're best suited for?"
            required
          />
          <TextAreaField
            id="goals"
            label="What do you hope to achieve in your first 6–12 months?"
            required
          />
          <Row>
            <YesNoField
              id="couple"
              label="Submitting as a couple?"
              required={false}
              onChange={(v) => setCouple(v === "Yes")}
            />
            {couple && (
              <TextField
                id="partner-name"
                label="Partner's Name"
                required
                helper="Your partner submits their own form."
              />
            )}
          </Row>
        </Section>

        {/* ── D. Experience and representation ── */}
        <Section title="Experience & Representation">
          <SelectField
            id="experience"
            label="Experience Level"
            required
            options={[
              "I am a new face (no professional experience yet)",
              "I have some experience (local shoots, small shows, collaborations)",
              "I am experienced (previously signed, paid work, runway)",
            ]}
            onChange={(val) => {
              if (val.startsWith("I am a new")) setExperience("new-face");
              else if (val.startsWith("I have some")) setExperience("some-experience");
              else if (val.startsWith("I am experienced")) setExperience("experienced");
              else setExperience("");
            }}
          />

          {experience === "new-face" && (
            <div className="space-y-6">
              <YesNoField id="posing-classes" label="Have you taken any posing or runway classes?" />
              <YesNoField
                id="open-to-development"
                label="Are you open to development, coaching, and agency guidance?"
              />
              <TextAreaField
                id="why-mixson"
                label="Why do you want to be represented by The Mixson Method?"
                required
                rows={4}
              />
            </div>
          )}

          {experience === "some-experience" && (
            <div className="space-y-6">
              <TextAreaField
                id="past-work"
                label="List any photographers, brands, or creatives you've worked with"
                required
              />
              <YesNoField id="runway-shows" label="Have you walked in any runway shows?" />
              <TextAreaField id="runway-details" label="If yes, list shows, designers, or producers" />
              <YesNoField id="paid-work" label="Have you been paid for modeling work?" />
              <YesNoField id="posing-training" label="Have you taken posing or runway training?" />
            </div>
          )}

          {experience === "experienced" && (
            <div className="space-y-6">
              <TextAreaField id="agencies" label="Current or previous agencies" required />
              <TextAreaField id="runway-history" label="List runway shows, designers, or producers" required />
              <TextAreaField id="campaign-work" label="List commercial, editorial, or campaign work" required />
              <SelectField
                id="representation-sought"
                label="What type of representation are you seeking?"
                required
                options={["Mother agency representation", "Placement", "Non-exclusive representation"]}
              />
              <div className="w-40">
                <FileSlot
                  id="comp-card"
                  label="Comp card"
                  kind="image"
                  required
                  file={compCard}
                  onPick={setCompCard}
                />
              </div>
            </div>
          )}

          <YesNoField
            id="currently-represented"
            label="Currently Represented?"
            onChange={(v) => setRepresented(v === "Yes")}
          />
          {represented && (
            <Row>
              <TextField id="agency-name" label="Agency Name" required />
              <SelectField
                id="representation-type"
                label="Representation Type"
                options={["Exclusive", "Non-exclusive", "Mother agency"]}
                required
              />
            </Row>
          )}

          <div>
            <p className={labelClass}>Professional Reference</p>
            <p className="text-xs text-muted mb-3 leading-relaxed">
              A photographer, agent or show producer. Optional for new faces.
            </p>
            <Row>
              <TextField id="reference-name" label="Reference Name" />
              <TextField id="reference-contact" label="Reference Email or Phone" />
            </Row>
          </div>

          <SelectField
            id="open-to-tfp"
            label="Open to TFP Development Shoots?"
            options={["Yes", "No", "Depends"]}
            required
            helper="Unpaid, trade-for-portfolio shoots that build your book."
          />
          <Row>
            <SelectField
              id="availability"
              label="Availability"
              options={["Full-time flexible", "Evenings & weekends", "Limited"]}
              required
            />
            <SelectField
              id="travel"
              label="Willing to Travel?"
              options={["Local only", "Within Florida", "Nationally", "Internationally"]}
              required
            />
          </Row>
          <TextField
            id="portfolio"
            label="Portfolio Link (Instagram or Website)"
            type="url"
            placeholder="https://"
          />
        </Section>

        {/* ── Professionalism (existing questions) ── */}
        {experience && (
          <Section title="Professionalism & Readiness">
            <YesNoField id="professional-instagram" label="Do you maintain a public, professional Instagram?" />
            <YesNoField
              id="agency-guidelines"
              label="Are you willing to follow agency guidelines for communication, posting, and professionalism?"
            />
            <YesNoField
              id="no-pay-to-play"
              label="Do you understand that The Mixson Method does not participate in pay-to-walk or pay-to-play shows?"
            />
            <YesNoField
              id="attend-scheduled"
              label="Are you willing to attend castings, fittings, and shoots as scheduled?"
            />
          </Section>
        )}

        {/* ── E. Comfort and brand safety ── */}
        <Section title="Comfort & Brand Safety">
          <CheckboxGroup
            name="comfortable-with"
            label="Comfortable With"
            options={["Swimwear", "Underwear", "Fitness/athletic wear", "None of these"]}
            exclusive="None of these"
            required
          />
          <YesNoField id="tattoos" label="Visible Tattoos" onChange={(v) => setTattoos(v === "Yes")} />
          {tattoos && (
            <div className="space-y-6">
              <Row>
                <TextField id="tattoo-placement" label="Tattoo Placement" required placeholder="e.g. left forearm, right shoulder" />
                <TextField id="tattoo-size" label="Approximate Size" required placeholder="e.g. palm-sized, full sleeve" />
              </Row>
              <Row>
                <YesNoField id="tattoo-cover-up" label="Open to Cover-Up?" />
                <div className="w-40">
                  <FileSlot id="tattoo-photo" label="Tattoo photo" kind="image" file={tattooPhoto} onPick={setTattooPhoto} />
                </div>
              </Row>
            </div>
          )}
          <YesNoField
            id="paid-platforms"
            label="Subscription or Paid-Content Platforms?"
            helper="Disclosure only, not an automatic disqualification."
          />
        </Section>

        {/* ── F. Digitals ── */}
        <Section title="Digitals">
          <div className="bg-neutral-50 border border-border p-6 text-sm leading-relaxed">
            <p className="text-xs uppercase tracking-widest text-muted mb-3">How to take your digitals</p>
            <p>
              Digitals must be taken within the last 30 days, in daylight,
              against a plain wall. Wear fitted, plain clothing (black or
              neutral; swim or athletic wear is fine for fitness). Hair pulled
              back, minimal or no makeup. No filters or editing. Have someone
              else take them at eye level: no selfies or mirror shots.
            </p>
            <p className="text-xs text-muted mt-3">
              Images: JPG, PNG or HEIC, up to 10 MB each. Videos: MP4 or MOV,
              up to 100 MB and 60 seconds each.
            </p>
          </div>

          <div>
            <p className={`${labelClass} mb-4`}>Required Digitals *</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {digitals.map((d) => (
                <FileSlot
                  key={d.slot}
                  id={`digital-${d.slot}`}
                  label={d.label}
                  kind="image"
                  required
                  file={digitalFiles[d.slot]}
                  onPick={(file) => setDigitalFiles((prev) => ({ ...prev, [d.slot]: file }))}
                />
              ))}
            </div>
          </div>

          <MultiImageSlot
            id="portfolio-images"
            label="Portfolio Images or Tear Sheets"
            max={5}
            files={portfolio}
            onChange={setPortfolio}
          />

          <div>
            <p className={`${labelClass} mb-4`}>Optional Videos</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              <FileSlot id="intro-video" label="15-second intro" kind="video" file={introVideo} onPick={setIntroVideo} />
              <FileSlot id="walk-video" label="Walk video (runway)" kind="video" file={walkVideo} onPick={setWalkVideo} />
            </div>
          </div>
        </Section>

        {/* ── Optional (existing questions) ── */}
        {experience && (
          <Section title="Optional">
            <TextAreaField id="dream-brands" label="What brands or campaigns do you see yourself working with?" />
            <TextAreaField id="upcoming-travel" label="Do you have any upcoming travel that may affect availability?" />
          </Section>
        )}

        {/* ── G. Agreements ── */}
        <Section title="Agreements">
          <div className="space-y-4">
            <AgreementBox id="agree-age" short="18 or older" text="I am 18 years of age or older." />
            <AgreementBox
              id="agree-digitals"
              short="digitals are accurate"
              text="My digitals are current, unedited, and accurately represent me."
            />
            <AgreementBox
              id="agree-respond"
              short="respond within 24–48 hours"
              text="I will respond to agency messages and bookings within 24–48 hours."
            />
            <AgreementBox
              id="agree-background"
              short="background check"
              text="I understand that talent offered representation will be asked to consent to a background check before signing."
            />
            <AgreementBox
              id="agree-storage"
              short="submission storage"
              text="I consent to The Mixson Method storing my submission for review. Submissions not selected are deleted after 6 months."
            />
          </div>
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
