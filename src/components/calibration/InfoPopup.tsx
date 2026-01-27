import React, { useState } from "react";
import { Icons } from "../Icons";

interface InfoPopupProps {
  title: string;
  children: React.ReactNode;
}

export default function InfoPopup({ title, children }: InfoPopupProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Info trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-6 h-6 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors"
        title="Learn more"
      >
        <Icons.HelpCircle className="w-4 h-4" />
      </button>

      {/* Modal overlay with blur */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          {/* Backdrop with blur */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Modal content */}
          <div
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center">
                  <Icons.Info className="w-4 h-4 text-zinc-600" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 max-h-[60vh] overflow-y-auto">
              <div className="text-sm text-zinc-600 leading-relaxed space-y-4">
                {children}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-100 bg-zinc-50 rounded-b-2xl">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Pre-defined section info content
export const SECTION_INFO = {
  // Step 1
  confirmSkills: (
    <>
      <p>
        <strong>Why this matters:</strong>
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          Job descriptions often list <em>every possible skill</em>, but only a
          few truly determine success
        </li>
        <li>
          Your selections help us{" "}
          <strong>filter candidates on what actually matters</strong>, not a
          wish list
        </li>
        <li>
          {
            'This prevents rejecting great candidates for missing "nice-to-have" skills'
          }
        </li>
      </ul>

      <p>
        <strong>How to use this:</strong>
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Must Have</strong> - Skills someone cannot succeed without. Be
          ruthless here.
        </li>
        <li>
          <strong>Good to Have</strong> - Skills that accelerate ramp-up but can
          be learned
        </li>
        <li>
          {"If you find yourself selecting everything, ask: "}
          <em>{'"Would I reject a strong candidate who lacks this?"'}</em>
        </li>
      </ul>

      <p className="text-zinc-500 italic">
        Tip: The skills are randomized to prevent anchoring bias on the first
        items listed.
      </p>
    </>
  ),

  assessmentPriorities: (
    <>
      <p>
        <strong>Why this matters:</strong>
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Different roles require different evaluation criteria</li>
        <li>
          Your selections ensure interviewers{" "}
          <strong>focus on what you care about</strong>
        </li>
        <li>
          This creates consistency when multiple people evaluate candidates
        </li>
      </ul>

      <p>
        <strong>How to use this:</strong>
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Select the qualities that matter most for success in this role</li>
        <li>Consider: What separates a good hire from a great hire?</li>
        <li>{"Add your own if the options don't cover something important"}</li>
      </ul>
    </>
  ),

  problemTypes: (
    <>
      <p>
        <strong>Why this matters:</strong>
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Candidates excel at different types of challenges</li>
        <li>
          Matching problem-solving style to role needs{" "}
          <strong>predicts job satisfaction and retention</strong>
        </li>
        <li>A mismatch here is a common reason for early departures</li>
      </ul>

      <p>
        <strong>How to use this:</strong>
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          Select the types of problems this person will spend{" "}
          <em>most of their time</em> solving
        </li>
        <li>
          Think about the first 6 months, not the aspirational future state
        </li>
        <li>{"Add your own if there's a specific challenge not listed"}</li>
      </ul>
    </>
  ),

  // Step 2
  hiringTradeoffs: (
    <>
      <p>
        <strong>Why this matters:</strong>
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Every hire involves trade-offs - you rarely get everything</li>
        <li>
          Making these decisions <em>before</em> seeing candidates prevents
          inconsistent evaluation
        </li>
        <li>
          This surfaces the <strong>hidden preferences</strong> that often drive
          hiring decisions
        </li>
      </ul>

      <p>
        <strong>How to use this:</strong>
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Position yourself on each spectrum - there are no wrong answers</li>
        <li>
          <strong>1-2</strong> = Lean toward option A
        </li>
        <li>
          <strong>3</strong> = Flexible / no strong preference
        </li>
        <li>
          <strong>4-5</strong> = Lean toward option B
        </li>
        <li>
          Extreme positions (1 or 5) signal strong preference and will filter
          more aggressively
        </li>
      </ul>

      <p className="text-zinc-500 italic">
        Tip: Think about your last great hire and last regrettable hire. What
        trade-offs did you make?
      </p>
    </>
  ),

  roleLogistics: (
    <>
      <p>
        <strong>Why this matters:</strong>
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          {
            'These "hidden requirements" often disqualify candidates late in the process'
          }
        </li>
        <li>
          Being upfront saves everyone time and{" "}
          <strong>improves candidate experience</strong>
        </li>
        <li>Misalignment here leads to quick departures</li>
      </ul>

      <p>
        <strong>What each option means:</strong>
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Timezone</strong> - Required overlap hours for synchronous
          collaboration
        </li>
        <li>
          <strong>Meeting Load</strong> - Expected time in meetings per week
        </li>
        <li>
          <strong>On-Call</strong> - After-hours availability expectations
        </li>
        <li>
          <strong>Travel</strong> - In-person requirements (office, client
          visits, offsites)
        </li>
      </ul>

      <p className="text-zinc-500 italic">
        Be honest here - candidates appreciate transparency about working
        conditions.
      </p>
    </>
  ),

  evaluationCriteria: (
    <>
      <p>
        <strong>Why this matters:</strong>
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          Clear criteria create <strong>consistent, fair evaluation</strong>{" "}
          across all candidates
        </li>
        <li>Distinguishes between trainable gaps and genuine dealbreakers</li>
        <li>Helps interviewers know what red flags to watch for</li>
      </ul>

      <p>
        <strong>How to use each section:</strong>
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Non-Negotiable Standards</strong> -{" "}
          {
            'Behaviors that indicate a poor fit regardless of skills. These are automatic "no" signals.'
          }
        </li>
        <li>
          <strong>Growth Opportunities</strong> -{" "}
          {
            "Skills you can realistically develop on the job. Don't reject candidates for lacking these."
          }
        </li>
        <li>
          <strong>Day 1 Essentials</strong> - Capabilities that <em>cannot</em>{" "}
          be trained. The person must have these from the start.
        </li>
      </ul>

      <p className="text-zinc-500 italic">
        Tip: If everything feels like a Day 1 Essential, you may be
        over-filtering your candidate pool.
      </p>
    </>
  ),

  // Step 3
  idealCandidate: (
    <>
      <p>
        <strong>Why this matters:</strong>
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          These questions reveal{" "}
          <strong>preferences you might not consciously articulate</strong>
        </li>
        <li>Helps match candidates whose working style fits your team</li>
        <li>Reduces culture clash and improves team dynamics</li>
      </ul>

      <p>
        <strong>How to use this:</strong>
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          Answer based on what <em>actually works</em> in your team, not ideals
        </li>
        <li>
          Think about your most successful team members - what do they have in
          common?
        </li>
        <li>There are no right or wrong answers - just your preferences</li>
      </ul>

      <p className="text-zinc-500 italic">
        These are preference questions, not interview questions. We use them to
        match, not filter.
      </p>
    </>
  ),

  careerPath: (
    <>
      <p>
        <strong>Why this matters:</strong>
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Misaligned growth expectations lead to frustrated employees</li>
        <li>Communication style mismatches cause collaboration friction</li>
        <li>
          Setting clear expectations{" "}
          <strong>attracts candidates who will thrive</strong>
        </li>
      </ul>

      <p>
        <strong>What each option means:</strong>
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Growth Trajectory</strong> - How quickly can someone expect to
          advance in this role?
        </li>
        <li>
          <strong>Communication Level</strong> - How much collaboration and
          visibility does this role have?
        </li>
      </ul>

      <p className="text-zinc-500 italic">
        Be realistic about what your company actually offers, not what you wish
        you could offer.
      </p>
    </>
  ),

  roleChallenges: (
    <>
      <p>
        <strong>Why this matters:</strong>
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          Honest job previews{" "}
          <strong>reduce early turnover by up to 50%</strong>
        </li>
        <li>Candidates who know the challenges self-select appropriately</li>
        <li>Surprises after joining are the #1 reason for quick departures</li>
      </ul>

      <p>
        <strong>How to use this:</strong>
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          Select challenges that are <em>real</em> - not aspirational
          difficulties
        </li>
        <li>Think about what has frustrated people in this role before</li>
        <li>
          Be honest - the right candidates will see challenges as opportunities
        </li>
      </ul>

      <p className="text-zinc-500 italic">
        {
          "Tip: If you can't think of challenges, ask the team or previous role holders."
        }
      </p>
    </>
  ),

  additionalContext: (
    <>
      <p>
        <strong>Why this matters:</strong>
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          Context about the role helps match candidates with the right
          expectations
        </li>
        <li>
          Understanding <em>why</em> a role is open reveals what the team
          actually needs
        </li>
        <li>Autonomy level sets expectations for onboarding support</li>
      </ul>

      <p>
        <strong>What each option means:</strong>
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Why is this role open?</strong> - Helps candidates understand
          the team situation
        </li>
        <li>
          <strong>Autonomy level</strong> - How much guidance will be available
          during onboarding?
        </li>
      </ul>

      <p className="text-zinc-500 italic">
        These are optional but provide valuable context for better matching.
      </p>
    </>
  ),

  day60Expectations: (
    <>
      <p>
        <strong>Why this matters:</strong>
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          Clear 60-day goals help candidates{" "}
          <strong>understand what success looks like</strong>
        </li>
        <li>Creates accountability and shared expectations from day 1</li>
        <li>Helps the new hire prioritize and focus during onboarding</li>
      </ul>

      <p>
        <strong>How to use this:</strong>
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          Select milestones that are <strong>realistic for 60 days</strong>, not
          6 months
        </li>
        <li>
          Choose outcomes that are <em>observable and measurable</em>
        </li>
        <li>
          {'Think: "What would make me confident this hire is working out?"'}
        </li>
      </ul>

      <p className="text-zinc-500 italic">
        Tip: These should be achievable by a strong candidate with proper
        onboarding support.
      </p>
    </>
  ),
};
