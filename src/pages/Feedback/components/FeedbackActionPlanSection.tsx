import FeedbackReportSectionHeader from './FeedbackReportSectionHeader';

export type ActionPlanItem = {
  title: string;
  body: string;
  tag: 'now' | 'week' | 'month';
  tagLabel: string;
};

const DEFAULT_ACTIONS: ActionPlanItem[] = [
  {
    title: 'Drill complexity analysis from first principles — 30 min/day for 2 weeks',
    body: 'Stop estimating O() by feel. For every LeetCode problem you solve, derive time and space complexity line-by-line before checking the solution. Pay special attention to recursive calls and the hidden cost of built-in operations (e.g., slicing a list in Python is O(k), not O(1)).',
    tag: 'now',
    tagLabel: 'Start today',
  },
  {
    title: 'Fix your environment before the next session',
    body: 'Camera up (stack books, raise to eye level), close the window blind behind you or move your desk, and use earphones. These are one-time fixes that permanently raise your scores across presence, speech, and overall confidence.',
    tag: 'now',
    tagLabel: 'Start today',
  },
  {
    title: 'Record yourself for 2 minutes answering a mock question daily',
    body: 'Play it back and count fillers. Your target is under 4/min. Most people drop from 8 to 4 within 10 days of doing this — the act of listening to yourself is enough. Don\'t script answers; just build the awareness.',
    tag: 'week',
    tagLabel: 'This week',
  },
  {
    title: 'Practise proactive tradeoff narration using a "3-option rule"',
    body: 'For every problem in your next 20 mock sessions, force yourself to name three approaches before implementing any of them: brute force → better → optimal. Even if options 1 and 2 are obvious, saying them out loud trains the habit and directly lifts your System Thinking score.',
    tag: 'week',
    tagLabel: 'This week',
  },
  {
    title: 'Do a 5-minute "calm face" warm-up before each interview session',
    body: 'Sit in front of your camera, start a recording, and present to yourself for 5 minutes on a topic you know well. Notice when tension appears in your face. Practise keeping an open, slightly engaged expression even while thinking hard — this is a learnable physical skill.',
    tag: 'month',
    tagLabel: '2-week habit',
  },
  {
    title: 'Target DP and graph problem sets specifically',
    body: 'Your session revealed a missed DP opportunity (you chose BFS on a problem where memoisation was optimal). Spend 2 weeks on the Blind 75 DP subset and focus on recognising the "optimal substructure" signal in problem statements. This is the highest ROI technical investment for FAANG at your current level.',
    tag: 'month',
    tagLabel: '2–4 weeks',
  },
];

function tagClass(tag: ActionPlanItem['tag']) {
  if (tag === 'now') return 'action-tag tag-now';
  if (tag === 'week') return 'action-tag tag-week';
  return 'action-tag tag-month';
}

export type FeedbackActionPlanSectionProps = {
  actions?: ActionPlanItem[];
};

/** Section 07 — Prioritised action plan list. */
export default function FeedbackActionPlanSection({ actions = DEFAULT_ACTIONS }: FeedbackActionPlanSectionProps) {
  return (
    <div className="feedback-report-sections">
      <FeedbackReportSectionHeader eyebrow="07 — Your Action Plan" title="Exactly what to do next">
        Prioritised by impact. Don&apos;t work on everything at once — the first three will give you 80%
        of the improvement.
      </FeedbackReportSectionHeader>

      <div className="action-list">
        {actions.map((a, i) => (
          <div key={a.title} className="action-item">
            <div className="action-num">{i + 1}</div>
            <div className="action-body">
              <strong>{a.title}</strong>
              <p>{a.body}</p>
              <span className={tagClass(a.tag)}>{a.tagLabel}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
