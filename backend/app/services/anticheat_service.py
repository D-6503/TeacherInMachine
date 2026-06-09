import statistics
from typing import List, Dict, Any
from app.schemas.attempt import KeystrokeEvent


def analyze(
    answer_text: str,
    keystrokes: List[KeystrokeEvent],
    wpm: float | None,
    paste_detected: bool,
    tab_switches: int,
    keystroke_count: int,
) -> List[Dict[str, Any]]:
    flags: List[Dict[str, Any]] = []
    answer_len = len(answer_text)

    # PASTE_DETECTED
    paste_events = [k for k in keystrokes if k.type == "paste"]
    total_pasted = sum(
        k.delta for k in paste_events if k.key.startswith("paste:")
    )
    if paste_detected or (answer_len > 0 and total_pasted > answer_len * 0.4):
        flags.append(
            {
                "type": "PASTE_DETECTED",
                "severity": "high",
                "detail": "Large paste event detected relative to answer length",
            }
        )

    # HIGH_WPM
    if wpm is not None and wpm > 120:
        flags.append(
            {
                "type": "HIGH_WPM",
                "severity": "medium",
                "detail": f"Typing speed {wpm:.1f} WPM exceeds threshold of 120",
            }
        )

    # UNIFORM_TIMING (robotic typing)
    key_deltas = [k.delta for k in keystrokes if k.type == "keydown" and k.delta > 0]
    if len(key_deltas) >= 10:
        try:
            stdev = statistics.stdev(key_deltas)
            if stdev < 15:
                flags.append(
                    {
                        "type": "UNIFORM_TIMING",
                        "severity": "high",
                        "detail": f"Keystroke timing stdev={stdev:.2f}ms suggests automated input",
                    }
                )
        except statistics.StatisticsError:
            pass

    # NO_KEYSTROKES
    if answer_len > 50 and keystroke_count < 5:
        flags.append(
            {
                "type": "NO_KEYSTROKES",
                "severity": "critical",
                "detail": (
                    f"Answer has {answer_len} chars but only {keystroke_count} keystrokes recorded"
                ),
            }
        )

    # TAB_SWITCH
    if tab_switches > 3:
        flags.append(
            {
                "type": "TAB_SWITCH",
                "severity": "medium",
                "detail": f"Student switched tabs {tab_switches} times during test",
            }
        )

    return flags
