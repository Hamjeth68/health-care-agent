"""Simple blood-pressure risk prediction helper."""


def predict_risk(age, blood_pressure):
    """Return a coarse risk message for an age and blood-pressure reading."""

    reading = f"Age {age} with blood pressure {blood_pressure}"

    if blood_pressure > 150:
        return f"High risk: {reading}. Blood pressure is dangerously high."

    if blood_pressure > 130:
        return f"Moderate risk: {reading}. Monitor blood pressure."

    return (
        "Normal blood pressure range for this simple check: "
        f"Age {age}, blood pressure {blood_pressure}."
    )
